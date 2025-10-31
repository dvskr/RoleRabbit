# Detailed Step-by-Step Refactoring Plans
## All High Priority Components (700-1000+ lines)

This document provides granular, phase-by-phase refactoring plans for each large component, ensuring zero UI/UX changes and functionality preservation.

---

# 1. AIAgents.tsx (~1,051 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup: `cp apps/web/src/components/AIAgents.tsx apps/web/src/components/AIAgents.tsx.backup`
- [ ] Read entire file and map structure
- [ ] Identify extraction candidates:
  - [ ] Tab navigation component (Chat, Active Tasks, Capabilities, History)
  - [ ] Agent toggle switch component
  - [ ] Chat interface (messages, input, quick actions)
  - [ ] Active tasks list and task cards
  - [ ] Capabilities grid with toggle switches
  - [ ] History timeline grouped by date
  - [ ] Mock data (activeTasks, capabilities, historyTasks, chatMessages)
  - [ ] State management (activeTab, isAgentEnabled, chat state)
  - [ ] Helper functions (groupedHistory logic)

### Create Test Checklist (Manual UI Tests)
- [ ] Toggle agent on/off - UI updates correctly
- [ ] Switch between all 4 tabs - correct content displays
- [ ] Chat: Send message, receive AI response
- [ ] Active Tasks: Progress bars animate, status displays
- [ ] Capabilities: Toggle each capability, state persists
- [ ] History: Tasks grouped by date correctly
- [ ] All icons and colors render correctly
- [ ] Responsive behavior on mobile/tablet

---

## Phase 2: Refactoring Steps (Incremental)

### Step 1: Extract Types and Interfaces

**Action:** Create `apps/web/src/components/AIAgents/types.ts`

**Content to extract:**
```typescript
export type TabType = 'chat' | 'active-tasks' | 'capabilities' | 'history';

export interface ActiveTask {
  id: string;
  title: string;
  company: string;
  role: string;
  description: string;
  progress: number;
  icon: React.ReactNode;
  started: string;
  status: 'in-progress' | 'completed';
}

export interface Capability {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export interface HistoryTask {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
  status: string;
  completed: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}
```

**Update main file:**
- Remove type definitions
- Add: `import { TabType, ActiveTask, Capability, HistoryTask, ChatMessage } from './types';`

**Verify:**
- [ ] TypeScript compiles: `npm run type-check` or `tsc --noEmit`
- [ ] No type errors in IDE
- [ ] Component still renders

---

### Step 2: Extract Constants

**Action:** Create `apps/web/src/components/AIAgents/constants/mockData.ts`

**Content to extract:**
- [ ] `activeTasks` mock data array
- [ ] `capabilities` mock data array
- [ ] `historyTasks` mock data array
- [ ] `chatMessages` initial mock data array

**File structure:**
```typescript
import { ActiveTask, Capability, HistoryTask, ChatMessage } from '../types';
import { FileText, Search, Briefcase, Mail, Calendar } from 'lucide-react';

export const MOCK_ACTIVE_TASKS: ActiveTask[] = [
  // ... all active tasks data
];

export const MOCK_CAPABILITIES: Capability[] = [
  // ... all capabilities data
];

export const MOCK_HISTORY_TASKS: HistoryTask[] = [
  // ... all history tasks data
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // ... initial chat message
];
```

**Update main file:**
- Remove mock data arrays
- Add: `import { MOCK_ACTIVE_TASKS, MOCK_CAPABILITIES, MOCK_HISTORY_TASKS, INITIAL_CHAT_MESSAGES } from './constants/mockData';`
- Update useState calls to use constants

**Verify:**
- [ ] Same data displays
- [ ] No runtime errors
- [ ] Component behavior unchanged

---

### Step 3: Extract Helper Functions

**Action:** Create `apps/web/src/components/AIAgents/utils/helpers.ts`

**Content to extract:**
```typescript
import { HistoryTask } from '../types';

export const groupHistoryByDate = (historyTasks: HistoryTask[]): Record<string, HistoryTask[]> => {
  return historyTasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, HistoryTask[]>);
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
};
```

**Update main file:**
- Remove `groupedHistory` inline reduce
- Add: `import { groupHistoryByDate, formatTimestamp } from './utils/helpers';`
- Replace inline logic with helper calls

**Verify:**
- [ ] History grouping works identically
- [ ] Timestamps format correctly
- [ ] No calculation differences

---

### Step 4: Extract Custom Hooks

**Action:** Create `apps/web/src/components/AIAgents/hooks/useAIAgentsState.ts`

**Content to extract:**
```typescript
import { useState } from 'react';
import { TabType, ActiveTask, Capability, HistoryTask, ChatMessage } from '../types';
import { MOCK_ACTIVE_TASKS, MOCK_CAPABILITIES, MOCK_HISTORY_TASKS, INITIAL_CHAT_MESSAGES } from '../constants/mockData';

export const useAIAgentsState = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isAgentEnabled, setIsAgentEnabled] = useState(true);
  const [activeTasks] = useState<ActiveTask[]>(MOCK_ACTIVE_TASKS);
  const [capabilities, setCapabilities] = useState<Capability[]>(MOCK_CAPABILITIES);
  const [historyTasks] = useState<HistoryTask[]>(MOCK_HISTORY_TASKS);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  const toggleCapability = (id: string) => {
    setCapabilities(prev =>
      prev.map(cap =>
        cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
      )
    );
  };

  const handleSendMessage = () => {
    // ... existing logic
  };

  return {
    activeTab,
    setActiveTab,
    isAgentEnabled,
    setIsAgentEnabled,
    activeTasks,
    capabilities,
    historyTasks,
    chatMessage,
    setChatMessage,
    chatMessages,
    setChatMessages,
    toggleCapability,
    handleSendMessage,
  };
};
```

