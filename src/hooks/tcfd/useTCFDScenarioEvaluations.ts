
import { useState, useEffect } from 'react';
import { ScenarioEvaluation } from '@/types/tcfd';
import * as scenarioService from '@/services/tcfd/scenarioService';

export const useTCFDScenarioEvaluations = (assessmentId?: string) => {
  const [scenarioEvaluations, setScenarioEvaluations] = useState<ScenarioEvaluation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const saveScenarioEvaluation = async (evaluation: Omit<ScenarioEvaluation, 'id' | 'created_at'>) => {
    try {
      const data = await scenarioService.saveScenarioEvaluation(evaluation);
      setScenarioEvaluations(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const loadScenarioEvaluations = async () => {
    if (!assessmentId) return;
    
    try {
      const data = await scenarioService.loadScenarioEvaluations(assessmentId);
      setScenarioEvaluations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const generateScenarioWithLLM = async (
    categoryType: 'risk' | 'opportunity',
    categoryName: string,
    subcategoryName: string,
    industry: string
  ) => {
    try {
      return await scenarioService.generateScenarioWithLLM(
        categoryType,
        categoryName,
        subcategoryName,
        industry
      );
    } catch (err) {
      console.error('Error in generateScenarioWithLLM:', err);
      throw new Error(err instanceof Error ? err.message : 'LLM 情境生成失敗');
    }
  };

  const generateScenarioAnalysisWithLLM = async (
    scenarioDescription: string,
    userScore: number,
    industry: string
  ) => {
    try {
      return await scenarioService.generateScenarioAnalysisWithLLM(
        scenarioDescription,
        userScore,
        industry
      );
    } catch (err) {
      console.error('Error in generateScenarioAnalysisWithLLM:', err);
      throw new Error(err instanceof Error ? err.message : 'LLM 情境分析生成失敗');
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadScenarioEvaluations();
    }
  }, [assessmentId]);

  return {
    scenarioEvaluations,
    error,
    saveScenarioEvaluation,
    loadScenarioEvaluations,
    generateScenarioWithLLM,
    generateScenarioAnalysisWithLLM,
  };
};
