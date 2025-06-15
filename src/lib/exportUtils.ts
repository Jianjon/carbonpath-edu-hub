
import { Action, ActionAngle, Industry } from '../pages/CarbonCredits';

type ActionWithAngle = Action & { angle: ActionAngle };

export const exportActionsToCsv = (actions: ActionWithAngle[], industry: Industry) => {
    const headers = ['減碳面向', '減碳方向', '效益描述', '預估投資級距'];
    const csvRows = [headers.join(',')];

    actions.forEach(action => {
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
