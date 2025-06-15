
import { Action } from '../../pages/CarbonCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Zap, Recycle, Factory } from 'lucide-react';

interface Props {
  actions: Action[];
  totalEmissions: number;
  onReset: () => void;
}

const typeIcons = {
    '能源': <Zap className="h-4 w-4 text-yellow-500" />,
    '循環': <Recycle className="h-4 w-4 text-green-500" />,
    '製程': <Factory className="h-4 w-4 text-blue-500" />,
};

const SummaryReport = ({ actions, totalEmissions, onReset }: Props) => {
  const totalReduction = actions.reduce((sum, action) => sum + action.reduction, 0);
  const totalInvestment = actions.reduce((sum, action) => sum + action.investment, 0);
  const weightedAvgROI = totalInvestment > 0 ? actions.reduce((sum, action) => sum + action.roi * action.investment, 0) / totalInvestment : 0;
  const paybackYears = weightedAvgROI > 0 ? (100 / weightedAvgROI).toFixed(1) : 'N/A';
  
  // GPT-like summary
  const gptSummary = `綜合評估，您所選的 ${actions.length} 項行動組合，預計每年可減少 ${totalReduction.toLocaleString()} 噸碳排放。總投資額為 NT$ ${totalInvestment.toLocaleString()}，預估可在 ${paybackYears} 年內透過節省的能源與資源成本實現回本，是一項兼具環保效益與經濟可行性的投資策略。`;
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>4. 行動建議與總結報告</CardTitle>
        <CardDescription>這是根據您的選擇生成的減碳行動總結與專業建議。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gray-50 border-l-4 border-green-500 rounded-r-lg">
          <h4 className="font-semibold text-lg mb-2 text-gray-800">💡 總結建議語句</h4>
          <p className="text-gray-700 leading-relaxed">{gptSummary}</p>
        </div>

        <div>
            <h4 className="font-semibold mb-2">已選行動列表</h4>
            <ul className="space-y-2">
                {actions.map(action => (
                    <li key={action.id} className="flex items-center p-3 bg-white border rounded-md">
                        {typeIcons[action.type]}
                        <span className="ml-3 flex-1 font-medium">{action.name}</span>
                        <span className="text-sm text-gray-500">年減 {action.reduction} 噸</span>
                    </li>
                ))}
            </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onReset}>
          重新規劃
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SummaryReport;
