
import { supabase } from '@/integrations/supabase/client';

interface ComprehensiveScenarioAnalysis {
  impact_assessment: string;
  recommended_strategy: string;
  time_horizon: string;
  financial_implications: string;
  risk_level: string;
  likelihood: string;
  adaptation_measures: string;
  monitoring_indicators: string;
}

export const generateComprehensiveScenarioAnalysis = async (
  categoryType: 'risk' | 'opportunity',
  categoryName: string,
  subcategoryName: string,
  scenarioDescription: string,
  userScore: number,
  industry: string,
  companySize: string
): Promise<ComprehensiveScenarioAnalysis> => {
  // 先檢查是否已有相同參數的分析
  const cacheKey = `${categoryType}-${categoryName}-${subcategoryName}-${userScore}-${industry}-${companySize}`;
  console.log('檢查快取:', cacheKey);

  // 這裡可以從資料庫檢查是否已有相同參數的分析
  const { data: existingAnalysis, error: cacheError } = await supabase
    .from('tcfd_scenario_evaluations')
    .select('llm_response')
    .eq('scenario_description', scenarioDescription)
    .eq('user_score', userScore)
    .not('llm_response', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!cacheError && existingAnalysis && existingAnalysis.llm_response) {
    console.log('使用快取的分析結果');
    try {
      return JSON.parse(existingAnalysis.llm_response);
    } catch (parseError) {
      console.warn('解析快取分析失敗，將重新生成:', parseError);
    }
  }

  console.log('呼叫LLM生成綜合分析');
  
  const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
    body: {
      type: 'comprehensive_scenario_analysis',
      category_type: categoryType,
      category_name: categoryName,
      subcategory_name: subcategoryName,
      scenario_description: scenarioDescription,
      user_score: userScore,
      industry: industry,
      company_size: companySize
    }
  });

  if (error) {
    console.error('LLM生成綜合分析失敗:', error);
    throw error;
  }

  return data;
};
