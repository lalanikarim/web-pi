# Pi RPC Protocol Knowledge Base
**For Frontend ↔ Backend WebSocket Integration**

---

## 1. Architecture Overview

```
┌──────────────┐       WebSocket        ┌────────────────┐       stdio        ┌─────────────┐
│  React UI    │ ── JSON text frames ──→ │  FastAPI backend│ ── JSON lines ──→ │ pi --mode rpc│
│  (browser)   │ ←── JSON text frames ── │  (uvicorn)      │ ←── JSON lines ── │  (process)   │
└──────────────┘                         └────────────────┘                   └─────────────┘
```

### How It Works

1. **Frontend** connects to `WebSocket: /api/projects/{project_name}/ws`
2. **Backend** launches `pi --mode rpc` as a subprocess (one per project)
3. **Backend** runs two concurrent tasks:
   - **Reader**: reads stdout lines → parses → forwards to WebSocket
   - **Writer**: receives WebSocket messages → wraps → writes to stdin
4. **Pi agent** processes commands and streams events back through stdout

---

## 2. Protocol Basics (from `pi --mode rpc`)

### Framing Rules
| Rule | Detail |
|------|--------|
| **Delimiter** | `\n` (LF only) — never `\r\n` or Unicode separators |
| **Read** | `stdout.readline()` and split on `\n` |
| **Write** | `stdin.write(json + b'\n')` + `drain()` |
| **JSON** | `json.dumps(obj, ensure_ascii=False)` |

### Message Types (identified by `type` field)

| `type` | Direction | Description |
|--------|-----------|-------------|
| `"prompt"` | Client → Agent | User chat message |
| `"steer"` | Client → Agent | Steering message (delivered after current turn) |
| `"follow_up"` | Client → Agent | Queue for next turn |
| `"abort"` | Client → Agent | Abort current operation |
| `"set_model"` | Client → Agent | Switch LLM model |
| `"get_available_models"` | Client → Agent | Query available models |
| `"get_state"` | Client → Agent | Query current session state |
| `"get_messages"` | Client → Agent | Query conversation history |
| `"get_session_stats"` | Client → Agent | Query token usage / cost |
| `"get_commands"` | Client → Agent | List available commands |
| `"set_thinking_level"` | Client → Agent | Set reasoning level |
| `"compact"` | Client → Agent | Manually compact conversation |
| `"new_session"` | Client → Agent | Start fresh session |
| `"set_session_name"` | Client → Agent | Rename session |
| `"bash"` | Client → Agent | Execute shell command |
| `"extension_ui_request"` | Agent → Client | Extension needs interactive input |
| `"extension_ui_response"` | Client → Agent | Reply to extension UI request |
| `"response"` | Agent → Client | Response to a previous command |

---

## 3. Frontend Message Format (via WebSocket)

The backend accepts these message shapes from the frontend. The `kind` field tells the backend how to handle the message.

### 3.1 Chat Message (text)

```json
{
  "kind": "chat",
  "message": "Explain this code"
}
```
Backend wraps as: `{"type": "prompt", "message": "...", "id": "<uuid>"}`

### 3.2 RPC Command (state queries)

```json
{
  "kind": "command",
  "type": "get_state"
}
```
```json
{
  "kind": "command",
  "type": "get_messages"
}
```
```json
{
  "kind": "command",
  "type": "get_available_models"
}
```
```json
{
  "kind": "command",
  "type": "set_model",
  "provider": "anthropic",
  "modelId": "claude-sonnet-4-20250514"
}
```
```json
{
  "kind": "command",
  "type": "set_thinking_level",
  "level": "high"
}
```
```json
{
  "kind": "command",
  "type": "compact",
  "customInstructions": "Summarize only code changes"
}
```
```json
{
  "kind": "command",
  "type": "get_session_stats"
}
```
```json
{
  "kind": "command",
  "type": "get_commands"
}
```
```json
{
  "kind": "command",
  "type": "new_session"
}
```
```json
{
  "kind": "command",
  "type": "set_session_name",
  "name": "My Work"
}
```
```json
{
  "kind": "command",
  "type": "abort"
}
```

### 3.3 Extension UI Response

```json
{
  "kind": "extension_ui_response",
  "type": "extension_ui_response",
  "id": "a-unique-uuid",
  "value": "selected-option",
  "cancelled": false
}
```

---

## 4. Backend → Frontend Message Format

The backend tags every outgoing message with a `kind` field so the frontend knows how to render it.

### 4.1 RPC Response (from `type: "response"`)

