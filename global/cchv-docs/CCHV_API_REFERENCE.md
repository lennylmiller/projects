# CCHV API Reference

Quick lookup reference for developers working on Claude Code History Viewer.

## Table of Contents

1. [Tauri Commands](#tauri-commands)
2. [Zustand Store](#zustand-store)
3. [React Hooks](#react-hooks)
4. [TypeScript Types](#typescript-types)
5. [Component Props](#component-props)
6. [Utility Functions](#utility-functions)

---

## Tauri Commands

### Project Management

#### `scan_projects`
Scan ~/.claude directory for projects and sessions.

**Signature:**
```rust
#[tauri::command]
async fn scan_projects(claude_dir: String) -> Result<Vec<ProjectInfo>, String>
```

**Usage:**
```typescript
import { invoke } from '@tauri-apps/api/core';

const projects = await invoke<ProjectInfo[]>('scan_projects', {
  claudeDir: '~/.claude'
});
```

**Returns:**
```typescript
interface ProjectInfo {
  name: string;
  path: string;
  sessions: SessionInfo[];
  worktree?: string;
  lastActivity: string; // ISO 8601 timestamp
}

interface SessionInfo {
  id: string;
  name: string;
  path: string;
  messageCount: number;
  lastTimestamp: string;
}
```

---

#### `refresh_project`
Refresh a single project (rescan sessions).

**Signature:**
```rust
#[tauri::command]
async fn refresh_project(project_id: String) -> Result<ProjectInfo, String>
```

**Usage:**
```typescript
const project = await invoke<ProjectInfo>('refresh_project', {
  projectId: 'my-project-id'
});
```

---

### Session Management

#### `load_session`
Load messages from a session JSONL file with pagination.

**Signature:**
```rust
#[tauri::command]
async fn load_session(
  path: String,
  offset: usize,
  limit: usize
) -> Result<SessionData, String>
```

**Usage:**
```typescript
const sessionData = await invoke<SessionData>('load_session', {
  path: '/Users/user/.claude/projects/my-project/session.jsonl',
  offset: 0,
  limit: 100
});
```

**Returns:**
```typescript
interface SessionData {
  messages: ClaudeMessage[];
  totalCount: number;
  hasMore: boolean;
}
```

---

#### `search_session`
Search within a session (backend search).

**Signature:**
```rust
#[tauri::command]
async fn search_session(
  path: String,
  query: String
) -> Result<Vec<SearchResult>, String>
```

**Usage:**
```typescript
const results = await invoke<SearchResult[]>('search_session', {
  path: '/path/to/session.jsonl',
  query: 'error handling'
});
```

---

#### `rename_session`
Rename a session file.

**Signature:**
```rust
#[tauri::command]
async fn rename_session(
  path: String,
  new_name: String
) -> Result<(), String>
```

**Usage:**
```typescript
await invoke('rename_session', {
  path: '/path/to/old-session.jsonl',
  newName: 'new-session-name.jsonl'
});
```

---

#### `get_recent_edits`
Get recent file edits across sessions.

**Signature:**
```rust
#[tauri::command]
async fn get_recent_edits(
  sessions: Vec<String>
) -> Result<Vec<FileEdit>, String>
```

**Usage:**
```typescript
const edits = await invoke<FileEdit[]>('get_recent_edits', {
  sessions: ['/path/to/session1.jsonl', '/path/to/session2.jsonl']
});
```

**Returns:**
```typescript
interface FileEdit {
  filePath: string;
  sessionId: string;
  timestamp: string;
  edits: Array<{
    old_string: string;
    new_string: string;
    replace_all: boolean;
  }>;
}
```

---

### Statistics

#### `calculate_stats`
Calculate token statistics from messages.

**Signature:**
```rust
#[tauri::command]
fn calculate_stats(messages: Vec<ClaudeMessage>) -> TokenStats
```

**Usage:**
```typescript
const stats = await invoke<TokenStats>('calculate_stats', {
  messages: messagesArray
});
```

**Returns:**
```typescript
interface TokenStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  totalCost?: number; // USD
  byDate: Record<string, number>; // YYYY-MM-DD → token count
}
```

---

#### `get_session_stats`
Get statistics for a specific session.

**Signature:**
```rust
#[tauri::command]
async fn get_session_stats(session_id: String) -> Result<SessionStats, String>
```

**Usage:**
```typescript
const stats = await invoke<SessionStats>('get_session_stats', {
  sessionId: 'session-uuid'
});
```

---

### Metadata

#### `load_metadata`
Load user metadata (hidden projects, custom names).

**Signature:**
```rust
#[tauri::command]
async fn load_metadata() -> Result<UserMetadata, String>
```

**Usage:**
```typescript
const metadata = await invoke<UserMetadata>('load_metadata');
```

**Returns:**
```typescript
interface UserMetadata {
  hiddenProjects: string[]; // Project IDs
  customSessionNames: Record<string, string>; // sessionId → custom name
  version: string;
}
```

---

#### `save_metadata`
Save user metadata to disk.

**Signature:**
```rust
#[tauri::command]
async fn save_metadata(data: UserMetadata) -> Result<(), String>
```

**Usage:**
```typescript
await invoke('save_metadata', {
  data: {
    hiddenProjects: ['project-1'],
    customSessionNames: { 'session-uuid': 'My Custom Name' },
    version: '1.0'
  }
});
```

---

#### `hide_project`
Hide a project from view.

**Signature:**
```rust
#[tauri::command]
async fn hide_project(project_id: String) -> Result<(), String>
```

**Usage:**
```typescript
await invoke('hide_project', { projectId: 'my-project' });
```

---

#### `set_custom_name`
Set custom session name.

**Signature:**
```rust
#[tauri::command]
async fn set_custom_name(
  session_id: String,
  name: String
) -> Result<(), String>
```

**Usage:**
```typescript
await invoke('set_custom_name', {
  sessionId: 'session-uuid',
  name: 'My Debugging Session'
});
```

---

### Settings

#### `load_settings`
Load app settings.

**Signature:**
```rust
#[tauri::command]
async fn load_settings() -> Result<Settings, String>
```

**Usage:**
```typescript
const settings = await invoke<Settings>('load_settings');
```

**Returns:**
```typescript
interface Settings {
  theme: 'light' | 'dark';
  showThinking: boolean;
  searchInToolResults: boolean;
  language: string;
  messagePageSize: number;
}
```

---

#### `save_settings`
Save app settings.

**Signature:**
```rust
#[tauri::command]
async fn save_settings(settings: Settings) -> Result<(), String>
```

**Usage:**
```typescript
await invoke('save_settings', {
  settings: {
    theme: 'dark',
    showThinking: true,
    searchInToolResults: false,
    language: 'en',
    messagePageSize: 100
  }
});
```

---

#### `reset_to_defaults`
Reset settings to defaults.

**Signature:**
```rust
#[tauri::command]
async fn reset_to_defaults() -> Result<Settings, String>
```

**Usage:**
```typescript
const defaultSettings = await invoke<Settings>('reset_to_defaults');
```

---

### File System Watcher

#### `start_watching`
Start watching a directory for changes.

**Signature:**
```rust
#[tauri::command]
async fn start_watching(path: String) -> Result<(), String>
```

**Usage:**
```typescript
await invoke('start_watching', { path: '~/.claude' });
```

---

#### `stop_watching`
Stop file system watcher.

**Signature:**
```rust
#[tauri::command]
async fn stop_watching() -> Result<(), String>
```

**Usage:**
```typescript
await invoke('stop_watching');
```

---

### Feedback & Debugging

#### `collect_system_info`
Collect system information for bug reports.

**Signature:**
```rust
#[tauri::command]
fn collect_system_info() -> SystemInfo
```

**Usage:**
```typescript
const info = await invoke<SystemInfo>('collect_system_info');
```

**Returns:**
```typescript
interface SystemInfo {
  os: string;
  version: string;
  arch: string;
  appVersion: string;
  rustVersion: string;
}
```

---

#### `generate_bug_report`
Generate formatted bug report.

**Signature:**
```rust
#[tauri::command]
async fn generate_bug_report(description: String) -> Result<String, String>
```

**Usage:**
```typescript
const report = await invoke<string>('generate_bug_report', {
  description: 'App crashes when opening large sessions'
});
```

---

### File System Utils

#### `read_file_safe`
Read file with error handling.

**Signature:**
```rust
#[tauri::command]
async fn read_file_safe(path: String) -> Result<String, String>
```

**Usage:**
```typescript
const content = await invoke<string>('read_file_safe', {
  path: '/path/to/file.txt'
});
```

---

#### `write_file_atomic`
Write file atomically (temp + rename).

**Signature:**
```rust
#[tauri::command]
async fn write_file_atomic(
  path: String,
  content: String
) -> Result<(), String>
```

**Usage:**
```typescript
await invoke('write_file_atomic', {
  path: '/path/to/file.txt',
  content: 'new content'
});
```

---

## Zustand Store

### Store Structure

```typescript
interface AppStore {
  // Project slice
  projects: ProjectInfo[];
  selectedProject: string | null;
  setProjects: (projects: ProjectInfo[]) => void;
  selectProject: (id: string) => void;

  // Message slice
  messages: ClaudeMessage[];
  activeMessage: string | null;
  pagination: PaginationState;
  loadMessages: (sessionId: string, offset: number, limit: number) => Promise<void>;
  appendMessages: (messages: ClaudeMessage[]) => void;
  setActiveMessage: (uuid: string) => void;

  // Search slice
  searchQuery: string;
  searchResults: SearchResult[];
  searchFilters: SearchFilters;
  setSearchQuery: (query: string) => void;
  applyFilters: (filters: SearchFilters) => void;

  // Analytics slice
  analyticsData: AnalyticsData | null;
  calculateAnalytics: () => AnalyticsData;
  invalidateCache: () => void;

  // Settings slice
  settings: Settings;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleShowThinking: () => void;
  setLanguage: (lang: string) => void;

  // Metadata slice
  hiddenProjects: Set<string>;
  customSessionNames: Map<string, string>;
  hideProject: (id: string) => void;
  setSessionName: (id: string, name: string) => void;

  // Filter slice
  contentTypes: Set<ContentType>;
  dateRange: DateRange | null;
  toggleContentType: (type: ContentType) => void;
  setDateRange: (range: DateRange) => void;

  // Navigation slice
  history: string[];
  historyIndex: number;
  pushHistory: (sessionId: string) => void;
  goBack: () => void;
  goForward: () => void;
}
```

### Using the Store

```typescript
import { useAppStore } from '@/store/useAppStore';

function MyComponent() {
  // Select specific state
  const projects = useAppStore(state => state.projects);
  const setProjects = useAppStore(state => state.setProjects);

  // Select multiple pieces
  const { messages, loading } = useAppStore(state => ({
    messages: state.messages,
    loading: state.loading
  }));

  // Use actions
  const loadMessages = useAppStore(state => state.loadMessages);
  await loadMessages('session-id', 0, 100);
}
```

---

## React Hooks

### `useGitHubUpdater`
GitHub API integration for checking updates.

**Usage:**
```typescript
import { useGitHubUpdater } from '@/hooks/useGitHubUpdater';

function UpdateChecker() {
  const { checkForUpdates, updateAvailable, latestVersion } = useGitHubUpdater();

  useEffect(() => {
    checkForUpdates();
  }, []);

  if (updateAvailable) {
    return <div>New version available: {latestVersion}</div>;
  }
}
```

---

### `useSmartUpdater`
Smart update logic (skip/postpone).

**Usage:**
```typescript
import { useSmartUpdater } from '@/hooks/useSmartUpdater';

function UpdateModal() {
  const { shouldPrompt, skip, postpone, install } = useSmartUpdater();

  if (!shouldPrompt) return null;

  return (
    <div>
      <button onClick={install}>Install Now</button>
      <button onClick={postpone}>Remind Later</button>
      <button onClick={skip}>Skip Version</button>
    </div>
  );
}
```

---

### `useVirtualScroll`
Virtual scrolling hook (wraps @tanstack/react-virtual).

**Usage:**
```typescript
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

function MessageList({ messages }: { messages: ClaudeMessage[] }) {
  const { virtualizer, measureElement } = useVirtualScroll({
    count: messages.length,
    estimateSize: () => 100,
    overscan: 5
  });

  return (
    <div style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map(virtualRow => (
        <div
          key={virtualRow.key}
          data-index={virtualRow.index}
          ref={measureElement}
        >
          <MessageItem message={messages[virtualRow.index]} />
        </div>
      ))}
    </div>
  );
}
```

---

### `useDebounce`
Debounce hook for search input.

**Usage:**
```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchBar() {
  const [input, setInput] = useState('');
  const debouncedQuery = useDebounce(input, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // Perform search
    }
  }, [debouncedQuery]);

  return <input value={input} onChange={e => setInput(e.target.value)} />;
}
```

---

## TypeScript Types

### Core Message Types

```typescript
interface ClaudeMessage {
  uuid: string;
  parentUuid?: string;
  sessionId: string;
  timestamp: string;
  type: 'user' | 'assistant' | 'system' | 'summary';
  message: MessageContent;
  toolUse?: ToolUse;
  toolUseResult?: ToolUseResult;
  isSidechain: boolean;
}

interface MessageContent {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentItem[];
  id?: string;
  model?: string;
  stop_reason?: string;
  usage?: UsageInfo;
}

type ContentItem =
  | TextContent
  | ToolUseContent
  | ToolResultContent
  | ThinkingContent
  | ImageContent
  | ServerToolUseContent
  | WebSearchToolResultContent
  | DocumentContent
  | SearchResultContent
  | McpToolUseContent
  | McpToolResultContent
  | WebFetchToolResultContent
  | CodeExecutionToolResultContent
  | BashCodeExecutionToolResultContent
  | TextEditorCodeExecutionToolResultContent
  | ToolSearchToolResultContent;

interface TextContent {
  type: 'text';
  text: string;
}

interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, any>;
}

interface ToolResultContent {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

interface ThinkingContent {
  type: 'thinking';
  thinking: string;
  signature?: string;
}

interface ImageContent {
  type: 'image';
  source: {
    type: 'base64' | 'url';
    data: string;
  };
}

interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  service_tier?: string;
}
```

---

### Store Types

```typescript
interface PaginationState {
  offset: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
}

interface SearchFilters {
  contentTypes: Set<ContentType>;
  includeToolResults: boolean;
  includeThinking: boolean;
  dateRange?: DateRange;
}

interface DateRange {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

interface AnalyticsData {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  totalCost?: number;
  byDate: Record<string, number>;
  bySession: Record<string, TokenStats>;
  toolUsageCount: Record<string, number>;
}

interface Settings {
  theme: 'light' | 'dark';
  showThinking: boolean;
  searchInToolResults: boolean;
  language: string;
  messagePageSize: number;
}
```

---

## Component Props

### MessageViewer

```typescript
interface MessageViewerProps {
  sessionId: string;
  messages: ClaudeMessage[];
  loading: boolean;
  onLoadMore: () => void;
}
```

---

### MessageItem

```typescript
interface MessageItemProps {
  message: ClaudeMessage;
  depth: number;
  isActive: boolean;
  onSelect: (uuid: string) => void;
}
```

---

### ProjectTree

```typescript
interface ProjectTreeProps {
  projects: ProjectInfo[];
  selectedProject: string | null;
  onSelectProject: (id: string) => void;
  onSelectSession: (sessionId: string) => void;
}
```

---

### AnalyticsDashboard

```typescript
interface AnalyticsDashboardProps {
  data: AnalyticsData;
  onRefresh: () => void;
}
```

---

### SearchBar

```typescript
interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}
```

---

## Utility Functions

### Message Adapter

```typescript
import { adaptMessage } from '@/utils/messageAdapter';

// Adapt raw JSONL message to UI format
const uiMessage = adaptMessage(rawMessage);
```

---

### JSON Utils

```typescript
import { safeStringify, safeParse } from '@/utils/jsonUtils';

// Safe JSON parsing (no crash on malformed JSON)
const obj = safeParse(jsonString, defaultValue);

// Safe JSON stringification (handles circular refs)
const json = safeStringify(obj, 2);
```

---

### Date Formatting

```typescript
import { formatTimestamp, formatRelative } from '@/utils/dateUtils';

// Format ISO 8601 to readable date
const formatted = formatTimestamp('2025-06-26T11:45:51.979Z');
// Output: "Jun 26, 2025, 11:45 AM"

// Format relative time
const relative = formatRelative('2025-06-26T11:45:51.979Z');
// Output: "2 hours ago"
```

---

### Token Calculation

```typescript
import { calculateTokens, estimateCost } from '@/utils/tokenUtils';

// Calculate total tokens from usage info
const total = calculateTokens(usageInfo);

// Estimate cost in USD (if model pricing available)
const cost = estimateCost(usageInfo, 'claude-opus-4-20250514');
```

---

### Content Type Checks

```typescript
import {
  isTextContent,
  isToolUse,
  isThinking,
  hasToolResult
} from '@/utils/contentTypeChecks';

// Type guards for content items
if (isTextContent(item)) {
  console.log(item.text);
}

if (isToolUse(item)) {
  console.log(item.name, item.input);
}

// Check if message has tool result
if (hasToolResult(message)) {
  console.log(message.toolUseResult);
}
```

---

## Error Handling

### Pattern

All Tauri commands return `Result<T, String>`:

```typescript
try {
  const result = await invoke<T>('command_name', { params });
  // Handle success
} catch (error) {
  console.error('Command failed:', error);
  // Show user-friendly error message
  toast.error(`Failed to execute command: ${error}`);
}
```

### Common Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "File not found" | Session JSONL deleted or moved | Refresh project list |
| "Invalid JSON" | Corrupted JSONL file | Skip corrupted lines (auto-handled) |
| "Permission denied" | Insufficient file system permissions | Check file ownership |
| "Command not found" | Tauri command not registered | Check `src-tauri/src/main.rs` |

---

## Performance Tips

### Virtual Scrolling

- Use `overscan` prop to preload items above/below viewport
- Memoize `MessageItem` component to prevent unnecessary re-renders
- Cache heights after first measurement

### Search Indexing

- Build index once per session (cache in store)
- Use debouncing (300ms) for search input
- Limit results to top 100 matches

### State Management

- Use Zustand selectors to subscribe only to needed state
- Avoid subscribing to entire store (causes re-renders)
- Batch state updates when possible

### Message Loading

- Load in batches of 100 messages (configurable)
- Use infinite scroll to load more automatically
- Cancel previous requests if user navigates away

---

## Development Workflow

### Testing Commands

```bash
# Frontend tests
pnpm test           # Watch mode
pnpm test-run       # Run once

# Backend tests
just rust-test      # Single-threaded (required)

# Linting
pnpm lint           # ESLint
just rust-lint      # Clippy
```

### Building

```bash
# Development
just dev            # Start dev server

# Production
just tauri-build    # Build for current platform
```

### Debugging

```bash
# View Rust logs
RUST_LOG=debug just dev

# View frontend logs
# Open desktop window -> Right-click -> Inspect Element -> Console
```

---

**End of API Reference**

For architecture details: [CCHV_ARCHITECTURE.md](CCHV_ARCHITECTURE.md)
For getting started: [CCHV_GETTING_STARTED.md](CCHV_GETTING_STARTED.md)
For quick overview: [CCHV_TLDR.md](CCHV_TLDR.md)
