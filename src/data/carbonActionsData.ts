import { Action, ActionAngle, Industry } from '../pages/CarbonCredits';

export const industries: Industry[] = ['餐飲業', '零售業', '製造業', '營建業', '運輸業', '科技業', '金融業', '醫療保健', '教育服務', '旅宿業'];
export const actionAngles: ActionAngle[] = ['能源管理', '循環經濟', '永續採購', '淨零管理'];

type ActionData = Record<Industry, Record<ActionAngle, Action[]>>;

export const actionsData: ActionData = {
  '餐飲業': {
    '能源管理': [
      { id: 'rest-en-1', name: '換裝節能LED燈具', description: '將傳統燈具更換為高效率LED，可節省50-70%照明用電。', benefit: '中', investment: '低', difficulty: '低' },
      { id: 'rest-en-2', name: '採用節能標章廚房設備', description: '選擇具備節能標章的冰箱、爐具等，從源頭降低能耗。', benefit: '中', investment: '中', difficulty: '低' },
    ],
    '循環經濟': [
      { id: 'rest-ci-1', name: '引進廚餘高效堆肥機', description: '將廚餘轉化為有機肥料，減少廢棄物處理成本與甲烷排放。', benefit: '高', investment: '中', difficulty: '中' },
      { id: 'rest-ci-2', name: '使用可重複清洗餐具', description: '減少一次性餐具使用，降低廢棄物量。', benefit: '中', investment: '低', difficulty: '低' },
    ],
    '永續採購': [
      { id: 'rest-su-1', name: '優先採購在地食材', description: '縮短食物里程，減少運輸過程的碳排放。', benefit: '高', investment: '低', difficulty: '中' },
    ],
    '淨零管理': [
       { id: 'rest-ne-1', name: '建立簡易碳盤查清冊', description: '初步盤點店內能源使用狀況，作為減量基準。', benefit: '中', investment: '低', difficulty: '中' },
    ],
  },
  '零售業': {
    '能源管理': [
      { id: 'ret-en-1', name: '更換為變頻節能空調', description: '汰換老舊定頻空調，依據人流與氣溫智慧調節。', benefit: '高', investment: '高', difficulty: '中' },
      { id: 'ret-en-2', name: '導入智慧能源監控系統', description: '即時監控賣場各區域用電，找出異常能耗點。', benefit: '高', investment: '中', difficulty: '中' },
    ],
    '循環經濟': [
      { id: 'ret-ci-1', name: '推動綠色包裝與回收', description: '採用簡化、可回收、或生質材料包裝，並設置回收站點。', benefit: '中', investment: '中', difficulty: '中' },
    ],
    '永續採購': [
      { id: 'ret-su-1', name: '引進具環保標章商品', description: '提供消費者更多綠色選擇，提升企業永續形象。', benefit: '中', investment: '低', difficulty: '低' },
    ],
    '淨零管理': [
       { id: 'ret-ne-1', name: '規劃員工節能SOP', description: '制定開關燈、空調、設備使用的標準作業流程。', benefit: '低', investment: '低', difficulty: '低' },
    ],
  },
  '製造業': {
    '能源管理': [
      { id: 'man-en-1', name: '汰換老舊高耗能馬達', description: '將IE1/IE2馬達汰換為IE3/IE4高效率馬達。', benefit: '高', investment: '高', difficulty: '中' },
      { id: 'man-en-2', name: '建置能源管理系統 (EMS)', description: '全面監控廠區能源流，進行數據分析與優化。', benefit: '高', investment: '高', difficulty: '高' },
    ],
    '循環經濟': [
      { id: 'man-ci-1', name: '實施廢棄物資源化處理', description: '將生產廢料回收再利用，或轉換為其他可用資源。', benefit: '高', investment: '高', difficulty: '高' },
      { id: 'man-ci-2', name: '製程水回收再利用', description: '建置廢水回收系統，降低水資源消耗。', benefit: '中', investment: '高', difficulty: '高' },
    ],
    '永續採購': [
      { id: 'man-su-1', name: '建立綠色供應鏈標準', description: '要求上游供應商提供產品碳足跡或相關環保認證。', benefit: '高', investment: '中', difficulty: '高' },
    ],
    '淨零管理': [
      { id: 'man-ne-1', name: '執行組織型碳盤查 (ISO 14064-1)', description: '系統性鑑別與量化溫室氣體排放源。', benefit: '高', investment: '中', difficulty: '高' },
    ]
  },
  // Add other industries with empty actions for now
  '營建業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '運輸業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '科技業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '金融業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '醫療保健': {
    '能源管理': [
      { id: 'hea-en-1', name: '醫療設備節能管理', description: '導入待機自動關機或節能模式的醫療設備。', benefit: '中', investment: '中', difficulty: '中' },
      { id: 'hea-en-2', name: '優化空調與通風系統', description: '針對病房、手術室等不同區域進行智慧溫控與換氣。', benefit: '高', investment: '高', difficulty: '高' },
    ],
    '循環經濟': [
      { id: 'hea-ci-1', name: '醫療廢棄物分類與減量', description: '推動感染性與非感染性廢棄物的精準分類，並減少一次性醫材使用。', benefit: '高', investment: '中', difficulty: '高' },
    ],
    '永續採購': [
      { id: 'hea-su-1', name: '採購低碳環保醫材', description: '優先選擇可回收、再利用或採用環保材質的醫療用品。', benefit: '中', investment: '中', difficulty: '中' },
    ],
    '淨零管理': [
      { id: 'hea-ne-1', name: '建立院內綠色行動小組', description: '成立專責小組，推動全院節能減碳文化與活動。', benefit: '低', investment: '低', difficulty: '低' },
    ],
  },
  '教育服務': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
  '旅宿業': { '能源管理': [], '循環經濟': [], '永續採購': [], '淨零管理': [] },
};
