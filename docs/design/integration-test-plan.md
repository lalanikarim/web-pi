# API Integration Test Plan — Frontend Flows

> Test the backend REST + WebSocket API surface against live `pi --mode rpc` processes, covering all user flows the frontend executes.

---

## Test Fixture Setup

### Directory Structure

Create under `$HOME/Projects/web-pi-integration-tests/`:

```
web-pi-integration-tests/
├── README.md                    # Project root
├── flat/                        # "flat" — 2 code files
│   ├── main.py                  # Entry point
│   └── utils.py                 # Utility module
└── nested/                      # "nested" — 2 subdirs × 2 files each
    ├── README.md
    ├── src/
    │   ├── app.py               # App entry
    │   └── config.py            # Config module
    └── tests/
        ├── test_app.py          # App tests
        └── test_config.py       # Config tests
```

### Model Configuration

| Field | Value |
|-------|-------|
| Provider | `vllm` |
| Model ID | `Qwen/Qwen3.6-35B-A3B` |

This model is used throughout all chat prompts and model-switching tests.

---

## Test Structure

### Runner

- Single test file: `backend/integration_test_api.py` (rewrite)
- Test fixture creation runs once at module level
- Uvicorn starts in subprocess, tears down after tests
- All tests use `httpx.AsyncClient` for REST + `httpx.WebSocket` for WS

### Result Tracking

```python
class Tc:
    """Test case tracker."""
    passed: int = 0
    failed: int = 0
    errors: list[str] = []
```

---

## Flow 1: Folder Browse → Model Select → Session Create → Chat

**Frontend path:** FolderSelector → pick folder → ModelSelector → pick model → Workspace (chat panel)

### T1.1 — Browse directories (recursive)

- **Request:** `GET /api/browse?path=$HOME/Projects/web-pi-integration-tests`
- **Verify:** Returns `[{name:"flat",isDirectory:true}, {name:"nested",isDirectory:true}, {name:"README.md",...}]`
- **T1.1b** — Browse subdirs: `GET /api/browse?path=.../flat` → returns `[{name:"main.py"}, {name:"utils.py"}]`
- **T1.1c** — Browse nested: `GET /api/browse?path=.../nested/src` → returns `[{name:"app.py"}, {name:"config.py"}]`

### T1.2 — List projects

- **Request:** `GET /api/projects/`
- **Verify:** Response contains `"web-pi-integration-tests"` in list

### T1.3 — Get project info (before session creation)

- **Request:** `GET /api/projects/info?project_path=$HOME/Projects/web-pi-integration-tests`
- **Verify:** Returns `200`, `running_count == 0`, `sessions == []`

### T1.4 — Create session with model

- **Request:** `POST /api/projects/?project_path=$HOME/Projects/web-pi-integration-tests`
  - Body: `{model_id: "Qwen/Qwen3.6-35B-A3B", name: "Flow1-Test"}`
- **Verify:** Returns `200`, `SessionRecord` with:
  - `status == "running"`
  - `model_id == "Qwen/Qwen3.6-35B-A3B"`
  - `pid` is set
  - `session_id` is non-empty
- **Capture:** Save `session_id` for subsequent tests

### T1.5 — List models (with session)

- **Request:** `GET /api/models/?session_id=<session_id>`
- **Verify:** Returns list including `Qwen/Qwen3.6-35B-A3B` from provider `vllm`
- **Note:** If vllm not configured, test skips with "model not available"

### T1.6 — Get project info (after session creation)

- **Request:** `GET /api/projects/info?project_path=$HOME/Projects/web-pi-integration-tests`
- **Verify:** `running_count == 1`, `sessions` contains session from T1.4

### T1.7 — WebSocket connect

- **Connect:** `WS /api/projects/ws?session_id=<session_id>`
- **Verify:** Connection succeeds, state becomes `connected`

### T1.8 — Send `get_state` via WS

- **Send:** `{"type":"get_state"}`
- **Verify:** Receive `{"type":"response", "command":"get_state", "success":true}` or `{"kind":"rpc_event", "event":{...}}`

### T1.9 — Send chat message

- **Send:** `{"type":"prompt","message":"Hello, who are you?"}`
- **Verify:** Receive `{"type":"response","command":"prompt","success":true}` (immediate)
- **Verify:** Receive streaming events (`message_start`, `message_update`) or at least `turn_end`/`agent_end`
- **Verify:** Response content references "Qwen" or acknowledges being an AI

### T1.10 — Send second chat message (conversation)

- **Send:** `{"type":"prompt","message":"What files exist in this project?"}`
- **Verify:** Response references `main.py`, `utils.py`, `src/app.py`, or similar actual files
- **Verify:** Agent uses file-reading tool or mentions files from project structure

### T1.11 — WS disconnect (session stays alive)

- **Action:** Close WS connection
- **Verify:** State becomes `disconnected`
- **Verify:** Session still `running` (check via GET /api/projects/info)
- **Verify:** Process PID still alive

### T1.12 — WS reconnect

