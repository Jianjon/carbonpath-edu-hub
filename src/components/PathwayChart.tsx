import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea, Dot } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PathwayData } from '../pages/CarbonPath';

// 父層務必傳入下面 props
interface PathwayChartProps {
  data: PathwayData[];
  modelType?: 'custom-target' | 'taiwan-target' | 'sbti'; // 傳進來的模型id
  customPhases?: { // 三階段自訂
    nearTermTarget?: { year: number },
    longTermTarget?: { year: number }
  }
}

const chartConfig = {
  emissions: {
    label: "實際排放量",
    color: "#1976D2",
  },
  target: {
    label: "目標排放量",
    color: "#ef4444",
  },
  residual: {
    label: "淨零殘留排放",
    color: "#26C485",
  },
  annualReduction: {
    label: "年度減量",
    color: "#8b5cf6",
  },
};

const PathwayChart: React.FC<PathwayChartProps> = ({ data, modelType, customPhases }) => {
  if (!data.length) return null;
  const baseYear = data[0].year;
  const netZeroYear = data[data.length - 1].year;
  const baseEmissions = data[0].emissions;
  const lastEmission = data[data.length - 1].emissions;
  const residualRatio = baseEmissions === 0 ? 0 : lastEmission / baseEmissions;

  // 延長10年
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
  // 年度減量資料
  const dataWithAnnualReduction = extendedData.map((item, idx, arr) => ({
    ...item,
    annualReduction: idx === 0 ? 0 : arr[idx - 1].emissions - item.emissions
  }));

  // 自訂模型區段顏色，分為近期、長期
  const refsArr: { x1: number, x2: number, color: string, label: string }[] = [];
  if (
    modelType === 'custom-target'
    && customPhases?.nearTermTarget
    && customPhases?.longTermTarget
  ) {
    // 近期區段
    refsArr.push({
      x1: baseYear,
      x2: customPhases.nearTermTarget.year,
      color: '#E0F2FE',
      label: '近期階段'
    });
    // 長期區段
    refsArr.push({
      x1: customPhases.nearTermTarget.year,
      x2: customPhases.longTermTarget.year,
      color: '#E6F4EA',
      label: '長期階段'
    });
    // 淨零殘留後區段，另見殘留色（延長線本身已有設計）
  }

  // 台灣特定目標年標註
  const taiwanMilestoneYears = [
    { year: 2030, color: "#FB923C", label: "2030目標" },
    { year: 2032, color: "#F59E42", label: "2032目標" },
    { year: 2035, color: "#FBBF24", label: "2035目標" }
  ];
  const showTaiwanMarks = modelType === 'taiwan-target';
  const taiwanPoints = showTaiwanMarks
    ? dataWithAnnualReduction
        .filter(item => taiwanMilestoneYears.some(tw => tw.year === item.year))
        .map(item => ({
          ...item,
          color: taiwanMilestoneYears.find(tw => tw.year === item.year)?.color,
          label: taiwanMilestoneYears.find(tw => tw.year === item.year)?.label
        }))
    : [];

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
                    <stop offset="100%" stopColor="#90caf9" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="residualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#26C485" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#d1fae5" stopOpacity={0.18}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                {/* 只有自訂模型時顯示兩階段填色 */}
                {refsArr.map((ph) => (
                  <ReferenceArea
                    key={ph.label}
                    x1={ph.x1}
                    x2={ph.x2}
                    stroke="none"
                    fill={ph.color}
                    fillOpacity={0.32}
                    ifOverflow="extendDomain"
                    label={ph.label}
                  />
                ))}
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
                {/* 主排放量連續區 - 沒有空白 */}
                <Area 
                  type="monotone"
                  dataKey="emissions"
                  data={dataWithAnnualReduction}
                  stroke={chartConfig.emissions.color}
                  fill="url(#pathwayGradient)"
                  fillOpacity={0.95}
                  name="實際排放量"
                  activeDot={{ r: 5, fill: chartConfig.emissions.color }}
                  dot={false}
                />
                {/* 殘留排放線（包括目標年與延長10年） */}
                <Area 
                  type="monotone"
                  dataKey="emissions"
                  data={dataWithAnnualReduction.slice(data.length - 1)}
                  stroke={chartConfig.residual.color}
                  fill="url(#residualGradient)"
                  fillOpacity={0.85}
                  isAnimationActive={false}
                  dot={false}
                  name="淨零殘留排放"
                  strokeDasharray="3 3"
                />
                <Area 
                  type="monotone"
                  dataKey="emissions"
                  data={dataWithAnnualReduction.slice(data.length)}
                  stroke={chartConfig.residual.color}
                  fill="url(#residualGradient)"
                  fillOpacity={0.85}
                  isAnimationActive={false}
                  dot={false}
                  name="淨零殘留排放"
                  strokeDasharray="7 5"
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
                {/* Net Zero年標線 */}
                <ReferenceLine
                  x={netZeroYear}
                  stroke="#26A485"
                  label={{
                    position: 'insideTop',
                    value: "Net Zero",
                    fill: "#26A485",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                />
                {/* 殘留排放水平線 */}
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
                {/* 台灣目標年標點 */}
                {showTaiwanMarks && taiwanPoints.map((item) => (
                  <ReferenceLine
                    key={item.year}
                    x={item.year}
                    y={item.target}
                    stroke={item.color ?? "#d97706"}
                    label={{
                      value: item.label,
                      position: "top",
                      fill: item.color ?? "#d97706",
                      fontSize: 13,
                      fontWeight: 700
                    }}
                    ifOverflow="visible"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      {/* 年度減量圖 */}
      <Card>
        <CardHeader>
          <CardTitle>年度減量</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataWithAnnualReduction.slice(1, data.length)}>
                <defs>
                  <linearGradient id="annualReductionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#ede9fe" stopOpacity={0.13} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="annualReduction"
                  stroke={chartConfig.annualReduction.color}
                  fill="url(#annualReductionGradient)"
                  name="年度減量"
                  activeDot={{ r: 4, fill: chartConfig.annualReduction.color }}
                />
              </AreaChart>
            </ResponsiveContainer>
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