**Update main file:**
- Remove all useState declarations and handlers
- Add: `import { useAIAgentsState } from './hooks/useAIAgentsState';`
- Replace with: `const agentState = useAIAgentsState();`
- Update all references (agentState.activeTab, etc.)

**Verify:**
- [ ] All state updates work
- [ ] Tab switching works
- [ ] Toggle agent works
- [ ] Chat sends messages
- [ ] Capabilities toggle correctly
- [ ] No state regressions

---

### Step 5: Extract Sub-components (One at a Time)

#### 5a. Extract AgentToggle Component

**Action:** Create `apps/web/src/components/AIAgents/components/AgentToggle.tsx`

**Content to extract:**
- Toggle switch JSX and logic
- Enable/disable label
- Settings button

**Props interface:**
```typescript
interface AgentToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  onSettings?: () => void;
  colors: any;
}
```

**Update main file:**
- Replace toggle section with `<AgentToggle ... />`

**Verify:**
- [ ] Toggle works correctly
- [ ] Styling matches exactly
- [ ] Settings button works (if exists)

---

#### 5b. Extract TabNavigation Component

**Action:** Create `apps/web/src/components/AIAgents/components/TabNavigation.tsx`

**Content to extract:**
- All 4 tab buttons
- Active tab indicator
- Tab icons

**Props interface:**
```typescript
interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  colors: any;
}
```

**Update main file:**
- Replace tab buttons section with `<TabNavigation ... />`

**Verify:**
- [ ] Tab switching works
- [ ] Active indicator shows correctly
- [ ] Colors match

---

#### 5c. Extract ChatMessage Component

**Action:** Create `apps/web/src/components/AIAgents/components/ChatMessage.tsx`

**Content to extract:**
- Single chat message bubble
- Avatar (user/AI)
- Message text
- Timestamp

**Props interface:**
```typescript
interface ChatMessageProps {
  message: ChatMessage;
  colors: any;
}
```

**Update main file:**
- Replace message map with `<ChatMessage message={msg} />`

**Verify:**
- [ ] Messages render correctly
- [ ] User vs AI styling correct
- [ ] Timestamps display

---

#### 5d. Extract ChatInput Component

**Action:** Create `apps/web/src/components/AIAgents/components/ChatInput.tsx`

**Content to extract:**
- Input field
- Send button
- Quick action buttons (Bulk Resume, etc.)

**Props interface:**
```typescript
interface ChatInputProps {
  message: string;
  onMessageChange: (msg: string) => void;
  onSend: () => void;
  colors: any;
}
```

**Update main file:**
- Replace input section with `<ChatInput ... />`

**Verify:**
- [ ] Input works
- [ ] Send button works
- [ ] Quick actions work

---

#### 5e. Extract ChatTab Component

**Action:** Create `apps/web/src/components/AIAgents/components/ChatTab.tsx`

**Content to extract:**
- Entire chat view (messages + input)
- Wrapper div and layout

**Props interface:**
```typescript
interface ChatTabProps {
  messages: ChatMessage[];
  currentMessage: string;
  onMessageChange: (msg: string) => void;
  onSend: () => void;
  colors: any;
}
```

**Update main file:**
- Replace entire chat tab JSX with `<ChatTab ... />`

**Verify:**
- [ ] Chat renders completely
- [ ] All functionality works
- [ ] Styling unchanged

---

#### 5f. Extract TaskCard Component

**Action:** Create `apps/web/src/components/AIAgents/components/TaskCard.tsx`

**Content to extract:**
- Single task card JSX
- Progress bar
- Task metadata

**Props interface:**
```typescript
interface TaskCardProps {
  task: ActiveTask;
  colors: any;
}
```

**Update main file:**
- Replace task map with `<TaskCard task={task} />`

**Verify:**
- [ ] Tasks render correctly
- [ ] Progress bars animate
- [ ] Status displays correctly

---

#### 5g. Extract ActiveTasksTab Component

**Action:** Create `apps/web/src/components/AIAgents/components/ActiveTasksTab.tsx`

**Content to extract:**
- Entire active tasks view
- Tasks list
- Empty state (if exists)

**Props interface:**
```typescript
interface ActiveTasksTabProps {
  tasks: ActiveTask[];
  colors: any;
}
```

**Update main file:**
- Replace active tasks tab JSX with `<ActiveTasksTab tasks={activeTasks} />`

**Verify:**
- [ ] Tasks list displays
- [ ] All task cards render
- [ ] Layout matches

---

#### 5h. Extract CapabilityCard Component

**Action:** Create `apps/web/src/components/AIAgents/components/CapabilityCard.tsx`

**Content to extract:**
- Single capability card
- Toggle switch
- Icon and description

**Props interface:**
```typescript
interface CapabilityCardProps {
  capability: Capability;
  onToggle: (id: string) => void;
  colors: any;
}
```

**Update main file:**
- Replace capability map with `<CapabilityCard capability={cap} onToggle={toggleCapability} />`

**Verify:**
- [ ] Cards render correctly
- [ ] Toggles work
- [ ] State updates

