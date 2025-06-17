
import InfoCard from '@/components/shared/InfoCard';
import { MessageSquare } from 'lucide-react';

const ChatbotInfo = () => {
    return (
        <InfoCard
          icon={MessageSquare}
          title="ESG智能顧問功能說明"
          description={
            <span>
              這位AI顧問是您專屬的ESG永續發展專家，專精於碳管理領域。
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><b>智能整合模式：</b>優先基於您上傳的專業文件提供精準解答，並適度補充專業知識。</li>
                <li><b>專業範圍：</b>只回答ESG永續發展、碳管理、節能減碳、溫室氣體盤查、碳足跡、循環經濟等相關問題。</li>
                <li><b>智能推薦：</b>提供涵蓋節能減碳、盤查、足跡、循環經濟四大領域的專業問題。</li>
                <li><b>動態更新：</b>問題會根據對話內容智能更新，引導您深入學習ESG知識。</li>
              </ul>
            </span>
          }
          themeColor="purple"
          className="mb-8"
        />
    );
};

export default ChatbotInfo;
