
import type { EmissionData, ReductionModel, CustomTargets, PathwayData } from '../types/carbon';
import { calculateCustomTargetPath } from './pathway/customTargetPath';
import { calculateTaiwanTargetPath } from './pathway/taiwanTargetPath';
import { calculateSbtiPath } from './pathway/sbtiPath';
import { postProcessPathway } from './pathway/postProcessPathway';

export const calculatePathwayData = (
  emissionData: EmissionData,
  selectedModel: ReductionModel,
  customTargets: CustomTargets
): PathwayData[] => {
  const totalEmissions = emissionData.scope1 + emissionData.scope2;
  const years = emissionData.targetYear - emissionData.baseYear;
  
  const residualEmissions = totalEmissions * (emissionData.residualEmissionPercentage / 100);
  
  console.log('=== 減碳路徑規劃邏輯 ===');
  console.log('起點 - 基線排放量:', totalEmissions.toLocaleString(), 'tCO2e');
  console.log('終點 - 残留排放量:', residualEmissions.toLocaleString(), 'tCO2e');
  console.log('用戶設定殘留比例:', emissionData.residualEmissionPercentage, '%');
  console.log('需要減排的總量:', (totalEmissions - residualEmissions).toLocaleString(), 'tCO2e');
  
  let calculatedPathway: PathwayData[] = [];

  switch (selectedModel.id) {
    case 'custom-target':
      calculatedPathway = calculateCustomTargetPath(
        emissionData, 
        customTargets, 
        totalEmissions, 
        residualEmissions
      );
      break;
    case 'taiwan-target':
      calculatedPathway = calculateTaiwanTargetPath(
        emissionData,
        totalEmissions,
        residualEmissions,
        years
      );
      break;
    default: // Assume SBTi is the default/fallback
      calculatedPathway = calculateSbtiPath(
        emissionData,
        totalEmissions,
        residualEmissions
      );
      break;
  }
  
  return postProcessPathway(
    calculatedPathway, 
    emissionData, 
    totalEmissions, 
    residualEmissions
  );
};
