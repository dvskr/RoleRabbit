# State Persistence & Auto-save Guide
**Section 1.10: State Persistence & Auto-save**

This document outlines the state persistence and auto-save features implemented in RoleRabbit to ensure users never lose their work.

## Table of Contents
1. [Auto-save](#auto-save)
2. [localStorage Fallback](#localstorage-fallback)
3. [Unsaved Changes Warning](#unsaved-changes-warning)
4. [Save Status Indicator](#save-status-indicator)
5. [Optimistic Updates](#optimistic-updates)
6. [Conflict Detection](#conflict-detection)
7. [Complete Examples](#complete-examples)

---

## Auto-save

**Requirement #1**: Auto-save functionality saves portfolio draft to backend every 30 seconds if changes detected.

### Implementation

```tsx
import { useAutoSave } from '@/hooks/useStatePersistence';

function PortfolioEditor() {
  const [portfolioData, setPortfolioData] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  const { saveStatus, lastSaved, triggerSave, isSaving } = useAutoSave(
    portfolioData,
    async (data) => {
      // Save to backend
      await api.savePortfolio(data);
    },
    {
      interval: 30000, // 30 seconds
      enabled: hasChanges, // Only auto-save if there are changes
      onSaveSuccess: () => {
        console.log('Auto-save successful');
        setHasChanges(false);
      },
      onSaveError: (error) => {
        console.error('Auto-save failed:', error);
      },
    }
  );

  return (
    <div>
      {/* Your editor UI */}
      <p>Status: {saveStatus}</p>
      {lastSaved && <p>Last saved: {new Date(lastSaved).toLocaleString()}</p>}
      <button onClick={triggerSave} disabled={isSaving}>
        Save Now
      </button>
    </div>
  );
}
```

### Features

- **Automatic saving**: Saves every 30 seconds (configurable)
- **Change detection**: Only saves if data has changed
- **Manual trigger**: `triggerSave()` for manual saves
- **Status tracking**: `'idle' | 'saving' | 'saved' | 'error'`
- **Callbacks**: Success/error handlers

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `interval` | `number` | `30000` | Auto-save interval in milliseconds |
| `enabled` | `boolean` | `true` | Enable/disable auto-save |
| `onSaveSuccess` | `() => void` | - | Callback on successful save |
| `onSaveError` | `(error: Error) => void` | - | Callback on save error |

---

## localStorage Fallback

**Requirement #2**: localStorage fallback for form data if user loses connection, restore on reconnect.

### Implementation

```tsx
import { useLocalStorage, useOnlineStatus } from '@/hooks/useStatePersistence';

function PortfolioForm() {
  // Automatically persists to localStorage
  const [formData, setFormData, clearFormData] = useLocalStorage(
    'portfolio-form-draft',
    initialFormData
  );

  const { isOnline, wasOffline } = useOnlineStatus();

  // Sync when coming back online
  useEffect(() => {
    if (wasOffline && formData) {
      syncToServer(formData);
    }
  }, [wasOffline]);

  return (
    <div>
      {!isOnline && (
        <div className="offline-banner">
          You're offline. Changes are saved locally and will sync when you reconnect.
        </div>
      )}

      <input
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
      />

      <button onClick={clearFormData}>Clear Draft</button>
    </div>
  );
}
```

### Features

- **Automatic persistence**: All changes saved to localStorage
- **Offline support**: Works without internet connection
- **Auto-sync**: Syncs to server when connection restored
- **Storage management**: Clear old drafts, check storage usage

### Utility Functions

```tsx
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  clearLocalStorageByPrefix,
  getLocalStorageUsage,
} from '@/utils/statePersistence';

// Save data
saveToLocalStorage('my-key', { name: 'John' }, 'v1.0');

// Load data with max age (1 hour)
const data = loadFromLocalStorage('my-key', 60 * 60 * 1000);

// Remove specific key
removeFromLocalStorage('my-key');

// Clear all keys with prefix
clearLocalStorageByPrefix('portfolio-');

// Check storage usage
const { used, total } = getLocalStorageUsage();
console.log(`Using ${used} of ${total} bytes`);
```

---

## Unsaved Changes Warning

**Requirement #3**: Show "Unsaved changes" warning if user tries to close tab/navigate away.

### Implementation

```tsx
import { useUnsavedChangesWarning } from '@/hooks/useStatePersistence';

function Editor() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Automatically shows browser warning on tab close/navigation
  useUnsavedChangesWarning(hasUnsavedChanges);

  return (
    <div>
      {/* Your editor */}
    </div>
  );
}
```

### Behavior

When user tries to:
- Close the browser tab
- Navigate to another page
- Refresh the page

Browser shows warning: **"Leave site? Changes you made may not be saved."**

### Best Practices

```tsx
// Track changes properly
const [originalData, setOriginalData] = useState(initialData);
const [currentData, setCurrentData] = useState(initialData);

const hasUnsavedChanges = !deepEqual(originalData, currentData);

// Clear warning after save
const handleSave = async () => {
  await saveData(currentData);
  setOriginalData(currentData); // Update baseline
  // hasUnsavedChanges is now false
};
```

---

## Save Status Indicator

**Requirement #4**: "Last saved at [time]" indicator in UI.

### Implementation

```tsx
import { SaveStatusIndicator, SaveStatusBadge } from '@/components/statePersistence/SaveStatusIndicator';
import { useLastSavedIndicator } from '@/hooks/useStatePersistence';

function EditorHeader() {
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  return (
    <header className="editor-header">
      {/* Full indicator */}
      <SaveStatusIndicator
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        isOnline={isOnline}
      />

      {/* Compact badge */}
      <SaveStatusBadge
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        isOnline={isOnline}
      />
    </header>
  );
}
```

### Display States

| State | Icon | Message | Color |
|-------|------|---------|-------|
| Saving | Spinner | "Saving..." | Blue |
| Saved | Check | "Saved 2 minutes ago" | Green |
| Unsaved | Clock | "Unsaved changes" | Orange |
| Error | Alert | "Save failed" | Red |
| Offline | WiFi Off | "Offline - Saving locally" | Orange |

### Custom Hook

```tsx
import { useLastSavedIndicator } from '@/hooks/useStatePersistence';

function CustomSaveIndicator() {
  const { lastSavedText, lastSavedTime } = useLastSavedIndicator(lastSavedTimestamp);

  return (
    <div>
      <p>{lastSavedText}</p> {/* "2 minutes ago" */}
      <p>{lastSavedTime}</p> {/* "2:30 PM" */}
    </div>
  );
}
```

---

## Optimistic Updates

**Requirement #5**: Immediately update UI when user saves, rollback if save fails.

### Implementation

```tsx
import { useOptimisticUpdate } from '@/hooks/useStatePersistence';

function PortfolioEditor() {
  const {
    state: portfolioData,
    updateOptimistically,
    rollback,
    isUpdating,
    pendingUpdates,
    failedUpdates,
  } = useOptimisticUpdate(
    initialData,
    async (newData) => {
      // Save to server (may fail)
      await api.updatePortfolio(newData);
    }
  );

  const handleUpdate = async (newData) => {
    try {
      // UI updates immediately (optimistic)
      await updateOptimistically(newData);
    } catch (error) {
      // Automatically rolls back to previous state
      console.error('Update failed, rolled back:', error);
      showToast('Failed to save changes', 'error');
    }
  };

  return (
    <div>
      {/* UI shows new data immediately */}
      <input
        value={portfolioData.title}
        onChange={(e) => handleUpdate({ ...portfolioData, title: e.target.value })}
      />

      {isUpdating && <Spinner />}
      {pendingUpdates > 0 && <Badge>{pendingUpdates} pending</Badge>}
      {failedUpdates > 0 && <Button onClick={rollback}>Undo</Button>}
    </div>
  );
}
```

### Flow Diagram

```
User Action
    ↓
Update UI Immediately (Optimistic)
    ↓
Send to Server
    ↓
   Success? ─────→ Keep UI Update
    ↓ No
Rollback to Previous State
```

### Benefits

- **Instant feedback**: No waiting for server
- **Better UX**: App feels faster
- **Automatic rollback**: No manual cleanup needed
- **Pending tracking**: Know what's still saving

---

## Conflict Detection

**Requirement #6**: If portfolio was updated in another session/tab, show warning before overwriting.

### Implementation

```tsx
import { useConflictDetection } from '@/hooks/useStatePersistence';
import { ConflictModal } from '@/components/statePersistence/ConflictModal';

function PortfolioEditor() {
  const [localTimestamp, setLocalTimestamp] = useState(Date.now());
  const [showConflictModal, setShowConflictModal] = useState(false);

  const { hasConflict, conflictInfo, checkConflict, resolveConflict } =
    useConflictDetection(localTimestamp);

  const handleSave = async () => {
    // Fetch latest server timestamp
    const serverData = await api.getPortfolio(portfolioId);

    // Check for conflicts
    if (checkConflict(serverData.updatedAt)) {
      setShowConflictModal(true);
      return;
    }

    // No conflict, proceed with save
    await api.savePortfolio(portfolioData);
    setLocalTimestamp(Date.now());
  };

  const handleKeepLocal = async () => {
    // Overwrite server with local changes
    await api.savePortfolio(portfolioData, { force: true });
    setLocalTimestamp(Date.now());
    resolveConflict();
    setShowConflictModal(false);
  };

  const handleUseServer = async () => {
    // Discard local changes, use server version
    const serverData = await api.getPortfolio(portfolioId);
    setPortfolioData(serverData);
    setLocalTimestamp(serverData.updatedAt);
    resolveConflict();
    setShowConflictModal(false);
  };

  return (
    <div>
      {/* Editor */}

      {hasConflict && !showConflictModal && (
        <div className="conflict-warning">
          ⚠️ Changes detected from another session
        </div>
      )}

      <ConflictModal
        isOpen={showConflictModal}
        conflictInfo={conflictInfo!}
        onKeepLocal={handleKeepLocal}
        onUseServer={handleUseServer}
        onCancel={() => setShowConflictModal(false)}
      />
    </div>
  );
}
```

### Conflict Detection Scenarios

**Scenario 1: Multi-tab editing**
```
Tab 1: User edits portfolio at 2:00 PM
Tab 2: User edits same portfolio at 2:05 PM
Tab 1: Tries to save at 2:10 PM
Result: Conflict detected (Tab 2 made newer changes)
```

**Scenario 2: Multi-device editing**
```
Device A: User edits portfolio on desktop
Device B: User edits same portfolio on mobile
Device A: Tries to save
Result: Conflict detected (mobile made newer changes)
```

### Conflict Modal

```tsx
import { ConflictModal, ConflictBanner } from '@/components/statePersistence/ConflictModal';

// Full modal (recommended)
<ConflictModal
  isOpen={showModal}
  conflictInfo={conflictInfo}
  onKeepLocal={() => {/* Keep user's changes */}}
  onUseServer={() => {/* Use server version */}}
  onCancel={() => {/* Close modal */}}
/>

// Compact banner (alternative)
<ConflictBanner
  conflictInfo={conflictInfo}
  onResolve={() => setShowModal(true)}
  onDismiss={() => resolveConflict()}
/>
```

---

## Complete Examples

### Example 1: Portfolio Builder with Full Persistence

```tsx
import { usePersistedState } from '@/hooks/useStatePersistence';
import { SaveStatusIndicator } from '@/components/statePersistence/SaveStatusIndicator';
import { ConflictModal } from '@/components/statePersistence/ConflictModal';

function AIPortfolioBuilder({ portfolioId }: { portfolioId: string }) {
  const {
    data: portfolioData,
    setData: setPortfolioData,
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    hasConflict,
    isOnline,
    save,
    checkConflict,
    resolveConflict,
  } = usePersistedState(
    `portfolio-${portfolioId}`,
    initialPortfolioData,
    async (data) => {
      // Save to backend
      const result = await api.savePortfolio(portfolioId, data);
      return { timestamp: result.updatedAt };
    },
    {
      autoSaveInterval: 30000, // 30 seconds
      enableAutoSave: true,
    }
  );

  const [showConflictModal, setShowConflictModal] = useState(false);

  // Check for conflicts before manual save
  const handleManualSave = async () => {
    const serverData = await api.getPortfolio(portfolioId);
    if (checkConflict(serverData.updatedAt)) {
      setShowConflictModal(true);
      return;
    }
    await save();
  };

  return (
    <div className="portfolio-builder">
      {/* Header with save status */}
      <header className="flex items-center justify-between p-4 border-b">
        <h1>Portfolio Builder</h1>
        <SaveStatusIndicator
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
          isOnline={isOnline}
        />
      </header>

      {/* Offline warning */}
      {!isOnline && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4">
          <p className="text-orange-700">
            You're offline. Changes are saved locally and will sync when you reconnect.
          </p>
        </div>
      )}

      {/* Editor content */}
      <div className="p-4">
        <input
          type="text"
          value={portfolioData.title}
          onChange={(e) =>
            setPortfolioData({ ...portfolioData, title: e.target.value })
          }
          placeholder="Portfolio title"
        />
        {/* More editor fields */}
      </div>

      {/* Manual save button */}
      <footer className="p-4 border-t">
        <button
          onClick={handleManualSave}
          disabled={!hasUnsavedChanges || saveStatus === 'saving'}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
        </button>
      </footer>

      {/* Conflict modal */}
      {hasConflict && (
        <ConflictModal
          isOpen={showConflictModal}
          conflictInfo={{ hasConflict: true, localTimestamp: lastSaved || 0, serverTimestamp: Date.now() }}
          onKeepLocal={async () => {
            await save();
            resolveConflict();
            setShowConflictModal(false);
          }}
          onUseServer={async () => {
            const serverData = await api.getPortfolio(portfolioId);
            setPortfolioData(serverData);
            resolveConflict();
            setShowConflictModal(false);
          }}
          onCancel={() => setShowConflictModal(false)}
        />
      )}
    </div>
  );
}
```

### Example 2: Form with localStorage Fallback

```tsx
import { useLocalStorage, useOnlineStatus, useUnsavedChangesWarning } from '@/hooks/useStatePersistence';

function PortfolioSetupForm() {
  const [formData, setFormData, clearFormData] = useLocalStorage(
    'portfolio-setup-form',
    {
      name: '',
      bio: '',
      skills: [],
    }
  );

  const { isOnline, wasOffline } = useOnlineStatus();
  const [isSaved, setIsSaved] = useState(false);

  // Warn on tab close if not saved
  useUnsavedChangesWarning(!isSaved);

  // Sync when coming online
  useEffect(() => {
    if (wasOffline) {
      handleSubmit();
    }
  }, [wasOffline]);

  const handleSubmit = async () => {
    if (!isOnline) {
      alert('Changes saved locally. Will submit when online.');
      return;
    }

    await api.submitPortfolio(formData);
    setIsSaved(true);
    clearFormData(); // Clear localStorage after successful submit
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {!isOnline && (
        <div className="offline-indicator">
          📱 Offline - Changes saved locally
        </div>
      )}

      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <button type="submit" disabled={!isOnline}>
        {isOnline ? 'Submit' : 'Submit (when online)'}
      </button>
    </form>
  );
}
```

### Example 3: Optimistic Updates with Rollback

```tsx
import { useOptimisticUpdate } from '@/hooks/useStatePersistence';

function ProjectList() {
  const {
    state: projects,
    updateOptimistically,
    rollback,
    failedUpdates,
  } = useOptimisticUpdate(
    initialProjects,
    async (newProjects) => {
      await api.updateProjects(newProjects);
    }
  );

  const addProject = async (newProject) => {
    try {
      // UI updates immediately
      await updateOptimistically([...projects, newProject]);
      showToast('Project added', 'success');
    } catch (error) {
      // Automatically rolled back
      showToast('Failed to add project', 'error');
    }
  };

  const deleteProject = async (projectId) => {
    const updated = projects.filter((p) => p.id !== projectId);
    try {
      await updateOptimistically(updated);
      showToast('Project deleted', 'success');
    } catch (error) {
      showToast('Failed to delete project', 'error');
    }
  };

  return (
    <div>
      {failedUpdates > 0 && (
        <div className="error-banner">
          {failedUpdates} update(s) failed
          <button onClick={rollback}>Undo Last Change</button>
        </div>
      )}

      {projects.map((project) => (
        <div key={project.id}>
          {project.title}
          <button onClick={() => deleteProject(project.id)}>Delete</button>
        </div>
      ))}

      <button onClick={() => addProject({ id: Date.now(), title: 'New Project' })}>
        Add Project
      </button>
    </div>
  );
}
```

---

## Best Practices

### Do's ✅

1. **Always enable auto-save** for long-form content
2. **Use localStorage fallback** for offline support
3. **Show clear save status** to users
4. **Implement conflict detection** for multi-session editing
5. **Test offline scenarios** thoroughly
6. **Clear localStorage** after successful save
7. **Monitor storage usage** to avoid quota errors

### Don'ts ❌

1. **Don't save sensitive data** to localStorage (use sessionStorage)
2. **Don't auto-save too frequently** (<10 seconds can cause performance issues)
3. **Don't ignore conflicts** (always let user decide)
4. **Don't save large files** to localStorage (5-10MB limit)
5. **Don't forget to handle** save failures gracefully
6. **Don't rely solely on auto-save** (provide manual save button)

---

## API Reference

### Hooks

| Hook | Purpose | Section |
|------|---------|---------|
| `useAutoSave` | Auto-save with interval | #1 |
| `useLocalStorage` | Persist to localStorage | #2 |
| `useUnsavedChangesWarning` | beforeunload warning | #3 |
| `useLastSavedIndicator` | Format save timestamp | #4 |
| `useOptimisticUpdate` | Optimistic UI updates | #5 |
| `useConflictDetection` | Detect data conflicts | #6 |
| `usePersistedState` | All-in-one hook | All |
| `useOnlineStatus` | Track online/offline | #2 |

### Components

| Component | Purpose |
|-----------|---------|
| `SaveStatusIndicator` | Full save status display |
| `SaveStatusBadge` | Compact save badge |
| `ConflictModal` | Conflict resolution modal |
| `ConflictBanner` | Conflict warning banner |

### Utilities

| Function | Purpose |
|----------|---------|
| `saveToLocalStorage` | Save with timestamp |
| `loadFromLocalStorage` | Load with expiry |
| `detectConflict` | Check for conflicts |
| `formatLastSaved` | Format relative time |
| `deepEqual` | Deep equality check |

---

## Testing

```tsx
// Test auto-save
describe('Auto-save', () => {
  it('should save after 30 seconds', async () => {
    const saveFn = jest.fn();
    const { result } = renderHook(() =>
      useAutoSave(data, saveFn, { interval: 30000 })
    );

    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    expect(saveFn).toHaveBeenCalledWith(data);
  });
});

// Test conflict detection
describe('Conflict detection', () => {
  it('should detect server timestamp > local timestamp', () => {
    const local = Date.now();
    const server = local + 1000;
    const { hasConflict } = detectConflict(local, server);
    expect(hasConflict).toBe(true);
  });
});
```

---

## Troubleshooting

### Auto-save not working

**Check:**
- Is `enabled` option set to `true`?
- Is data actually changing?
- Is save function throwing errors?

### localStorage quota exceeded

**Solution:**
```tsx
// Check usage
const { used, total } = getLocalStorageUsage();
if (used > total * 0.9) {
  // Clear old data
  clearLocalStorageByPrefix('old-');
}
```

### Conflicts not detected

**Check:**
- Are timestamps being updated correctly?
- Is `checkConflict` being called before save?
- Are timestamps in milliseconds (not seconds)?

---

## Summary

### Requirements Completed

✅ **#1**: Auto-save every 30 seconds
✅ **#2**: localStorage fallback for offline
✅ **#3**: beforeunload warning for unsaved changes
✅ **#4**: "Last saved at" indicator
✅ **#5**: Optimistic updates with rollback
✅ **#6**: Conflict detection for multi-session

### Files Created

- `apps/web/src/utils/statePersistence.ts` - Core utilities
- `apps/web/src/hooks/useStatePersistence.ts` - React hooks
- `apps/web/src/components/statePersistence/SaveStatusIndicator.tsx` - Status UI
- `apps/web/src/components/statePersistence/ConflictModal.tsx` - Conflict UI
- `STATE_PERSISTENCE.md` - This documentation

---

For questions or contributions, refer to the [main README](./README.md).
