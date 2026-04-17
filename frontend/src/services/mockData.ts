import type { Model, FileNode } from '../types';

export const MOCK_MODELS: Model[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 16384,
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 16384,
  },
  {
    id: 'gpt-4o-2024-05-13',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    maxTokens: 16384,
  },
  {
    id: 'gpt-4.1-2025-04-14',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    contextWindow: 1048576,
    maxTokens: 16384,
  },
  {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    contextWindow: 1048576,
    maxTokens: 65536,
  },
  {
    id: 'qwq-32b',
    name: 'Qwen QWQ 32B',
    provider: 'Alibaba',
    contextWindow: 32768,
    maxTokens: 8192,
  },
];

export const initialModel = MOCK_MODELS[0];

export function mockFolders(): string[] {
  return [
    '/Users/karim/Projects/ocproject/remote-pi',
    '/Users/karim/Projects/ocproject/remote-pi/web-pi',
    '/Users/karim/Projects/ocproject/remote-pi/docs',
    '/Users/karim/Projects/ocproject/remote-pi/sample-agent',
    '/Users/karim/Projects/ocproject/remote-pi/api-gateway',
    '/Users/karim/Projects/ocproject/remote-pi/mobile-app',
  ];
}

const sampleProjectFiles: FileNode[] = [
  {
    name: 'backend',
    path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend',
    isDirectory: true,
    children: [
      {
        name: 'app',
        path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app',
        isDirectory: true,
        children: [
          { name: '__init__.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/__init__.py', isDirectory: false, size: 42 },
          { name: 'main.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/main.py', isDirectory: false, size: 1247 },
          {
            name: 'api',
            path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api',
            isDirectory: true,
            children: [
              { name: '__init__.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/__init__.py', isDirectory: false, size: 12 },
              { name: 'projects.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/projects.py', isDirectory: false, size: 2340 },
              { name: 'sessions.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/sessions.py', isDirectory: false, size: 3120 },
              { name: 'files.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/files.py', isDirectory: false, size: 1890 },
              { name: 'models.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/models.py', isDirectory: false, size: 780 },
            ],
          },
          {
            name: 'core',
            path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/core',
            isDirectory: true,
            children: [
              { name: '__init__.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/core/__init__.py', isDirectory: false, size: 12 },
              { name: 'session_registry.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/core/session_registry.py', isDirectory: false, size: 1560 },
              { name: 'pi_rpc.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/core/pi_rpc.py', isDirectory: false, size: 2340 },
            ],
          },
          {
            name: 'schemas',
            path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/schemas',
            isDirectory: true,
            children: [
              { name: '__init__.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/schemas/__init__.py', isDirectory: false, size: 12 },
              { name: 'session.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/schemas/session.py', isDirectory: false, size: 980 },
              { name: 'file.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/schemas/file.py', isDirectory: false, size: 450 },
            ],
          },
          { name: 'core.utils.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/core.utils.py', isDirectory: false, size: 560 },
        ],
      },
      { name: 'pyproject.toml', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/pyproject.toml', isDirectory: false, size: 338 },
      { name: 'uv.lock', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/uv.lock', isDirectory: false, size: 45230 },
    ],
  },
  { name: 'README.backend.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/README.backend.md', isDirectory: false, size: 2658 },
  { name: 'pyproject.toml', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/pyproject.toml', isDirectory: false, size: 338 },
  { name: 'uv.lock', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/uv.lock', isDirectory: false, size: 79044 },
  { name: 'main.py', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/main.py', isDirectory: false, size: 94 },
  { name: '.gitignore', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/.gitignore', isDirectory: false, size: 406 },
  {
    name: 'docs',
    path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs',
    isDirectory: true,
    children: [
      { name: 'backend_status.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/backend_status.md', isDirectory: false, size: 1200 },
      { name: 'fastapi-react-pi-integration-plan.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/fastapi-react-pi-integration-plan.md', isDirectory: false, size: 8400 },
      { name: 'implementation_summary.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/implementation_summary.md', isDirectory: false, size: 2300 },
      {
        name: 'copilotkit',
        path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/copilotkit',
        isDirectory: true,
        children: [
          { name: 'README.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/copilotkit/README.md', isDirectory: false, size: 1500 },
          { name: 'architecture.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/copilotkit/architecture.md', isDirectory: false, size: 3200 },
          { name: 'installation.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/copilotkit/installation.md', isDirectory: false, size: 2100 },
        ],
      },
    ],
  },
  {
    name: 'frontend',
    path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend',
    isDirectory: true,
    children: [
      { name: 'package.json', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/package.json', isDirectory: false, size: 420 },
      { name: 'tsconfig.json', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/tsconfig.json', isDirectory: false, size: 1200 },
      { name: 'vite.config.ts', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/vite.config.ts', isDirectory: false, size: 280 },
      {
        name: 'src',
        path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/src',
        isDirectory: true,
        children: [
          { name: 'App.tsx', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/src/App.tsx', isDirectory: false, size: 120 },
          { name: 'main.tsx', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/src/main.tsx', isDirectory: false, size: 180 },
          { name: 'index.css', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/src/index.css', isDirectory: false, size: 5200 },
        ],
      },
    ],
  },
  { name: 'README.md', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/README.md', isDirectory: false, size: 0 },
  { name: '.python-version', path: '/Users/karim/Projects/ocproject/remote-pi/web-pi/.python-version', isDirectory: false, size: 5 },
];

export const mockFileContents: Record<string, string> = {
  '/Users/karim/Projects/ocproject/remote-pi/web-pi/pyproject.toml': `[project]
name = "fastapi-react-pi"
version = "0.1.0"
description = "FastAPI server for Pi coding agent with React frontend"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "aiofiles>=24.1.0",
    "pydantic>=2.8.0",
    "httpx>=0.28.1",
    "pytest>=9.0.3",
]`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/main.py': `def main():
    print("Hello from fastapi-react-pi!")


if __name__ == "__main__":
    main()`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import projects, sessions, files, models

app = FastAPI(title="FastAPI React Pi", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(sessions.router, prefix="/api/projects", tags=["sessions"])
app.include_router(files.router, prefix="/api/projects", tags=["files"])
app.include_router(models.router, tags=["models"])

@app.get("/health")
async def health():
    return {"status": "ok"}`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/package.json': `{
  "name": "web-pi-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",
    "@vitejs/plugin-react": "^4.5.2",
    "typescript": "~5.7.2",
    "vite": "^6.3.5"
  }
}`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/src/main.tsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/frontend/src/index.css': `:root {
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
  height: 100vh;
}`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/backend_status.md': `# Backend Status

## Completed
- [x] FastAPI project setup with uv
- [x] API routers: projects, sessions, files, models
- [x] Pydantic schemas
- [x] CORS middleware

## In Progress
- [ ] File read endpoint (path parameter routing)
- [ ] WebSocket chat endpoint

## TODO
- [ ] Pi RPC subprocess management
- [ ] Session JSONL persistence
- [ ] Rate limiting
- [ ] Testing with pytest`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/docs/implementation_summary.md': `# Implementation Summary

## Architecture
FastAPI backend + React/TypeScript frontend.

## Key Decisions
- Python 3.13 with uv for reproducible builds
- React 19 + TypeScript + Vite for the frontend
- JSONL for session persistence
- WebSocket for real-time chat streaming
- Async I/O with aiofiles for file operations

## Progress: ~60% of the planned API layer is complete.`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/core/pi_rpc.py': `import asyncio
import json
from typing import Optional

class PiRpcProcess:
    """Manages a Pi RPC subprocess communication."""
    
    def __init__(self, session_dir: str):
        self.session_dir = session_dir
        self.process: Optional[asyncio.subprocess.Process] = None
    
    async def start(self):
        """Start the Pi RPC subprocess."""
        self.process = await asyncio.create_subprocess_exec(
            "pi", "rpc",
            "--session-dir", self.session_dir,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
        )
    
    async def send(self, data: dict):
        """Send data to the Pi RPC process."""
        if not self.process or not self.process.stdin:
            raise RuntimeError("Pi RPC process not running")
        
        self.process.stdin.write(json.dumps(data).encode() + b"\\n")
        await self.process.stdin.drain()
    
    async def read_line(self) -> Optional[dict]:
        """Read a JSONL line from stdout."""
        if not self.process or not self.process.stdout:
            return None
        
        line = await self.process.stdout.readline()
        if not line:
            return None
        
        return json.loads(line.decode().strip())
    
    async def stop(self):
        """Terminate the Pi RPC process."""
        if self.process:
            self.process.terminate()
            await self.process.wait()`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/core/session_registry.py': `import os
import json
from pathlib import Path
from typing import Optional
import asyncio

SESSIONS_DIR = ".pi/sessions"

class SessionRegistry:
    """Manages session JSONL files for a project."""
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.sessions_dir = Path(project_path) / SESSIONS_DIR
    
    async def list_sessions(self) -> list[dict]:
        """List all sessions for this project."""
        if not self.sessions_dir.exists():
            return []
        
        sessions = []
        for f in sorted(self.sessions_dir.glob("*.jsonl")):
            content = json.loads(f.read_text())
            sessions.append(content)
        return sessions
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        """Get a specific session by ID."""
        session_file = self.sessions_dir / f"{session_id}.jsonl"
        if not session_file.exists():
            return None
        return json.loads(session_file.read_text())
    
    async def create_session(self, name: str) -> dict:
        """Create a new session."""
        import uuid
        session_id = str(uuid.uuid4())[:8]
        session = {
            "sessionId": session_id,
            "name": name,
            "project": self.project_path,
            "messages": [],
            "model": {"id": "claude-sonnet-4-20250514", "provider": "anthropic"},
        }
        session_file = self.sessions_dir / f"{session_id}.jsonl"
        self.sessions_dir.mkdir(parents=True, exist_ok=True)
        session_file.write_text(json.dumps(session, indent=2))
        return session`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/projects.py': `from fastapi import APIRouter, HTTPException
from pathlib import Path
import os

router = APIRouter()

@router.get("")
async def list_projects():
    """List all project folders in the current directory."""
    base = Path.cwd()
    entries = []
    for entry in sorted(os.scandir(base)):
        if entry.is_dir():
            entries.append({
                "name": entry.name,
                "path": entry.path,
            })
    return entries

@router.get("/{project_name}/files")
async def list_files(project_name: str, path: str = "/"):
    """List files in a project directory."""
    project_path = Path.cwd() / project_name
    resolved = Path(project_path) / path.lstrip("/")
    
    if not resolved.resolve().is_relative_to(project_path.resolve()):
        raise HTTPException(403, "Path traversal not allowed")
    
    files = []
    for entry in os.scandir(str(resolved)):
        files.append({
            "name": entry.name,
            "path": entry.path,
            "isDirectory": entry.is_dir(),
        })
    return files`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/sessions.py': `from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/{project_name}/sessions")
async def list_sessions(project_name: str):
    """List all sessions for a project."""
    return {"sessions": []}

@router.post("/{project_name}/sessions")
async def create_session(project_name: str, body: dict):
    """Create a new session for a project."""
    return {
        "sessionId": "demo-session-01",
        "name": body.get("name", "New Session"),
        "project": project_name,
    }`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/files.py': `from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/{project_name}/files/{file_path:path}")
async def read_file(project_name: str, file_path: str):
    """Read contents of a file."""
    return {
        "path": file_path,
        "content": "# File contents would go here\\n",
    }`,

  '/Users/karim/Projects/ocproject/remote-pi/web-pi/backend/app/api/models.py': `from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def list_models():
    """List all available models."""
    return [
        {"id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "provider": "Anthropic"},
        {"id": "gpt-4o-2024-05-13", "name": "GPT-4o", "provider": "OpenAI"},
    ]

@router.post("/{session_id}/model")
async def switch_model(session_id: str, body: dict):
    """Switch the model for a session."""
    return {"status": "ok", "model": body.get("modelId")}`,
};

export function mockProjectFiles(projectPath: string): FileNode[] {
  // Return a subset based on project path
  const base = '/Users/karim/Projects/ocproject/remote-pi/web-pi';
  if (projectPath.includes(base)) {
    return sampleProjectFiles;
  }
  // Generic fallback for other projects
  return [
    {
      name: 'src',
      path: `${projectPath}/src`,
      isDirectory: true,
      children: [
        { name: 'main.py', path: `${projectPath}/src/main.py`, isDirectory: false, size: 1200 },
        { name: 'utils.py', path: `${projectPath}/src/utils.py`, isDirectory: false, size: 890 },
      ],
    },
    { name: 'README.md', path: `${projectPath}/README.md`, isDirectory: false, size: 500 },
  ];
}

export function mockFileContent(path: string): string {
  return mockFileContents[path] || `// File: ${path}\n// Content not available in mock mode.\n`;
}
