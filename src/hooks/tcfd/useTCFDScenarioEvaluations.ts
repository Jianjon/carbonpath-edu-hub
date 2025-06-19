
import { useState, useEffect } from 'react';
import { ScenarioEvaluation } from '@/types/tcfd';
import * as scenarioService from '@/services/tcfd/scenarioService';
import * as comprehensiveScenarioService from '@/services/tcfd/comprehensiveScenarioService';

export const useTCFDScenarioEvaluations = (assessmentId?: string) => {
  const [scenarioEvaluations, setScenarioEvaluations] = useState<ScenarioEvaluation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const saveScenarioEvaluation = async (evaluation: Omit<ScenarioEvaluation, 'id' | 'created_at'>) => {
    try {
      const data = await scenarioService.saveScenarioEvaluation(evaluation);
      
      // 更新本地狀態
      setScenarioEvaluations(prev => {
        const existingIndex = prev.findIndex(e => e.risk_opportunity_id === evaluation.risk_opportunity_id);
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
    }
  };

  const loadScenarioEvaluations = async () => {
    if (!assessmentId) return;
    
    try {
      const data = await scenarioService.loadScenarioEvaluations(assessmentId);
      setScenarioEvaluations(data);
      console.log('載入情境評估資料:', data);
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
      // 檢查是否已有相同參數的情境
      const existingScenario = scenarioEvaluations.find(e => 
        e.scenario_description && 
        e.scenario_description.length > 0
      );

      if (existingScenario) {
        console.log('使用現有的情境描述');
        return { scenario_description: existingScenario.scenario_description };
      }

      return await scenario Service.generateScenarioWithLLM(
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

  const generateComprehensiveScenarioAnalysis = async (
    categoryType: 'risk' | 'opportunity',
    categoryName: string,
    subcategoryName: string,
    scenarioDescription: string,
    userScore: number,
    industry: string,
    companySize: string
  ) => {
    try {
      return await comprehensiveScenarioService.generateComprehensiveScenarioAnalysis(
        categoryType,
        categoryName,
        subcategoryName,
        scenarioDescription,
        userScore,
        industry,
        companySize
      );
    } catch (err) {
      console.error('Error in generateComprehensiveScenarioAnalysis:', err);
      throw new Error(err instanceof Error ? err.message : '綜合情境分析生成失敗');
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
    generateComprehensiveScenarioAnalysis,
  };
};
