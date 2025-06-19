
import { useTCFDAssessmentCore } from './tcfd/useTCFDAssessmentCore';
import { useTCFDRiskOpportunitySelections } from './tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from './tcfd/useTCFDScenarioEvaluations';
import { useTCFDStrategyAnalysis } from './tcfd/useTCFDStrategyAnalysis';
import { useTCFDReport } from './tcfd/useTCFDReport';

export const useTCFDAssessment = (assessmentId?: string) => {
  const {
    assessment,
    loading,
    error: coreError,
    createAssessment,
    loadAssessment,
    updateAssessmentStage,
  } = useTCFDAssessmentCore(assessmentId);

  const {
    riskOpportunitySelections,
    error: selectionError,
    saveRiskOpportunitySelections,
    loadRiskOpportunitySelections,
  } = useTCFDRiskOpportunitySelections(assessmentId);

  const {
    scenarioEvaluations,
    error: scenarioError,
    saveScenarioEvaluation,
    loadScenarioEvaluations,
    generateScenarioWithLLM,
    generateScenarioAnalysisWithLLM,
  } = useTCFDScenarioEvaluations(assessmentId);

  const {
    strategyAnalysis,
    error: strategyError,
    saveStrategyAnalysis,
    loadStrategyAnalysis,
    generateStrategyAnalysisWithLLM,
  } = useTCFDStrategyAnalysis(assessmentId);

  const {
    report,
    error: reportError,
    generateReport,
    loadReport,
  } = useTCFDReport(assessmentId);

  // 載入所有相關資料
  const loadAllData = async () => {
    if (!assessment) return;
    
    await Promise.all([
      loadRiskOpportunitySelections(),
      loadScenarioEvaluations(),
      loadStrategyAnalysis(),
      loadReport(),
    ]);
  };

  // 合併所有錯誤
  const error = coreError || selectionError || scenarioError || strategyError || reportError;

  return {
    assessment,
    riskOpportunitySelections,
    scenarioEvaluations,
    strategyAnalysis,
    report,
    loading,
    error,
    createAssessment,
    loadAssessment,
    updateAssessmentStage,
    saveRiskOpportunitySelections,
    loadRiskOpportunitySelections,
    saveScenarioEvaluation,
    loadScenarioEvaluations,
    saveStrategyAnalysis,
    loadStrategyAnalysis,
    generateReport,
    loadReport,
    loadAllData,
    generateScenarioWithLLM,
    generateScenarioAnalysisWithLLM,
    generateStrategyAnalysisWithLLM,
  };
};
