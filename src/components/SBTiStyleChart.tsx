
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

const chartConfig = {
  totalEmissions: {
    label: "總排放量",
    color: "#1976D2",
  },
  annualReduction: {
    label: "年度減量",
    color: "#8b5cf6",
  },
  neutralisation: {
    label: "Neutralisation",
    color: "#26C485",
  },
};

const SBTiStyleChart: React.FC = () => {
  // 模擬數據：2030-2050年的SBTi路徑
  const startYear = 2030;
  const netZeroYear = 2050;
  const extendedYears = 10; // 2050年後延伸10年
  
  // 假設2030年排放量（基線的約77%，因為2020-2030年間已有4.2%年減排）
  const emissionsAt2030 = 100000; // tCO2e
  const residualPercentage = 5; // 5%
  const residualEmissions = emissionsAt2030 * 0.65 * (residualPercentage / 100); // 約3250 tCO2e
  
  console.log('SBTi圖表參數:', {
    emissionsAt2030,
    residualEmissions,
    residualPercentage
  });

  // 生成2030-2050年拋物線型年度減量數據
  const generateSBTiPathway = () => {
    const years = netZeroYear - startYear; // 20年
    const totalReductionNeeded = emissionsAt2030 - residualEmissions;
    
    // 設計拋物線年減排量：r(t) = at² + bt + c
    // 邊界條件：前期緩慢，後期加速
    const sumT2 = years * (years + 1) * (2 * years + 1) / 6;
    
    // 設定前期減排量相對較小，後期較大的比例
    const minReductionRatio = 0.3;
    const avgReduction = totalReductionNeeded / years;
    const minReduction = avgReduction * minReductionRatio;
    
    // 從 r(1) = a + b = minReduction 和總量約束求解 a 和 b
    const b = minReduction - (totalReductionNeeded - minReduction * years) / sumT2;
    const a = (totalReductionNeeded - b * years) / sumT2;
    
    const pathway = [];
    let cumulativeReduction = 0;
    
    // 添加2030年起始點
    pathway.push({
      year: startYear,
      totalEmissions: emissionsAt2030,
      annualReduction: 0,
      cumulativeReduction: 0,
    });
    
    // 生成2031-2050年數據
    for (let t = 1; t <= years; t++) {
      const parabolicReduction = a * t * t + b;
      cumulativeReduction += parabolicReduction;
      
      let currentEmissions;
      if (t === years) {
        currentEmissions = residualEmissions;
      } else {
        currentEmissions = emissionsAt2030 - cumulativeReduction;
        currentEmissions = Math.max(currentEmissions, residualEmissions);
      }
      
      pathway.push({
        year: startYear + t,
        totalEmissions: Math.round(currentEmissions),
        annualReduction: Math.round(parabolicReduction),
        cumulativeReduction: Math.round(cumulativeReduction),
      });
    }
    
    // 添加2050年後的Neutralisation階段
    for (let i = 1; i <= extendedYears; i++) {
      pathway.push({
        year: netZeroYear + i,
        totalEmissions: residualEmissions,
        annualReduction: 0,
        cumulativeReduction: Math.round(totalReductionNeeded),
      });
    }
    
    return pathway;
  };

  const pathwayData = generateSBTiPathway();
  
  // 使用三次函數來創建更平滑的曲線數據
  const generateSmoothCurve = (data: any[]) => {
    // 為每個年份之間插入中間點以創建更平滑的曲線
    const smoothData = [];
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      
      smoothData.push(current);
      
      // 在兩個年份之間插入3個中間點
      for (let j = 1; j <= 3; j++) {
        const ratio = j / 4;
        const interpolatedYear = current.year + ratio;
        const interpolatedEmissions = current.totalEmissions + 
          (next.totalEmissions - current.totalEmissions) * 
          // 使用三次函數進行插值以獲得更平滑的曲線
          (3 * ratio * ratio - 2 * ratio * ratio * ratio);
        
        smoothData.push({
          year: interpolatedYear,
          totalEmissions: Math.round(interpolatedEmissions),
          annualReduction: null,
          cumulativeReduction: null,
        });
      }
    }
    
    // 添加最後一個點
    smoothData.push(data[data.length - 1]);
    return smoothData;
  };

  const smoothPathwayData = generateSmoothCurve(pathwayData);

  return (
    <div className="space-y-6">
      {/* 總排放量趨勢圖 - SBTi風格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg font-bold">
            模擬排放量減少趨勢（拋物線型年度減量對應 SBTi 路徑）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={smoothPathwayData}>
                <defs>
                  <linearGradient id="sbtiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1976D2" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#90caf9" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="neutralisationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#26C485" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#d1fae5" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                
                {/* Neutralisation 階段背景 */}
                <ReferenceArea
                  x1={netZeroYear}
                  x2={netZeroYear + extendedYears}
                  stroke="none"
                  fill="#E6F4EA"
                  fillOpacity={0.4}
                  ifOverflow="extendDomain"
                />
                
                {/* 中程目標年標線 (2035) */}
                <ReferenceLine
                  x={2035}
                  stroke="#FB923C"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{
                    position: 'top',
                    fill: "#FB923C",
                    fontWeight: 600,
                    fontSize: 12,
                    value: "中程目標 2035",
                  }}
                />
                
                {/* 長程目標年標線 (2042) */}
                <ReferenceLine
                  x={2042}
                  stroke="#F59E42"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  label={{
                    position: 'top',
                    fill: "#F59E42",
                    fontWeight: 600,
                    fontSize: 12,
                    value: "長程目標 2042",
                  }}
                />
                
                {/* Net Zero 年標線 */}
                <ReferenceLine
                  x={netZeroYear}
                  stroke="#26A485"
                  strokeWidth={3}
                  label={{
                    position: 'insideTopRight',
                    value: "Net Zero 2050",
                    fill: "#26A485",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                />
                
                {/* 殘留排放水平線 */}
                <ReferenceLine
                  y={residualEmissions}
                  stroke="#26C485"
                  strokeWidth={2}
                  strokeDasharray="7 6"
                  label={{
                    position: 'insideTopRight',
                    fill: "#26C485",
                    fontWeight: 700,
                    fontSize: 12,
                    value: `殘留排放 ${residualPercentage}%`,
                  }}
                  ifOverflow="extendDomain"
                />
                
                <XAxis 
                  dataKey="year" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fontWeight: 500 }}
                  domain={[startYear, netZeroYear + extendedYears]}
                  type="number"
                  allowDataOverflow
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  width={80}
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
                
                {/* 主排放量區域圖 - 使用平滑曲線 */}
                <Area 
                  type="monotone"
                  dataKey="totalEmissions"
                  stroke={chartConfig.totalEmissions.color}
                  strokeWidth={3}
                  fill="url(#sbtiGradient)"
                  fillOpacity={0.9}
                  name="總排放量 (tCO2e)"
                  activeDot={{ r: 6, fill: chartConfig.totalEmissions.color }}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 年度減量圖 - 拋物線型 */}
      <Card>
        <CardHeader>
          <CardTitle>年度減量趨勢（拋物線型：前期緩慢，後期加速）</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pathwayData.filter(d => d.annualReduction !== null && d.year <= netZeroYear)}>
                <defs>
                  <linearGradient id="parabolicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ede9fe" stopOpacity={0.2} />
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
                  tickFormatter={value => `${(value / 1000).toFixed(1)}k`}
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
                  strokeWidth={2}
                  fill="url(#parabolicGradient)"
                  name="年度減量 (tCO2e)"
                  activeDot={{ r: 5, fill: chartConfig.annualReduction.color }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 圖表說明 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">📊 圖表特色</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• 使用三次函數創建平滑的排放量下降曲線</li>
                <li>• 拋物線型年度減量：前期緩慢，後期加速</li>
                <li>• 符合 SBTi 1.5°C 路徑標準</li>
                <li>• 綠色 Neutralisation 區域（2050年後）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-green-600">🎯 關鍵里程碑</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• 2030年：SBTi 近期目標基準</li>
                <li>• 2035年：中程減排目標</li>
                <li>• 2042年：長程減排目標</li>
                <li>• 2050年：Net Zero 目標年</li>
                <li>• 最終殘留排放：5%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SBTiStyleChart;
