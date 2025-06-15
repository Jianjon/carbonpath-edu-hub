
import { useMemo } from 'react';
import { Action, Industry, ActionAngle } from '../../pages/CarbonCredits';
import { actionsData, actionAngles } from '../../data/carbonActionsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, ListChecks, Target, RefreshCw, ChevronLeft } from 'lucide-react';

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
                <div className="space-y-4">
                    {selectedActions.length > 0 ? selectedActions.map(action => (
                        <div key={action.id} className="p-4 border rounded-lg bg-background">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg flex-grow pr-4">{action.name}</h3>
                                <Badge variant="secondary">{action.angle}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground my-2">{action.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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
