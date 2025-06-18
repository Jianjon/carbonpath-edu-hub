
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TCFDAssessment, RiskOpportunitySelection, ScenarioEvaluation, StrategyAnalysis, TCFDReport } from '@/types/tcfd';

export const useTCFDAssessment = (assessmentId?: string) => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<TCFDAssessment | null>(null);
  const [riskOpportunitySelections, setRiskOpportunitySelections] = useState<RiskOpportunitySelection[]>([]);
  const [scenarioEvaluations, setScenarioEvaluations] = useState<ScenarioEvaluation[]>([]);
  const [strategyAnalysis, setStrategyAnalysis] = useState<StrategyAnalysis[]>([]);
  const [report, setReport] = useState<TCFDReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 創建新的評估
  const createAssessment = async (data: {
    industry: string;
    company_size: string;
    has_carbon_inventory: boolean;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data: newAssessment, error } = await supabase
        .from('tcfd_assessments')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      setAssessment(newAssessment as TCFDAssessment);
      return newAssessment as TCFDAssessment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 載入評估資料
  const loadAssessment = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tcfd_assessments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAssessment(data as TCFDAssessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 更新評估階段
  const updateAssessmentStage = async (stage: number) => {
    if (!assessment) return;
    
    try {
      const { error } = await supabase
        .from('tcfd_assessments')
        .update({ current_stage: stage, updated_at: new Date().toISOString() })
        .eq('id', assessment.id);

      if (error) throw error;
      setAssessment(prev => prev ? { ...prev, current_stage: stage } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // 儲存風險與機會選擇
  const saveRiskOpportunitySelections = async (selections: Omit<RiskOpportunitySelection, 'id' | 'created_at'>[]) => {
    if (!assessment) return;
    
    try {
      // 先刪除現有選擇
      await supabase
        .from('tcfd_risk_opportunity_selections')
        .delete()
        .eq('assessment_id', assessment.id);

      // 插入新選擇
      const { data, error } = await supabase
        .from('tcfd_risk_opportunity_selections')
        .insert(selections)
        .select();

      if (error) throw error;
      setRiskOpportunitySelections(data as RiskOpportunitySelection[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // 載入風險與機會選擇
  const loadRiskOpportunitySelections = async () => {
    if (!assessment) return;
    
    try {
      const { data, error } = await supabase
        .from('tcfd_risk_opportunity_selections')
        .select('*')
        .eq('assessment_id', assessment.id);

      if (error) throw error;
      setRiskOpportunitySelections(data as RiskOpportunitySelection[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // 儲存情境評估
  const saveScenarioEvaluation = async (evaluation: Omit<ScenarioEvaluation, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tcfd_scenario_evaluations')
        .insert(evaluation)
        .select()
        .single();

      if (error) throw error;
      setScenarioEvaluations(prev => [...prev, data as ScenarioEvaluation]);
      return data as ScenarioEvaluation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // 載入情境評估
  const loadScenarioEvaluations = async () => {
    if (!assessment) return;
    
    try {
      const { data, error } = await supabase
        .from('tcfd_scenario_evaluations')
        .select('*')
        .eq('assessment_id', assessment.id);

      if (error) throw error;
      setScenarioEvaluations(data as ScenarioEvaluation[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // 儲存策略分析
  const saveStrategyAnalysis = async (analysis: Omit<StrategyAnalysis, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tcfd_strategy_analysis')
        .insert(analysis)
        .select()
        .single();

      if (error) throw error;
      setStrategyAnalysis(prev => [...prev, data as StrategyAnalysis]);
      return data as StrategyAnalysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // 載入策略分析
  const loadStrategyAnalysis = async () => {
    if (!assessment) return;
    
    try {
      const { data, error } = await supabase
        .from('tcfd_strategy_analysis')
        .select('*')
        .eq('assessment_id', assessment.id);

      if (error) throw error;
      setStrategyAnalysis(data as StrategyAnalysis[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // 生成並儲存報告
  const generateReport = async (reportData: Omit<TCFDReport, 'id' | 'generated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tcfd_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      setReport(data as TCFDReport);
      return data as TCFDReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // 載入報告
  const loadReport = async () => {
    if (!assessment) return;
    
    try {
      const { data, error } = await supabase
        .from('tcfd_reports')
        .select('*')
        .eq('assessment_id', assessment.id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setReport(data as TCFDReport | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

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

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (assessment) {
      loadAllData();
    }
  }, [assessment]);

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
  };
};
