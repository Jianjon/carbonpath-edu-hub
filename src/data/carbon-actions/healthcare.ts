
import { Action, ActionAngle } from '../../pages/CarbonCredits';

export const healthcareActions: Record<ActionAngle, Action[]> = {
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
};
