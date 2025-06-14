
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PathwayData } from '../pages/CarbonPath';

interface PathwayChartProps {
  data: PathwayData[];
}

const chartConfig = {
  emissions: {
    label: "實際排放量",
    color: "#1976D2", // 深藍
  },
  target: {
    label: "目標排放量",
    color: "#ef4444", // 紅色
  },
  residual: {
    label: "淨零殘留排放",
    color: "#26C485", // 青綠
  },
  reduction: {
    label: "累積減排率",
    color: "#00B4D8", // 藍綠
  },
  annualReduction: {
    label: "年度減量",
    color: "#8b5cf6", // 紫
  },
};

const PathwayChart: React.FC<PathwayChartProps> = ({ data }) => {
  // 找出最末一年與目標年（假設最後一筆就是目標年）
  const baseYear = data.length > 0 ? data[0].year : 2020;
  const netZeroYear = data.length > 0 ? data[data.length - 1].year : baseYear + 30;

  // 假設目標最後一年的 target/emissions 相同，即為殘留比例
  const lastEmission = data.length > 0 ? data[data.length - 1].emissions : 0;
  // base emissions（用於參考與計算殘留量高度）
  const baseEmissions = data.length > 0 ? data[0].emissions : 1;
  const residualRatio = baseEmissions === 0 ? 0 : lastEmission / baseEmissions;

  // 延長到目標年+10
  const extendedYears = 10;
  const extendedData = [
    ...data,
    ...Array.from({ length: extendedYears }, (_, i) => ({
      year: netZeroYear + i + 1,
      emissions: lastEmission,
      reduction: 100 - residualRatio * 100,
      target: lastEmission,
    }))
  ];

  // annualReduction 為差值
  const dataWithAnnualReduction = extendedData.map((item, index, arr) => ({
    ...item,
    annualReduction: index === 0 ? 0 : arr[index - 1].emissions - item.emissions
  }));

  return (
    <div className="space-y-6">
      {/* 排放量減少趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle>排放量減少趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataWithAnnualReduction}>
                <defs>
                  <linearGradient id="pathwayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1976D2" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="#90caf9" stopOpacity={0.12}/>
                  </linearGradient>
                  <linearGradient id="residualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#26C485" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#d1fae5" stopOpacity={0.08}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fontWeight: 500 }}
                  allowDuplicatedCategory={false}
                  domain={[baseYear, netZeroYear + extendedYears]}
                  type="number"
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  width={70}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                {/* 殘留排放區間（目標後10年區段） */}
                <Area 
                  type="monotone"
                  dataKey="emissions"
                  data={dataWithAnnualReduction.slice(data.length)}
                  stroke={chartConfig.residual.color}
                  fill="url(#residualGradient)"
                  fillOpacity={0.7}
                  isAnimationActive={false}
                  activeDot={false}
                  dot={false}
                  name="淨零殘留排放"
                  strokeDasharray="7 5"
                />
                {/* 主區間排放量 */}
                <Area 
                  type="monotone"
                  dataKey="emissions"
                  data={dataWithAnnualReduction.slice(0, data.length)}
                  stroke={chartConfig.emissions.color}
                  fill="url(#pathwayGradient)"
                  fillOpacity={0.85}
                  activeDot={{ r: 5, fill: chartConfig.emissions.color }}
                  name="實際排放量"
                />
                {/* 目標折線 */}
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke={chartConfig.target.color}
                  strokeWidth={3}
                  strokeDasharray="8 2"
                  name="目標排放量"
                  dot={false}
                  activeDot={false}
                />
                {/* 殘留排放線（目標年後） */}
                <ReferenceLine
                  x={netZeroYear}
                  stroke="#26A485"
                  label={{
                    position: 'insideTop',
                    value: "Net Zero",
                    fill: "#26C485",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={lastEmission}
                  x={netZeroYear + 1}
                  stroke="#26C485"
                  strokeWidth={3}
                  strokeDasharray="7 6"
                  label={{
                    position: 'left',
                    fill: "#26C485",
                    fontWeight: 700,
                    fontSize: 13,
                    value: "殘留排放",
                  }}
                  ifOverflow="extendDomain"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 減排率和年度減量圖表，同區塊左右排列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 累積減排率圖表 */}
        <Card>
          <CardHeader>
            <CardTitle>累積減排率</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataWithAnnualReduction.slice(0, data.length)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={value => `${value}%`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="reduction"
                    fill={chartConfig.reduction.color}
                    name="累積減排率 (%)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        {/* 年度減量圖表 */}
        <Card>
          <CardHeader>
            <CardTitle>年度減量</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataWithAnnualReduction.slice(0, data.length)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={value => `${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="annualReduction"
                    fill={chartConfig.annualReduction.color}
                    name="年度減量 (tCO2e)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 數據表格 */}
      <Card>
        <CardHeader>
          <CardTitle>年度減碳目標數據表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>年份</TableHead>
                <TableHead>排放量 (tCO2e)</TableHead>
                <TableHead>目標排放量 (tCO2e)</TableHead>
                <TableHead>累計減排率 (%)</TableHead>
                <TableHead>年減排量 (tCO2e)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataWithAnnualReduction.slice(0, data.length).map((item) => (
                <TableRow key={item.year}>
                  <TableCell className="font-medium">{item.year}</TableCell>
                  <TableCell>{item.emissions.toLocaleString()}</TableCell>
                  <TableCell>{item.target.toLocaleString()}</TableCell>
                  <TableCell>{item.reduction}%</TableCell>
                  <TableCell>{item.annualReduction.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PathwayChart;
