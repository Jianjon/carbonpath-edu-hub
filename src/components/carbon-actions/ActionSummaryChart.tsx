
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, Customized } from 'recharts';
import { ActionAngle } from '../../pages/CarbonCredits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ChartContainer, type ChartConfig 
} from '@/components/ui/chart';

type ScatterData = {
    x: number;
    y: number;
    name: string;
    investment: string;
    difficulty: string;
};

interface Props {
    scatterDataByAngle: Record<ActionAngle, ScatterData[]>;
    chartConfig: ChartConfig;
}

const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2 text-sm bg-background border rounded-lg shadow-lg">
                <p className="font-bold">{data.name}</p>
                <p className="text-muted-foreground">投資級距: {data.investment}</p>
                <p className="text-muted-foreground">執行難度: {data.difficulty}</p>
            </div>
        );
    }
    return null;
};

const renderQuadrantLabels = (props: any) => {
    const { xAxisMap, yAxisMap } = props;
    const xAxis = xAxisMap[0];
    const yAxis = yAxisMap[0];
    
    if (!xAxis || !yAxis) return null;

    const labels = [
        { x: 1.5, y: 1.5, name: "速效方案", desc: "低投資/低難度" },
        { x: 3, y: 1.5, name: "高CP值方案", desc: "高投資/低難度" },
        { x: 1.5, y: 3, name: "策略投資", desc: "低投資/高難度" },
        { x: 3, y: 3, name: "重大專案", desc: "高投資/高難度" },
    ];

    return (
        <g>
            {labels.map(label => (
                <g key={label.name} transform={`translate(${xAxis.scale(label.x)}, ${yAxis.scale(label.y)})`}>
                    <text x={0} y={0} dy={-8} textAnchor="middle" className="text-base font-bold fill-foreground">
                        {label.name}
                    </text>
                     <text x={0} y={0} dy={12} textAnchor="middle" className="text-xs fill-foreground/70">
                        {label.desc}
                    </text>
                </g>
            ))}
        </g>
    );
};

const ActionSummaryChart = ({ scatterDataByAngle, chartConfig }: Props) => {
    const hasData = Object.keys(scatterDataByAngle).length > 0;

    return (
        <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle className="text-lg">行動效益分析</CardTitle>
                <CardDescription>2x2矩陣分析：投資級距 vs. 執行難度</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] pb-4">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <ScatterChart margin={{ top: 20, right: 40, bottom: 60, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <ReferenceArea x1={0.5} x2={2.5} y1={0.5} y2={2.5} stroke="none" fill="hsl(var(--chart-1))" fillOpacity={0.1} />
                            <ReferenceArea x1={2.5} x2={3.5} y1={0.5} y2={2.5} stroke="none" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
                            <ReferenceArea x1={0.5} x2={2.5} y1={2.5} y2={3.5} stroke="none" fill="hsl(var(--chart-3))" fillOpacity={0.1} />
                            <ReferenceArea x1={2.5} x2={3.5} y1={2.5} y2={3.5} stroke="none" fill="hsl(var(--chart-4))" fillOpacity={0.1} />
                            
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="投資級距" 
                                domain={[0.5, 3.5]} 
                                ticks={[1, 2, 3]} 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => ({ 1: '低', 2: '中', 3: '高' }[value] || '')}
                                label={{ value: "投資級距", position: 'insideBottom', offset: -25, fontSize: 14, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="執行難度"
                                domain={[0.5, 3.5]}
                                ticks={[1, 2, 3]} 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => ({ 1: '簡易', 2: '中等', 3: '複雜' }[value] || '')}
                                label={{ value: "執行難度", angle: -90, position: 'insideLeft', offset: 10, fontSize: 14, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                            
                            <Customized component={renderQuadrantLabels} />

                            {Object.entries(scatterDataByAngle).map(([angle, data]) => (
                                <Scatter 
                                    key={angle} 
                                    name={angle} 
                                    data={data} 
                                    fill={chartConfig[angle as ActionAngle]?.color}
                                />
                            ))}
                        </ScatterChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <p>沒有足夠的數據來生成圖表。</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ActionSummaryChart;
