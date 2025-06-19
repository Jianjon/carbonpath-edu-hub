
import { useState, useEffect } from 'react';
import { TCFDReport } from '@/types/tcfd';
import * as reportService from '@/services/tcfd/reportService';

export const useTCFDReport = (assessmentId?: string) => {
  const [report, setReport] = useState<TCFDReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (reportData: Omit<TCFDReport, 'id' | 'generated_at'>) => {
    try {
      const data = await reportService.generateReport(reportData);
      setReport(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const loadReport = async () => {
    if (!assessmentId) return;
    
    try {
      const data = await reportService.loadReport(assessmentId);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadReport();
    }
  }, [assessmentId]);

  return {
    report,
    error,
    generateReport,
    loadReport,
  };
};