**Shape:**
```json
{
  "kind": "response",
  "type": "response",
  "id": "req-uuid-123",
  "command": "get_state",
  "success": true,
  "data": { ... }
}
```

**Key responses:**

#### `get_available_models`
```json
{
  "type": "response",
  "command": "get_available_models",
  "success": true,
  "data": {
    "models": [
      {
        "id": "claude-3-5-haiku-20241022",
        "name": "Claude Haiku 3.5",
        "api": "anthropic-messages",
        "provider": "anthropic",
        "baseUrl": "https://api.anthropic.com",
        "reasoning": false,
        "input": "text",
        "maxTokens": 8192,
        "contextWindow": 200000
      },
      ...
    ]
  }
}
```
⚠️ **Models are in `data.models`, NOT at the top level.** There may be 50-100 models.

#### `set_model`
```json
{
  "type": "response",
  "command": "set_model",
  "success": true,
  "data": {
    "id": "claude-sonnet-4-20250514",
    "name": "Claude Sonnet 4",
    "api": "anthropic-messages",
    "provider": "anthropic",
    "reasoning": true,
    "input": "text",
    "maxTokens": 16384,
    "contextWindow": 200000
  }
}
```

#### `get_state`
```json
{
  "type": "response",
  "command": "get_state",
  "success": true,
  "data": {
    "model": { "id": "claude-sonnet-4-20250514", "provider": "anthropic", ... },
    "thinkingLevel": "medium",
    "isStreaming": false,
    "isCompacting": false,
    "steeringMode": "one-at-a-time",
    "followUpMode": "one-at-a-time",
    "sessionFile": "/path/to/session.jsonl",
    "sessionId": "019d9c98-...",
    "autoCompactionEnabled": true,
    "messageCount": 42,
    "sessionName": "My Work"
  }
}
```

#### `get_messages`
```json
{
  "type": "response",
  "command": "get_messages",
  "success": true,
  "data": {
    "messages": [
      {
        "id": "01...",
        "role": "user",
        "content": "Explain this",
        "timestamp": "2026-04-17T..."
      },
      {
        "id": "02...",
        "role": "assistant",
        "content": "Here's the explanation...",
        "timestamp": "2026-04-17T..."
      }
    ]
  }
}
```

#### `get_session_stats`
```json
{
  "type": "response",
  "command": "get_session_stats",
  "success": true,
  "data": {
    "sessionFile": "/path/to/session.jsonl",
    "tokenUsage": { ... },
    "totalCost": 0.0012
  }
}
```

#### `get_commands`
```json
{
  "type": "response",
  "command": "get_commands",
  "success": true,
  "data": {
    "commands": [
      {
        "name": "fix-tests",
        "description": "Fix failing tests",
        "source": "prompt",
        "location": "project",
        "path": "/path/to/.pi/agent/prompts/fix-tests.md"
      },
      {
        "name": "skill:brave-search",
        "description": "Web search via Brave API",
        "source": "skill",
        "location": "user",
        "path": "/path/to/skills/brave-search/SKILL.md"
      }
    ]
  }
}
```
Commands can be invoked via prompt: `{"type": "prompt", "message": "/fix-tests"}`

#### `set_thinking_level`
```json
{
  "type": "response",
  "command": "set_thinking_level",
  "success": true
}
```

#### `set_session_name`
```json
{
  "type": "response",
  "command": "set_session_name",
  "success": true
}
```

### 4.2 Streaming Events (from `message_update`, `turn_start`, etc.)

**Shape:**
```json
{
  "kind": "rpc_event",
  "event": {
    "type": "message_update",
    "messageId": "msg-uuid",
    "role": "assistant",
    "delta": {
      "text_delta": "Here is the ",
      "thinking_delta": null,
      "toolcall_start": null,
      "toolcall_delta": null,
      "toolcall_end": null,
      "done": false
    }
  }
}
```

**Complete event taxonomy (observed in live testing):**