---

#### 5i. Extract CapabilitiesTab Component

**Action:** Create `apps/web/src/components/AIAgents/components/CapabilitiesTab.tsx`

**Content to extract:**
- Entire capabilities view
- Header text
- Capabilities grid

**Props interface:**
```typescript
interface CapabilitiesTabProps {
  capabilities: Capability[];
  onToggleCapability: (id: string) => void;
  colors: any;
}
```

**Update main file:**
- Replace capabilities tab JSX with `<CapabilitiesTab ... />`

**Verify:**
- [ ] Capabilities display
- [ ] All toggles work
- [ ] Layout correct

---

#### 5j. Extract HistoryCard Component

**Action:** Create `apps/web/src/components/AIAgents/components/HistoryCard.tsx`

**Content to extract:**
- Single history task card
- Icon, title, count, date

**Props interface:**
```typescript
interface HistoryCardProps {
  task: HistoryTask;
  colors: any;
}
```

**Update main file:**
- Replace history task map with `<HistoryCard task={task} />`

**Verify:**
- [ ] History cards render
- [ ] Data displays correctly

---

#### 5k. Extract HistoryTab Component

**Action:** Create `apps/web/src/components/AIAgents/components/HistoryTab.tsx`

**Content to extract:**
- Entire history view
- Grouped by date sections
- Date headers

**Props interface:**
```typescript
interface HistoryTabProps {
  historyTasks: HistoryTask[];
  colors: any;
}
```

**Update main file:**
- Replace history tab JSX with `<HistoryTab historyTasks={historyTasks} />`

**Verify:**
- [ ] History groups by date
- [ ] All dates display
- [ ] Tasks under correct dates

---

### Step 6: Create Main Container Component

**Action:** Update `apps/web/src/components/AIAgents/index.tsx`

**Final structure:**
```typescript
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAIAgentsState } from './hooks/useAIAgentsState';
import AgentToggle from './components/AgentToggle';
import TabNavigation from './components/TabNavigation';
import ChatTab from './components/ChatTab';
import ActiveTasksTab from './components/ActiveTasksTab';
import CapabilitiesTab from './components/CapabilitiesTab';
import HistoryTab from './components/HistoryTab';

export default function AIAgents() {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const agentState = useAIAgentsState();

  if (!colors) {
    return <div className="h-full flex items-center justify-center bg-white">
      <p className="text-gray-600">Loading...</p>
    </div>;
  }

  return (
    <div className="h-full flex flex-col" style={{ background: colors.background }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
        {/* Header content */}
        <AgentToggle
          isEnabled={agentState.isAgentEnabled}
          onToggle={() => agentState.setIsAgentEnabled(!agentState.isAgentEnabled)}
          colors={colors}
        />
      </div>

      {/* Tabs */}
      <TabNavigation
        activeTab={agentState.activeTab}
        onTabChange={agentState.setActiveTab}
        colors={colors}
      />

      {/* Content */}
      {agentState.activeTab === 'chat' && (
        <ChatTab
          messages={agentState.chatMessages}
          currentMessage={agentState.chatMessage}
          onMessageChange={agentState.setChatMessage}
          onSend={agentState.handleSendMessage}
          colors={colors}
        />
      )}
      {agentState.activeTab === 'active-tasks' && (
        <ActiveTasksTab tasks={agentState.activeTasks} colors={colors} />
      )}
      {agentState.activeTab === 'capabilities' && (
        <CapabilitiesTab
          capabilities={agentState.capabilities}
          onToggleCapability={agentState.toggleCapability}
          colors={colors}
        />
      )}
      {agentState.activeTab === 'history' && (
        <HistoryTab historyTasks={agentState.historyTasks} colors={colors} />
      )}
    </div>
  );
}
```

**Verify:**
- [ ] File reduced to ~100-150 lines
- [ ] All functionality works
- [ ] No missing imports

---

## Phase 3: Post-refactoring Verification

- [ ] TypeScript: `npm run type-check` passes
- [ ] Linter: Address critical warnings
- [ ] Runtime: Test all features manually
  - [ ] Tab switching
  - [ ] Agent toggle
  - [ ] Chat functionality
  - [ ] Tasks display
  - [ ] Capabilities toggle
  - [ ] History grouping
- [ ] UI comparison: Side-by-side visual check
- [ ] Performance: No noticeable degradation
- [ ] Code review: All extracted files are clean

---

## Quality Assurance Checklist (After Each Step)

### Functionality
- [ ] All features work as before
- [ ] No console errors
- [ ] No broken imports
- [ ] State management intact
- [ ] Event handlers fire correctly

### UI/UX
- [ ] Visual appearance unchanged
- [ ] Styling matches (colors, spacing, fonts)
- [ ] Animations/transitions work
- [ ] Responsive behavior unchanged
- [ ] Loading states unchanged
- [ ] Error states unchanged

### Code Quality
- [ ] TypeScript compiles without errors
- [ ] No unused imports
- [ ] Consistent naming
- [ ] Proper prop types
- [ ] Components are testable

---

