import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { mockFolders } from '../services/mockData';
import './views.css';

export default function FolderSelector() {
  const { setSelectedFolder, setSelectedModel, setView } = useApp();
  const [search, setSearch] = useState('');

  const folders = useMemo(() => mockFolders(), []);

  const filteredFolders = useMemo(
    () => folders.filter((f) => f.toLowerCase().includes(search.toLowerCase())),
    [folders, search]
  );

  const handleOpen = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedModel(null);
    setView('models');
  };

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
          {filteredFolders.length === 0 && (
            <p className="view-folder__empty">No folders found matching &ldquo;{search}&rdquo;</p>
          )}
          {filteredFolders.map((folder) => (
            <div key={folder} className="view-folder__item">
              <div className="view-folder__item-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div className="view-folder__item-content">
                <div className="view-folder__item-name">{folder.split('/').filter(Boolean).pop()}</div>
                <div className="view-folder__item-path">{folder}</div>
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