- **Connect:** `WS /api/projects/ws?session_id=<session_id>` (new connection)
- **Verify:** Connection succeeds
- **Verify:** Session state still `running`

---

## Flow 2: File Browse → File Preview

**Frontend path:** Workspace → ProjectTree → click file → FilePreview

### T2.1 — List root files

- **Request:** `GET /api/projects/files?project_path=$HOME/Projects/web-pi-integration-tests`
- **Verify:** Returns files including `README.md`, `flat`, `nested`

### T2.2 — List flat directory

- **Request:** `GET /api/projects/files?project_path=...&path=flat`
- **Verify:** Returns `[{name:"main.py",isDirectory:false}, {name:"utils.py",isDirectory:false}]`

### T2.3 — List nested/src directory

- **Request:** `GET /api/projects/files?project_path=...&path=nested/src`
- **Verify:** Returns `[{name:"app.py",isDirectory:false}, {name:"config.py",isDirectory:false}]`

### T2.4 — Read file — main.py

- **Request:** `GET /api/projects/files/read?project_path=...&file_path=flat/main.py`
- **Verify:** Returns non-empty string, contains Python code

### T2.5 — Read file — app.py

- **Request:** `GET /api/projects/files/read?project_path=...&file_path=nested/src/app.py`
- **Verify:** Returns non-empty string, contains Python code

### T2.6 — Read non-existent file

- **Request:** `GET /api/projects/files/read?project_path=...&file_path=nonexistent.py`
- **Verify:** Returns `404`

### T2.7 — Path traversal prevention

- **Request:** `GET /api/projects/files?project_path=...&path=../../../etc`
- **Verify:** Returns `403` (Access denied)

---

## Flow 3: Multiple Sessions on Same Project

**Frontend path:** Workspace → create new session on same folder

### T3.1 — Create second session on same project

- **Request:** `POST /api/projects/?project_path=$HOME/Projects/web-pi-integration-tests`
  - Body: `{model_id: "Qwen/Qwen3.6-35B-A3B", name: "Flow2-Session"}`
- **Verify:** Returns `200`, new `SessionRecord`
- **Verify:** `session_id` differs from T1.4's session
- **Verify:** `pid` differs from T1.4's session (different process)

### T3.2 — Get project info (two sessions)

- **Request:** `GET /api/projects/info?project_path=$HOME/Projects/web-pi-integration-tests`
- **Verify:** `running_count == 2`
- **Verify:** `sessions` has exactly 2 items

### T3.3 — Chat on session 1 independently

- **Connect WS to session 1**, send `{"type":"prompt","message":"Session 1, identify yourself"}`
- **Verify:** Session 1 responds with its own context

### T3.4 — Chat on session 2 independently

