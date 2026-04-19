# Tests — Done

All Phase 1–3 cleanup items from the original plan are complete. Test suite is running and passing.

## Summary

- **pytest infrastructure**: `conftest.py` with fixtures, subfixture support, `test_utils.py` with shared helpers
- **26 tests passing** across flows 1–3
- **Run**: `API_BASE=http://127.0.0.1:8000 WS_BASE=ws://127.0.0.1:8000 uv run pytest -v`
- **Harness**: `uv run run-tests` (CLI entry point from `pyproject.toml`)

## Completed

- [x] Fix `TEST_MODEL2_ID` default in `test_utils.py`
- [x] Remove dead `start_uvicorn` / `stop_uvicorn` references
- [x] Fix Flow 7 `run()` — safe exit on early return
- [x] Make fixture dir path configurable via `TESTS_DIR` env var
- [x] Add `conftest.py` for pytest support (fixtures + subfixture hook)
- [x] Remove `sys.path.insert(0, ...)` from every flow file
- [x] Remove duplicate constants (kept in `test_utils.py`)
- [x] Generate `uv.lock` for tests/
- [x] Remove redundant `__main__` blocks from flow files
- [x] Cache/scratch directories cleaned
- [x] `tests/.gitignore` added
- [x] Subfixture pattern working (session_id, ws, session1_id, session2_id)
- [x] WS fixture creates fresh connection per test (avoids event-loop mismatch)

## Pending Test Flows

| Flow | File | Tests | Status |
|------|------|-------|--------|
| 4: Model Switch | `test_flow4_model_switch.py` | — | ⏳ Not written |
| 5: Close/Delete | `test_flow5_close_delete.py` | — | ⏳ Not written |
| 6: Error Handling | `test_flow6_error_handling.py` | — | ⏳ Not written |
| 7: Shutdown | `test_flow7_shutdown_cleanup.py` | — | ⏳ Not written |

See `docs/design/integration-test-plan.md` for detailed test specifications for flows 4–7.
