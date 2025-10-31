'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAIAgentsState, useAIChat } from './hooks';
import { 
  AgentHeader, 
  TabNavigation, 
  ChatTab, 
  ActiveTasksTab, 
  CapabilitiesTab, 
  HistoryTab 
} from './components';

export default function AIAgents() {
  const { theme } = useTheme();
  const colors = theme?.colors;

  // Safety check for theme
  if (!colors) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  try {
    const {
      activeTab,
      setActiveTab,
      isAgentEnabled,
      setIsAgentEnabled,
      activeTasks,
      capabilities,
      toggleCapability,
      historyTasks,
      chatMessages,
      setChatMessages,
      chatMessage,
      setChatMessage,
      activeTasksCount,
    } = useAIAgentsState();

    const { handleSendMessage } = useAIChat({
      chatMessage,
      setChatMessage,
      chatMessages,
      setChatMessages,
    });

    return (
      <div className="h-full flex flex-col" style={{ background: colors.background }}>
        <AgentHeader 
          isAgentEnabled={isAgentEnabled}
          setIsAgentEnabled={setIsAgentEnabled}
        />

        <TabNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeTasksCount={activeTasksCount}
        />

        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'chat' && (
            <ChatTab
              chatMessages={chatMessages}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'active-tasks' && (
            <ActiveTasksTab activeTasks={activeTasks} />
          )}

          {activeTab === 'capabilities' && (
            <CapabilitiesTab 
              capabilities={capabilities}
              onToggleCapability={toggleCapability}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab historyTasks={historyTasks} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Critical error in AIAgents:', error);
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading AI Auto-Apply</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

