import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { ActivitySidebar } from './ActivitySidebar';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatTabProps {
  chatMessages: ChatMessageType[];
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSendMessage: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  chatMessages,
  chatMessage,
  setChatMessage,
  onSendMessage
}) => {
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {chatMessages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          <QuickActions />
        </div>

        <ChatInput
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          onSendMessage={onSendMessage}
        />
      </div>

      <ActivitySidebar />
    </>
  );
};

