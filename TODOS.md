# Pi RPC Integration - Bug Fixes TODO

Sorted by priority (most critical first).

---

## ✅ Fixed

- [x] **#1 Fix RPC launch command** (`chat.py`) — `--rpc` → `--mode rpc`
  - Confirmed by `pi --help`: the correct flag is `--mode <mode>`

- [x] **#2 Fix session.py** — Replace stub data with real RPC calls
  - `new_session` RPC command to create sessions
  - `get_state` RPC command to retrieve session info
  - `set_session_name` RPC command for naming

- [x] **#3 Fix chat.py message wrapping** — Wrap messages in `prompt` command envelope
  - Plain text messages → `{"type":"prompt","id":"<uuid>","message":"..."}`
  - Structured messages routed by `type` field

- [x] **#4 Fix chat.py request ID tracking** — Auto-generate UUIDs for each command
  - `send_rpc_command()` attaches `id` via `uuid.uuid4()`
  - Responses echo back the same `id` for matching

- [x] **#5 Fix files.py route conflict** — Source of 404 bug
  - Changed `/{file_path:.+}` to `/files/read/{file_path:path}`
  - `path` type annotation prevents FastAPI route disambiguation issues
  - Removed `project_name` double-binding

- [x] **#6 Handle extension_ui_request events** (`chat.py`)
  - `extension_ui_request` → `{"kind":"extension_ui_request", ...}`
  - `extension_ui_response` → `{"kind":"extension_ui_response", ...}`

- [x] **#7 Fix model.py** — RPC-aware model management
  - `list_models()` queries RPC if active, falls back to defaults
  - `switch_model()` sends `set_model` RPC command
  - Helper: `_parse_rpc_models()` to parse RPC response format

- [x] **#8 Fix core.utils.py** — Removed dead code (used non-existent `pi-rpc` binary)
  - Not imported anywhere, confirmed safe to delete

- [x] **#9 Fix WebSocket path** — removed duplicate `project_name` from route
  - Route changed from `/ws/rpc/{project_name}` to `/ws`
  - Full path: `/api/projects/{project_name}/ws` (clean)

- [x] **#10 Distinguish response vs event events** (`chat.py`)
  - Responses: forwarded as-is with `{"type":"response"}`
  - Events: wrapped as `{"kind":"rpc_event", "event": {...}}`

- [x] **#11 Forward extension_ui events as typed messages** (`chat.py`)
  - All Pi output tagged with `kind` field
  - `kind: "extension_ui_request" | "extension_ui_response" | "rpc_event"`

## ✅ Integration Tests (passing)

- [x] `backend/integration_test_rpc.py` — 42 assertions, all passing against live `pi --mode rpc`
  - Warm-up phase triggers extension loading before test sequence
  - Single `event_reader` task owns stdout; `send_command` writes stdin + waits on queue
  - Auto-replies to `extension_ui_request` so Pi doesn't block
  - Covers: `get_available_models`, `set_model`, `get_state`, `get_messages`, `get_session_stats`, `get_commands`, `set_thinking_level`, `set_session_name`, prompt+event-streaming, extension_ui handling, message wrapping, model parsing

## Remaining

- [ ] Wire frontend to backend (replace `mockData.ts` with API calls)
- [ ] Add backend unit tests for RPC integration
- [ ] Add rate limiting and connection pooling
- [ ] Session cleanup / auto-expunge logic
