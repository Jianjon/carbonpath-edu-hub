
import { useState } from 'react';
import { Action, Industry, ActionAngle } from '../../pages/CarbonCredits';
import { actionsData, actionAngles } from '../../data/carbonActionsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sparkles, Leaf, ShoppingBasket, Target } from 'lucide-react';

interface Props {
  industry: Industry;
  onBack: () => void;
}

const angleIcons: Record<ActionAngle, React.ReactNode> = {
  '能源管理': <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />,
  '循環經濟': <Leaf className="h-5 w-5 mr-2 text-green-500" />,
  '永續採購': <ShoppingBasket className="h-5 w-5 mr-2 text-blue-500" />,
  '淨零管理': <Target className="h-5 w-5 mr-2 text-red-500" />,
};

const getBadgeVariant = (level: '高' | '中' | '低'): 'destructive' | 'secondary' | 'outline' => {
  switch (level) {
    case '高': return 'destructive';
    case '中': return 'secondary';
    case '低': return 'outline';
    default: return 'outline';
  }
};

const ActionExplorer = ({ industry, onBack }: Props) => {
  const industryActions = actionsData[industry];
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const handleSelect = (actionId: string) => {
    setSelected(prev => ({ ...prev, [actionId]: !prev[actionId] }));
  };
  
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>2. 探索減碳行動</CardTitle>
        <CardDescription>根據您選擇的「{industry}」，我們從四大角度推薦以下行動。請勾選您感興趣的項目。</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={actionAngles} className="w-full">
          {actionAngles.map(angle => {
            const actions = industryActions[angle];
            if (actions.length === 0) return null;

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
                    {actions.map(action => (
                      <div key={action.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={action.id}
                          checked={selected[action.id] || false}
                          onCheckedChange={() => handleSelect(action.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={action.id} className="font-semibold text-base cursor-pointer">{action.name}</Label>
                          <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant={getBadgeVariant(action.benefit)}>潛在效益: {action.benefit}</Badge>
                            <Badge variant={getBadgeVariant(action.investment)}>投資門檻: {action.investment}</Badge>
                            <Badge variant={getBadgeVariant(action.difficulty)}>導入難度: {action.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>返回</Button>
        <div className="text-sm font-medium text-primary">
          已選擇 {selectedCount} 項行動
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActionExplorer;
