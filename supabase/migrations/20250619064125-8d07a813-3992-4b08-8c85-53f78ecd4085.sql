
-- Add missing columns to tcfd_assessments table
ALTER TABLE tcfd_assessments ADD COLUMN IF NOT EXISTS has_international_operations BOOLEAN;
ALTER TABLE tcfd_assessments ADD COLUMN IF NOT EXISTS annual_revenue_range TEXT;
ALTER TABLE tcfd_assessments ADD COLUMN IF NOT EXISTS supply_chain_carbon_disclosure TEXT;
ALTER TABLE tcfd_assessments ADD COLUMN IF NOT EXISTS has_sustainability_team TEXT;
ALTER TABLE tcfd_assessments ADD COLUMN IF NOT EXISTS main_emission_source TEXT;
ALTER TABLE tcfd_assessments ADD COLUMN IF NOT EXISTS business_description TEXT;
