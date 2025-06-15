import type { EmissionData, ReductionModel, CustomTargets, PathwayData } from '../pages/CarbonPath';

/**
 * 計算U形年度減排量分佈，並盡力達成與前期平滑銜接
 * @param D - 長期階段的持續年期
 * @param totalReductionNeeded - 此階段總減排需求
 * @param lastYearPhase1Reduction - 前一階段最後一年的年減排量，用於平滑化
 * @returns 成功則返回年度減排量陣列，否則返回 null，觸發後備模型
 */
const calculateUShapedReductions = (
  D: number,
  totalReductionNeeded: number,
  lastYearPhase1Reduction: number
): number[] | null => {
  const t_min_years = 4; // 最後幾年減排量開始回升
  if (D <= t_min_years || totalReductionNeeded <= 0 || lastYearPhase1Reduction <= 0) {
    return null;
  }

  const t_min = D - t_min_years;
  const avgReduction = totalReductionNeeded / D;
  
  // 為了形成U形曲線(先降後升)，起始點的減排量必須大於平均減排量
  // 我們以`lastYearPhase1Reduction`為目標，但若它太低，則無法形成U形
  const initialTargetReduction = lastYearPhase1Reduction;
  if (initialTargetReduction <= avgReduction) {
    console.warn(
      `前期減排量(${initialTargetReduction.toFixed(0)})低於長期平均需求(${avgReduction.toFixed(0)})，` +
      `無法達成平滑U形曲線。將使用後備指數衰減模型以確保路徑合理。`
    );
    // 返回null將觸發指數衰減後備方案，這比強制產生一個有跳躍的U形曲線更安全
    return null;
  }

  // 解算拋物線 r(t) = S * ((t - t_min)^2 + c) 的參數 S 和 c
  const t_min_sq = t_min ** 2;
  const sum_sq_diff_from_min = Array.from({ length: D }, (_, t) => (t - t_min) ** 2).reduce((s, v) => s + v, 0);
  const denominator_for_S = sum_sq_diff_from_min - D * t_min_sq;

  if (Math.abs(denominator_for_S) < 1e-9) return null;

  const S = (totalReductionNeeded - D * initialTargetReduction) / denominator_for_S;
  if (S <= 0) {
    // 如果初始目標過高，可能導致此問題
    console.warn(`U形模型計算S時出錯 (S <= 0)，可能因初始目標過高。將使用後備模型。`);
    return null;
  }

  const c = (initialTargetReduction / S) - t_min_sq;
  if (c <= 0) {
    console.warn(`U形模型計算c時出錯 (c <= 0)。將使用後備模型。`);
    return null;
  }

  const annualReductions = Array.from({ length: D }, (_, t) => S * ((t - t_min) ** 2 + c));
  
  // 最終縮放以確保總和精確
  const calculatedSum = annualReductions.reduce((sum, r) => sum + r, 0);
  if (calculatedSum <= 0) return null;
  
  const scalingFactor = totalReductionNeeded / calculatedSum;
  return annualReductions.map(r => r * scalingFactor);
};

/**
 * 後備方案：計算指數衰減的年度減排量
 */
const calculateExponentialDecayReductions = (D: number, totalReductionNeeded: number, initialReduction: number): number[] => {
    const k = 0.08;
    let baseReductions;
    if (initialReduction > 0) {
        baseReductions = Array.from({ length: D }, (_, t) => initialReduction * Math.exp(-k * t));
    } else {
        baseReductions = Array.from({ length: D }, (_, t) => Math.exp(-k * t));
    }
    
    const totalBaseReduction = baseReductions.reduce((sum, val) => sum + val, 0);
    const scalingFactor = totalBaseReduction > 0 ? totalReductionNeeded / totalBaseReduction : 0;
    
    return baseReductions.map(base => base * scalingFactor);
};


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

    // Phase 2: Long-Term with U-shaped or exponential decay reduction
    const emissionsAtNearTermEnd = tempEmissions;
    const D = targetYear - nearTermTarget.year;

    if (D > 0) {
      const totalReductionNeeded = emissionsAtNearTermEnd - residualEmissions;
      const nearTermFinalAnnualReduction = path.length > 1 ? path[path.length - 2].emissions - path[path.length - 1].emissions : 0;
      
      let annualReductions = calculateUShapedReductions(D, totalReductionNeeded, nearTermFinalAnnualReduction);

      if (annualReductions) {
        console.log("自訂長期減排：使用U形減排模型");
      } else {
        console.log("自訂長期減排：使用後備指數衰減模型");
        annualReductions = calculateExponentialDecayReductions(D, totalReductionNeeded, nearTermFinalAnnualReduction);
      }
        
      console.log(`長期減排總量: ${totalReductionNeeded.toFixed(0)} tCO2e`);
      console.log(`長期第一年減排量 (峰值): ${annualReductions[0]?.toFixed(0) ?? 0} tCO2e`);
      console.log(`長期最後一年減排量: ${annualReductions[D - 1]?.toFixed(0) ?? 0} tCO2e`);

      // Apply reductions to build the pathway
      let currentEmissions = emissionsAtNearTermEnd;
      for (let t = 0; t < D; t++) {
        currentEmissions -= annualReductions[t];
        
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
  
  // SBTi 1.5°C目標 - 到2030年等比減4.2%，之後採U形或指數衰減
  else {
    console.log('使用SBTi目標 - 2030年前每年等比減4.2%，之後採U形或指數衰減');
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

    // Phase 2: U-shaped or exponential decay from 2031 to target year
    if (emissionData.targetYear > 2030) {
      const emissionsAt2030 = tempEmissions;
      const D = emissionData.targetYear - 2030;
      
      console.log(`2030年後減排: 起始排放 ${emissionsAt2030.toLocaleString()}, ${D}年內需達到 ${residualEmissions.toLocaleString()}`);

      if (D > 0) {
        const totalReductionNeeded = emissionsAt2030 - residualEmissions;
        
        const emissionsAt2029 = pathway.length > 1 ? pathway[pathway.length - 2].emissions : emissionsAt2030;
        const actual2030Reduction = emissionsAt2029 - emissionsAt2030;
        console.log(`2030年實際年減排量 (銜接點): ${actual2030Reduction.toFixed(0)} tCO2e`);
        
        let annualReductions = calculateUShapedReductions(D, totalReductionNeeded, actual2030Reduction);

        if (annualReductions) {
            console.log("SBTi 長期減排模式：使用U形減排模型");
        } else {
            console.log("SBTi 長期減排模式：使用後備指數衰減模型");
            annualReductions = calculateExponentialDecayReductions(D, totalReductionNeeded, actual2030Reduction);
        }

        // Apply reductions
        let currentEmissions = emissionsAt2030;
        for (let t = 0; t < D; t++) {
          currentEmissions -= annualReductions[t];
          
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
