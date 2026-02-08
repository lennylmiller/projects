# MCP Server Testing Guide

How to verify each MCP server is working. Uses `~/code/mcp-test-app` as a test project where applicable.

## Quick Status Check

```bash
claude mcp list
```

All servers should show `✓ Connected`. If any show `✗ Failed`, restart Claude Code and try again.

---

## 1. Context7 — Library Documentation Lookup

**What it does:** Fetches up-to-date docs and code examples for any library.

**Test it:** In Claude Code, ask:

```
Using Context7, look up the TypeScript documentation for the Map.prototype.entries() method
```

**Expected:** Claude uses `mcp__context7__resolve-library-id` and `mcp__context7__query-docs` tools, returns current documentation with code examples.

**Bonus test:**

```
Using Context7, show me how to use zod for schema validation with examples
```

---

## 2. Sequential-Thinking — Multi-Step Reasoning

**What it does:** Breaks complex problems into numbered reasoning steps. Shows its work.

**Test it:**

```
Use sequential thinking to analyze the trade-offs between these three approaches
for adding caching to a REST API: Redis, in-memory Map, and SQLite
```

**Expected:** Claude uses `mcp__sequential-thinking__sequentialthinking` with numbered thoughts, revisions, and a final recommendation. You should see multiple thought steps in the output.

**Bonus test (with test project):**

```
cd ~/code/mcp-test-app
Use sequential thinking to design a search/filter system for the TaskService class
```

---

## 3. Playwright — Browser Automation

**What it does:** Controls a browser — navigate, click, fill forms, take screenshots.

**Test it:**

```
Use Playwright to navigate to https://example.com and take a screenshot
```

**Expected:** Claude uses `mcp__playwright__browser_navigate` and `mcp__playwright__browser_take_screenshot`, shows you a screenshot of example.com.

**Bonus test:**

```
Use Playwright to:
1. Go to https://news.ycombinator.com
2. Take a snapshot of the page
3. Tell me the top 3 headlines
```

---

## 4. Serena — Semantic Code Understanding

**What it does:** Understands code structure — finds symbols, references, class hierarchies. Much smarter than grep.

**Test it (run from `~/code/mcp-test-app`):**

```
cd ~/code/mcp-test-app
Use Serena to:
1. Get a symbols overview of src/task-service.ts
2. Find all methods in the TaskService class
3. Find all references to the getHighPriorityTasks method
```

**Expected:** Claude uses `mcp__serena__get_symbols_overview`, `mcp__serena__find_symbol`, and `mcp__serena__find_referencing_symbols`. Returns structured info about classes, methods, and where they're called.

**Bonus test:**

```
Use Serena to search for all uses of the Task interface across the project
```

> **Note:** Serena needs a project activated first. If it fails, Claude should call `mcp__serena__activate_project` with the project path.

---

## 5. Chrome DevTools — Browser Debugging

**What it does:** Connects to Chrome's DevTools protocol for performance analysis, network inspection, and debugging.

**Prerequisites:** Chrome must be running with remote debugging enabled:

```bash
# macOS — launch Chrome with debugging port
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Test it:**

```
Use Chrome DevTools to list the available browser targets
```

**Expected:** Returns a list of open tabs/targets from your Chrome instance.

**If it fails:** The `chrome-devtools` server needs Chrome running with `--remote-debugging-port=9222`. This is the most finicky server — it's normal for it to show `✗ Failed` if Chrome isn't set up for debugging.

---

## 6. Tavily — Web Search & Research

**What it does:** Searches the web, extracts content from URLs, performs deep research.

**Test it:**

```
Use Tavily to search for "TypeScript 5.7 new features" and summarize the results
```

**Expected:** Claude uses `mcp__claude_ai_tavily-remote-mcp__tavily_search` and returns search results with snippets and source URLs.

**Bonus tests:**

```
# Extract content from a URL
Use Tavily to extract the content from https://www.typescriptlang.org/docs/handbook/2/types-from-types.html

# Deep research
Use Tavily to research the current state of TypeScript decorators in 2025
```

---

## 7. Magic (21st.dev) — UI Component Generation

**What it does:** Generates modern React UI components using 21st.dev's component library.

**Test it:**

```
Use Magic to generate a task card component that shows title, status badge, priority, and assignee
```

**Expected:** Claude uses `mcp__magic__21st_magic_component_builder` and returns a React component with modern styling (usually Tailwind).

**Bonus test:**

```
Use Magic to search for inspiration for a kanban board component
```

> **Note:** Requires the `API_KEY` env var to be set (already configured).

---

## 8. Morphllm Fast Apply — Bulk Code Transformations

**What it does:** Applies code diffs efficiently — faster than rewriting entire files.

**Test it (run from `~/code/mcp-test-app`):**

```
cd ~/code/mcp-test-app
Use Morph to add JSDoc comments to every method in src/task-service.ts
```

**Expected:** Claude generates a diff and uses Morphllm to apply it, rather than rewriting the entire file.

> **Note:** Morph is an optimization layer — Claude may or may not choose to use it depending on the size of the change. It's most visible on larger refactors.

---

## All-in-One Smoke Test

Run this from `~/code/mcp-test-app` to hit multiple servers in one session:

```
I want to verify my MCP servers work. Please do each of these steps:

1. [Context7] Look up the Node.js docs for the EventEmitter class
2. [Sequential-Thinking] Think through how to add an event system to the TaskService
3. [Serena] Show me the current structure of src/task-service.ts
4. [Tavily] Search for "TypeScript event emitter patterns 2025"
5. [Playwright] Navigate to https://example.com and take a screenshot

Report which MCP servers responded successfully.
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Server shows `✗ Failed` | Restart Claude Code (`/exit` then `claude`) |
| `npx` servers slow to start | First run downloads packages — wait 30s |
| Serena can't find symbols | Activate project first: ask Claude to "activate project ~/code/mcp-test-app in Serena" |
| Chrome DevTools won't connect | Launch Chrome with `--remote-debugging-port=9222` |
| Magic returns auth error | Check `API_KEY` is set in `~/.claude.json` under the `magic` entry |
| Morphllm returns auth error | Check `MORPH_API_KEY` is set in `~/.claude.json` under the `morphllm-fast-apply` entry |

## Test Project Structure

```
~/code/mcp-test-app/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # Entry point — creates sample data, runs demo
    ├── models.ts         # User, Task, Project interfaces
    ├── task-service.ts   # TaskService class with CRUD + query methods
    └── utils.ts          # Helper functions (createTask, slugify, etc.)
```

Run it: `cd ~/code/mcp-test-app && npm start`
