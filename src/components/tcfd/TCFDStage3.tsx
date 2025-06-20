import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateStrategyAnalysisWithLLM, loadStrategyAnalysis, saveStrategyAnalysis } from '@/services/tcfd/strategyService';
import { StrategyAnalysis } from '@/types/tcfd';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TCFDStage3Props {
  assessment: any;
  onNext: () => void;
  onPrevious: () => void;
}

const TCFDStage3: React.FC<TCFDStage3Props> = ({ 
  assessment, 
  onNext, 
  onPrevious 
}) => {
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [userScore, setUserScore] = useState<number | undefined>(undefined);
  const [strategyAnalysis, setStrategyAnalysis] = useState<StrategyAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [financialImpactPNL, setFinancialImpactPNL] = useState('');
  const [financialImpactBalanceSheet, setFinancialImpactBalanceSheet] = useState('');
  const [financialImpactCashflow, setFinancialImpactCashflow] = useState('');
  const [strategyAccept, setStrategyAccept] = useState('');
  const [strategyAvoid, setStrategyAvoid] = useState('');
  const [strategyMitigate, setStrategyMitigate] = useState('');
  const [strategyTransfer, setStrategyTransfer] = useState('');
  const [userModifications, setUserModifications] = useState('');

  useEffect(() => {
    if (assessment?.id) {
      loadExistingStrategyAnalysis(assessment.id);
    }
  }, [assessment?.id]);

  const loadExistingStrategyAnalysis = async (assessmentId: string) => {
    setIsLoading(true);
    try {
      const data = await loadStrategyAnalysis(assessmentId);
      setStrategyAnalysis(data);
      if (data.length > 0) {
        const firstAnalysis = data[0];
        setScenarioDescription(firstAnalysis.scenario_evaluation_id || '');
        setUserScore(0);
        setSelectedStrategy(firstAnalysis.selected_strategy || '');
        setDetailedDescription(firstAnalysis.detailed_description || '');
        setFinancialImpactPNL(firstAnalysis.financial_impact_pnl || '');
        setFinancialImpactBalanceSheet(firstAnalysis.financial_impact_balance_sheet || '');
        setFinancialImpactCashflow(firstAnalysis.financial_impact_cashflow || '');
        setStrategyAccept(firstAnalysis.strategy_accept || '');
        setStrategyAvoid(firstAnalysis.strategy_avoid || '');
        setStrategyMitigate(firstAnalysis.strategy_mitigate || '');
        setStrategyTransfer(firstAnalysis.strategy_transfer || '');
        setUserModifications(firstAnalysis.user_modifications || '');
      }
    } catch (error: any) {
      toast.error(`Failed to load strategy analysis: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!scenarioDescription || !userScore) {
      toast.error('Please provide both scenario description and user score.');
      return;
    }

    setIsGenerating(true);
    try {
      // Try to get from cache first
      const { data: cacheData, error: cacheError } = await supabase.functions.invoke('tcfd-strategy-cache', {
        body: {
          industry: assessment.industry,
          companySize: assessment.company_size,
          categoryType: 'risk', // This should be determined based on the scenario
          categoryName: 'transition_policy', // This should be determined based on the scenario
          subcategoryName: null
        }
      });

      let generatedContent;
      if (cacheData && cacheData.success && cacheData.strategies) {
        console.log('Using cached strategy content');
        generatedContent = cacheData.strategies;
        toast.success('策略分析已從快取載入！');
      } else {
        console.log('Cache miss, generating new content');
        generatedContent = await generateStrategyAnalysisWithLLM(
          scenarioDescription,
          userScore,
          assessment.industry
        );
        toast.success('Strategy analysis generated successfully!');
      }

      // Assuming the API returns an array of StrategyAnalysis
      setStrategyAnalysis([generatedContent]);
    } catch (error: any) {
      console.error('Error generating strategy analysis:', error);
      toast.error(`Failed to generate strategy analysis: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!assessment?.id) {
      toast.error('Assessment ID is missing.');
      return;
    }

    setIsLoading(true);
    try {
      const analysisToSave: Omit<StrategyAnalysis, 'id' | 'created_at'> = {
        assessment_id: assessment.id,
        scenario_evaluation_id: scenarioDescription,
        selected_strategy: selectedStrategy,
        detailed_description: detailedDescription,
        financial_impact_pnl: financialImpactPNL,
        financial_impact_balance_sheet: financialImpactBalanceSheet,
        financial_impact_cashflow: financialImpactCashflow,
        strategy_accept: strategyAccept,
        strategy_avoid: strategyAvoid,
        strategy_mitigate: strategyMitigate,
        strategy_transfer: strategyTransfer,
        user_modifications: userModifications,
        generated_by_llm: true,
        is_demo_data: assessment.is_demo_data,
      };

      await saveStrategyAnalysis(analysisToSave);
      toast.success('Strategy analysis saved successfully!');
    } catch (error: any) {
      console.error('Error saving strategy analysis:', error);
      toast.error(`Failed to save strategy analysis: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrategyContent = (strategy: any): string => {
    if (!strategy) return '';
    
    if (typeof strategy === 'string') {
      return strategy;
    }
    
    if (typeof strategy === 'object' && strategy !== null) {
      return strategy.description || strategy.content || JSON.stringify(strategy);
    }
    
    return String(strategy);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>情境分析</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="scenario">情境描述</Label>
            <Input
              id="scenario"
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="score">使用者評分 (1-5)</Label>
            <Input
              id="score"
              type="number"
              min="1"
              max="5"
              value={userScore === undefined ? '' : userScore.toString()}
              onChange={(e) => setUserScore(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleGenerateStrategy} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                產生中...
              </>
            ) : (
              "產生策略分析"
            )}
          </Button>
        </CardContent>
      </Card>

      {strategyAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>策略分析結果</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="selectedStrategy">選擇策略</Label>
              <Select
                onValueChange={setSelectedStrategy}
                defaultValue={selectedStrategy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇一個策略" />
                </SelectTrigger>
                <SelectContent>
                  {strategyAnalysis.map((analysis, index) => (
                    <SelectItem key={index} value={`Strategy ${index + 1}`}>
                      策略 {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">詳細描述</Label>
              <Textarea
                id="description"
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="輸入詳細描述"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="financialImpactPNL">財務影響 (損益表)</Label>
              <Input
                id="financialImpactPNL"
                value={financialImpactPNL}
                onChange={(e) => setFinancialImpactPNL(e.target.value)}
                placeholder="輸入財務影響 (損益表)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="financialImpactBalanceSheet">財務影響 (資產負債表)</Label>
              <Input
                id="financialImpactBalanceSheet"
                value={financialImpactBalanceSheet}
                onChange={(e) => setFinancialImpactBalanceSheet(e.target.value)}
                placeholder="輸入財務影響 (資產負債表)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="financialImpactCashflow">財務影響 (現金流量表)</Label>
              <Input
                id="financialImpactCashflow"
                value={financialImpactCashflow}
                onChange={(e) => setFinancialImpactCashflow(e.target.value)}
                placeholder="輸入財務影響 (現金流量表)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="strategyAccept">接受策略</Label>
              <Textarea
                id="strategyAccept"
                value={strategyAccept}
                onChange={(e) => setStrategyAccept(e.target.value)}
                placeholder="輸入接受策略"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="strategyAvoid">避免策略</Label>
              <Textarea
                id="strategyAvoid"
                value={strategyAvoid}
                onChange={(e) => setStrategyAvoid(e.target.value)}
                placeholder="輸入避免策略"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="strategyMitigate">減輕策略</Label>
              <Textarea
                id="strategyMitigate"
                value={strategyMitigate}
                onChange={(e) => setStrategyMitigate(e.target.value)}
                placeholder="輸入減輕策略"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="strategyTransfer">轉移策略</Label>
              <Textarea
                id="strategyTransfer"
                value={strategyTransfer}
                onChange={(e) => setStrategyTransfer(e.target.value)}
                placeholder="輸入轉移策略"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userModifications">使用者修改</Label>
              <Textarea
                id="userModifications"
                value={userModifications}
                onChange={(e) => setUserModifications(e.target.value)}
                placeholder="輸入使用者修改"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          返回
        </Button>
        <Button onClick={onNext} disabled={isLoading}>
          {isLoading ? (
            <>
              儲存中...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "下一步"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage3;
