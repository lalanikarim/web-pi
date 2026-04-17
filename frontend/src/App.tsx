import { AppProvider, useApp } from './store/AppContext';
import './index.css';

import FolderSelector from './views/FolderSelector';
import ModelSelector from './views/ModelSelector';
import Workspace from './views/Workspace';

function AppContent() {
  const { view } = useApp();

  switch (view) {
    case 'models':
      return <ModelSelector />;
    case 'workspace':
      return <Workspace />;
    case 'folders':
    default:
      return <FolderSelector />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
