
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
    color: "hsl(var(--chart-1))",
  },
  target: {
    label: "目標排放量",
    color: "hsl(var(--chart-2))",
  },
  reduction: {
    label: "減排率",
    color: "hsl(var(--chart-3))",
  },
};

const PathwayChart: React.FC<PathwayChartProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* 排放量趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle>排放量減少趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="emissions" 
                stroke="var(--color-emissions)" 
                strokeWidth={3}
                name="實際排放量"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="var(--color-target)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="目標排放量"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 減排率圖表 */}
      <Card>
        <CardHeader>
          <CardTitle>年度減排率</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="reduction" 
                fill="var(--color-reduction)"
                name="減排率 (%)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

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
              {data.map((item, index) => (
                <TableRow key={item.year}>
                  <TableCell className="font-medium">{item.year}</TableCell>
                  <TableCell>{item.emissions.toLocaleString()}</TableCell>
                  <TableCell>{item.target.toLocaleString()}</TableCell>
                  <TableCell>{item.reduction}%</TableCell>
                  <TableCell>
                    {index === 0 ? 0 : (data[index - 1].emissions - item.emissions).toLocaleString()}
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
