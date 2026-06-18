import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, Compass } from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { getInkIcon } from '../icons';

export default function RosterPage() {
  const navigate = useNavigate();
  const { characters, selectedCharId, setSelectedCharId, handleJsonImport, deleteCharacter } = useCharacter();

  return (
    <div className="wood-panel p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif text-ink flex items-center gap-2">
          <Compass className="text-wilder-blue" /> 猎人列表
        </h2>
        <div className="relative">
          <label className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-ink flex items-center gap-1 cursor-pointer text-xs">
            <Upload size={14} /> 导入 JSON
            <input type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characters.map(char => (
          <div
            key={char.id}
            onClick={() => { setSelectedCharId(char.id); navigate(`/play/${char.id}`); }}
            className={`border-3 p-4 rounded-md cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-rough flex items-center space-x-4 ${
              selectedCharId === char.id
                ? 'bg-wilder-blue border-wilder-blue text-white shadow-rough'
                : 'bg-surface border-wilder-amber text-ink'
            }`}
          >
            <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden flex-shrink-0 ${
              selectedCharId === char.id ? 'border-white/40 bg-wilder-blue/20 text-white/80' : 'border-parchment-300 bg-surface-border text-ink-muted'
            }`}>
              {char.avatarType === 'emoji' ? (
                getInkIcon(char.avatarValue, 32)
              ) : (
                <img src={char.avatarValue} alt="avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold font-serif text-lg truncate">{char.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${char.isCustom ? 'bg-wilder-blue/10 text-wilder-blue border-wilder-blue/30' : 'bg-wilder-amber/10 text-wilder-amber border-wilder-amber/30'}`}>
                  {char.isCustom ? '自建' : '官方预设'}
                </span>
              </div>
              <p className={`text-xs truncate ${selectedCharId === char.id ? 'text-white/80' : 'text-ink-muted'}`}>
                {char.adjectives.join(' / ')} • {char.specialty}
              </p>
              <p className={`text-xs font-serif mt-1 flex items-center gap-1 ${selectedCharId === char.id ? 'text-white/70' : 'text-ink-muted'}`}>
                工具: {char.tool}
              </p>
            </div>
            {char.isCustom && (
              <button
                onClick={(e) => deleteCharacter(char.id, e)}
                className="text-wilder-amber hover:text-wilder-blue p-2"
                title="删除角色"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        <div
          onClick={() => navigate('/create')}
          className="border-3 border-dashed border-orange-700 p-6 rounded-md cursor-pointer transition-all hover:bg-surface flex flex-col items-center justify-center text-ink-muted"
        >
          <Plus size={32} className="mb-2" />
          <span className="font-bold">契约新猎人</span>
          <span className="text-xs mt-1 text-wilder-amber">开始分步向导，定制属于你的荒野食客</span>
        </div>
      </div>
    </div>
  );
}
