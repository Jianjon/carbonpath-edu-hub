
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDUSTRIES = ['restaurant', 'retail', 'manufacturing', 'construction', 'transportation', 'technology', 'finance', 'healthcare', 'education', 'hospitality'];
const COMPANY_SIZES = ['small', 'medium', 'large'];
const STRATEGY_TYPES = ['mitigate', 'transfer', 'accept', 'control', 'evaluate_explore', 'capability_building', 'business_transformation', 'cooperation_participation', 'aggressive_investment'];

const RISK_CATEGORIES = [
  { type: 'risk', category: '政策和法規', subcategories: ['碳定價', '排放報告義務', '產品和服務的監管'] },
  { type: 'risk', category: '技術', subcategories: ['低碳替代技術', '新技術投資', '現有產品和服務的成本'] },
  { type: 'risk', category: '市場', subcategories: ['客戶行為改變', '市場訊號不確定性', '原材料成本上升'] },
  { type: 'risk', category: '急性', subcategories: ['極端天氣事件的嚴重程度增加', '極端天氣事件的頻率增加'] },
  { type: 'risk', category: '慢性', subcategories: ['降雨模式改變', '平均氣溫上升', '海平面上升'] }
];

const OPPORTUNITY_CATEGORIES = [
  { type: 'opportunity', category: '資源效率', subcategories: ['更高效的運輸方式', '更高效的生產和配送流程', '回收利用'] },
  { type: 'opportunity', category: '能源來源', subcategories: ['使用低排放能源', '使用支持性政策激勵措施', '新技術的使用'] },
  { type: 'opportunity', category: '產品和服務', subcategories: ['開發和/或擴大低排放商品和服務', '開發氣候適應和保險風險解決方案', '研發和創新'] },
  { type: 'opportunity', category: '市場', subcategories: ['進入新市場', '公共部門激勵措施', '消費者偏好的轉變'] },
  { type: 'opportunity', category: '韌性', subcategories: ['透過供應鏈多樣化的資源替代和多樣化', '投資適應能力', '參與再生能源計畫和採用節能措施'] }
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

    const { 
      batchSize = 100, 
      specificIndustry, 
      specificSize,
      contentType = 'all' // 'scenarios', 'strategies', 'financial', 'all'
    } = await req.json();

    console.log('開始綜合預先生成內容...');

    const allCombinations = [];
    const industriesToProcess = specificIndustry ? [specificIndustry] : INDUSTRIES;
    const sizesToProcess = specificSize ? [specificSize] : COMPANY_SIZES;
    const allCategories = [...RISK_CATEGORIES, ...OPPORTUNITY_CATEGORIES];

    // 生成所有組合
    for (const industry of industriesToProcess) {
      for (const size of sizesToProcess) {
        for (const category of allCategories) {
          for (const subcategory of category.subcategories) {
            // 情境描述組合
            if (contentType === 'scenarios' || contentType === 'all') {
              allCombinations.push({
                type: 'scenario',
                industry,
                companySize: size,
                categoryType: category.type,
                categoryName: category.category,
                subcategoryName: subcategory
              });
            }

            // 策略組合
            if (contentType === 'strategies' || contentType === 'all') {
              allCombinations.push({
                type: 'strategy',
                industry,
                companySize: size,
                categoryType: category.type,
                categoryName: category.category,
                subcategoryName: subcategory
              });
            }

            // 財務分析組合
            if (contentType === 'financial' || contentType === 'all') {
              const relevantStrategies = category.type === 'risk' 
                ? ['mitigate', 'transfer', 'accept', 'control']
                : ['evaluate_explore', 'capability_building', 'business_transformation', 'cooperation_participation', 'aggressive_investment'];
              
              for (const strategyType of relevantStrategies) {
                allCombinations.push({
                  type: 'financial',
                  industry,
                  companySize: size,
                  categoryType: category.type,
                  categoryName: category.category,
                  subcategoryName: subcategory,
                  strategyType
                });
              }
            }
          }
        }
      }
    }

    console.log(`總共需要生成 ${allCombinations.length} 個內容組合`);

    let processed = 0;
    let generated = 0;
    let cached = 0;
    const errors = [];

    // 分批處理，避免超時
    for (let i = 0; i < Math.min(batchSize, allCombinations.length); i++) {
      const combination = allCombinations[i];
      
      try {
        console.log(`處理組合 ${i + 1}/${Math.min(batchSize, allCombinations.length)}: ${combination.type}`);

        let result;
        if (combination.type === 'scenario') {
          result = await generateScenarioContent(combination);
        } else if (combination.type === 'strategy') {
          result = await generateStrategyContent(combination);
        } else if (combination.type === 'financial') {
          result = await generateFinancialContent(combination);
        }

        if (result?.generated) {
          generated++;
        } else if (result?.cached) {
          cached++;
        }

        processed++;

      } catch (error) {
        console.error(`組合處理失敗:`, error);
        errors.push({ combination, error: error.message });
      }

      // 每處理10個組合就稍作休息，避免API限制
      if ((i + 1) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const summary = {
      totalCombinations: allCombinations.length,
      processed,
      generated,
      cached,
      errors: errors.length,
      errorDetails: errors.slice(0, 5)
    };

    console.log('綜合預先生成完成:', summary);

    return new Response(JSON.stringify({ 
      success: true, 
      summary,
      message: `成功處理 ${processed} 個組合，其中 ${generated} 個新生成，${cached} 個已快取`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('綜合預先生成錯誤:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateScenarioContent(combination: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tcfd-scenario-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        categoryType: combination.categoryType,
        categoryName: combination.categoryName,
        subcategoryName: combination.subcategoryName,
        industry: combination.industry,
        companySize: combination.companySize
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { 
        generated: result.source === 'generated',
        cached: result.source === 'cache'
      };
    } else {
      throw new Error(`API 請求失敗: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`情境生成失敗: ${error.message}`);
  }
}

async function generateStrategyContent(combination: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tcfd-strategy-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        categoryType: combination.categoryType,
        categoryName: combination.categoryName,
        subcategoryName: combination.subcategoryName,
        industry: combination.industry,
        companySize: combination.companySize
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { 
        generated: result.source === 'generated',
        cached: result.source === 'cache'
      };
    } else {
      throw new Error(`API 請求失敗: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`策略生成失敗: ${error.message}`);
  }
}

async function generateFinancialContent(combination: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tcfd-financial-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        categoryType: combination.categoryType,
        categoryName: combination.categoryName,
        subcategoryName: combination.subcategoryName,
        industry: combination.industry,
        companySize: combination.companySize,
        strategyType: combination.strategyType,
        scenarioDescription: '預設情境描述',
        companyProfile: {}
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { 
        generated: result.source === 'generated',
        cached: result.source === 'cache'
      };
    } else {
      throw new Error(`API 請求失敗: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`財務分析生成失敗: ${error.message}`);
  }
}
