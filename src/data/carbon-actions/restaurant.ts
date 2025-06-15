
import { Action, ActionAngle } from '../../pages/CarbonCredits';

export const restaurantActions: Record<ActionAngle, Action[]> = {
  '能源管理': [
    {
      id: 'rest-en-1',
      name: '導入高效率LED照明',
      description: '顯著降低照明電費，提升環境亮度。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '盤點現有照明設備數量與規格。',
        '研究並選擇合適的LED燈具。',
        '聯繫廠商詢價與安排施工。',
        '執行更換並驗收。'
      ],
      tracking: [
        '每月追蹤電費單，比較照明用電變化。',
        '定期檢查燈具運作狀況。'
      ]
    },
    {
      id: 'rest-en-2',
      name: '優化廚房排煙系統（變頻）',
      description: '節省排風機電力，改善廚房空氣品質。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '評估現有排煙系統效能與能耗。',
        '尋找專業廠商規劃變頻系統改造方案。',
        '編列預算並進行施工。',
        '測試系統運作並對員工進行操作培訓。'
      ],
      tracking: [
        '監測變頻系統的運轉時數與用電量。',
        '比較改造前後的電費差異。'
      ]
    },
    {
      id: 'rest-en-3',
      name: '選用節能烹飪設備（如IH爐、高效率烤箱）',
      description: '大幅減少烹飪能耗，降低熱負荷。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '分析現有烹飪設備的使用年限與能耗。',
        '研究並挑選符合需求的節能標章設備。',
        '規劃設備更換時程與預算。',
        '進行採購、安裝與測試。'
      ],
      tracking: [
        '追蹤瓦斯或電力費用變化。',
        '收集廚師團隊對新設備的使用回饋。'
      ]
    },
    {
      id: 'rest-en-4',
      name: '冷藏冷凍設備定期除霜與維護',
      description: '確保設備效率，降低電力耗損。',
      investment: '低',
      difficulty: '簡易',
      time: '數天',
      manpower: '少數員工即可',
      steps: [
        '制定設備定期清潔與除霜的標準作業流程(SOP)。',
        '指派專人負責或委由廠商定期維護。',
        '記錄每次維護的日期與項目。'
      ],
      tracking: [
        '每月監測冷藏冷凍設備的用電量。',
        '檢查設備運轉是否正常，溫度是否穩定。'
      ]
    },
    {
      id: 'rest-en-5',
      name: '安裝智能溫控系統（空調、冰櫃）',
      description: '精確控制溫度，避免不必要能源浪費。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '評估需加裝溫控系統的設備與區域。',
        '選擇合適的智能溫控產品。',
        '委託專業廠商進行安裝與設定。',
        '設定各時段的溫度標準。'
      ],
      tracking: [
        '透過系統後台監測溫度變化與設備運轉狀況。',
        '分析節電效益。'
      ]
    },
    {
      id: 'rest-en-6',
      name: '定期清洗空調濾網',
      description: '維持空調效率，降低能耗。',
      investment: '低',
      difficulty: '簡易',
      time: '數天',
      manpower: '少數員工即可',
      steps: [
        '建立空調濾網清洗排程（例如每兩週一次）。',
        '指派員工依排程執行清洗工作。',
        '記錄清洗日期。'
      ],
      tracking: [
        '觀察空調冷房效果是否維持良好。',
        '比較清洗前後的空調用電量。'
      ]
    },
    {
      id: 'rest-en-7',
      name: '員工節能行為培訓（隨手關燈、關火）',
      description: '透過行為改變，積少成多節省能源。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '制定節能行為守則。',
        '舉辦內部教育訓練。',
        '在適當位置張貼提醒標語。',
        '建立節能獎勵機制。'
      ],
      tracking: [
        '定期巡檢各區域的節能措施落實情況。',
        '表揚表現優異的員工。'
      ]
    },
    {
      id: 'rest-en-8',
      name: '導入熱回收系統（利用廢熱加熱水）',
      description: '降低熱水加熱能耗。',
      investment: '中',
      difficulty: '複雜',
      time: '數月',
      manpower: '需外聘顧問',
      steps: [
        '評估廚房或空調系統的廢熱產生量。',
        '委託專業顧問規劃熱回收系統方案。',
        '進行設備採購與安裝施工。',
        '測試系統效能與安全性。'
      ],
      tracking: [
        '監測熱水系統的瓦斯或電力使用量。',
        '計算投資回收期。'
      ]
    },
    {
      id: 'rest-en-9',
      name: '能源監控與分析系統建置',
      description: '精準掌握能耗狀況，找出節能潛力。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        ' xác định các điểm giám sát năng lượng chính (tổng, bếp, khu vực ăn uống).',
        ' lựa chọn và lắp đặt các đồng hồ thông minh hoặc cảm biến.',
        ' kết nối với một nền tảng phần mềm để thu thập và hiển thị dữ liệu.',
        ' đào tạo nhân viên cách sử dụng hệ thống.'
      ],
      tracking: [
        ' phân tích báo cáo năng lượng hàng tháng để xác định các xu hướng và bất thường.',
        ' đặt ra các mục tiêu tiết kiệm năng lượng dựa trên dữ liệu.'
      ]
    },
    {
      id: 'rest-en-10',
      name: '優先採購綠色電力',
      description: '降低範疇二排放，提升企業永續形象。',
      investment: '中',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '了解企業年度用電量。',
        '研究國內綠電交易市場與供應商。',
        '選擇合適的綠電採購方案（如簽訂購售電合約 PPA）。',
        '完成合約簽署與憑證轉移。'
      ],
      tracking: [
        '確保每年取得足額的再生能源憑證。',
        '在永續報告中揭露綠電使用比例。'
      ]
    }
  ],
  '循環經濟': [
    {
      id: 'rest-ci-1',
      name: '食材廢棄物減量（精準採購、庫存管理）',
      description: '減少廚餘產生，降低處理成本。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '分析歷史銷售數據，預測食材需求量。',
        '建立先進先出的庫存管理原則。',
        '定期盤點庫存，避免食材過期。',
        '設計彈性菜單以消化剩餘食材。'
      ],
      tracking: [
        '每日記錄廚餘重量。',
        '每月計算食材廢棄率。'
      ]
    },
    {
      id: 'rest-ci-2',
      name: '廚餘回收再利用（堆肥、養殖）',
      description: '將廢棄物轉化為資源，減少掩埋量。',
      investment: '低',
      difficulty: '中等',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '確實執行廚餘分類（生廚餘、熟廚餘）。',
        '聯繫合法的廚餘回收業者。',
        '若空間許可，可評估自設小型堆肥設施。',
        '教育員工正確的分類方式。'
      ],
      tracking: [
        '追蹤廚餘回收量。',
        '確保回收過程符合環保法規。'
      ]
    },
    {
      id: 'rest-ci-3',
      name: '推廣外帶容器重複使用/自備',
      description: '減少一次性包材使用，降低資源消耗。',
      investment: '低',
      difficulty: '簡易',
      time: '數天',
      manpower: '少數員工即可',
      steps: [
        '設計並公告自備容器的優惠方案。',
        '在點餐流程中主動詢問顧客是否需要一次性餐具。',
        '訓練員工應對自備容器的服務流程。'
      ],
      tracking: [
        '統計每月自備容器的顧客數量。',
        '計算一次性包材的採購量變化。'
      ]
    },
    {
      id: 'rest-ci-4',
      name: '餐具洗滌水回收再利用',
      description: '節省水資源，降低水費。',
      investment: '中',
      difficulty: '複雜',
      time: '數月',
      manpower: '需外聘顧問',
      steps: [
        '評估洗碗區的廢水產生量與水質。',
        '委託專業廠商設計中水回收系統。',
        '進行管線與設備安裝。',
        '定期維護過濾系統。'
      ],
      tracking: [
        '監測回收水量。',
        '比較安裝前後的水費差異。'
      ]
    },
    {
      id: 'rest-ci-5',
      name: '廢油回收再製（生質柴油、皂化）',
      description: '避免環境污染，創造附加價值。',
      investment: '低',
      difficulty: '簡易',
      time: '數天',
      manpower: '少數員工即可',
      steps: [
        '設置專用的廢食用油收集桶。',
        '與合法的廢油回收商簽訂合約。',
        '定期安排回收。'
      ],
      tracking: [
        '保存回收聯單。',
        '確保回收商有合法的再利用管道。'
      ]
    },
    {
      id: 'rest-ci-6',
      name: '包裝材料減量化與輕量化',
      description: '減少資源消耗和運輸碳排。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '檢視現有外帶包裝，評估是否有過度包裝。',
        '尋找使用更少材料或更輕材質的替代方案。',
        '與供應商溝通，要求簡化包材。'
      ],
      tracking: [
        '比較新舊包材的重量與成本。',
        '收集顧客對新包裝的回饋。'
      ]
    },
    {
      id: 'rest-ci-7',
      name: '導入循環杯或循環餐具系統',
      description: '減少一次性用品，提升環保形象。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '研究市場上現有的循環餐具服務平台。',
        '評估合作模式與成本。',
        '導入系統並對員工進行教育訓練。',
        '向顧客宣導循環餐具的使用方式。'
      ],
      tracking: [
        '追蹤循環餐具的使用率與歸還率。',
        '計算節省下的一次性餐具數量。'
      ]
    },
    {
      id: 'rest-ci-8',
      name: '食材邊角料再利用（熬湯、製作小吃）',
      description: '提升食材利用率，減少浪費。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '盤點每日產生的食材邊角料種類與數量。',
        '研發利用邊角料的創意菜色或員工餐。',
        '建立邊角料處理的標準流程。'
      ],
      tracking: [
        '計算邊角料再利用的比例。',
        '評估新菜色的顧客接受度。'
      ]
    },
    {
      id: 'rest-ci-9',
      name: '廢棄物分類回收與資源化',
      description: '提高回收率，減少最終廢棄物量。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '設置清晰的分類回收桶（紙類、塑膠、金屬、玻璃）。',
        '對員工進行分類標準的教育訓練。',
        '與可靠的回收商合作。'
      ],
      tracking: [
        '定期檢視回收物的分類正確率。',
        '追蹤各類回收物的重量。'
      ]
    },
    {
      id: 'rest-ci-10',
      name: '鼓勵顧客剩食打包',
      description: '減少廚餘產生。',
      investment: '低',
      difficulty: '簡易',
      time: '數天',
      manpower: '少數員工即可',
      steps: [
        '主動提供打包服務。',
        '準備合適的打包餐盒。',
        '在菜單或桌面放置鼓勵打包的標語。'
      ],
      tracking: [
        '觀察顧客打包的頻率。',
        '追蹤內用廚餘的減少量。'
      ]
    }
  ],
  '永續採購': [
    {
      id: 'rest-su-1',
      name: '優先採購在地食材（縮短食物里程）',
      description: '降低運輸碳排，支持在地農業。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '盤點菜單中的主要食材。',
        '尋找並聯繫周邊的農夫市集或小農。',
        '建立合作關係並規劃配送方式。',
        '在菜單上標示在地食材來源。'
      ],
      tracking: [
        '計算在地食材佔總採購量的比例。',
        '收集顧客對在地食材菜色的回饋。'
      ]
    },
    {
      id: 'rest-su-2',
      name: '採購當季食材',
      description: '減少溫室種植及長途運輸碳排。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '了解本地的季節性蔬果產期。',
        '依季節設計和更換菜單。',
        '與供應商溝通，優先採購當季產品。'
      ],
      tracking: [
        '追蹤當季食材的採購比例。',
        '評估季節性菜單的受歡迎程度。'
      ]
    },
    {
      id: 'rest-su-3',
      name: '採購有永續認證標章的食材（如有機、友善環境）',
      description: '確保食材生產過程環境友善。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '少數員工即可',
      steps: [
        '研究不同的永續標章（如有機、產銷履歷、動物福利）。',
        '尋找能提供認證食材的供應商。',
        '評估成本並逐步導入菜單。',
        '向顧客溝通食材價值。'
      ],
      tracking: [
        '計算永續認證食材的採購金額佔比。',
        '追蹤相關認證標章的有效性。'
      ]
    },
    {
      id: 'rest-su-4',
      name: '優先選擇節能標章設備',
      description: '從源頭減少能耗，降低營運成本。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '建立設備採購指南，將節能標章列為必要條件。',
        '在採購時，要求供應商提供產品能效資訊。',
        '優先選擇能效等級較高的產品。'
      ],
      tracking: [
        '記錄新購設備的能效等級。',
        '長期追蹤設備的實際能耗表現。'
      ]
    },
    {
      id: 'rest-su-5',
      name: '採購可重複使用或回收材質的餐具與耗材',
      description: '減少一次性資源消耗。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '檢視目前使用的一次性耗材。',
        '尋找由回收材料製成或可回收的替代品（如再生紙餐巾）。',
        '評估並更換供應商或產品。'
      ],
      tracking: [
        '計算環保耗材的採購比例。',
        '確保使用後的耗材能進入回收體系。'
      ]
    },
    {
      id: 'rest-su-6',
      name: '選擇環保清潔劑與洗劑',
      description: '減少化學污染，保護環境。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '盤點目前使用的清潔劑種類。',
        '尋找具有環保標章或天然成分的替代品。',
        '測試新產品的清潔效果。',
        '全面更換。'
      ],
      tracking: [
        '確認採購的清潔劑符合環保標準。',
        '觀察對員工健康與環境的影響。'
      ]
    },
    {
      id: 'rest-su-7',
      name: '建立供應商永續評估機制',
      description: '確保供應鏈符合永續標準。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '設計供應商行為準則，包含環境與社會要求。',
        '要求主要供應商簽署或回覆評估問卷。',
        '將永續表現納入供應商評選標準。',
        '與供應商溝通改善方向。'
      ],
      tracking: [
        '定期更新供應商評估結果。',
        '追蹤關鍵供應商的永續改善進度。'
      ]
    },
    {
      id: 'rest-su-8',
      name: '避免採購過度包裝的食材或產品',
      description: '從源頭減少包裝廢棄物。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '在進貨驗收時，記錄包裝過度的供應商。',
        '主動向供應商反映，要求使用較少包裝。',
        '優先選擇採用環保包裝的供應商。'
      ],
      tracking: [
        '記錄因包裝改善而減少的廢棄物量。',
        '追蹤供應商的回應與改善情況。'
      ]
    },
    {
      id: 'rest-su-9',
      name: '採購節水設備（如省水龍頭、省水馬桶）',
      description: '節省水資源。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '盤點餐廳內所有的水龍頭與馬桶。',
        '採購具有省水標章的配件或設備。',
        '安排水電工進行更換。'
      ],
      tracking: [
        '比較更換前後的水費單。',
        '定期檢查是否有漏水情況。'
      ]
    },
    {
      id: 'rest-su-10',
      name: '選擇能提供碳足跡資訊的供應商',
      description: '幫助企業了解自身碳排來源。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '了解產品碳足跡的基本概念。',
        '向主要食材或物料供應商詢問是否能提供碳足跡數據。',
        '將此作為選擇新供應商的加分項目。'
      ],
      tracking: [
        '逐步建立主要採購品項的碳足跡資料庫。',
        '利用數據找出高碳排的採購項目並尋求替代方案。'
      ]
    }
  ],
  '淨零管理': [
    {
      id: 'rest-ne-1',
      name: '制定企業減碳目標與路徑',
      description: '為減碳行動提供明確方向與依據。',
      investment: '低',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '完成初步的溫室氣體盤查，了解排放來源。',
        '參考科學基礎減碳目標(SBTi)設定短期與長期目標。',
        '規劃達成目標所需執行的減碳行動。',
        '向內部同仁與外部利害關係人公布目標。'
      ],
      tracking: [
        '每年更新溫室氣體盤查數據。',
        '定期檢視減碳目標的達成進度。'
      ]
    },
    {
      id: 'rest-ne-2',
      name: '導入ISO 14064溫室氣體盤查',
      description: '系統化計算碳排，找出熱點。',
      investment: '中',
      difficulty: '複雜',
      time: '數月',
      manpower: '需外聘顧問',
      steps: [
        '尋找並委託專業的溫室氣體盤查顧問。',
        '成立內部盤查小組，配合顧問收集數據。',
        '建立溫室氣體排放清冊。',
        '完成盤查報告書並取得第三方查證。'
      ],
      tracking: [
        '每年定期執行盤查與查證。',
        '根據盤查結果，調整減碳策略。'
      ]
    },
    {
      id: 'rest-ne-3',
      name: '建立內部碳管理團隊',
      description: '專責推動與監控減碳進度。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '指派一位高階主管擔任召集人。',
        '邀請來自廚房、外場、採購、行銷等部門的代表加入。',
        '定期召開會議，追蹤各項減碳行動的進度。'
      ],
      tracking: [
        '記錄會議決議與行動項目。',
        '向管理層報告減碳成果。'
      ]
    },
    {
      id: 'rest-ne-4',
      name: '參與綠色能源憑證購買',
      description: '抵銷電力碳排，加速淨零進程。',
      investment: '中',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '計算餐廳的年用電量。',
        '透過合格的交易平台購買等量的再生能源憑證。',
        '取得憑證所有權證明。'
      ],
      tracking: [
        '確保憑證數量足以抵銷範疇二的排放。',
        '在永續報告中揭露憑證使用情況。'
      ]
    },
    {
      id: 'rest-ne-5',
      name: '員工減碳意識提升與參與活動',
      description: '培養全員減碳文化，落實日常行為。',
      investment: '低',
      difficulty: '簡易',
      time: '數週',
      manpower: '少數員工即可',
      steps: [
        '舉辦減碳知識分享會或工作坊。',
        '舉辦節能、回收競賽等趣味活動。',
        '鼓勵員工提出減碳創意點子。',
        '公開表揚有貢獻的團隊或個人。'
      ],
      tracking: [
        '觀察員工在日常工作中的減碳行為改變。',
        '透過問卷調查評估員工的減碳意識。'
      ]
    },
    {
      id: 'rest-ne-6',
      name: '定期發布企業永續報告書（ESG報告）',
      description: '展現企業社會責任，提升品牌形象。',
      investment: '中',
      difficulty: '複雜',
      time: '數月',
      manpower: '需外聘顧問',
      steps: [
        '參考國際準則（如GRI）規劃報告書架構。',
        '收集環境、社會、治理各面向的數據與案例。',
        '撰寫報告書內容並進行設計排版。',
        '可選擇性地進行第三方確信。'
      ],
      tracking: [
        '每年定期發布。',
        '收集利害關係人對報告書的回饋。'
      ]
    },
    {
      id: 'rest-ne-7',
      name: '評估導入碳捕捉技術或自然碳匯專案',
      description: '長期考量，達到範疇一碳排實質減量或抵銷。',
      investment: '高',
      difficulty: '複雜',
      time: '數年',
      manpower: '需外聘顧問',
      steps: [
        '研究適用於餐飲業的微型碳捕捉技術。',
        '尋找並評估國內外的自然碳匯專案（如植樹、海洋保育）。',
        '委託專家進行可行性與成本效益分析。',
        '選擇合適的方案進行投資或合作。'
      ],
      tracking: [
        '追蹤技術或專案的實際減碳/固碳成效。',
        '確保符合國際碳權認證標準。'
      ]
    },
    {
      id: 'rest-ne-8',
      name: '供應鏈碳排放協作與輔導',
      description: '推動上游供應商共同減碳。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '識別出主要的供應商與高碳排的採購品項。',
        '舉辦供應商大會，分享企業的減碳目標與期望。',
        '提供供應商減碳知識或資源。',
        '建立聯合減碳專案。'
      ],
      tracking: [
        '追蹤主要供應商的減碳表現。',
        '評估供應鏈整體的碳排放變化。'
      ]
    },
    {
      id: 'rest-ne-9',
      name: '評估導入智慧能源管理系統',
      description: '精準管理能源，優化減碳效率。',
      investment: '中',
      difficulty: '中等',
      time: '數月',
      manpower: '需專案小組',
      steps: [
        '確認需要監測的能源類型與設備。',
        '選擇合適的硬體（感測器）與軟體平台。',
        '進行安裝、設定與測試。',
        '設定能源使用異常的警報機制。'
      ],
      tracking: [
        '分析系統產出的能耗報告，找出節能機會。',
        '追蹤改善措施的成效。'
      ]
    },
    {
      id: 'rest-ne-10',
      name: '探索創新低碳商業模式',
      description: '從根本上減少碳排，提升競爭力。',
      investment: '高',
      difficulty: '複雜',
      time: '數年',
      manpower: '需專案小組',
      steps: [
        '研究植物性飲食、細胞培養肉等未來食品趨勢。',
        '評估將「碳足跡」作為餐點定價的可能性。',
        '發展以社區為基礎的在地食材供應網絡。',
        '嘗試提供訂閱制的低碳餐飲服務。'
      ],
      tracking: [
        '進行市場調查與消費者意願分析。',
        '透過小型試點專案驗證商業模式的可行性。'
      ]
    }
  ]
};
