
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Action, ActionAngle } from '../../pages/CarbonCredits';
import { BarChart3 } from 'lucide-react';

interface Props {
    totalActions: number;
    actionsByAngle: Record<ActionAngle, (Action & { angle: ActionAngle })[]>;
}

const ActionSummaryHeader = ({ totalActions, actionsByAngle }: Props) => {
    const sortedAngles = Object.keys(actionsByAngle).sort() as ActionAngle[];

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
                <div className="space-y-4">
                     {sortedAngles.map(angle => (
                        <div key={angle}>
                            <h4 className="font-semibold text-base mb-1">{angle}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {actionsByAngle[angle].map(action => (
                                    <li key={action.id} className="text-foreground">
                                        {action.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ActionSummaryHeader;
