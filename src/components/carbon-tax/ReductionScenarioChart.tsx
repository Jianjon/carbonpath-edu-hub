
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ReductionModel } from '@/pages/CarbonTax';

interface ChartData {
    year: number;
    none: number;
    sbti: number;
    taiwan: number;
}

interface ReductionScenarioChartProps {
  data: ChartData[];
  reductionModel: ReductionModel;
}

const chartConfig = {
    none: { label: "無特定減量計畫", color: "#9ca3af" }, // gray-400
    sbti: { label: "SBTi 1.5°C 路徑", color: "#3b82f6" }, // blue-500
    taiwan: { label: "台灣淨零路徑", color: "#16a34a" }, // green-600
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-xs bg-white/80 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          {payload.map((pld: any) => (
            <div key={pld.dataKey} style={{ color: pld.color }}>
              {pld.name}: {pld.value.toLocaleString()} 噸
            </div>
          ))}
        </div>
      );
    }
    return null;
};

const ReductionScenarioChart: React.FC<ReductionScenarioChartProps> = ({ data, reductionModel }) => {
  if (!data.length) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>減量路徑比較圖 (至2050年)</CardTitle>
        <CardDescription>比較不同減量情境下的排放趨勢。您目前的選擇是：<span className="font-semibold">{chartConfig[reductionModel].label}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" fontSize={12} tickMargin={5} interval="preserveStartEnd" domain={['dataMin', 'dataMax']} />
              <YAxis fontSize={12} tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Area type="monotone" dataKey="none" name={chartConfig.none.label} stroke={chartConfig.none.color} fill={chartConfig.none.color} fillOpacity={reductionModel === 'none' ? 0.2 : 0.05} strokeWidth={reductionModel === 'none' ? 2.5 : 1.5} strokeDasharray={"5 5"} />
              <Area type="monotone" dataKey="sbti" name={chartConfig.sbti.label} stroke={chartConfig.sbti.color} fill={chartConfig.sbti.color} fillOpacity={reductionModel === 'sbti' ? 0.3 : 0.1} strokeWidth={reductionModel === 'sbti' ? 2.5 : 1.5} />
              <Area type="monotone" dataKey="taiwan" name={chartConfig.taiwan.label} stroke={chartConfig.taiwan.color} fill={chartConfig.taiwan.color} fillOpacity={reductionModel === 'taiwan' ? 0.3 : 0.1} strokeWidth={reductionModel === 'taiwan' ? 2.5 : 1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ReductionScenarioChart;
