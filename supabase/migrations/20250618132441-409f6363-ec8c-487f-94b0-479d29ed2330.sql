
-- 建立 TCFD 評估主表
CREATE TABLE public.tcfd_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  industry VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  has_carbon_inventory BOOLEAN NOT NULL DEFAULT false,
  current_stage INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 建立風險與機會類別選擇表
CREATE TABLE public.tcfd_risk_opportunity_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.tcfd_assessments(id) ON DELETE CASCADE NOT NULL,
  category_type VARCHAR(20) NOT NULL, -- 'risk' or 'opportunity'
  category_name VARCHAR(100) NOT NULL,
  subcategory_name VARCHAR(100),
  selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 建立子題評估表
CREATE TABLE public.tcfd_scenario_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.tcfd_assessments(id) ON DELETE CASCADE NOT NULL,
  risk_opportunity_id UUID REFERENCES public.tcfd_risk_opportunity_selections(id) ON DELETE CASCADE NOT NULL,
  scenario_description TEXT NOT NULL,
  scenario_generated_by_llm BOOLEAN NOT NULL DEFAULT true,
  user_score INTEGER CHECK (user_score >= 1 AND user_score <= 3),
  llm_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 建立策略與財務分析表
CREATE TABLE public.tcfd_strategy_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.tcfd_assessments(id) ON DELETE CASCADE NOT NULL,
  scenario_evaluation_id UUID REFERENCES public.tcfd_scenario_evaluations(id) ON DELETE CASCADE NOT NULL,
  detailed_description TEXT,
  financial_impact_pnl TEXT,
  financial_impact_cashflow TEXT,
  financial_impact_balance_sheet TEXT,
  strategy_avoid TEXT,
  strategy_accept TEXT,
  strategy_transfer TEXT,
  strategy_mitigate TEXT,
  selected_strategy VARCHAR(20),
  user_modifications TEXT,
  generated_by_llm BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 建立最終報告表
CREATE TABLE public.tcfd_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.tcfd_assessments(id) ON DELETE CASCADE NOT NULL,
  governance_content TEXT,
  strategy_content TEXT,
  risk_management_content TEXT,
  metrics_targets_content TEXT,
  disclosure_matrix JSONB,
  report_format_content TEXT,
  pdf_url TEXT,
  json_output JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE public.tcfd_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_risk_opportunity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_scenario_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_strategy_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcfd_reports ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策
CREATE POLICY "Users can view their own TCFD assessments" 
  ON public.tcfd_assessments 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own risk/opportunity selections" 
  ON public.tcfd_risk_opportunity_selections 
  FOR ALL 
  USING (assessment_id IN (SELECT id FROM public.tcfd_assessments WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own scenario evaluations" 
  ON public.tcfd_scenario_evaluations 
  FOR ALL 
  USING (assessment_id IN (SELECT id FROM public.tcfd_assessments WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own strategy analysis" 
  ON public.tcfd_strategy_analysis 
  FOR ALL 
  USING (assessment_id IN (SELECT id FROM public.tcfd_assessments WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own TCFD reports" 
  ON public.tcfd_reports 
  FOR ALL 
  USING (assessment_id IN (SELECT id FROM public.tcfd_assessments WHERE user_id = auth.uid()));

-- 建立索引優化查詢
CREATE INDEX idx_tcfd_assessments_user_id ON public.tcfd_assessments(user_id);
CREATE INDEX idx_tcfd_risk_opportunity_assessment_id ON public.tcfd_risk_opportunity_selections(assessment_id);
CREATE INDEX idx_tcfd_scenario_evaluations_assessment_id ON public.tcfd_scenario_evaluations(assessment_id);
CREATE INDEX idx_tcfd_strategy_analysis_assessment_id ON public.tcfd_strategy_analysis(assessment_id);
CREATE INDEX idx_tcfd_reports_assessment_id ON public.tcfd_reports(assessment_id);
