
import InfoCard from '@/components/shared/InfoCard';
import { MessageSquare } from 'lucide-react';

const ChatbotInfo = () => {
    return (
        <InfoCard
          icon={MessageSquare}
          title="減碳智能助手功能說明"
          description={
            <span>
              這位 AI 助教是您專屬的減碳顧問，能協助您應對各種挑戰。
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><b>一般模式：</b>利用廣泛的通用知識，回答您關於節能減碳、法規政策、技術方案等問題。</li>
                <li><b>文件模式：</b>切換後，AI 將優先基於您在管理後台上傳的 PDF 文件內容進行問答，提供更具針對性的解答。</li>
                <li><b>快速提問：</b>下方提供了一些常見問題，點擊即可快速獲得解答，幫助您迅速上手。</li>
              </ul>
            </span>
          }
          themeColor="purple"
          className="mb-8"
        />
    );
};

export default ChatbotInfo;