| Event | Payload | When Sent |
|-------|---------|-----------|
| `agent_start` | `{ "type": "agent_start", "message": "..." }` | Agent begins processing a prompt |
| `turn_start` | `{ "type": "turn_start" }` | Turn (assistant + tool calls) begins |
| `message_start` | `{ "type": "message_start", "role": "assistant", "messageId": "..." }` | New assistant message begins |
| `message_update` | `{ "type": "message_update", "role": "assistant", "delta": { "text_delta": "..." } }` | Text is streamed (sent every few chars) |
| `message_end` | `{ "type": "message_end", "messageId": "..." }` | Assistant message completes |
| `tool_execution_start` | `{ "type": "tool_execution_start", "toolCallId": "...", "toolName": "..." }` | Tool execution begins |
| `tool_execution_update` | `{ "type": "tool_execution_update", "toolCallId": "...", "output": "..." }` | Tool produces output |
| `tool_execution_end` | `{ "type": "tool_execution_end", "toolCallId": "...", "output": "..." }` | Tool execution completes |
| `turn_end` | `{ "type": "turn_end" }` | Turn completes (all tools done) |
| `agent_end` | `{ "type": "agent_end" }` | Agent finished entirely |
| `compaction_start` | `{ "type": "compaction_start" }` | Conversation compaction begins |
| `compaction_end` | `{ "type": "compaction_end", "summary": "...", "tokensBefore": 12345 }` | Compaction done |
| `auto_retry_start` | `{ "type": "auto_retry_start", "attempt": 1, "delay": 5 }` | Retry after error |
| `auto_retry_end` | `{ "type": "auto_retry_end", "success": true }` | Retry completed |
| `queue_update` | `{ "type": "queue_update", "steeringQueue": [...], "followUpQueue": [...] }` | Queues changed |

### 4.3 Extension UI Request

**Shape:**
```json
{
  "kind": "extension_ui_request",
  "type": "extension_ui_request",
  "id": "unique-uuid-123",
  "method": "select",
  "title": "Choose a file",
  "options": ["file1.txt", "file2.py"],
  "selected": "file1.txt"
}
```

**Interactive methods (frontend MUST respond):**

| Method | Frontend Needs | Response Shape |
|--------|---------------|----------------|
| `select` | Dropdown/list picker | `{"kind":"extension_ui_response","type":"extension_ui_response","id":"...","value":"selected-option","cancelled":false}` |
| `confirm` | Yes/No dialog | `{"kind":"extension_ui_response","type":"extension_ui_response","id":"...","value":true,"cancelled":false}` |
| `input` | Text input field | `{"kind":"extension_ui_response","type":"extension_ui_response","id":"...","value":"user-input","cancelled":false}` |
| `editor` | Text editor (temp file path provided) | `{"kind":"extension_ui_response","type":"extension_ui_response","id":"...","value":null,"cancelled":false}` |

⚠️ **CRITICAL: If the frontend does NOT respond to `extension_ui_request`, the agent STOPS processing** until a response is received. This is not optional — it blocks the entire stdout stream.

---

## 5. Request/Response Matching

### How IDs Work

1. **Client** sends a command with `"id": "<uuid>"` (or backend generates one)
2. **Agent** echoes the same `"id"` in the response
3. **Frontend** uses the `id` to correlate requests with responses

```
Client → { "type": "get_state", "id": "abc-123" }
Agent  → { "type": "response", "id": "abc-123", "command": "get_state", "data": { ... } }
```

⚠️ **Events do NOT have an `id`** — they are fire-and-forget streaming data. Only commands with `"type"` values that return a response have IDs.

### Commands That Return Responses (have `id`)
- `get_available_models`, `get_state`, `get_messages`, `get_session_stats`, `get_commands`
- `set_model`, `set_thinking_level`, `set_session_name`, `compact`, `new_session`
- `prompt` (returns immediately; streaming events follow separately)
- `bash`

### Commands That Do NOT Return Responses
- `steer`, `follow_up` (queued for later)

### Events (no `id`, streaming)
- `agent_start`, `turn_start`, `message_start`, `message_update`, `message_end`
- `turn_end`, `agent_end`, `tool_execution_*`, `compaction_*`, `auto_retry_*`

---

## 6. Extension UI Sub-Protocol

### Two Categories of Methods

| Category | Methods | Frontend Action |
|----------|---------|-----------------|
| **Interactive** | `select`, `confirm`, `input`, `editor` | **MUST respond** or agent blocks |
| **Fire-and-forget** | `notify`, `setStatus`, `setTitle`, `setFooter`, `setHeader`, `setWidget`, `setEditorComponent`, `setToolsExpanded`, `set_editor_text` | Backend auto-acks (no UI needed) |

### Auto-Ack Payload (for fire-and-forget)
```json
{
  "type": "extension_ui_response",
  "id": "<same-uuid-as-request>",
  "value": null,
  "cancelled": false
}
```

### How Extension UI Looks in Practice