# 2. ResumeEditor.tsx (~1,089 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup: `cp apps/web/src/components/features/ResumeEditor.tsx apps/web/src/components/features/ResumeEditor.tsx.backup`
- [ ] Read entire file and map structure
- [ ] Identify extraction candidates:
  - [ ] Left sidebar components:
    - File name section
    - Templates section (uses MultiResumeManager)
    - Sections list (with visibility toggles, move up/down)
    - Formatting section (Font Family, Font Size, Line Spacing, Section Spacing, Page Margins, Heading Weight, Bullet Style)
  - [ ] Main editor area:
    - Name input
    - Contact fields grid
    - Custom fields
    - Sections renderer
  - [ ] Helper functions:
    - `getFieldIcon()`
    - Section rendering logic
  - [ ] Constants:
    - Sidebar width calculations
    - Contact field icons mapping

### Create Test Checklist
- [ ] Sidebar collapse/expand works
- [ ] File name input works
- [ ] Templates section displays
- [ ] Sections list: visibility toggle, move up/down
- [ ] All formatting controls work
- [ ] Main editor: name input, contact fields, custom fields
- [ ] All sections render correctly
- [ ] Add custom field works

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types

**Action:** Create `apps/web/src/components/features/ResumeEditor/types.ts`

**Content to extract:**
```typescript
export interface ResumeEditorProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: any[];
  resumeData: any;
  setResumeData: (data: any) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  // ... all other props
}

export interface CustomField {
  id: string;
  name: string;
  icon?: string;
  value?: string;
}
```

**Verify:**
- [ ] TypeScript compiles
- [ ] No type errors

---

### Step 2: Extract Constants

**Action:** Create `apps/web/src/components/features/ResumeEditor/constants/index.ts`

**Content to extract:**
- [ ] Contact field icons mapping
- [ ] Font family options
- [ ] Font size options
- [ ] Line spacing options
- [ ] Section spacing options
- [ ] Page margin options
- [ ] Heading weight options
- [ ] Bullet style options

**Verify:**
- [ ] Same values used
- [ ] No runtime errors

---

### Step 3: Extract Helper Functions

**Action:** Create `apps/web/src/components/features/ResumeEditor/utils/helpers.ts`

**Content to extract:**
- [ ] `getFieldIcon(iconType: string)` function
- [ ] Any other pure utility functions

**Verify:**
- [ ] Icons render correctly
- [ ] Functions work identically

---

### Step 4: Extract Custom Hooks

**Action:** Create `apps/web/src/components/features/ResumeEditor/hooks/useResumeEditorSections.ts`

**Content to extract:**
- [ ] `renderedSections` useMemo logic
- [ ] Section visibility logic

**Verify:**
- [ ] Sections render correctly
- [ ] Visibility works

---

### Step 5: Extract Sub-components (In Order)

#### 5a. Extract FileNameSection Component

**Action:** Create `apps/web/src/components/features/ResumeEditor/components/Sidebar/FileNameSection.tsx`

**Content:** File name input, AI generate button, helper text

**Props:**
```typescript
interface FileNameSectionProps {
  fileName: string;
  onFileNameChange: (name: string) => void;
  onGenerateSmartName: () => string;
  colors: any;
}
```

**Verify:**
- [ ] File name input works
- [ ] Generate button works
- [ ] Styling matches

---

#### 5b. Extract TemplatesSection Component

**Action:** Create `apps/web/src/components/features/ResumeEditor/components/Sidebar/TemplatesSection.tsx`

**Content:** Wrapper around MultiResumeManager

**Props:**
```typescript
interface TemplatesSectionProps {
  selectedTemplateId?: string | null;
  onTemplateApply?: (templateId: string) => void;
  addedTemplates?: string[];
  onRemoveTemplate?: (templateId: string) => void;
  onAddTemplates?: (templateIds: string[]) => void;
  onNavigateToTemplates?: () => void;
  colors: any;
}
```

**Verify:**
- [ ] Templates display
- [ ] Template selection works

---

#### 5c. Extract SectionsList Component

**Action:** Create `apps/web/src/components/features/ResumeEditor/components/Sidebar/SectionsList.tsx`

**Content:** Sections list with visibility toggles, move buttons

**Props:**
```typescript
interface SectionsListProps {
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: any[];
  onToggleSection: (section: string) => void;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onShowAddSectionModal: () => void;
  colors: any;
}
```

**Verify:**
- [ ] Sections list displays
- [ ] Visibility toggle works
- [ ] Move up/down works
- [ ] Add section button works

---

#### 5d. Extract Formatting Controls (One by One)

**FormattingSection.tsx** (Container):
- Wraps all formatting controls
- Handles layout

**FontFamilyControl.tsx:**
- Font family select dropdown

**FontSizeControl.tsx:**
- Font size button grid (10pt, 11pt, 12pt with ATS badges)

**LineSpacingControl.tsx:**
- Line spacing select dropdown

**SectionSpacingControl.tsx:**
- Section spacing button group (Tight, Medium, Loose)

**PageMarginsControl.tsx:**
- Page margins button group (Narrow, Normal, Wide)

**HeadingWeightControl.tsx:**
- Heading weight select dropdown

**BulletStyleControl.tsx:**
- Bullet style button grid (disc, circle, square, arrow, check, dash)

**Verify after each:**
- [ ] Control renders correctly
- [ ] State updates work
- [ ] Styling matches

---

#### 5e. Extract ContactFields Component

**Action:** Create `apps/web/src/components/features/ResumeEditor/components/MainEditorArea/ContactFields.tsx`

**Content:** Contact fields grid, custom fields, add field button

**Props:**
```typescript
interface ContactFieldsProps {
  resumeData: any;
  onResumeDataChange: (data: any) => void;
  customFields: CustomField[];
  onCustomFieldsChange: (fields: CustomField[]) => void;
  onShowAddFieldModal: () => void;
  colors: any;
}
```

