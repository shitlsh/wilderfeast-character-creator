import React from 'react';
import { Shuffle } from 'lucide-react';
import { UPBRINGINGS, MOTIVATIONS, AMBITIONS, BONDS } from '../../data';
import { ALL_SKILLS } from '../../types';

interface Step3Props {
  wizUpbringingIndex: number; setWizUpbringingIndex: (v: number) => void;
  wizUpbringingMeal: string; setWizUpbringingMeal: (v: string) => void;
  wizUpbringingText: string; setWizUpbringingText: (v: string) => void;
  wizUpbringingSpecialty: string; setWizUpbringingSpecialty: (v: string) => void;
  wizUpbringingSpice: string; setWizUpbringingSpice: (v: string) => void;
  wizUpbringingCustomSkill: string; setWizUpbringingCustomSkill: (v: string) => void;
  wizMotivationIndex: number; setWizMotivationIndex: (v: number) => void;
  wizMotivationMeal: string; setWizMotivationMeal: (v: string) => void;
  wizMotivationText: string; setWizMotivationText: (v: string) => void;
  wizMotivationCustomSkill: string; setWizMotivationCustomSkill: (v: string) => void;
  wizAmbitionIndex: number; setWizAmbitionIndex: (v: number) => void;
  wizAmbitionMeal: string; setWizAmbitionMeal: (v: string) => void;
  wizAmbitionText: string; setWizAmbitionText: (v: string) => void;
  wizAmbitionCustomSkill: string; setWizAmbitionCustomSkill: (v: string) => void;
  wizBondIndex: number; setWizBondIndex: (v: number) => void;
  wizBond: string; setWizBond: (v: string) => void;
  wizBackgroundType: 'portrait' | 'upload' | 'drawing'; setWizBackgroundType: (v: 'portrait' | 'upload' | 'drawing') => void;
  wizBackgroundValue: string; setWizBackgroundValue: (v: string) => void;
  rollBackgroundOption: (course: 'upbringing' | 'motivation' | 'ambition') => void;
  openBackgroundDrawingModal: () => void;
  handleBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onCreate: () => void;
}

