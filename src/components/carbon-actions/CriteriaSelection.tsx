
import { useState } from 'react';
import { Industry, BudgetLevel } from '../../pages/CarbonCredits';
import { industries } from '../../data/carbonActionsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const budgetOptions: { level: BudgetLevel; label: string; description: string }[] = [
  { level: '低', label: '低預算', description: '（5 點）' },
  { level: '中', label: '中預算', description: '（10 點）' },
  { level: '高', label: '高預算', description: '（15 點）' },
];

interface Props {
  onNext: (industry: Industry, budget: BudgetLevel) => void;
}

const CriteriaSelection = ({ onNext }: Props) => {
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [budget, setBudget] = useState<BudgetLevel | ''>('');

  const handleNext = () => {
    if (industry && budget) {
      onNext(industry as Industry, budget as BudgetLevel);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>1. 選擇產業與預算</CardTitle>
        <CardDescription>請選擇您的產業類別與預算等級，我們將為您推薦合適的減碳行動。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="industry">產業類別</Label>
          <Select onValueChange={(value: Industry) => setIndustry(value)} value={industry}>
            <SelectTrigger id="industry">
              <SelectValue placeholder="請選擇您的產業" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>預算等級</Label>
           <RadioGroup
            value={budget}
            onValueChange={(value: BudgetLevel) => setBudget(value)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {budgetOptions.map((option) => (
              <Label
                key={option.level}
                htmlFor={option.level}
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <RadioGroupItem value={option.level} id={option.level} className="sr-only" />
                <span className="font-semibold">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleNext} disabled={!industry || !budget} className="w-full">
          開始探索減碳行動
        </Button>
      </CardContent>
    </Card>
  );
};

export default CriteriaSelection;
