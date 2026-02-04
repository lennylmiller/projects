# WEB-4723 Diagrams

This folder contains sequence diagrams documenting the conversation close/archive flows.

## Files

| File | Description |
|------|-------------|
| `current-flow-diagrams.md` | PlantUML diagrams showing current close/load behavior |
| `current-close-conversation-flow-mermaid.md` | Mermaid diagrams (same content, GitHub/GitLab compatible) |

## Current State (Before WEB-4723)

### 1. Close Conversation Flow
Shows the current flow when a user closes a conversation:
- User clicks "Close conversation" in the info modal
- Frontend calls POST /archive endpoint
- Controller removes conversation from the messages collection
- Conversation disappears from the list entirely
- Direct URL access fails silently (shows inbox instead)

### 2. Load Conversations Flow
Shows how conversations are loaded from the API:
- GET /conversations returns only non-archived conversations
- No `status` or `closed` field in the response
- Archived conversations are completely excluded
- User has no access to closed conversation history

## Viewing the Diagrams

The diagrams are embedded in markdown files using PlantUML code blocks.

### VS Code
Install one of these extensions to render PlantUML in markdown previews:
- "Markdown Preview Enhanced" by Yiyi Wang
- "PlantUML" by jebbs

### PlantUML Online Server
1. Go to https://www.plantuml.com/plantuml/uml/
2. Copy the content between `@startuml` and `@enduml` from the markdown file
3. View the rendered diagram

---

*Last Updated: February 4, 2026*
