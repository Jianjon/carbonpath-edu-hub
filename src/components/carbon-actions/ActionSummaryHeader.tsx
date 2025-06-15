
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionAngle } from '../../pages/CarbonCredits';
import { BarChart3 } from 'lucide-react';

interface Props {
    totalActions: number;
    angleCounts: Record<ActionAngle, number>;
}

const ActionSummaryHeader = ({ totalActions, angleCounts }: Props) => {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    行動摘要
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-4xl font-bold">
                    {totalActions}
                    <span className="ml-2 text-lg font-normal text-muted-foreground">項行動</span>
                </p>
                <div className="space-y-2">
                    <h4 className="font-semibold">各面向分佈：</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {Object.entries(angleCounts).map(([angle, count]) => (
                            <li key={angle}><span className="font-medium text-foreground">{angle}</span>: {count} 項</li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default ActionSummaryHeader;
