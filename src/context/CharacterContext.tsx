import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { Character } from '../types';
import { PRE_GENS } from '../data';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CharacterState {
  characters: Character[];
  selectedCharId: string;
  notification: NotificationState | null;
}

type CharacterAction =
  | { type: 'SET_CHARACTERS'; characters: Character[] }
  | { type: 'SET_SELECTED_CHAR_ID'; id: string }
  | { type: 'SHOW_NOTIFICATION'; notification: NotificationState }
  | { type: 'DISMISS_NOTIFICATION' };

function migrateCharacter(c: Character): Character {
  return {
    ...c,
    techniques: c.techniques || c.traits.slice(0, 2),
    statesActive: c.statesActive || [],
    playerName: c.playerName || '',
    backgroundType: c.backgroundType || 'portrait',
    backgroundValue: c.backgroundValue || '',
  };
}

const BUILTIN_AVATAR_MAP: Record<string, string> = {
  '普莱兹': '渔夫',
  '巴格': '储藏者',
  '娜特·辛': '面包师',
  '泰伦': '屠夫',
  '莲恩': '调味者',
};

function getPreGenAvatar(pgName: string): string {
  return BUILTIN_AVATAR_MAP[pgName] || '变形者';
}

function initializeState(): CharacterState {
  const loadedCustoms = localStorage.getItem('wilder_customs');
  let customChars: Character[] = [];
  if (loadedCustoms) {
    try {
      customChars = JSON.parse(loadedCustoms).map(migrateCharacter);
    } catch (e) {
      console.error('Error loading custom characters:', e);
    }
  }

  const preGenList: Character[] = PRE_GENS.map((pg, i) => {
    let dbMax = pg.durability;
    if (pg.traits.includes('钢铁之盾')) {
      dbMax = 50;
    }
    return migrateCharacter({
      id: `pregen_${i}`,
      isCustom: false,
      name: pg.name,
      playerName: '',
      specialty: pg.specialty,
      adjectives: pg.adjectives,
      tool: pg.tool,
      stylesChoice: pg.stylesChoice,
      styleValues: pg.styleValues,
      skills: pg.skills,
      traits: pg.traits,
      techniques: pg.traits.slice(0, 2),
      companion: pg.companion,
      backgroundMeals: pg.backgroundMeals,
      bond: pg.bond,
      durabilityMax: dbMax,
      stamina: 20,
      durability: dbMax,
      harmony: 3,
      harmonyMax: 3,
      states: {
        injured1: false,
        injured2: false,
        injured3: false,
        exposed: false,
        hidden: false,
        disharmony: false,
      },
      statesActive: [],
      avatarType: 'emoji',
      avatarValue: getPreGenAvatar(pg.name),
      backgroundType: 'portrait',
      backgroundValue: '',
    });
  });

  return {
    characters: [...preGenList, ...customChars],
    selectedCharId: '',
    notification: null,
  };
}

function characterReducer(state: CharacterState, action: CharacterAction): CharacterState {
  switch (action.type) {
    case 'SET_CHARACTERS':
      return { ...state, characters: action.characters };
    case 'SET_SELECTED_CHAR_ID':
      return { ...state, selectedCharId: action.id };
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.notification };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notification: null };
    default:
      return state;
  }
}

interface CharacterContextValue {
  characters: Character[];
  selectedCharId: string;
  notification: NotificationState | null;
  activeChar: Character | undefined;
  setSelectedCharId: (id: string) => void;
  setCharacters: (characters: Character[]) => void;
  saveCustomCharacters: (updatedCustoms: Character[]) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  deleteCharacter: (id: string, e: React.MouseEvent) => void;
  handleJsonImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleJsonExport: (char: Character) => void;
  updateActiveCharStat: (key: 'stamina' | 'durability' | 'harmony' | 'harmonyMax' | 'notes', val: any) => void;
  updateActiveCharStyle: (styleKey: string, val: number) => void;
  updateActiveCharSkill: (skillKey: string, val: number) => void;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(characterReducer, undefined, initializeState);
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChar = state.characters.find(c => c.id === state.selectedCharId);

