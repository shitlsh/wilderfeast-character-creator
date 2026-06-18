import { useCharacter } from '../context/CharacterContext';

export default function Notification() {
  const { notification } = useCharacter();

  if (!notification) return null;

  return (
    <div className="fixed top-4 left-4 z-[60] px-5 py-3 rounded-md shadow-rough border-l-3 text-sm flex items-center gap-2 bg-surface text-ink border-l-wilder-amber">
      <span className="flex-shrink-0">
        {notification.type === 'success' ? '✨' : notification.type === 'error' ? '💥' : '🔍'}
      </span>
      <span>{notification.message}</span>
    </div>
  );
}
