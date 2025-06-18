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

  // 生成 LLM 情境內容
  const generateScenarioWithLLM = async (
    categoryType: 'risk' | 'opportunity',
    categoryName: string,
    subcategoryName: string,
    industry: string
  ) => {
    try {
      const prompt = `你是一位熟悉氣候相關財務揭露（TCFD）的專業顧問。

請為以下條件生成一個具體的氣候${categoryType === 'risk' ? '風險' : '機會'}情境描述：

類型: ${categoryType === 'risk' ? '風險' : '機會'}
分類: ${categoryName}
子分類: ${subcategoryName}
產業: ${industry}

請生成一段 100-150 字的具體情境描述，需要：
1. 符合 TCFD 框架
2. 針對該產業的實際營運情況
3. 描述具體的氣候變化如何影響業務
4. 語氣專業中立

情境描述：`;

      // 這裡會調用 LLM API，目前返回模擬內容
      const mockResponse = `針對${industry}在${categoryName}的${subcategoryName}方面，${
        categoryType === 'risk' 
          ? '面臨的主要風險在於政策變化可能導致營運成本增加，同時需要投入額外資源進行合規管理，對短期獲利能力造成壓力。'
          : '具備轉型機會，能夠透過採用新技術或商業模式，在降低環境影響的同時創造新的收入來源，並提升市場競爭力。'
      }企業需要評估相關財務影響並制定適當的應對策略。`;

      return mockResponse;
    } catch (err) {
      throw new Error('LLM 生成失敗');
    }
  };

  // 生成策略與財務分析
  const generateStrategyAnalysisWithLLM = async (
    scenarioDescription: string,
    userScore: number,
    industry: string
  ) => {
    try {
      const prompt = `針對以下風險/機會情境，請生成詳細的策略與財務分析：

情境描述: ${scenarioDescription}
影響評分: ${userScore}/3 分
產業: ${industry}

請按照以下格式輸出：

詳細說明:
[對該情境的深入分析]

財務影響:
- 損益表: [具體影響說明]
- 現金流: [現金流影響分析]
- 資產負債表: [資產負債影響說明]

應對策略:
- 避免策略: [具體作法與效益]
- 減緩策略: [具體作法與效益]
- 轉移策略: [具體作法與效益]
- 承擔策略: [具體作法與效益]

建議追蹤指標:
[關鍵績效指標建議]`;

      // 模擬 LLM 回應
      const mockAnalysis = {
        detailed_description: `此情境對${industry}具有${userScore === 3 ? '高度' : userScore === 2 ? '中度' : '低度'}影響。企業需要制定完整的應對計畫以降低潛在風險並把握轉型機會。`,
        financial_impact_pnl: `預估對年度損益的影響約為營收的 ${userScore * 2}%，主要來自於營運成本變化與新投資需求。`,
        financial_impact_cashflow: `短期現金流可能受到 ${userScore * 1.5}% 的影響，需要預留充足的營運資金。`,
        financial_impact_balance_sheet: `可能需要增加 ${userScore * 3}% 的資本支出用於設備升級或風險管理措施。`,
        strategy_avoid: '透過技術升級和流程改善，降低暴露風險，預估投資回收期 2-3 年。',
        strategy_accept: '接受當前風險水準，但建立監控機制並準備應急計畫。',
        strategy_transfer: '透過保險或外包等方式轉移部分風險，年度成本約為潛在損失的 10-15%。',
        strategy_mitigate: '實施漸進式改善措施，在 3-5 年內逐步降低風險暴露程度。'
      };

      return mockAnalysis;
    } catch (err) {
      throw new Error('策略分析生成失敗');
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
