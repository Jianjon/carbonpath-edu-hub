
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Settings, BarChart3, Zap } from 'lucide-react';
import BatchGeneratorPanel from './BatchGeneratorPanel';
import StrategyPreGeneratePanel from './StrategyPreGeneratePanel';

const TCFDAdminPanel = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">TCFD 系統管理</h1>
        <p className="text-lg text-gray-600">
          管理 TCFD 評估系統的各項功能，包含示範數據生成和策略內容預先生成
        </p>
      </div>

      <Tabs defaultValue="strategy-pregenerate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="strategy-pregenerate" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>策略預先生成</span>
          </TabsTrigger>
          <TabsTrigger value="batch-generator" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>批量示範數據</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy-pregenerate">
          <StrategyPreGeneratePanel />
        </TabsContent>

        <TabsContent value="batch-generator">
          <BatchGeneratorPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TCFDAdminPanel;