- **Connect WS to session 2**, send `{"type":"prompt","message":"Session 2, identify yourself"}`
- **Verify:** Session 2 responds with its own context
- **Verify:** Session 1 and 2 have independent state (session 2 does NOT know about session 1's chat)

### T3.5 — Close session 1, session 2 unaffected

- **Request:** `POST /api/projects/<session1_id>/close`
- **Verify:** Returns `compacted: true`
- **Verify:** Session 1 removed from `get_sessions()`
- **Verify:** Session 2 still `running` (connect WS to session 2, send prompt)

### T3.6 — Delete session 2 (no compact)

- **Request:** `POST /api/projects/<session2_id>/delete`
- **Verify:** Returns `compacted: false`
- **Verify:** Session 2 removed from `get_sessions()`

### T3.7 — Project info clean (no sessions)

- **Request:** `GET /api/projects/info?project_path=$HOME/Projects/web-pi-integration-tests`
- **Verify:** `running_count == 0`, `sessions == []`

---

## Flow 4: Model Switching

**Frontend path:** ChatPanel → model dropdown → switch model

### T4.1 — Create session with model A

- **Request:** `POST /api/projects/?project_path=$HOME/Projects/web-pi-integration-tests`
  - Body: `{model_id: "Qwen/Qwen3.6-35B-A3B", name: "ModelSwitch-Test"}`
- **Verify:** `model_id == "Qwen/Qwen3.6-35B-A3B"`

### T4.2 — Switch to model B (fallback)

- **Request:** `POST /api/projects/<id>/model?model_id=claude-sonnet-4-20250514&provider=anthropic`
- **Verify:** Returns `200`, updated `SessionRecord` with new `model_id`
- **Note:** May fail if model not available — test records as "skipped: model not available"

### T4.3 — Chat with switched model

- **Connect WS to session**, send `{"type":"prompt","message":"What model are you?"}`
- **Verify:** Response reflects the new model

### T4.4 — Chat on original model (recreate)

- **Create new session** with `Qwen/Qwen3.6-35B-A3B`
- **Connect WS**, send prompt
- **Verify:** Responds correctly

---

## Flow 5: Session Lifecycle — Close vs Delete

### T5.1 — Create session

- **Request:** `POST /api/projects/?project_path=...`
- **Body:** `{model_id: "Qwen/Qwen3.6-35B-A3B", name: "CloseTest"}`
- **Verify:** Session created, `status == "running"`

### T5.2 — Close session (compact path)

- **Request:** `POST /api/projects/<id>/close`
- **Verify:** Returns `compacted: true`
- **Verify:** Process terminated (check PID is no longer alive)
- **Verify:** Session removed from `get_sessions()`

### T5.3 — Create session for delete test

- **Request:** `POST /api/projects/?project_path=...`
- **Body:** `{model_id: "Qwen/Qwen3.6-35B-A3B", name: "DeleteTest"}`

### T5.4 — Delete session (no compact)

- **Request:** `POST /api/projects/<id>/delete`
- **Verify:** Returns `compacted: false`
- **Verify:** Process terminated
- **Verify:** Session removed from `get_sessions()`

---

## Flow 6: Error Handling

### T6.1 — Create session on non-existent project

- **Request:** `POST /api/projects/?project_path=$HOME/Projects/does-not-exist`
- **Verify:** Returns `404`

### T6.2 — Close non-existent session

- **Request:** `POST /api/projects/fake-session-id/close`
- **Verify:** Returns `404`

### T6.3 — WS connect to non-existent session

- **Connect:** `WS /api/projects/ws?session_id=fake-session-id`
- **Verify:** Connection closed with code `4002`

### T6.4 — Read file outside project root

- **Request:** `GET /api/projects/files?project_path=...&path=../../../etc/passwd`
- **Verify:** Returns `403`

### T6.5 — Duplicate session name

- **Create two sessions** with same `name: "DupTest"`
- **Verify:** Both created successfully (names not unique)

---

## Flow 7: App Shutdown Cleanup

### T7.1 — Create sessions, then shutdown

- **Create 2 sessions** on `web-pi-integration-tests`
- **Verify:** Both `running`
- **Action:** Stop uvicorn process (SIGTERM)
- **Verify:** Both processes terminated within 5 seconds
- **Verify:** No zombie processes

---

## Test Execution Order

```
Setup (create test dirs)
  ↓
T1.1 — T1.12  (Folder browse → Model → Session → Chat → WS disconnect/reconnect)
  ↓
T2.1 — T2.7  (File browse → File preview → Error cases)
  ↓
T3.1 — T3.7  (Multiple sessions → Chat independently → Close → Delete → Cleanup)
  ↓
T4.1 — T4.4  (Model switching)
  ↓
T5.1 — T5.4  (Close vs Delete lifecycle)
  ↓
T6.1 — T6.5  (Error handling)
  ↓
T7.1          (App shutdown cleanup)
  ↓
Teardown
```

---

## API Endpoints Under Test

| Endpoint | Method | Tests |
|----------|--------|-------|
| `/api/browse` | GET | T1.1 |
| `/api/projects/` | GET | T1.2 |
| `/api/projects/info` | GET | T1.3, T1.6, T3.2, T3.7 |
| `/api/projects/` | POST | T1.4, T3.1, T4.1, T5.1, T5.3 |
| `/api/projects/{id}/close` | POST | T3.5, T5.2 |
| `/api/projects/{id}/delete` | POST | T3.6, T5.4 |
| `/api/projects/{id}/model` | POST | T4.2 |
| `/api/projects/files` | GET | T2.1, T2.2, T2.3, T2.7 |
| `/api/projects/files/read` | GET | T2.4, T2.5, T2.6 |
| `/api/models/` | GET | T1.5 |
| `WS /api/projects/ws` | WS | T1.7–T1.12, T3.3, T3.4, T4.3, T4.4, T6.3 |

---

## Model Availability Handling

If `Qwen/Qwen3.6-35B-A3B` via `vllm` is **not available** in the test environment:

1. **T1.4, T1.5, T3.1, T4.1** — Skip with "model not available" (mark as `⏭`)
2. **T1.9, T1.10** — Still test chat with any available model
3. **T4.1–T4.4** — Model switch tests become validation that the API accepts the request and updates the record
4. **Fallback model:** If no vllm model available, test with first model from `get_available_models`

---

## CI / Local Run

```bash
# Local run (requires `pi` binary in PATH, port 8765 available)
cd backend
python integration_test_api.py

# With verbose output
python integration_test_api.py --verbose

# Run specific flow only
python integration_test_api.py --flows file-browse   # T2.x only
python integration_test_api.py --flows multi-session # T3.x only
python integration_test_api.py --flows chat          # T1.7–T1.12 only
```

---

## Summary

| Flow | Tests | Purpose |
|------|-------|---------|
| **1** | T1.1–T1.12 | Full user journey: browse → model → session → chat → WS disconnect/reconnect |
| **2** | T2.1–T2.7 | File browsing and preview, path traversal protection |
| **3** | T3.1–T3.7 | Multiple independent sessions on same project |
| **4** | T4.1–T4.4 | Model switching mid-session |
| **5** | T5.1–T5.4 | Session close (compact) vs delete (abort) lifecycle |
| **6** | T6.1–T6.5 | Error handling and edge cases |
| **7** | T7.1 | App shutdown cleanup of all processes |
| **Total** | **~40 test cases** | |
