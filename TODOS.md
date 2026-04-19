# Pi RPC Integration — TODOS

## ✅ Completed

### Core Backend

- [x] Session Manager (`session_manager.py`) — spawn, manage, terminate `pi --mode rpc` processes
- [x] Session lifecycle: create, close (compact), delete (abort)
- [x] WebSocket relay — bidirectional JSON over stdin/stdout
- [x] Extension UI handling — auto-ack fire-and-forget, forward interactive
- [x] Model switching — metadata-only via REST, sent via WS relay
- [x] File browsing with path traversal prevention
- [x] Project list, info, session create endpoints
- [x] Pydantic serialization exclusions for non-serializable fields

### Frontend

- [x] All components wired to real API (mock data removed)
- [x] WebSocket client in ChatPanel
- [x] App flow: FolderSelector → ModelSelector → Workspace
- [x] Shared AppContext state management

### Tests

- [x] pytest infrastructure — `conftest.py`, `test_utils.py`, `pyproject.toml`
- [x] Subfixture support — return values from tests shared as fixtures
- [x] Flow 1: Browse & Chat (12 tests) — all passing
- [x] Flow 2: File Browse (7 tests) — all passing
- [x] Flow 3: Multi Session (7 tests) — all passing

### Docs

- [x] Consolidated AGENTS.md with current architecture, API, status
- [x] Updated README.backend.md with implementation details
- [x] Cleaned up stale docs (bevy extracts, copilotkit, old knowledge bases)

## 🟡 In Progress

- [ ] Flow 4: Model Switch tests (`test_flow4_model_switch.py`)
- [ ] Flow 5: Close/Delete tests (`test_flow5_close_delete.py`)
- [ ] Flow 6: Error Handling tests (`test_flow6_error_handling.py`)
- [ ] Flow 7: Shutdown Cleanup tests (`test_flow7_shutdown_cleanup.py`)

## ⏳ Pending

- [ ] CI pipeline setup
- [ ] Rate limiting
- [ ] Backend unit tests (separate from integration tests)
- [ ] File tree search/filter
- [ ] Extension UI dialog rendering in frontend
- [ ] Loading states and error handling across all components
- [ ] Session export (`export_html`, `get_messages`) via WebSocket
- [ ] Auto-expunge logic for stopped sessions
