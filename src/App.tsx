import { Routes, Route } from 'react-router-dom';
import { CharacterProvider } from './context/CharacterContext';
import Header from './components/Header';
import Notification from './components/Notification';
import RosterPage from './pages/RosterPage';
import CreatePage from './pages/CreatePage';
import PlayPage from './pages/PlayPage';

export default function App() {
  return (
    <CharacterProvider>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Header />
        <Notification />

        <main className="max-w-4xl mx-auto w-full px-2 sm:px-4">
          <Routes>
            <Route path="/" element={<RosterPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/play/:id" element={<PlayPage />} />
          </Routes>
        </main>

        <footer className="text-center py-8 mt-12 border-t border-surface-border text-xs text-wilder-amber">
          <p>© 2026 荒野盛宴 TTRPG 电子人物卡辅助工具. All Rules and Concepts belong to KC Shi and respective authors.</p>
          <p className="mt-1">Based on "Wilderfeast" core rules. Craft with Love & Wilderness.</p>
        </footer>
      </div>
    </CharacterProvider>
  );
}