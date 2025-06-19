
import { supabase } from '@/integrations/supabase/client';
import { StrategyAnalysis } from '@/types/tcfd';

export const saveStrategyAnalysis = async (
  analysis: Omit<StrategyAnalysis, 'id' | 'created_at'>
): Promise<StrategyAnalysis> => {
  const { data, error } = await supabase
    .from('tcfd_strategy_analysis')
    .insert(analysis)
    .select()
    .single();

  if (error) throw error;
  return data as StrategyAnalysis;
};

export const loadStrategyAnalysis = async (assessmentId: string): Promise<StrategyAnalysis[]> => {
  const { data, error } = await supabase
    .from('tcfd_strategy_analysis')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (error) throw error;
  return data as StrategyAnalysis[];
};

export const generateStrategyAnalysisWithLLM = async (
  scenarioDescription: string,
  userScore: number,
  industry: string
): Promise<any> => {
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
};
