
import { Industry } from '../../pages/CarbonCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Download, RefreshCw, ChevronLeft } from 'lucide-react';
import { useActionSummaryData } from './hooks/useActionSummaryData';
import { exportActionsToCsv } from '../../lib/exportUtils';
import ActionSummaryHeader from './ActionSummaryHeader';
import ActionSummaryChart from './ActionSummaryChart';
import ActionDetailsCard from './ActionDetailsCard';

interface Props {
    industry: Industry;
    selectedActionIds: string[];
    onBack: () => void;
    onReset: () => void;
}

const ActionSummary = ({ industry, selectedActionIds, onBack, onReset }: Props) => {
    const {
        selectedActions,
        summaryData,
        chartConfig,
        scatterDataByAngle
    } = useActionSummaryData(industry, selectedActionIds);

    const handleExport = () => {
        exportActionsToCsv(selectedActions, industry);
    };

    return (
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle>3. 您的專屬減碳行動計畫</CardTitle>
                <CardDescription>這是根據您的選擇「{industry}」生成的減碳行動計畫摘要。您可以匯出此計畫或返回修改。</CardDescription>
            </CardHeader>
            <CardContent>
                {selectedActions.length > 0 ? (
                    <>
                        <div className="mb-8 grid gap-6 md:grid-cols-5">
                            <ActionSummaryHeader
                                totalActions={summaryData.totalActions}
                                angleCounts={summaryData.angleCounts}
                            />
                            <ActionSummaryChart
                                scatterDataByAngle={scatterDataByAngle}
                                chartConfig={chartConfig}
                            />
                        </div>

                        <div className="space-y-4">
                            {selectedActions.map(action => (
                                <ActionDetailsCard
                                    key={action.id}
                                    action={action}
                                    chartConfig={chartConfig}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-muted-foreground text-center">沒有選擇任何行動。</p>
                )}
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
