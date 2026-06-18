import React from 'react';
import { getCharacterPortrait } from '../../icons';
import type { Character } from '../../types';

interface PortraitModalProps {
  isPortraitModalOpen: boolean;
  setIsPortraitModalOpen: (v: boolean) => void;
  setIsPortraitEditMode: (v: boolean) => void;
  activeChar: Character;
  characters: Character[];
  setCharacters: (chars: Character[]) => void;
  saveCustomCharacters: (chars: Character[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setSelectedCharId: (v: string) => void;
  editPortraitType: 'portrait' | 'upload' | 'drawing';
  setEditPortraitType: (v: 'portrait' | 'upload' | 'drawing') => void;
  editPortraitValue: string;
  setEditPortraitValue: (v: string) => void;
  handlePortraitUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openPortraitDrawingModal: () => void;
}

const PortraitModal = React.memo(function PortraitModal({
  isPortraitModalOpen,
  setIsPortraitModalOpen,
  setIsPortraitEditMode,
  activeChar,
  characters,
  setCharacters,
  saveCustomCharacters,
  showNotification,
  setSelectedCharId,
  editPortraitType,
  setEditPortraitType,
  editPortraitValue,
  setEditPortraitValue,
  handlePortraitUpload,
  openPortraitDrawingModal,
}: PortraitModalProps) {
  if (!isPortraitModalOpen || !activeChar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onTouchMove={(e) => e.preventDefault()}>
      <div className="bg-surface border-3 border-wilder-blue rounded-xl p-4 sm:p-6 max-w-lg w-full shadow-rough-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif font-bold text-wilder-blue text-base">编辑角色插图</h3>
          <button onClick={() => { setIsPortraitModalOpen(false); setIsPortraitEditMode(false); }} className="text-ink-muted hover:text-ink text-lg leading-none">&times;</button>
        </div>
        <div className="w-full h-48 border-3 border-dashed border-surface-border rounded-lg bg-surface-well mb-4 flex items-center justify-center overflow-hidden">
          {editPortraitType === 'portrait' ? getCharacterPortrait(activeChar.name, 160, 'text-ink') : editPortraitType === 'upload' || editPortraitType === 'drawing' ? <img src={editPortraitValue} alt="preview" className="w-full h-full object-contain" /> : <span className="text-xs text-ink-light">暂无插图</span>}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <label className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 cursor-pointer text-xs hover:bg-amber-100 transition-colors">
            📁 上传图片
            <input type="file" accept="image/*" onChange={handlePortraitUpload} className="hidden" />
          </label>
          <button type="button" onClick={openPortraitDrawingModal} className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs hover:bg-amber-100 transition-colors">✏️ 手绘</button>
          {activeChar && ['普莱兹', '巴格', '娜特·辛', '泰伦', '莲恩', '诺特'].includes(activeChar.name) && (
            <button type="button" onClick={() => { setEditPortraitType('portrait'); setEditPortraitValue(''); }} className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs hover:bg-amber-100 transition-colors">🖼️ 默认肖像</button>
          )}
          {(editPortraitType === 'upload' || editPortraitType === 'drawing') && (
            <button type="button" onClick={() => { setEditPortraitType('portrait'); setEditPortraitValue(''); }} className="btn-sketch rounded px-3 py-1.5 bg-red-50 border-red-300 text-red-600 text-xs hover:bg-red-100 transition-colors">🗑️ 清除</button>
          )}
        </div>
        <div className="flex justify-end space-x-2 border-t border-surface-border pt-3">
          <button onClick={() => { setIsPortraitModalOpen(false); setIsPortraitEditMode(false); }} className="text-xs bg-surface border border-surface-border text-ink px-3 py-1.5 rounded hover:bg-surface-border transition-colors">取消</button>
          <button
            onClick={() => {
              const updated = characters.map(c => c.id === activeChar.id ? { ...c, backgroundType: editPortraitType, backgroundValue: editPortraitValue } : c);
              setCharacters(updated);
              if (activeChar.isCustom) {
                const customs = characters.filter(c => c.isCustom);
                const idx = customs.findIndex(c => c.id === activeChar.id);
                if (idx !== -1) { customs[idx] = updated.find(c => c.id === activeChar.id)!; saveCustomCharacters(customs); }
              } else {
                const customs = characters.filter(c => c.isCustom);
                const pregenInCustoms = customs.find(c => c.id === activeChar.id);
                if (pregenInCustoms) { const idx = customs.findIndex(c => c.id === activeChar.id); customs[idx] = updated.find(c => c.id === activeChar.id)!; saveCustomCharacters(customs); }
                else { const cloned = { ...updated.find(c => c.id === activeChar.id)!, id: `${activeChar.id}_session`, isCustom: true }; saveCustomCharacters([...customs, cloned]); setSelectedCharId(cloned.id); }
              }
              setIsPortraitModalOpen(false);
              setIsPortraitEditMode(false);
              showNotification('角色插图已更新！', 'success');
            }}
            className="text-xs bg-wilder-blue text-white px-4 py-1.5 rounded font-bold hover:bg-wilder-blue transition-colors"
          >✅ 确认</button>
        </div>
      </div>
    </div>
  );
});

export { PortraitModal };