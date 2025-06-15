
import type { PathwayData, EmissionData } from '../../types/carbon';

export const calculateTaiwanTargetPath = (
  emissionData: EmissionData,
  totalEmissions: number,
  residualEmissions: number,
  years: number
): PathwayData[] => {
  console.log('使用台灣目標 - 從基線到殘留量:', residualEmissions.toLocaleString());
  let pathway: PathwayData[] = [];
  
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
  return pathway;
};
