
import { useState } from 'react';
import { Action, Industry } from '../../pages/CarbonCredits';
import { actionsData } from '../../data/carbonActionsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Zap, Recycle, Factory } from 'lucide-react';

interface Props {
  industry: Industry;
  onNext: (actions: Action[]) => void;
  onBack: () => void;
}

const typeIcons = {
  '能源': <Zap className="h-4 w-4 mr-1" />,
  '循環': <Recycle className="h-4 w-4 mr-1" />,
  '製程': <Factory className="h-4 w-4 mr-1" />,
};

const ActionCards = ({ industry, onNext, onBack }: Props) => {
  const recommendedActions = actionsData[industry];
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const handleSelect = (actionId: string) => {
    setSelected(prev => ({ ...prev, [actionId]: !prev[actionId] }));
  };

  const handleNext = () => {
    const selectedActionObjects = recommendedActions.filter(action => selected[action.id]);
    onNext(selectedActionObjects);
  };
  
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>2. 推薦減碳行動</CardTitle>
        <CardDescription>根據您選擇的「{industry}」，我們推薦以下減碳行動。請勾選您感興趣的項目以進行模擬。</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendedActions.map(action => (
          <div key={action.id} className="flex items-start space-x-3">
            <Checkbox
              id={action.id}
              checked={selected[action.id] || false}
              onCheckedChange={() => handleSelect(action.id)}
              className="mt-1"
            />
            <Label htmlFor={action.id} className="w-full">
              <div className="p-4 border rounded-lg hover:border-green-500 cursor-pointer transition-all">
                <h4 className="font-semibold">{action.name}</h4>
                <div className="flex items-center text-sm text-muted-foreground mt-2 flex-wrap gap-x-4 gap-y-1">
                  <Badge variant="outline" className="flex items-center">{typeIcons[action.type]} {action.type}</Badge>
                  <span className="flex items-center"><TrendingUp className="h-4 w-4 mr-1" />年減 {action.reduction} 噸</span>
                  <span className="flex items-center"><DollarSign className="h-4 w-4 mr-1" />投資 {action.investment.toLocaleString()} 元</span>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>返回</Button>
        <Button onClick={handleNext} disabled={selectedCount === 0}>
          下一步：進行模擬 ({selectedCount}項)
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActionCards;
