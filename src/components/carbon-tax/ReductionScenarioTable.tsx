
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TableData {
    year: number;
    emissions: number;
    annualReduction: number;
}

interface ReductionScenarioTableProps {
  data: TableData[];
}

const ReductionScenarioTable: React.FC<ReductionScenarioTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">年度減量目標參考</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="max-h-60 overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-gray-100/80 backdrop-blur-sm">
                <TableRow>
                    <TableHead>年份</TableHead>
                    <TableHead className="text-right">目標排放量 (噸)</TableHead>
                    <TableHead className="text-right">相較前一年減量 (噸)</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.slice(0, 10).map((row) => (
                    <TableRow key={row.year}>
                    <TableCell className="font-medium">{row.year}</TableCell>
                    <TableCell className="text-right">{row.emissions.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">{row.annualReduction > 0 ? `-${row.annualReduction.toLocaleString()}` : 0}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        {data.length > 10 && <p className="text-center text-xs text-gray-500 pt-3">... 僅顯示前10年數據 ...</p>}
      </CardContent>
    </Card>
  );
};

export default ReductionScenarioTable;
