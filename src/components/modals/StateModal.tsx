import React from 'react';
import { APPENDIX_STATES } from '../../appendixData';
import type { Character } from '../../types';

interface StateModalProps {
  isStateModalOpen: boolean;
  setIsStateModalOpen: (v: boolean) => void;
  activeChar: Character;
  characters: Character[];
  setCharacters: (chars: Character[]) => void;
  saveCustomCharacters: (chars: Character[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  appendixSearchQuery: string;
  pendingState: string;
  setPendingState: (v: string) => void;
  pendingStateLevel: number;
  setPendingStateLevel: (v: number) => void;
  setSelectedCharId: (v: string) => void;
}

const StateModal = React.memo(function StateModal({
  isStateModalOpen,
  setIsStateModalOpen,
  activeChar,
  characters,
  setCharacters,
  saveCustomCharacters,
  showNotification,
  appendixSearchQuery,
  pendingState,
  setPendingState,
  pendingStateLevel,
  setPendingStateLevel,
  setSelectedCharId,
}: StateModalProps) {
  if (!isStateModalOpen || !activeChar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onTouchMove={(e) => e.preventDefault()}>
      <div className="bg-surface border-3 border-wilder-blue rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-rough-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif font-bold text-wilder-blue text-base">添加状态</h3>
          <button onClick={() => setIsStateModalOpen(false)} className="text-ink-muted hover:text-ink text-lg leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {APPENDIX_STATES.filter(s => !appendixSearchQuery || s.name.includes(appendixSearchQuery) || s.effect.includes(appendixSearchQuery)).map(s => {
            const isX = s.name.includes('X');
            const rangeMatch = s.name.match(/(\d+)至(\d+)/);
            const hasRange = !!rangeMatch;
            const minLevel = hasRange ? parseInt(rangeMatch![1]) : 1;
            const maxLevel = hasRange ? parseInt(rangeMatch![2]) : 20;
            const displayName = s.name.replace(/ X$/, '').replace(/ \d+至\d+$/, '');
            const baseName = s.name.includes('至') ? s.name.replace(/ \d+至\d+$/, '') : s.name.replace(/ X$/, '').trim();
            const isSelected = pendingState === baseName;
            return (
              <div key={s.name} className="p-2 rounded border border-surface-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{displayName}</span>
                  <div className="flex items-center space-x-2">
                    {(isX || hasRange) && (
                      <input type="number" min={minLevel} max={maxLevel} value={isSelected ? pendingStateLevel : minLevel}
                        onChange={(e) => { setPendingState(baseName); setPendingStateLevel(Math.max(minLevel, Math.min(maxLevel, parseInt(e.target.value) || minLevel))); }}
                        onClick={() => setPendingState(baseName)}
                        className="w-12 text-center text-[10px] bg-surface-well border border-surface-border rounded px-1 py-0.5 text-ink" placeholder="等级" />
                    )}
                    <button
                      onClick={() => {
                        const level = (isX || hasRange) ? (isSelected && pendingState === baseName ? pendingStateLevel : minLevel) : 1;
                        const existing = activeChar.statesActive.find(st => st.name === baseName);
                        const newStates = existing ? activeChar.statesActive.map(st => st.name === baseName ? { ...st, level: st.level + level } : st) : [...activeChar.statesActive, { name: baseName, level }];
                        const updated = characters.map(c => c.id === activeChar.id ? { ...c, statesActive: newStates } : c);
                        setCharacters(updated);
                        if (!activeChar.isCustom) {
                          const customs = characters.filter(c => c.isCustom);
                          const pregenInCustoms = customs.find(c => c.id === activeChar.id);
                          if (pregenInCustoms) { const idx = customs.findIndex(c => c.id === activeChar.id); customs[idx] = updated.find(c => c.id === activeChar.id)!; saveCustomCharacters(customs); }
                          else { const cloned = { ...updated.find(c => c.id === activeChar.id)!, id: `${activeChar.id}_session`, isCustom: true }; saveCustomCharacters([...customs, cloned]); setSelectedCharId(cloned.id); }
                        } else { saveCustomCharacters(updated.filter(c => c.isCustom)); }
                        showNotification(`已添加状态：${baseName}`, 'success');
                        setIsStateModalOpen(false);
                        setPendingState('');
                        setPendingStateLevel(1);
                      }}
                      className="text-[10px] bg-wilder-blue/10 text-wilder-blue border border-wilder-blue/30 px-2 py-0.5 rounded hover:bg-wilder-blue/20 flex-shrink-0"
                    >+ 添加</button>
                  </div>
                </div>
                <p className="text-[10px] text-ink-muted mt-1">{s.effect}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export { StateModal };