const Step3Background = React.memo(function Step3Background({
  wizUpbringingIndex, setWizUpbringingIndex,
  wizUpbringingMeal, setWizUpbringingMeal,
  wizUpbringingText, setWizUpbringingText,
  wizUpbringingSpecialty, setWizUpbringingSpecialty,
  wizUpbringingSpice, setWizUpbringingSpice,
  wizUpbringingCustomSkill, setWizUpbringingCustomSkill,
  wizMotivationIndex, setWizMotivationIndex,
  wizMotivationMeal, setWizMotivationMeal,
  wizMotivationText, setWizMotivationText,
  wizMotivationCustomSkill, setWizMotivationCustomSkill,
  wizAmbitionIndex, setWizAmbitionIndex,
  wizAmbitionMeal, setWizAmbitionMeal,
  wizAmbitionText, setWizAmbitionText,
  wizAmbitionCustomSkill, setWizAmbitionCustomSkill,
  wizBondIndex, setWizBondIndex,
  wizBond, setWizBond,
  wizBackgroundType, setWizBackgroundType,
  wizBackgroundValue, setWizBackgroundValue,
  rollBackgroundOption,
  openBackgroundDrawingModal,
  handleBackgroundUpload,
  onPrev,
  onCreate
}: Step3Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold font-serif mb-1 text-wilder-blue">第三步：设定"三道菜式"背景故事</h3>
        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
          在选择了一项工具和专长后，请按照以下步骤，为自己打造一份"三道菜式"的背景。通过食物来构建你的角色故事，通过你的背景，你将获得初始技能。
          <span className="text-wilder-blue font-bold block mt-1">💡 规则计算：每个背景对应的选择会给你提供一项唯一的 +1 初始技能加值，三种背景对应的初始技能必须各不相同！</span>
        </p>

        <div className="space-y-4">
          <div className="bg-surface p-4 rounded border border-surface-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-ink text-sm flex items-center gap-1">
                第一道菜：成长背景 (Upbringing) — 童年餐食
              </span>
              <button
                onClick={() => rollBackgroundOption('upbringing')}
                className="text-xs bg-wilder-blue border border-wilder-blue px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-wilder-blue"
              >
                <Shuffle size={12} /> 随机骰选
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <label className="block text-[10px] text-wilder-amber mb-1">童年美食名称</label>
                <select
                  value={wizUpbringingIndex}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setWizUpbringingIndex(val);
                    if (val !== -1) {
                      setWizUpbringingMeal(UPBRINGINGS[val].description.split('，')[0] || '特色乱炖');
                      setWizUpbringingText(UPBRINGINGS[val].description);
                    }
                  }}
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink"
                >
                  {UPBRINGINGS.map((u, i) => {
                    const commaIdx = u.description.indexOf('，');
                    const periodIdx = u.description.indexOf('。');
                    const firstBreak = commaIdx === -1 ? periodIdx : (periodIdx === -1 ? commaIdx : Math.min(commaIdx, periodIdx));
                    const boldLabel = firstBreak === -1 ? u.description : u.description.substring(0, firstBreak);
                    return <option key={i} value={i}>{i+1}. {boldLabel}</option>;
                  })}
                  <option value={-1}>自定义 ✏️</option>
                </select>
                {wizUpbringingIndex === -1 && (
                  <input
                    type="text"
                    value={wizUpbringingMeal}
                    onChange={(e) => setWizUpbringingMeal(e.target.value)}
                    placeholder="输入自定义美食名称..."
                    className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink mt-2"
                  />
                )}
              </div>
              <div className="md:col-span-6">
                <label className="block text-[10px] text-wilder-amber mb-1">童年成长细节</label>
                <textarea
                  rows={2}
                  value={wizUpbringingText}
                  onChange={(e) => setWizUpbringingText(e.target.value)}
                  placeholder="描述在什么环境下吃、谁在身边、什么样的情感"
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] text-wilder-amber mb-1">对应技能加成</label>
                {wizUpbringingIndex === -1 ? (
                  <select
                    value={wizUpbringingCustomSkill}
                    onChange={(e) => setWizUpbringingCustomSkill(e.target.value)}
                    className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink text-center font-bold"
                  >
                    {ALL_SKILLS.map(s => (
                      <option key={s} value={s}>+1 {s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-surface-well border border-wilder-amber text-wilder-blue text-xs text-center font-bold py-2 rounded">
                    +1 {UPBRINGINGS[wizUpbringingIndex].skill}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-surface-border">
              <div>
                <label className="block text-[10px] text-wilder-amber mb-0.5">家乡特产</label>
                <input
                  type="text"
                  value={wizUpbringingSpecialty}
                  onChange={(e) => setWizUpbringingSpecialty(e.target.value)}
                  placeholder="例如: 白米, 玉米, 虫尾"
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2 py-1 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[10px] text-wilder-amber mb-0.5">家乡香料</label>
                <input
                  type="text"
                  value={wizUpbringingSpice}
                  onChange={(e) => setWizUpbringingSpice(e.target.value)}
                  placeholder="例如: 大蒜, 鱼露, 怪物之血"
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2 py-1 text-xs text-ink"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface p-4 rounded border border-surface-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-ink text-sm flex items-center gap-1">
                第二道菜：动机 (Motivation) — 变异野兽餐
              </span>
              <button
                onClick={() => rollBackgroundOption('motivation')}
                className="text-xs bg-wilder-blue border border-wilder-blue px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-wilder-blue"
              >
                <Shuffle size={12} /> 随机骰选
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <label className="block text-[10px] text-wilder-amber mb-1">动机餐食名称</label>
                <select
                  value={wizMotivationIndex}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setWizMotivationIndex(val);
                    if (val !== -1) {
                      setWizMotivationMeal(MOTIVATIONS[val].description.split('。')[0] || '怪物牛排');
                      setWizMotivationText(MOTIVATIONS[val].description);
                    }
                  }}
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink"
                >
                  {MOTIVATIONS.map((m, i) => {
                    const commaIdx = m.description.indexOf('，');
                    const periodIdx = m.description.indexOf('。');
                    const firstBreak = commaIdx === -1 ? periodIdx : (periodIdx === -1 ? commaIdx : Math.min(commaIdx, periodIdx));
                    const boldLabel = firstBreak === -1 ? m.description : m.description.substring(0, firstBreak);
                    return <option key={i} value={i}>{i+1}. {boldLabel}</option>;
                  })}
                  <option value={-1}>自定义 ✏️</option>
                </select>
                {wizMotivationIndex === -1 && (
                  <input
                    type="text"
                    value={wizMotivationMeal}
                    onChange={(e) => setWizMotivationMeal(e.target.value)}
                    placeholder="输入自定义动机餐食名称..."
                    className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink mt-2"
                  />
                )}
              </div>
              <div className="md:col-span-6">
                <label className="block text-[10px] text-wilder-amber mb-1">入伙故事与野性觉醒</label>
                <textarea
                  rows={2}
                  value={wizMotivationText}
                  onChange={(e) => setWizMotivationText(e.target.value)}
                  placeholder="那是什么怪物？那只怪物是怎么死的？你为什么吃了它？是谁与你一同烹饪的？"
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] text-wilder-amber mb-1">对应技能加成</label>
                {wizMotivationIndex === -1 ? (
                  <select
                    value={wizMotivationCustomSkill}
                    onChange={(e) => setWizMotivationCustomSkill(e.target.value)}
                    className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink text-center font-bold"
                  >
                    {ALL_SKILLS.map(s => (
                      <option key={s} value={s}>+1 {s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-surface-well border border-wilder-amber text-wilder-blue text-xs text-center font-bold py-2 rounded">
                    +1 {MOTIVATIONS[wizMotivationIndex].skill}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface p-4 rounded border border-surface-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-ink text-sm flex items-center gap-1">
                第三道菜：雄心 (Ambition) — 梦想终极餐
              </span>
              <button
                onClick={() => rollBackgroundOption('ambition')}
                className="text-xs bg-wilder-blue border border-wilder-blue px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-wilder-blue"
              >
                <Shuffle size={12} /> 随机骰选
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <label className="block text-[10px] text-wilder-amber mb-1">雄心餐食名称</label>
                <select
                  value={wizAmbitionIndex}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setWizAmbitionIndex(val);
                    if (val !== -1) {
                      setWizAmbitionMeal(AMBITIONS[val].description.split('。')[0] || '巨人之心');
                      setWizAmbitionText(AMBITIONS[val].description);
                    }
                  }}
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink"
                >
                  {AMBITIONS.map((a, i) => {
                    const commaIdx = a.description.indexOf('，');
                    const periodIdx = a.description.indexOf('。');
                    const firstBreak = commaIdx === -1 ? periodIdx : (periodIdx === -1 ? commaIdx : Math.min(commaIdx, periodIdx));
                    const boldLabel = firstBreak === -1 ? a.description : a.description.substring(0, firstBreak);
                    return <option key={i} value={i}>{i+1}. {boldLabel}</option>;
                  })}
                  <option value={-1}>自定义 ✏️</option>
                </select>
                {wizAmbitionIndex === -1 && (
                  <input
                    type="text"
                    value={wizAmbitionMeal}
                    onChange={(e) => setWizAmbitionMeal(e.target.value)}
                    placeholder="输入自定义梦想料理名称..."
                    className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink mt-2"
                  />
                )}
              </div>
              <div className="md:col-span-6">
                <label className="block text-[10px] text-wilder-amber mb-1">渴望达成的成就</label>
                <textarea
                  rows={2}
                  value={wizAmbitionText}
                  onChange={(e) => setWizAmbitionText(e.target.value)}
                  placeholder="这道餐食代表了什么？你为何渴望它？这种渴望有多强烈？是什么阻碍了你？你以前吃过吗？"
                  className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] text-wilder-amber mb-1">对应技能加成</label>
                {wizAmbitionIndex === -1 ? (
                  <select
                    value={wizAmbitionCustomSkill}
                    onChange={(e) => setWizAmbitionCustomSkill(e.target.value)}
                    className="w-full bg-surface-well border border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink text-center font-bold"
                  >
                    {ALL_SKILLS.map(s => (
                      <option key={s} value={s}>+1 {s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-surface-well border border-wilder-amber text-wilder-blue text-xs text-center font-bold py-2 rounded">
                    +1 {AMBITIONS[wizAmbitionIndex].skill}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold font-serif text-wilder-blue">联结 (Connection Bond)</h3>
          <button
            onClick={() => {
              const roll = Math.floor(Math.random() * 20);
              setWizBondIndex(roll);
              setWizBond(BONDS[roll].description);
            }}
            className="text-xs bg-wilder-blue border border-wilder-blue px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-wilder-blue"
          >
            <Shuffle size={12} /> 随机骰选
          </button>
        </div>
        <p className="text-xs text-ink-muted mb-2">
          从你的背景故事中选择一道菜，然后再选择另一位荒野食客。你们两人因这道菜而结下了牵绊。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-[10px] text-wilder-amber mb-1">联结选项</label>
            <select
              value={wizBondIndex}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setWizBondIndex(val);
                if (val !== -1) {
                  setWizBond(BONDS[val].description);
                }
              }}
              className="w-full bg-surface border-2 border-wilder-amber rounded px-2.5 py-1.5 text-xs text-ink"
            >
              {BONDS.map((b, i) => {
                const commaIdx = b.description.indexOf('，');
                const periodIdx = b.description.indexOf('。');
                const firstBreak = commaIdx === -1 ? periodIdx : (periodIdx === -1 ? commaIdx : Math.min(commaIdx, periodIdx));
                const label = firstBreak === -1 ? b.description : b.description.substring(0, firstBreak);
                return (
                  <option key={i} value={i}>{i+1}. （{b.type}）{label}</option>
                );
              })}
              <option value={-1}>自定义 ✏️</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-[10px] text-wilder-amber mb-1">牵绊详情</label>
            <textarea
              rows={2}
              value={wizBond}
              onChange={(e) => setWizBond(e.target.value)}
              placeholder="描述你与队友之间的联结..."
              className="w-full bg-surface border-2 border-wilder-amber rounded px-3 py-2 text-xs text-ink"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold font-serif mb-2 text-wilder-blue">选择背景页插图</h3>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-32 border-3 border-dashed border-wilder-blue bg-surface rounded flex items-center justify-center text-ink overflow-hidden flex-shrink-0">
            {wizBackgroundType === 'portrait' ? (
              <span className="text-[10px] text-ink-light text-center px-1">使用角色肖像</span>
            ) : wizBackgroundType === 'upload' || wizBackgroundType === 'drawing' ? (
              <img src={wizBackgroundValue} alt="background" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-ink-light text-center px-1">使用角色肖像</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <label className="btn-sketch rounded px-2.5 py-1 bg-surface-border border-orange-700 cursor-pointer text-[11px]">
                上传图片
                <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={openBackgroundDrawingModal}
                className="btn-sketch rounded px-2.5 py-1 bg-surface-border border-orange-700 cursor-pointer text-[11px] flex items-center gap-1"
              >
                ✏️ 手绘
              </button>
              {wizBackgroundType !== 'portrait' && (
                <button
                  type="button"
                  onClick={() => { setWizBackgroundType('portrait'); setWizBackgroundValue(''); }}
                  className="text-[11px] text-ink-light hover:text-red-600 underline"
                >
                  清除
                </button>
              )}
            </div>
            <p className="text-[10px] text-ink-muted">上传或手绘一张属于你角色背景故事的插图，将显示在人物卡第二页。</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="btn-sketch rounded px-4 py-2 bg-surface border-wilder-amber text-ink"
        >
          ← 上一步
        </button>

        <button
          onClick={onCreate}
          className="btn-sketch rounded px-8 py-3 bg-wilder-blue border-wilder-amber text-white flex items-center gap-2 font-serif font-bold text-lg hover:shadow-rough"
        >
          刻入猎群契约（创建荒野食客）
        </button>
      </div>
    </div>
  );
});

export { Step3Background };