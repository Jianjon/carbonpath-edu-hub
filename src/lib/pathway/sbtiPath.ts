
import type { PathwayData, EmissionData } from '../../types/carbon';
import { calculateGrowthReductions } from './calculateGrowthReductions';

export const calculateSbtiPath = (
  emissionData: EmissionData,
  totalEmissions: number,
  residualEmissions: number
): PathwayData[] => {
    console.log('使用SBTi目標 - 2030年前每年等比減4.2%，之後採平滑增長');
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

    // Phase 2: Growth reduction from 2031 to target year
    if (emissionData.targetYear > 2030) {
      const emissionsAt2030 = tempEmissions;
      const D = emissionData.targetYear - 2030;
      
      console.log(`2030年後減排: 起始排放 ${emissionsAt2030.toLocaleString()}, ${D}年內需達到 ${residualEmissions.toLocaleString()}`);

      if (D > 0) {
        const totalReductionNeeded = emissionsAt2030 - residualEmissions;
        
        console.log("SBTi 長期減排模式：使用平滑增長模型（向上凸）");
        const annualReductions = calculateGrowthReductions(D, totalReductionNeeded);

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

    return pathway.map(p => ({
      ...p,
      emissions: Math.round(p.emissions),
      reduction: Math.round(p.reduction! * 10) / 10,
      target: Math.round(p.target ? p.target : p.emissions)
    }));
};
