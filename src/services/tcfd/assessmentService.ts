
import { supabase } from '@/integrations/supabase/client';
import { TCFDAssessment } from '@/types/tcfd';

export const createAssessment = async (data: {
  industry: string;
  company_size: string;
  has_carbon_inventory: boolean;
  has_international_operations?: boolean;
  annual_revenue_range?: string;
  supply_chain_carbon_disclosure?: string;
  has_sustainability_team?: string;
  main_emission_source?: string;
  business_description?: string;
  user_id: string;
}): Promise<TCFDAssessment> => {
  console.log('Creating assessment with data:', data);
  
  // 生成一個臨時 UUID 作為 user_id，用於暫時儲存資料
  const tempUserId = crypto.randomUUID();
  console.log('Generated temp user ID for storage:', tempUserId);
  
  const { data: newAssessment, error } = await supabase
    .from('tcfd_assessments')
    .insert({
      user_id: tempUserId,
      industry: data.industry,
      company_size: data.company_size,
      has_carbon_inventory: data.has_carbon_inventory,
      has_international_operations: data.has_international_operations,
      annual_revenue_range: data.annual_revenue_range,
      supply_chain_carbon_disclosure: data.supply_chain_carbon_disclosure,
      has_sustainability_team: data.has_sustainability_team,
      main_emission_source: data.main_emission_source,
      business_description: data.business_description,
      current_stage: 2, // 直接設定為第二階段
      status: 'in_progress'
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error details:', error);
    throw new Error(`無法創建評估：${error.message}`);
  }
  
  console.log('Assessment created successfully:', newAssessment);
  return newAssessment as TCFDAssessment;
};

export const loadAssessment = async (id: string): Promise<TCFDAssessment> => {
  console.log('Loading assessment with ID:', id);
  const { data, error } = await supabase
    .from('tcfd_assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Load assessment error:', error);
    throw new Error(`無法載入評估：${error.message}`);
  }
  
  console.log('Assessment loaded successfully:', data);
  return data as TCFDAssessment;
};

export const updateAssessmentStage = async (id: string, stage: number): Promise<void> => {
  console.log('Updating assessment stage:', { id, stage });
  const { error } = await supabase
    .from('tcfd_assessments')
    .update({ current_stage: stage, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Update stage error:', error);
    throw new Error(`無法更新階段：${error.message}`);
  }
  
  console.log('Assessment stage updated successfully to:', stage);
};
