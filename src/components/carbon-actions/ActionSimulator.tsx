
import { Action } from '../../pages/CarbonCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  actions: Action[];
  totalEmissions: number;
  onNext: () => void;
  onBack: () => void;
}

const ActionSimulator = ({ actions, totalEmissions, onNext, onBack }: Props) => {
  const totalReduction = actions.reduce((sum, action) => sum + action.reduction, 0);
  const totalInvestment = actions.reduce((sum, action) => sum + action.investment, 0);
  const weightedAvgROI = totalInvestment > 0 ? actions.reduce((sum, action) => sum + action.roi * action.investment, 0) / totalInvestment : 0;
  const percentageReduction = (totalReduction / totalEmissions) * 100;
  
  const chartData = actions.map(action => ({
    name: action.name.substring(0, 10) + (action.name.length > 10 ? '...' : ''),
    減碳量: action.reduction,
    投資額: action.investment / 10000, // in 萬元
  }));

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>3. 行動組合模擬器</CardTitle>
        <CardDescription>您選擇的行動組合將產生以下綜合效益。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">總計年減碳量</p>
                <p className="text-2xl font-bold text-green-700">{totalReduction.toLocaleString()} 噸</p>
                <p className="text-sm text-gray-500">佔總排放 {percentageReduction.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">總投資金額</p>
                <p className="text-2xl font-bold text-blue-700">NT$ {totalInvestment.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">加權平均 ROI</p>
                <p className="text-2xl font-bold text-yellow-700">{weightedAvgROI.toFixed(1)} %</p>
                <p className="text-sm text-gray-500">預估回本年限 {(100 / weightedAvgROI).toFixed(1)} 年</p>
            </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">效益比較圖</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={80} />
              <YAxis yAxisId="left" orientation="left" stroke="#16a34a" label={{ value: '減碳量 (噸)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#2563eb" label={{ value: '投資額 (萬元)', angle: -90, position: 'insideRight' }} />
              <Tooltip formatter={(value, name) => [`${(value as number).toLocaleString()} ${name === '減碳量' ? '噸' : '萬元'}`, name]} />
              <Legend />
              <Bar yAxisId="left" dataKey="減碳量" fill="#16a34a" name="減碳量 (噸)" />
              <Bar yAxisId="right" dataKey="投資額" fill="#2563eb" name="投資額 (萬元)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>返回修改行動</Button>
        <Button onClick={onNext}>產生行動建議</Button>
      </CardFooter>
    </Card>
  );
};

export default ActionSimulator;
