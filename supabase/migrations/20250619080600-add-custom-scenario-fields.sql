
-- Add custom_scenario_description to tcfd_risk_opportunity_selections table
ALTER TABLE tcfd_risk_opportunity_selections 
ADD COLUMN IF NOT EXISTS custom_scenario_description text;

-- Add selected_strategy to tcfd_scenario_evaluations table  
ALTER TABLE tcfd_scenario_evaluations 
ADD COLUMN IF NOT EXISTS selected_strategy character varying;
