import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { listProjects } from '../services/api';
import './views.css';

export default function FolderSelector() {
  const { setSelectedFolder, setSelectedModel, setView } = useApp();
  const [search, setSearch] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProjects()
      .then((projectNames) => {
        // Convert project names to full paths (backend returns names, we build paths)
        // The backend lists subdirectories of ~/Projects, returns just names.
        // We store them as-is; the path will be constructed when needed.
        setFolders(projectNames);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load projects');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredFolders = useMemo(() => {
    if (!search.trim()) return folders;
    const q = search.toLowerCase();
    return folders.filter((f) => f.toLowerCase().includes(q));
  }, [folders, search]);

  const handleOpen = (folderName: string) => {
    // Store the folder name (backend resolves ~/Projects/{name})
    setSelectedFolder(folderName);
    setSelectedModel(null);
    setView('models');
  };

  if (loading) {
    return (
      <div className="view-folder">
        <div className="view-folder__inner">
          <div className="view-folder__header">
            <h1>Open Project</h1>
            <p className="view-folder__subtitle">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-folder">
      <div className="view-folder__inner">
        <div className="view-folder__header">
          <h1>Open Project</h1>
          <p className="view-folder__subtitle">Select a project folder to open with Pi</p>
        </div>

        <div className="view-folder__search">
          <svg className="view-folder__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search folders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="view-folder__list">
          {error && <p className="view-folder__empty" style={{ color: '#e85d75' }}>{error}</p>}
          {filteredFolders.length === 0 && !error && (
            <p className="view-folder__empty">No projects found under ~/Projects</p>
          )}
          {filteredFolders.map((folder) => (
            <div key={folder} className="view-folder__item">
              <div className="view-folder__item-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div className="view-folder__item-content">
                <div className="view-folder__item-name">{folder}</div>
              </div>
              <button className="view-folder__open-btn" onClick={() => handleOpen(folder)}>
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
