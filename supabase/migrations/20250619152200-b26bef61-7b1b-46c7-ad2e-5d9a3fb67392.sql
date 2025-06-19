
-- 為各個 TCFD 相關表格添加示範數據標記欄位
ALTER TABLE tcfd_assessments ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT FALSE;
ALTER TABLE tcfd_risk_opportunity_selections ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT FALSE;
ALTER TABLE tcfd_scenario_evaluations ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT FALSE;
ALTER TABLE tcfd_strategy_analysis ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT FALSE;
ALTER TABLE tcfd_reports ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT FALSE;

-- 建立索引以加快查詢示範數據的速度
CREATE INDEX IF NOT EXISTS idx_tcfd_assessments_demo ON tcfd_assessments(is_demo_data) WHERE is_demo_data = true;
CREATE INDEX IF NOT EXISTS idx_tcfd_assessments_industry_size ON tcfd_assessments(industry, company_size) WHERE is_demo_data = true;
