
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { INDUSTRIES, COMPANY_SIZES } from '@/types/tcfd';

interface GenerationResult {
  industry: string;
  company_size: string;
  assessment_id?: string;
  error?: string;
}

const BatchGeneratorPanel = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [count, setCount] = useState(30);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError('');
    setResults([]);

    try {
      console.log('開始批量生成 TCFD 示範數據...');
      
      const { data, error: functionError } = await supabase.functions.invoke('tcfd-batch-generator', {
        body: {
          industry: selectedIndustry || undefined,
          company_size: selectedSize || undefined,
          count
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      console.log(`批量生成完成，共生成 ${data.generated} 筆資料`);
      
    } catch (err) {
      console.error('批量生成失敗:', err);
      setError(err instanceof Error ? err.message : '生成失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  const successCount = results.filter(r => !r.error).length;
  const errorCount = results.filter(r => r.error).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>TCFD 示範數據批量生成</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">產業別（可選）</Label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="全部產業" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部產業</SelectItem>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">企業規模（可選）</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="全部規模" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部規模</SelectItem>
                  {COMPANY_SIZES.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">最大生成數量</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 30)}
                min={1}
                max={100}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              '開始批量生成'
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>成功: {successCount}</span>
                </div>
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>失敗: {errorCount}</span>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <span>
                      {INDUSTRIES.find(i => i.value === result.industry)?.label} - 
                      {COMPANY_SIZES.find(s => s.value === result.company_size)?.label}
                    </span>
                    {result.error ? (
                      <span className="text-xs">{result.error}</span>
                    ) : (
                      <span className="text-xs font-mono">{result.assessment_id?.slice(0, 8)}...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchGeneratorPanel;
