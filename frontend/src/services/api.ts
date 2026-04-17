/**
 * API service for communicating with the FastAPI backend.
 * All fetch calls use relative URLs (Vite proxy or same-origin).
 */

const API_BASE = ''; // relative to Vite dev server or behind reverse proxy

/**
 * Derive just the project name from a path.
 * Works with full paths like "/Users/karim/Projects/my-project"
 * or just a project name like "my-project".
 */
function parseProjectName(fullPath: string): string {
  if (!fullPath) return '';
  const parts = fullPath.split('/').filter(Boolean);
  // If the path contains "Projects" in it, take the segment right after
  const projIdx = parts.indexOf('Projects');
  if (projIdx >= 0 && projIdx + 1 < parts.length) {
    return parts[projIdx + 1];
  }
  // Otherwise, the last segment IS the project name
  return parts[parts.length - 1];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/') || contentType.includes('application/octet-stream')) {
    return (await res.text()) as unknown as T;
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Browse / Directory Tree
// ---------------------------------------------------------------------------

export interface DirNode {
  path: string;
  name: string;
  isDirectory: true;
}

export async function listDirectories(path: string = ''): Promise<DirNode[]> {
  const qs = path ? `?path=${encodeURIComponent(path)}` : '';
  return request<DirNode[]>(`/api/browse${qs}`);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectInfo {
  path: string;
  exists: boolean;
  is_directory: boolean;
}

export async function listProjects(): Promise<string[]> {
  return request<string[]>('/api/projects');
}

export async function getProjectInfo(projectName: string): Promise<ProjectInfo> {
  return request<ProjectInfo>(`/api/projects/${encodeURIComponent(projectName)}/info`);
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  contextWindow?: number;
  maxTokens?: number;
  [key: string]: unknown;
}

export async function listModels(projectName?: string): Promise<ModelConfig[]> {
  const qs = projectName ? `?project_name=${encodeURIComponent(projectName)}` : '';
  return request<ModelConfig[]>(`/api/models/${qs}`);
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export interface FileInfo {
  path: string;
  isDirectory: boolean;
  size?: number;
}

/**
 * List files in a directory.
 * @param fullPath — full path of the project folder or just the project name
 * @param relativePath — optional sub-directory path (e.g. "src/backend/app")
 */
export async function listFiles(fullPath: string, relativePath = ''): Promise<FileInfo[]> {
  const projectName = parseProjectName(fullPath);
  const qs = relativePath ? `?path=${encodeURIComponent(relativePath)}` : '';
  return request<FileInfo[]>(`/api/projects/${encodeURIComponent(projectName)}/files${qs}`);
}

/**
 * Read a file's content.
 * @param fullPath — full path of the project folder or project name
 * @param filePath — relative path of the file inside the project (e.g. "src/main.py")
 */
export async function readFile(fullPath: string, filePath: string): Promise<string> {
  const projectName = parseProjectName(fullPath);
  const encodedPath = encodeURIComponent(filePath);
  return request<string>(`/api/projects/${encodeURIComponent(projectName)}/files/read/${encodedPath}`);
}
