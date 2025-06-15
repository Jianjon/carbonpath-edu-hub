
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Introduction = () => {
  return (
    <Card className="mb-8 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
          <BookOpen className="mr-3 h-7 w-7 text-blue-600" />
          碳費制度簡介與法規說明
        </CardTitle>
      </CardHeader>
      <CardContent className="text-gray-600 space-y-3">
        <p>台灣碳費制度依據《氣候變遷因應法》設立，旨在透過經濟誘因鼓勵企業減碳，並促進國家達成2050淨零轉型目標。</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li><b>徵收對象：</b>初期主要針對年排放量超過 25,000 噸 CO₂e 的電力業及大型製造業。</li>
            <li><b>基本費率：</b>預設費率為每噸 300 元新台幣，未來將視國內外情況滾動式調整。</li>
            <li><b>優惠機制：</b>若企業能有效執行自主減量計畫或符合特定條件，可適用優惠費率以茲鼓勵。</li>
            <li><b>碳洩漏風險：</b>為保護國內產業競爭力，對具備高碳洩漏風險的事業設有不同的收費係數，避免產業外移。</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default Introduction;
