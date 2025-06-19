
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileText, Settings } from 'lucide-react';
import BatchGeneratorPanel from './BatchGeneratorPanel';

const TCFDAdminPanel = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TCFD 管理面板</h1>
        <p className="text-gray-600">
          管理 TCFD 示範數據和系統設定
        </p>
      </div>

      <Tabs defaultValue="batch-generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch-generator" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>批量生成</span>
          </TabsTrigger>
          <TabsTrigger value="data-management" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>數據管理</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>系統設定</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batch-generator" className="mt-6">
          <BatchGeneratorPanel />
        </TabsContent>

        <TabsContent value="data-management" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>數據管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">數據管理功能開發中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>系統設定</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">系統設定功能開發中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TCFDAdminPanel;
