
import { useState } from 'react';
import { Industry, BusinessScale } from '../../pages/CarbonCredits';
import { industries, businessScales } from '../../data/carbonActionsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Props {
  onNext: (industry: Industry, scale: BusinessScale) => void;
}

const CriteriaSelection = ({ onNext }: Props) => {
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [scale, setScale] = useState<BusinessScale | ''>('');

  const handleNext = () => {
    if (industry && scale) {
      onNext(industry as Industry, scale as BusinessScale);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>1. 選擇產業與規模</CardTitle>
        <CardDescription>請選擇您的產業類別與企業規模，我們將為您推薦合適的減碳思考方向。</CardDescription>
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
          <Label htmlFor="scale">企業規模</Label>
          <Select onValueChange={(value: BusinessScale) => setScale(value)} value={scale}>
            <SelectTrigger id="scale">
              <SelectValue placeholder="請選擇您的企業規模" />
            </SelectTrigger>
            <SelectContent>
              {businessScales.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleNext} disabled={!industry || !scale}>
          開始探索減碳行動
        </Button>
      </CardContent>
    </Card>
  );
};

export default CriteriaSelection;
