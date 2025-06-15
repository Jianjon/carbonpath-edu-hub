
import { Action, Industry } from '../pages/CarbonCredits';

export const actionsData: Record<Industry, Action[]> = {
  '餐飲業': [
    { id: 'restaurant-1', name: '換裝節能LED燈具', type: '能源', reduction: 5, investment: 50000, roi: 25, difficulty: '低' },
    { id: 'restaurant-2', name: '引進廚餘高效堆肥機', type: '循環', reduction: 10, investment: 200000, roi: 15, difficulty: '中' },
    { id: 'restaurant-3', name: '採用節水洗碗系統', type: '循環', reduction: 3, investment: 150000, roi: 10, difficulty: '中' },
    { id: 'restaurant-4', name: '優化外送路線與包材', type: '製程', reduction: 2, investment: 20000, roi: 30, difficulty: '低' },
  ],
  '零售業': [
    { id: 'retail-1', name: '更換為變頻節能空調', type: '能源', reduction: 20, investment: 500000, roi: 20, difficulty: '中' },
    { id: 'retail-2', name: '導入智慧能源監控系統', type: '能源', reduction: 15, investment: 300000, roi: 22, difficulty: '中' },
    { id: 'retail-3', name: '推動綠色包裝與回收', type: '循環', reduction: 8, investment: 80000, roi: 12, difficulty: '低' },
    { id: 'retail-4', name: '優化物流配送路線', type: '製程', reduction: 12, investment: 100000, roi: 25, difficulty: '高' },
  ],
  '製造業': [
    { id: 'manu-1', name: '建置工業餘熱回收系統', type: '製程', reduction: 100, investment: 2000000, roi: 18, difficulty: '高' },
    { id: 'manu-2', name: '製程導入氣電共生設備', type: '能源', reduction: 150, investment: 5000000, roi: 15, difficulty: '高' },
    { id: 'manu-3', name: '汰換老舊高耗能馬達', type: '能源', reduction: 50, investment: 800000, roi: 25, difficulty: '中' },
    { id: 'manu-4', name: '實施廢棄物資源化處理', type: '循環', reduction: 30, investment: 400000, roi: 10, difficulty: '中' },
  ],
};
