"""
Session API endpoints for managing coding sessions.

Sessions are managed through Pi RPC (WebSocket) — these endpoints
provide the REST surface while delegating actual work to the RPC layer.

All endpoints take `project_path` as a query parameter (absolute path
to the project directory, e.g. ~/Projects/ai-chatbot) instead of a
route parameter, matching the pattern in browse.py / project.py.
"""

import asyncio
import json
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from ..schemas import ModelConfig, Session, SessionBase
from .chat import (
    _read_stdout_loop,
    active_rpc_processes,
    send_rpc_command,
)

# session_id -> asyncio.Queue
_rpc_response_queues: dict = {}

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def resolve_project_path(project_path: Optional[str]) -> Path:
    """Resolve the project path string to a Path object.

    Handles absolute paths, paths starting with ~, and bare project names
    under ~/Projects.
    """
    if not project_path:
        raise HTTPException(
            status_code=400, detail="Missing required query parameter: project_path"
        )

    resolved = Path(project_path).expanduser()

    # If it's not absolute and doesn't exist, try ~/Projects/{name}
    if not resolved.is_absolute() and not resolved.exists():
        candidate = Path.home() / "Projects" / project_path
        if candidate.exists():
            resolved = candidate

    return resolved


def _find_rpc_for_project(project_path: Path) -> Optional[dict]:
    """Find an active RPC process tied to the given project path."""
    path_str = str(project_path)
    for sid, rpc in active_rpc_processes.items():
        if path_str in sid or project_path.name in sid:
            return rpc
    return None


async def _read_rpc_stdout(rpc_id: str, stdout):
    """Background task: read stdout and push JSON to the response queue."""

    async def _on_json(data: dict) -> None:
        if rpc_id in _rpc_response_queues:
            await _rpc_response_queues[rpc_id].put(data)

    await _read_stdout_loop(stdout, on_json=_on_json)


async def send_rpc_command_and_wait(
    stdin, queue: asyncio.Queue, command: dict, timeout: float = 30.0
) -> Optional[dict]:
    """
    Send a command to Pi RPC stdin and wait for the matching response.
    Returns the response dict or None on timeout.
    """

    req_id = str(uuid.uuid4())
    if "id" not in command:
        command["id"] = req_id
    else:
        req_id = command["id"]

    stdin.write(f"{json.dumps(command, ensure_ascii=False)}\n".encode("utf-8"))
    await stdin.drain()

    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        try:
            resp = await asyncio.wait_for(
                queue.get(),
                timeout=min(2.0, deadline - asyncio.get_event_loop().time()),
            )
            if isinstance(resp, dict) and resp.get("id") == req_id:
                return resp
            # If we got a response for the same command, check if it matches
            # (some events may come through with related ids)
            if isinstance(resp, dict) and resp.get("command") == command.get("type"):
                return resp
        except asyncio.TimeoutError:
            break
    return None


# ---------------------------------------------------------------------------
# POST /sessions — create session
# ---------------------------------------------------------------------------


@router.post("/sessions", response_model=Session)
async def create_session(
    project_path: str = Query(..., description="Absolute path to the project directory"),
) -> Session:
    """
    Create a new session.
    Sends `new_session` RPC command so Pi manages the session file.

    Project path resolves like browse.py:
      - Absolute path: ~/Projects/ai-chatbot
      - Tilde path: ~/Projects/ai-chatbot
      - Bare name: tries ~/Projects/{name}
    """
    resolved = resolve_project_path(project_path)

    # Verify project exists
    if not resolved.exists():
        raise HTTPException(status_code=404, detail=f"Project not found: {resolved}")

    session_name = "New Session"
    model_id = "claude-sonnet-4-20250514"
    provider = "anthropic"

    # Launch RPC process if not already running
    rpc = _find_rpc_for_project(resolved)
    if not rpc:
        from .chat import launch_pi_rpc

        proc, stdin, stdout = await launch_pi_rpc(str(resolved))
        rpc_id = f"rpc_{resolved.name}"
        active_rpc_processes[rpc_id] = {
            "process": proc,
            "stdin": stdin,
            "stdout": stdout,
        }
        rpc = active_rpc_processes[rpc_id]

    _stdin = rpc["stdin"]
    # Send new_session command
    await send_rpc_command(_stdin, {"type": "new_session"})

    # Optionally set the model
    await send_rpc_command(
        rpc["stdin"],
        {"type": "set_model", "provider": provider, "modelId": model_id},
    )

    # Set session name
    await send_rpc_command(rpc["stdin"], {"type": "set_session_name", "name": session_name})

    model_config = ModelConfig(id=model_id, provider=provider)

    return Session(
        session_id=f"session-{resolved.name}-{session_name}",
        name=session_name,
        project=str(resolved),
        messages=[],
        model=model_config,
        thinking="medium",
    )


# ---------------------------------------------------------------------------
# GET /sessions — list sessions
# ---------------------------------------------------------------------------


@router.get("/sessions", response_model=List[SessionBase])
async def list_sessions(
    project_path: str = Query(..., description="Absolute path to the project directory"),
) -> List[SessionBase]:
    """
    List sessions for a project.
    Uses Pi RPC get_state to retrieve current session info.
    Falls back to filesystem scan if no RPC is active.
    """
    resolved = resolve_project_path(project_path)
    result: List[SessionBase] = []

    # Try RPC first
    rpc = _find_rpc_for_project(resolved)
    if rpc:
        try:
            await send_rpc_command(rpc["stdin"], {"type": "get_state"})
            # Note: the response comes back via the WebSocket async reader.
            # For now we return what we know from the filesystem.
        except Exception:
            pass

    # Fall back to filesystem scan for .jsonl session files
    pi_sessions_dir = resolved / ".pi" / "sessions"
    if pi_sessions_dir.exists():
        for f in pi_sessions_dir.glob("*.jsonl"):
            session_id = f.stem
            result.append(SessionBase(session_id=session_id, name=f.name, project=str(resolved)))

    return result


# ---------------------------------------------------------------------------
# GET /sessions/{session_id} — get session details
# ---------------------------------------------------------------------------


@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(
    session_id: str,
    project_path: str = Query(..., description="Absolute path to the project directory"),
) -> Session:
    """
    Get session details.
    Uses Pi RPC get_state command to retrieve current state.
    """
    resolved = resolve_project_path(project_path)
    rpc = _find_rpc_for_project(resolved)
    if not rpc:
        raise HTTPException(
            status_code=404,
            detail="No active RPC connection for this project. Connect via WebSocket first.",
        )

    # Send get_state command; response flows back via WebSocket reader
    try:
        await send_rpc_command(rpc["stdin"], {"type": "get_state"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RPC error: {e}")

    model_config = ModelConfig(id="claude-sonnet-4-20250514", provider="anthropic")

    return Session(
        session_id=session_id,
        name=session_id,
        project=str(resolved),
        messages=[],
        model=model_config,
        thinking="medium",
    )
