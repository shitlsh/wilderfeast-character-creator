import React from 'react';
import { Search, BookOpen } from 'lucide-react';
import {
  APPENDIX_TRAITS, APPENDIX_TECHNIQUES, APPENDIX_STATES, APPENDIX_REGIONS
} from '../../appendixData';

interface ReferenceManualDrawerProps {
  isManualDrawerOpen: boolean;
  setIsManualDrawerOpen: (v: boolean) => void;
  activeAppendixTab: string;
  setActiveAppendixTab: (v: any) => void;
  appendixSearchQuery: string;
  setAppendixSearchQuery: (v: string) => void;
  appendixFilterWeapon: string;
  setAppendixFilterWeapon: (v: string) => void;
}

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

const ReferenceManualDrawer = React.memo(function ReferenceManualDrawer({
  isManualDrawerOpen,
  setIsManualDrawerOpen,
  activeAppendixTab,
  setActiveAppendixTab,
  appendixSearchQuery,
  setAppendixSearchQuery,
  appendixFilterWeapon,
  setAppendixFilterWeapon,
}: ReferenceManualDrawerProps) {
  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface border-l-3 border-surface-border p-6 shadow-rough-lg overflow-y-auto z-40 transition-transform duration-300 transform print:hidden ${isManualDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center border-b border-surface-border pb-3 mb-4">
        <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-1.5"><BookOpen size={18} className="text-wilder-amber" /> 附录参考手册</h3>
        <button onClick={() => setIsManualDrawerOpen(false)} className="text-wilder-amber hover:text-white font-bold text-lg border border-wilder-amber rounded-full w-6 h-6 flex items-center justify-center bg-stone-950/30">×</button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {[{ key: 'd', label: 'D：速查' },{ key: 'a', label: 'A.1：特性' },{ key: 'e', label: 'A.2 区域' },{ key: 'b', label: 'B：战技' },{ key: 'c', label: 'C：状态' }].map(tb => (
          <button key={tb.key} type="button" onClick={() => { setActiveAppendixTab(tb.key as any); setAppendixSearchQuery(''); }} className={`py-1.5 text-center text-xs font-bold transition-all border rounded ${activeAppendixTab === tb.key ? 'bg-wilder-blue border-wilder-amber text-white shadow' : 'bg-surface border-wilder-amber text-ink-muted hover:bg-surface-well'}`}>{tb.label}</button>
        ))}
      </div>

      <div className="flex items-center bg-surface-well border border-surface-border rounded px-2.5 py-1.5 mt-3">
        <Search size={14} className="text-wilder-amber mr-2" />
        <input type="text" value={appendixSearchQuery} onChange={(e) => setAppendixSearchQuery(e.target.value)} placeholder="搜索当前手册内容..." className="bg-transparent focus:outline-none text-xs text-ink placeholder:text-wilder-amber w-full" />
      </div>

      {activeAppendixTab === 'b' && (
        <div className="flex flex-wrap gap-1 pt-1.5">
          {['all', '大砍刀', '防护手套', '平底锅', '叉子', '喷火器', '钢绳', '通用'].map(wp => (
            <button key={wp} type="button" onClick={() => setAppendixFilterWeapon(wp)} className={`px-2 py-0.5 rounded text-[10px] transition-all border ${appendixFilterWeapon === wp ? 'bg-wilder-blue border-wilder-blue text-white font-bold' : 'bg-surface-well border-surface-border text-ink-muted'}`}>{wp === 'all' ? '全部' : wp === '通用' ? '通用' : wp}</button>
          ))}
        </div>
      )}

      <div className="max-h-[calc(100vh-180px)] overflow-y-auto space-y-3 pr-1 text-xs mt-4">
        {activeAppendixTab === 'a' && (
          <div className="space-y-3">
            <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5"><span className="text-wilder-orange text-xl">🌶️</span><span className="font-serif font-black text-lg text-wilder-blue">附录A.1：特性</span></div>
            <div className="text-[10px] bg-surface-well px-2 py-1 text-ink-muted font-bold border-l-2 border-wilder-blue mb-2">默认特性（所有人自动获得毅力与洞察）及在狩猎、盛宴、突变中获得的特性。</div>
            {APPENDIX_TRAITS.filter(tr => tr.name.includes(appendixSearchQuery) || tr.effect.includes(appendixSearchQuery)).map(tr => (
              <div key={tr.name} className="bg-surface border border-surface-border p-2.5 rounded hover:border-wilder-amber shadow-sm">
                <div className="flex justify-between items-center font-bold text-ink"><span className="font-serif text-sm">{tr.name}</span><span className="text-[9px] bg-surface-well text-wilder-amber border border-surface-border px-1.5 py-0.5 rounded font-mono">{tr.cost}</span></div>
                <p className="text-ink-muted text-[11px] mt-1.5 leading-relaxed font-serif">{highlightKeywords(tr.effect)}</p>
                {tr.name === '保护色' && <div className="border border-wilder-amber/60 bg-surface-well/50 p-2.5 rounded-lg text-[9px] text-ink-muted italic text-center mt-2 leading-relaxed">拥有<span className="font-bold text-wilder-teal">保护色</span>的生物通常通过鲜艳的颜色来警告潜在的捕食者，它们不值得被捕食。<br />此<span className="font-bold text-wilder-teal">特性</span>也可以用来代表所拟态或惊吓展示，而无需改变其机制。</div>}
                {tr.name === '感知电流' && <div className="border border-wilder-amber/60 bg-surface-well/50 p-2.5 rounded-lg text-[9px] text-ink-muted italic text-center mt-2 leading-relaxed">拥有<span className="font-bold text-wilder-teal">感知电流</span>特性的生物能感应到电流，尤其是其他动物产生的电流。<br />此<span className="font-bold text-wilder-teal">特性</span>也可以用来代表其他非传统的感官，例如探测红外线或地脉的能力，而无需改变其机制。</div>}
              </div>
            ))}
          </div>
        )}

        {activeAppendixTab === 'b' && (
          <div className="space-y-3">
            <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5"><span className="text-wilder-orange text-xl">⚔️</span><span className="font-serif font-black text-lg text-wilder-blue">附录B：战技</span></div>
            <div className="space-y-3">
              {APPENDIX_TECHNIQUES.filter(tk => {
                const matchesSearch = tk.name.includes(appendixSearchQuery) || tk.effect.includes(appendixSearchQuery);
                if (appendixFilterWeapon === 'all') return matchesSearch;
                if (appendixFilterWeapon === '通用') return tk.weapon.includes('/') && matchesSearch;
                return tk.weapon === appendixFilterWeapon && matchesSearch;
              }).map(tk => {
                const rankColor = tk.rank === '初级' ? 'bg-stone-600' : (tk.rank === '中级' ? 'bg-[#E07A2C]' : 'bg-[#1E4D8C]');
                return (
                  <div key={tk.name} className="flex rounded-lg border border-surface-border overflow-hidden shadow-sm">
                    <div className={`w-14 ${rankColor} text-white flex flex-col items-center justify-center font-serif font-black text-xs text-center p-1.5 shrink-0 select-none`}><div>{tk.rank[0]}</div><div className="mt-0.5">{tk.rank[1]}</div></div>
                    <div className="flex-1 bg-surface-well p-3 text-[11px] leading-relaxed text-ink space-y-1">
                      <div className="flex justify-between items-center font-bold text-ink"><span className="font-serif text-sm">{tk.name}</span><span className="text-[9px] bg-surface border border-surface-border text-wilder-amber px-1.5 py-0.5 rounded font-mono">{tk.cost}</span></div>
                      <div className="flex space-x-2 text-[9px] text-ink-light mt-0.5 font-mono"><span>🔧 {tk.weapon.includes('/') ? `通用 (${tk.weapon})` : tk.weapon}</span></div>
                      <p className="text-ink-muted text-[11px] mt-1 font-serif leading-relaxed">{highlightKeywords(tk.effect)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeAppendixTab === 'c' && (
          <div className="space-y-3">
            <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5"><span className="text-wilder-orange text-xl">🌶️</span><span className="font-serif font-black text-lg text-wilder-blue">附录C：状态</span></div>
            {APPENDIX_STATES.filter(st => st.name.includes(appendixSearchQuery) || st.effect.includes(appendixSearchQuery)).map(st => (
              <div key={st.name} className="flex rounded-lg border border-surface-border overflow-hidden shadow-sm">
                <div className="w-20 bg-[#B5523A] text-white flex items-center justify-center font-serif font-black text-xs text-center p-2 shrink-0 select-none">{st.name}</div>
                <div className="flex-1 bg-surface-well p-3 text-[11px] leading-relaxed text-ink space-y-1.5">
                  <p className="font-serif">{highlightKeywords(st.effect)}</p>
                  {st.endCondition && <p className="text-[10px] text-ink-muted border-t border-surface-border/40 pt-1"><span className="font-extrabold text-ink">结束条件：</span>{highlightKeywords(st.endCondition)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeAppendixTab === 'e' && (
          <div className="space-y-3">
            <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5"><span className="text-wilder-orange text-xl">🗺️</span><span className="font-serif font-black text-lg text-wilder-blue">附录A.2：地区与区域特性</span></div>
            <div className="text-[10px] bg-surface-well px-2 py-1 text-ink-muted font-bold border-l-2 border-wilder-blue mb-2">地区与区域特性会影响猎群在旅行和特定环境中的生存与移动难度。</div>
            <div className="space-y-3">
              {APPENDIX_REGIONS.filter(r => !appendixSearchQuery || r.name.includes(appendixSearchQuery) || r.effect.includes(appendixSearchQuery)).map(r => (
                <div key={r.name} className="flex rounded-lg border border-surface-border overflow-hidden shadow-sm">
                  <div className="w-20 bg-stone-700 text-white flex items-center justify-center font-serif font-black text-xs text-center p-2 shrink-0 select-none">{r.name}</div>
                  <div className="flex-1 bg-surface-well p-3 text-[11px] leading-relaxed text-ink"><p className="font-serif">{highlightKeywords(r.effect)}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeAppendixTab === 'd' && (() => {
          const showTracking = !appendixSearchQuery || '追踪每个行进轮包含以下阶段寻踪选择该区域中的一个聚落收集物资觅食搜索风格扎营不谐受伤前进开始挑战难度值旅行穿越'.includes(appendixSearchQuery);
          const showHunting = !appendixSearchQuery || '狩猎每个回合有3点行动攻击力量精准迅捷技巧防御饮食即时动作移动准备修复嘲讽特性'.includes(appendixSearchQuery);
          const showFeast = !appendixSearchQuery || '盛宴问题烹饪风格技能特性'.includes(appendixSearchQuery);
          const showRest = !appendixSearchQuery || '休整首先完成以下所有事项体力耐久度受伤不谐烹饪恢复照料补给训练投入项目'.includes(appendixSearchQuery);

          return (
            <div className="space-y-4">
              <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5"><span className="text-wilder-orange text-xl">📋</span><span className="font-serif font-black text-lg text-wilder-blue">附录D：游戏流程快速参考</span></div>
              {showTracking && (
                <div className="flex rounded-lg shadow-sm border border-surface-border">
                  <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0"><div>追</div><div className="mt-1">踪</div></div>
                  <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2">
                    <p className="font-bold text-ink-muted mb-1 text-[11px]">每个行进轮包含以下阶段：</p>
                    <ul className="space-y-1.5 pl-1">
                      <li className="list-none"><span className="font-extrabold text-ink">● 寻踪（可选）</span><ul className="pl-4 mt-0.5 space-y-1"><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="font-extrabold">选择该区域中的一个聚落</span>。通过与该聚落互动，你们可以找到可行的觅食方式、安全的旅行方式以及足迹。</span></li></ul></li>
                      <li className="list-none"><span className="font-extrabold text-ink">● 收集物资（可选）</span><ul className="pl-4 mt-0.5 space-y-1"><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="font-extrabold">步骤1：觅食</span>。每位荒野食客都进行一次<span className="text-wilder-blue font-bold">搜索</span>检定。若成功，你获得 [A] 份与你所用<span className="text-wilder-amber font-bold">风格</span>相对应的食材。</span></li><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="font-extrabold">步骤2：扎营</span>。结束除<span className="text-red-600 font-bold">不谐</span>与<span className="text-red-600 font-bold">受伤</span>外的所有状态。回复 &lt;H&gt; 耐久度。猎群烹饪一餐。</span></li></ul></li>
                      <li className="list-none"><span className="font-extrabold text-ink">● 前进</span><ul className="pl-4 mt-0.5 space-y-1"><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="font-extrabold">步骤1：开始挑战</span>。猎群必须完成一个难度值为 5 × 荒野食客人数的挑战，才能穿过该区域。</span></li><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="font-extrabold">步骤2：旅行</span>。每位荒野食客都进行一次<span className="text-wilder-blue font-bold">穿越</span>检定。若成功，将你的 [A] 值加入猎群的总数中。</span></li><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="font-extrabold">步骤3：检查结果</span>。如果你们完成了挑战，则开始一次安全事件。如果你们挑战失败，则开始一次危险事件。此外，如果你们使用了猎群尚未学会的<span className="text-wilder-amber font-bold">风格</span>进行旅行，则会受到等同于剩余难度值的伤害。</span></li></ul></li>
                    </ul>
                  </div>
                </div>
              )}
              {showHunting && (
                <div className="flex rounded-lg shadow-sm border border-surface-border">
                  <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0"><div>狩</div><div className="mt-1">猎</div></div>
                  <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2">
                    <p className="font-bold text-ink-muted mb-1 text-[11px]">你每回合有3点行动，可用于以下选项：</p>
                    <ul className="space-y-2 pl-1">
                      <li className="list-none"><span className="font-extrabold text-ink">● 攻击</span>。（费用：可变）对射程内的一只生物进行一次<span className="text-wilder-blue font-bold">打击</span>或<span className="text-wilder-blue font-bold">射击</span>检定。每种<span className="text-wilder-amber font-bold">风格</span>都有不同的费用与效果。如果你在一个回合内进行多次攻击，每次都必须选择不同的<span className="text-wilder-amber font-bold">风格</span>。<ul className="pl-4 mt-1 space-y-1"><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="text-wilder-amber font-extrabold">力量</span>。（费用：2点行动）[A]×2点伤害。若失败，你陷入<span className="text-red-600 font-bold">暴露</span>状态。</span></li><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="text-wilder-amber font-extrabold">精准</span>。（费用：2点行动）[A]点身体部位伤害。</span></li><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="text-wilder-amber font-extrabold">迅捷</span>。（费用：1点行动）[A]点伤害。</span></li><li className="list-none flex items-start"><span className="mr-1 text-wilder-amber font-mono">◇</span><span><span className="text-wilder-amber font-extrabold">技巧</span>。（费用：1点行动）[A]点身体部位伤害。若失败，你陷入<span className="text-red-600 font-bold">暴露</span>状态。</span></li></ul></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">防御</span>。（费用：2点行动）直到你的下个回合开始前，你受到的任何伤害减半。</span></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">饮食</span>。（费用：1点行动）吃下一份零食。</span></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">即时动作</span>。（费用：1点行动）陈述你的目标，设定你的方式，并进行一次检定。</span></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">移动</span>。（费用：1点行动）移动1跨度（靠近或远离），与队友进行跟随，或改变地形。</span></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">准备</span>。（费用：1点行动）在下个回合获得1点额外行动。你每回合只能进行一次准备。</span></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">修复</span>。（费用：2点行动）为你的<span className="font-extrabold">工具</span>回复1点耐久度。目标怪物无法进行修复。</span></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">嘲讽</span>。（费用：1点行动）如果你在1跨度范围内，便会成为目标怪物的目标。</span></li>
                      <li className="list-none flex items-start"><span className="mr-1.5 text-ink font-mono">●</span><span><span className="font-extrabold">使用特性</span>。（费用：可变）每项<span className="text-wilder-teal font-bold">特性</span>都会说明其使用时机与费用。</span></li>
                    </ul>
                  </div>
                </div>
              )}
              {showFeast && (
                <div className="flex rounded-lg shadow-sm border border-surface-border">
                  <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0"><div>盛</div><div className="mt-1">宴</div></div>
                  <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2">
                    <p className="font-bold text-ink-muted mb-1 text-[11px]">在荒野盛宴期间，你可以...</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1"><span className="font-extrabold text-ink block text-[11px] border-b border-surface-border pb-1">回答以下问题...</span><ul className="space-y-1 pl-1"><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>你们如何烹饪目标怪物？</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>你们在准备餐食时做什么？</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>你们在荒野盛宴上还准备了什么？</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>这道餐食与你们的过往有何关联？</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>下一次你们吃这道餐食时，会想起什么？</span></li></ul></div>
                      <div className="space-y-1"><span className="font-extrabold text-ink block text-[11px] border-b border-surface-border pb-1">来提出以下问题...</span><ul className="space-y-1 pl-1"><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>目标怪物在某项<span className="text-wilder-amber font-bold">风格</span>上有多少等级？</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>目标怪物在某项<span className="text-wilder-blue font-bold">技能</span>上有多少等级？</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>目标怪物的<span className="text-wilder-teal font-bold">特性</span>之一是什么？</span></li></ul></div>
                    </div>
                  </div>
                </div>
              )}
              {showRest && (
                <div className="flex rounded-lg shadow-sm border border-surface-border">
                  <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0"><div>休</div><div className="mt-1">整</div></div>
                  <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2.5">
                    <div className="space-y-1"><p className="font-bold text-ink mb-1 text-[11px]">首先，完成以下所有事项：</p><ul className="space-y-0.5 pl-1.5"><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>回复所有体力。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>回复所有耐久度。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>移除1个等级的<span className="text-red-600 font-bold">受伤</span>状态，并结束除<span className="text-red-600 font-bold">不谐</span>外的所有其他状态的所有等级。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span>获得 &lt;H&gt; 份家乡特产和1份家乡香料。</span></li></ul></div>
                    <div className="space-y-1 pt-1.5 border-t border-surface-border/60"><p className="font-bold text-ink mb-1 text-[11px]">然后，你们获得2点行动，可用于以下选项：</p><ul className="space-y-1 pl-1.5"><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span><span className="font-extrabold">烹饪</span>。（费用：0点行动）烹饪任意数量的餐食。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span><span className="font-extrabold">恢复</span>。（费用：1点行动）移除1个等级的<span className="text-red-600 font-bold">受伤</span>状态。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span><span className="font-extrabold">照料</span>。（费用：0点行动）将一餐饭喂给正在<span className="text-red-600 font-bold">康复</span>的生物。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span><span className="font-extrabold">补给</span>。（费用：1点行动）获得 &lt;H&gt; 份家乡特产和1份家乡香料。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span><span className="font-extrabold">训练</span>。（费用：1点行动）完成一次训练，以学习一项战技。你们每个休整阶段只能进行一次训练。</span></li><li className="list-none flex items-start"><span className="mr-1.5 text-ink-muted">•</span><span><span className="font-extrabold">投入项目</span>。（费用：1点行动）进行一次检定，以完成一个自定义挑战。</span></li></ul></div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
});

export { ReferenceManualDrawer };