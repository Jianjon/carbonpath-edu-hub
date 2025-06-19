
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BatchGenerationRequest {
  industry?: string;
  company_size?: string;
  count?: number;
}

const INDUSTRIES = [
  { value: 'restaurant', label: '餐飲業' },
  { value: 'retail', label: '零售業' },
  { value: 'manufacturing', label: '製造業' },
  { value: 'construction', label: '營建業' },
  { value: 'transportation', label: '運輸業' },
  { value: 'technology', label: '科技業' },
  { value: 'finance', label: '金融業' },
  { value: 'healthcare', label: '醫療保健' },
  { value: 'education', label: '教育服務' },
  { value: 'hospitality', label: '旅宿業' },
];

const COMPANY_SIZES = [
  { value: 'small', label: '小型企業（50人以下）' },
  { value: 'medium', label: '中型企業（50-250人）' },
  { value: 'large', label: '大型企業（250人以上）' },
];

const RISK_CATEGORIES = [
  'transition_policy',
  'transition_technology', 
  'transition_market',
  'physical_acute',
  'physical_chronic'
];

const OPPORTUNITY_CATEGORIES = [
  'opportunity_resource_efficiency',
  'opportunity_energy_source',
  'opportunity_products_services',
  'opportunity_markets',
  'opportunity_resilience'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { industry, company_size, count = 1 }: BatchGenerationRequest = await req.json();
    
    console.log(`開始批量生成：產業=${industry || '全部'}, 規模=${company_size || '全部'}, 數量=${count}`);

    const results = [];
    let generatedCount = 0;

    // 確定要生成的組合
    const industriesToGenerate = industry ? [industry] : INDUSTRIES.map(i => i.value);
    const sizesToGenerate = company_size ? [company_size] : COMPANY_SIZES.map(s => s.value);

    for (const ind of industriesToGenerate) {
      for (const size of sizesToGenerate) {
        if (generatedCount >= count) break;

        console.log(`生成 ${ind} - ${size} 的示範數據`);
        
        try {
          // 第1階段：創建基礎評估
          const assessment = await createDemoAssessment(supabase, ind, size);
          
          // 第2階段：生成風險機會選擇
          await generateRiskOpportunitySelections(supabase, assessment.id, ind);
          
          // 第3階段：生成情境評估
          await generateScenarioEvaluations(supabase, assessment.id, ind);
          
          // 第4階段：生成策略分析
          await generateStrategyAnalysis(supabase, assessment.id, ind);
          
          // 第5階段：生成報告
          await generateTCFDReport(supabase, assessment.id, ind, size);
          
          results.push({ industry: ind, company_size: size, assessment_id: assessment.id });
          generatedCount++;
          
          console.log(`完成 ${ind} - ${size} 的示範數據生成`);
          
        } catch (error) {
          console.error(`生成 ${ind} - ${size} 失敗:`, error);
          results.push({ industry: ind, company_size: size, error: error.message });
        }
      }
      if (generatedCount >= count) break;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        generated: generatedCount,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('批量生成錯誤:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function createDemoAssessment(supabase: any, industry: string, company_size: string) {
  const industryData = getIndustrySpecificData(industry);
  
  const { data, error } = await supabase
    .from('tcfd_assessments')
    .insert({
      user_id: '00000000-0000-0000-0000-000000000000', // 示範用戶ID
      industry,
      company_size,
      has_carbon_inventory: industryData.has_carbon_inventory,
      has_international_operations: industryData.has_international_operations,
      annual_revenue_range: getRevenueRange(company_size),
      supply_chain_carbon_disclosure: industryData.supply_chain_disclosure,
      has_sustainability_team: getSustainabilityTeam(company_size),
      main_emission_source: industryData.main_emission_source,
      business_description: industryData.business_description,
      current_stage: 5, // 完整流程
      status: 'completed',
      is_demo_data: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function generateRiskOpportunitySelections(supabase: any, assessmentId: string, industry: string) {
  const selections = getIndustryRiskOpportunities(industry);
  
  const { error } = await supabase
    .from('tcfd_risk_opportunity_selections')
    .insert(selections.map(sel => ({
      assessment_id: assessmentId,
      category_type: sel.category_type,
      category_name: sel.category_name,
      subcategory_name: sel.subcategory_name,
      selected: true,
      is_demo_data: true
    })));

  if (error) throw error;
}

async function generateScenarioEvaluations(supabase: any, assessmentId: string, industry: string) {
  // 獲取已選擇的風險機會
  const { data: selections } = await supabase
    .from('tcfd_risk_opportunity_selections')
    .select('*')
    .eq('assessment_id', assessmentId)
    .eq('selected', true);

  if (!selections) return;

  for (const selection of selections) {
    const scenarioData = await generateScenarioWithLLM(industry, selection);
    
    const { error } = await supabase
      .from('tcfd_scenario_evaluations')
      .insert({
        assessment_id: assessmentId,
        risk_opportunity_id: selection.id,
        scenario_description: scenarioData.scenario_description,
        scenario_generated_by_llm: true,
        user_score: scenarioData.likelihood_score,
        llm_response: scenarioData.analysis,
        is_demo_data: true
      });

    if (error) throw error;
  }
}

async function generateStrategyAnalysis(supabase: any, assessmentId: string, industry: string) {
  // 獲取情境評估
  const { data: scenarios } = await supabase
    .from('tcfd_scenario_evaluations')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (!scenarios) return;

  for (const scenario of scenarios) {
    const strategyData = await generateStrategyWithLLM(industry, scenario);
    
    const { error } = await supabase
      .from('tcfd_strategy_analysis')
      .insert({
        assessment_id: assessmentId,
        scenario_evaluation_id: scenario.id,
        detailed_description: strategyData.detailed_description,
        financial_impact_pnl: strategyData.financial_impact_pnl,
        financial_impact_cashflow: strategyData.financial_impact_cashflow,
        financial_impact_balance_sheet: strategyData.financial_impact_balance_sheet,
        strategy_avoid: strategyData.strategy_avoid,
        strategy_accept: strategyData.strategy_accept,
        strategy_transfer: strategyData.strategy_transfer,
        strategy_mitigate: strategyData.strategy_mitigate,
        selected_strategy: strategyData.selected_strategy,
        generated_by_llm: true,
        is_demo_data: true
      });

    if (error) throw error;
  }
}

async function generateTCFDReport(supabase: any, assessmentId: string, industry: string, company_size: string) {
  const reportData = await generateReportWithLLM(industry, company_size);
  
  const { error } = await supabase
    .from('tcfd_reports')
    .insert({
      assessment_id: assessmentId,
      governance_content: reportData.governance_content,
      strategy_content: reportData.strategy_content,
      risk_management_content: reportData.risk_management_content,
      metrics_targets_content: reportData.metrics_targets_content,
      disclosure_matrix: reportData.disclosure_matrix,
      report_format_content: reportData.report_format_content,
      json_output: reportData,
      is_demo_data: true
    });

  if (error) throw error;
}

// 輔助函數
function getIndustrySpecificData(industry: string) {
  const data: any = {
    restaurant: {
      has_carbon_inventory: false,
      has_international_operations: false,
      supply_chain_disclosure: 'no',
      main_emission_source: 'electricity',
      business_description: '提供餐飲服務，包含食材採購、烹飪製作及現場服務'
    },
    retail: {
      has_carbon_inventory: true,
      has_international_operations: true,
      supply_chain_disclosure: 'yes',
      main_emission_source: 'logistics',
      business_description: '從事商品零售業務，包含採購、倉儲、物流及銷售'
    },
    manufacturing: {
      has_carbon_inventory: true,
      has_international_operations: true,
      supply_chain_disclosure: 'yes',
      main_emission_source: 'process',
      business_description: '製造業務包含原料加工、產品製造及品質控制'
    }
  };
  
  return data[industry] || data.manufacturing;
}

function getRevenueRange(company_size: string) {
  const ranges: any = {
    small: 'small',
    medium: 'medium', 
    large: 'large'
  };
  return ranges[company_size] || 'medium';
}

function getSustainabilityTeam(company_size: string) {
  const teams: any = {
    small: 'no',
    medium: 'planning',
    large: 'yes'
  };
  return teams[company_size] || 'planning';
}

function getIndustryRiskOpportunities(industry: string) {
  // 根據產業特性選擇相關的風險機會
  const baseSelections = [
    { category_type: 'risk', category_name: '政策和法規', subcategory_name: null },
    { category_type: 'risk', category_name: '市場', subcategory_name: null },
    { category_type: 'risk', category_name: '急性', subcategory_name: null },
    { category_type: 'opportunity', category_name: '資源效率', subcategory_name: null },
    { category_type: 'opportunity', category_name: '能源來源', subcategory_name: null }
  ];
  
  return baseSelections;
}

async function generateScenarioWithLLM(industry: string, selection: any) {
  // 調用現有的 LLM 生成服務
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tcfd-llm-generator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      type: 'scenario_analysis',
      industry,
      category: selection.category_name,
      category_type: selection.category_type
    })
  });
  
  const data = await response.json();
  return {
    scenario_description: data.scenario_description || '預設情境描述',
    likelihood_score: Math.floor(Math.random() * 5) + 1,
    analysis: data.analysis || '預設分析內容'
  };
}

async function generateStrategyWithLLM(industry: string, scenario: any) {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tcfd-llm-generator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      type: 'strategy_analysis',
      industry,
      scenario_description: scenario.scenario_description
    })
  });
  
  const data = await response.json();
  return {
    detailed_description: data.detailed_description || '詳細策略分析',
    financial_impact_pnl: data.financial_impact_pnl || '對損益表的財務影響',
    financial_impact_cashflow: data.financial_impact_cashflow || '對現金流的財務影響',
    financial_impact_balance_sheet: data.financial_impact_balance_sheet || '對資產負債表的財務影響',
    strategy_avoid: data.strategy_avoid || '規避策略',
    strategy_accept: data.strategy_accept || '接受策略',
    strategy_transfer: data.strategy_transfer || '轉移策略',
    strategy_mitigate: data.strategy_mitigate || '減緩策略',
    selected_strategy: 'mitigate'
  };
}

async function generateReportWithLLM(industry: string, company_size: string) {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tcfd-llm-generator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      type: 'tcfd_report',
      industry,
      company_size
    })
  });
  
  const data = await response.json();
  return {
    governance_content: data.governance_content || '治理相關內容',
    strategy_content: data.strategy_content || '策略相關內容',
    risk_management_content: data.risk_management_content || '風險管理相關內容',
    metrics_targets_content: data.metrics_targets_content || '指標與目標相關內容',
    disclosure_matrix: data.disclosure_matrix || {},
    report_format_content: data.report_format_content || '完整報告內容'
  };
}