**Verify:**
- [ ] Contact fields display
- [ ] Custom fields display
- [ ] Add field button works
- [ ] Input changes update state

---

#### 5f. Extract NameInput Component

**Action:** Create `apps/web/src/components/features/ResumeEditor/components/MainEditorArea/NameInput.tsx`

**Content:** Name input field

**Props:**
```typescript
interface NameInputProps {
  name: string;
  onNameChange: (name: string) => void;
  colors: any;
}
```

**Verify:**
- [ ] Name input works
- [ ] Styling matches

---

#### 5g. Extract SectionsRenderer Component

**Action:** Create `apps/web/src/components/features/ResumeEditor/components/MainEditorArea/SectionsRenderer.tsx`

**Content:** Renders all sections using renderSection prop

**Props:**
```typescript
interface SectionsRendererProps {
  sectionOrder: string[];
  renderSection: (section: string) => React.ReactNode;
}
```

**Verify:**
- [ ] All sections render
- [ ] Order correct

---

### Step 6: Create Sidebar Container

**Action:** Create `apps/web/src/components/features/ResumeEditor/components/Sidebar/SidebarContainer.tsx`

**Content:** Combines all sidebar sections

**Props:** All sidebar-related props

**Verify:**
- [ ] Sidebar displays all sections
- [ ] Collapse works
- [ ] Layout matches

---

### Step 7: Create Main Container

**Action:** Update `apps/web/src/components/features/ResumeEditor/index.tsx`

**Final structure:** ~150 lines, orchestrates SidebarContainer and MainEditorArea

**Verify:**
- [ ] File reduced significantly
- [ ] All functionality works
- [ ] No regressions

---

## Phase 3: Post-refactoring Verification

- [ ] TypeScript compiles
- [ ] All features tested manually
- [ ] UI matches exactly
- [ ] Performance good
- [ ] Code review complete

---

# 3. DashboardFigma.tsx (~996 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Metrics section (4 metric cards)
  - [ ] Activities section (filter, list of activities)
  - [ ] Todos section (filter, list, add todo form)
  - [ ] Quick actions section
  - [ ] Stats bar
- [ ] Identify:
  - [ ] Mock data arrays (metrics, activities, todos)
  - [ ] State management (filters, todos state)
  - [ ] Event handlers (add todo, delete todo, filter changes)

### Create Test Checklist
- [ ] Metrics display correctly
- [ ] Activities filter works
- [ ] Activities list displays
- [ ] Todos filter works
- [ ] Todos list displays
- [ ] Add todo works
- [ ] Delete todo works
- [ ] Quick actions work

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types

**Action:** Create `apps/web/src/components/DashboardFigma/types.ts`

**Content:**
```typescript
export interface Todo {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  priority: 'low' | 'high' | 'urgent';
  completed: boolean;
  date?: string;
}

export interface Activity {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  status: 'pending' | 'completed' | 'rejected';
  icon: any;
}

export interface Metric {
  label: string;
  value: string;
  icon: any;
  gradient: string;
}
```

**Verify:**
- [ ] TypeScript compiles

---

### Step 2: Extract Constants

**Action:** Create `apps/web/src/components/DashboardFigma/constants/mockData.ts`

**Content:**
- [ ] `metrics` array
- [ ] `activities` array
- [ ] `defaultTodos` array

**Verify:**
- [ ] Data displays correctly

---

### Step 3: Extract Hooks

**Action:** Create hooks:

**useDashboardMetrics.ts:**
- Metrics data (can stay as constant, or if dynamic, manage here)

**useTodos.ts:**
- All todo state management
- Add, delete, toggle, filter logic

**useActivities.ts:**
- Activities filter state
- Activities data

**Verify:**
- [ ] State works correctly

---

### Step 4: Extract Components (One at a Time)

#### 4a. MetricCard Component
- Single metric card with icon, value, label

#### 4b. MetricsSection Component
- Grid of 4 metric cards

#### 4c. ActivityCard Component
- Single activity card

#### 4d. ActivityFilter Component
- Filter dropdown for activities

#### 4e. ActivitiesSection Component
- Entire activities view

#### 4f. TodoCard Component
- Single todo card with priority, completion, actions

#### 4g. TodoFilter Component
- Filter dropdown for todos

#### 4h. AddTodoForm Component
- Form to add new todo

#### 4i. TodosSection Component
- Entire todos view

#### 4j. QuickActionCard Component
- Single quick action button

#### 4k. QuickActions Component
- Grid of quick actions

#### 4l. StatsBar Component
- Bottom stats bar

**Verify after each:**
- [ ] Component renders
- [ ] Functionality works
- [ ] Styling matches

---

### Step 5: Create Main Container

**Final structure:** ~120 lines, orchestrates all sections

**Verify:**
- [ ] All sections render
- [ ] Interactions work
- [ ] No regressions

---

# 4. CloudStorage.tsx (~873 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Folder sidebar (folder tree)
  - [ ] File toolbar (view mode, search, filters)
  - [ ] File grid view
  - [ ] File list view
  - [ ] File operations (upload, download, share, delete)
  - [ ] Modals (upload, share, delete confirm)

### Create Test Checklist
- [ ] Folder sidebar displays
- [ ] Folder selection works
- [ ] View mode toggle works
- [ ] Search works
- [ ] Filters work
- [ ] File grid displays
- [ ] File list displays
- [ ] File operations work
- [ ] Modals open/close

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] File type interfaces
- [ ] Folder type interfaces
- [ ] Filter types

