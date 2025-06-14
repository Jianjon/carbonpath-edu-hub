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

    // Phase 2: Long-Term with Linearly Decreasing Annual Reduction for a smooth transition
    const emissionsAtNearTermEnd = tempEmissions;
    const D = targetYear - nearTermTarget.year;

    if (D > 0) {
      console.log("長期減排模式：從近期目標年減排量開始平滑線性遞減");
      const R_total_phase2 = emissionsAtNearTermEnd - residualEmissions;
      let currentEmissions = emissionsAtNearTermEnd;

      if (D === 1) {
        currentEmissions -= R_total_phase2;
        path.push({
          year: nearTermTarget.year + 1,
          emissions: currentEmissions,
          reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
          target: currentEmissions,
        });
      } else {
        // Get the reduction amount of the last year of phase 1 to ensure a smooth transition
        const lastYearOfPhase1 = path[path.length - 1];
        const secondToLastYearOfPhase1 = path[path.length - 2];
        const annualReductionAtTransition = secondToLastYearOfPhase1.emissions - lastYearOfPhase1.emissions;

        // Formula for a linearly decreasing sequence r_t = A - B(t-1) where A is the starting reduction.
        // Sum of reductions must equal R_total_phase2. We solve for B.
        const B = (2 * (D * annualReductionAtTransition - R_total_phase2)) / (D * (D - 1));
        console.log(`Custom Target - Phase 2: D=${D}, R_total=${R_total_phase2.toFixed(0)}, A(start reduction)=${annualReductionAtTransition.toFixed(0)}, B(slope factor)=${B.toFixed(2)}`);

        for (let t = 1; t <= D; t++) {
          // Cumulative reduction in phase 2 after t years, calculated from start to avoid iterative errors.
          const cumulativeReduction = t * annualReductionAtTransition - B * (t * (t - 1) / 2);
          currentEmissions = emissionsAtNearTermEnd - cumulativeReduction;
          
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
  
  // SBTi 1.5°C目標 - 到2030年等比減4.2%，之後線性遞減年減排量
  else {
    console.log('使用SBTi目標 - 2030年前每年等比減4.2%，之後年減排量線性遞減');
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

    // Phase 2: Smoothed reduction from 2031 to target year for a smooth transition
    if (emissionData.targetYear > 2030) {
      const emissionsAt2030 = tempEmissions;
      const D = emissionData.targetYear - 2030;
      
      console.log(`2030年後減排: 起始排放 ${emissionsAt2030.toLocaleString()}, ${D}年內需達到 ${residualEmissions.toLocaleString()}`);

      if (D > 0) {
        console.log("SBTi 長期減排模式：從2030年減排量開始平滑線性遞減");
        const R_total_phase2 = emissionsAt2030 - residualEmissions;
        let currentEmissions = emissionsAt2030;

        if (D === 1) {
          currentEmissions -= R_total_phase2;
          pathway.push({
            year: 2031,
            emissions: currentEmissions,
            reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
            target: currentEmissions,
          });
        } else {
          // Get the reduction amount of the last year of phase 1 to ensure a smooth transition.
          const lastYearOfPhase1 = pathway[pathway.length - 1];
          const secondToLastYearOfPhase1 = pathway[pathway.length - 2];
          const annualReductionAtTransition = secondToLastYearOfPhase1.emissions - lastYearOfPhase1.emissions;

          // Formula for a linearly decreasing sequence r_t = A - B(t-1) where A is the starting reduction.
          // Sum of reductions must equal R_total_phase2. We solve for B.
          const B = (2 * (D * annualReductionAtTransition - R_total_phase2)) / (D * (D - 1));
          console.log(`SBTi - Phase 2: D=${D}, R_total=${R_total_phase2.toFixed(0)}, A(start reduction)=${annualReductionAtTransition.toFixed(0)}, B(slope factor)=${B.toFixed(2)}`);

          for (let t = 1; t <= D; t++) {
            // Cumulative reduction in phase 2 after t years, calculated from start to avoid iterative errors.
            const cumulativeReduction = t * annualReductionAtTransition - B * (t * (t - 1) / 2);
            currentEmissions = emissionsAt2030 - cumulativeReduction;

            pathway.push({
              year: 2030 + t,
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
