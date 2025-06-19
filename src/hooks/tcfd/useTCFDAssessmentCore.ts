
import { useState, useEffect } from 'react';
import { TCFDAssessment } from '@/types/tcfd';
import * as assessmentService from '@/services/tcfd/assessmentService';

export const useTCFDAssessmentCore = (assessmentId?: string) => {
  const [assessment, setAssessment] = useState<TCFDAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAssessment = async (data: {
    industry: string;
    company_size: string;
    has_carbon_inventory: boolean;
    has_international_operations?: boolean;
    annual_revenue_range?: string;
    supply_chain_carbon_disclosure?: string;
    has_sustainability_team?: string;
    main_emission_source?: string;
    business_description?: string;
    user_id: string;
  }) => {
    setLoading(true);
    try {
      const newAssessment = await assessmentService.createAssessment(data);
      setAssessment(newAssessment);
      return newAssessment;
    } catch (err) {
      console.error('Create assessment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadAssessment = async (id: string) => {
    setLoading(true);
    try {
      const data = await assessmentService.loadAssessment(id);
      setAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateAssessmentStage = async (stage: number) => {
    if (!assessment) return;
    
    try {
      await assessmentService.updateAssessmentStage(assessment.id, stage);
      setAssessment(prev => prev ? { ...prev, current_stage: stage } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    }
  }, [assessmentId]);

  return {
    assessment,
    loading,
    error,
    createAssessment,
    loadAssessment,
    updateAssessmentStage,
  };
};
