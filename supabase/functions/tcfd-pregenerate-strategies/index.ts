
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDUSTRIES = ['restaurant', 'retail', 'manufacturing', 'construction', 'transportation', 'technology', 'finance', 'healthcare', 'education', 'hospitality'];
const COMPANY_SIZES = ['small', 'medium', 'large'];

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

    const { batchSize = 50, specificIndustry, specificSize } = await req.json();

    console.log('開始批量預先生成策略...');

    const allCombinations = [];
    const industriesToProcess = specificIndustry ? [specificIndustry] : INDUSTRIES;
    const sizesToProcess = specificSize ? [specificSize] : COMPANY_SIZES;
    const allCategories = [...RISK_CATEGORIES, ...OPPORTUNITY_CATEGORIES];

    // 生成所有組合
    for (const industry of industriesToProcess) {
      for (const size of sizesToProcess) {
        for (const category of allCategories) {
          for (const subcategory of category.subcategories) {
            allCombinations.push({
              industry,
              companySize: size,
              categoryType: category.type,
              categoryName: category.category,
              subcategoryName: subcategory
            });
          }
        }
      }
    }

    console.log(`總共需要生成 ${allCombinations.length} 個策略組合`);

    let processed = 0;
    let generated = 0;
    let cached = 0;
    const errors = [];

    // 分批處理，避免超時
    for (let i = 0; i < Math.min(batchSize, allCombinations.length); i++) {
      const combination = allCombinations[i];
      const cacheKey = `${combination.categoryType}_${combination.categoryName}_${combination.subcategoryName}_${combination.industry}_${combination.companySize}`;

      try {
        console.log(`處理組合 ${i + 1}/${Math.min(batchSize, allCombinations.length)}: ${cacheKey}`);

        // 檢查是否已存在
        const { data: existing } = await supabase
          .from('tcfd_strategy_cache')
          .select('id')
          .eq('cache_key', cacheKey)
          .single();

        if (existing) {
          console.log('已存在快取，跳過');
          cached++;
        } else {
          // 調用策略快取API生成策略
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
            if (result.success) {
              generated++;
              console.log('策略生成成功');
            } else {
              throw new Error(result.error || '策略生成失敗');
            }
          } else {
            throw new Error(`API 請求失敗: ${response.status}`);
          }
        }

        processed++;

      } catch (error) {
        console.error(`組合 ${cacheKey} 處理失敗:`, error);
        errors.push({ combination: cacheKey, error: error.message });
      }

      // 每處理10個組合就稍作休息，避免API限制
      if ((i + 1) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const summary = {
      totalCombinations: allCombinations.length,
      processed,
      generated,
      cached,
      errors: errors.length,
      errorDetails: errors.slice(0, 5) // 只返回前5個錯誤詳情
    };

    console.log('批量預先生成完成:', summary);

    return new Response(JSON.stringify({ 
      success: true, 
      summary,
      message: `成功處理 ${processed} 個組合，其中 ${generated} 個新生成，${cached} 個已快取`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('批量預先生成錯誤:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
