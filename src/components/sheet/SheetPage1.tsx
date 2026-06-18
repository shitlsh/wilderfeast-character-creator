import React from 'react';
import {
  TOOLS, LINEAGES
} from '../../data';
import { APPENDIX_TRAITS, APPENDIX_STATES } from '../../appendixData';
import { getInkIcon } from '../../icons';
import type { Character } from '../../types';

interface SheetPage1Props {
  activeChar: Character;
  selectedRollStyle: string;
  setSelectedRollStyle: (v: string) => void;
  selectedRollSkill: string;
  setSelectedRollSkill: (v: string) => void;
  setIsDiceDrawerOpen: (v: boolean) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  updateActiveCharStyle: (styleKey: string, val: number) => void;
  updateActiveCharSkill: (skillKey: string, val: number) => void;
  updateActiveCharStat: (key: 'stamina' | 'durability' | 'harmony' | 'harmonyMax' | 'notes', val: any) => void;
  setPickerModal: (v: 'none' | 'technique' | 'trait') => void;
  setPickerSearch: (v: string) => void;
  setIsStateModalOpen: (v: boolean) => void;
  setPendingState: (v: string) => void;
  setPendingStateLevel: (v: number) => void;
  characters: Character[];
  setCharacters: (chars: Character[]) => void;
  setSelectedCharId: (id: string) => void;
  saveCustomCharacters: (chars: Character[]) => void;
}

