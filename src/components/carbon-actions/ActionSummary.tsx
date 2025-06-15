import { useMemo } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Action, Industry, ActionAngle } from '../../pages/CarbonCredits';
import { actionsData, actionAngles } from '../../data/carbonActionsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Download, ListChecks, Target, RefreshCw, ChevronLeft, 
    BarChart3, DollarSign, Clock, Users, Zap
} from 'lucide-react';
import { 
    ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, 
    ChartLegendContent, type ChartConfig 
} from '@/components/ui/chart';

interface Props {
    industry: Industry;
    selectedActionIds: string[];
    onBack: () => void;
    onReset: () => void;
}

const ActionSummary = ({ industry, selectedActionIds, onBack, onReset }: Props) => {
    const actionToAngleMap = useMemo(() => {
        const map = new Map<string, ActionAngle>();
        for (const angle of actionAngles) {
            actionsData[industry][angle]?.forEach(action => {
                map.set(action.id, angle);
            });
        }
        return map;
    }, [industry]);

    const selectedActions = useMemo(() => {
        const allIndustryActions = Object.values(actionsData[industry]).flat();
        return selectedActionIds.map(id => {
            const action = allIndustryActions.find(a => a.id === id);
            const angle = actionToAngleMap.get(id);
            if (action && angle) {
                return { ...action, angle };
            }
            return null;
        }).filter((action): action is Action & { angle: ActionAngle } => action !== null);
    }, [industry, selectedActionIds, actionToAngleMap]);

    const summaryData = useMemo(() => {
        const angleCounts = selectedActions.reduce((acc, action) => {
            acc[action.angle] = (acc[action.angle] || 0) + 1;
            return acc;
        }, {} as Record<ActionAngle, number>);

        const chartData = actionAngles
            .map(angle => ({
                angle,
                count: angleCounts[angle] || 0,
            }))
            .filter(item => item.count > 0);

        return {
            totalActions: selectedActions.length,
            angleCounts,
            chartData
        };
    }, [selectedActions]);

    const chartConfig = useMemo(() => {
        const config: ChartConfig = {};
        const colors: Record<ActionAngle, string> = {
            '能源管理': 'hsl(var(--chart-1))',
            '循環經濟': 'hsl(var(--chart-2))',
            '永續採購': 'hsl(var(--chart-3))',
            '淨零管理': 'hsl(var(--chart-4))'
        };
        summaryData.chartData.forEach((item) => {
            config[item.angle] = {
                label: item.angle,
                color: colors[item.angle],
            };
        });
        return config as ChartConfig;
    }, [summaryData.chartData]);

    const handleExport = () => {
        const headers = ['減碳面向', '減碳方向', '效益描述', '預估投資級距'];
        const csvRows = [headers.join(',')];

        selectedActions.forEach(action => {
            const row = [
                `"${action.angle}"`,
                `"${action.name}"`,
                `"${action.description}"`,
                `"${action.investment}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${industry}_減碳行動計畫.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle>3. 您的專屬減碳行動計畫</CardTitle>
                <CardDescription>這是根據您的選擇「{industry}」生成的減碳行動計畫摘要。您可以匯出此計畫或返回修改。</CardDescription>
            </CardHeader>
            <CardContent>
                {selectedActions.length > 0 && (
                    <div className="mb-8 grid gap-6 md:grid-cols-5">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                                    行動摘要
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-4xl font-bold">
                                    {summaryData.totalActions}
                                    <span className="ml-2 text-lg font-normal text-muted-foreground">項行動</span>
                                </p>
                                <div className="space-y-2">
                                    <h4 className="font-semibold">各面向分佈：</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        {Object.entries(summaryData.angleCounts).map(([angle, count]) => (
                                            <li key={angle}><span className="font-medium text-foreground">{angle}</span>: {count} 項</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-lg">行動分佈圖</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[200px] pb-0">
                                <ChartContainer config={chartConfig} className="w-full h-full">
                                    <PieChart>
                                        <ChartTooltip 
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />} 
                                        />
                                        <Pie data={summaryData.chartData} dataKey="count" nameKey="angle" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                            {summaryData.chartData.map((entry) => (
                                               <Cell key={`cell-${entry.angle}`} fill={chartConfig[entry.angle]?.color} />
                                            ))}
                                        </Pie>
                                        <ChartLegend 
                                            content={<ChartLegendContent nameKey="angle" />} 
                                            className="-translate-y-2 flex-wrap"
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="space-y-4">
                    {selectedActions.length > 0 ? selectedActions.map(action => (
                        <div key={action.id} className="p-4 border rounded-lg bg-background">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg flex-grow pr-4">{action.name}</h3>
                                <Badge variant="secondary" style={{ backgroundColor: chartConfig[action.angle]?.color, color: 'hsl(var(--primary-foreground))' }}>{action.angle}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground my-2">{action.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-t pt-3 mt-3">
                                <div className="flex items-center gap-1.5" title="投資級距">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                    <span>{action.investment}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="執行難度">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    <span>{action.difficulty}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="預估時程">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span>{action.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="所需人力">
                                    <Users className="h-4 w-4 text-purple-500" />
                                    <span>{action.manpower}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                <div>
                                    <h4 className="font-semibold flex items-center text-sm mb-1"><ListChecks className="h-4 w-4 mr-2 text-primary" />執行步驟</h4>
                                    <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pl-2">
                                        {action.steps.map((step, i) => <li key={i}>{step}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold flex items-center text-sm mb-1"><Target className="h-4 w-4 mr-2 text-primary" />後續追蹤</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                                        {action.tracking.map((track, i) => <li key={i}>{track}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center">沒有選擇任何行動。</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
                 <Button variant="outline" onClick={onBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    返回修改
                </Button>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExport} disabled={selectedActions.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        匯出計畫
                    </Button>
                    <Button variant="outline" onClick={onReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        重新開始
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default ActionSummary;
