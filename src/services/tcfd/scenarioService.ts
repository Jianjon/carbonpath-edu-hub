
import { supabase } from '@/integrations/supabase/client';
import { ScenarioEvaluation } from '@/types/tcfd';

export const saveScenarioEvaluation = async (
  evaluation: Omit<ScenarioEvaluation, 'id' | 'created_at'>
): Promise<ScenarioEvaluation> => {
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
    .eq('assessment_id', assessmentId);

  if (error) throw error;
  return data as ScenarioEvaluation[];
};

export const generateScenarioWithLLM = async (
  categoryType: 'risk' | 'opportunity',
  categoryName: string,
  subcategoryName: string,
  industry: string
): Promise<string> => {
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
};