  useEffect(() => {
    if (state.notification) {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
      notificationTimer.current = setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION' });
      }, 4000);
    }
    return () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
    };
  }, [state.notification]);

  const setSelectedCharId = useCallback((id: string) => {
    dispatch({ type: 'SET_SELECTED_CHAR_ID', id });
  }, []);

  const setCharacters = useCallback((characters: Character[]) => {
    dispatch({ type: 'SET_CHARACTERS', characters });
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch({ type: 'SHOW_NOTIFICATION', notification: { message, type } });
  }, []);

  const rebuildFullList = useCallback((customChars: Character[]): Character[] => {
    const migrated = customChars.map(c => ({
      ...c,
      techniques: c.techniques || c.traits.slice(0, 2),
      statesActive: c.statesActive || [],
    }));

    const preGenList: Character[] = PRE_GENS.map((pg, i) => {
      let dbMax = pg.durability;
      if (pg.traits.includes('钢铁之盾')) dbMax = 50;
      return {
        id: `pregen_${i}`,
        isCustom: false,
        name: pg.name,
        playerName: '',
        specialty: pg.specialty,
        adjectives: pg.adjectives,
        tool: pg.tool,
        stylesChoice: pg.stylesChoice,
        styleValues: pg.styleValues,
        skills: pg.skills,
        traits: pg.traits,
        techniques: pg.traits.slice(0, 2),
        companion: pg.companion,
        backgroundMeals: pg.backgroundMeals,
        bond: pg.bond,
        durabilityMax: dbMax,
        stamina: 20,
        durability: dbMax,
        harmony: 3,
        harmonyMax: 3,
        states: {
          injured1: false,
          injured2: false,
          injured3: false,
          exposed: false,
          hidden: false,
          disharmony: false,
        },
        statesActive: [],
        avatarType: 'emoji',
        avatarValue: getPreGenAvatar(pg.name),
        backgroundType: 'portrait',
        backgroundValue: '',
      };
    });

    return [...preGenList, ...migrated];
  }, []);

  const saveCustomCharacters = useCallback((updatedCustoms: Character[]) => {
    localStorage.setItem('wilder_customs', JSON.stringify(updatedCustoms));
    const loadedCustoms = localStorage.getItem('wilder_customs');
    let customChars: Character[] = [];
    if (loadedCustoms) {
      try {
        customChars = (JSON.parse(loadedCustoms) as Character[]).map(c => ({
          ...c,
          techniques: c.techniques || c.traits.slice(0, 2),
          statesActive: c.statesActive || [],
        }));
      } catch (e) {
        console.error('Error loading custom characters:', e);
      }
    }
    const fullList = rebuildFullList(customChars);
    dispatch({ type: 'SET_CHARACTERS', characters: fullList });
  }, [rebuildFullList]);

  const updateActiveCharStat = useCallback((key: 'stamina' | 'durability' | 'harmony' | 'harmonyMax' | 'notes', val: any) => {
    if (!activeChar) return;
    const updated = { ...activeChar, [key]: val };

    if (key === 'stamina') {
      updated.stamina = Math.max(0, Math.min(20, val));
    } else if (key === 'durability') {
      updated.durability = Math.max(0, Math.min(activeChar.durabilityMax, val));
    } else if (key === 'harmony') {
      updated.harmony = Math.max(0, Math.min(updated.harmonyMax, val));
    }

    if (activeChar.isCustom) {
      const customs = state.characters.filter(c => c.isCustom);
      const index = customs.findIndex(c => c.id === activeChar.id);
      if (index !== -1) {
        customs[index] = updated;
        saveCustomCharacters(customs);
      }
    } else {
      const customs = state.characters.filter(c => c.isCustom);
      const pregenInCustoms = customs.find(c => c.id === activeChar.id);
      if (pregenInCustoms) {
        const index = customs.findIndex(c => c.id === activeChar.id);
        customs[index] = updated;
        saveCustomCharacters(customs);
      } else {
        const cloned = { ...updated, id: `${activeChar.id}_session`, isCustom: true };
        saveCustomCharacters([...customs, cloned]);
        dispatch({ type: 'SET_SELECTED_CHAR_ID', id: cloned.id });
      }
    }

    dispatch({ type: 'SET_CHARACTERS', characters: state.characters.map(c => c.id === state.selectedCharId || c.id === activeChar.id ? updated : c) });
  }, [activeChar, state.characters, state.selectedCharId, saveCustomCharacters]);

  const updateActiveCharStyle = useCallback((styleKey: string, val: number) => {
    if (!activeChar) return;
    const updated = {
      ...activeChar,
      styleValues: {
        ...activeChar.styleValues,
        [styleKey]: val,
      },
    };

    if (activeChar.isCustom) {
      const customs = state.characters.filter(c => c.isCustom);
      const index = customs.findIndex(c => c.id === activeChar.id);
      if (index !== -1) {
        customs[index] = updated;
        saveCustomCharacters(customs);
      }
    } else {
      const customs = state.characters.filter(c => c.isCustom);
      const cloned = { ...updated, id: `${activeChar.id}_session`, isCustom: true };
      saveCustomCharacters([...customs, cloned]);
      dispatch({ type: 'SET_SELECTED_CHAR_ID', id: cloned.id });
    }

    dispatch({ type: 'SET_CHARACTERS', characters: state.characters.map(c => c.id === state.selectedCharId || c.id === activeChar.id ? updated : c) });

    const styleLabel = styleKey === 'power' ? '力量' : styleKey === 'precision' ? '精准' : styleKey === 'swiftness' ? '迅捷' : '技巧';
    dispatch({ type: 'SHOW_NOTIFICATION', notification: { message: `已更新 ${activeChar.name} 的风格：${styleLabel} 为 ${val} 级`, type: 'success' } });
  }, [activeChar, state.characters, state.selectedCharId, saveCustomCharacters]);

  const updateActiveCharSkill = useCallback((skillKey: string, val: number) => {
    if (!activeChar) return;
    const updated = {
      ...activeChar,
      skills: {
        ...activeChar.skills,
        [skillKey]: val,
      },
    };

    if (activeChar.isCustom) {
      const customs = state.characters.filter(c => c.isCustom);
      const index = customs.findIndex(c => c.id === activeChar.id);
      if (index !== -1) {
        customs[index] = updated;
        saveCustomCharacters(customs);
      }
    } else {
      const customs = state.characters.filter(c => c.isCustom);
      const cloned = { ...updated, id: `${activeChar.id}_session`, isCustom: true };
      saveCustomCharacters([...customs, cloned]);
      dispatch({ type: 'SET_SELECTED_CHAR_ID', id: cloned.id });
    }

    dispatch({ type: 'SET_CHARACTERS', characters: state.characters.map(c => c.id === state.selectedCharId || c.id === activeChar.id ? updated : c) });
    dispatch({ type: 'SHOW_NOTIFICATION', notification: { message: `已更新 ${activeChar.name} 的技能：${skillKey} 为 +${val}`, type: 'success' } });
  }, [activeChar, state.characters, state.selectedCharId, saveCustomCharacters]);

  const deleteCharacter = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这个人物卡吗？此操作无法撤销。')) return;

    const customs = state.characters.filter(c => c.isCustom && c.id !== id);
    saveCustomCharacters(customs);
    dispatch({ type: 'SHOW_NOTIFICATION', notification: { message: '人物卡已删除', type: 'info' } });
    if (state.selectedCharId === id) {
      dispatch({ type: 'SET_SELECTED_CHAR_ID', id: '' });
    }
  }, [state.characters, state.selectedCharId, saveCustomCharacters]);

  const handleJsonImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const charData = JSON.parse(event.target?.result as string);
        if (!charData.name || !charData.tool || !charData.specialty) {
          dispatch({ type: 'SHOW_NOTIFICATION', notification: { message: '无效的人物卡数据：缺少核心属性', type: 'error' } });
          return;
        }

        const newChar: Character = {
          ...charData,
          id: `custom_${Date.now()}`,
          isCustom: true,
        };

        const customs = state.characters.filter(c => c.isCustom);
        saveCustomCharacters([...customs, newChar]);
        dispatch({ type: 'SET_SELECTED_CHAR_ID', id: newChar.id });
        dispatch({ type: 'SHOW_NOTIFICATION', notification: { message: `成功导入人物 ${newChar.name}!`, type: 'success' } });
      } catch (error) {
        dispatch({ type: 'SHOW_NOTIFICATION', notification: { message: '解析 JSON 文件失败', type: 'error' } });
      }
    };
    reader.readAsText(file);
  }, [state.characters, saveCustomCharacters]);

  const handleJsonExport = useCallback((char: Character) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(char, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${char.name}_${char.specialty}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    dispatch({ type: 'SHOW_NOTIFICATION', notification: { message: '导出 JSON 成功', type: 'success' } });
  }, []);

  const value: CharacterContextValue = {
    characters: state.characters,
    selectedCharId: state.selectedCharId,
    notification: state.notification,
    activeChar,
    setSelectedCharId,
    setCharacters,
    saveCustomCharacters,
    showNotification,
    deleteCharacter,
    handleJsonImport,
    handleJsonExport,
    updateActiveCharStat,
    updateActiveCharStyle,
    updateActiveCharSkill,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter(): CharacterContextValue {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}
