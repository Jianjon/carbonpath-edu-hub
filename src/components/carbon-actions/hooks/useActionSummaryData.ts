
import { useMemo } from 'react';
import { Action, Industry, ActionAngle } from '../../../pages/CarbonCredits';
import { actionsData, actionAngles } from '../../../data/carbonActionsData';
import { type ChartConfig } from '@/components/ui/chart';

const investmentMap: Record<'高' | '中' | '低', number> = { '低': 1, '中': 2, '高': 3 };
const difficultyMap: Record<'簡易' | '中等' | '複雜', number> = { '簡易': 1, '中等': 2, '複雜': 3 };

export const useActionSummaryData = (industry: Industry, selectedActionIds: string[]) => {
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

    const scatterDataByAngle = useMemo(() => {
        return selectedActions.reduce((acc, action) => {
            const angle = action.angle;
            if (!acc[angle]) {
                acc[angle] = [];
            }
            acc[angle].push({
                x: investmentMap[action.investment],
                y: difficultyMap[action.difficulty],
                name: action.name,
                investment: action.investment,
                difficulty: action.difficulty,
            });
            return acc;
        }, {} as Record<ActionAngle, { x: number; y: number; name: string, investment: string, difficulty: string }[]>);
    }, [selectedActions]);

    return {
        selectedActions,
        summaryData,
        chartConfig,
        scatterDataByAngle
    };
};
