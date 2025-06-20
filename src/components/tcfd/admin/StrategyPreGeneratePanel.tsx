
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Database, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const StrategyPreGeneratePanel = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [batchSize, setBatchSize] = useState(50);
  const [lastResult, setLastResult] = useState<any>(null);

  const industries = [
    { value: 'restaurant', label: '餐飲業' },
    { value: 'retail', label: '零售業' },
    { value: 'manufacturing', label: '製造業' },
    { value: 'construction', label: '營建業' },
    { value: 'transportation', label: '運輸業' },
    { value: 'technology', label: '科技業' },
    { value: 'finance', label: '金融業' },
    { value: 'healthcare', label: '醫療保健' },
    { value: 'education', label: '教育服務' },
    { value: 'hospitality', label: '旅宿業' },
  ];

  const companySizes = [
    { value: 'small', label: '小型企業' },
    { value: 'medium', label: '中型企業' },
    { value: 'large', label: '大型企業' },
  ];

  const handlePreGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      console.log('開始預先生成策略...');
      
      const response = await fetch('/api/tcfd-pregenerate-strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchSize,
          specificIndustry: selectedIndustry || undefined,
          specificSize: selectedSize || undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setLastResult(data.summary);
        toast.success(`預先生成完成！${data.message}`);
        setProgress(100);
      } else {
        throw new Error(data.error || '預先生成失敗');
      }
    } catch (error) {
      console.error('預先生成錯誤:', error);
      toast.error(`預先生成失敗: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>策略預先生成管理</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              此功能會預先生成各種產業和企業規模組合的TCFD策略內容，儲存在快取中以提升用戶體驗。
              生成過程會調用OpenAI API，請確保已設定API金鑰。
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">指定產業（可選）</Label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="全部產業" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部產業</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">指定企業規模（可選）</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="全部規模" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部規模</SelectItem>
                  {companySizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchSize">批次大小</Label>
              <Input
                id="batchSize"
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                min={1}
                max={200}
                placeholder="50"
              />
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">預先生成進度</span>
                <span className="text-sm text-gray-600">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button
            onClick={handlePreGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                預先生成中...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                開始預先生成策略
              </>
            )}
          </Button>

          {lastResult && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">最近一次生成結果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">總組合數：</span>
                    <span>{lastResult.totalCombinations}</span>
                  </div>
                  <div>
                    <span className="font-medium">已處理：</span>
                    <span>{lastResult.processed}</span>
                  </div>
                  <div>
                    <span className="font-medium">新生成：</span>
                    <span className="text-green-600">{lastResult.generated}</span>
                  </div>
                  <div>
                    <span className="font-medium">已快取：</span>
                    <span className="text-blue-600">{lastResult.cached}</span>
                  </div>
                  <div>
                    <span className="font-medium">錯誤數量：</span>
                    <span className={lastResult.errors > 0 ? 'text-red-600' : 'text-green-600'}>
                      {lastResult.errors}
                    </span>
                  </div>
                </div>
                
                {lastResult.errorDetails && lastResult.errorDetails.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-red-800 mb-2">錯誤詳情：</h4>
                    <div className="space-y-1 text-xs">
                      {lastResult.errorDetails.map((error: any, index: number) => (
                        <div key={index} className="text-red-700">
                          <span className="font-medium">{error.combination}:</span> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyPreGeneratePanel;
