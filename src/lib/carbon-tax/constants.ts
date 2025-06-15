
import { Rate } from './types';

export const rates: Rate[] = [
    {
        value: 300,
        label: '預設費率 (300元/噸)',
        description: '適用於一般情況，或未達成自主減量目標的企業。'
    },
    {
        value: 100,
        label: '優惠費率 A (100元/噸)',
        description: (
            <div className="space-y-2 text-left">
                <p><b>🎯 適用條件：</b></p>
                <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                    <li>提出並通過「自主減量計畫」，經主管機關審查核定。</li>
                    <li>達到「行業別指定削減率」（根據所屬產業設定的減碳目標）。</li>
                </ul>
                <p className="pt-2"><b>📊 行業別指定削減率舉例：</b></p>
                <div className="text-sm border rounded-md p-3 bg-gray-50/80">
                    <p><b>鋼鐵業:</b> 25.2%</p>
                    <p><b>水泥業:</b> 22.3%</p>
                    <p><b>其他行業:</b> 42.0%</p>
                </div>
                <p className="pt-2"><b>📌 核心精神：</b></p>
                <p className="text-sm">您需證明「有效執行減碳行動」且結果達標，才能適用此優惠費率。</p>
            </div>
        )
    },
    {
        value: 50,
        label: '優惠費率 B (50元/噸)',
        description: (
            <div className="space-y-2 text-left">
                <p><b>🎯 適用條件：</b></p>
                <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                    <li>同樣需通過「自主減量計畫」，並經審查核定。</li>
                    <li>達到「技術標竿削減率」，此為更進一步的減碳標準。</li>
                </ul>
                <p className="pt-2"><b>🔧 所謂「技術標竿」常見包括：</b></p>
                <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                    <li>引進高效率製程設備</li>
                    <li>能源使用效率顯著優於同業</li>
                    <li>使用再生能源或低碳燃料</li>
                    <li>實施碳捕捉技術 (CCUS)</li>
                </ul>
                <p className="pt-2"><b>📌 核心精神：</b></p>
                <p className="text-sm">此費率鼓勵具備實質技術投資的企業，並需符合環境部公告之標準。</p>
            </div>
        )
    },
];

// Based on 2030 targets (5 years from 2025)
export const steelAnnualReduction = 1 - Math.pow(1 - 0.252, 1 / 5); // ~5.7%
export const cementAnnualReduction = 1 - Math.pow(1 - 0.223, 1 / 5); // ~5.0%
