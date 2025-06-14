
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PathwayData } from '../pages/CarbonPath';

interface PathwayChartProps {
  data: PathwayData[];
}

const chartConfig = {
  emissions: {
    label: "實際排放量",
    color: "#3b82f6", // blue-500
  },
  target: {
    label: "目標排放量",
    color: "#ef4444", // red-500
  },
  reduction: {
    label: "累積減排率",
    color: "#10b981", // emerald-500
  },
  annualReduction: {
    label: "年度減量",
    color: "#8b5cf6", // violet-500
  },
};

const PathwayChart: React.FC<PathwayChartProps> = ({ data }) => {
  // Calculate annual reduction amounts
  const dataWithAnnualReduction = data.map((item, index) => ({
    ...item,
    annualReduction: index === 0 ? 0 : data[index - 1].emissions - item.emissions
  }));

  return (
    <div className="space-y-6">
      {/* 排放量趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle>排放量減少趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
                <Line 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke={chartConfig.emissions.color}
                  strokeWidth={3}
                  name="實際排放量"
                  dot={{ fill: chartConfig.emissions.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: chartConfig.emissions.color }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke={chartConfig.target.color}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  name="目標排放量"
                  dot={{ fill: chartConfig.target.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: chartConfig.target.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 減排率和減量圖表並排 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 累積減排率圖表 */}
        <Card>
          <CardHeader>
            <CardTitle>累積減排率</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
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
                    radius={[4, 4, 0, 0]}
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
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataWithAnnualReduction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
                    radius={[4, 4, 0, 0]}
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
              {dataWithAnnualReduction.map((item, index) => (
                <TableRow key={item.year}>
                  <TableCell className="font-medium">{item.year}</TableCell>
                  <TableCell>{item.emissions.toLocaleString()}</TableCell>
                  <TableCell>{item.target.toLocaleString()}</TableCell>
                  <TableCell>{item.reduction}%</TableCell>
                  <TableCell>
                    {item.annualReduction.toLocaleString()}
                  </TableCell>
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
