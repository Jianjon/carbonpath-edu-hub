
-- 暫時停用 TCFD 相關表格的 RLS，讓資料可以暫時儲存
ALTER TABLE public.tcfd_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_risk_opportunity_selections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_scenario_evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_strategy_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_reports DISABLE ROW LEVEL SECURITY;

-- 移除之前創建的 RLS 政策
DROP POLICY IF EXISTS "Users can view their own TCFD assessments" ON public.tcfd_assessments;
DROP POLICY IF EXISTS "Users can create their own TCFD assessments" ON public.tcfd_assessments;
DROP POLICY IF EXISTS "Users can update their own TCFD assessments" ON public.tcfd_assessments;
DROP POLICY IF EXISTS "Users can delete their own TCFD assessments" ON public.tcfd_assessments;
DROP POLICY IF EXISTS "Users can manage their own risk/opportunity selections" ON public.tcfd_risk_opportunity_selections;
DROP POLICY IF EXISTS "Users can manage their own scenario evaluations" ON public.tcfd_scenario_evaluations;
DROP POLICY IF EXISTS "Users can manage their own strategy analysis" ON public.tcfd_strategy_analysis;
DROP POLICY IF EXISTS "Users can manage their own TCFD reports" ON public.tcfd_reports;
