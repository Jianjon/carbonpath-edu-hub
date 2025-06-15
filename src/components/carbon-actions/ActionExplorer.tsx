import { useState, useMemo } from 'react';
import { Action, Industry, ActionAngle, Difficulty } from '../../pages/CarbonCredits';
import { actionsData, actionAngles } from '../../data/carbonActionsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sparkles, Leaf, ShoppingBasket, Target, Wallet, Download, Zap, Calendar, Users, ListChecks } from 'lucide-react';

interface Props {
  industry: Industry;
  totalBudgetPoints: number;
  onBack: () => void;
}

const angleIcons: Record<ActionAngle, React.ReactNode> = {
  '能源管理': <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />,
  '循環經濟': <Leaf className="h-5 w-5 mr-2 text-green-500" />,
  '永續採購': <ShoppingBasket className="h-5 w-5 mr-2 text-blue-500" />,
  '淨零管理': <Target className="h-5 w-5 mr-2 text-red-500" />,
};

const investmentCosts: Record<'高' | '中' | '低', number> = {
  '低': 1,
  '中': 2,
  '高': 3,
};

const getBadgeVariant = (level: '高' | '中' | '低'): 'destructive' | 'secondary' | 'outline' => {
  switch (level) {
    case '高': return 'destructive';
    case '中': return 'secondary';
    case '低': return 'outline';
    default: return 'outline';
  }
};

const getDifficultyBadgeVariant = (level: Difficulty): 'outline' | 'secondary' | 'destructive' => {
  switch (level) {
    case '簡易': return 'outline';
    case '中等': return 'secondary';
    case '複雜': return 'destructive';
    default: return 'outline';
  }
};

const ActionExplorer = ({ industry, totalBudgetPoints, onBack }: Props) => {
  const industryActions = actionsData[industry];
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const usedBudgetPoints = useMemo(() => {
    return Object.entries(selected)
      .filter(([, isSelected]) => isSelected)
      .reduce((total, [actionId]) => {
        const action = Object.values(industryActions).flat().find(a => a.id === actionId);
        if (action) {
          return total + investmentCosts[action.investment];
        }
        return total;
      }, 0);
  }, [selected, industryActions]);

  const remainingBudget = totalBudgetPoints - usedBudgetPoints;

  const handleSelect = (action: Action) => {
    const cost = investmentCosts[action.investment];
    const isSelected = selected[action.id];

    if (!isSelected && remainingBudget < cost) {
      return;
    }
    
    setSelected(prev => ({ ...prev, [action.id]: !prev[action.id] }));
  };
  
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const totalActions = Object.values(industryActions).flat().length;

  const handleExport = () => {
    const selectedActionDetails: (Action & { angle: ActionAngle })[] = [];
    actionAngles.forEach(angle => {
        const actions = industryActions[angle];
        if (actions) {
            actions.forEach(action => {
                if (selected[action.id]) {
                    selectedActionDetails.push({ ...action, angle: angle as ActionAngle });
                }
            });
        }
    });

    const headers = ['減碳面向', '減碳方向', '效益描述', '預估投資級距'];
    const csvRows = [headers.join(',')];

    selectedActionDetails.forEach(action => {
        const row = [
            `"${action.angle}"`,
            `"${action.name}"`,
            `"${action.description}"`,
            `"${action.investment}"`
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${industry}_減碳行動計畫.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="flex-grow">
              <CardTitle>2. 探索與選擇減碳行動</CardTitle>
              <CardDescription>根據您選擇的「{industry}」，從四大角度推薦以下行動。請在預算內勾選您感興趣的項目。</CardDescription>
            </div>
            <div className="text-right flex-shrink-0 bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-end gap-2 text-base font-bold text-primary">
                    <Wallet className="h-5 w-5" />
                    <span>預算點數</span>
                </div>
                <p className="text-2xl font-bold">{remainingBudget} <span className="text-base font-medium text-muted-foreground">/ {totalBudgetPoints}</span></p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalActions > 0 ? (
          <Accordion type="multiple" defaultValue={actionAngles} className="w-full">
            {actionAngles.map(angle => {
              const actions = industryActions[angle];
              if (!actions || actions.length === 0) return null;

              return (
                <AccordionItem value={angle} key={angle}>
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center">
                      {angleIcons[angle]}
                      {angle}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {actions.map(action => {
                        const cost = investmentCosts[action.investment];
                        const isSelected = selected[action.id] || false;
                        const canAfford = remainingBudget >= cost;
                        const isDisabled = !isSelected && !canAfford;
                        
                        return (
                          <div key={action.id} className={`flex items-start space-x-3 p-3 border rounded-lg transition-opacity ${isDisabled ? 'opacity-50 bg-muted/50' : ''}`}>
                            <Checkbox
                              id={action.id}
                              checked={isSelected}
                              onCheckedChange={() => handleSelect(action)}
                              disabled={isDisabled}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={action.id} className={`font-semibold text-base ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>{action.name}</Label>
                              <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant={getBadgeVariant(action.investment)}>
                                    <Wallet className="h-3 w-3 mr-1" />
                                    投資點數: {cost}
                                </Badge>
                                <Badge variant={getDifficultyBadgeVariant(action.difficulty)}>
                                    <Zap className="h-3 w-3 mr-1" />
                                    {action.difficulty}
                                </Badge>
                                <Badge variant="secondary">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {action.time}
                                </Badge>
                                <Badge variant="secondary">
                                    <Users className="h-3 w-3 mr-1" />
                                    {action.manpower}
                                </Badge>
                              </div>

                              <Accordion type="single" collapsible className="w-full mt-2">
                                  <AccordionItem value="details" className="border-none">
                                      <AccordionTrigger className="text-sm p-0 flex justify-start hover:no-underline text-muted-foreground data-[state=open]:text-primary font-normal">
                                          顯示執行細節
                                      </AccordionTrigger>
                                      <AccordionContent className="pt-2 pb-0">
                                          <div className="space-y-3">
                                              <div>
                                                  <h4 className="font-semibold flex items-center text-sm mb-1"><ListChecks className="h-4 w-4 mr-2 text-primary" />執行步驟</h4>
                                                  <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pl-2">
                                                      {action.steps.map((step, i) => <li key={i}>{step}</li>)}
                                                  </ul>
                                              </div>
                                              <div>
                                                  <h4 className="font-semibold flex items-center text-sm mb-1"><Target className="h-4 w-4 mr-2 text-primary" />後續追蹤</h4>
                                                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                                                      {action.tracking.map((track, i) => <li key={i}>{track}</li>)}
                                                  </ul>
                                              </div>
                                          </div>
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>我們正在為「{industry}」準備相關的減碳行動建議。</p>
            <p>請稍後再回來查看，或選擇其他產業類別。</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onBack}>返回</Button>
          <Button variant="outline" onClick={handleExport} disabled={selectedCount === 0}>
            <Download className="mr-2 h-4 w-4" />
            匯出試算表
          </Button>
        </div>
        <div className="text-sm font-medium text-primary text-right">
          已選擇 {selectedCount} 項行動，已使用 {usedBudgetPoints} 點預算
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActionExplorer;
