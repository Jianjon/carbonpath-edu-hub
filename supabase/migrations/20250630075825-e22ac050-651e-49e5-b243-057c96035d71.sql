
-- 擴展現有快取系統，新增情境描述快取表
CREATE TABLE public.tcfd_scenario_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  category_type VARCHAR(20) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  subcategory_name VARCHAR(100),
  industry VARCHAR(50) NOT NULL,
  company_size VARCHAR(20) NOT NULL,
  scenario_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 新增財務分析快取表
CREATE TABLE public.tcfd_financial_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  category_type VARCHAR(20) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  subcategory_name VARCHAR(100),
  industry VARCHAR(50) NOT NULL,
  company_size VARCHAR(20) NOT NULL,
  strategy_type VARCHAR(50) NOT NULL,
  profit_loss_analysis TEXT,
  cash_flow_analysis TEXT,
  balance_sheet_analysis TEXT,
  strategy_feasibility_analysis TEXT,
  analysis_methodology TEXT,
  calculation_method_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 建立索引提升查詢效能
CREATE INDEX idx_tcfd_scenario_cache_key ON public.tcfd_scenario_cache(cache_key);
CREATE INDEX idx_tcfd_scenario_cache_category ON public.tcfd_scenario_cache(category_type, category_name, subcategory_name);
CREATE INDEX idx_tcfd_scenario_cache_business ON public.tcfd_scenario_cache(industry, company_size);

CREATE INDEX idx_tcfd_financial_cache_key ON public.tcfd_financial_analysis_cache(cache_key);
CREATE INDEX idx_tcfd_financial_cache_category ON public.tcfd_financial_analysis_cache(category_type, category_name, subcategory_name);
CREATE INDEX idx_tcfd_financial_cache_business ON public.tcfd_financial_analysis_cache(industry, company_size);
CREATE INDEX idx_tcfd_financial_cache_strategy ON public.tcfd_financial_analysis_cache(strategy_type);

-- 新增更新時間觸發器
CREATE TRIGGER update_tcfd_scenario_cache_updated_at 
BEFORE UPDATE ON public.tcfd_scenario_cache 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tcfd_financial_analysis_cache_updated_at 
BEFORE UPDATE ON public.tcfd_financial_analysis_cache 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
