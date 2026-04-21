# TODO — Web-Pi Project

## Completed

### Frontend
- [x] Folder Selector view — browse directories, select project
- [x] Model Selector view — pick model, create RPC session
- [x] Workspace view — 3-column layout (tree, preview, chat)
- [x] ProjectTree component — recursive file tree with lazy loading
- [x] FilePreview component — file content viewer with line numbers
- [x] `useFileContent` hook — read files via REST
- [x] `useModels` hook — create RPC session, poll for real models, fallback
- [x] `useWebSocket` hook — WS connection, reconnection, event routing, extension UI
- [x] **ChatPanel wired to WebSocket** — real `ws.send()` replaces mock replies
- [x] **Streaming content** — accumulate `rpc_event` text in real-time
- [x] **Tool call tracking** — display tool names as badges during streaming
- [x] **Model switcher** — send `set_model` RPC on model change
- [x] **Connection status** — indicator + label in header
- [x] **Pending UI requests** — banner with accept/cancel buttons
- [x] CSS for streaming cursor, tool call badges, UI prompt banner

### Backend
- [x] All REST endpoints (browse, projects, sessions, models, files)
- [x] SessionManager — spawn/manage `pi --rpc` processes
- [x] WebSocket relay — bidirectional JSON over `pi --rpc` stdin/stdout
- [x] Extension UI handling — auto-ack fire-and-forget, forward interactive

### Tests
- [x] 76/76 passing across 7 flows
- [x] Flow 1: Browse + Chat
- [x] Flow 2: File Browse
- [x] Flow 3: Multi-Session
- [x] Flow 4: Model Switch
- [x] Flow 5: Close/Delete
- [x] Flow 6: Error Handling
- [x] Flow 7: Shutdown Cleanup

---

## Pending

### Near-term
- [x] **Display tool call args/results + collapsible** — enhanced `extractToolCall` to pull args/result from rpc_events; AssistantMessage renders collapsible tool call sections (default collapsed) with expand-all toggle
- [x] **Markdown rendering in chat responses** — added react-markdown + remark-gfm; assistant messages rendered as rich markdown (code blocks, tables, lists, blockquotes)
- [x] **Multi-turn message history / clear chat** — added clear chat button in ChatPanel header that resets all message/tool-call state
- [x] **WS URL uses `projectFolder` but backend expects `session_id`** — already correct: useWebSocket constructs `/api/projects/ws?session_id=...`
- [ ] **Skip model fetch from server if already cached** — `useModels` already has localStorage cache (30min TTL) but still creates a session and polls in background; could optimize to skip session creation when cache is fresh
- [ ] **Model refresh button in ModelSelector** — add a refresh/reload button that forces a new session and re-polls models from Pi, bypassing the cache
- [x] **Provider filter default logic: inverted** — removed auto-select-all effect; filter now applies whenever selectedProviders > 0 (empty = all shown)
- [x] **Chat input stays disabled after agent end event** — added `agent_end` to isStreamFinalizer check so streaming state clears properly
- [x] **Model selection doesn't work from chat view** — wired handleSwitchModel to call REST switchModel (persist) + WS set_model (immediate effect)
- [ ] **Chat message ordering** — user prompts and assistant responses are not interleaved correctly; all prompts cluster at the top while responses appear at the bottom. Messages should be sorted by creation timestamp (oldest first) so prompts and responses alternate in conversation order, and the view should auto-scroll to reveal the latest message at the bottom
- [ ] **Expandable chat panel** — allow the ChatPanel to expand to fill the entire workspace view (toggle between compact and full-width mode), useful for reading long assistant responses and managing conversations on smaller screens
- [ ] **Populate chat history on workspace load** — use `get_state` RPC call when workspace loads to determine the current model and fetch prior chat history; read session file to repopulate previous conversation messages in the chat window so resuming a session continues from where it left off

### Medium-term
- [ ] **Typing indicator for streaming** — show "Pi is thinking" during the initial delay before first event arrives
- [ ] **Session persistence** — remember last active project/model across page reloads
- [ ] **Keyboard shortcuts** — Ctrl/Cmd+K to focus input, Escape to close dropdown
- [ ] **File search** — add fuzzy search to the project tree
- [ ] **Tabbed file preview** — open multiple files in tabs
- [ ] **Error boundary** — wrap components in React ErrorBoundary for graceful degradation
- [ ] **Toast notifications** — display API errors, session errors to the user
- [ ] **Dark/light theme toggle**

### Stretch
- [ ] **Code diff view** — when Pi modifies files, show diffs inline
- [ ] **Voice input** — Web Speech API for voice-to-text
- [ ] **Collaboration** — multiple users in the same session
- [ ] **Plugin system** — user-defined commands/shortcuts
