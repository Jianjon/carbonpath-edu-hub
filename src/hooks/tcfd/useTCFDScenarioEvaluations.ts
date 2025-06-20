
import { useState, useEffect } from 'react';
import { ScenarioEvaluation } from '@/types/tcfd';
import * as scenarioService from '@/services/tcfd/scenarioService';

export const useTCFDScenarioEvaluations = (assessmentId?: string) => {
  const [scenarioEvaluations, setScenarioEvaluations] = useState<ScenarioEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveScenarioEvaluation = async (evaluation: Omit<ScenarioEvaluation, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await scenarioService.saveScenarioEvaluation(evaluation);
      
      // 更新本地狀態
      setScenarioEvaluations(prev => {
        const existingIndex = prev.findIndex(item => 
          item.assessment_id === evaluation.assessment_id && 
          item.risk_opportunity_id === evaluation.risk_opportunity_id
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadScenarioEvaluations = async () => {
    if (!assessmentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await scenarioService.loadScenarioEvaluations(assessmentId);
      setScenarioEvaluations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateScenarioWithLLM = async (
    categoryType: 'risk' | 'opportunity',
    categoryName: string,
    subcategoryName: string,
    industry: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      return await scenarioService.generateScenarioWithLLM(categoryType, categoryName, subcategoryName, industry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateScenarioAnalysisWithLLM = async (
    scenarioDescription: string,
    userScore: number,
    industry: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      return await scenarioService.generateScenarioAnalysisWithLLM(scenarioDescription, userScore, industry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 新增綜合情境分析函數
  const generateComprehensiveScenarioAnalysis = async (
    categoryType: 'risk' | 'opportunity',
    categoryName: string,
    subcategoryName: string,
    scenarioDescription: string,
    userScore: number,
    industry: string,
    companySize: string,
    businessDescription?: string,
    userCustomInputs?: any
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await fetch('/api/tcfd-llm-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'comprehensive_scenario_analysis',
          categoryType,
          categoryName,
          subcategoryName,
          scenarioDescription,
          userScore,
          industry,
          companySize,
          businessDescription,
          userCustomInputs
        })
      }).then(res => res.json());

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate comprehensive analysis');
      }

      return data.content;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentId) {
      loadScenarioEvaluations();
    }
  }, [assessmentId]);

  return {
    scenarioEvaluations,
    loading,
    error,
    saveScenarioEvaluation,
    loadScenarioEvaluations,
    generateScenarioWithLLM,
    generateScenarioAnalysisWithLLM,
    generateComprehensiveScenarioAnalysis,
  };
};