The agent may request interactive input when extensions need user choices:
1. Agent sends `extension_ui_request` with method + options
2. Backend detects interactive method → forwards to frontend with `kind: "extension_ui_request"`
3. Frontend renders appropriate UI (dropdown, dialog, text input)
4. Frontend sends back `extension_ui_response` via WebSocket
5. Backend writes response to stdin → agent receives it → continues

---

## 7. Important Behavioral Observations

### 7.1 Extension Loading Delay (Warm-up Required)

When `pi --mode rpc` first starts, the **first 1-2 commands are slow** (30-60s) because Pi loads extensions (Ollama, Anthropic, etc.) before responding.

**Recommendation:** After establishing the WebSocket connection, immediately send a `get_session_stats` or `get_commands` command as a "warm-up" to trigger extension loading before the frontend sends user commands.

```javascript
// After WebSocket open:
ws.send(JSON.stringify({ kind: "command", type: "get_session_stats" }));
// Wait ~3s for warm-up to complete
```

### 7.2 Extension UI Request Response Blocking

The agent **waits on stdout** until every `extension_ui_request` receives a response. If the frontend doesn't respond within a timeout, the agent proceeds with a default/timeout value.

**For the frontend:** The `extension_ui_request` event should render a modal/dialog/inline prompt and send the response back ASAP.

### 7.3 Response Ordering

Responses may not arrive in the exact order commands were sent — the agent preserves order internally, but network transport (WebSocket) is reliable so this mainly affects the case where multiple commands are sent rapidly.

### 7.4 Prompt Command Response Pattern

```
Client → { "type": "prompt", "message": "Hello", "id": "uuid-1" }
Agent  → { "type": "response", "id": "uuid-1", "command": "prompt", "success": true }
Agent  → { "type": "agent_start", ... }       ← streaming events begin
Agent  → { "type": "turn_start", ... }
Agent  → { "type": "message_start", ... }
Agent  → { "type": "message_update", delta: { "text_delta": "H" } }
Agent  → { "type": "message_update", delta: { "text_delta": "e" } }
Agent  → ...
Agent  → { "type": "message_end", ... }
Agent  → { "type": "turn_end", ... }
Agent  → { "type": "agent_end", ... }
```

The immediate response confirms the prompt was accepted. The actual text arrives as streaming `message_update` events.

### 7.5 Model Data Shape

```json
{
  "data": {
    "models": [
      {
        "id": "claude-3-5-haiku-20241022",
        "name": "Claude Haiku 3.5",
        "api": "anthropic-messages",
        "provider": "anthropic",
        "baseUrl": "https://api.anthropic.com",
        "reasoning": false,
        "input": "text",
        "maxTokens": 8192,
        "contextWindow": 200000
      }
    ]
  }
}
```

⚠️ Models live under `data.models`, NOT at the top level. Use `data.models` when parsing.

### 7.6 State Data Shape

```json
{
  "data": {
    "model": { "id": "...", "provider": "...", ... },
    "thinkingLevel": "medium",
    "isStreaming": true,
    "isCompacting": false,
    "steeringMode": "one-at-a-time",
    "followUpMode": "one-at-a-time",
    "sessionFile": "/path/to/session.jsonl",
    "sessionId": "019d9c98-...",
    "autoCompactionEnabled": true,
    "messageCount": 42,
    "sessionName": "My Work"
  }
}
```

Watch `isStreaming` to know when the agent is actively generating.

### 7.7 Session Management

| Operation | Command | Response |
|-----------|---------|----------|
| Create session | `new_session` | Immediate |
| Set model | `set_model { "provider": "...", "modelId": "..." }` | Returns model info |
| Set session name | `set_session_name { "name": "..." }` | Immediate |
| Compact conversation | `compact { "customInstructions": "..." }` | Streaming: `compaction_start` → `tool_execution_*` → `compaction_end` |
| Session file path | From `get_state.data.sessionFile` | Use this for export/history |

---

## 8. WebSocket Connection Lifecycle

```
1. Frontend: Connect WebSocket → /api/projects/{project_name}/ws
2. Backend: Accept, launch pi --mode rpc (if not already running)
3. Backend: Start reader_task (stdout → WebSocket) + writer_task (WebSocket → stdin)
4. Warm-up: Send get_session_stats to trigger extension loading
5. Frontend: Ready — can send commands/messages
6. Disconnect: Frontend closes WS → Backend terminates pi process
```

### Session Sharing

- Each project has **one** `pi --mode rpc` process shared by all connected clients
- The backend tracks this in `active_rpc_processes` dict keyed by session ID
- Multiple WebSocket connections to the same project share the same process

