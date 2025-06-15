
import type { PathwayData, EmissionData, CustomTargets } from '../../types/carbon';
import { calculateGrowthReductions } from './calculateGrowthReductions';

export const calculateCustomTargetPath = (
  emissionData: EmissionData,
  customTargets: CustomTargets,
  totalEmissions: number,
  residualEmissions: number
): PathwayData[] => {
  if (!customTargets.nearTermTarget || !customTargets.longTermTarget) {
      console.error("Custom target path requires near and long term targets.");
      return [];
  }

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

  // Phase 2: Long-Term with growth reduction
  const emissionsAtNearTermEnd = tempEmissions;
  const D = targetYear - nearTermTarget.year;

  if (D > 0) {
    const totalReductionNeeded = emissionsAtNearTermEnd - residualEmissions;
    
    console.log("自訂長期減排：使用平滑增長模型（向上凸）");
    const annualReductions = calculateGrowthReductions(D, totalReductionNeeded);
      
    console.log(`長期減排總量: ${totalReductionNeeded.toFixed(0)} tCO2e`);
    console.log(`長期第一年減排量: ${annualReductions[0]?.toFixed(0) ?? 0} tCO2e`);
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

  return path.map(p => ({
    ...p,
    emissions: Math.round(p.emissions),
    reduction: Math.round(p.reduction! * 10) / 10,
    target: Math.round(p.target as number),
  }));
};
