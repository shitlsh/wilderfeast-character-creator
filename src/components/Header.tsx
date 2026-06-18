import { Users, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInkIcon } from '../icons';

const InkLogo = () => getInkIcon('屠夫', 40);

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isRoster = location.pathname === '/';
  const isCreate = location.pathname.startsWith('/create');

  return (
    <header className="flex flex-col md:flex-row justify-between items-center pb-6 mb-6 border-b-2 border-surface-border">
      <div className="flex items-center space-x-3 mb-4 md:mb-0">
        <span className="text-[#E07A2B]"><InkLogo /></span>
        <div>
          <h1 className="text-3xl font-extrabold text-[#E07A2B] tracking-wide font-serif">
            荒野盛宴电子人物卡
          </h1>
          <p className="text-xs text-[#F5EBD6]">
            Wilderfeast Character Sheet & Creator Wizard
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => navigate('/')}
          className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${isRoster ? 'bg-wilder-blue border-wilder-amber text-white' : 'bg-surface border-orange-700 text-ink'}`}
        >
          <Users size={16} /> 猎人列表
        </button>
        <button
          onClick={() => navigate('/create')}
          className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${isCreate ? 'bg-wilder-blue border-wilder-amber text-white' : 'bg-surface border-orange-700 text-ink'}`}
        >
          <Plus size={16} /> 新建猎人
        </button>
      </div>
    </header>
  );
}
