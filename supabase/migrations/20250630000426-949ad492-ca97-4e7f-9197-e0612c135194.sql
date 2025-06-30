
-- 更新 tcfd_scenario_evaluations 表以支援策略選擇
ALTER TABLE tcfd_scenario_evaluations 
ADD COLUMN IF NOT EXISTS selected_strategy varchar(50),
ADD COLUMN IF NOT EXISTS strategy_description text,
ADD COLUMN IF NOT EXISTS custom_scenario_context text;

-- 創建策略選項的枚舉類型（如果不存在）
DO $$ BEGIN
    CREATE TYPE strategy_type AS ENUM (
        -- 風險策略
        'mitigate', 'transfer', 'accept', 'control',
        -- 機會策略  
        'explore', 'build', 'transform', 'collaborate', 'invest'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 更新表結構以使用策略類型
ALTER TABLE tcfd_scenario_evaluations 
ADD COLUMN IF NOT EXISTS strategy_type strategy_type;
