import React from 'react';
import { getCharacterPortrait, getInkIcon } from '../../icons';
import type { Character } from '../../types';

interface SheetPage2Props {
  activeChar: Character;
  updateActiveCharStat: (key: 'stamina' | 'durability' | 'harmony' | 'harmonyMax' | 'notes', val: any) => void;
  setEditPortraitType: (v: 'portrait' | 'upload' | 'drawing') => void;
  setEditPortraitValue: (v: string) => void;
  setIsPortraitEditMode: (v: boolean) => void;
  setIsPortraitModalOpen: (v: boolean) => void;
}

const SheetPage2 = React.memo(function SheetPage2({
  activeChar,
  updateActiveCharStat,
  setEditPortraitType,
  setEditPortraitValue,
  setIsPortraitEditMode,
  setIsPortraitModalOpen,
}: SheetPage2Props) {
  const highlightKeywords = (text: string) => {
    if (!text) return '';
    let html = text;

    html = html.replace(/身体部位/g, '<span class="font-extrabold text-ink">身体部位</span>');
    html = html.replace(/结束条件/g, '<span class="font-extrabold text-ink">结束条件</span>');

    html = html.replace(/燃烧/g, '<span class="font-bold text-red-600">燃烧</span>');
    html = html.replace(/捕获/g, '<span class="font-bold text-red-600">捕获</span>');
    html = html.replace(/不谐/g, '<span class="font-bold text-red-600">不谐</span>');
    html = html.replace(/受伤/g, '<span class="font-bold text-red-600">受伤</span>');
    html = html.replace(/暴露/g, '<span class="font-bold text-red-600">暴露</span>');
    html = html.replace(/困惑/g, '<span class="font-bold text-red-600">困惑</span>');
    html = html.replace(/惊恐/g, '<span class="font-bold text-red-600">惊恐</span>');
    html = html.replace(/震慑/g, '<span class="font-bold text-red-600">震慑</span>');
    html = html.replace(/康复/g, '<span class="font-bold text-red-600">康复</span>');
    html = html.replace(/中毒/g, '<span class="font-bold text-red-600">中毒</span>');

    html = html.replace(/毅力/g, '<span class="font-extrabold text-wilder-teal">毅力</span>');
    html = html.replace(/洞察/g, '<span class="font-extrabold text-wilder-teal">洞察</span>');
    html = html.replace(/特性/g, '<span class="font-extrabold text-wilder-teal">特性</span>');

    html = html.replace(/打击/g, '<span class="font-bold text-wilder-blue">打击</span>');
    html = html.replace(/射击/g, '<span class="font-bold text-wilder-blue">射击</span>');
    html = html.replace(/搜索/g, '<span class="font-bold text-wilder-blue">搜索</span>');
    html = html.replace(/穿越/g, '<span class="font-bold text-wilder-blue">穿越</span>');
    html = html.replace(/技能/g, '<span class="font-bold text-wilder-blue">技能</span>');

    html = html.replace(/风格/g, '<span class="font-bold text-wilder-amber">风格</span>');
    html = html.replace(/力量/g, '<span class="font-bold text-wilder-amber">力量</span>');
    html = html.replace(/精准/g, '<span class="font-bold text-wilder-amber">精准</span>');
    html = html.replace(/迅捷/g, '<span class="font-bold text-wilder-amber">迅捷</span>');
    html = html.replace(/技巧/g, '<span class="font-bold text-wilder-amber">技巧</span>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div id="sheet-page-2" className="bg-[#faf6ef] text-ink p-6 rounded border-2 border-surface-border shadow-rough space-y-6 relative overflow-hidden">
      <div className="flex justify-between items-center border-b-2 border-surface-border pb-4">
        <div className="flex items-center space-x-2">
          <span className="text-ink">{getInkIcon('园丁', 32)}</span>
          <span className="font-serif font-black text-2xl tracking-wider text-sky-950">背景</span>
          <span className="text-ink rotate-180">{getInkIcon('园丁', 32)}</span>
        </div>
        <span className="text-xs font-serif font-bold text-ink-muted border border-stone-400 px-2 py-0.5 rounded bg-white/50">PAGE 2 / 2</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 space-y-4">
          <div className="border-2 border-surface-border bg-white rounded divide-y-2 divide-stone-900 text-xs">
            <div className="p-3">
              <span className="block text-[9px] text-ink-light font-bold uppercase mb-1">你现在的样子</span>
              <span className="font-serif font-black text-lg text-ink">{activeChar.adjectives[0]}</span>
            </div>
            <div className="p-3">
              <span className="block text-[9px] text-ink-light font-bold uppercase mb-1">你想要成为的样子</span>
              <span className="font-serif font-black text-lg text-sky-900">{activeChar.adjectives[1]}</span>
            </div>
            <div className="p-3 bg-amber-50/30">
              <span className="block text-[9px] text-amber-700 font-bold uppercase mb-1">密切关系怪物 (Companion)</span>
              <span className="font-serif font-black text-sm text-amber-950">{activeChar.companion.name}</span>
              <p className="text-[11px] text-ink-muted leading-snug mt-1 italic">"{activeChar.companion.description}"</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-2 border-surface-border divide-x-2 divide-stone-900 bg-white text-xs">
            <div className="p-3">
              <span className="block text-[9px] text-ink-light font-bold uppercase mb-1">家乡特产 (Specialty)</span>
              <span className="font-bold text-ink text-sm">{activeChar.backgroundMeals.upbringing.meal.split('&')[0]?.trim() || '黑麦酸面包'}</span>
            </div>
            <div className="p-3 bg-orange-50/20">
              <span className="block text-[9px] text-wilder-amber font-bold uppercase mb-1">家乡香料 (Spice)</span>
              <span className="font-bold text-ink text-sm">{activeChar.backgroundMeals.upbringing.meal.split('&')[1]?.trim() || '方舟乌木胡椒'}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 border-2 border-surface-border rounded bg-white p-4 flex flex-col items-center justify-center min-h-[220px] shadow-sm relative cursor-pointer hover:border-wilder-blue/50 transition-colors" onClick={() => { setEditPortraitType(activeChar.backgroundType); setEditPortraitValue(activeChar.backgroundValue); setIsPortraitEditMode(false); setIsPortraitModalOpen(true); }}>
          <div className="absolute top-2 left-2 text-[9px] font-bold text-ink-light font-serif">
            {activeChar.backgroundType === 'upload' || activeChar.backgroundType === 'drawing' ? '插图' : 'SKETCH'}
          </div>
          {activeChar.backgroundType === 'upload' || activeChar.backgroundType === 'drawing' ? (
            <img src={activeChar.backgroundValue} alt="background" className="w-full h-full object-contain max-h-[190px]" />
          ) : (
            getCharacterPortrait(activeChar.name, 190, 'text-ink')
          )}
          <span className="text-[10px] text-ink-light font-serif mt-2 border-t border-stone-200 pt-1 w-full text-center">
            {activeChar.backgroundType === 'upload' || activeChar.backgroundType === 'drawing' ? '- 角色背景插图 -' : `- 猎人 ${activeChar.name} 炭笔墨线肖像 -`}
          </span>
        </div>
      </div>

      <div className="border-t-2 border-surface-border pt-4 space-y-4">
        <div className="flex items-center justify-center space-x-2 select-none">
          <span className="text-wilder-amber font-serif font-black">~❖~</span>
          <span className="font-serif font-black text-md text-ink tracking-wider">"三道菜式"的背景故事</span>
          <span className="text-wilder-amber font-serif font-black">~❖~</span>
        </div>

        <div className="space-y-3">
          <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
            <div className="w-8 bg-[#1E4D8C] text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0"><div>成</div><div className="mt-0.5">长</div><div className="mt-0.5">背</div><div className="mt-0.5">景</div></div>
            <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
              <p className="font-extrabold text-[#1E4D8C] text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center justify-between">
                <span>哪一道餐食定义了你的童年？ (童年餐食: {activeChar.backgroundMeals.upbringing.meal})</span>
                <span className="inline-block px-1.5 py-0.5 ml-1 leading-none rounded font-mono text-[9px] font-bold bg-[#1E4D8C]/10 text-[#1E4D8C]">+1 {activeChar.backgroundMeals.upbringing.skill}</span>
              </p>
              <p className="text-ink leading-relaxed font-serif">{highlightKeywords(activeChar.backgroundMeals.upbringing.text)}</p>
            </div>
          </div>

          <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
            <div className="w-8 bg-stone-700 text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0"><div>动</div><div className="mt-0.5">机</div></div>
            <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
              <p className="font-extrabold text-stone-700 text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center justify-between">
                <span>哪一道餐食让你成为了一名荒野食客？ (动机餐食: {activeChar.backgroundMeals.motivation.meal})</span>
                <span className="inline-block px-1.5 py-0.5 ml-1 leading-none rounded font-mono text-[9px] font-bold bg-stone-100 text-stone-700">+1 {activeChar.backgroundMeals.motivation.skill}</span>
              </p>
              <p className="text-ink leading-relaxed font-serif">{highlightKeywords(activeChar.backgroundMeals.motivation.text)}</p>
            </div>
          </div>

          <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
            <div className="w-8 bg-[#E07A2C] text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0"><div>雄</div><div className="mt-0.5">心</div></div>
            <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
              <p className="font-extrabold text-[#E07A2C] text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center justify-between">
                <span>你最想吃哪一道餐食？ (雄心餐食: {activeChar.backgroundMeals.ambition.meal})</span>
                <span className="inline-block px-1.5 py-0.5 ml-1 leading-none rounded font-mono text-[9px] font-bold bg-[#E07A2C]/10 text-[#E07A2C]">+1 {activeChar.backgroundMeals.ambition.skill}</span>
              </p>
              <p className="text-ink leading-relaxed font-serif">{highlightKeywords(activeChar.backgroundMeals.ambition.text)}</p>
            </div>
          </div>

          <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
            <div className="w-8 bg-red-800 text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0"><div>联</div><div className="mt-0.5">结</div></div>
            <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
              <p className="font-extrabold text-red-800 text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center gap-1"><span>🤝 盟约羁绊 (Bonds)</span></p>
              <p className="text-ink leading-relaxed font-serif italic">"{activeChar.bond}"</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <textarea
            value={activeChar.notes || ''}
            onChange={(e) => updateActiveCharStat('notes', e.target.value)}
            placeholder="在此记录你本次冒险中狩猎到的怪物身体部位、获取的食材、或是休整期间的烹饪灵感与笔记..."
            className="w-full bg-white border-2 border-surface-border rounded p-3 text-xs text-ink focus:outline-none focus:bg-surface-border h-[84px] resize-none"
          />
        </div>
      </div>
    </div>
  );
});

export { SheetPage2 };