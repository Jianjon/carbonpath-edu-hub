import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TCFDAssessment, RiskOpportunitySelection, ScenarioEvaluation, StrategyAnalysis, TCFDReport } from '@/types/tcfd';

export const useTCFDAssessment = (assessmentId?: string) => {
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
    has_international_operations?: boolean;
    annual_revenue_range?: string;
    supply_chain_carbon_disclosure?: string;
    has_sustainability_team?: string;
    main_emission_source?: string;
    business_description?: string;
    user_id: string;
  }) => {
    setLoading(true);
    try {
      const { data: newAssessment, error } = await supabase
        .from('tcfd_assessments')
        .insert({
          user_id: data.user_id,
          industry: data.industry,
          company_size: data.company_size,
          has_carbon_inventory: data.has_carbon_inventory,
          has_international_operations: data.has_international_operations,
          annual_revenue_range: data.annual_revenue_range,
          supply_chain_carbon_disclosure: data.supply_chain_carbon_disclosure,
          has_sustainability_team: data.has_sustainability_team,
          main_emission_source: data.main_emission_source,
          business_description: data.business_description,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setAssessment(newAssessment as TCFDAssessment);
      return newAssessment as TCFDAssessment;
    } catch (err) {
      console.error('Create assessment error:', err);
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

  // 生成 LLM 情境內容 - 呼叫真實的 OpenAI API
  const generateScenarioWithLLM = async (
    categoryType: 'risk' | 'opportunity',
    categoryName: string,
    subcategoryName: string,
    industry: string
  ) => {
    try {
      console.log('Calling TCFD LLM generator for scenario:', { categoryType, categoryName, subcategoryName, industry });
      
      const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
        body: {
          type: 'scenario',
          categoryType,
          categoryName,
          subcategoryName,
          industry
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`API 呼叫失敗: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('API response error:', data);
        throw new Error(`API 回應錯誤: ${data?.error || '未知錯誤'}`);
      }

      console.log('Generated scenario:', data.content);
      return data.content;
    } catch (err) {
      console.error('Error in generateScenarioWithLLM:', err);
      throw new Error(err instanceof Error ? err.message : 'LLM 情境生成失敗');
    }
  };

  // 生成策略與財務分析 - 呼叫真實的 OpenAI API
  const generateStrategyAnalysisWithLLM = async (
    scenarioDescription: string,
    userScore: number,
    industry: string
  ) => {
    try {
      console.log('Calling TCFD LLM generator for strategy analysis:', { scenarioDescription, userScore, industry });
      
      const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
        body: {
          type: 'strategy',
          scenarioDescription,
          userScore,
          industry
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`API 呼叫失敗: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('API response error:', data);
        throw new Error(`API 回應錯誤: ${data?.error || '未知錯誤'}`);
      }

      console.log('Generated strategy analysis:', data.content);
      return data.content;
    } catch (err) {
      console.error('Error in generateStrategyAnalysisWithLLM:', err);
      throw new Error(err instanceof Error ? err.message : '策略分析生成失敗');
    }
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
    generateScenarioWithLLM,
    generateStrategyAnalysisWithLLM,
  };
};