const SheetPage1 = React.memo(function SheetPage1({
  activeChar,
  selectedRollStyle,
  setSelectedRollStyle,
  selectedRollSkill,
  setSelectedRollSkill,
  setIsDiceDrawerOpen,
  showNotification,
  updateActiveCharStyle,
  updateActiveCharSkill,
  updateActiveCharStat,
  setPickerModal,
  setPickerSearch,
  setIsStateModalOpen,
  setPendingState,
  setPendingStateLevel,
  characters,
  setCharacters,
  setSelectedCharId,
  saveCustomCharacters,
}: SheetPage1Props) {
  return (
    <div id="sheet-page-1" className="bg-[#faf6ef] text-ink p-6 rounded border-2 border-surface-border shadow-rough space-y-6 relative overflow-hidden">
      <div className="flex justify-between items-center border-b-2 border-surface-border pb-4">
        <div className="flex items-center space-x-2">
          <span className="text-ink">{getInkIcon('屠夫', 32)}</span>
          <span className="font-serif font-black text-2xl tracking-wider text-sky-950">属性</span>
          <span className="text-ink rotate-180">{getInkIcon('屠夫', 32)}</span>
        </div>
        <span className="text-xs font-serif font-bold text-ink-muted border border-stone-400 px-2 py-0.5 rounded bg-white/50">PAGE 1 / 2</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-surface-border divide-y-2 md:divide-y-0 md:divide-x-2 divide-stone-900 bg-white font-serif text-sm">
        <div className="p-2">
          <span className="block text-[10px] text-ink-light font-bold uppercase">角色名</span>
          <span className="font-extrabold text-lg text-ink">{activeChar.name}</span>
        </div>
        <div className="p-2">
          <span className="block text-[10px] text-ink-light font-bold uppercase">玩家名</span>
          <span className="font-extrabold text-lg text-ink">{activeChar.playerName || activeChar.name}</span>
        </div>
        <div className="p-2 bg-amber-50">
          <span className="block text-[10px] text-amber-700 font-bold uppercase">专长 (谱系)</span>
          <span className="font-extrabold text-lg text-amber-900 flex items-center gap-1.5">
            {getInkIcon(activeChar.specialty, 18, 'text-amber-800')}
            {activeChar.specialty}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 border-2 border-orange-500 rounded p-4 bg-orange-50/50 space-y-3">
          <div className="flex items-center justify-center select-none mt-[-5px]">
            <svg className="w-full h-8 max-w-[150px] text-wilder-amber" viewBox="0 0 160 30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15l4-4 4 4-4 4zM24 15l3-3 3 3-3 3z" strokeWidth="1.5" />
              <path d="M136 15l3-3 3 3-3 3zM148 15l4-4 4 4-4 4z" strokeWidth="1.5" />
              <text x="80" y="19" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="serif" stroke="none" fill="currentColor">风 格</text>
            </svg>
          </div>
          <p className="text-[9px] text-wilder-amber text-center leading-none mt-[-4px]">点击属性，在右侧骰池中快速装填风格骰</p>

          <div className="space-y-2.5">
            {([{ key: 'power', label: '力量', desc: '强大、坚韧、坚定或直率' },{ key: 'precision', label: '精准', desc: '冷静、条理、专注或准确' },{ key: 'swiftness', label: '迅捷', desc: '迅速、活力、警觉或灵巧' },{ key: 'technique', label: '技巧', desc: '巧妙、狡诈、技术性或精明' }] as const).map(st => {
              const val = activeChar.styleValues[st.key] || 1;
              const isSelected = selectedRollStyle === st.label;
              return (
                <div
                  key={st.key}
                  onClick={() => { setSelectedRollStyle(st.label); setIsDiceDrawerOpen(true); showNotification(`已选择风格骰：[${st.label}] (${val}d6)`, 'info'); }}
                  className={`border-2 border-surface-border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-[#fc8419] text-white shadow-rough border-surface-border scale-[1.02]' : 'bg-white hover:bg-orange-100 text-ink'}`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-serif font-extrabold text-sm block">{st.label}</span>
                    <span className={`text-[8px] block leading-snug ${isSelected ? 'text-wilder-amber' : 'text-ink-light'}`}>{st.desc}</span>
                  </div>

                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => updateActiveCharStyle(st.key, Math.max(1, val - 1))} className="w-6 h-6 bg-surface-border hover:bg-surface-border border border-surface-border flex items-center justify-center font-bold text-ink rounded-sm text-xs">-</button>
                    <div className="border border-surface-border px-3 py-1 bg-surface-border font-mono font-black text-sm text-ink rounded-sm min-w-[28px] text-center">{val}</div>
                    <button onClick={() => updateActiveCharStyle(st.key, Math.min(5, val + 1))} className="w-6 h-6 bg-surface-border hover:bg-surface-border border border-surface-border flex items-center justify-center font-bold text-ink rounded-sm text-xs">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 border-2 border-sky-950 rounded p-4 bg-sky-50/20 space-y-3">
          <div className="flex items-center justify-center select-none mt-[-5px]">
            <svg className="w-full h-8 max-w-lg text-sky-950" viewBox="0 0 320 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 15c4-2.5 12-3.5 17-1.5c2.5.8 4 2.5 4 4.2s-1.5 3.3-4 4.2c-5 2-13 1-17-1.5l-2.5 3.5V11.5l2.5 3.5z" strokeWidth="1.5" />
              <circle cx="18" cy="14" r="0.8" fill="currentColor" stroke="none" />
              <path d="M28 12h84M28 18h84" strokeWidth="1.5" />
              <path d="M208 12h106M208 18h106" strokeWidth="1.5" />
              <text x="160" y="19" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="serif" stroke="none" fill="currentColor">技  能</text>
            </svg>
          </div>
          <p className="text-[9px] text-sky-800 text-center leading-none mt-[-4px]">点击对应技能，在右侧骰池中快速装填（使用小箭头直接修改属性增长）</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-2 border-surface-border bg-white text-xs font-serif shadow-sm">
            {['激励', '展示', '射击', '发声', '抓取', '打击', '手艺', '储存', '学习', '治愈', '搜索', '穿越'].map((sk, index) => {
              const val = activeChar.skills[sk] || 0;
              const isSelected = selectedRollSkill === sk;
              return (
                <div
                  key={sk}
                  onClick={() => { setSelectedRollSkill(sk); setIsDiceDrawerOpen(true); showNotification(`已选择技能：[${sk}] (+${val})`, 'info'); }}
                  className={`p-2 flex items-center justify-between cursor-pointer transition-all ${index < 9 ? 'border-b-2 border-surface-border' : 'border-b-2 border-surface-border md:border-b-0'} ${index === 11 ? 'border-b-0' : ''} ${index % 3 !== 2 ? 'md:border-r-2 md:border-surface-border' : ''} ${isSelected ? 'bg-sky-50 font-extrabold text-sky-950' : 'hover:bg-surface-border text-ink'}`}
                >
                  <span className={val > 0 ? 'text-sky-900 font-extrabold' : 'text-ink'}>{sk}</span>
                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-surface-border border border-surface-border px-1.5 py-0.5 rounded-sm">
                      <span className="font-bold text-[11px] text-sky-900">+{val}</span>
                    </div>
                    <div className="flex flex-col -space-y-0.5">
                      <button onClick={() => updateActiveCharSkill(sk, Math.min(3, val + 1))} className="w-3.5 h-3.5 bg-surface-border hover:bg-surface-border border border-stone-400 flex items-center justify-center text-[8px] text-ink rounded-sm font-bold">▲</button>
                      <button onClick={() => updateActiveCharSkill(sk, Math.max(0, val - 1))} className="w-3.5 h-3.5 bg-surface-border hover:bg-surface-border border border-stone-400 flex items-center justify-center text-[8px] text-ink rounded-sm font-bold">▼</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-surface-border">
        <div className="border-3 border-surface-border bg-white rounded p-4 space-y-3 relative shadow-sm">
          <div className="absolute top-1 right-2 flex space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fc8419]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#fc8419]"></span>
          </div>
          <h4 className="font-serif font-black text-md text-ink border-b-2 border-surface-border pb-1.5 flex items-center gap-1">❖ 工具与战技 ❖</h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-border p-2 border border-surface-border rounded">
              <span className="block text-[9px] text-ink-light font-bold uppercase">装备工具</span>
              <span className="font-bold text-ink text-sm">{activeChar.tool}</span>
            </div>
            <div className="bg-surface-border p-2 border border-surface-border rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="block text-[9px] text-ink-light font-bold uppercase">当前耐久</span>
                <span className="block text-[9px] text-ink-light font-bold uppercase">最大耐久</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink text-sm">{activeChar.durability}</span>
                <span className="font-bold text-ink text-sm">{activeChar.durabilityMax}</span>
              </div>
              <div className="flex justify-center space-x-2 mt-1">
                <button onClick={() => updateActiveCharStat('durability', activeChar.durability - 1)} className="px-2 py-0.5 bg-surface border border-orange-700 rounded font-bold hover:bg-orange-800 text-[10px]">-1</button>
                <button onClick={() => updateActiveCharStat('durability', activeChar.durability + 1)} className="px-2 py-0.5 bg-surface border border-orange-700 rounded font-bold hover:bg-orange-800 text-[10px]">+1</button>
              </div>
            </div>
            <div className="col-span-2 bg-surface-border p-2 border border-surface-border rounded text-[11px]">
              <span className="font-bold text-ink">射程: </span>
              <span className="font-mono">1 (打击)</span> | 损坏时：射程:1(打击)。该身体部位造成伤害减半。
            </div>
          </div>

          <div className="pt-2 border-t border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="block text-[10px] font-bold text-ink-light uppercase">战技:</span>
              <button onClick={() => { setPickerModal('technique'); setPickerSearch(''); }} className="text-[9px] bg-wilder-blue/10 text-wilder-blue border border-wilder-blue/30 px-1.5 py-0.5 rounded hover:bg-wilder-blue/20">+ 添加战技</button>
            </div>
            {activeChar.techniques && activeChar.techniques.length > 0 ? (
              activeChar.techniques.map(tName => {
                const foundTech = TOOLS.flatMap(tl => tl.techniques).find(tk => tk.name === tName);
                return (
                  <div key={tName} className="flex items-start justify-between group">
                    <div className="text-xs flex-1 min-w-0">
                      <span className="font-bold text-ink">{tName}</span>
                      <span className="text-[9px] text-ink-muted ml-1">{foundTech?.cost || '被动'}</span>
                      <p className="text-[10px] text-ink-muted leading-snug mt-0.5 break-words">{foundTech?.effect || tName}</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = characters.map(c => c.id === activeChar.id ? { ...c, techniques: c.techniques.filter((t: string) => t !== tName) } : c);
                        setCharacters(updated);
                        if (!activeChar.isCustom) {
                          const customs = characters.filter(c => c.isCustom);
                          const pregenInCustoms = customs.find(c => c.id === activeChar.id);
                          if (pregenInCustoms) {
                            const idx = customs.findIndex(c => c.id === activeChar.id);
                            customs[idx] = updated.find(c => c.id === activeChar.id)!;
                            saveCustomCharacters(customs);
                          } else {
                            const cloned = { ...updated.find(c => c.id === activeChar.id)!, id: `${activeChar.id}_session`, isCustom: true };
                            saveCustomCharacters([...customs, cloned]);
                            setSelectedCharId(cloned.id);
                          }
                        } else {
                          saveCustomCharacters(updated.filter(c => c.isCustom));
                        }
                      }}
                      className="text-ink-light hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                      title="移除战技"
                    >×</button>
                  </div>
                );
              })
            ) : (
              <p className="text-[10px] text-ink-light italic">暂无战技</p>
            )}
          </div>
        </div>

        <div className="border-3 border-emerald-800 bg-emerald-50/10 rounded p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-1.5">
            <h4 className="font-serif font-black text-md text-emerald-950">❖ 特性 ❖</h4>
            <button onClick={() => { setPickerModal('trait'); setPickerSearch(''); }} className="text-[9px] bg-emerald-900/10 text-emerald-900 border border-emerald-900/30 px-1.5 py-0.5 rounded hover:bg-emerald-900/20">+ 添加特性</button>
          </div>
          <div className="space-y-3 text-xs leading-tight">
            <div className="border-b border-dashed border-emerald-300 pb-1.5 flex items-start justify-between">
              <div>
                <span className="font-extrabold text-emerald-900">毅力。</span>
                <span className="text-[9px] text-ink-muted ml-1">1次成功</span>
                <p className="text-[10px] text-ink mt-0.5">将 行动评级 [A] 增加 1。</p>
              </div>
            </div>
            <div className="border-b border-dashed border-emerald-300 pb-1.5 flex items-start justify-between">
              <div>
                <span className="font-extrabold text-emerald-900">洞察。</span>
                <span className="text-[9px] text-ink-muted ml-1">1次成功</span>
                <p className="text-[10px] text-ink mt-0.5">确立一个关于当前情境的细节。</p>
              </div>
            </div>

            {activeChar.traits.slice(2).map((tName: string, idx: number) => {
              let trEffect = '融入你自身的野性肉体异能与突变绝技。';
              let trCost = '被动';
              const foundA = APPENDIX_TRAITS.find(at => at.name === tName);
              if (foundA) { trEffect = foundA.effect; trCost = foundA.cost; }
              else {
                const foundLineageTrait = LINEAGES.flatMap(l => l.traits).find(t => t.name === tName);
                if (foundLineageTrait) { trEffect = foundLineageTrait.effect; trCost = foundLineageTrait.cost || '被动'; }
              }
              return (
                <div key={tName} className="flex items-start justify-between group">
                  <div>
                    <span className="font-extrabold text-amber-900">{tName}。</span>
                    <span className="text-[9px] text-ink-muted ml-1">{trCost}</span>
                    <p className="text-[10px] text-ink mt-0.5">{trEffect}</p>
                  </div>
                  <button
                    onClick={() => {
                      const newTraits = [...activeChar.traits];
                      newTraits.splice(idx + 2, 1);
                      const updated = characters.map(c => c.id === activeChar.id ? { ...c, traits: newTraits } : c);
                      setCharacters(updated);
                      if (!activeChar.isCustom) {
                        const customs = characters.filter(c => c.isCustom);
                        const pregenInCustoms = customs.find(c => c.id === activeChar.id);
                        if (pregenInCustoms) { const index = customs.findIndex(c => c.id === activeChar.id); customs[index] = updated.find(c => c.id === activeChar.id)!; saveCustomCharacters(customs); }
                        else { const cloned = { ...updated.find(c => c.id === activeChar.id)!, id: `${activeChar.id}_session`, isCustom: true }; saveCustomCharacters([...customs, cloned]); setSelectedCharId(cloned.id); }
                      } else { saveCustomCharacters(updated.filter(c => c.isCustom)); }
                    }}
                    className="text-ink-light hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                    title="移除特性"
                  >×</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-3 border-red-600 bg-red-50/10 rounded p-4 space-y-3 mt-6">
        <div className="flex items-center justify-between border-b border-red-600 pb-1.5">
          <h4 className="font-serif font-black text-xs text-red-700">⚠️ 状态</h4>
          <button onClick={() => { setIsStateModalOpen(true); setPendingState(''); setPendingStateLevel(1); }} className="text-[9px] bg-wilder-blue/10 text-wilder-blue border border-wilder-blue/30 px-1.5 py-0.5 rounded hover:bg-wilder-blue/20">+ 添加状态</button>
        </div>
        {activeChar.statesActive.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {activeChar.statesActive.map((st, i) => {
                const found = APPENDIX_STATES.find(s => s.name.replace('X', '').trim() === st.name || s.name.startsWith(st.name));
                return (
                  <div key={`${st.name}-${i}`} className="flex items-center bg-red-600/10 text-red-700 border border-red-600/30 rounded px-2.5 py-1 group">
                    <span className="font-bold text-xs font-serif">{st.name}{found?.name.includes('X') || found?.name.includes('至') ? st.level : ''}</span>
                    <button
                      onClick={() => {
                        const newStates = activeChar.statesActive.filter((_, idx) => idx !== i);
                        const updated = characters.map(c => c.id === activeChar.id ? { ...c, statesActive: newStates } : c);
                        setCharacters(updated);
                        if (!activeChar.isCustom) {
                          const customs = characters.filter(c => c.isCustom);
                          const pregenInCustoms = customs.find(c => c.id === activeChar.id);
                          if (pregenInCustoms) { const idx = customs.findIndex(c => c.id === activeChar.id); customs[idx] = updated.find(c => c.id === activeChar.id)!; saveCustomCharacters(customs); }
                          else { const cloned = { ...updated.find(c => c.id === activeChar.id)!, id: `${activeChar.id}_session`, isCustom: true }; saveCustomCharacters([...customs, cloned]); setSelectedCharId(cloned.id); }
                        } else { saveCustomCharacters(updated.filter(c => c.isCustom)); }
                      }}
                      className="text-red-400 hover:text-red-700 text-xs ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="移除状态"
                    >×</button>
                  </div>
                );
              })}
            </div>
            {activeChar.statesActive.map(st => {
              const found = APPENDIX_STATES.find(s => s.name.replace('X', '').trim() === st.name || s.name.startsWith(st.name));
              if (!found) return null;
              const effect = found.name.includes('X') ? found.effect.replace(/X/g, String(st.level)) : found.effect;
              const isInjury = st.name === '受伤';
              const displayEffect = isInjury ? found.effect.split(/受伤\d[：:]/g).filter(Boolean)[st.level - 1] || found.effect : effect;
              const showEndCond = !isInjury && found.endCondition.length > 0;
              const endCond = found.name.includes('X') ? found.endCondition.replace(/X/g, String(st.level)) : found.endCondition;
              return (
                <div key={`desc-${st.name}`} className="text-[9px] text-ink-muted leading-tight bg-surface/40 p-1.5 rounded border border-surface-border">
                  <span className="font-bold">{st.name}{found?.name.includes('X') || found?.name.includes('至') ? st.level : ''}：</span>{displayEffect}
                  {showEndCond && <><br /><span className="italic">结束条件：{endCond}</span></>}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="border-3 border-wilder-amber bg-white rounded p-4 relative shadow-sm mt-6">
        <h4 className="font-serif font-black text-xs text-wilder-amber border-b border-wilder-amber pb-1 mb-3 flex items-center justify-between select-none">
          <span>体力 ❤</span>
        </h4>
        <div className="grid grid-cols-2 text-center divide-x divide-surface-border mb-3">
          <div>
            <span className="text-[9px] text-ink-light block uppercase font-bold">当前</span>
            <span className="text-2xl font-black font-serif text-ink">{activeChar.stamina}</span>
          </div>
          <div>
            <span className="text-[9px] text-ink-light block uppercase font-bold">最大</span>
            <span className="text-2xl font-black font-serif text-ink">20</span>
          </div>
        </div>
        <div className="flex justify-center space-x-3">
          <button onClick={() => updateActiveCharStat('stamina', activeChar.stamina - 1)} className="px-4 py-1.5 bg-surface-border border border-orange-700 rounded font-bold hover:bg-orange-800 text-sm">-1</button>
          <button onClick={() => updateActiveCharStat('stamina', activeChar.stamina + 1)} className="px-4 py-1.5 bg-surface-border border border-orange-700 rounded font-bold hover:bg-orange-800 text-sm">+1</button>
        </div>
      </div>
    </div>
  );
});

export { SheetPage1 };