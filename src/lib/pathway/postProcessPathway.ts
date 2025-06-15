
import type { PathwayData, EmissionData } from '../../types/carbon';

export const postProcessPathway = (
  pathway: PathwayData[],
  emissionData: EmissionData,
  totalEmissions: number,
  residualEmissions: number
): PathwayData[] => {
  // Add historical data
  const historicalPathwayData: PathwayData[] = (emissionData.historicalData || [])
    .map(d => ({
      year: d.year,
      emissions: d.emissions,
      reduction: undefined,
      target: undefined,
    }))
    .sort((a, b) => a.year - b.year);
    
  let fullPathway = [...historicalPathwayData, ...pathway];
  
  // Calculate annual reduction and remaining percentage
  const baseYearEmissions = totalEmissions;
  fullPathway = fullPathway.map((dataPoint, index, arr) => {
    let annualReduction: number | undefined = undefined;
    if (index > 0 && arr[index - 1].emissions) {
      const prevEmissions = arr[index - 1].emissions;
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
  
  // Force correct the final year emissions
  const finalYearIndex = fullPathway.findIndex(p => p.year === emissionData.targetYear);
  if (finalYearIndex !== -1) {
    const roundedResidualEmissions = Math.round(residualEmissions);
    if (fullPathway[finalYearIndex].emissions !== roundedResidualEmissions) {
      console.log(
        `最終路徑驗證：修正目標年 ${fullPathway[finalYearIndex].year} 的排放量，從 ${fullPathway[finalYearIndex].emissions.toLocaleString()} 調整為 ${roundedResidualEmissions.toLocaleString()}`
      );
      fullPathway[finalYearIndex].emissions = roundedResidualEmissions;
      
      if (finalYearIndex > 0) {
        const prevYearEmissions = fullPathway[finalYearIndex - 1].emissions;
        fullPathway[finalYearIndex].annualReduction = prevYearEmissions - roundedResidualEmissions;
        fullPathway[finalYearIndex].remainingPercentage = (roundedResidualEmissions / baseYearEmissions) * 100;
      }
    }
  }

  // Final validation log
  const finalYearData = fullPathway.find(p => p.year === emissionData.targetYear) || fullPathway[fullPathway.length - 1];
  const actualFinalResidualPercentage = (finalYearData.emissions / baseYearEmissions) * 100;
  console.log('=== 最終驗證 ===');
  console.log('最終排放量:', finalYearData.emissions.toLocaleString(), 'tCO2e');
  console.log('實際殘留比例:', actualFinalResidualPercentage.toFixed(1) + '%');
  console.log('用戶設定比例:', emissionData.residualEmissionPercentage + '%');
  console.log('是否達到目標:', Math.abs(actualFinalResidualPercentage - emissionData.residualEmissionPercentage) < 0.2);

  return fullPathway;
};
