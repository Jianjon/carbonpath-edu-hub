-- Enable RLS on tcfd_scenario_evaluations table if not already enabled
ALTER TABLE public.tcfd_scenario_evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with proper security
DROP POLICY IF EXISTS "Users can view their own scenario evaluations" ON public.tcfd_scenario_evaluations;

-- Create comprehensive RLS policies for tcfd_scenario_evaluations
-- Users can only view their own scenario evaluations
CREATE POLICY "Users can view their own scenario evaluations"
ON public.tcfd_scenario_evaluations
FOR SELECT
TO authenticated
USING (
  assessment_id IN (
    SELECT id FROM public.tcfd_assessments 
    WHERE user_id = auth.uid()
  )
);

-- Users can only insert scenario evaluations for their own assessments
CREATE POLICY "Users can insert their own scenario evaluations"
ON public.tcfd_scenario_evaluations
FOR INSERT
TO authenticated
WITH CHECK (
  assessment_id IN (
    SELECT id FROM public.tcfd_assessments 
    WHERE user_id = auth.uid()
  )
);

-- Users can only update their own scenario evaluations
CREATE POLICY "Users can update their own scenario evaluations"
ON public.tcfd_scenario_evaluations
FOR UPDATE
TO authenticated
USING (
  assessment_id IN (
    SELECT id FROM public.tcfd_assessments 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  assessment_id IN (
    SELECT id FROM public.tcfd_assessments 
    WHERE user_id = auth.uid()
  )
);

-- Users can only delete their own scenario evaluations
CREATE POLICY "Users can delete their own scenario evaluations"
ON public.tcfd_scenario_evaluations
FOR DELETE
TO authenticated
USING (
  assessment_id IN (
    SELECT id FROM public.tcfd_assessments 
    WHERE user_id = auth.uid()
  )
);

-- Ensure tcfd_assessments also has proper RLS enabled
ALTER TABLE public.tcfd_assessments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate tcfd_assessments policies for consistency
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.tcfd_assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.tcfd_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.tcfd_assessments;
DROP POLICY IF EXISTS "Users can delete their own assessments" ON public.tcfd_assessments;

-- Create comprehensive RLS policies for tcfd_assessments
CREATE POLICY "Users can view their own assessments"
ON public.tcfd_assessments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own assessments"
ON public.tcfd_assessments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own assessments"
ON public.tcfd_assessments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own assessments"
ON public.tcfd_assessments
FOR DELETE
TO authenticated
USING (user_id = auth.uid());