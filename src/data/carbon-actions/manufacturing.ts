
import { Action, ActionAngle } from '../../pages/CarbonCredits';

export const manufacturingActions: Record<ActionAngle, Action[]> = {
  '能源管理': [
    { id: 'man-en-1', name: '製程優化', description: '提升能源使用效率，降低單位產品能耗。', investment: '中' },
    { id: 'man-en-2', name: '廢熱回收', description: '將製程廢熱轉為可用能源，減少能源消耗。', investment: '中' },
    { id: 'man-en-3', name: '鍋爐效率提升', description: '提高燃料使用效率，減少排放。', investment: '中' },
    { id: 'man-en-4', name: '壓縮空氣系統優化', description: '降低壓縮空氣洩漏，減少電力消耗。', investment: '中' },
    { id: 'man-en-5', name: '馬達變頻化', description: '依需求調整馬達轉速，節省電力。', investment: '中' },
    { id: 'man-en-6', name: '智能照明', description: '依需求調整照明亮度，減少照明用電。', investment: '低' },
    { id: 'man-en-7', name: '廠房屋頂太陽能', description: '利用閒置空間發電，降低外購電力。', investment: '高' },
    { id: 'man-en-8', name: '能源管理系統', description: '監控與分析能源使用，找出節能機會。', investment: '中' },
    { id: 'man-en-9', name: '電力監控', description: '即時掌握電力消耗，避免浪費。', investment: '中' },
    { id: 'man-en-10', name: '員工節能教育', description: '提升員工節能意識，落實節能措施。', investment: '低' },
  ],
  '循環經濟': [
    { id: 'man-ci-1', name: '廢料回收再利用', description: '將製程廢料轉為再生資源，減少廢棄物。', investment: '低' },
    { id: 'man-ci-2', name: '工業用水循環', description: '提高水資源利用率，減少用水量。', investment: '中' },
    { id: 'man-ci-3', name: '產品生命週期評估', description: '從設計階段減少資源消耗與環境衝擊。', investment: '中' },
    { id: 'man-ci-4', name: '生產廢棄物減量', description: '減少製程產生的廢棄物。', investment: '低' },
    { id: 'man-ci-5', name: '材料替代（再生材料）', description: '使用再生材料，降低對原生資源的依賴。', investment: '中' },
    { id: 'man-ci-6', name: '餘料拍賣', description: '將剩餘材料出售或捐贈，減少浪費。', investment: '低' },
    { id: 'man-ci-7', name: '產品模組化設計', description: '方便維修與升級，延長產品壽命。', investment: '中' },
    { id: 'man-ci-8', name: '包裝減量', description: '減少產品包裝材料的使用。', investment: '低' },
    { id: 'man-ci-9', name: '共用設施', description: '不同廠商共用設備或資源，提高使用效率。', investment: '中' },
    { id: 'man-ci-10', name: '廢棄物能源化', description: '將廢棄物轉為能源，減少掩埋。', investment: '高' },
  ],
  '永續採購': [
    { id: 'man-su-1', name: '採購節能環保設備', description: '降低設備運作時的能源消耗與環境影響。', investment: '中' },
    { id: 'man-su-2', name: '綠色原物料採購', description: '選擇對環境友善的原物料。', investment: '中' },
    { id: 'man-su-3', name: '永續供應商評估', description: '確保供應商符合環境與社會責任標準。', investment: '中' },
    { id: 'man-su-4', name: '在地供應鏈', description: '縮短運輸距離，減少碳排放。', investment: '中' },
    { id: 'man-su-5', name: '可回收包材採購', description: '減少包裝廢棄物。', investment: '低' },
    { id: 'man-su-6', name: '無毒無害化學品', description: '降低對環境與人體的危害。', investment: '低' },
    { id: 'man-su-7', name: '供應商碳足跡要求', description: '要求供應商提供產品碳足跡資訊。', investment: '中' },
    { id: 'man-su-8', name: '產品綠色設計協作', description: '與供應商共同設計更環保的產品。', investment: '中' },
    { id: 'man-su-9', name: '逆物流合作', description: '建立產品回收系統，促進循環利用。', investment: '中' },
    { id: 'man-su-10', name: '循環經濟採購模式', description: '採用產品租賃或回收等循環經濟模式。', investment: '中' },
  ],
  '淨零管理': [
    { id: 'man-ne-1', name: '碳盤查與減排目標', description: '了解碳排放來源，設定減排目標。', investment: '中' },
    { id: 'man-ne-2', name: '綠電導入', description: '使用再生能源，降低電力碳排放。', investment: '中' },
    { id: 'man-ne-3', name: '負碳技術評估', description: '評估碳捕捉與封存等技術。', investment: '高' },
    { id: 'man-ne-4', name: '供應鏈減碳合作', description: '與供應商共同減少碳排放。', investment: '中' },
    { id: 'man-ne-5', name: '綠色產品開發', description: '設計生產更環保的產品。', investment: '中' },
    { id: 'man-ne-6', name: 'ESG報告', description: '揭露企業在環境、社會與公司治理方面的表現。', investment: '中' },
    { id: 'man-ne-7', name: '碳權管理', description: '參與碳交易或碳抵換。', investment: '中' },
    { id: 'man-ne-8', name: '智慧能源管理平台', description: '利用科技優化能源使用。', investment: '中' },
    { id: 'man-ne-9', name: '員工淨零培訓', description: '提升員工對淨零的認識與參與。', investment: '低' },
    { id: 'man-ne-10', name: '永續金融導入', description: '尋求綠色貸款或發行綠色債券。', investment: '中' },
  ]
};