---

## 9. Data Shape Summary (Quick Reference)

### Incoming to Frontend (`kind` field)

| `kind` | Source | Structure |
|--------|--------|-----------|
| `"response"` | Command response | `{ kind: "response", type: "response", id: "...", command: "...", success: true/false, data: {...} }` |
| `"rpc_event"` | Streaming events | `{ kind: "rpc_event", event: { type: "message_update", delta: {...} } }` |
| `"extension_ui_request"` | Interactive UI request | `{ kind: "extension_ui_request", type: "extension_ui_request", id: "...", method: "select", options: [...], title: "..." }` |
| `"extension_ui_response"` | Auto-ack of fire-and-forget | `{ kind: "extension_ui_response", type: "extension_ui_response", id: "...", value: null }` |

### Outgoing from Frontend (`kind` field)

| `kind` | Purpose | Structure |
|--------|---------|-----------|
| `"chat"` | User message | `{ kind: "chat", message: "..." }` |
| `"command"` | RPC command | `{ kind: "command", type: "get_state" }` |
| `"extension_ui_response"` | Respond to UI request | `{ kind: "extension_ui_response", type: "extension_ui_response", id: "...", value: "..." }` |

---

## 10. Frontend UI Components Needed

Based on the protocol, the frontend needs to support:

### 10.1 Chat Interface
- Text input → sends `kind: "chat"` messages
- Message display → renders `kind: "rpc_event"` with `event.type: "message_update"`
- Streaming cursor → show while `isStreaming: true` (from `get_state`)

### 10.2 Model Switcher
- Dropdown → populated from `kind: "response", command: "get_available_models"`
- Select → sends `kind: "command", type: "set_model", provider: "...", modelId: "..."`

### 10.3 Session Controls
- Rename → sends `kind: "command", type: "set_session_name", name: "..."`
- Compact → sends `kind: "command", type: "compact", customInstructions: "..."`
- Abort → sends `kind: "command", type: "abort"`

### 10.4 Extension UI Renderer
- Interactive dialog/modal for `extension_ui_request` with methods:
  - `select` → dropdown
  - `confirm` → yes/no buttons
  - `input` → text input
  - `editor` → text area (with file path context)
- Response → sends `kind: "extension_ui_response"` back

### 10.5 Status Bar
- Show `thinkingLevel` from `get_state`
- Show `isStreaming` / `isCompacting` indicators
- Show `messageCount` and `sessionName`

---

## 11. Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| `WebSocketDisconnect` | Client closes connection | Backend terminates pi process |
| Process termination | Pi crashes | Backend should detect and restart |
| Extension UI timeout | Frontend doesn't respond | Agent proceeds with default after timeout |
| `"too many pending commands"` | Commands sent too fast | Wait for responses, don't flood |
| Non-JSON line from stdout | Agent stderr leaking | Skip non-JSON lines (already handled) |

---

## 12. Complete Message Flow Example

### Scenario: User sends "Explain this code"

```
Frontend                  Backend                    Pi Agent
   │                         │                          │
   │─── WS open ────────────>│                          │
   │                         │─── launch pi --mode rpc ─>│
   │                         │<── stdout ready ─────────│
   │                         │─── warm-up: get_session_stats ──>│
   │                         │<── response (30s later) ─│
   │                         │─── ready for commands ───>│
   │                         │                          │
   │─── chat: "Explain this"─>│                          │
   │                         │─── {type:"prompt", id:"u1", message:"Explain this"} ──>│
   │                         │<── {type:"response", id:"u1", success:true} ─│
   │                         │<── {type:"agent_start"} ─│
   │─── rpc_event ──────────<│── {type:"turn_start"} ──│
   │─── rpc_event ──────────<│── {type:"message_start"}─│
   │─── rpc_event ──────────<│── {type:"message_update", delta:{text_delta:"Here"}} ─│
   │─── rpc_event ──────────<│── {type:"message_update", delta:{text_delta:" is"}} ─│
   │─── rpc_event ──────────<│── {type:"message_end"} ─│
   │─── rpc_event ──────────<│── {type:"turn_end"} ────│
   │─── rpc_event ──────────<│── {type:"agent_end"} ───│
   │                         │                          │
   │─── WS close ──────────>│                          │
   │                         │─── terminate pi ────────>│
```

---

*Generated from integration test results against live `pi --mode rpc` (42 passing assertions) and `docs/pi-rpc-knowledgebase.md`.*
