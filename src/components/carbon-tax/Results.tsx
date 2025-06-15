
import { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Rate {
  value: number;
  label: string;
  description: ReactNode;
}

interface ResultsProps {
  rates: Rate[];
  selectedRate: number;
  setSelectedRate: (rate: number) => void;
  calculatedFee: number;
  isHighLeakageRisk: boolean;
}

const Results = ({ rates, selectedRate, setSelectedRate, calculatedFee, isHighLeakageRisk }: ResultsProps) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>碳費試算與三種情境比較</CardTitle>
        <CardDescription>點擊下方按鈕切換不同費率情境，查看對應的碳費成本。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-2">
            {rates.map((rate) => (
                <Button key={rate.value} onClick={() => setSelectedRate(rate.value)} variant={selectedRate === rate.value ? 'default' : 'secondary'} className="h-auto py-2 flex flex-col">
                    <span className="font-semibold">{rate.label.split(' ')[0]}</span>
                    <span className="text-xs">{rate.label.split(' ')[1]}</span>
                </Button>
            ))}
        </div>
        
        <div className="text-center bg-gray-50 p-6 rounded-lg border">
          <p className="text-lg text-gray-600">預估應繳碳費</p>
          <p className="text-4xl font-bold text-indigo-600 mt-2">
            NT$ {calculatedFee.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            於 {rates.find(r => r.value === selectedRate)?.label} 情境下
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-center text-gray-700">費率適用條件說明</h4>
          {rates.map((rate) => (
              <div key={rate.value} className={cn("flex items-start gap-3 p-3 rounded-md transition-colors", { "bg-blue-50 border border-blue-200": selectedRate === rate.value, "bg-gray-50": selectedRate !== rate.value })}>
                  <Info className={cn("h-5 w-5 mt-1 flex-shrink-0", { "text-blue-700": selectedRate === rate.value, "text-gray-500": selectedRate !== rate.value })} />
                  <div>
                      <h5 className="font-semibold">{rate.label}</h5>
                      <div className="text-sm text-gray-600 mt-2">{rate.description}</div>
                  </div>
              </div>
          ))}
        </div>
        
        {isHighLeakageRisk && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
                <h5 className="font-semibold">高碳洩漏風險模式已啟用</h5>
                <p className="text-sm">此模式下，碳費公式為「(年排放量 × 係數0.2) × 費率」。這是為維持產業競爭力所設計的過渡期優惠，25,000噸的起徵門檻在此模式下不適用。</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Results;
