
import { supabase } from '@/integrations/supabase/client';

export const generateComprehensiveScenarioAnalysis = async (
  categoryType: 'risk' | 'opportunity',
  categoryName: string,
  subcategoryName: string,
  scenarioDescription: string,
  userScore: number,
  industry: string,
  companySize: string
): Promise<any> => {
  console.log('Calling TCFD LLM generator for comprehensive scenario analysis:', { 
    categoryType, 
    categoryName, 
    subcategoryName, 
    scenarioDescription, 
    userScore, 
    industry, 
    companySize 
  });
  
  const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
    body: {
      type: 'comprehensive_scenario_analysis',
      categoryType,
      categoryName,
      subcategoryName,
      scenarioDescription,
      userScore,
      industry,
      companySize
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

  console.log('Generated comprehensive scenario analysis:', data.content);
  return data.content;
};
