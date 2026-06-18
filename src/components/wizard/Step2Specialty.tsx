import React from 'react';
import { Search } from 'lucide-react';
import { LINEAGES, type Lineage, type Trait } from '../../data';
import { APPENDIX_TRAITS } from '../../appendixData';

interface Step2Props {
  wizLineage: Lineage; setWizLineage: (v: Lineage) => void;
  wizTraitPrimary: Trait | null; setWizTraitPrimary: (v: Trait | null) => void;
  wizTraitSecondary: Trait | null; setWizTraitSecondary: (v: Trait | null) => void;
  wizSecondaryTraitSource: 'specialty' | 'appendix'; setWizSecondaryTraitSource: (v: 'specialty' | 'appendix') => void;
  wizSecondarySearchQuery: string; setWizSecondarySearchQuery: (v: string) => void;
  wizCompanionIndex: number; setWizCompanionIndex: (v: number) => void;
  wizCompanionCustomName: string; setWizCompanionCustomName: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const Step2Specialty = React.memo(function Step2Specialty({
  wizLineage, setWizLineage,
  wizTraitPrimary, setWizTraitPrimary,
  wizTraitSecondary, setWizTraitSecondary,
  wizSecondaryTraitSource, setWizSecondaryTraitSource,
  wizSecondarySearchQuery, setWizSecondarySearchQuery,
  wizCompanionIndex, setWizCompanionIndex,
  wizCompanionCustomName, setWizCompanionCustomName,
  onNext,
  onPrev
}: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold font-serif mb-2 text-wilder-blue font-serif">选择你的突变专长 (Specialty)</h3>
        <p className="text-xs text-ink-muted mb-4">
          荒野食客通过烹食怪物来获得基因突变。选择你所擅长的怪物谱系。专长决定你的初始特性和亲密同伴。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LINEAGES.map(l => (
            <div
              key={l.name}
              onClick={() => setWizLineage(l)}
              className={`border-3 p-3 rounded cursor-pointer transition-all ${
                wizLineage.name === l.name
                  ? 'bg-wilder-blue border-wilder-blue text-white shadow-rough'
                  : 'bg-surface border-surface-border text-ink-muted hover:border-orange-700'
              }`}
            >
              <div className="font-bold font-serif text-md">{l.name}</div>
              <div className="text-[9px] text-wilder-amber mt-1 line-clamp-1">{l.description}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface p-4 rounded border border-surface-border mt-4 space-y-4">
          <div>
            <h4 className="font-bold text-sm text-ink">🥗 {wizLineage.name} 的生物特征:</h4>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">{wizLineage.description}</p>
          </div>

          <div className="border-t border-surface-border pt-3">
            <span className="block text-xs font-bold text-ink mb-2">🧬 初始特性一（从本谱系专属特性中 3 选 1）：</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {wizLineage.traits.map(tr => (
                <div
                  key={tr.name}
                  onClick={() => setWizTraitPrimary(tr)}
                  className={`border-2 p-2.5 rounded cursor-pointer transition-all text-xs ${
                    wizTraitPrimary?.name === tr.name
                      ? 'bg-wilder-blue border-wilder-blue text-white shadow-rough'
                      : 'bg-surface border-surface-border text-ink-muted'
                  }`}
                >
                  <div className={`flex justify-between font-bold ${wizTraitPrimary?.name === tr.name ? 'text-white' : 'text-wilder-blue'}`}>
                    <span>{tr.name}</span>
                    <span className="text-[9px] bg-surface-border px-1 rounded text-ink-light">{tr.cost}</span>
                  </div>
                  <p className={`text-[10px] mt-1 ${wizTraitPrimary?.name === tr.name ? 'text-white/80' : 'text-wilder-amber'}`}>{tr.effect}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-surface-border pt-3 space-y-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
              <span className="block text-xs font-bold text-ink">初始特性二（杂学：可自选八大专长或附录A特性库）：</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setWizSecondaryTraitSource('specialty')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                    wizSecondaryTraitSource === 'specialty'
                      ? 'bg-wilder-blue border-wilder-amber text-white shadow-rough'
                      : 'bg-surface border-wilder-amber text-ink-muted'
                  }`}
                >
                  8大专长特性
                </button>
                <button
                  type="button"
                  onClick={() => setWizSecondaryTraitSource('appendix')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                    wizSecondaryTraitSource === 'appendix'
                      ? 'bg-wilder-blue border-wilder-amber text-white shadow-rough'
                      : 'bg-surface border-wilder-amber text-ink-muted'
                  }`}
                >
                  附录A特性库
                </button>
              </div>
            </div>

            {wizSecondaryTraitSource === 'specialty' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-surface-well rounded border border-surface-border">
                {LINEAGES.map(lg => (
                  <div key={lg.name} className="space-y-1">
                    <div className="text-[9px] bg-surface-border px-1.5 py-0.5 text-ink-muted font-bold truncate">{lg.name}</div>
                    {lg.traits.map(tr => (
                      <div
                        key={tr.name}
                        onClick={() => setWizTraitSecondary(tr)}
                        className={`p-1.5 rounded cursor-pointer text-[10px] transition-all truncate ${
                          wizTraitSecondary?.name === tr.name
                            ? 'bg-wilder-blue text-white'
                            : 'text-ink-light hover:bg-surface'
                        }`}
                        title={`${tr.name}: ${tr.effect}`}
                      >
                        {tr.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center bg-surface-well border border-surface-border rounded px-2 py-1">
                  <Search size={14} className="text-wilder-amber mr-1.5" />
                  <input
                    type="text"
                    value={wizSecondarySearchQuery}
                    onChange={(e) => setWizSecondarySearchQuery(e.target.value)}
                    placeholder="搜索附录A特性名称 or 描述..."
                    className="bg-transparent focus:outline-none text-xs text-ink placeholder:text-wilder-amber w-full"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 bg-surface-well rounded border border-surface-border">
                  {APPENDIX_TRAITS.filter(tr =>
                    tr.name.includes(wizSecondarySearchQuery) ||
                    tr.effect.includes(wizSecondarySearchQuery)
                  ).map(tr => (
                    <div
                      key={tr.name}
                      onClick={() => setWizTraitSecondary({ name: tr.name, cost: tr.cost, effect: tr.effect })}
                      className={`p-2 rounded cursor-pointer text-[10px] transition-all border ${
                        wizTraitSecondary?.name === tr.name
                          ? 'bg-wilder-blue border-wilder-blue text-white'
                          : 'bg-surface border-surface-border text-ink-light hover:bg-surface-border hover:text-ink'
                      }`}
                      title={`${tr.name} (${tr.cost}): ${tr.effect}`}
                    >
                      <div className="font-bold truncate">{tr.name}</div>
                      <div className="text-[8px] text-wilder-amber truncate mt-0.5">{tr.cost}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wizTraitSecondary && (
              <div className="mt-2 text-xs bg-surface-border p-2 rounded border border-surface-border text-ink-muted">
                已选择次要特性: <span className="font-bold text-wilder-blue">{wizTraitSecondary.name}</span> ({wizTraitSecondary.cost}) — {wizTraitSecondary.effect}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold font-serif mb-2 text-wilder-blue">选择你的密切同伴 (Companion)</h3>
        <p className="text-xs text-ink-muted mb-3">
          每一名荒野食客都与一只怪物同伴有着深厚的默契和牵绊。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {wizLineage.companions.map((comp, i) => (
            <div
              key={comp.name}
              onClick={() => setWizCompanionIndex(i)}
              className={`border-2 p-2.5 rounded cursor-pointer text-xs transition-all ${
                wizCompanionIndex === i
                    ? 'bg-wilder-blue border-wilder-blue text-white shadow-rough'
                    : 'bg-surface border-surface-border text-ink-light hover:border-wilder-amber'
              }`}
            >
              <div className="font-bold font-serif">{comp.name}</div>
              <p className="text-[10px] text-wilder-amber mt-1 line-clamp-3">{comp.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <label className="block text-xs font-bold mb-1 text-ink-muted">给同伴起个自定义名字（留空则使用默认名）：</label>
          <input
            type="text"
            value={wizCompanionCustomName}
            onChange={(e) => setWizCompanionCustomName(e.target.value)}
            placeholder={`默认：${wizLineage.companions[wizCompanionIndex].name}`}
            className="w-full max-w-md bg-surface border-2 border-wilder-amber rounded px-3 py-1.5 text-xs text-ink"
          />
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
          onClick={onNext}
          className="btn-sketch rounded px-6 py-2.5 bg-wilder-blue border-wilder-amber text-white flex items-center gap-1 font-serif font-bold text-md"
        >
          下一步：三道菜式背景设置 →
        </button>
      </div>
    </div>
  );
});

export { Step2Specialty };