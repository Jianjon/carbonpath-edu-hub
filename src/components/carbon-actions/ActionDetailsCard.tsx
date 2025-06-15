
import { Action, ActionAngle } from '../../pages/CarbonCredits';
import { Badge } from '@/components/ui/badge';
import { type ChartConfig } from '@/components/ui/chart';
import { 
    ListChecks, Target, DollarSign, Clock, Users, Zap
} from 'lucide-react';

interface Props {
    action: Action & { angle: ActionAngle };
    chartConfig: ChartConfig;
}

const ActionDetailsCard = ({ action, chartConfig }: Props) => {
    return (
        <div className="p-4 border rounded-lg bg-background">
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
    );
};

export default ActionDetailsCard;
