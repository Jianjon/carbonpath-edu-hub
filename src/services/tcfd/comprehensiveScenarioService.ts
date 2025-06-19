
import { supabase } from '@/integrations/supabase/client';

interface ComprehensiveScenarioAnalysis {
  scenario_summary: string;
  financial_impact: {
    profit_loss: {
      description: string;
      impact_direction: string;
      amount_estimate: string;
      timeframe: string;
      key_items: string[];
    };
    cash_flow: {
      description: string;
      impact_direction: string;
      amount_estimate: string;
      timeframe: string;
      key_items: string[];
    };
    balance_sheet: {
      description: string;
      impact_direction: string;
      amount_estimate: string;
      timeframe: string;
      key_items: string[];
    };
  };
  risk_strategies?: any;
  opportunity_strategies?: any;
}

export const generateComprehensiveScenarioAnalysis = async (
  categoryType: 'risk' | 'opportunity',
  categoryName: string,
  subcategoryName: string,
  scenarioDescription: string,
  userScore: number,
  industry: string,
  companySize: string,
  businessDescription?: string,
  userCustomInputs?: any
): Promise<ComprehensiveScenarioAnalysis> => {
  console.log('呼叫LLM生成綜合分析，包含使用者自訂內容');
  
  const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
    body: {
      type: 'comprehensive_scenario_analysis',
      category_type: categoryType,
      category_name: categoryName,
      subcategory_name: subcategoryName,
      scenario_description: scenarioDescription,
      user_score: userScore,
      industry: industry,
      company_size: companySize,
      business_description: businessDescription,
      user_custom_inputs: userCustomInputs
    }
  });

  if (error) {
    console.error('LLM生成綜合分析失敗:', error);
    throw error;
  }

  if (!data.success) {
    throw new Error(data.error || '綜合分析生成失敗');
  }

  return data.content;
};
