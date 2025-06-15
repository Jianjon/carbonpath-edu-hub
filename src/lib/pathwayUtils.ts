import type { EmissionData, ReductionModel, CustomTargets, PathwayData } from '../pages/CarbonPath';

export const calculatePathwayData = (
  emissionData: EmissionData,
  selectedModel: ReductionModel,
  customTargets: CustomTargets
): PathwayData[] => {
  const totalEmissions = emissionData.scope1 + emissionData.scope2;
  const years = emissionData.targetYear - emissionData.baseYear;
  
  // 残留排放量是用戶設定的目標終點（固定不變）
  const residualEmissions = totalEmissions * (emissionData.residualEmissionPercentage / 100);
  
  console.log('=== 減碳路徑規劃邏輯 ===');
  console.log('起點 - 基線排放量:', totalEmissions.toLocaleString(), 'tCO2e');
  console.log('終點 - 残留排放量:', residualEmissions.toLocaleString(), 'tCO2e');
  console.log('用戶設定殘留比例:', emissionData.residualEmissionPercentage, '%');
  console.log('需要減排的總量:', (totalEmissions - residualEmissions).toLocaleString(), 'tCO2e');
  
  let finalPathway: PathwayData[] = [];

  // 自訂減碳目標 - 混合模型
  if (selectedModel.id === 'custom-target' && customTargets.nearTermTarget && customTargets.longTermTarget) {
    console.log('使用自訂目標（混合模型）- 從基線到殘留量');
    
    const path: PathwayData[] = [];
    let tempEmissions = totalEmissions;

    const { baseYear, targetYear } = emissionData;
    const { nearTermTarget } = customTargets;
    const nearTermAnnualRate = nearTermTarget.annualReductionRate / 100;

    // Phase 1: Near-Term Geometric Reduction (此處已是等比減少)
    path.push({
      year: baseYear,
      emissions: tempEmissions,
      reduction: 0,
      target: tempEmissions
    });

    for (let year = baseYear + 1; year <= nearTermTarget.year; year++) {
      tempEmissions *= (1 - nearTermAnnualRate);
      path.push({
        year,
        emissions: tempEmissions,
        reduction: ((totalEmissions - tempEmissions) / totalEmissions) * 100,
        target: tempEmissions,
      });
    }

    // Phase 2: Long-Term with exponential decay for annual reduction (SBTi-style)
    const emissionsAtNearTermEnd = tempEmissions;
    const { targetYear } = emissionData;
    const D = targetYear - nearTermTarget.year;

    if (D > 0) {
      console.log("自訂長期減排模式：指數衰減年減排量（類 SBTi）");
      const totalReductionNeeded = emissionsAtNearTermEnd - residualEmissions;
      
      if (D === 1) {
        path.push({
          year: nearTermTarget.year + 1,
          emissions: residualEmissions,
          reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
          target: residualEmissions,
        });
      } else {
        // 參考 SBTi 模型，使用指數衰減分配年減排量，允許高峰出現
        // R(t) = A × e^(-k×t) + C
        
        // 設定衰減參數
        const k = 0.1; // 衰減係數，可調整曲線形狀
        
        // 最小年減排量，確保最後幾年仍有減排
        const C = Math.max(totalReductionNeeded * 0.005, 50);
        
        // 計算 A 以滿足總減排量需求
        const exponentialSum = Array.from({ length: D }, (_, t) => Math.exp(-k * t)).reduce((sum, val) => sum + val, 0);
        let A = 0;
        if (exponentialSum > 0) {
          A = (totalReductionNeeded - C * D) / exponentialSum;
        }

        // 如果 A < 0，代表 C*D 就超過總減排需求，這時應該用更簡單的線性模型
        if (A < 0) {
            console.log("長期減排需求較低，改用線性減排");
            let currentEmissions = emissionsAtNearTermEnd;
            const annualLinearReduction = totalReductionNeeded / D;
            for (let t = 0; t < D; t++) {
                currentEmissions -= annualLinearReduction;
                if (t === D - 1) {
                  currentEmissions = residualEmissions;
                }
                path.push({
                  year: nearTermTarget.year + 1 + t,
                  emissions: currentEmissions,
                  reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
                  target: currentEmissions,
                });
            }
        } else {
            console.log(`指數衰減參數: A=${A.toFixed(0)}, k=${k}, C=${C.toFixed(0)}`);
            console.log(`長期第一年減排量 (峰值): ${(A + C).toFixed(0)}`);
            
            let currentEmissions = emissionsAtNearTermEnd;
            for (let t = 0; t < D; t++) {
              const annualReduction = A * Math.exp(-k * t) + C;
              currentEmissions -= annualReduction;
              
              if (t === D - 1) {
                currentEmissions = residualEmissions;
              } else {
                currentEmissions = Math.max(currentEmissions, residualEmissions);
              }
              
              path.push({
                year: nearTermTarget.year + 1 + t,
                emissions: currentEmissions,
                reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
                target: currentEmissions,
              });
            }
        }
      }
    }

    finalPathway = path.map(p => ({
      ...p,
      emissions: Math.round(p.emissions),
      reduction: Math.round(p.reduction * 10) / 10,
      target: Math.round(p.target as number),
    }));
  } 
  
  // 台灣減碳目標 - 階段性線性減排到殘留量
  else if (selectedModel.id === 'taiwan-target') {
    console.log('使用台灣目標 - 從基線到殘留量:', residualEmissions.toLocaleString());
    let pathway: PathwayData[] = [];
    
    const totalReductionNeeded = totalEmissions - residualEmissions;
    
    for (let i = 0; i <= years; i++) {
      const currentYear = emissionData.baseYear + i;
      let targetEmissions;

      if (currentYear === emissionData.baseYear) {
        targetEmissions = totalEmissions;
      } else if (currentYear === emissionData.targetYear) {
        targetEmissions = residualEmissions;
      } else {
        let reductionProgress = 0;
        
        if (currentYear <= 2030) {
          reductionProgress = (currentYear - emissionData.baseYear) / (2030 - emissionData.baseYear) * 0.28;
        } else if (currentYear <= 2032) {
          reductionProgress = 0.28 + (currentYear - 2030) / (2032 - 2030) * (0.32 - 0.28);
        } else if (currentYear <= 2035) {
          reductionProgress = 0.32 + (currentYear - 2032) / (2035 - 2032) * (0.38 - 0.32);
        } else {
          const finalReductionRatio = (totalEmissions - residualEmissions) / totalEmissions;
          reductionProgress = 0.38 + (currentYear - 2035) / (emissionData.targetYear - 2035) * (finalReductionRatio - 0.38);
        }
        
        targetEmissions = totalEmissions * (1 - reductionProgress);
        targetEmissions = Math.max(targetEmissions, residualEmissions);
      }
      
      const actualReduction = ((totalEmissions - targetEmissions) / totalEmissions) * 100;

      pathway.push({
        year: currentYear,
        emissions: Math.round(targetEmissions),
        reduction: Math.round(actualReduction * 10) / 10,
        target: Math.round(targetEmissions)
      });
    }
    finalPathway = pathway;
  } 
  
  // SBTi 1.5°C目標 - 到2030年等比減4.2%，之後平滑指數衰減年減排量
  else {
    console.log('使用SBTi目標 - 2030年前每年等比減4.2%，之後年減排量平滑指數衰減');
    let pathway: PathwayData[] = [];
    let tempEmissions = totalEmissions;

    pathway.push({
      year: emissionData.baseYear,
      emissions: tempEmissions,
      reduction: 0,
      target: tempEmissions,
    });

    // Phase 1: Geometric reduction until 2030 (or target year if sooner)
    const sbtiRate = 0.042; // 4.2%
    const endPhase1Year = Math.min(2030, emissionData.targetYear);
    
    for (let year = emissionData.baseYear + 1; year <= endPhase1Year; year++) {
      tempEmissions *= (1 - sbtiRate);
      pathway.push({
        year,
        emissions: tempEmissions,
        reduction: ((totalEmissions - tempEmissions) / totalEmissions) * 100,
        target: tempEmissions
      });
    }

    // Phase 2: Smooth exponential decay for annual reduction from 2031 to target year
    if (emissionData.targetYear > 2030) {
      const emissionsAt2030 = tempEmissions;
      const D = emissionData.targetYear - 2030;
      
      console.log(`2030年後減排: 起始排放 ${emissionsAt2030.toLocaleString()}, ${D}年內需達到 ${residualEmissions.toLocaleString()}`);

      if (D > 0) {
        console.log("SBTi 長期減排模式：完全基於指數衰減的平滑年減排量分配");
        
        const totalReductionNeeded = emissionsAt2030 - residualEmissions;
        
        if (D === 1) {
          pathway.push({
            year: 2031,
            emissions: residualEmissions,
            reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
            target: residualEmissions,
          });
        } else {
          // 計算2030年的實際年減排量作為基準
          let emissionsAt2029 = totalEmissions;
          for (let y = emissionData.baseYear + 1; y <= 2029; y++) {
            emissionsAt2029 *= (1 - sbtiRate);
          }
          const actual2030Reduction = emissionsAt2029 - emissionsAt2030;
          
          console.log(`2030年實際年減排量: ${actual2030Reduction.toFixed(0)} tCO2e`);
          
          // 使用純指數衰減分配年減排量，確保整體平滑
          // R(t) = A × e^(-k×t) + C
          
          // 設定衰減參數
          const k = 0.06; // 溫和的衰減係數
          
          // 設定最小年減排量（避免接近零時的數值問題）
          const minReduction = Math.max(totalReductionNeeded * 0.01, 100); // 至少100噸或總量的1%
          const C = minReduction;
          
          // 通過總和約束計算A，確保總減排量正確
          const exponentialSum = Array.from({ length: D }, (_, t) => Math.exp(-k * t)).reduce((sum, val) => sum + val, 0);
          let A = (totalReductionNeeded - C * D) / exponentialSum;
          
          // 確保第一年不超過2030年的95%（避免跳躍）
          const maxFirstYearReduction = actual2030Reduction * 0.95;
          if (A + C > maxFirstYearReduction) {
            A = maxFirstYearReduction - C;
            console.log(`調整A以避免2030→2031跳躍: A=${A.toFixed(0)}`);
          }
          
          // 重新計算確保總量平衡
          const adjustedTotalReduction = A * exponentialSum + C * D;
          const scalingFactor = totalReductionNeeded / adjustedTotalReduction;
          A *= scalingFactor;
          
          console.log(`最終指數衰減參數:`);
          console.log(`A: ${A.toFixed(0)}, k: ${k}, C: ${C.toFixed(0)}`);
          console.log(`2031年減排量: ${(A + C).toFixed(0)} (2030年: ${actual2030Reduction.toFixed(0)})`);
          console.log(`最後年減排量: ${(A * Math.exp(-k * (D-1)) + C).toFixed(0)}`);
          
          // 使用指數衰減分配每年的減排量
          let currentEmissions = emissionsAt2030;
          for (let t = 0; t < D; t++) {
            const currentYearReduction = A * Math.exp(-k * t) + C;
            currentEmissions -= currentYearReduction;
            
            // 確保不會低於殘留排放量，但避免最後幾年強制調整造成峰值
            if (currentEmissions < residualEmissions) {
              currentEmissions = residualEmissions;
            }
            
            console.log(`Year ${2031 + t}: 年減排量 ${currentYearReduction.toFixed(0)}, 排放量 ${currentEmissions.toFixed(0)}`);
            
            pathway.push({
              year: 2031 + t,
              emissions: currentEmissions,
              reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
              target: currentEmissions,
            });
          }
        }
      }
    }

    finalPathway = pathway.map(p => ({
      ...p,
      emissions: Math.round(p.emissions),
      reduction: Math.round(p.reduction! * 10) / 10,
      target: Math.round(p.target ? p.target : p.emissions)
    }));
  }

  // 添加歷史數據
  const historicalPathwayData: PathwayData[] = (emissionData.historicalData || [])
    .map(d => ({
      year: d.year,
      emissions: d.emissions,
      reduction: undefined,
      target: undefined,
    }))
    .sort((a, b) => a.year - b.year);
    
  let fullPathway = [...historicalPathwayData, ...finalPathway];
  
  const baseYearEmissions = emissionData.scope1 + emissionData.scope2;
  fullPathway = fullPathway.map((dataPoint, index, arr) => {
    let annualReduction: number | undefined = undefined;
    if (index > 0 && arr[index - 1].emissions) {
      annualReduction = arr[index - 1].emissions - dataPoint.emissions;
    }

    let remainingPercentage: number | undefined = undefined;
    if (dataPoint.year >= emissionData.baseYear) {
      remainingPercentage = (dataPoint.emissions / baseYearEmissions) * 100;
    }

    return {
      ...dataPoint,
      annualReduction,
      remainingPercentage,
    };
  });
  
  // 強制修正最終年份排放量，確保符合殘留目標
  const finalYearIndex = fullPathway.findIndex(p => p.year === emissionData.targetYear);
  if (finalYearIndex !== -1) {
    const roundedResidualEmissions = Math.round(residualEmissions);
    if (fullPathway[finalYearIndex].emissions !== roundedResidualEmissions) {
      console.log(
        `修正目標年排放量：從 ${fullPathway[finalYearIndex].emissions.toLocaleString()} 調整為 ${roundedResidualEmissions.toLocaleString()}`
      );
      fullPathway[finalYearIndex].emissions = roundedResidualEmissions;

      // 因為排放量已更改，重新計算最後一年的年減排量
      if (finalYearIndex > 0) {
        const prevYearEmissions = fullPathway[finalYearIndex - 1].emissions;
        fullPathway[finalYearIndex].annualReduction = prevYearEmissions - roundedResidualEmissions;
      }
    }
  }

  // 驗證最終年份排放量
  const finalYearData = fullPathway.find(p => p.year === emissionData.targetYear) || fullPathway[fullPathway.length - 1];
  const actualFinalResidualPercentage = (finalYearData.emissions / baseYearEmissions) * 100;
  console.log('=== 最終驗證 ===');
  console.log('最終排放量:', finalYearData.emissions.toLocaleString(), 'tCO2e');
  console.log('實際殘留比例:', actualFinalResidualPercentage.toFixed(1) + '%');
  console.log('用戶設定比例:', emissionData.residualEmissionPercentage + '%');
  console.log('是否達到目標:', Math.abs(actualFinalResidualPercentage - emissionData.residualEmissionPercentage) < 0.2);

  return fullPathway;
};
