import React from 'react';
import { Dice5, RotateCcw } from 'lucide-react';
import type { Character, DiceRollResult } from '../../types';

interface DiceDrawerProps {
  isDiceDrawerOpen: boolean;
  setIsDiceDrawerOpen: (v: boolean) => void;
  activeChar: Character;
  selectedRollStyle: string;
  setSelectedRollStyle: (v: string) => void;
  selectedRollSkill: string;
  setSelectedRollSkill: (v: string) => void;
  actionDieMode: 'focus' | 'wild';
  setActionDieMode: (v: 'focus' | 'wild') => void;
  diceRoll: DiceRollResult | null;
  handleRollDice: (styleName: string, styleCount: number, skillName: string, skillBonus: number, dieMode: 'focus' | 'wild') => void;
  setDiceBonus: (index: number) => void;
  setActionDieBonus: () => void;
  resetAllBonuses: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DiceDrawer = React.memo(function DiceDrawer({
  isDiceDrawerOpen,
  setIsDiceDrawerOpen,
  activeChar,
  selectedRollStyle,
  setSelectedRollStyle,
  selectedRollSkill,
  setSelectedRollSkill,
  actionDieMode,
  setActionDieMode,
  diceRoll,
  handleRollDice,
  setDiceBonus,
  setActionDieBonus,
  resetAllBonuses,
  showNotification,
}: DiceDrawerProps) {
  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface border-l-3 border-surface-border p-6 shadow-rough-lg overflow-y-auto z-40 transition-transform duration-300 transform print:hidden ${isDiceDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center border-b border-surface-border pb-3 mb-4">
        <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-1.5"><Dice5 className="text-wilder-amber" /> 荒野掷骰检定</h3>
        <button onClick={() => setIsDiceDrawerOpen(false)} className="text-ink-muted hover:text-ink font-bold text-lg border border-surface-border rounded-full w-6 h-6 flex items-center justify-center">×</button>
      </div>
      <p className="text-[11px] text-ink-muted leading-relaxed mb-4">你可以<b>任意组合</b> 1 种风格和 1 种技能。在下方配置并进行投掷！</p>

      {(() => {
        const styleKeyMap: { [key: string]: 'power' | 'precision' | 'swiftness' | 'technique' } = { '力量': 'power', '精准': 'precision', '迅捷': 'swiftness', '技巧': 'technique' };
        const currentStyleKey = styleKeyMap[selectedRollStyle] || 'power';
        const styleDiceCount = actionDieMode === 'wild' ? Math.max(1, (activeChar.styleValues[currentStyleKey] || 1) - 1) : (activeChar.styleValues[currentStyleKey] || 1);
        const currentSkillVal = activeChar.skills[selectedRollSkill] || 0;

        return (
          <div className="space-y-4 bg-surface-border/40 p-4 rounded border border-surface-border text-xs">
            <div>
              <label className="block text-[10px] text-ink-muted font-bold mb-1.5 uppercase">1. 选择行动风格 ( d6 风格骰 ):</label>
              <div className="grid grid-cols-4 gap-1">
                {['力量', '精准', '迅捷', '技巧'].map(st => {
                  const styleVal = activeChar.styleValues[styleKeyMap[st] || 'power'] || 1;
                  return (
                    <button key={st} type="button" onClick={() => setSelectedRollStyle(st)} className={`py-1.5 rounded text-center border font-bold transition-all text-[11px] ${selectedRollStyle === st ? 'bg-wilder-blue border-wilder-amber text-white font-extrabold shadow scale-105' : 'bg-surface-well border-surface-border text-ink-muted hover:border-orange-855'}`}>
                      <div>{st}</div>
                      <div className="text-[9px] font-mono opacity-80">{styleVal}d6</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-ink-muted font-bold mb-1.5 uppercase">2. 选择配套技能 ( +1 等级加成 ):</label>
              <select value={selectedRollSkill} onChange={(e) => setSelectedRollSkill(e.target.value)} className="w-full bg-surface-well border-2 border-surface-border text-ink rounded px-2.5 py-2 text-xs focus:outline-none focus:border-wilder-blue">
                {['激励', '发声', '手艺', '治愈', '展示', '抓取', '储存', '搜索', '射击', '打击', '学习', '穿越'].map(sk => (
                  <option key={sk} value={sk}>{sk} ( 加值: +{activeChar.skills[sk] || 0} )</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-ink-muted font-bold mb-1.5 uppercase">3. 选择行动骰与心境 (Action Die & Mindset):</label>
              <div className="grid grid-cols-1 gap-2">
                <button type="button" onClick={() => { setActionDieMode('focus'); showNotification('心境已设为：集中精神 (d8)', 'success'); }} className={`p-2 rounded text-left border transition-all ${actionDieMode === 'focus' ? 'bg-wilder-blue border-wilder-blue text-white font-extrabold shadow scale-102' : 'bg-surface-well border-surface-border text-wilder-amber hover:border-orange-850'}`}>
                  <div className="font-bold font-serif text-xs">集中精神 (Focus)</div>
                  <p className="text-[9px] text-ink-light leading-snug mt-0.5">使用 1d8 行动骰。获得稳定、可靠、安全的判定效果。</p>
                </button>
                <button type="button" onClick={() => { setActionDieMode('wild'); showNotification('心境已设为：释放野性 (d20, 风格骰-1)', 'success'); }} className={`p-2 rounded text-left border transition-all ${actionDieMode === 'wild' ? 'bg-red-950 border-red-500 text-white font-extrabold shadow scale-102' : 'bg-surface-well border-surface-border text-wilder-amber hover:border-orange-850'}`}>
                  <div className="font-bold font-serif text-xs text-red-400">释放野性 (Go Wild)</div>
                  <p className="text-[9px] text-ink-light leading-snug mt-0.5">使用 1d20 行动骰。风格骰 d6 数量将扣减 1（代表丧失理智）。</p>
                </button>
              </div>
            </div>
            <div className="border-t border-surface-border pt-3 text-center">
              <div className="text-ink font-serif text-sm font-bold">当前备战：<span className="text-wilder-blue font-black">{selectedRollStyle}</span> + <span className="text-yellow-500 font-black">{selectedRollSkill}</span></div>
              <div className="text-[10px] text-wilder-amber mt-1">投掷：{styleDiceCount}d6 (风格) + {actionDieMode === 'focus' ? '1d8' : '1d20'} (行动) • +{currentSkillVal} 技能加值</div>
              <button onClick={() => handleRollDice(selectedRollStyle, styleDiceCount, selectedRollSkill, currentSkillVal, actionDieMode)} className="w-full btn-sketch rounded mt-3 py-2.5 bg-wilder-blue border-wilder-amber text-white font-serif font-black text-sm flex items-center justify-center gap-1.5">进行掷骰检定</button>
            </div>
          </div>
        );
      })()}

      {diceRoll && (
        <div className="mt-4 space-y-4 pt-4 border-t border-surface-border">
          <div className="space-y-2">
            {(() => {
              const totalUsed = diceRoll.dice.reduce((s, d) => s + d.appliedBonus, 0) + diceRoll.actionDieAppliedBonus;
              return (
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-bold text-ink-muted">
                    点击骰子分配技能加值（剩余 {diceRoll.skillBonus - totalUsed}/{diceRoll.skillBonus}）
                  </span>
                  {totalUsed > 0 && (
                    <button
                      onClick={resetAllBonuses}
                      className="text-[10px] bg-surface-border border border-orange-700 text-ink px-2 py-1 rounded hover:bg-amber-100 flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> 重置加值
                    </button>
                  )}
                </div>
              );
            })()}
            <div className="flex flex-wrap gap-2.5 justify-center py-2 items-center">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {diceRoll.dice.map((d, index) => (
                  <div
                    key={index}
                    onClick={() => setDiceBonus(index)}
                    className={`w-12 h-12 border-3 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                      d.adjustedValue >= 5
                        ? 'bg-wilder-blue border-wilder-amber text-white shadow-md scale-105'
                        : 'bg-surface-well border-surface-border text-ink-light'
                    }`}
                    title="点击分配 +1 加值"
                  >
                    <span className="text-lg font-extrabold font-serif">{d.adjustedValue}</span>
                    {d.appliedBonus > 0 && (
                      <span className="absolute -top-2 -right-2 text-[9px] bg-yellow-500 text-amber-950 font-bold px-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                        +{d.appliedBonus}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-ink-muted font-bold mx-1">＋</span>
              <div
                onClick={setActionDieBonus}
                className={`p-2 border-3 rounded-lg flex flex-col items-center justify-center text-center shadow-md min-w-[80px] cursor-pointer transition-all ${
                  diceRoll.actionDieType === 'd8'
                    ? 'bg-amber-900/40 border-amber-500 text-amber-100'
                    : 'bg-red-950/40 border-red-500 text-red-200'
                }`}
                title="点击分配 +1 加值"
              >
                <span className="text-[8px] font-bold uppercase tracking-wider block leading-none">行动骰 {diceRoll.actionDieType}</span>
                <span className="text-xl font-serif font-black block mt-0.5">
                  {diceRoll.actionDieValue + diceRoll.actionDieAppliedBonus}
                </span>
                {diceRoll.actionDieAppliedBonus > 0 && (
                  <span className="text-[9px] bg-yellow-500 text-amber-950 font-bold px-1 rounded-full mt-0.5">
                    +{diceRoll.actionDieAppliedBonus}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-surface-well p-4 rounded-lg border border-surface-border text-center space-y-2 shadow-inner text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="border-r border-surface-border">
                <span className="text-[10px] text-wilder-amber block uppercase font-bold">成功次数</span>
                <span className="text-3xl font-black font-serif text-wilder-blue">{diceRoll.successes}</span>
              </div>
              <div>
                <span className="text-[10px] text-wilder-amber block uppercase font-bold">行动评级 [A]</span>
                <span className="text-3xl font-black font-serif text-yellow-500">{diceRoll.actionRating}</span>
              </div>
            </div>
            <div className="text-xs pt-2 border-t border-surface-border leading-tight">
              {diceRoll.successes > 0 ? (
                <span className="text-wilder-amber font-bold">检定成功！最高骰为 [A]={diceRoll.actionRating}，造成对应的结算效果！</span>
              ) : (
                <span className="text-wilder-blue font-bold">检定失败！未掷出5点以上的成功值。你可以配合技能修正来达到成功。</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export { DiceDrawer };
