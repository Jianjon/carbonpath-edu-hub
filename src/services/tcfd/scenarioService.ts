
import { supabase } from '@/integrations/supabase/client';
import { ScenarioEvaluation } from '@/types/tcfd';

export const saveScenarioEvaluation = async (
  evaluation: Omit<ScenarioEvaluation, 'id' | 'created_at'>
): Promise<ScenarioEvaluation> => {
  // 檢查是否已存在相同的評估
  const { data: existingEvaluations, error: checkError } = await supabase
    .from('tcfd_scenario_evaluations')
    .select('*')
    .eq('assessment_id', evaluation.assessment_id)
    .eq('risk_opportunity_id', evaluation.risk_opportunity_id);

  if (checkError) throw checkError;

  // 如果已存在，更新現有記錄
  if (existingEvaluations && existingEvaluations.length > 0) {
    const { data, error } = await supabase
      .from('tcfd_scenario_evaluations')
      .update(evaluation)
      .eq('id', existingEvaluations[0].id)
      .select()
      .single();

    if (error) throw error;
    return data as ScenarioEvaluation;
  }

  // 否則創建新記錄
  const { data, error } = await supabase
    .from('tcfd_scenario_evaluations')
    .insert(evaluation)
    .select()
    .single();

  if (error) throw error;
  return data as ScenarioEvaluation;
};

export const loadScenarioEvaluations = async (assessmentId: string): Promise<ScenarioEvaluation[]> => {
  const { data, error } = await supabase
    .from('tcfd_scenario_evaluations')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ScenarioEvaluation[];
};

export const generateScenarioWithLLM = async (
  categoryType: 'risk' | 'opportunity',
  categoryName: string,
  subcategoryName: string,
  industry: string
): Promise<{ scenario_description: string }> => {
  console.log('呼叫LLM生成情境:', { categoryType, categoryName, subcategoryName, industry });
  
  const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
    body: {
      type: 'generate_scenario',
      category_type: categoryType,
      category_name: categoryName,
      subcategory_name: subcategoryName,
      industry: industry
    }
  });

  if (error) {
    console.error('LLM生成情境失敗:', error);
    throw error;
  }

  return data;
};

export const generateScenarioAnalysisWithLLM = async (
  scenarioDescription: string,
  userScore: number,
  industry: string
): Promise<any> => {
  console.log('呼叫LLM生成情境分析:', { scenarioDescription, userScore, industry });
  
  const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
    body: {
      type: 'analyze_scenario',
      scenario_description: scenarioDescription,
      user_score: userScore,
      industry: industry
    }
  });

  if (error) {
    console.error('LLM生成情境分析失敗:', error);
    throw error;
  }

  return data;
};

// 檢查是否已有相同參數的評估
export const checkExistingEvaluation = async (
  assessmentId: string,
  riskOpportunityId: string,
  userScore: number,
  scenarioDescription: string
): Promise<ScenarioEvaluation | null> => {
  const { data, error } = await supabase
    .from('tcfd_scenario_evaluations')
    .select('*')
    .eq('assessment_id', assessmentId)
    .eq('risk_opportunity_id', riskOpportunityId)
    .eq('user_score', userScore)
    .eq('scenario_description', scenarioDescription)
    .maybeSingle();

  if (error) {
    console.error('檢查現有評估失敗:', error);
    return null;
  }

  return data as ScenarioEvaluation | null;
};