### Step 2: Extract Constants
- [ ] View mode options
- [ ] File type mappings
- [ ] Default filters

### Step 3: Extract Hooks
- [ ] `useFileOperations.ts` - CRUD operations
- [ ] `useFileFilters.ts` - Filtering logic
- [ ] `useFileUpload.ts` - Upload logic

### Step 4: Extract Components

#### 4a. FolderSidebar Component
- Folder tree navigation

#### 4b. FolderItem Component
- Single folder in sidebar

#### 4c. FileToolbar Component
- View mode toggle, search, filters

#### 4d. ViewModeToggle Component
- Grid/List view toggle

#### 4e. SearchAndFilter Component
- Search input and filter buttons

#### 4f. FileGrid Component
- Grid view container (uses FileCard)

#### 4g. FileList Component
- List view container (uses FileCard)

**Note:** FileCard.tsx already exists, verify it's properly used

#### 4h. UploadModal Component
- File upload modal

#### 4i. ShareModal Component
- File sharing modal

#### 4j. DeleteConfirmModal Component
- Delete confirmation modal

**Verify after each:**
- [ ] Component works
- [ ] Styling matches

---

### Step 5: Create Main Container
- [ ] Orchestrates FolderSidebar, FileToolbar, FileGrid/FileList
- [ ] Manages modals
- [ ] ~120 lines

**Verify:**
- [ ] All functionality works
- [ ] No regressions

---

# 5. AIPanel.tsx (~879 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Mode selector (Analyze, Tailor, Generate, Chat)
  - [ ] Analysis mode UI
  - [ ] Tailor mode UI
  - [ ] Generate mode UI
  - [ ] Chat mode UI
  - [ ] Panel header with close button

### Create Test Checklist
- [ ] Mode switching works
- [ ] Each mode displays correctly
- [ ] Analysis: job description input, match score, keywords
- [ ] Tailor: tone/length selectors work
- [ ] Generate: prompt input works
- [ ] Chat: messages send/receive

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] AIPanelProps interface
- [ ] AI mode types
- [ ] Chat message types

### Step 2: Extract Constants
- [ ] AI mode options
- [ ] Tone options
- [ ] Length options
- [ ] Model options

### Step 3: Extract Hooks
- [ ] `useAIPanelState.ts` - All state management
- [ ] `useAIAnalysis.ts` - Analysis logic
- [ ] `useAIConversation.ts` - Chat logic

### Step 4: Extract Components

#### 4a. PanelHeader Component
- Header with close button

#### 4b. ModeSelector Component
- Mode tabs/buttons

#### 4c. AnalysisMode Component
- Job description input
- Match score display
- Keywords display (matched/missing)
- Recommendations list

#### 4d. TailorMode Component
- Tone selector
- Length selector
- Apply button

#### 4e. GenerateMode Component
- Prompt input
- Generate button
- Options (if any)

#### 4f. ChatMode Component
- Chat messages list
- Chat input
- Send button

#### 4g. Sub-components for AnalysisMode:
- JobDescriptionInput
- MatchScoreDisplay
- KeywordsDisplay
- RecommendationsList

**Verify after each:**
- [ ] Component works
- [ ] State updates correctly

---

### Step 5: Create Main Container
- [ ] Orchestrates mode selector and mode components
- [ ] ~100 lines

**Verify:**
- [ ] All modes work
- [ ] No regressions

---

# 6. SecurityTab.tsx (~818 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Password change section
  - [ ] Two-factor authentication section
  - [ ] Active sessions section
  - [ ] API keys section
  - [ ] Security alerts section

### Create Test Checklist
- [ ] Password change form works
- [ ] 2FA setup works
- [ ] Sessions list displays
- [ ] Session revoke works
- [ ] API keys list displays
- [ ] API key create/delete works

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] Security settings types
- [ ] Session types
- [ ] API key types

### Step 2: Extract Constants
- [ ] Security option labels
- [ ] 2FA provider options

### Step 3: Extract Hooks
- [ ] `useSecurityState.ts` - All security state
- [ ] `useSecurityActions.ts` - All security actions

### Step 4: Extract Components

#### 4a. PasswordSection Component
- Change password form
- Password strength indicator

#### 4b. TwoFactorSection Component
- 2FA setup flow
- QR code display
- Enable/disable toggle

#### 4c. SessionsSection Component
- Active sessions list
- Session cards with revoke

#### 4d. ApiKeysSection Component
- API keys list
- Create/delete functionality

#### 4e. SecurityAlerts Component
- Security alerts/notifications

**Verify after each:**
- [ ] Section works independently
- [ ] Forms submit correctly

---

### Step 5: Create Main Container
- [ ] Orchestrates all security sections
- [ ] ~100 lines

**Verify:**
- [ ] All sections work
- [ ] No regressions

---

# 7. BillingTab.tsx (~800 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Plan selector (current plan, upgrade options)
  - [ ] Payment methods section
  - [ ] Invoices list
  - [ ] Usage statistics
  - [ ] Billing history

### Create Test Checklist
- [ ] Plan selection works
- [ ] Payment methods display
- [ ] Add payment method works
- [ ] Invoices list displays
- [ ] Download invoice works
- [ ] Usage stats display
- [ ] Billing history displays

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] Plan types
- [ ] Payment method types
- [ ] Invoice types
- [ ] Usage stat types

