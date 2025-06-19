
import { useState, useEffect } from 'react';
import { StrategyAnalysis } from '@/types/tcfd';
import * as strategyService from '@/services/tcfd/strategyService';

export const useTCFDStrategyAnalysis = (assessmentId?: string) => {
  const [strategyAnalysis, setStrategyAnalysis] = useState<StrategyAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  const saveStrategyAnalysis = async (analysis: Omit<StrategyAnalysis, 'id' | 'created_at'>) => {
    try {
      const data = await strategyService.saveStrategyAnalysis(analysis);
      setStrategyAnalysis(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const loadStrategyAnalysis = async () => {
    if (!assessmentId) return;
    
    try {
      const data = await strategyService.loadStrategyAnalysis(assessmentId);
      setStrategyAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const generateStrategyAnalysisWithLLM = async (
    scenarioDescription: string,
    userScore: number,
    industry: string
  ) => {
    try {
      return await strategyService.generateStrategyAnalysisWithLLM(
        scenarioDescription,
        userScore,
        industry
      );
    } catch (err) {
      console.error('Error in generateStrategyAnalysisWithLLM:', err);
      throw new Error(err instanceof Error ? err.message : '策略分析生成失敗');
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadStrategyAnalysis();
    }
  }, [assessmentId]);

  return {
    strategyAnalysis,
    error,
    saveStrategyAnalysis,
    loadStrategyAnalysis,
    generateStrategyAnalysisWithLLM,
  };
};
