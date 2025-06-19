
-- 移除 tcfd_assessments 表格中的外鍵約束，允許使用臨時 UUID
ALTER TABLE public.tcfd_assessments DROP CONSTRAINT IF EXISTS tcfd_assessments_user_id_fkey;

-- 同樣處理其他可能有用戶 ID 外鍵約束的表格
ALTER TABLE public.tcfd_risk_opportunity_selections DROP CONSTRAINT IF EXISTS tcfd_risk_opportunity_selections_user_id_fkey;
ALTER TABLE public.tcfd_scenario_evaluations DROP CONSTRAINT IF EXISTS tcfd_scenario_evaluations_user_id_fkey;
ALTER TABLE public.tcfd_strategy_analysis DROP CONSTRAINT IF EXISTS tcfd_strategy_analysis_user_id_fkey;
ALTER TABLE public.tcfd_reports DROP CONSTRAINT IF EXISTS tcfd_reports_user_id_fkey;
