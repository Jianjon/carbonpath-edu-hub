
-- 創建策略快取表
CREATE TABLE public.tcfd_strategy_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  category_type VARCHAR(20) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  subcategory_name VARCHAR(100),
  industry VARCHAR(50) NOT NULL,
  company_size VARCHAR(20) NOT NULL,
  strategies JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 創建索引以提升查詢效能
CREATE INDEX idx_tcfd_strategy_cache_key ON public.tcfd_strategy_cache(cache_key);
CREATE INDEX idx_tcfd_strategy_cache_category ON public.tcfd_strategy_cache(category_type, category_name, subcategory_name);
CREATE INDEX idx_tcfd_strategy_cache_business ON public.tcfd_strategy_cache(industry, company_size);

-- 創建更新時間的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tcfd_strategy_cache_updated_at 
BEFORE UPDATE ON public.tcfd_strategy_cache 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
