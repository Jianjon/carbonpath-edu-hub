
import { Action, ActionAngle, Industry } from '../pages/CarbonCredits';
import { restaurantActions } from './carbon-actions/restaurant';
import { retailActions } from './carbon-actions/retail';
import { manufacturingActions } from './carbon-actions/manufacturing';
import { constructionActions } from './carbon-actions/construction';
import { transportationActions } from './carbon-actions/transportation';
import { technologyActions } from './carbon-actions/technology';
import { financeActions } from './carbon-actions/finance';
import { healthcareActions } from './carbon-actions/healthcare';
import { educationActions } from './carbon-actions/education';
import { hospitalityActions } from './carbon-actions/hospitality';

export const industries: Industry[] = ['餐飲業', '零售業', '製造業', '營建業', '運輸業', '科技業', '金融業', '醫療保健', '教育服務', '旅宿業'];
export const actionAngles: ActionAngle[] = ['能源管理', '循環經濟', '永續採購', '淨零管理'];

type ActionData = Record<Industry, Record<ActionAngle, Action[]>>;

export const actionsData: ActionData = {
  '餐飲業': restaurantActions,
  '零售業': retailActions,
  '製造業': manufacturingActions,
  '營建業': constructionActions,
  '運輸業': transportationActions,
  '科技業': technologyActions,
  '金融業': financeActions,
  '醫療保健': healthcareActions,
  '教育服務': educationActions,
  '旅宿業': hospitalityActions,
};
