
import React from 'react';

/**
 * 此元件用於解析並顯示機器人的訊息內容。
 * 它會尋找特定格式的標題（例如【標題】）並為其套用特殊樣式，
 * 以提高訊息的可讀性。
 */
export const BotMessage = ({ content }: { content: string }) => {
  // 使用正則表達式來切分內容，同時保留標題標記
  const parts = content.split(/(\【[^】]+\】)/g).filter(Boolean);

  return (
    <div className="text-sm whitespace-pre-line">
      {parts.map((part, index) => {
        // 檢查是否為標題格式
        if (part.startsWith('【') && part.endsWith('】')) {
          return (
            // 將標題渲染為加粗的獨立區塊
            <span key={index} className="block font-semibold my-2">
              {part.substring(1, part.length - 1)}
            </span>
          );
        }
        // 渲染一般文字內容
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};
