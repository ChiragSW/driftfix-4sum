import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { MacOsChrome } from './components/MacOsChrome';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { useHistory } from './hooks/useHistory';

const App: React.FC = () => {
  const { history, addHistory, clearHistory } = useHistory();

  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <MacOsChrome />
        <NavBar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard onAddHistory={addHistory} />} />
            <Route path="/history" element={<History history={history} onClear={clearHistory} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
