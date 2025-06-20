import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      categoryType, 
      categoryName, 
      subcategoryName, 
      industry, 
      scenarioDescription, 
      userScore, 
      companySize,
      businessDescription,
      userCustomInputs
    } = await req.json();

    console.log('Request type:', type);
    console.log('Request data:', { 
      categoryType, 
      categoryName, 
      subcategoryName, 
      industry, 
      scenarioDescription, 
      userScore, 
      companySize,
      businessDescription,
      userCustomInputs
    });

    let prompt = '';
    let systemPrompt = '';

    if (type === 'scenario') {
      // 情境生成 Prompt
      systemPrompt = `你是一位熟悉氣候相關財務揭露（TCFD）的專業顧問。請根據 TCFD 官方框架，為特定產業生成具體且實用的氣候情境描述。`;
      
      prompt = `請為以下條件生成一個具體的氣候${categoryType === 'risk' ? '風險' : '機會'}情境描述：

類型: ${categoryType === 'risk' ? '風險' : '機會'}
分類: ${categoryName}
子分類: ${subcategoryName}
產業: ${industry}

請生成一段 100-150 字的具體情境描述，需要：
1. 符合 TCFD 框架要求
2. 針對${industry}的實際營運情況
3. 描述具體的氣候變化如何影響業務運作
4. 語氣專業中性，避免過度誇大或輕描淡寫
5. 包含可能的時間框架和影響範圍

請直接提供情境描述內容，不需要額外說明：`;

    } else if (type === 'comprehensive_scenario_analysis') {
      // 全新的綜合情境分析生成，包含使用者自訂內容
      systemPrompt = `你是一位專精於氣候風險管理、財務分析和策略規劃的 TCFD 專業顧問。請根據具體的風險/機會情境、企業規模、產業特性以及使用者提供的自訂資訊，提供量身定制的財務影響分析和管理策略建議。每個策略都必須針對該特定情境和使用者輸入設計，而非通用模板。`;
      
      // 構建包含使用者自訂內容的詳細描述
      let contextualInfo = '';
      if (businessDescription) {
        contextualInfo += `\n企業描述: ${businessDescription}`;
      }
      if (userCustomInputs) {
        if (userCustomInputs.user_notes) {
          contextualInfo += `\n使用者補充說明: ${userCustomInputs.user_notes}`;
        }
        if (userCustomInputs.scenario_modifications) {
          contextualInfo += `\n情境描述修改: ${userCustomInputs.scenario_modifications}`;
        }
        if (userCustomInputs.business_context) {
          contextualInfo += `\n商業背景資訊: ${userCustomInputs.business_context}`;
        }
      }

      // 根據風險或機會類型提供不同的策略選項
      const strategiesSection = categoryType === 'risk' ? 
        `"risk_strategies": {
          "mitigate": {
            "title": "減緩策略",
            "description": "針對「${subcategoryName}」風險的具體減緩措施，考慮${companySize}企業的實際能力和${industry}產業特性（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "cost_estimate": "實施成本估算（依企業規模調整）",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該情境的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "針對該特定風險的預期效果描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          },
          "transfer": {
            "title": "轉移策略",
            "description": "針對「${subcategoryName}」風險的具體轉移作法，適合${companySize}企業在${industry}產業的應用（150-200字）", 
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "cost_estimate": "實施成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該情境的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "針對該特定風險的預期效果描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          },
          "accept": {
            "title": "接受策略",
            "description": "針對「${subcategoryName}」風險的具體接受作法，考慮${companySize}企業的風險承受能力（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "cost_estimate": "實施成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該情境的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "針對該特定風險的預期效果描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          },
          "control": {
            "title": "控制策略",
            "description": "針對「${subcategoryName}」風險的具體控制作法，適合${industry}產業的監控與管理機制（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "cost_estimate": "實施成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該情境的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "針對該特定風險的預期效果描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          }
        }` :
        `"opportunity_strategies": {
          "evaluate_explore": {
            "title": "評估探索策略",
            "description": "針對「${subcategoryName}」機會的具體評估探索作法，適合${companySize}企業在${industry}產業的應用（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "investment_estimate": "投資成本估算（依企業規模調整）",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_benefits": "針對該特定機會的預期效益描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          },
          "capability_building": {
            "title": "能力建設策略",
            "description": "針對「${subcategoryName}」機會的具體能力建設作法，考慮${companySize}企業的資源配置（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "investment_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_benefits": "針對該特定機會的預期效益描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          },
          "business_transformation": {
            "title": "商業轉換策略",
            "description": "針對「${subcategoryName}」機會的具體商業轉換作法，適合${industry}產業的轉型路徑（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "investment_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_benefits": "針對該特定機會的預期效益描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          },
          "cooperation_participation": {
            "title": "合作參與策略",
            "description": "針對「${subcategoryName}」機會的具體合作參與作法，考慮${companySize}企業的合作能力（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "investment_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_benefits": "針對該特定機會的預期效益描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          },
          "aggressive_investment": {
            "title": "積極投入策略",
            "description": "針對「${subcategoryName}」機會的具體積極投入作法，適合有充足資源的${companySize}企業（150-200字）",
            "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
            "investment_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
            "implementation_timeline": "預估實施時間",
            "expected_benefits": "針對該特定機會的預期效益描述",
            "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
          }
        }`;
      
      prompt = `針對以下${categoryType === 'risk' ? '風險' : '機會'}情境，請提供專屬且完整的財務影響分析和管理策略建議：

情境分類: ${categoryName} - ${subcategoryName}
情境描述: ${scenarioDescription}
影響評分: ${userScore}/10 分
產業: ${industry}
企業規模: ${companySize}${contextualInfo}

請按照以下 JSON 格式提供詳細回應，所有策略內容都必須針對「${subcategoryName}」這個特定情境以及使用者提供的背景資訊量身定制：

{
  "scenario_summary": "一句話概括「${subcategoryName}」情境的背景與${categoryType === 'risk' ? '風險' : '機會'}重點，結合使用者提供的具體資訊（80字內）",
  "financial_impact": {
    "profit_loss": {
      "description": "「${subcategoryName}」對${industry}企業損益表的具體影響分析，包含營收、毛利、營業成本變化（150-180字）",
      "impact_direction": "正面/負面/中性",
      "amount_estimate": "根據${companySize}企業規模和使用者背景的具體金額區間估計",
      "timeframe": "短期（1-3年）/中期（3-7年）/長期（7年以上）",
      "key_items": ["主要影響項目1", "主要影響項目2", "主要影響項目3", "主要影響項目4"]
    },
    "cash_flow": {
      "description": "「${subcategoryName}」對現金流的影響分析，重點關注資本支出、營運現金流變化（150-180字）",
      "impact_direction": "正面/負面/中性", 
      "amount_estimate": "現金流影響金額區間",
      "timeframe": "短期/中期/長期",
      "key_items": ["現金流影響項目1", "現金流影響項目2", "現金流影響項目3", "現金流影響項目4"]
    },
    "balance_sheet": {
      "description": "「${subcategoryName}」對資產負債表的影響分析，包含資產重估、存貨、負債變化（150-180字）",
      "impact_direction": "正面/負面/中性",
      "amount_estimate": "資產負債表影響金額區間", 
      "timeframe": "短期/中期/長期",
      "key_items": ["資產負債表影響項目1", "資產負債表影響項目2", "資產負債表影響項目3", "資產負債表影響項目4"]
    }
  }
}

重要要求：
1. 所有策略建議必須針對「${subcategoryName}」這個具體情境和使用者提供的背景資訊
2. 充分考慮使用者的自訂輸入和企業特殊情況
3. 考慮${companySize}企業的實際執行能力和資源限制
4. 財務影響分析要具體量化，提供實用的金額區間估計
5. 所有內容專業且實用，符合 TCFD 報告標準並反映使用者的具體需求

請直接提供 JSON 格式的回應：`;

    } else if (type === 'scenario_analysis' || type === 'analyze_scenario') {
      // 詳細的情境分析生成（保留向後相容）
      systemPrompt = `你是一位專精於氣候風險管理、財務分析和策略規劃的 TCFD 專業顧問。請根據情境描述和影響評分，提供完整且實用的財務影響分析和策略建議，幫助企業做出明智的管理決策。`;
      
      // 根據風險或機會類型提供不同的策略選項
      const strategiesSection = categoryType === 'risk' ? 
        `"risk_strategies": {
          "mitigate": {
            "title": "減緩策略",
            "description": "減緩風險的具體措施，如設備升級、流程改善、管理系統導入等（100-120字）",
            "cost_estimate": "實施成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          },
          "transfer": {
            "title": "轉移策略",
            "description": "風險轉移的具體作法，如保險、合約條款、外包等（100-120字）", 
            "cost_estimate": "實施成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          },
          "accept": {
            "title": "接受策略",
            "description": "接受風險的具體作法，如預留準備金、強化監控與揭露等（100-120字）",
            "cost_estimate": "實施成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          },
          "control": {
            "title": "控制策略",
            "description": "控制風險的具體作法，如強化內控制度、建立預警系統、定期監測等（100-120字）",
            "cost_estimate": "實施成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          }
        }` :
        `"opportunity_strategies": {
          "evaluate_explore": {
            "title": "評估探索策略",
            "description": "市場研究、技術評估、可行性分析等探索性作法（100-120字）",
            "cost_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          },
          "capability_building": {
            "title": "能力建設策略",
            "description": "人才培訓、技術學習、系統建置等能力提升作法（100-120字）",
            "cost_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          },
          "business_transformation": {
            "title": "商業轉換策略",
            "description": "業務模式調整、產品線轉型、市場定位改變等轉換作法（100-120字）",
            "cost_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          },
          "cooperation_participation": {
            "title": "合作參與策略",
            "description": "策略聯盟、產業合作、政府計畫參與等合作作法（100-120字）",
            "cost_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          },
          "aggressive_investment": {
            "title": "積極投入策略",
            "description": "大規模投資、快速市場進入、領先技術採用等積極作法（100-120字）",
            "cost_estimate": "投資成本估算",
            "feasibility_score": 1-5,
            "feasibility_reason": "可行性評分理由（50字內）",
            "implementation_timeline": "預估實施時間",
            "expected_effect": "預期效果描述"
          }
        }`;
      
      prompt = `針對以下${categoryType === 'risk' ? '風險' : '機會'}情境，請提供完整的財務影響分析和管理策略建議：

情境描述: ${scenarioDescription}
影響評分: ${userScore}/3 分（${userScore === 3 ? '高度影響' : userScore === 2 ? '中度影響' : '輕度影響'}）
產業: ${industry}

請按照以下 JSON 格式提供詳細回應：
{
  "scenario_summary": "一句話概括該情境的背景與${categoryType === 'risk' ? '風險' : '機會'}重點（60字內）",
  "financial_impact": {
    "profit_loss": {
      "description": "對損益表的具體影響分析，包含營收、毛利、營業成本變化（120-150字）",
      "impact_direction": "正面/負面/中性",
      "amount_estimate": "具體金額區間估計（如：年增成本200-500萬元）",
      "timeframe": "短期（1-3年）/中期（3-7年）/長期（7年以上）",
      "key_items": ["主要影響項目1", "主要影響項目2", "主要影響項目3"]
    },
    "cash_flow": {
      "description": "對現金流的影響分析，重點關注資本支出、營運現金流變化（120-150字）",
      "impact_direction": "正面/負面/中性", 
      "amount_estimate": "現金流影響金額區間",
      "timeframe": "短期/中期/長期",
      "key_items": ["現金流影響項目1", "現金流影響項目2", "現金流影響項目3"]
    },
    "balance_sheet": {
      "description": "對資產負債表的影響分析，包含資產重估、存貨、負債變化（120-150字）",
      "impact_direction": "正面/負面/中性",
      "amount_estimate": "資產負債表影響金額區間", 
      "timeframe": "短期/中期/長期",
      "key_items": ["資產負債表影響項目1", "資產負債表影響項目2", "資產負債表影響項目3"]
    }
  },
  ${strategiesSection}
}

請確保：
1. 所有建議具體可行，適合${industry}且與「${subcategoryName}」情境完全一致
2. 財務影響分析要具體量化，提供實用的金額區間估計
3. 策略建議必須針對「${subcategoryName}」這個具體情境，包含具體執行方式、成本估算和時間規劃
4. 可行性評分要有合理依據和說明
5. 所有內容專業且實用，符合 TCFD 報告標準
6. 考慮企業規模和實際執行能力

請直接提供 JSON 格式的回應：`;

    } else if (type === 'strategy') {
      // 保留原有的策略分析生成（向後相容）
      systemPrompt = `你是一位專精於氣候風險管理和財務影響分析的 TCFD 顧問。請根據情境描述和影響評分，提供詳細的財務影響分析和策略建議。`;
      
      prompt = `針對以下風險/機會情境，請提供詳細的策略與財務分析：

情境描述: ${scenarioDescription}
影響評分: ${userScore}/3 分（${userScore === 3 ? '高度影響' : userScore === 2 ? '中度影響' : '輕度影響'}）
產業: ${industry}

請按照以下 JSON 格式提供回應：
{
  "detailed_description": "對該情境的深入分析說明（150-200字）",
  "financial_impact_pnl": "對損益表的具體影響分析（80-100字）",
  "financial_impact_cashflow": "對現金流的影響分析（80-100字）",
  "financial_impact_balance_sheet": "對資產負債表的影響分析（80-100字）",
  "strategy_avoid": "避免策略的具體作法與預期效益（100字左右）",
  "strategy_mitigate": "減緩策略的具體作法與預期效益（100字左右）",
  "strategy_transfer": "轉移策略的具體作法與預期效益（100字左右）",
  "strategy_accept": "承擔策略的具體作法與預期效益（100字左右）"
}

請確保：
1. 所有建議具體可行，適合${industry}
2. 財務影響分析要具體量化或描述影響程度
3. 每種策略都要包含具體的執行方式和預期成效
4. 語氣專業，符合 TCFD 報告標準

請直接提供 JSON 格式的回應：`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: type === 'comprehensive_scenario_analysis' ? 4000 : type === 'scenario_analysis' || type === 'strategy' ? 3000 : 1000
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API request failed:', response.status, response.statusText);
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = data.choices[0].message.content;

    if (type === 'comprehensive_scenario_analysis' || type === 'scenario_analysis' || type === 'analyze_scenario' || type === 'strategy') {
      try {
        // 嘗試解析 JSON 回應
        const parsedContent = JSON.parse(generatedContent);
        return new Response(JSON.stringify({ 
          success: true, 
          content: parsedContent 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // 如果無法解析 JSON，返回錯誤
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to parse analysis response',
          raw_content: generatedContent
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // 情境生成直接返回文字內容
      return new Response(JSON.stringify({ 
        success: true, 
        content: generatedContent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in tcfd-llm-generator function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
