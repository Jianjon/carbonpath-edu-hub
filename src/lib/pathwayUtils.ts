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

    // Phase 1: Near-Term Geometric Reduction
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

    // Phase 2: Long-Term with parabolic annual reduction targeting residual emissions
    const emissionsAtNearTermEnd = tempEmissions;
    const D = targetYear - nearTermTarget.year;

    if (D > 0) {
      console.log("長期減排模式：拋物線型年減排量（前期緩慢，中後期加速）");
      console.log(`起點: ${emissionsAtNearTermEnd.toLocaleString()}, 終點: ${residualEmissions.toLocaleString()}, 年數: ${D}`);
      
      // 總減排量 = 起點排放量 - 残留排放量
      const totalReductionNeeded = emissionsAtNearTermEnd - residualEmissions;
      
      if (D === 1) {
        // Single year transition
        path.push({
          year: nearTermTarget.year + 1,
          emissions: residualEmissions,
          reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
          target: residualEmissions,
        });
      } else {
        // 設計拋物線年減排量：r(t) = at² + bt + c
        // 邊界條件：
        // 1. 前期緩慢：r(1) 較小
        // 2. 中後期加速：r(D) 較大
        // 3. 總和約束：∑r(t) = totalReductionNeeded
        
        // 使用向下開口的拋物線，讓年減排量前期小，後期大
        // 簡化設計：r(t) = a * t² + b，其中 a > 0
        
        // 計算係數使總減排量符合需求
        // ∑(t=1 to D) (a*t² + b) = totalReductionNeeded
        // a * ∑t² + b * D = totalReductionNeeded
        // a * D(D+1)(2D+1)/6 + b * D = totalReductionNeeded
        
        const sumT2 = D * (D + 1) * (2 * D + 1) / 6;
        
        // 設定前期減排量相對較小，後期較大的比例
        const minReductionRatio = 0.3; // 前期減排量占平均值的比例
        const avgReduction = totalReductionNeeded / D;
        const minReduction = avgReduction * minReductionRatio;
        
        // 從 r(1) = a + b = minReduction 求解
        // 和總量約束求解 a 和 b
        const b = minReduction - (totalReductionNeeded - minReduction * D) / sumT2;
        const a = (totalReductionNeeded - b * D) / sumT2;
        
        console.log(`拋物線參數: a=${a.toFixed(6)}, b=${b.toFixed(2)}`);
        console.log(`預期最小年減排: ${minReduction.toFixed(0)}, 最大年減排: ${(a * D * D + b).toFixed(0)}`);
        
        let cumulativeReduction = 0;
        for (let t = 1; t <= D; t++) {
          // 計算當前年度的拋物線年減排量
          const parabolicReduction = a * t * t + b;
          cumulativeReduction += parabolicReduction;
          
          // 計算當前排放量
          let currentEmissions;
          if (t === D) {
            // 最後一年確保達到殘留排放量
            currentEmissions = residualEmissions;
          } else {
            currentEmissions = emissionsAtNearTermEnd - cumulativeReduction;
            // 確保不會低於殘留排放量
            currentEmissions = Math.max(currentEmissions, residualEmissions);
          }
          
          path.push({
            year: nearTermTarget.year + t,
            emissions: currentEmissions,
            reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
            target: currentEmissions,
          });
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
    
    // 計算各階段目標排放量（以殘留量為最終目標）
    const totalReductionNeeded = totalEmissions - residualEmissions;
    
    for (let i = 0; i <= years; i++) {
      const currentYear = emissionData.baseYear + i;
      let targetEmissions;

      if (currentYear === emissionData.baseYear) {
        targetEmissions = totalEmissions;
      } else if (currentYear === emissionData.targetYear) {
        targetEmissions = residualEmissions; // 最終必須達到殘留量
      } else {
        // 按台灣目標階段計算，但最終指向殘留量
        let reductionProgress = 0;
        
        if (currentYear <= 2030) {
          // 到2030年28%減排
          reductionProgress = (currentYear - emissionData.baseYear) / (2030 - emissionData.baseYear) * 0.28;
        } else if (currentYear <= 2032) {
          // 2030-2032年從28%到32%
          reductionProgress = 0.28 + (currentYear - 2030) / (2032 - 2030) * (0.32 - 0.28);
        } else if (currentYear <= 2035) {
          // 2032-2035年從32%到38%
          reductionProgress = 0.32 + (currentYear - 2032) / (2035 - 2032) * (0.38 - 0.32);
        } else {
          // 2035年後線性減排到殘留量
          const finalReductionRatio = (totalEmissions - residualEmissions) / totalEmissions;
          reductionProgress = 0.38 + (currentYear - 2035) / (emissionData.targetYear - 2035) * (finalReductionRatio - 0.38);
        }
        
        targetEmissions = totalEmissions * (1 - reductionProgress);
        // 確保不會低於殘留量
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
  
  // SBTi 1.5°C目標 - 到2030年等比減4.2%，之後倒U型年減排量（2035為高峰）
  else {
    console.log('使用SBTi目標 - 2030年前每年等比減4.2%，之後倒U型年減排量（2035為高峰）');
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

    // Phase 2: Inverted U-shaped annual reduction from 2031 to target year (peak at 2035)
    if (emissionData.targetYear > 2030) {
      const emissionsAt2030 = tempEmissions;
      const D = emissionData.targetYear - 2030;
      
      console.log(`2030年後減排: 起始排放 ${emissionsAt2030.toLocaleString()}, ${D}年內需達到 ${residualEmissions.toLocaleString()}`);

      if (D > 0) {
        console.log("SBTi 長期減排模式：倒U型年減排量（2030-2035緩增，2035高峰，2035-2050遞減）");
        
        // 總減排量 = 2030年排放量 - 残留排放量
        const totalReductionNeeded = emissionsAt2030 - residualEmissions;
        
        if (D === 1) {
          pathway.push({
            year: 2031,
            emissions: residualEmissions,
            reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
            target: residualEmissions,
          });
        } else {
          // 設計倒U型年減排量：以2035年為高峰
          // r(t) = a * (t - peak)² + maxReduction
          // 其中 peak = 2035, t 從 2031 到 targetYear
          
          const peakYear = Math.min(2035, emissionData.targetYear - 1); // 確保高峰年不會是最後一年
          const avgReduction = totalReductionNeeded / D;
          
          // 設定高峰年的減排量為平均值的1.3倍
          const maxReduction = avgReduction * 1.3;
          
          // 設定起始年和結束年的減排量為平均值的0.8倍
          const minReduction = avgReduction * 0.8;
          
          // 計算倒U型拋物線的係數
          // r(2031) = r(targetYear) = minReduction
          // r(peakYear) = maxReduction
          // 使用 r(t) = a * (t - peakYear)² + maxReduction
          // 其中 a < 0 (向下開口)
          
          const peakOffset = peakYear - 2030; // peak相對於2030的偏移
          const startOffset = 1; // 2031相對於2030的偏移
          const endOffset = D; // 最後一年相對於2030的偏移
          
          // 使用起始年或結束年中距離高峰較遠的那個來計算係數
          const maxOffsetFromPeak = Math.max(
            Math.abs(startOffset - peakOffset),
            Math.abs(endOffset - peakOffset)
          );
          
          const a = (minReduction - maxReduction) / (maxOffsetFromPeak * maxOffsetFromPeak);
          
          console.log(`倒U型參數: peakYear=${peakYear}, maxReduction=${maxReduction.toFixed(2)}, minReduction=${minReduction.toFixed(2)}, a=${a.toFixed(6)}`);
          
          // 計算實際的年減排量並調整係數以確保總和正確
          let totalCalculated = 0;
          const reductionByYear: { [year: number]: number } = {};
          
          for (let t = 1; t <= D; t++) {
            const currentYear = 2030 + t;
            const offsetFromPeak = currentYear - peakYear;
            const reduction = a * offsetFromPeak * offsetFromPeak + maxReduction;
            reductionByYear[currentYear] = Math.max(reduction, avgReduction * 0.5); // 設定最小減排量
            totalCalculated += reductionByYear[currentYear];
          }
          
          // 調整係數以確保總減排量正確
          const adjustmentFactor = totalReductionNeeded / totalCalculated;
          console.log(`調整係數: ${adjustmentFactor.toFixed(4)}`);
          
          let cumulativeReduction = 0;
          for (let t = 1; t <= D; t++) {
            const currentYear = 2030 + t;
            
            // 計算調整後的年減排量
            const adjustedReduction = reductionByYear[currentYear] * adjustmentFactor;
            cumulativeReduction += adjustedReduction;
            
            console.log(`Year ${currentYear}: 年減排量 ${adjustedReduction.toFixed(0)}, 累積減排 ${cumulativeReduction.toFixed(0)}`);
            
            // 計算當前排放量
            let currentEmissions;
            if (t === D) {
              // 最後一年確保達到殘留排放量
              currentEmissions = residualEmissions;
            } else {
              currentEmissions = emissionsAt2030 - cumulativeReduction;
              // 確保不會低於殘留排放量
              currentEmissions = Math.max(currentEmissions, residualEmissions);
            }
            
            pathway.push({
              year: currentYear,
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
