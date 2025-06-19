
import { supabase } from '@/integrations/supabase/client';
import { TCFDReport } from '@/types/tcfd';

export const generateReport = async (
  reportData: Omit<TCFDReport, 'id' | 'generated_at'>
): Promise<TCFDReport> => {
  const { data, error } = await supabase
    .from('tcfd_reports')
    .insert(reportData)
    .select()
    .single();

  if (error) throw error;
  return data as TCFDReport;
};

export const loadReport = async (assessmentId: string): Promise<TCFDReport | null> => {
  const { data, error } = await supabase
    .from('tcfd_reports')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as TCFDReport | null;
};
