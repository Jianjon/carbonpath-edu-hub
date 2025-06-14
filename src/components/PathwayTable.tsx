
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PathwayData } from '../pages/CarbonPath';

interface PathwayTableProps {
  data: PathwayData[];
  baseYear: number;
  residualEmissions: number;
  residualPercentage: number;
}

const PathwayTable: React.FC<PathwayTableProps> = ({ 
  data, 
  baseYear, 
  residualEmissions, 
  residualPercentage 
}) => {
  if (!data || data.length === 0) {
    return null;
  }
  
  const totalReductionPercentage = 100 - residualPercentage;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          年度減碳目標數據表 (最終殘留：{residualEmissions.toLocaleString()} tCO2e = {residualPercentage}%, 總減排：{totalReductionPercentage.toFixed(1)}%)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>年份</TableHead>
                <TableHead>排放量 (tCO2e)</TableHead>
                <TableHead>目標排放量 (tCO2e)</TableHead>
                <TableHead>累計減排率 (%)</TableHead>
                <TableHead>年減排量 (tCO2e)</TableHead>
                <TableHead>當年殘留比例 (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-medium">{row.year}</TableCell>
                  <TableCell>{row.emissions.toLocaleString()}</TableCell>
                  <TableCell>
                    {row.target !== undefined ? row.target.toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {row.reduction !== undefined ? `${row.reduction.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {row.annualReduction !== undefined && row.annualReduction !== null ? row.annualReduction.toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {row.remainingPercentage !== undefined && row.remainingPercentage !== null ? `${row.remainingPercentage.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PathwayTable;
