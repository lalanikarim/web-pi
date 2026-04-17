"""
Session API endpoints for managing coding sessions.

Sessions are managed through Pi RPC (WebSocket) — these endpoints
provide the REST surface while delegating actual work to the RPC layer.
"""

from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from ..schemas import ModelConfig, Session, SessionBase
from .chat import active_rpc_processes, send_rpc_command

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _find_rpc_for_project(project_name: str) -> Optional[dict]:
    """Find an active RPC process tied to the given project."""
    for sid, rpc in active_rpc_processes.items():
        if project_name in sid:
            return rpc
    return None


# ---------------------------------------------------------------------------
# GET /sessions — list sessions
# ---------------------------------------------------------------------------


@router.get("/sessions", response_model=List[SessionBase])
async def list_sessions(project_name: str) -> List[SessionBase]:
    """
    List sessions for a project.
    Uses Pi RPC get_state to retrieve current session info.
    Falls back to filesystem scan if no RPC is active.
    """
    project_path = Path.cwd() / project_name
    result: List[SessionBase] = []

    # Try RPC first
    rpc = _find_rpc_for_project(project_name)
    if rpc:
        try:
            # Request current state
            await send_rpc_command(rpc["stdin"], {"type": "get_state"})
            # Note: the response comes back via the WebSocket async reader.
            # For now we return what we know from the filesystem.
        except Exception:
            pass

    # Fall back to filesystem scan for .jsonl session files
    pi_sessions_dir = project_path / ".pi" / "sessions"
    if pi_sessions_dir.exists():
        for f in pi_sessions_dir.glob("*.jsonl"):
            session_id = f.stem
            result.append(SessionBase(session_id=session_id, name=f.name, project=project_name))

    return result


# ---------------------------------------------------------------------------
# POST /sessions — create session
# ---------------------------------------------------------------------------


@router.post("/sessions", response_model=Session)
async def create_session(project_name: str, session_data: dict) -> Session:
    """
    Create a new session.
    Sends `new_session` RPC command so Pi manages the session file.
    """
    project_path = Path.cwd() / project_name

    # Verify project exists
    if not project_path.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    session_name = session_data.get("name", "New Session")
    model_id = session_data.get("model", {}).get("id", "claude-sonnet-4-20250514")
    provider = session_data.get("model", {}).get("provider", "anthropic")

    # Launch RPC process if not already running
    rpc = _find_rpc_for_project(project_name)
    if not rpc:

        from .chat import launch_pi_rpc

        proc, stdin, stdout = await launch_pi_rpc(str(project_path))
        rpc_id = f"rpc_{project_name}"
        active_rpc_processes[rpc_id] = {
            "process": proc,
            "stdin": stdin,
            "stdout": stdout,
        }
        rpc = active_rpc_processes[rpc_id]

    # Send new_session command
    await send_rpc_command(rpc["stdin"], {"type": "new_session"})

    # Optionally set the model
    await send_rpc_command(
        rpc["stdin"],
        {"type": "set_model", "provider": provider, "modelId": model_id},
    )

    # Set session name
    await send_rpc_command(rpc["stdin"], {"type": "set_session_name", "name": session_name})

    model_config = ModelConfig(id=model_id, provider=provider)

    return Session(
        session_id=f"session-{project_name}-{session_name}",
        name=session_name,
        project=project_name,
        messages=[],
        model=model_config,
        thinking="medium",
    )


# ---------------------------------------------------------------------------
# GET /sessions/{session_id} — get session details
# ---------------------------------------------------------------------------


@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(project_name: str, session_id: str) -> Session:
    """
    Get session details.
    Uses Pi RPC get_state command to retrieve current state.
    """
    rpc = _find_rpc_for_project(project_name)
    if not rpc:
        raise HTTPException(
            status_code=404,
            detail="No active RPC connection for this project. Connect via WebSocket first.",
        )

    # Send get_state command; response flows back via WebSocket reader
    # For now return stub — real session state comes from streaming events
    try:
        await send_rpc_command(rpc["stdin"], {"type": "get_state"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RPC error: {e}")

    model_config = ModelConfig(id="claude-sonnet-4-20250514", provider="anthropic")

    return Session(
        session_id=session_id,
        name=session_id,
        project=project_name,
        messages=[],
        model=model_config,
        thinking="medium",
    )
