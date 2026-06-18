import { useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { BookOpen as BookIcon } from 'lucide-react';
import { CharacterProvider, useCharacter } from './context/CharacterContext';
import Header from './components/Header';
import Notification from './components/Notification';
import RosterPage from './pages/RosterPage';
import CreatePage from './pages/CreatePage';
import PlayPage from './pages/PlayPage';

const ReferenceManualDrawer = lazy(() => import('./components/sheet/ReferenceManualDrawer').then(m => ({ default: m.ReferenceManualDrawer })));

function AppInner() {
  const location = useLocation();
  const { isManualDrawerOpen, setManualDrawerOpen } = useCharacter();

  const [activeAppendixTab, setActiveAppendixTab] = useState<'a' | 'b' | 'c' | 'd' | 'e'>('d');
  const [appendixSearchQuery, setAppendixSearchQuery] = useState('');
  const [appendixFilterWeapon, setAppendixFilterWeapon] = useState('all');

  const showManualButton = location.pathname === '/';

  return (
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

      {showManualButton && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 print:hidden">
          <button
            onClick={() => setManualDrawerOpen(!isManualDrawerOpen)}
            className="w-14 h-14 bg-orange-700 border-3 border-surface-border hover:bg-orange-600 rounded-full flex flex-col items-center justify-center text-white shadow-rough-md transition-all active:translate-x-0.5 active:translate-y-0.5 group relative"
          >
            <BookIcon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold mt-0.5 select-none">参考手册</span>
            <span className="absolute right-16 bg-surface-dark text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-surface-border">打开附录规则手册</span>
          </button>
        </div>
      )}

      {isManualDrawerOpen && (
        <div onClick={() => setManualDrawerOpen(false)} className="fixed inset-0 bg-stone-950/60 z-30 transition-opacity animate-fade-in print:hidden" />
      )}

      <Suspense fallback={<div className="text-xs text-ink-muted p-4 text-center">加载中...</div>}>
        <ReferenceManualDrawer
          isManualDrawerOpen={isManualDrawerOpen}
          setIsManualDrawerOpen={setManualDrawerOpen}
          activeAppendixTab={activeAppendixTab}
          setActiveAppendixTab={setActiveAppendixTab}
          appendixSearchQuery={appendixSearchQuery}
          setAppendixSearchQuery={setAppendixSearchQuery}
          appendixFilterWeapon={appendixFilterWeapon}
          setAppendixFilterWeapon={setAppendixFilterWeapon}
        />
      </Suspense>

      <footer className="text-center py-8 mt-12 border-t border-surface-border text-xs text-wilder-amber">
        <p>© 2026 荒野盛宴 TTRPG 电子人物卡辅助工具. All Rules and Concepts belong to KC Shi and respective authors.</p>
        <p className="mt-1">Based on "Wilderfeast" core rules. Craft with Love & Wilderness.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CharacterProvider>
      <AppInner />
    </CharacterProvider>
  );
}