
import { useState } from 'react';
import { Industry } from '../../pages/CarbonCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onNext: (industry: Industry, emissions: number) => void;
}

const industries: Industry[] = ['餐飲業', '零售業', '製造業'];

const IndustrySelection = ({ onNext }: Props) => {
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [emissions, setEmissions] = useState('');

  const handleNext = () => {
    if (industry && emissions) {
      onNext(industry as Industry, Number(emissions));
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>1. 選擇產業與目標</CardTitle>
        <CardDescription>請選擇您的產業類別，並輸入近一年的總碳排放量（範疇一＋範疇二）。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <div className="space-y-2">
          <Label htmlFor="emissions">年排放量 (噸CO2e)</Label>
          <Input 
            id="emissions" 
            type="number" 
            placeholder="例如: 1000"
            value={emissions}
            onChange={(e) => setEmissions(e.target.value)}
          />
        </div>
        <Button onClick={handleNext} disabled={!industry || !emissions}>
          顯示推薦減碳行動
        </Button>
      </CardContent>
    </Card>
  );
};

export default IndustrySelection;
