
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PathwayData } from '../pages/CarbonPath';

// 父層務必傳入下面 props
interface PathwayChartProps {
  data: PathwayData[];
  modelType?: 'custom-target' | 'taiwan-target' | 'sbti'; // 傳進來的模型id
  customPhases?: { // 兩階段自訂
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
  const actualResidualPercentage = Math.round(residualRatio * 100 * 10) / 10;
  const finalReductionPercentage = Math.round((1 - residualRatio) * 100 * 10) / 10;

  console.log('PathwayChart 數據:', {
    baseEmissions,
    lastEmission,
    residualRatio,
    actualResidualPercentage,
    finalReductionPercentage
  });

  // 延長10年
  const extendedYears = 10;
  const extendedData = [
    ...data,
    ...Array.from({ length: extendedYears }, (_, i) => ({
      year: netZeroYear + i + 1,
      emissions: lastEmission,
      reduction: finalReductionPercentage,
      target: lastEmission,
    }))
  ];
  
  const dataWithAnnualReduction = extendedData.map((item, idx, arr) => ({
    ...item,
    annualReduction: idx === 0 ? 0 : arr[idx - 1].emissions - item.emissions
  }));

  // 階段區塊顏色：自訂模型（近/長/淨零後）
  let refsArr: { x1: number, x2: number, color: string, label: string }[] = [];
  if (
    modelType === 'custom-target'
    && customPhases?.nearTermTarget
    && customPhases?.longTermTarget
  ) {
    refsArr = [
      {
        x1: baseYear,
        x2: customPhases.nearTermTarget.year,
        color: '#E0F2FE',
        label: '近期階段'
      },
      {
        x1: customPhases.nearTermTarget.year,
        x2: customPhases.longTermTarget.year,
        color: '#E6F4EA',
        label: '長期階段'
      },
      {
        x1: customPhases.longTermTarget.year,
        x2: netZeroYear + extendedYears,
        color: '#F5F5F5',
        label: '淨零後'
      }
    ];
  }

  // 台灣特定目標年標註
  const taiwanMilestoneYears = [
    { year: 2030, color: "#FB923C", label: "2030目標" },
    { year: 2032, color: "#F59E42", label: "2032目標" },
    { year: 2035, color: "#FBBF24", label: "2035目標" }
  ];
  const showTaiwanMarks = modelType === 'taiwan-target';

  return (
    <div className="space-y-6">
      {/* 排放量減少趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle>
            排放量減少趨勢（總減排：{finalReductionPercentage}%，殘留排放：{actualResidualPercentage}%）
          </CardTitle>
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
                
                {/* 自訂模型階段背景色塊 */}
                {refsArr.map((ph, idx) => (
                  <ReferenceArea
                    key={`phase-${idx}-${ph.label}`}
                    x1={ph.x1}
                    x2={ph.x2}
                    stroke="none"
                    fill={ph.color}
                    fillOpacity={0.32}
                    ifOverflow="extendDomain"
                  />
                ))}
                
                {/* 分界年標線 */}
                {modelType === 'custom-target' && customPhases?.nearTermTarget && (
                  <ReferenceLine
                    x={customPhases.nearTermTarget.year}
                    stroke="#3b82f6"
                    strokeDasharray="4 2"
                    label={{
                      position: 'top',
                      fill: "#3b82f6",
                      fontWeight: 600,
                      fontSize: 13,
                      value: "近期結束",
                    }}
                  />
                )}
                {modelType === 'custom-target' && customPhases?.longTermTarget && (
                  <ReferenceLine
                    x={customPhases.longTermTarget.year}
                    stroke="#26A485"
                    label={{
                      position: 'top',
                      fill: "#26A485",
                      fontWeight: 700,
                      fontSize: 13,
                      value: "長期結束(目標年)",
                    }}
                  />
                )}
                
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fontWeight: 500 }}
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
                
                {/* 主排放量區域圖 */}
                <Area 
                  type="monotone"
                  dataKey="emissions"
                  stroke={chartConfig.emissions.color}
                  fill="url(#pathwayGradient)"
                  fillOpacity={0.95}
                  name="實際排放量"
                  activeDot={{ r: 5, fill: chartConfig.emissions.color }}
                  dot={false}
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
                    position: 'insideTopRight',
                    value: "Net Zero",
                    fill: "#26A485",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                />
                
                {/* 殘留排放水平線 */}
                <ReferenceLine
                  y={lastEmission}
                  stroke="#26C485"
                  strokeWidth={2}
                  strokeDasharray="7 6"
                  label={{
                    position: 'insideTopRight',
                    fill: "#26C485",
                    fontWeight: 700,
                    fontSize: 11,
                    value: `最終殘留 ${actualResidualPercentage}%`,
                  }}
                  ifOverflow="extendDomain"
                />
                
                {/* 台灣目標年標線 */}
                {showTaiwanMarks && taiwanMilestoneYears.map((milestone) => (
                  <ReferenceLine
                    key={`taiwan-${milestone.year}`}
                    x={milestone.year}
                    stroke={milestone.color}
                    strokeWidth={2}
                    label={{
                      value: milestone.label,
                      position: "top",
                      fill: milestone.color,
                      fontSize: 12,
                      fontWeight: 600
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
          <CardTitle>
            年度減碳目標數據表（最終殘留：{lastEmission.toLocaleString()} tCO2e = {actualResidualPercentage}%，總減排：{finalReductionPercentage}%）
          </CardTitle>
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
                <TableHead>當年殘留比例 (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataWithAnnualReduction.slice(0, data.length).map((item) => {
                const residualPercent = baseEmissions === 0 ? 0 : Math.round((item.emissions / baseEmissions) * 100 * 10) / 10;
                const isNearFinal = residualPercent <= actualResidualPercentage + 2; // 接近最終殘留排放
                return (
                  <TableRow key={item.year}>
                    <TableCell className="font-medium">{item.year}</TableCell>
                    <TableCell>{item.emissions.toLocaleString()}</TableCell>
                    <TableCell>{item.target.toLocaleString()}</TableCell>
                    <TableCell>{item.reduction}%</TableCell>
                    <TableCell>{item.annualReduction.toLocaleString()}</TableCell>
                    <TableCell className={isNearFinal ? "text-green-600 font-semibold" : ""}>{residualPercent}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PathwayChart;
