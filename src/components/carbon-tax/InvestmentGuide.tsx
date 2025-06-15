
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

const InvestmentGuide = () => {
    return (
        <Card className="bg-white">
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Lightbulb className="h-6 w-6 mr-3 text-yellow-500" />
                    如何評估減碳投資效益？
                </CardTitle>
                <CardDescription>
                    您可以利用上表的「每噸減碳效益」來評估減碳設備或方案是否划算。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
                <p>當您取得廠商（例如：能源管理、節能設備商）的方案時，可以依以下步驟評估：</p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Step 1: 計算投資的「每噸減碳成本」</h4>
                    <p className="mt-2">將廠商的總報價（包含設備、建置、維護等費用）除以其承諾的總減碳量。</p>
                    <p className="mt-2 font-mono text-sm bg-gray-100 p-2 rounded">
                        每噸減碳成本 = 總投資成本 / 總保證減碳量 (噸)
                    </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800">Step 2: 比較「成本」與「效益」</h4>
                    <p className="mt-2">將您算出的「每噸減碳成本」與我們在上方表格中為您計算的「每噸減碳效益」進行比較。</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>若 <span className="font-bold text-red-600">成本 &gt; 效益</span>：代表投資該設備的單位成本，高於您因減碳而省下的碳費，投資效益較低。</li>
                        <li>若 <span className="font-bold text-green-600">成本 &lt; 效益</span>：代表投資該設備的單位成本，低於您能省下的碳費，這是一項划算的投資！</li>
                    </ul>
                </div>
                <p className="text-sm text-gray-500 pt-2">
                    <strong>提醒：</strong> 這個比較提供了一個財務上的快速評估。實際決策時，還需考量技術成熟度、維運複雜性、政策風險以及企業的永續發展目標等多重因素。
                </p>
            </CardContent>
        </Card>
    );
};

export default InvestmentGuide;
