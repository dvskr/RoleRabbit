import { ChatMessage } from '../types';
import { createTimestamp } from '../utils/helpers';

interface UseAIChatProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
}

export function useAIChat({ 
  chatMessage, 
  setChatMessage, 
  chatMessages, 
  setChatMessages 
}: UseAIChatProps) {
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Add user message
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: chatMessage,
        timestamp: createTimestamp()
      };
      setChatMessages(prev => [...prev, userMsg]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          message: "I understand you'd like help with that. Let me work on it for you. This feature is currently in development - your request has been noted!",
          timestamp: createTimestamp()
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }, 1000);
      
      setChatMessage('');
    }
  };

  return {
    handleSendMessage
  };
}

