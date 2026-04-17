import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useModels } from '../hooks/useModels';
import './views.css';
import './common.css';

export default function ModelSelector() {
  const { selectedFolder, selectedModel, setSelectedModel, switchModel, setCurrentModel, setView } = useApp();
  const { models, loading, error } = useModels();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async () => {
    if (!selectedModel || !selectedFolder) return;
    setSwitching(true);
    try {
      // Switch model on backend (session_id is generated when WebSocket connects)
      // For now, we switch on connect in the Workspace — this sets the UI selection
      switchModel(selectedModel);
      setCurrentModel(selectedModel);
      setView('workspace');
    } catch (e) {
      console.error('Failed to switch model:', e);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="view-models">
      <div className="view-models__inner">
        <div className="view-models__header">
          <button className="view-models__back" onClick={() => setView('folders')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1>Choose a Model</h1>
          <p className="view-models__project">Project: {selectedFolder?.split('/').filter(Boolean).pop()}</p>
        </div>

        {loading && <p className="view-models__loading">Loading models...</p>}
        {error && <p className="view-models__error">{error}</p>}

        {!loading && !error && (
          <div className="view-models__list">
            {models.map((model) => (
              <div
                key={model.id}
                className={`view-models__card ${selectedModel?.id === model.id ? 'view-models__card--selected' : ''}`}
                onClick={() => setSelectedModel(model)}
              >
                <div className="view-models__card-header">
                  <div className="view-models__card-name">{model.name}</div>
                  {selectedModel?.id === model.id && (
                    <span className="view-models__badge">Selected</span>
                  )}
                </div>
                <div className="view-models__card-meta">
                  <span>{model.provider}</span>
                  {model.contextWindow > 0 && (
                    <>
                      <span className="view-models__divider">&middot;</span>
                      <span>{model.contextWindow.toLocaleString()} context</span>
                    </>
                  )}
                  {model.maxTokens > 0 && (
                    <>
                      <span className="view-models__divider">&middot;</span>
                      <span>{model.maxTokens.toLocaleString()} max tokens</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="view-models__actions">
          <button
            className="btn btn--primary btn--lg"
            disabled={!selectedModel || switching}
            onClick={handleSwitch}
          >
            {switching ? 'Switching...' : 'Switch Model & Open'}
          </button>
        </div>
      </div>
    </div>
  );
}
