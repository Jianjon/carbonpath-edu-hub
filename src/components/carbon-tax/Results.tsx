
import { ReactNode } from 'react';
import { AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReductionModel } from '@/pages/CarbonTax';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Rate {
  value: number;
  label: string;
  description: ReactNode;
}

interface FeeProjection {
    year: number;
    emissions: number;
    fee: number;
}

interface ResultsProps {
  rates: Rate[];
  selectedRate: number;
  setSelectedRate: (rate: number) => void;
  feeProjection: FeeProjection[];
  isHighLeakageRisk: boolean;
  setIsHighLeakageRisk: (isHigh: boolean) => void;
  reductionModel: ReductionModel;
}

const Results = ({ rates, selectedRate, setSelectedRate, feeProjection, isHighLeakageRisk, setIsHighLeakageRisk, reductionModel }: ResultsProps) => {
  const totalFee = feeProjection.reduce((acc, item) => acc + item.fee, 0);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>碳費試算與三種情境比較</CardTitle>
        <CardDescription>點擊下方按鈕切換不同費率情境，或啟用高碳洩漏風險模式，查看對應的碳費成本。</CardDescription>
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
          <p className="text-lg text-gray-600">預估5年累計碳費</p>
          <p className="text-4xl font-bold text-indigo-600 mt-2">
            NT$ {totalFee.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            於 {rates.find(r => r.value === selectedRate)?.label} 情境下
          </p>
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="high-leakage-switch" className="font-semibold">啟用高碳洩漏風險模式</Label>
                <p className="text-sm text-muted-foreground">開啟後將依此特定情境重新計算碳費。</p>
            </div>
            <Switch
                id="high-leakage-switch"
                checked={isHighLeakageRisk}
                onCheckedChange={setIsHighLeakageRisk}
            />
        </div>

        <Card>
            <CardHeader className="flex-row items-center space-x-3 space-y-0 pb-2">
                <TrendingUp className="h-6 w-6 text-gray-500" />
                <CardTitle>五年費用預測</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100/80">
                            <tr>
                                <th className="p-3 font-medium">年度</th>
                                <th className="p-3 font-medium text-right">預估排放量 (噸)</th>
                                <th className="p-3 font-medium text-right">預估碳費</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeProjection.map((item) => (
                                <tr key={item.year} className="border-b last:border-none">
                                    <td className="p-3">{item.year}</td>
                                    <td className="p-3 text-right">{item.emissions.toLocaleString()}</td>
                                    <td className="p-3 text-right font-semibold">NT$ {item.fee.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-center text-gray-700">費率適用條件說明</h4>
          {rates.map((rate) => (
              <div key={rate.value} className={cn("flex items-start gap-3 p-3 rounded-md transition-colors", { "bg-blue-50 border border-blue-200": selectedRate === rate.value, "bg-gray-50": selectedRate !== rate.value })}>
                  <Info className={cn("h-5 w-5 mt-1 flex-shrink-0", { "text-blue-700": selectedRate === rate.value, "text-gray-500": selectedRate !== rate.value })} />
                  <div>
                      <h5 className="font-semibold">{rate.label}</h5>
                      <div className="text-sm text-gray-600 mt-2">{rate.description}</div>
                      {rate.value === 100 && (reductionModel === 'sbti' || reductionModel === 'taiwan') && (
                          <div className="mt-3 p-2 bg-green-50 text-green-900 border-l-4 border-green-400 text-xs rounded-r-md">
                              <b>提示：</b>您選擇的減量路徑是達成此優惠費率的良好方向。請確保您的自主減量計畫符合法規並通過審核。
                          </div>
                      )}
                  </div>
              </div>
          ))}
        </div>
        
        {isHighLeakageRisk && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
                <h5 className="font-semibold">高碳洩漏風險模式已啟用</h5>
                <p className="text-sm mt-2">
                    <b>適用對象：</b>由環境部認定的高度出口導向、易受國際碳成本影響之產業，如鋼鐵、水泥、石化等。
                </p>
                <p className="text-sm mt-2">
                    <b>計算方式：</b>此模式下收費排放量為「<b>年排放量 × 碳洩漏風險係數</b>」。此係數第一階段依風險級距為 0.2、0.4 或 0.6，並將逐期調升。本模擬器使用 <b>0.2</b> 進行計算，且 25,000 噸的起徵門檻不適用。
                </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Results;
