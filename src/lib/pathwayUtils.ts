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
    const D = targetYear - nearTermTarget.year;

    if (D > 0) {
      const totalReductionNeeded = emissionsAtNearTermEnd - residualEmissions;
      
      if (D === 1) {
        path.push({
          year: nearTermTarget.year + 1,
          emissions: residualEmissions,
          reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
          target: residualEmissions,
        });
      } else {
        console.log("自訂長期減排模式：平滑指數衰減");

        // 1. Define base reduction profile (decaying exponential)
        const k = 0.1; // Controls the curve shape
        const baseReductions = Array.from({ length: D }, (_, t) => Math.exp(-k * t));
        
        // 2. Calculate total of base reductions
        const totalBaseReduction = baseReductions.reduce((sum, val) => sum + val, 0);
        
        // 3. Calculate scaling factor to meet the total reduction goal
        const scalingFactor = totalBaseReduction > 0 ? totalReductionNeeded / totalBaseReduction : 0;
        
        // 4. Calculate the final, scaled annual reductions
        const annualReductions = baseReductions.map(base => base * scalingFactor);
        
        console.log(`長期減排總量: ${totalReductionNeeded.toFixed(0)} tCO2e`);
        console.log(`長期第一年減排量 (峰值): ${annualReductions[0]?.toFixed(0) ?? 0} tCO2e`);
        console.log(`長期最後一年減排量: ${annualReductions[D - 1]?.toFixed(0) ?? 0} tCO2e`);

        const nearTermFinalAnnualReduction = path.length > 1 ? path[path.length - 2].emissions - path[path.length - 1].emissions : 0;
        if (annualReductions.length > 0 && annualReductions[0] < nearTermFinalAnnualReduction) {
           console.warn(`警告：長期階段的起始減排量 ${annualReductions[0].toFixed(0)} 低於近期階段的最終減排量 ${nearTermFinalAnnualReduction.toFixed(0)}。未形成預期峰值。`);
        }

        // 5. Apply reductions to build the pathway
        let currentEmissions = emissionsAtNearTermEnd;
        for (let t = 0; t < D; t++) {
          currentEmissions -= annualReductions[t];
          
          // To handle potential floating point inaccuracies, ensure the last value is exact.
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
        const totalReductionNeeded = emissionsAt2030 - residualEmissions;
        
        if (D === 1) {
          pathway.push({
            year: 2031,
            emissions: residualEmissions,
            reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
            target: residualEmissions,
          });
        } else {
          console.log("SBTi 長期減排模式：平滑指數衰減");

          // Calculate 2030's actual annual reduction for a smooth transition
          const emissionsAt2029 = pathway.length > 1 ? pathway[pathway.length - 2].emissions : emissionsAt2030;
          const actual2030Reduction = emissionsAt2029 - emissionsAt2030;
          console.log(`2030年實際年減排量 (銜接點): ${actual2030Reduction.toFixed(0)} tCO2e`);
          
          // 1. Define base reduction profile, starting from the 2030 reduction and decaying
          const k = 0.08; // Controls the decay speed
          const baseReductions = Array.from({ length: D }, (_, t) => actual2030Reduction * Math.exp(-k * t));

          // 2. Calculate total of base reductions
          const totalBaseReduction = baseReductions.reduce((sum, val) => sum + val, 0);

          // 3. Calculate scaling factor
          const scalingFactor = totalBaseReduction > 0 ? totalReductionNeeded / totalBaseReduction : 0;
          
          // 4. Calculate final annual reductions
          const annualReductions = baseReductions.map(base => base * scalingFactor);
          
          if (annualReductions.length > 0) {
            console.log(`2031年預計減排量: ${annualReductions[0].toFixed(0)} tCO2e`);
            if (annualReductions[0] > actual2030Reduction * 1.05) { // Allow for small numeric variations
              console.warn("警告：2031年減排量顯著高於2030年，銜接不平滑。");
            }
          }

          // 5. Apply reductions
          let currentEmissions = emissionsAt2030;
          for (let t = 0; t < D; t++) {
            currentEmissions -= annualReductions[t];
            
            // Ensure last value is exact
            if (t === D - 1) {
              currentEmissions = residualEmissions;
            }

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
      const prevEmissions = arr[index - 1].emissions;
      // Handle cases where emissions might not be a number
      if (typeof prevEmissions === 'number' && typeof dataPoint.emissions === 'number') {
        annualReduction = prevEmissions - dataPoint.emissions;
      }
    }

    let remainingPercentage: number | undefined = undefined;
    if (dataPoint.year >= emissionData.baseYear && typeof dataPoint.emissions === 'number') {
      remainingPercentage = (dataPoint.emissions / baseYearEmissions) * 100;
    }

    return {
      ...dataPoint,
      annualReduction,
      remainingPercentage,
    };
  });
  
  // 強制修正最終年份排放量，確保符合殘留目標 - This block is no longer needed with the scaling factor method.
  const finalYearIndex = fullPathway.findIndex(p => p.year === emissionData.targetYear);
  if (finalYearIndex !== -1) {
    const roundedResidualEmissions = Math.round(residualEmissions);
    if (fullPathway[finalYearIndex].emissions !== roundedResidualEmissions) {
      console.log(
        `最終路徑驗證：修正目標年 ${fullPathway[finalYearIndex].year} 的排放量，從 ${fullPathway[finalYearIndex].emissions.toLocaleString()} 調整為 ${roundedResidualEmissions.toLocaleString()}`
      );
      // Ensure the final point is exactly the target
      fullPathway[finalYearIndex].emissions = roundedResidualEmissions;
      
      // Recalculate last annual reduction
      if (finalYearIndex > 0) {
        const prevYearEmissions = fullPathway[finalYearIndex - 1].emissions;
        fullPathway[finalYearIndex].annualReduction = prevYearEmissions - roundedResidualEmissions;
        fullPathway[finalYearIndex].remainingPercentage = (roundedResidualEmissions / baseYearEmissions) * 100;
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
