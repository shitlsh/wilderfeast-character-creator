import React from 'react';
import { APPENDIX_TECHNIQUES, APPENDIX_TRAITS } from '../../appendixData';
import { LINEAGES } from '../../data';
import type { Character } from '../../types';

interface PickerModalProps {
  pickerModal: 'none' | 'technique' | 'trait';
  setPickerModal: (v: 'none' | 'technique' | 'trait') => void;
  activeChar: Character;
  characters: Character[];
  setCharacters: (chars: Character[]) => void;
  saveCustomCharacters: (chars: Character[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setSelectedCharId: (v: string) => void;
  pickerSearch: string;
  setPickerSearch: (v: string) => void;
}

const PickerModal = React.memo(function PickerModal({
  pickerModal,
  setPickerModal,
  activeChar,
  characters,
  setCharacters,
  saveCustomCharacters,
  showNotification,
  setSelectedCharId,
  pickerSearch,
  setPickerSearch,
}: PickerModalProps) {
  if (pickerModal === 'none' || !activeChar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onTouchMove={(e) => e.preventDefault()}>
      <div className="bg-surface border-3 border-wilder-blue rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-rough-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif font-bold text-wilder-blue text-base">{pickerModal === 'technique' ? '选择战技' : '选择特性'}</h3>
          <button onClick={() => setPickerModal('none')} className="text-ink-muted hover:text-ink text-lg leading-none">&times;</button>
        </div>

        {pickerModal === 'technique' && (
          <input type="text" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} placeholder={`搜索${activeChar?.tool || ''}战技或通用战技...`} className="text-xs bg-surface-well border border-surface-border rounded px-2 py-1.5 text-ink w-full mb-3" />
        )}
        {pickerModal === 'trait' && (
          <input type="text" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} placeholder="搜索特性名称..." className="text-xs bg-surface-well border border-surface-border rounded px-2 py-1.5 text-ink w-full mb-3" />
        )}

        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 border-t border-surface-border pt-3">
          {pickerModal === 'technique' && (
            <>
              {APPENDIX_TECHNIQUES.filter(t => {
                if (!activeChar) return false;
                const toolName = activeChar.tool;
                const isToolSpecific = t.weapon === toolName;
                const isGeneral = t.weapon.includes('/') && t.weapon.includes(toolName);
                if (!isToolSpecific && !isGeneral) return false;
                if (pickerSearch && !t.name.includes(pickerSearch) && !t.effect.includes(pickerSearch)) return false;
                return true;
              }).map(t => (
                <div
                  key={t.name}
                  onClick={() => {
                    if (!activeChar || activeChar.techniques.includes(t.name)) { showNotification('该战技已存在', 'info'); }
                    else {
                      const updated = characters.map(c => c.id === activeChar.id ? { ...c, techniques: [...c.techniques, t.name] } : c);
                      setCharacters(updated);
                      if (!activeChar.isCustom) {
                        const customs = characters.filter(c => c.isCustom);
                        const pregenInCustoms = customs.find(c => c.id === activeChar.id);
                        if (pregenInCustoms) { const idx = customs.findIndex(c => c.id === activeChar.id); customs[idx] = updated.find(c => c.id === activeChar.id)!; saveCustomCharacters(customs); }
                        else { const cloned = { ...updated.find(c => c.id === activeChar.id)!, id: `${activeChar.id}_session`, isCustom: true }; saveCustomCharacters([...customs, cloned]); setSelectedCharId(cloned.id); }
                      } else { saveCustomCharacters(updated.filter(c => c.isCustom)); }
                      showNotification(`已添加战技：${t.name}`, 'success');
                    }
                    setPickerModal('none');
                  }}
                  className="p-2 rounded cursor-pointer hover:bg-wilder-blue/10 border border-surface-border text-xs flex items-start justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-ink">{t.name}</span>
                    <span className="text-[9px] text-ink-light ml-1">[{t.weapon.includes('/') ? `通用 (${t.weapon})` : t.weapon}]</span>
                    <span className="text-[9px] bg-surface-border px-1 rounded ml-1 text-ink-light">{t.cost}</span>
                    <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-2">{t.effect}</p>
                  </div>
                  <span className="text-wilder-blue text-xs ml-2 flex-shrink-0">{activeChar && activeChar.techniques.includes(t.name) ? '✓' : '+'}</span>
                </div>
              ))}
            </>
          )}
          {pickerModal === 'trait' && (
            <>
              {LINEAGES.flatMap(l => l.traits).concat(APPENDIX_TRAITS.map(t => ({ name: t.name, cost: t.cost, effect: t.effect })))
                .filter(t => {
                  if (!activeChar) return false;
                  if (activeChar.traits.slice(2).includes(t.name) || t.name === '毅力' || t.name === '洞察') return false;
                  if (pickerSearch && !t.name.includes(pickerSearch) && !t.effect.includes(pickerSearch)) return false;
                  return true;
                })
                .map(t => (
                  <div
                    key={t.name}
                    onClick={() => {
                      if (!activeChar) return;
                      const newTraits = [...activeChar.traits, t.name];
                      const updated = characters.map(c => c.id === activeChar.id ? { ...c, traits: newTraits } : c);
                      setCharacters(updated);
                      if (!activeChar.isCustom) {
                        const customs = characters.filter(c => c.isCustom);
                        const pregenInCustoms = customs.find(c => c.id === activeChar.id);
                        if (pregenInCustoms) { const idx = customs.findIndex(c => c.id === activeChar.id); customs[idx] = updated.find(c => c.id === activeChar.id)!; saveCustomCharacters(customs); }
                        else { const cloned = { ...updated.find(c => c.id === activeChar.id)!, id: `${activeChar.id}_session`, isCustom: true }; saveCustomCharacters([...customs, cloned]); setSelectedCharId(cloned.id); }
                      } else { saveCustomCharacters(updated.filter(c => c.isCustom)); }
                      showNotification(`已添加特性：${t.name}`, 'success');
                      setPickerModal('none');
                    }}
                    className="p-2 rounded cursor-pointer hover:bg-emerald-50 border border-surface-border text-xs"
                  >
                    <span className="font-bold text-emerald-900">{t.name}</span>
                    <span className="text-[9px] bg-amber-900 text-white px-1 rounded ml-1">{t.cost || '被动'}</span>
                    <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-2">{t.effect}</p>
                  </div>
                ))}
            </>
          )}
        </div>

        <div className="flex justify-end mt-3 pt-3 border-t border-surface-border">
          <button onClick={() => setPickerModal('none')} className="text-xs bg-surface border border-surface-border text-ink px-3 py-1.5 rounded hover:bg-surface-border">关闭</button>
        </div>
      </div>
    </div>
  );
});

export { PickerModal };