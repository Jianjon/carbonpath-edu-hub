
import { supabase } from '@/integrations/supabase/client';
import { RiskOpportunitySelection } from '@/types/tcfd';

export const saveRiskOpportunitySelections = async (
  assessmentId: string,
  selections: Omit<RiskOpportunitySelection, 'id' | 'created_at'>[]
): Promise<RiskOpportunitySelection[]> => {
  // 先刪除現有選擇
  await supabase
    .from('tcfd_risk_opportunity_selections')
    .delete()
    .eq('assessment_id', assessmentId);

  // 插入新選擇
  const { data, error } = await supabase
    .from('tcfd_risk_opportunity_selections')
    .insert(selections)
    .select();

  if (error) throw error;
  return data as RiskOpportunitySelection[];
};

export const loadRiskOpportunitySelections = async (assessmentId: string): Promise<RiskOpportunitySelection[]> => {
  const { data, error } = await supabase
    .from('tcfd_risk_opportunity_selections')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (error) throw error;
  return data as RiskOpportunitySelection[];
};