### Step 2: Extract Constants
- [ ] Plan options
- [ ] Payment method types
- [ ] Invoice statuses

### Step 3: Extract Hooks
- [ ] `useBillingState.ts`
- [ ] `useBillingActions.ts`

### Step 4: Extract Components

#### 4a. PlanSelector Component
- Current plan display
- Plan cards for upgrade

#### 4b. PaymentMethods Component
- Payment methods list
- Add payment method form

#### 4c. InvoicesList Component
- Invoices table/list
- Download buttons

#### 4d. UsageStats Component
- Usage charts/graphs
- Usage metrics

#### 4e. BillingHistory Component
- Billing history table

**Verify after each:**
- [ ] Component works
- [ ] Data displays correctly

---

### Step 5: Create Main Container
- [ ] Orchestrates billing sections
- [ ] ~100 lines

**Verify:**
- [ ] All billing features work
- [ ] No regressions

---

# 8. AIPortfolioBuilder.tsx (~786 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Wizard steps (Personal Info, Content, Design, Preview)
  - [ ] Step navigation
  - [ ] Each step's form/UI
  - [ ] Preview panel

### Create Test Checklist
- [ ] Step navigation works
- [ ] Each step form works
- [ ] Step validation works
- [ ] Preview updates correctly
- [ ] Back/Next buttons work

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] Wizard step types
- [ ] Portfolio config types
- [ ] Section types

### Step 2: Extract Constants
- [ ] Step definitions
- [ ] Default sections
- [ ] Theme options

### Step 3: Extract Hooks
- [ ] `usePortfolioBuilderState.ts` - All wizard state
- [ ] `usePortfolioBuilderWizard.ts` - Step navigation logic

### Step 4: Extract Components

#### 4a. WizardSteps Component
- Step indicator/navigation

#### 4b. Step1PersonalInfo Component
- Personal info form

#### 4c. Step2Content Component
- Content/sections editor

#### 4d. Step3Design Component
- Theme/style selector

#### 4e. Step4Preview Component
- Preview panel

#### 4f. StepNavigation Component
- Back/Next buttons

**Verify after each:**
- [ ] Step works independently
- [ ] Navigation correct

---

### Step 5: Create Main Container
- [ ] Orchestrates wizard steps
- [ ] ~120 lines

**Verify:**
- [ ] All steps work
- [ ] Wizard flow complete
- [ ] No regressions

---

# 9. useCloudStorage.ts (~705 lines) - Hook

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] File CRUD operations
  - [ ] Upload logic
  - [ ] Filter logic
  - [ ] Sharing logic
  - [ ] State management

### Create Test Checklist
- [ ] Files load correctly
- [ ] Upload works
- [ ] Delete works
- [ ] Share works
- [ ] Filters work
- [ ] Search works

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] File types
- [ ] Hook return types
- [ ] Operation types

### Step 2: Split into Multiple Hooks

#### 2a. useCloudStorage.ts (Main)
- Core state (files, folders, loading)
- Basic file operations

#### 2b. useFileOperations.ts
- CRUD operations (create, read, update, delete)
- File actions handlers

#### 2c. useFileUpload.ts
- Upload logic
- Upload progress
- Upload handlers

#### 2d. useFileFilters.ts
- Filter state
- Filter logic
- Search logic

#### 2e. useFileSharing.ts
- Sharing logic
- Share with user
- Public/private toggle

### Step 3: Extract Utilities

**Action:** Create `apps/web/src/hooks/cloudStorage/utils/helpers.ts`

**Content:**
- [ ] File type detection
- [ ] File size formatting
- [ ] File sorting logic
- [ ] File filtering logic

**Verify:**
- [ ] Each hook works independently
- [ ] All functionality preserved

---

### Step 4: Create Barrel Export

**Action:** Create `apps/web/src/hooks/cloudStorage/index.ts`

**Content:**
```typescript
export { useCloudStorage } from './useCloudStorage';
export { useFileOperations } from './useFileOperations';
export { useFileUpload } from './useFileUpload';
export { useFileFilters } from './useFileFilters';
export { useFileSharing } from './useFileSharing';
```

**Update imports:**
- [ ] Update CloudStorage.tsx to use new hooks
- [ ] Update any other files using the hook

**Verify:**
- [ ] All hook functionality works
- [ ] No breaking changes
- [ ] Imports updated correctly

---

# 10. EmailComposerAI.tsx (~727 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Email header (To, From, Subject, CC, BCC)
  - [ ] Email body editor
  - [ ] Email templates
  - [ ] Attachments list
  - [ ] AI panel
  - [ ] Email actions (Send, Save, etc.)

### Create Test Checklist
- [ ] Email header fields work
- [ ] Body editor works
- [ ] Templates load/apply
- [ ] Attachments add/remove
- [ ] AI suggestions work
- [ ] Send email works

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] Email type
- [ ] Attachment type
- [ ] Template type

### Step 2: Extract Constants
- [ ] Email template options
- [ ] AI prompt templates

### Step 3: Extract Hooks
- [ ] `useEmailComposerState.ts` - All email state
- [ ] `useEmailAI.ts` - AI logic

### Step 4: Extract Components

#### 4a. EmailHeader Component
- To, From, Subject, CC, BCC fields

#### 4b. EmailBody Component
- Rich text editor
- Formatting toolbar

#### 4c. EmailTemplates Component
- Template selector
- Template cards

