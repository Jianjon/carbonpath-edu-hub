
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ActionAngle } from '../../pages/CarbonCredits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ChartContainer, ChartLegend, 
    ChartLegendContent, type ChartConfig 
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

const ActionSummaryChart = ({ scatterDataByAngle, chartConfig }: Props) => {
    const hasData = Object.keys(scatterDataByAngle).length > 0;

    return (
        <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle className="text-lg">行動效益分析</CardTitle>
                <CardDescription>比較不同行動的投資與執行難度</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] pb-4">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="投資級距" 
                                domain={[0.5, 3.5]} 
                                ticks={[1, 2, 3]} 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => ({ 1: '低', 2: '中', 3: '高' }[value] || '')}
                                label={{ value: "投資級距", position: 'insideBottom', offset: -15, fontSize: 12 }}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="執行難度"
                                domain={[0.5, 3.5]}
                                ticks={[1, 2, 3]} 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => ({ 1: '簡易', 2: '中等', 3: '複雜' }[value] || '')}
                                label={{ value: "執行難度", angle: -90, position: 'insideLeft', offset: 0, fontSize: 12 }}
                            />
                            <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                            <Legend content={<ChartLegendContent />} verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}} />
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
