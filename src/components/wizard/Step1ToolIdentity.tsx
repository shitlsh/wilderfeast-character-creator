import React from 'react';
import { TOOLS, type Tool, type Technique } from '../../data';
import { getInkIcon } from '../../icons';
import { BUILTIN_AVATARS } from '../../types';

interface Step1Props {
  wizName: string; setWizName: (v: string) => void;
  wizPlayerName: string; setWizPlayerName: (v: string) => void;
  wizAdjectiveCurrent: string; setWizAdjectiveCurrent: (v: string) => void;
  wizAdjectiveAspiring: string; setWizAdjectiveAspiring: (v: string) => void;
  wizTool: Tool; setWizTool: (v: Tool) => void;
  wizStylesChoice: 'a' | 'b'; setWizStylesChoice: (v: 'a' | 'b') => void;
  wizSecondaryTech: Technique | null; setWizSecondaryTech: (v: Technique | null) => void;
  wizAvatarType: 'emoji' | 'upload' | 'drawing'; setWizAvatarType: (v: 'emoji' | 'upload' | 'drawing') => void;
  wizAvatarValue: string; setWizAvatarValue: (v: string) => void;
  onNext: () => void;
}

const Step1ToolIdentity = React.memo(function Step1ToolIdentity({
  wizName, setWizName,
  wizPlayerName, setWizPlayerName,
  wizAdjectiveCurrent, setWizAdjectiveCurrent,
  wizAdjectiveAspiring, setWizAdjectiveAspiring,
  wizTool, setWizTool,
  wizStylesChoice, setWizStylesChoice,
  wizSecondaryTech, setWizSecondaryTech,
  wizAvatarType, setWizAvatarType,
  wizAvatarValue, setWizAvatarValue,
  onNext
}: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold font-serif mb-2 text-wilder-blue">第一步：输入名字与身份描述</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-ink-muted">角色名 (Character)</label>
            <input
              type="text"
              value={wizName}
              onChange={(e) => setWizName(e.target.value)}
              placeholder="例如: 普莱兹, 巴格"
              className="w-full bg-surface border-2 border-wilder-amber rounded px-3 py-2 text-ink focus:outline-none focus:border-wilder-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-ink-muted">玩家名 (Player)</label>
            <input
              type="text"
              value={wizPlayerName}
              onChange={(e) => setWizPlayerName(e.target.value)}
              placeholder="写下你的名字"
              className="w-full bg-surface border-2 border-wilder-amber rounded px-3 py-2 text-ink focus:outline-none focus:border-wilder-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold mb-1 text-ink-muted">目前的你 (形容词)</label>
              <select
                value={wizAdjectiveCurrent}
                onChange={(e) => setWizAdjectiveCurrent(e.target.value)}
                className="w-full bg-surface border-2 border-wilder-amber rounded px-2 py-2 text-ink focus:outline-none"
              >
                {wizTool.adjectives.map(adj => (
                  <option key={adj} value={adj}>{adj}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-ink-muted">向往却难成为的你</label>
              <select
                value={wizAdjectiveAspiring}
                onChange={(e) => setWizAdjectiveAspiring(e.target.value)}
                className="w-full bg-surface border-2 border-wilder-amber rounded px-2 py-2 text-ink focus:outline-none"
              >
                {wizTool.adjectives.map(adj => (
                  <option key={adj} value={adj}>{adj}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold font-serif mb-2 text-wilder-blue">选择你的方舟钢工具</h3>
        <p className="text-xs text-ink-muted mb-4">
          工具决定你的核心战斗风格 (Styles) 与初始招式 (Techniques)。每项工具代表你在战斗中的独特战术定位。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TOOLS.map(t => (
            <div
              key={t.name}
              onClick={() => setWizTool(t)}
              className={`border-3 p-3 rounded cursor-pointer transition-all ${
                wizTool.name === t.name
                  ? 'bg-wilder-blue border-wilder-blue text-white shadow-rough'
                  : 'bg-surface border-surface-border text-ink-muted hover:border-orange-700'
              }`}
            >
              <div className="font-bold font-serif text-md">{t.name}</div>
              <div className="text-[10px] text-wilder-amber mt-1 truncate">{t.styles.name}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface p-4 rounded border border-surface-border mt-4">
          <h4 className="font-bold text-sm text-ink">{wizTool.name} 的机制细节:</h4>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">{wizTool.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-surface-border">
            <div>
              <span className="block text-xs font-bold text-ink mb-1">风格分配选择：</span>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    checked={wizStylesChoice === 'a'}
                    onChange={() => setWizStylesChoice('a')}
                    className="accent-wilder-teal"
                  />
                  <span>分配 (A): {wizTool.styles.choices[0].replace(/^\(a\)\s*/, '')}</span>
                </label>
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    checked={wizStylesChoice === 'b'}
                    onChange={() => setWizStylesChoice('b')}
                    className="accent-wilder-teal"
                  />
                  <span>分配 (B): {wizTool.styles.choices[1].replace(/^\(b\)\s*/, '')}</span>
                </label>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-ink mb-1">招牌战技（自动获得）：</span>
              {wizTool.techniques.filter(tk => tk.type === 'signature').map(tk => (
                <div key={tk.name} className="text-xs">
                  <span className="font-bold text-wilder-blue">{tk.name}</span> <span className="text-[10px] bg-surface-border px-1 rounded">{tk.cost}</span>
                  <p className="text-[10px] text-wilder-amber mt-0.5">{tk.effect}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <span className="block text-xs font-bold text-ink mb-2">自选次要初始战技（从下列 3 选 1）：</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {wizTool.techniques.filter(tk => tk.type === 'optional').map(tk => (
                <div
                  key={tk.name}
                  onClick={() => setWizSecondaryTech(tk)}
                  className={`border-2 p-2.5 rounded cursor-pointer transition-all text-xs ${
                    wizSecondaryTech?.name === tk.name
                      ? 'bg-wilder-blue border-wilder-blue text-white shadow-rough'
                      : 'bg-surface border-surface-border text-ink-muted'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>{tk.name}</span>
                    <span className="text-[9px] bg-surface-border px-1 rounded text-wilder-amber">{tk.cost}</span>
                  </div>
                  <p className="text-[10px] text-wilder-amber mt-1 line-clamp-3">{tk.effect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold font-serif mb-2 text-wilder-blue">选择人物卡头像</h3>
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full border-3 border-dashed border-wilder-blue bg-surface flex items-center justify-center text-ink overflow-hidden flex-shrink-0">
            {getInkIcon(wizAvatarValue, 40)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {BUILTIN_AVATARS.map(av => (
                <button
                  key={av.value}
                  type="button"
                  onClick={() => { setWizAvatarType('emoji'); setWizAvatarValue(av.value); }}
                  className={`w-10 h-10 rounded border-2 flex items-center justify-center transition-all ${
                    wizAvatarType === 'emoji' && wizAvatarValue === av.value
                      ? 'bg-wilder-blue border-wilder-blue ring-2 ring-wilder-teal text-white'
                      : 'bg-surface border-wilder-amber hover:border-orange-500 text-ink'
                  }`}
                  title={av.label}
                >
                  {getInkIcon(av.value, 20, wizAvatarType === 'emoji' && wizAvatarValue === av.value ? 'text-white' : 'text-ink')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="btn-sketch rounded px-6 py-2.5 bg-wilder-blue border-wilder-amber text-white flex items-center gap-1 font-serif font-bold text-md"
        >
          下一步：选择你的专长 (谱系) →
        </button>
      </div>
    </div>
  );
});

export { Step1ToolIdentity };