#### 4d. AttachmentsList Component
- Attachments display
- Add/remove buttons

#### 4e. AIPanel Component
- AI suggestions
- AI prompts

#### 4f. EmailActions Component
- Send, Save, Cancel buttons

**Verify after each:**
- [ ] Component works
- [ ] Data flows correctly

---

### Step 5: Create Main Container
- [ ] Orchestrates all email sections
- [ ] ~120 lines

**Verify:**
- [ ] All email functionality works
- [ ] No regressions

---

# 11. CredentialManager.tsx (~694 lines)

## Phase 1: Pre-refactoring Setup

### Backup & Analysis
- [ ] Backup file
- [ ] Map structure:
  - [ ] Credentials list
  - [ ] Credential cards
  - [ ] Add credential form
  - [ ] Edit credential form
  - [ ] Search/filter
  - [ ] Categories

### Create Test Checklist
- [ ] Credentials list displays
- [ ] Search works
- [ ] Filter by category works
- [ ] Add credential works
- [ ] Edit credential works
- [ ] Delete credential works
- [ ] Password generator works

---

## Phase 2: Refactoring Steps

### Step 1: Extract Types
- [ ] Credential type
- [ ] Category type

### Step 2: Extract Constants
- [ ] Credential categories
- [ ] Default fields

### Step 3: Extract Hooks
- [ ] `useCredentialsState.ts` - All credential state
- [ ] `useCredentialsActions.ts` - CRUD operations

### Step 4: Extract Components

#### 4a. CredentialsList Component
- List/grid of credentials
- Empty state

#### 4b. CredentialCard Component
- Single credential card
- Edit/delete actions

#### 4c. CredentialForm Component
- Add/edit form
- All credential fields

#### 4d. PasswordGenerator Component
- Password generator UI
- Options (length, complexity)

#### 4e. CredentialSearch Component
- Search input
- Category filter

**Verify after each:**
- [ ] Component works
- [ ] Forms submit correctly

---

### Step 5: Create Main Container
- [ ] Orchestrates credential sections
- [ ] ~100 lines

**Verify:**
- [ ] All credential features work
- [ ] No regressions

---

# Universal Refactoring Principles

## 1. One Change at a Time
- Extract one component/hook/type at a time
- Test after each extraction
- Don't combine multiple extractions in one step

## 2. Test After Each Extraction
- Run the app
- Test the extracted feature
- Verify visually
- Check console for errors

## 3. Preserve Exact Behavior
- Keep all props identical
- Keep all styling identical
- Keep all logic identical
- Don't optimize yet

## 4. Keep Props Minimal and Clear
- Pass only what's needed
- Use descriptive prop names
- Group related props in objects if many

## 5. Document Complex Logic
- Add comments for complex calculations
- Document prop purposes
- Note any assumptions

## 6. No Premature Optimization
- Focus on structure, not performance
- Don't memoize unless needed
- Don't split hooks unnecessarily

---

# Rollback Plan

If something breaks:

1. **Revert the last change**
   - Git: `git checkout apps/web/src/components/[Component]/[file]`
   - Or restore from backup

2. **Identify the issue**
   - Check console errors
   - Check TypeScript errors
   - Verify imports
   - Check prop passing

3. **Fix before continuing**
   - Fix the issue in the extracted file
   - Or fix how it's being used
   - Test the fix

4. **Test before moving on**
   - Verify everything works
   - Don't proceed until fixed

---

# Final Verification Checklist

After completing all refactoring for a component:

## Code Quality
- [ ] Main file reduced to < 200 lines
- [ ] All components properly structured
- [ ] No duplicate code
- [ ] Consistent naming conventions
- [ ] Proper TypeScript types throughout

## Functionality
- [ ] All features work identically
- [ ] No console errors
- [ ] No runtime errors
- [ ] State management works
- [ ] Event handlers work
- [ ] Forms submit correctly
- [ ] Modals open/close correctly

## UI/UX
- [ ] Visual appearance identical
- [ ] All styling matches
- [ ] Colors match
- [ ] Spacing matches
- [ ] Fonts match
- [ ] Animations work
- [ ] Responsive behavior unchanged
- [ ] Loading states work
- [ ] Error states work

## Performance
- [ ] No noticeable slowdown
- [ ] Bundle size reasonable
- [ ] No unnecessary re-renders

## Documentation
- [ ] Component structure documented
- [ ] Props documented (JSDoc comments)
- [ ] Complex logic commented

---

# Estimated Timeline

| Component | Estimated Time | Priority |
|-----------|---------------|----------|
| ResumeEditor.tsx | 4-5 days | 1 |
| AIAgents.tsx | 3-4 days | 2 |
| DashboardFigma.tsx | 3-4 days | 3 |
| AIPanel.tsx | 3-4 days | 4 |
| CloudStorage.tsx | 2-3 days | 5 |
| useCloudStorage.ts | 2-3 days | 6 |
| SecurityTab.tsx | 2-3 days | 7 |
| BillingTab.tsx | 2-3 days | 8 |
| AIPortfolioBuilder.tsx | 3-4 days | 9 |
| EmailComposerAI.tsx | 3-4 days | 10 |
| CredentialManager.tsx | 2-3 days | 11 |

**Total Estimated Time: 6-8 weeks**

---

# Notes

- Start with one component at a time
- Complete each component fully before moving to next
- Maintain test checklist throughout
- Document any deviations from plan
- Keep backups of all original files
- Regular commits after each successful step

