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

    // Phase 2: Long-Term with a parabolic annual reduction for a smooth transition
    const emissionsAtNearTermEnd = tempEmissions;
    const D = targetYear - nearTermTarget.year;

    if (D > 0) {
      const R_total_phase2 = emissionsAtNearTermEnd - residualEmissions;
      
      const lastYearOfPhase1 = path[path.length - 1];
      // Handle historical data case where path might be shorter
      const secondToLastYearOfPhase1 = path.length > 1 ? path[path.length - 2] : { emissions: totalEmissions };
      const annualReductionAtTransition = secondToLastYearOfPhase1.emissions - lastYearOfPhase1.emissions;

      if (D === 1) {
        // Single year transition
        path.push({
          year: nearTermTarget.year + 1,
          emissions: residualEmissions,
          reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
          target: residualEmissions,
        });
      } else if (D === 2) {
        // Fallback to linear decrease for D=2 to avoid singularity in parabolic formula
        console.log("長期減排模式：線性遞減（D=2 後備）");
        const B = 2 * annualReductionAtTransition - R_total_phase2; // Simplified from B = 2*(D*A-R)/(D*(D-1)) for D=2
        const r1 = annualReductionAtTransition;
        const r2 = annualReductionAtTransition - B;
        path.push({ year: nearTermTarget.year + 1, emissions: emissionsAtNearTermEnd - r1, reduction: ((totalEmissions - (emissionsAtNearTermEnd - r1)) / totalEmissions) * 100, target: emissionsAtNearTermEnd - r1 });
        path.push({ year: nearTermTarget.year + 2, emissions: emissionsAtNearTermEnd - r1 - r2, reduction: ((totalEmissions - (emissionsAtNearTermEnd - r1 - r2)) / totalEmissions) * 100, target: emissionsAtNearTermEnd - r1 - r2 });
      } else { // D > 2, use Parabolic model
        console.log("長期減排模式：拋物線型年減排量");
        // Symmetric parabola where r(1) = r(D) = annualReductionAtTransition
        const a = 6 * (annualReductionAtTransition * D - R_total_phase2) / (D * (D - 1) * (D - 2));
        const b = -a * (D + 1);
        const c = annualReductionAtTransition - a - b;
        console.log(`Custom Target - Phase 2 Parabolic: D=${D}, R_total=${R_total_phase2.toFixed(0)}, A_trans=${annualReductionAtTransition.toFixed(0)}, a=${a.toFixed(2)}, b=${b.toFixed(2)}, c=${c.toFixed(2)}`);

        for (let t = 1; t <= D; t++) {
          // Cumulative reduction avoids iterative errors
          const cumulativeReduction = a * t * (t + 1) * (2 * t + 1) / 6 + b * t * (t + 1) / 2 + c * t;
          const currentEmissions = emissionsAtNearTermEnd - cumulativeReduction;
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
  
  // SBTi 1.5°C目標 - 到2030年等比減4.2%，之後拋物線型年減排量
  else {
    console.log('使用SBTi目標 - 2030年前每年等比減4.2%，之後年減排量呈拋物線');
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

    // Phase 2: Parabolic reduction from 2031 to target year
    if (emissionData.targetYear > 2030) {
      const emissionsAt2030 = tempEmissions;
      const D = emissionData.targetYear - 2030;
      
      console.log(`2030年後減排: 起始排放 ${emissionsAt2030.toLocaleString()}, ${D}年內需達到 ${residualEmissions.toLocaleString()}`);

      if (D > 0) {
        const R_total_phase2 = emissionsAt2030 - residualEmissions;
        
        const lastYearOfPhase1 = pathway[pathway.length - 1];
        const secondToLastYearOfPhase1 = pathway.length > 1 ? pathway[pathway.length - 2] : { year: emissionData.baseYear, emissions: totalEmissions };
        const annualReductionAtTransition = secondToLastYearOfPhase1.emissions - lastYearOfPhase1.emissions;

        if (D === 1) {
          pathway.push({
            year: 2031,
            emissions: residualEmissions,
            reduction: ((totalEmissions - residualEmissions) / totalEmissions) * 100,
            target: residualEmissions,
          });
        } else if (D === 2) {
          // Fallback to linear decrease for D=2
          console.log("SBTi 長期減排模式：線性遞減（D=2 後備）");
          const B = 2 * annualReductionAtTransition - R_total_phase2;
          const r1 = annualReductionAtTransition;
          const r2 = annualReductionAtTransition - B;
          pathway.push({ year: 2031, emissions: emissionsAt2030 - r1, reduction: ((totalEmissions - (emissionsAt2030 - r1)) / totalEmissions) * 100, target: emissionsAt2030 - r1 });
          pathway.push({ year: 2032, emissions: emissionsAt2030 - r1 - r2, reduction: ((totalEmissions - (emissionsAt2030 - r1 - r2)) / totalEmissions) * 100, target: emissionsAt2030 - r1 - r2 });
        } else { // D > 2, use Parabolic model
            console.log("SBTi 長期減排模式：拋物線型年減排量");
            const a = 6 * (annualReductionAtTransition * D - R_total_phase2) / (D * (D - 1) * (D - 2));
            const b = -a * (D + 1);
            const c = annualReductionAtTransition - a - b;
            console.log(`SBTi - Phase 2 Parabolic: D=${D}, R_total=${R_total_phase2.toFixed(0)}, A_trans=${annualReductionAtTransition.toFixed(0)}, a=${a.toFixed(2)}, b=${b.toFixed(2)}, c=${c.toFixed(2)}`);

            for (let t = 1; t <= D; t++) {
              // Cumulative reduction avoids iterative errors
              const cumulativeReduction = a * t * (t + 1) * (2 * t + 1) / 6 + b * t * (t + 1) / 2 + c * t;
              const currentEmissions = emissionsAt2030 - cumulativeReduction;
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
