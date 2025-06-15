
import { Action, ActionAngle, Industry } from '../pages/CarbonCredits';

export const industries: Industry[] = ['餐飲業', '零售業', '製造業', '營建業', '運輸業', '科技業', '金融業', '醫療保健', '教育服務', '旅宿業'];
export const actionAngles: ActionAngle[] = ['能源管理', '循環經濟', '永續採購', '淨零管理'];

type ActionData = Record<Industry, Record<ActionAngle, Action[]>>;

export const actionsData: ActionData = {
  '餐飲業': {
    '能源管理': [
      { id: 'rest-en-1', name: '導入高效率LED照明', description: '顯著降低照明電費，提升環境亮度。', investment: '低' },
      { id: 'rest-en-2', name: '優化廚房排煙系統（變頻）', description: '節省排風機電力，改善廚房空氣品質。', investment: '中' },
      { id: 'rest-en-3', name: '選用節能烹飪設備（如IH爐、高效率烤箱）', description: '大幅減少烹飪能耗，降低熱負荷。', investment: '中' },
      { id: 'rest-en-4', name: '冷藏冷凍設備定期除霜與維護', description: '確保設備效率，降低電力耗損。', investment: '低' },
      { id: 'rest-en-5', name: '安裝智能溫控系統（空調、冰櫃）', description: '精確控制溫度，避免不必要能源浪費。', investment: '中' },
      { id: 'rest-en-6', name: '定期清洗空調濾網', description: '維持空調效率，降低能耗。', investment: '低' },
      { id: 'rest-en-7', name: '員工節能行為培訓（隨手關燈、關火）', description: '透過行為改變，積少成多節省能源。', investment: '低' },
      { id: 'rest-en-8', name: '導入熱回收系統（利用廢熱加熱水）', description: '降低熱水加熱能耗。', investment: '中' },
      { id: 'rest-en-9', name: '能源監控與分析系統建置', description: '精準掌握能耗狀況，找出節能潛力。', investment: '中' },
      { id: 'rest-en-10', name: '優先採購綠色電力', description: '降低範疇二排放，提升企業永續形象。', investment: '中' },
    ],
    '循環經濟': [
      { id: 'rest-ci-1', name: '食材廢棄物減量（精準採購、庫存管理）', description: '減少廚餘產生，降低處理成本。', investment: '低' },
      { id: 'rest-ci-2', name: '廚餘回收再利用（堆肥、養殖）', description: '將廢棄物轉化為資源，減少掩埋量。', investment: '低' },
      { id: 'rest-ci-3', name: '推廣外帶容器重複使用/自備', description: '減少一次性包材使用，降低資源消耗。', investment: '低' },
      { id: 'rest-ci-4', name: '餐具洗滌水回收再利用', description: '節省水資源，降低水費。', investment: '中' },
      { id: 'rest-ci-5', name: '廢油回收再製（生質柴油、皂化）', description: '避免環境污染，創造附加價值。', investment: '低' },
      { id: 'rest-ci-6', name: '包裝材料減量化與輕量化', description: '減少資源消耗和運輸碳排。', investment: '低' },
      { id: 'rest-ci-7', name: '導入循環杯或循環餐具系統', description: '減少一次性用品，提升環保形象。', investment: '中' },
      { id: 'rest-ci-8', name: '食材邊角料再利用（熬湯、製作小吃）', description: '提升食材利用率，減少浪費。', investment: '低' },
      { id: 'rest-ci-9', name: '廢棄物分類回收與資源化', description: '提高回收率，減少最終廢棄物量。', investment: '低' },
      { id: 'rest-ci-10', name: '鼓勵顧客剩食打包', description: '減少廚餘產生。', investment: '低' },
    ],
    '永續採購': [
      { id: 'rest-su-1', name: '優先採購在地食材（縮短食物里程）', description: '降低運輸碳排，支持在地農業。', investment: '低' },
      { id: 'rest-su-2', name: '採購當季食材', description: '減少溫室種植及長途運輸碳排。', investment: '低' },
      { id: 'rest-su-3', name: '採購有永續認證標章的食材（如有機、友善環境）', description: '確保食材生產過程環境友善。', investment: '中' },
      { id: 'rest-su-4', name: '優先選擇節能標章設備', description: '從源頭減少能耗，降低營運成本。', investment: '低' },
      { id: 'rest-su-5', name: '採購可重複使用或回收材質的餐具與耗材', description: '減少一次性資源消耗。', investment: '低' },
      { id: 'rest-su-6', name: '選擇環保清潔劑與洗劑', description: '減少化學污染，保護環境。', investment: '低' },
      { id: 'rest-su-7', name: '建立供應商永續評估機制', description: '確保供應鏈符合永續標準。', investment: '中' },
      { id: 'rest-su-8', name: '避免採購過度包裝的食材或產品', description: '從源頭減少包裝廢棄物。', investment: '低' },
      { id: 'rest-su-9', name: '採購節水設備（如省水龍頭、省水馬桶）', description: '節省水資源。', investment: '低' },
      { id: 'rest-su-10', name: '選擇能提供碳足跡資訊的供應商', description: '幫助企業了解自身碳排來源。', investment: '中' },
    ],
    '淨零管理': [
      { id: 'rest-ne-1', name: '制定企業減碳目標與路徑', description: '為減碳行動提供明確方向與依據。', investment: '低' },
      { id: 'rest-ne-2', name: '導入ISO 14064溫室氣體盤查', description: '系統化計算碳排，找出熱點。', investment: '中' },
      { id: 'rest-ne-3', name: '建立內部碳管理團隊', description: '專責推動與監控減碳進度。', investment: '低' },
      { id: 'rest-ne-4', name: '參與綠色能源憑證購買', description: '抵銷電力碳排，加速淨零進程。', investment: '中' },
      { id: 'rest-ne-5', name: '員工減碳意識提升與參與活動', description: '培養全員減碳文化，落實日常行為。', investment: '低' },
      { id: 'rest-ne-6', name: '定期發布企業永續報告書（ESG報告）', description: '展現企業社會責任，提升品牌形象。', investment: '中' },
      { id: 'rest-ne-7', name: '評估導入碳捕捉技術或自然碳匯專案', description: '長期考量，達到範疇一碳排實質減量或抵銷。', investment: '高' },
      { id: 'rest-ne-8', name: '供應鏈碳排放協作與輔導', description: '推動上游供應商共同減碳。', investment: '中' },
      { id: 'rest-ne-9', name: '評估導入智慧能源管理系統', description: '精準管理能源，優化減碳效率。', investment: '中' },
      { id: 'rest-ne-10', name: '探索創新低碳商業模式', description: '從根本上減少碳排，提升競爭力。', investment: '高' },
    ],
  },
  '零售業': {
    '能源管理': [
      { id: 'ret-en-1', name: '導入高效率LED照明及智慧控制系統', description: '大幅節省照明電費，提升賣場氛圍。', investment: '中' },
      { id: 'ret-en-2', name: '空調系統優化與定期維護', description: '降低空調能耗，提供舒適購物環境。', investment: '中' },
      { id: 'ret-en-3', name: '冷藏冷凍櫃導入高效馬達與夜間蓋板', description: '顯著降低製冷能耗。', investment: '中' },
      { id: 'ret-en-4', name: '門店能源監控系統建置', description: '精準掌握各門店能耗，找出節能潛力點。', investment: '中' },
      { id: 'ret-en-5', name: '採用節能標章的辦公設備與收銀系統', description: '降低日常營運電耗。', investment: '低' },
      { id: 'ret-en-6', name: '員工節能行為培訓（離店關電、閉店巡檢）', description: '透過行為管理減少不必要能耗。', investment: '低' },
      { id: 'ret-en-7', name: '屋頂太陽能板安裝（若有合適條件）', description: '產生再生能源，降低範疇二排放。', investment: '高' },
      { id: 'ret-en-8', name: '運用自然採光與通風設計', description: '減少照明與空調負荷，提升室內舒適度。', investment: '低' },
      { id: 'ret-en-9', name: '電梯與手扶梯智慧排程控制', description: '避免離峰時段空轉，節省電力。', investment: '中' },
      { id: 'ret-en-10', name: '導入儲能系統（削峰填谷）', description: '平衡電力需求，降低尖峰用電。', investment: '高' },
    ],
    '循環經濟': [
      { id: 'ret-ci-1', name: '減少商品過度包裝', description: '降低資源消耗和包裝廢棄物。', investment: '低' },
      { id: 'ret-ci-2', name: '推廣環保袋使用或自備購物袋', description: '減少塑膠袋使用，提升環保形象。', investment: '低' },
      { id: 'ret-ci-3', name: '廢棄物分類回收與資源化', description: '提高回收率，減少垃圾掩埋量。', investment: '低' },
      { id: 'ret-ci-4', name: '鼓勵空瓶罐回收（與供應商合作）', description: '促進包材循環再利用。', investment: '低' },
      { id: 'ret-ci-5', name: '導入循環包裝系統（如電商包裝箱回收）', description: '減少一次性包材消耗。', investment: '中' },
      { id: 'ret-ci-6', name: '處理過期或即期品（捐贈、惜食專區）', description: '減少食物浪費，履行社會責任。', investment: '低' },
      { id: 'ret-ci-7', name: '廢棄燈具、電子產品等規範回收', description: '避免有害物質污染，促進資源再生。', investment: '低' },
      { id: 'ret-ci-8', name: '鼓勵產品維修服務或零件銷售', description: '延長產品生命週期，減少汰換頻率。', investment: '中' },
      { id: 'ret-ci-9', name: '門店裝修廢棄物減量與再利用', description: '減少建築廢棄物，符合永續營建原則。', investment: '中' },
      { id: 'ret-ci-10', name: '推動產品「以租代買」模式', description: '降低消費品生產需求，減少資源消耗。', investment: '高' },
    ],
    '永續採購': [
      { id: 'ret-su-1', name: '優先採購節能標章商品', description: '從源頭降低商品使用階段的能耗。', investment: '低' },
      { id: 'ret-su-2', name: '採購具環保認證的清潔用品與耗材', description: '減少化學污染，保護環境。', investment: '低' },
      { id: 'ret-su-3', name: '建立供應商永續評估機制', description: '確保供應鏈符合環保與勞工標準。', investment: '中' },
      { id: 'ret-su-4', name: '優先採購當地製造或在地農產品', description: '減少運輸碳排，支持在地經濟。', investment: '低' },
      { id: 'ret-su-5', name: '鼓勵供應商提供產品碳足跡資訊', description: '幫助企業了解自身範疇三碳排來源。', investment: '中' },
      { id: 'ret-su-6', name: '採購可重複使用或回收材質的展示架/道具', description: '降低店內裝修與陳列物的資源消耗。', investment: '低' },
      { id: 'ret-su-7', name: '選擇對環境友善的物流供應商', description: '減少運輸過程中的碳排放。', investment: '中' },
      { id: 'ret-su-8', name: '採購再生材料製成的辦公用品', description: '減少原生資源消耗。', investment: '低' },
      { id: 'ret-su-9', name: '鼓勵供應商採用永續包裝', description: '從供應鏈源頭減少包裝廢棄物。', investment: '中' },
      { id: 'ret-su-10', name: '避免採購含微塑膠或有害化學物質的商品', description: '降低環境污染風險。', investment: '低' },
    ],
    '淨零管理': [
      { id: 'ret-ne-1', name: '制定企業級淨零目標與路線圖', description: '為企業的永續發展提供明確方向。', investment: '低' },
      { id: 'ret-ne-2', name: '導入ISO 14064溫室氣體盤查並定期更新', description: '系統化量化碳排，識別排放熱點。', investment: '中' },
      { id: 'ret-ne-3', name: '建立內部碳管理委員會或專責團隊', description: '統籌規劃與推動企業減碳事務。', investment: '低' },
      { id: 'ret-ne-4', name: '參與綠電採購或自建再生能源', description: '大幅降低範疇二排放，加速淨零。', investment: '中' },
      { id: 'ret-ne-5', name: '員工永續意識培訓與獎勵', description: '提升全員參與度，落實日常減碳。', investment: '低' },
      { id: 'ret-ne-6', name: '定期發布企業永續報告書（ESG報告）', description: '展現企業在永續發展上的努力與成果。', investment: '中' },
      { id: 'ret-ne-7', name: '建立供應鏈碳排放協作與輔導機制', description: '鼓勵與協助供應商共同減碳，降低範疇三排放。', investment: '中' },
      { id: 'ret-ne-8', name: '評估參與碳抵換專案（購買碳權）', description: '抵銷難以減除的剩餘碳排。', investment: '中' },
      { id: 'ret-ne-9', name: '導入智慧能源管理系統', description: '精準監控與優化能源使用，提升減碳效率。', investment: '中' },
      { id: 'ret-ne-10', name: '推動低碳物流配送模式（電動車隊、路線優化）', description: '降低商品配送過程的碳排放。', investment: '高' },
    ],
  },
  '製造業': {
    '能源管理': [
      { id: 'man-en-1', name: '汰換老舊高耗能馬達', description: '將IE1/IE2馬達汰換為IE3/IE4高效率馬達。', investment: '高' },
      { id: 'man-en-2', name: '建置能源管理系統 (EMS)', description: '全面監控廠區能源流，進行數據分析與優化。', investment: '高' },
    ],
    '循環經濟': [
      { id: 'man-ci-1', name: '實施廢棄物資源化處理', description: '將生產廢料回收再利用，或轉換為其他可用資源。', investment: '高' },
      { id: 'man-ci-2', name: '製程水回收再利用', description: '建置廢水回收系統，降低水資源消耗。', investment: '高' },
    ],
    '永續採購': [
      { id: 'man-su-1', name: '建立綠色供應鏈標準', description: '要求上游供應商提供產品碳足跡或相關環保認證。', investment: '高' },
    ],
    '淨零管理': [
      { id: 'man-ne-1', name: '執行組織型碳盤查 (ISO 14064-1)', description: '系統性鑑別與量化溫室氣體排放源。', investment: '高' },
    ]
  },
  '營建業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '運輸業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '科技業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '金融業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '醫療保健': {
    '能源管理': [
      { id: 'hea-en-1', name: '醫療設備節能管理', description: '導入待機自動關機或節能模式的醫療設備。', investment: '中' },
      { id: 'hea-en-2', name: '優化空調與通風系統', description: '針對病房、手術室等不同區域進行智慧溫控與換氣。', investment: '高' },
    ],
    '循環經濟': [
      { id: 'hea-ci-1', name: '醫療廢棄物分類與減量', description: '推動感染性與非感染性廢棄物的精準分類，並減少一次性醫材使用。', investment: '高' },
    ],
    '永續採購': [
      { id: 'hea-su-1', name: '採購低碳環保醫材', description: '優先選擇可回收、再利用或採用環保材質的醫療用品。', investment: '中' },
    ],
    '淨零管理': [
      { id: 'hea-ne-1', name: '建立院內綠色行動小組', description: '成立專責小組，推動全院節能減碳文化與活動。', investment: '低' },
    ],
  },
  '教育服務': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '旅宿業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
};
