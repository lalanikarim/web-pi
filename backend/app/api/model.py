"""
Model API endpoints for managing available models.

Uses Pi RPC commands (get_available_models, set_model) when a session
is active; falls back to a small hardcoded default list otherwise.
"""

import json
from typing import List, Optional

from fastapi import APIRouter

from ..schemas import ModelConfig
from .chat import active_rpc_processes

router = APIRouter()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Default model list (used when no RPC is active)
_DEFAULT_MODELS: List[ModelConfig] = [
    ModelConfig(
        id="claude-sonnet-4-20250514",
        provider="anthropic",
        contextWindow=200000,
        maxTokens=16384,
    ),
    ModelConfig(id="gpt-4.1", provider="openai", contextWindow=131072, maxTokens=16384),
    ModelConfig(id="deepseek-coder", provider="deepseek", contextWindow=65536, maxTokens=16384),
]


def _find_rpc_for_project(project_name: str):
    """Find an active RPC process for the given project."""
    for sid, rpc in active_rpc_processes.items():
        if project_name in sid:
            return rpc
    return None


def _parse_rpc_models(raw: Optional[dict]) -> List[ModelConfig]:
    """
    Parse model objects from a Pi RPC get_available_models response.

    The response data field contains a list of model objects like:
    {"provider": "anthropic", "modelId": "claude-sonnet-4-20250514", ...}
    """
    if not raw:
        return _DEFAULT_MODELS

    models = []
    items = raw if isinstance(raw, list) else raw.get("models", raw.get("data", []))
    if isinstance(items, list):
        for item in items:
            if isinstance(item, dict):
                models.append(
                    ModelConfig(
                        id=item.get("modelId", item.get("id", "unknown")),
                        provider=item.get("provider", "unknown"),
                        contextWindow=item.get("contextWindow"),
                        maxTokens=item.get("maxTokens"),
                    )
                )
    return models if models else _DEFAULT_MODELS


# ---------------------------------------------------------------------------
# GET / — list models
# ---------------------------------------------------------------------------


@router.get("/", response_model=List[ModelConfig])
async def list_models(project_name: Optional[str] = None) -> List[ModelConfig]:
    """
    List all available models.
    Queries Pi RPC if an active session exists; falls back to defaults.
    """
    if project_name:
        rpc = _find_rpc_for_project(project_name)
        if rpc:
            try:
                await rpc["stdin"].write(b'{"type": "get_available_models"}\n')
                await rpc["stdin"].drain()
                # Response will come back via the async WebSocket reader.
                # For REST endpoint return defaults and let WebSocket deliver update.
            except Exception:
                pass

    return _DEFAULT_MODELS


# ---------------------------------------------------------------------------
# POST /{session_id}/model — switch model
# ---------------------------------------------------------------------------


@router.post("/{session_id}/model")
async def switch_model(session_id: str, project_name: str, model_id: str) -> dict:
    """
    Switch the model for a session.
    Sends set_model RPC command with the target model.
    """
    rpc = _find_rpc_for_project(project_name)
    if not rpc:
        return {"error": "No active RPC session", "message": "Connect via WebSocket first"}

    # Determine provider from model ID or parse from provider/id format
    provider = "anthropic"
    if "/" in model_id:
        provider, model_id = model_id.split("/", 1)

    # Send set_model command
    try:
        await rpc["stdin"].write(
            json.dumps({"type": "set_model", "provider": provider, "modelId": model_id}).encode(
                "utf-8"
            )
        )
        await rpc["stdin"].drain()
        return {
            "message": "Model switch requested",
            "provider": provider,
            "modelId": model_id,
        }
    except Exception as e:
        return {"error": f"Failed to switch model: {e}"}
