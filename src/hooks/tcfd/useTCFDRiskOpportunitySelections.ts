
import { useState, useEffect } from 'react';
import { RiskOpportunitySelection } from '@/types/tcfd';
import * as selectionService from '@/services/tcfd/selectionService';

export const useTCFDRiskOpportunitySelections = (assessmentId?: string) => {
  const [riskOpportunitySelections, setRiskOpportunitySelections] = useState<RiskOpportunitySelection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const saveRiskOpportunitySelections = async (selections: Omit<RiskOpportunitySelection, 'id' | 'created_at'>[]) => {
    if (!assessmentId) return;
    
    try {
      const data = await selectionService.saveRiskOpportunitySelections(assessmentId, selections);
      setRiskOpportunitySelections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const loadRiskOpportunitySelections = async () => {
    if (!assessmentId) return;
    
    try {
      const data = await selectionService.loadRiskOpportunitySelections(assessmentId);
      setRiskOpportunitySelections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadRiskOpportunitySelections();
    }
  }, [assessmentId]);

  return {
    riskOpportunitySelections,
    error,
    saveRiskOpportunitySelections,
    loadRiskOpportunitySelections,
  };
};
