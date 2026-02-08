# CCHV Architecture Documentation

Comprehensive architecture documentation for **Claude Code History Viewer** using a layered resolution approach.

## Table of Contents

1. [Level 1: Use Cases](#level-1-use-cases)
   - [Use Case Diagram](#use-case-diagram)
   - [Actor Descriptions](#actor-descriptions)
   - [Use Case Descriptions](#use-case-descriptions)

2. [Level 2: Sequence Diagrams](#level-2-sequence-diagrams)
   - [App Startup Flow](#app-startup-flow)
   - [Project Scan & Load](#project-scan--load)
   - [Message Pagination](#message-pagination)
   - [Search Execution](#search-execution)
   - [Analytics Calculation](#analytics-calculation)

3. [Level 3: Activity Diagrams](#level-3-activity-diagrams)
   - [JSONL Parsing Process](#jsonl-parsing-process)
   - [Virtual Scroll Rendering](#virtual-scroll-rendering)
   - [Search Index Building](#search-index-building)
   - [Message Tree Flattening](#message-tree-flattening)
   - [Tauri IPC Communication](#tauri-ipc-communication)

4. [Level 4: Class Diagrams](#level-4-class-diagrams)
   - [Zustand Store Structure](#zustand-store-structure)
   - [Tauri Command Architecture](#tauri-command-architecture)
   - [React Component Hierarchy](#react-component-hierarchy)
   - [Message Type Hierarchy](#message-type-hierarchy)

5. [Reference](#reference)
   - [Tauri Commands Reference](#tauri-commands-reference)
   - [Store Slices Reference](#store-slices-reference)
   - [Key Files Map](#key-files-map)
   - [Message Type Reference](#message-type-reference)

---

## Level 1: Use Cases

### Use Case Diagram

```plantuml
@startuml CCHV Use Cases
!theme plain
skinparam backgroundColor #FFFFFF
skinparam actorStyle awesome

left to right direction

actor "Developer" as dev
actor "Researcher" as researcher
actor "Team Lead" as lead

rectangle "Claude Code History Viewer" {
  usecase "Browse Conversation History" as UC1
  usecase "Search Across Sessions" as UC2
  usecase "View Token Usage Analytics" as UC3
  usecase "Navigate Message Threads" as UC4
  usecase "Export/Copy Content" as UC5
  usecase "Analyze Recent File Edits" as UC6
  usecase "Compare Session Activity" as UC7
  usecase "Filter by Content Type" as UC8
  usecase "View Message Metadata" as UC9
  usecase "Track Thinking Blocks" as UC10
}

dev --> UC1
dev --> UC2
dev --> UC4
dev --> UC5
dev --> UC6

researcher --> UC2
researcher --> UC3
researcher --> UC7
researcher --> UC10

lead --> UC3
lead --> UC7
lead --> UC9

UC1 .> UC4 : <<includes>>
UC2 .> UC8 : <<includes>>
UC3 .> UC7 : <<extends>>

note right of UC1
  Primary entry point
  for all actors
end note

note bottom of UC3
  Aggregates token stats
  across all sessions
end note

@enduml
```

### Actor Descriptions

| Actor | Description | Goals |
|-------|-------------|-------|
| **Developer** | Software engineer using Claude Code for daily development | - Review past conversations for debugging<br>- Find code snippets from previous sessions<br>- Track file changes made by Claude<br>- Copy tool results for documentation |
| **Researcher** | Analyst studying Claude Code usage patterns | - Analyze token consumption trends<br>- Compare conversation structures<br>- Study thinking block patterns<br>- Extract statistical insights |
| **Team Lead** | Manager overseeing team's Claude usage | - Monitor team token usage<br>- Review session quality and outcomes<br>- Identify training opportunities<br>- Audit Claude interactions |

### Use Case Descriptions

#### UC1: Browse Conversation History

**Primary Actor:** Developer

**Description:** User navigates through a tree of projects and sessions stored in `~/.claude`, viewing message content in a virtual scrolling list.

**Preconditions:**
- Claude Code has been used at least once (creating `~/.claude` directory)
- User has launched CCHV desktop app

**Main Flow:**
1. App scans `~/.claude/projects/` directory
2. User sees project list in sidebar
3. User expands project to see sessions
4. User clicks session
5. App loads messages from JSONL file
6. User scrolls through message list
7. User can expand/collapse messages with tool use

**Postconditions:**
- User can read past conversation content
- Messages are displayed in chronological order
- Virtual scrolling ensures smooth performance

---

#### UC2: Search Across Sessions

**Primary Actor:** Developer, Researcher

**Description:** User enters search query to find specific content across all sessions, with highlighting and filtering options.

**Preconditions:**
- At least one session is loaded
- Search index has been built

**Main Flow:**
1. User types query in search box
2. App debounces input (300ms)
3. FlexSearch index is queried
4. Results appear in sidebar
5. User clicks result
6. App navigates to matching message
7. Search terms are highlighted

**Alternate Flows:**
- **3a:** User applies filter (tool results, thinking blocks)
  - Search is re-executed with filter
  - Only matching content types appear

**Postconditions:**
- User finds relevant messages
- Context is preserved (full conversation visible)

---

#### UC3: View Token Usage Analytics

**Primary Actor:** Researcher, Team Lead

**Description:** User views aggregated statistics about token usage, cost, and conversation patterns across sessions.

**Preconditions:**
- At least one session with assistant messages exists

**Main Flow:**
1. User clicks "Analytics" tab
2. App aggregates token counts from all sessions
3. Charts render:
   - Total input/output/cached tokens
   - Token usage over time
   - Cost estimation (if available)
   - Session comparison
4. User interacts with charts (zoom, filter)

**Postconditions:**
- User understands token consumption
- Cost trends are visible

---

#### UC4: Navigate Message Threads

**Primary Actor:** Developer

**Description:** User navigates parent-child message relationships, including sidechains and tool use/result pairs.

**Preconditions:**
- Session is loaded with message tree structure

**Main Flow:**
1. User sees message with reply indicator
2. User clicks "View Replies" button
3. Child messages are expanded inline
4. User can collapse thread

**Alternate Flows:**
- **3a:** User clicks "Go to Parent"
  - App scrolls to parent message
  - Parent is highlighted temporarily

**Postconditions:**
- User understands conversation structure
- Parent-child relationships are clear

---

#### UC5: Export/Copy Content

**Primary Actor:** Developer

**Description:** User copies message content or exports conversation data for external use.

**Preconditions:**
- At least one message is visible

**Main Flow:**
1. User right-clicks message or uses copy button
2. Context menu appears with options:
   - Copy message text
   - Copy tool result
   - Copy entire conversation
3. User selects option
4. Content is copied to clipboard
5. Toast notification confirms

**Postconditions:**
- Content is available in clipboard
- User can paste into other apps

---

#### UC6: Analyze Recent File Edits

**Primary Actor:** Developer

**Description:** User views a timeline of file edits made by Claude across sessions, grouped by file path.

**Preconditions:**
- At least one session contains Edit/Write tool results

**Main Flow:**
1. User opens "Recent Edits" panel
2. App scans all sessions for Edit/Write tool use
3. Edits are displayed in timeline:
   - Grouped by file path
   - Sorted by timestamp
   - Shows old_string → new_string diffs
4. User clicks edit to jump to session

**Postconditions:**
- User sees history of Claude's code changes
- Can correlate edits with conversation context

---

#### UC7: Compare Session Activity

**Primary Actor:** Researcher, Team Lead

**Description:** User compares metrics across multiple sessions (token usage, message count, tool use frequency).

**Preconditions:**
- Multiple sessions exist in different projects

**Main Flow:**
1. User selects multiple sessions (checkbox UI)
2. User clicks "Compare Sessions"
3. Comparison view appears:
   - Side-by-side metrics
   - Token usage chart (multi-line)
   - Tool use breakdown (stacked bar)
4. User exports comparison as CSV/JSON

**Postconditions:**
- User identifies outliers and patterns
- Data is exportable for further analysis

---

#### UC8: Filter by Content Type

**Primary Actor:** Developer, Researcher

**Description:** User filters messages to show only specific content types (tool results, thinking blocks, errors).

**Preconditions:**
- Session is loaded

**Main Flow:**
1. User opens filter dropdown
2. User selects content types:
   - ☑ Text messages
   - ☑ Tool use
   - ☑ Tool results
   - ☐ Thinking blocks
   - ☑ Errors
3. Message list refreshes
4. Only selected types are visible

**Postconditions:**
- User sees focused view of relevant content
- Virtual scroll adjusts to filtered list

---

#### UC9: View Message Metadata

**Primary Actor:** Team Lead

**Description:** User inspects detailed metadata for each message (timestamp, token counts, model used, stop reason).

**Preconditions:**
- Message with metadata exists

**Main Flow:**
1. User clicks "Details" icon on message
2. Metadata panel expands:
   - Message UUID
   - Timestamp (formatted)
   - Token usage breakdown
   - Model ID
   - Stop reason
   - Cost (if available)
3. User can copy metadata as JSON

**Postconditions:**
- User has full transparency into message details

---

#### UC10: Track Thinking Blocks

**Primary Actor:** Researcher

**Description:** User views and analyzes Claude's thinking blocks (extended thinking feature) across sessions.

**Preconditions:**
- At least one assistant message contains thinking blocks

**Main Flow:**
1. User enables "Show Thinking" toggle
2. Thinking blocks appear inline with assistant messages
3. User can:
   - Expand/collapse thinking
   - Search within thinking content
   - See thinking token count
4. Analytics tab shows thinking usage stats

**Postconditions:**
- User understands Claude's reasoning process
- Can study thinking patterns

---

## Level 2: Sequence Diagrams

### App Startup Flow

```plantuml
@startuml App Startup
!theme plain
skinparam backgroundColor #FFFFFF

actor "User" as user
participant "Terminal" as term
participant "direnv" as direnv
participant "Nix Shell" as nix
participant "just" as just
participant "Tauri CLI" as tauri
participant "Vite Server" as vite
participant "Desktop Window" as window
participant "React App" as react
participant "Rust Backend" as rust

user -> term : cd claude-code-history-viewer
term -> direnv : Detect .envrc
direnv -> nix : Load flake.nix
activate nix
nix --> direnv : Environment ready\n(Node, Rust, pnpm, just)
deactivate nix
direnv --> term : Shell updated

user -> term : just dev
term -> just : Execute dev recipe
just -> tauri : Run "tauri dev"
activate tauri

tauri -> vite : Start dev server
activate vite
vite --> vite : Build frontend\nServe on :5173
vite --> tauri : Server ready

tauri -> rust : Compile Rust backend
activate rust
rust --> rust : Build Tauri commands\nLink with webview
rust --> tauri : Backend ready
deactivate rust

tauri -> window : Create desktop window
activate window
window -> vite : Load http://localhost:5173
vite --> window : Serve HTML/JS/CSS

window -> react : Initialize React app
activate react
react -> rust : invoke('scan_projects')
rust --> react : Project list
react --> window : Render UI
deactivate react

window --> user : App ready
deactivate window
deactivate vite
deactivate tauri

note right of window
  Desktop window embeds
  Vite dev server via
  native webview
end note

note right of rust
  Tauri IPC bridge enables
  React ↔ Rust communication
end note

@enduml
```

**Key Points:**
- User never directly opens browser - `just dev` launches desktop window
- Vite server runs in background, only accessible via Tauri webview
- Rust backend compiles once, then watches for changes
- React app initializes and immediately scans for projects

---

### Project Scan & Load

```plantuml
@startuml Project Scan
!theme plain
skinparam backgroundColor #FFFFFF

actor "User" as user
participant "React UI" as react
participant "Zustand Store" as store
participant "Tauri IPC" as ipc
participant "Rust: scan_projects" as scan
participant "File System" as fs
database "~/.claude" as claude

user -> react : App opens
react -> store : Initialize store
store -> ipc : invoke('scan_projects', { claude_dir })
ipc -> scan : Call command

scan -> fs : Read ~/.claude/projects
fs -> claude : List directories
claude --> fs : [project1, project2, ...]

loop For each project
  scan -> fs : Read *.jsonl files
  fs --> scan : [session1.jsonl, session2.jsonl]
  scan -> scan : Extract metadata:\n- Session name\n- Message count\n- Last timestamp
end

scan -> scan : Build project tree:\n- Group by worktree\n- Sort by timestamp

scan --> ipc : Result<Vec<ProjectInfo>, String>
ipc --> store : ProjectInfo[]
store -> store : Set projects state
store --> react : Trigger re-render

react -> react : Render ProjectTree component
react --> user : Project list displayed

note right of scan
  Rust command returns:
  {
    name: String,
    sessions: Vec<SessionInfo>,
    worktree: Option<String>
  }
end note

@enduml
```

**Key Points:**
- Scan happens on app startup and can be manually refreshed
- Projects are grouped by Git worktree (if available)
- Metadata is extracted without loading full messages (efficient)

---

### Message Pagination

```plantuml
@startuml Message Pagination
!theme plain
skinparam backgroundColor #FFFFFF

actor "User" as user
participant "React:\nMessageViewer" as viewer
participant "Zustand Store" as store
participant "Tauri IPC" as ipc
participant "Rust:\nload_session" as load
participant "JSONL Parser" as parser
database "session.jsonl" as file

user -> viewer : Click session in tree
viewer -> store : selectSession(sessionId)
store -> ipc : invoke('load_session', {\n  path, offset: 0, limit: 100\n})

ipc -> load : Call command
load -> file : Open JSONL file
file --> load : File handle

load -> parser : Parse lines [0..100]
parser -> parser : For each line:\n- Parse JSON\n- Validate schema\n- Extract fields

parser --> load : Vec<ClaudeMessage>
load -> load : Build message tree:\n- Link parent-child\n- Calculate depth\n- Flatten for rendering

load --> ipc : Result<SessionData, String>
ipc --> store : SessionData
store -> store : Append messages\nUpdate pagination state
store --> viewer : Trigger re-render

viewer -> viewer : Virtual scroll:\n- Calculate visible range\n- Render only visible items
viewer --> user : First 100 messages displayed

user -> viewer : Scroll to bottom
viewer -> viewer : Detect end of list
viewer -> store : loadMoreMessages()
store -> ipc : invoke('load_session', {\n  path, offset: 100, limit: 100\n})

ipc -> load : Call command
load -> parser : Parse lines [100..200]
parser --> load : Vec<ClaudeMessage>
load --> ipc : Result<SessionData>
ipc --> store : SessionData
store -> store : Append new messages
store --> viewer : Trigger re-render
viewer --> user : Next 100 messages displayed

note right of parser
  Error handling:
  - Malformed JSON → Skip line
  - Missing fields → Use defaults
  - Corrupted file → Return error
end note

note right of viewer
  Virtual scrolling ensures
  smooth rendering even with
  1000+ messages
end note

@enduml
```

**Key Points:**
- Messages load in batches of 100 (configurable)
- Virtual scrolling renders only visible items
- Infinite scroll loads more messages automatically
- Message tree is flattened for linear display

---

### Search Execution

```plantuml
@startuml Search Flow
!theme plain
skinparam backgroundColor #FFFFFF

actor "User" as user
participant "React:\nSearchBar" as search
participant "Debounce\nHook" as debounce
participant "Zustand Store" as store
participant "FlexSearch\nIndex" as index
participant "Search Results" as results

user -> search : Type "error handling"
search -> debounce : Update input value
debounce -> debounce : Wait 300ms\n(no more typing)

debounce -> store : setSearchQuery("error handling")
store -> store : Update search state
store -> index : Query index

index -> index : Tokenize query:\n["error", "handling"]
index -> index : Search in fields:\n- message.content\n- tool results\n- thinking blocks

index --> store : Matching message IDs:\n[uuid1, uuid2, uuid3, ...]

store -> store : Retrieve full messages\nfrom message state
store -> store : Apply filters:\n- Content type\n- Date range\n- Project scope

store --> results : Filtered results
results -> results : Highlight search terms
results --> user : Display results in sidebar

user -> results : Click result #2
results -> store : setActiveMessage(uuid2)
store -> store : Find message in list
store --> search : Scroll to message
search -> search : Highlight message row\nfor 2 seconds
search --> user : Focused on matching message

note right of index
  FlexSearch configuration:
  - tokenize: "forward"
  - threshold: 0
  - depth: 3
end note

note right of store
  Filtering logic:
  if (filter.toolResults) {
    results = results.filter(
      msg => msg.toolUseResult != null
    )
  }
end note

@enduml
```

**Key Points:**
- Debouncing prevents search on every keystroke
- FlexSearch provides fast client-side full-text search
- Results maintain context (full conversation visible)
- Highlighting uses simple string replacement

---

### Analytics Calculation

```plantuml
@startuml Analytics Flow
!theme plain
skinparam backgroundColor #FFFFFF

actor "User" as user
participant "React:\nAnalyticsDashboard" as dashboard
participant "Zustand Store" as store
participant "Token Aggregator" as agg
participant "Chart Library\n(recharts)" as chart

user -> dashboard : Click "Analytics" tab
dashboard -> store : getAnalytics()
store -> store : Check if cached
alt Cache exists and fresh
  store --> dashboard : Return cached data
else Cache stale or missing
  store -> agg : Aggregate token stats

  agg -> store : Get all loaded sessions
  store --> agg : Vec<SessionData>

  loop For each session
    agg -> agg : For each assistant message:\n- Extract usage object\n- Sum input_tokens\n- Sum output_tokens\n- Sum cache_* tokens\n- Record timestamp
  end

  agg -> agg : Calculate:\n- Total tokens by type\n- Tokens over time (daily)\n- Cost (if available)\n- Tool use frequency

  agg --> store : AnalyticsData
  store -> store : Cache result (5 min TTL)
  store --> dashboard : AnalyticsData
end

dashboard -> chart : Render charts:\n1. Token usage pie chart\n2. Timeline (line)\n3. Cost trend (area)\n4. Tool usage (bar)

chart --> user : Interactive charts displayed

user -> chart : Hover over data point
chart -> chart : Show tooltip:\n- Exact value\n- Timestamp\n- Session name
chart --> user : Tooltip visible

user -> chart : Zoom into date range
chart -> chart : Update x-axis scale
chart --> user : Zoomed view

note right of agg
  Token aggregation:
  {
    totalInputTokens: number,
    totalOutputTokens: number,
    totalCachedTokens: number,
    costUSD: number | null,
    byDate: Map<date, tokens>
  }
end note

note right of store
  Caching strategy:
  - Cache invalidated on:
    * New session loaded
    * Manual refresh
  - TTL: 5 minutes
end note

@enduml
```

**Key Points:**
- Analytics are calculated on-demand (not on app startup)
- Results are cached to avoid redundant calculations
- All data is client-side (no backend aggregation)
- Charts are interactive (zoom, filter, tooltip)

---

## Level 3: Activity Diagrams

### JSONL Parsing Process

```plantuml
@startuml JSONL Parsing
!theme plain
skinparam backgroundColor #FFFFFF

start

:Open JSONL file;

:Read lines into Vec<String>;

if (File readable?) then (yes)
  :Initialize empty Vec<ClaudeMessage>;

  while (More lines?) is (yes)
    :Read next line;

    if (Line is empty?) then (yes)
      :Skip line;
    else (no)
      :Attempt JSON parse;

      if (Valid JSON?) then (yes)
        :Deserialize to ClaudeMessage struct;

        if (Has required fields?) then (yes)
          if (message.content exists?) then (yes)
            :Extract content field;

            if (Content is string?) then (yes)
              :Wrap in ContentItem::Text;
            else (Content is array)
              :Parse ContentItem[];
              :Identify types:\n- text\n- tool_use\n- tool_result\n- thinking\n- image;
            endif

            :Add to messages vector;
          else (no)
            :Use empty content;
            :Add to messages vector;
          endif
        else (no)
          :Log warning: Missing required fields;
          :Skip message;
        endif
      else (no)
        :Log error: Malformed JSON;
        :Skip line;
      endif
    endif
  endwhile (no more lines)

  :Return Ok(messages);
else (no)
  :Return Err("File not found");
endif

stop

note right
  Error handling levels:
  1. File level: Return error
  2. Line level: Skip + log
  3. Field level: Use defaults
end note

@enduml
```

**Key Points:**
- Robust error handling at multiple levels
- Malformed lines are skipped, not fatal
- Content field can be string or array (both supported)
- Unknown content types are preserved as-is

---

### Virtual Scroll Rendering

```plantuml
@startuml Virtual Scroll
!theme plain
skinparam backgroundColor #FFFFFF

start

:User scrolls message list;

:Virtual scroller detects scroll event;

:Calculate viewport dimensions:\n- Container height\n- Scroll offset\n- Item count;

if (Scroll direction?) then (down)
  :Increase visible range;\n(startIndex, endIndex);
else (up)
  :Decrease visible range;\n(startIndex, endIndex);
endif

:For each item in visible range;

if (Height known in cache?) then (yes)
  :Use cached height;
else (no)
  :Measure item height;

  if (Item contains tool result?) then (yes)
    :Estimate height:\nbase + (lines * lineHeight);
  else (no)
    :Estimate height:\nbase height (60px);
  endif

  :Cache height for item;
endif

:Calculate total scroll height:\nsum(all item heights);

:Calculate visible items:\nfilter(startIndex..endIndex);

:Render only visible items;

:Apply transform offset:\ntranslateY(sum(heights[0..startIndex]));

if (User at bottom?) then (yes)
  :Trigger infinite scroll;
  :Load next page of messages;
  :Append to list;
  :Update total height;
else (no)
  :Do nothing;
endif

:User sees updated list;

stop

note right
  Virtual scrolling benefits:
  - Only renders ~20 items
  - Smooth 60fps scrolling
  - Handles 1000+ messages
  - Dynamic height support
end note

@enduml
```

**Key Points:**
- Only visible items are rendered (performance)
- Heights are measured dynamically and cached
- Infinite scroll loads more messages automatically
- Transform offset maintains correct scroll position

---

### Search Index Building

```plantuml
@startuml Search Indexing
!theme plain
skinparam backgroundColor #FFFFFF

start

:User opens session;

:Messages loaded into store;

:Check if index exists for session;

if (Index exists?) then (yes)
  :Use existing index;
else (no)
  :Create new FlexSearch index;

  :Configure index:\n- tokenize: "forward"\n- threshold: 0\n- fields: [content, toolResult];

  :For each message in session;

  if (Message type?) then (user)
    :Extract text from content;
    :Add to index:\n{ id: uuid, content: text };
  else (assistant)
    :Extract text from content;

    if (Has tool_use?) then (yes)
      :Extract tool input/name;
      :Append to searchable text;
    endif

    if (Has thinking?) then (yes)
      if (User enabled "Search thinking"?) then (yes)
        :Extract thinking content;
        :Append to searchable text;
      endif
    endif

    :Add to index;
  else (system)
    :Extract text;
    :Add to index;
  endif

  if (Has toolUseResult?) then (yes)
    if (User enabled "Search tool results"?) then (yes)
      :Extract tool result content:\n- stdout/stderr\n- file content\n- error messages;
      :Add to index as separate document;
    endif
  endif

  :Next message;

  :Index complete;
  :Cache index in store;
endif

:Index ready for search;

stop

note right
  FlexSearch indexing:
  - ~10ms for 100 messages
  - ~100ms for 1000 messages
  - Index stored in memory
  - Rebuilt on session switch
end note

@enduml
```

**Key Points:**
- Index is built once per session
- Includes user preference filters (thinking, tool results)
- Separate documents for messages and tool results
- Fast indexing (~100ms for 1000 messages)

---

### Message Tree Flattening

```plantuml
@startuml Message Tree Flattening
!theme plain
skinparam backgroundColor #FFFFFF

start

:Receive Vec<ClaudeMessage> from parser;

:Initialize tree structure:\nMap<uuid, Message>;

:For each message;

:Add to map: tree[message.uuid] = message;

if (Has parentUuid?) then (yes)
  :Find parent in map;

  if (Parent exists?) then (yes)
    :Add to parent.children[];
    :Set message.depth = parent.depth + 1;
  else (no)
    :Set as orphan (depth = 0);
    :Log warning;
  endif
else (no)
  :Set as root message (depth = 0);
endif

:Next message;

:Tree built;

:Flatten tree for rendering;

:Initialize empty flatList[];

:DFS traversal from root messages;

partition "Depth-First Search" {
  :Visit message;
  :Add to flatList;
  :Set display metadata:\n- depth level\n- has children\n- is collapsed;

  if (Has children?) then (yes)
    :For each child (sorted by timestamp);
    :Recursively visit child;
  endif
}

:Return flatList;

:Virtual list renders flatList;

stop

note right
  Message tree example:

  Root (depth=0)
    ├─ Reply 1 (depth=1)
    │   └─ Reply 1.1 (depth=2)
    └─ Reply 2 (depth=1)
        └─ Sidechain (depth=2)
end note

note left
  Flattening preserves:
  - Parent-child relationships
  - Depth for indentation
  - Chronological order
  - Collapse/expand state
end note

@enduml
```

**Key Points:**
- Tree structure preserved but flattened for virtual list
- Depth stored for visual indentation
- DFS ensures correct ordering
- Orphan messages handled gracefully

---

### Tauri IPC Communication

```plantuml
@startuml Tauri IPC
!theme plain
skinparam backgroundColor #FFFFFF

start

:React component calls invoke();

:Serialize parameters to JSON:\ninvoke('command_name', { param1, param2 });

:Send IPC message to Rust;

partition "Rust Backend" {
  :Tauri receives IPC message;

  :Deserialize parameters using serde;

  if (Command exists?) then (yes)
    if (Parameters valid?) then (yes)
      :Execute command function;

      if (Command succeeds?) then (yes)
        :Serialize result to JSON;
        :Return Ok(result);
      else (no)
        :Capture error;
        :Convert to String;
        :Return Err(error_message);
      endif
    else (no)
      :Return Err("Invalid parameters");
    endif
  else (no)
    :Return Err("Command not found");
  endif
}

:Send result back to React via IPC;

:Deserialize result in React;

if (Result is Ok?) then (yes)
  :Update Zustand store with data;
  :Trigger UI re-render;
  :User sees updated content;
else (no)
  :Display error toast/notification;
  :Log error to console;
  :User sees error message;
endif

stop

note right
  IPC message format:
  {
    cmd: "command_name",
    params: { ... },
    callback: fn_id
  }
end note

note left
  Error handling:
  - Rust: Result<T, String>
  - React: try/catch on invoke()
  - Always show user feedback
end note

@enduml
```

**Key Points:**
- All communication is async (Promise-based)
- Serialization/deserialization handled by Tauri
- Errors are always strings (Rust → React)
- No HTTP involved - direct function calls via IPC

---

## Level 4: Class Diagrams

### Zustand Store Structure

```plantuml
@startuml Zustand Store
!theme plain
skinparam backgroundColor #FFFFFF
skinparam classAttributeIconSize 0

package "Zustand Store (src/store/)" {

  class AppStore {
    + projects: ProjectInfo[]
    + messages: ClaudeMessage[]
    + searchQuery: string
    + analytics: AnalyticsData
    + settings: Settings
    --
    + setProjects(projects: ProjectInfo[])
    + selectProject(id: string)
    + loadMessages(sessionId: string)
    + setSearchQuery(query: string)
  }

  class ProjectSlice {
    + projects: ProjectInfo[]
    + selectedProject: string | null
    + loading: boolean
    --
    + setProjects(projects: ProjectInfo[])
    + selectProject(id: string)
    + refreshProjects()
  }

  class MessageSlice {
    + messages: ClaudeMessage[]
    + activeMessage: string | null
    + pagination: PaginationState
    + loading: boolean
    --
    + loadMessages(sessionId: string, offset: number, limit: number)
    + appendMessages(messages: ClaudeMessage[])
    + setActiveMessage(uuid: string)
    + clearMessages()
  }

  class SearchSlice {
    + query: string
    + results: SearchResult[]
    + filters: SearchFilters
    + index: FlexSearch.Index
    --
    + setQuery(query: string)
    + applyFilters(filters: SearchFilters)
    + buildIndex(messages: ClaudeMessage[])
    + search(query: string): SearchResult[]
  }

  class AnalyticsSlice {
    + data: AnalyticsData | null
    + cache: { timestamp: number, data: AnalyticsData } | null
    --
    + calculateAnalytics(): AnalyticsData
    + invalidateCache()
    + getTokenStats(): TokenStats
  }

  class SettingsSlice {
    + theme: 'light' | 'dark'
    + showThinking: boolean
    + searchInToolResults: boolean
    + language: string
    --
    + setTheme(theme: string)
    + toggleShowThinking()
    + setLanguage(lang: string)
  }

  class MetadataSlice {
    + hiddenProjects: Set<string>
    + customSessionNames: Map<string, string>
    --
    + hideProject(id: string)
    + unhideProject(id: string)
    + setSessionName(id: string, name: string)
  }

  class FilterSlice {
    + contentTypes: Set<ContentType>
    + dateRange: DateRange | null
    --
    + toggleContentType(type: ContentType)
    + setDateRange(range: DateRange)
    + clearFilters()
  }

  class NavigationSlice {
    + history: string[]
    + historyIndex: number
    --
    + pushHistory(sessionId: string)
    + goBack()
    + goForward()
    + canGoBack(): boolean
    + canGoForward(): boolean
  }

  AppStore *-- ProjectSlice
  AppStore *-- MessageSlice
  AppStore *-- SearchSlice
  AppStore *-- AnalyticsSlice
  AppStore *-- SettingsSlice
  AppStore *-- MetadataSlice
  AppStore *-- FilterSlice
  AppStore *-- NavigationSlice
}

note right of AppStore
  Store created with:
  create<AppStore>()(
    (...slices) => ({
      ...projectSlice(...slices),
      ...messageSlice(...slices),
      ...searchSlice(...slices),
      // etc.
    })
  )
end note

note bottom of SearchSlice
  FlexSearch index config:
  {
    tokenize: "forward",
    threshold: 0,
    depth: 3,
    async: false
  }
end note

@enduml
```

**Key Points:**
- All slices combined into single store (AppStore)
- Each slice manages a specific domain
- Slices can access other slices via parameters
- Store persists to localStorage for settings/metadata

---

### Tauri Command Architecture

```plantuml
@startuml Tauri Commands
!theme plain
skinparam backgroundColor #FFFFFF
skinparam classAttributeIconSize 0

package "Tauri Commands (src-tauri/src/commands/)" {

  class ProjectCommands {
    + scan_projects(claude_dir: String): Result<Vec<ProjectInfo>, String>
    + refresh_project(project_id: String): Result<ProjectInfo, String>
  }

  package "session/" {
    class SessionCommands {
      + load_session(path: String, offset: usize, limit: usize): Result<SessionData, String>
      + search_session(path: String, query: String): Result<Vec<SearchResult>, String>
      + rename_session(path: String, new_name: String): Result<(), String>
    }

    class EditTracker {
      + track_edits(messages: Vec<ClaudeMessage>): Vec<FileEdit>
      + get_recent_edits(sessions: Vec<String>): Result<Vec<FileEdit>, String>
    }
  }

  class StatsCommands {
    + calculate_stats(messages: Vec<ClaudeMessage>): TokenStats
    + get_session_stats(session_id: String): Result<SessionStats, String>
  }

  class MetadataCommands {
    + load_metadata(): Result<UserMetadata, String>
    + save_metadata(data: UserMetadata): Result<(), String>
    + hide_project(project_id: String): Result<(), String>
    + set_custom_name(session_id: String, name: String): Result<(), String>
  }

  class SettingsCommands {
    + load_settings(): Result<Settings, String>
    + save_settings(settings: Settings): Result<(), String>
    + reset_to_defaults(): Result<Settings, String>
  }

  class WatcherCommands {
    + start_watching(path: String): Result<(), String>
    + stop_watching(): Result<(), String>
  }

  class FeedbackCommands {
    + collect_system_info(): SystemInfo
    + generate_bug_report(description: String): Result<String, String>
  }

  class FsUtilsCommands {
    + read_file_safe(path: String): Result<String, String>
    + write_file_atomic(path: String, content: String): Result<(), String>
  }
}

ProjectCommands ..> FsUtilsCommands : uses
SessionCommands ..> FsUtilsCommands : uses
MetadataCommands ..> FsUtilsCommands : uses
SettingsCommands ..> FsUtilsCommands : uses
SessionCommands --> EditTracker : uses

note right of ProjectCommands
  Returns project list with:
  - Project name
  - Session count
  - Worktree info
  - Last activity timestamp
end note

note right of SessionCommands
  Pagination:
  - offset: starting index
  - limit: max messages (100)
  - Returns: messages + hasMore flag
end note

note bottom of FsUtilsCommands
  Atomic write pattern:
  1. Write to temp file
  2. Verify write success
  3. Rename temp → target
  (Prevents corruption)
end note

@enduml
```

**Key Points:**
- Commands organized by domain (project, session, stats, etc.)
- All commands return `Result<T, String>` for error handling
- FsUtils provides safe file operations used by other commands
- Commands are exposed via `#[tauri::command]` macro

---

### React Component Hierarchy

```plantuml
@startuml Component Hierarchy
!theme plain
skinparam backgroundColor #FFFFFF
skinparam componentStyle rectangle

package "React Components (src/components/)" {

  component "App" {
    [Layout]
  }

  component "Layout" {
    [Sidebar]
    [MainContent]
  }

  component "Sidebar" {
    [ProjectTree]
    [SearchBar]
    [SearchResults]
  }

  component "MainContent" {
    [MessageViewer]
    [AnalyticsDashboard]
    [SettingsPanel]
  }

  component "ProjectTree" {
    [ProjectNode]
    [SessionNode]
  }

  component "MessageViewer" {
    [VirtualList]
    [MessageItem]
    [MessageNavigator]
  }

  component "MessageItem" {
    [MessageHeader]
    [ContentArray]
    [ToolUseDisplay]
    [ToolResultDisplay]
  }

  component "ContentArray" {
    [TextRenderer]
    [ToolUseRenderer]
    [ThinkingRenderer]
    [ImageRenderer]
    [CitationRenderer]
  }

  component "AnalyticsDashboard" {
    [TokenChart]
    [TimelineChart]
    [ToolUsageChart]
  }

  [App] --> [Layout]
  [Layout] --> [Sidebar]
  [Layout] --> [MainContent]
  [Sidebar] --> [ProjectTree]
  [Sidebar] --> [SearchBar]
  [Sidebar] --> [SearchResults]
  [MainContent] --> [MessageViewer]
  [MainContent] --> [AnalyticsDashboard]
  [MainContent] --> [SettingsPanel]
  [ProjectTree] --> [ProjectNode]
  [ProjectTree] --> [SessionNode]
  [MessageViewer] --> [VirtualList]
  [MessageViewer] --> [MessageNavigator]
  [VirtualList] --> [MessageItem]
  [MessageItem] --> [MessageHeader]
  [MessageItem] --> [ContentArray]
  [MessageItem] --> [ToolUseDisplay]
  [MessageItem] --> [ToolResultDisplay]
  [ContentArray] --> [TextRenderer]
  [ContentArray] --> [ToolUseRenderer]
  [ContentArray] --> [ThinkingRenderer]
  [ContentArray] --> [ImageRenderer]
  [ContentArray] --> [CitationRenderer]
  [AnalyticsDashboard] --> [TokenChart]
  [AnalyticsDashboard] --> [TimelineChart]
  [AnalyticsDashboard] --> [ToolUsageChart]
}

note right of MessageItem
  Memoized component
  to prevent unnecessary
  re-renders
end note

note right of VirtualList
  Uses @tanstack/react-virtual
  for efficient rendering
  (only visible items)
end note

note bottom of ContentArray
  Dynamically renders
  based on content type:
  - text → TextRenderer
  - tool_use → ToolUseRenderer
  - thinking → ThinkingRenderer
  - etc.
end note

@enduml
```

**Key Points:**
- Layout uses sidebar + main content pattern
- Virtual scrolling in MessageViewer for performance
- Content renderers are dynamically selected by type
- Components are memoized where appropriate
- Charts use recharts library

---

### Message Type Hierarchy

```plantuml
@startuml Message Types
!theme plain
skinparam backgroundColor #FFFFFF
skinparam classAttributeIconSize 0

interface ClaudeMessage {
  + uuid: string
  + parentUuid?: string
  + sessionId: string
  + timestamp: string
  + type: MessageType
  + message: MessageContent
  + toolUse?: ToolUse
  + toolUseResult?: ToolUseResult
  + isSidechain: boolean
}

enum MessageType {
  USER
  ASSISTANT
  SYSTEM
  SUMMARY
}

class MessageContent {
  + role: "user" | "assistant" | "system"
  + content: string | ContentItem[]
  + id?: string
  + model?: string
  + stop_reason?: string
  + usage?: UsageInfo
}

interface ContentItem {
  + type: ContentType
}

enum ContentType {
  TEXT
  TOOL_USE
  TOOL_RESULT
  THINKING
  REDACTED_THINKING
  IMAGE
  SERVER_TOOL_USE
  WEB_SEARCH_TOOL_RESULT
  DOCUMENT
  SEARCH_RESULT
  MCP_TOOL_USE
  MCP_TOOL_RESULT
  WEB_FETCH_TOOL_RESULT
  CODE_EXECUTION_TOOL_RESULT
  BASH_CODE_EXECUTION_TOOL_RESULT
  TEXT_EDITOR_CODE_EXECUTION_TOOL_RESULT
  TOOL_SEARCH_TOOL_RESULT
}

class TextContent {
  + type: "text"
  + text: string
}

class ToolUseContent {
  + type: "tool_use"
  + id: string
  + name: string
  + input: Record<string, any>
}

class ToolResultContent {
  + type: "tool_result"
  + tool_use_id: string
  + content: string
  + is_error?: boolean
}

class ThinkingContent {
  + type: "thinking"
  + thinking: string
  + signature?: string
}

class ImageContent {
  + type: "image"
  + source: { type: "base64" | "url", data: string }
}

class UsageInfo {
  + input_tokens: number
  + output_tokens: number
  + cache_creation_input_tokens?: number
  + cache_read_input_tokens?: number
  + service_tier?: string
}

class ToolUse {
  + name: string
  + input: Record<string, any>
}

class ToolUseResult {
  + type?: "text"
  + stdout?: string
  + stderr?: string
  + file?: FileContent
  + edits?: Edit[]
  + oldTodos?: Todo[]
  + newTodos?: Todo[]
}

class FileContent {
  + filePath: string
  + content: string
  + numLines: number
  + startLine: number
  + totalLines: number
}

ClaudeMessage --> MessageType
ClaudeMessage --> MessageContent
ClaudeMessage --> ToolUse
ClaudeMessage --> ToolUseResult

MessageContent --> ContentItem
MessageContent --> UsageInfo

ContentItem <|-- TextContent
ContentItem <|-- ToolUseContent
ContentItem <|-- ToolResultContent
ContentItem <|-- ThinkingContent
ContentItem <|-- ImageContent

ContentItem --> ContentType

ToolUseResult --> FileContent

note right of ClaudeMessage
  Root message type
  parsed from JSONL
end note

note right of ContentItem
  Union type for all
  content variants
end note

note bottom of ContentType
  All content types from
  Claude API 2025 including
  beta features
end note

@enduml
```

**Key Points:**
- `ClaudeMessage` is the root type for all messages
- `ContentItem` is a union type supporting 15+ content types
- Tool use and results are separate fields (not in content array)
- Usage info tracks token consumption and caching
- Type system matches Claude API 2025 specification

---

## Reference

### Tauri Commands Reference

| Command | Module | Parameters | Returns | Purpose |
|---------|--------|------------|---------|---------|
| `scan_projects` | `project.rs` | `claude_dir: String` | `Vec<ProjectInfo>` | Scan ~/.claude directory for projects |
| `load_session` | `session/` | `path: String, offset: usize, limit: usize` | `SessionData` | Load messages from JSONL file (paginated) |
| `search_session` | `session/` | `path: String, query: String` | `Vec<SearchResult>` | Search within a session (backend search) |
| `rename_session` | `session/` | `path: String, new_name: String` | `()` | Rename a session file |
| `calculate_stats` | `stats.rs` | `messages: Vec<ClaudeMessage>` | `TokenStats` | Calculate token statistics |
| `get_session_stats` | `stats.rs` | `session_id: String` | `SessionStats` | Get stats for a specific session |
| `load_metadata` | `metadata.rs` | - | `UserMetadata` | Load user metadata (hidden projects, custom names) |
| `save_metadata` | `metadata.rs` | `data: UserMetadata` | `()` | Save user metadata to disk |
| `hide_project` | `metadata.rs` | `project_id: String` | `()` | Hide a project from view |
| `set_custom_name` | `metadata.rs` | `session_id: String, name: String` | `()` | Set custom session name |
| `load_settings` | `settings.rs` | - | `Settings` | Load app settings |
| `save_settings` | `settings.rs` | `settings: Settings` | `()` | Save app settings |
| `reset_to_defaults` | `settings.rs` | - | `Settings` | Reset settings to defaults |
| `start_watching` | `watcher.rs` | `path: String` | `()` | Start file system watcher |
| `stop_watching` | `watcher.rs` | - | `()` | Stop file system watcher |
| `collect_system_info` | `feedback.rs` | - | `SystemInfo` | Collect system info for bug reports |
| `generate_bug_report` | `feedback.rs` | `description: String` | `String` | Generate formatted bug report |
| `get_recent_edits` | `session/` | `sessions: Vec<String>` | `Vec<FileEdit>` | Get recent file edits across sessions |
| `read_file_safe` | `fs_utils.rs` | `path: String` | `String` | Read file with error handling |
| `write_file_atomic` | `fs_utils.rs` | `path: String, content: String` | `()` | Write file atomically (temp + rename) |

**Error Handling Pattern:**
All commands return `Result<T, String>` where:
- `Ok(data)` → Success
- `Err(message)` → Error message as string

**Usage in React:**
```typescript
import { invoke } from '@tauri-apps/api/core';

try {
  const projects = await invoke<ProjectInfo[]>('scan_projects', {
    claudeDir: '~/.claude'
  });
  // Handle success
} catch (error) {
  console.error('Error scanning projects:', error);
  // Show user-friendly error
}
```

---

### Store Slices Reference

| Slice | State Keys | Actions | Purpose |
|-------|------------|---------|---------|
| **projectSlice** | `projects: ProjectInfo[]`<br>`selectedProject: string \| null`<br>`loading: boolean` | `setProjects(projects)`<br>`selectProject(id)`<br>`refreshProjects()`<br>`clearProjects()` | Manage project list and selection |
| **messageSlice** | `messages: ClaudeMessage[]`<br>`activeMessage: string \| null`<br>`pagination: PaginationState`<br>`loading: boolean` | `loadMessages(sessionId, offset, limit)`<br>`appendMessages(messages)`<br>`setActiveMessage(uuid)`<br>`clearMessages()`<br>`loadMoreMessages()` | Message data and pagination |
| **searchSlice** | `query: string`<br>`results: SearchResult[]`<br>`filters: SearchFilters`<br>`index: FlexSearch.Index` | `setQuery(query)`<br>`applyFilters(filters)`<br>`buildIndex(messages)`<br>`search(query)`<br>`clearSearch()` | Full-text search with FlexSearch |
| **analyticsSlice** | `data: AnalyticsData \| null`<br>`cache: CacheEntry \| null` | `calculateAnalytics()`<br>`invalidateCache()`<br>`getTokenStats()`<br>`getCostEstimate()` | Token usage and analytics |
| **settingsSlice** | `theme: 'light' \| 'dark'`<br>`showThinking: boolean`<br>`searchInToolResults: boolean`<br>`language: string` | `setTheme(theme)`<br>`toggleShowThinking()`<br>`toggleSearchToolResults()`<br>`setLanguage(lang)` | App settings and preferences |
| **metadataSlice** | `hiddenProjects: Set<string>`<br>`customSessionNames: Map<string, string>` | `hideProject(id)`<br>`unhideProject(id)`<br>`setSessionName(id, name)`<br>`clearMetadata()` | User metadata (hidden/renamed items) |
| **filterSlice** | `contentTypes: Set<ContentType>`<br>`dateRange: DateRange \| null` | `toggleContentType(type)`<br>`setDateRange(range)`<br>`clearFilters()`<br>`applyFilters()` | Message filtering |
| **navigationSlice** | `history: string[]`<br>`historyIndex: number` | `pushHistory(sessionId)`<br>`goBack()`<br>`goForward()`<br>`canGoBack()`<br>`canGoForward()` | Navigation history (back/forward) |
| **boardSlice** | `selectedSessions: Set<string>`<br>`layout: BoardLayout` | `toggleSession(id)`<br>`clearSelection()`<br>`setLayout(layout)` | Multi-session board view |

**Store Usage:**
```typescript
import { useAppStore } from '@/store/useAppStore';

function MyComponent() {
  const projects = useAppStore(state => state.projects);
  const setProjects = useAppStore(state => state.setProjects);

  // Use state and actions
}
```

---

### Key Files Map

#### Frontend (src/)

| Path | Purpose |
|------|---------|
| `src/components/ProjectTree.tsx` | Project/session tree in sidebar |
| `src/components/MessageViewer/` | Virtual scrolling message list |
| `src/components/AnalyticsDashboard/` | Token stats and charts |
| `src/components/SessionBoard/` | Multi-session comparison view |
| `src/components/MessageNavigator/` | TOC navigation for conversations |
| `src/components/renderers/` | Content type renderers (text, tool use, thinking, etc.) |
| `src/store/useAppStore.ts` | Zustand store (all slices combined) |
| `src/hooks/useGitHubUpdater.ts` | GitHub API integration for updates |
| `src/hooks/useSmartUpdater.ts` | Smart update logic (skip/postpone) |
| `src/i18n/` | Internationalization (5 languages) |
| `src/types/index.ts` | TypeScript type definitions |
| `src/utils/messageAdapter.ts` | Adapt raw messages to UI format |
| `src/utils/jsonUtils.ts` | JSON parsing utilities |

#### Backend (src-tauri/src/)

| Path | Purpose |
|------|---------|
| `src-tauri/src/main.rs` | Tauri app entry point |
| `src-tauri/src/commands/project.rs` | Project scanning and Git log |
| `src-tauri/src/commands/session/` | Session loading, pagination, search |
| `src-tauri/src/commands/stats.rs` | Token statistics calculation |
| `src-tauri/src/commands/metadata.rs` | User metadata (hidden projects, custom names) |
| `src-tauri/src/commands/settings.rs` | Settings preset management |
| `src-tauri/src/commands/watcher.rs` | File system watching |
| `src-tauri/src/commands/feedback.rs` | Bug reporting and system info |
| `src-tauri/src/commands/fs_utils.rs` | Safe file operations |
| `src-tauri/src/models/message.rs` | Message structs matching JSONL |
| `src-tauri/src/models/session.rs` | Session metadata |
| `src-tauri/src/models/stats.rs` | Statistics structures |
| `src-tauri/src/models/edit.rs` | File edit tracking |

#### Configuration

| Path | Purpose |
|------|---------|
| `flake.nix` | Nix development environment |
| `justfile` | Task runner commands |
| `package.json` | Node dependencies (source of truth for version) |
| `src-tauri/Cargo.toml` | Rust dependencies |
| `src-tauri/tauri.conf.json` | Tauri app configuration |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |

---

### Message Type Reference

#### Core Message Types

| Type | When Used | Structure Example |
|------|-----------|-------------------|
| **user** | User input messages | `{ type: "user", message: { role: "user", content: "..." } }` |
| **assistant** | Claude's responses | `{ type: "assistant", message: { role: "assistant", content: [...], usage: {...} } }` |
| **system** | System messages (init, errors) | `{ type: "system", message: { role: "system", content: "..." } }` |
| **summary** | Conversation summaries | `{ type: "summary", summary: "...", leafUuid: "..." }` |

#### Content Item Types

| Type | Purpose | Example |
|------|---------|---------|
| **text** | Plain text content | `{ type: "text", text: "Hello world" }` |
| **tool_use** | Tool invocation | `{ type: "tool_use", id: "toolu_...", name: "Read", input: {...} }` |
| **tool_result** | Tool execution result | `{ type: "tool_result", tool_use_id: "toolu_...", content: "..." }` |
| **thinking** | Claude's reasoning | `{ type: "thinking", thinking: "...", signature: "..." }` |
| **redacted_thinking** | Encrypted thinking (safety) | `{ type: "redacted_thinking", signature: "..." }` |
| **image** | Image content | `{ type: "image", source: { type: "base64", data: "..." } }` |
| **server_tool_use** | Server-side tool (web_search) | `{ type: "server_tool_use", name: "web_search", input: {...} }` |
| **web_search_tool_result** | Web search results | `{ type: "web_search_tool_result", content: "...", results: [...] }` |
| **document** | PDF/text documents | `{ type: "document", source: {...}, title: "..." }` |
| **search_result** | Search result items | `{ type: "search_result", url: "...", title: "...", content: "..." }` |
| **mcp_tool_use** | MCP tool invocation | `{ type: "mcp_tool_use", id: "...", server: "...", tool: "..." }` |
| **mcp_tool_result** | MCP tool result | `{ type: "mcp_tool_result", tool_use_id: "...", content: {...} }` |

#### Beta Content Types (2025)

| Type | Beta Feature | Purpose |
|------|--------------|---------|
| **web_fetch_tool_result** | web-fetch-2025-09-10 | Full page/PDF content retrieval |
| **code_execution_tool_result** | code-execution-2025-08-25 | Legacy Python code execution |
| **bash_code_execution_tool_result** | code-execution-2025-08-25 | Bash command execution |
| **text_editor_code_execution_tool_result** | code-execution-2025-08-25 | File operations (view/create/edit/delete) |
| **tool_search_tool_result** | mcp-client-2025-11-20 | MCP tool discovery results |

#### Tool Use Result Structures

| Tool | Result Structure |
|------|------------------|
| **Read** | `{ file: { filePath, content, numLines, startLine, totalLines } }` |
| **Write** | `{ filePath, content }` |
| **Edit** | `{ filePath, edits: [{ old_string, new_string, replace_all }], originalFileContents }` |
| **Bash** | `{ stdout, stderr, interrupted, isImage }` |
| **TodoWrite** | `{ oldTodos: [...], newTodos: [...] }` |
| **Error** | `{ content: "Error: ...", is_error: true }` |

---

**End of Architecture Documentation**

For quick lookup: [CCHV_API_REFERENCE.md](CCHV_API_REFERENCE.md)
For getting started: [CCHV_GETTING_STARTED.md](CCHV_GETTING_STARTED.md)
For high-level overview: [CCHV_TLDR.md](CCHV_TLDR.md)
