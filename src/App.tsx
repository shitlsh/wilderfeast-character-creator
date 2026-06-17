import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  Dice5, Download, Upload, Plus, Trash2, 
  Printer, ArrowLeft, Shuffle, 
  Users, Share2, Compass, BookOpen as BookIcon, Search
} from 'lucide-react';
import { 
  TOOLS, LINEAGES, UPBRINGINGS, MOTIVATIONS, AMBITIONS, BONDS, PRE_GENS,
  Tool, Lineage, Trait, Technique
} from './data';
import { getInkIcon, getCharacterPortrait } from './icons';
import { 
  APPENDIX_TRAITS, APPENDIX_TECHNIQUES, APPENDIX_STATES, APPENDIX_REGIONS 
} from './appendixData';

// Definition for our dynamic character state
interface Character {
  id: string;
  isCustom: boolean;
  name: string;
  playerName: string;
  specialty: string;
  adjectives: [string, string]; // [current, aspiring]
  tool: string;
  stylesChoice: 'a' | 'b';
  styleValues: {
    power: number;
    precision: number;
    swiftness: number;
    technique: number;
  };
  skills: { [key: string]: number };
  traits: string[]; // List of names of lineage/appendix traits
  techniques: string[]; // List of technique names
  companion: {
    name: string;
    description: string;
  };
  backgroundMeals: {
    upbringing: { meal: string; text: string; skill: string };
    motivation: { meal: string; text: string; skill: string };
    ambition: { meal: string; text: string; skill: string };
  };
  bond: string;
  durabilityMax: number;
  // Live session states
  stamina: number;
  durability: number;
  harmony: number;
  harmonyMax: number;
  states: {
    injured1: boolean;
    injured2: boolean;
    injured3: boolean;
    exposed: boolean;
    hidden: boolean;
    disharmony: boolean;
  };
  statesActive: { name: string; level: number }[]; // Active conditions with levels
  avatarType: 'emoji' | 'upload' | 'drawing';
  avatarValue: string; // emoji character or base64 data url
  backgroundType: 'portrait' | 'upload' | 'drawing';
  backgroundValue: string; // character name (portrait) or base64 data url
  notes?: string;
}

const BUILTIN_AVATARS = [
  { value: '渔夫', label: '渔夫' },
  { value: '面包师', label: '面包师' },
  { value: '屠夫', label: '屠夫' },
  { value: '调味者', label: '调味者' },
  { value: '储藏者', label: '储藏者' },
  { value: '变形者', label: '变形者' },
  { value: '园丁', label: '园丁' },
  { value: '烧烤师', label: '烧烤师' },
  { value: 'wolf', label: '狼' },
  { value: 'eagle', label: '鹰' },
  { value: 'bear', label: '熊' },
  { value: 'dragon', label: '龙' },
  { value: 'tree', label: '森林' }
];

// Helper to highlight rulebook keywords in text with official design colors
const highlightKeywords = (text: string) => {
  if (!text) return '';
  let html = text;
  
  // Highlight system rules
  html = html.replace(/身体部位/g, '<span class="font-extrabold text-ink">身体部位</span>');
  html = html.replace(/结束条件/g, '<span class="font-extrabold text-ink">结束条件</span>');
  
  // Highlights (Red-Rust) for major status conditions
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

  // Highlights (Trait Teal) for traits
  html = html.replace(/毅力/g, '<span class="font-extrabold text-wilder-teal">毅力</span>');
  html = html.replace(/洞察/g, '<span class="font-extrabold text-wilder-teal">洞察</span>');
  html = html.replace(/特性/g, '<span class="font-extrabold text-wilder-teal">特性</span>');

  // Highlights (Wilder Blue) for actions / skills
  html = html.replace(/打击/g, '<span class="font-bold text-wilder-blue">打击</span>');
  html = html.replace(/射击/g, '<span class="font-bold text-wilder-blue">射击</span>');
  html = html.replace(/搜索/g, '<span class="font-bold text-wilder-blue">搜索</span>');
  html = html.replace(/穿越/g, '<span class="font-bold text-wilder-blue">穿越</span>');
  html = html.replace(/技能/g, '<span class="font-bold text-wilder-blue">技能</span>');

  // Highlights (Earthy Amber) for Styles
  html = html.replace(/风格/g, '<span class="font-bold text-wilder-amber">风格</span>');
  html = html.replace(/力量/g, '<span class="font-bold text-wilder-amber">力量</span>');
  html = html.replace(/精准/g, '<span class="font-bold text-wilder-amber">精准</span>');
  html = html.replace(/迅捷/g, '<span class="font-bold text-wilder-amber">迅捷</span>');
  html = html.replace(/技巧/g, '<span class="font-bold text-wilder-amber">技巧</span>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function App() {
  // Navigation / Tabs
  // 'roster' | 'create' | 'play'
  const [activeTab, setActiveTab] = useState<'roster' | 'create' | 'play'>('roster');
  
  // Characters state (LocalStorage + Preloaded PreGens)
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('');

  // Dice roller panel state
  const [diceRoll, setDiceRoll] = useState<{
    styleName: string;
    skillName: string;
    styleCount: number;
    skillBonus: number;
    rolled: boolean;
    dice: { value: number; active: boolean; adjustedValue: number }[];
    successes: number;
    actionRating: number;
    actionDieType: 'd8' | 'd20';
    actionDieValue: number;
  } | null>(null);

  const [selectedRollStyle, setSelectedRollStyle] = useState<string>('力量');
  const [selectedRollSkill, setSelectedRollSkill] = useState<string>('打击');
  const [actionDieMode, setActionDieMode] = useState<'focus' | 'wild'>('focus');

  // Character Wizard temporary state
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizName, setWizName] = useState('');
  const [wizPlayerName, setWizPlayerName] = useState('');
  const [wizTool, setWizTool] = useState<Tool>(TOOLS[0]);
  const [wizStylesChoice, setWizStylesChoice] = useState<'a' | 'b'>('a');
  const [wizSecondaryTech, setWizSecondaryTech] = useState<Technique | null>(null);
  const [wizAdjectiveCurrent, setWizAdjectiveCurrent] = useState('');
  const [wizAdjectiveAspiring, setWizAdjectiveAspiring] = useState('');

  const [wizLineage, setWizLineage] = useState<Lineage>(LINEAGES[0]);
  const [wizTraitPrimary, setWizTraitPrimary] = useState<Trait | null>(null);
  const [wizTraitSecondary, setWizTraitSecondary] = useState<Trait | null>(null);
  const [wizSecondaryTraitSource, setWizSecondaryTraitSource] = useState<'specialty' | 'appendix'>('specialty');
  const [wizSecondarySearchQuery, setWizSecondarySearchQuery] = useState('');
  const [wizCompanionIndex, setWizCompanionIndex] = useState<number>(0);
  const [wizCompanionCustomName, setWizCompanionCustomName] = useState('');

  // Background Course 1 (Upbringing)
  const [wizUpbringingIndex, setWizUpbringingIndex] = useState<number>(0);
  const [wizUpbringingMeal, setWizUpbringingMeal] = useState('');
  const [wizUpbringingText, setWizUpbringingText] = useState('');
  const [wizUpbringingSpecialty, setWizUpbringingSpecialty] = useState('');
  const [wizUpbringingSpice, setWizUpbringingSpice] = useState('');
  const [wizUpbringingCustomSkill, setWizUpbringingCustomSkill] = useState('搜索');

  // Background Course 2 (Motivation)
  const [wizMotivationIndex, setWizMotivationIndex] = useState<number>(0);
  const [wizMotivationMeal, setWizMotivationMeal] = useState('');
  const [wizMotivationText, setWizMotivationText] = useState('');
  const [wizMotivationCustomSkill, setWizMotivationCustomSkill] = useState('搜索');

  // Background Course 3 (Ambition)
  const [wizAmbitionIndex, setWizAmbitionIndex] = useState<number>(0);
  const [wizAmbitionMeal, setWizAmbitionMeal] = useState('');
  const [wizAmbitionText, setWizAmbitionText] = useState('');
  const [wizAmbitionCustomSkill, setWizAmbitionCustomSkill] = useState('搜索');

  const [wizBondIndex, setWizBondIndex] = useState<number>(0);
  const [wizBond, setWizBond] = useState('');
  const [wizAvatarType, setWizAvatarType] = useState<'emoji' | 'upload' | 'drawing'>('emoji');
  const [wizAvatarValue, setWizAvatarValue] = useState('渔夫');
  const [wizBackgroundType, setWizBackgroundType] = useState<'portrait' | 'upload' | 'drawing'>('portrait');
  const [wizBackgroundValue, setWizBackgroundValue] = useState('');
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [drawPenColor, setDrawPenColor] = useState('#2d100c');
  const [drawPenSize, setDrawPenSize] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingStateRef = useRef<{ isDrawing: boolean; lastX: number; lastY: number }>({ isDrawing: false, lastX: 0, lastY: 0 });
  const canvasHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Drawing modal: prevent body scroll + ESC close
  useEffect(() => {
    if (isDrawingModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsDrawingModalOpen(false);
      };
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKey);
      };
    }
    return () => {};
  }, [isDrawingModalOpen]);

  const ALL_SKILLS = ['激励', '发声', '手艺', '治愈', '展示', '抓取', '储存', '搜索', '射击', '打击', '学习', '穿越'];

  // Appendix State
  const [activeAppendixTab, setActiveAppendixTab] = useState<'a' | 'b' | 'c' | 'd' | 'e'>('d');
  const [appendixSearchQuery, setAppendixSearchQuery] = useState('');
  const [appendixFilterWeapon, setAppendixFilterWeapon] = useState('all');

  // Drawer States
  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState<boolean>(false);
  const [isManualDrawerOpen, setIsManualDrawerOpen] = useState<boolean>(false);
  const [pickerModal, setPickerModal] = useState<'none' | 'technique' | 'trait'>('none');
  const [pickerSearch, setPickerSearch] = useState('');
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [pendingState, setPendingState] = useState('');
  const [pendingStateLevel, setPendingStateLevel] = useState(1);

  // Alert/Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Ref for card export
  const cardPrintRef = useRef<HTMLDivElement>(null);

  // Initialize and load characters
  useEffect(() => {
    const migrateCharacter = (c: Character): Character => ({
      ...c,
      techniques: c.techniques || c.traits.slice(0, 2),
      statesActive: c.statesActive || [],
      playerName: c.playerName || '',
      backgroundType: c.backgroundType || 'portrait',
      backgroundValue: c.backgroundValue || '',
    });

    const loadedCustoms = localStorage.getItem('wilder_customs');
    let customChars: Character[] = [];
    if (loadedCustoms) {
      try {
        customChars = JSON.parse(loadedCustoms).map(migrateCharacter);
      } catch (e) {
        console.error('Error loading custom characters:', e);
      }
    }

    // Map pre-gens to Character format
    const preGenList: Character[] = PRE_GENS.map((pg, i) => {
      // Find maximum durability
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
          disharmony: false
        },
        statesActive: [],
        avatarType: 'emoji',
        avatarValue: pg.name === '普莱兹' ? '渔夫' : 
                     pg.name === '巴格' ? '储藏者' : 
                     pg.name === '娜特·辛' ? '面包师' : 
                     pg.name === '泰伦' ? '屠夫' : 
                     pg.name === '莲恩' ? '调味者' : '变形者',
        backgroundType: 'portrait',
        backgroundValue: ''
      });
    });

    setCharacters([...preGenList, ...customChars]);
  }, []);

  // Save custom characters to LocalStorage
  const saveCustomCharacters = (updatedCustoms: Character[]) => {
    localStorage.setItem('wilder_customs', JSON.stringify(updatedCustoms));
    
    // Refresh master character list
    const loadedCustoms = localStorage.getItem('wilder_customs');
    let customChars: Character[] = [];
    if (loadedCustoms) {
      customChars = (JSON.parse(loadedCustoms) as Character[]).map((c: Character) => ({
        ...c,
        techniques: c.techniques || c.traits.slice(0, 2),
        statesActive: c.statesActive || [],
      }));
    }
    
    // Keep pregens
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
          disharmony: false
        },
        statesActive: [],
        avatarType: 'emoji',
        avatarValue: pg.name === '普莱兹' ? '渔夫' : 
                     pg.name === '巴格' ? '储藏者' : 
                     pg.name === '娜特·辛' ? '面包师' : 
                     pg.name === '泰伦' ? '屠夫' : 
                     pg.name === '莲恩' ? '调味者' : '变形者',
        backgroundType: 'portrait',
        backgroundValue: ''
      };
    });

    setCharacters([...preGenList, ...customChars]);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const activeChar = characters.find(c => c.id === selectedCharId);

  // Handle stats change in Play Mode
  const updateActiveCharStat = (key: 'stamina' | 'durability' | 'harmony' | 'harmonyMax' | 'notes', val: any) => {
    if (!activeChar) return;
    
    const updated = { ...activeChar, [key]: val };
    
    // Bounds checking
    if (key === 'stamina') {
      updated.stamina = Math.max(0, Math.min(20, val));
    } else if (key === 'durability') {
      updated.durability = Math.max(0, Math.min(activeChar.durabilityMax, val));
    } else if (key === 'harmony') {
      updated.harmony = Math.max(0, Math.min(updated.harmonyMax, val));
    }

    // Save
    if (activeChar.isCustom) {
      const customs = characters.filter(c => c.isCustom);
      const index = customs.findIndex(c => c.id === activeChar.id);
      if (index !== -1) {
        customs[index] = updated;
        saveCustomCharacters(customs);
      }
    } else {
      // For pre-gens, we save them as custom characters once mutated/played
      const customs = characters.filter(c => c.isCustom);
      const pregenInCustoms = customs.find(c => c.id === activeChar.id);
      if (pregenInCustoms) {
        const index = customs.findIndex(c => c.id === activeChar.id);
        customs[index] = updated;
        saveCustomCharacters(customs);
      } else {
        // Clone pregen as custom-saved state
        const cloned = { ...updated, id: `${activeChar.id}_session` };
        cloned.isCustom = true; // Mark as saved state
        const nextCustoms = [...customs, cloned];
        saveCustomCharacters(nextCustoms);
        setSelectedCharId(cloned.id);
      }
    }

    // Set updated character list
    setCharacters(prev => prev.map(c => c.id === selectedCharId || c.id === activeChar.id ? updated : c));
  };

  const updateActiveCharStyle = (styleKey: string, val: number) => {
    if (!activeChar) return;
    const updated = { 
      ...activeChar, 
      styleValues: { 
        ...activeChar.styleValues, 
        [styleKey]: val 
      } 
    };

    if (activeChar.isCustom) {
      const customs = characters.filter(c => c.isCustom);
      const index = customs.findIndex(c => c.id === activeChar.id);
      if (index !== -1) {
        customs[index] = updated;
        saveCustomCharacters(customs);
      }
    } else {
      const customs = characters.filter(c => c.isCustom);
      const cloned = { ...updated, id: `${activeChar.id}_session`, isCustom: true };
      saveCustomCharacters([...customs, cloned]);
      setSelectedCharId(cloned.id);
    }
    setCharacters(prev => prev.map(c => c.id === selectedCharId || c.id === activeChar.id ? updated : c));
    showNotification(`已更新 ${activeChar.name} 的风格：${styleKey === 'power' ? '力量' : styleKey === 'precision' ? '精准' : styleKey === 'swiftness' ? '迅捷' : '技巧'} 为 ${val} 级`, 'success');
  };

  const updateActiveCharSkill = (skillKey: string, val: number) => {
    if (!activeChar) return;
    const updated = { 
      ...activeChar, 
      skills: { 
        ...activeChar.skills, 
        [skillKey]: val 
      } 
    };

    if (activeChar.isCustom) {
      const customs = characters.filter(c => c.isCustom);
      const index = customs.findIndex(c => c.id === activeChar.id);
      if (index !== -1) {
        customs[index] = updated;
        saveCustomCharacters(customs);
      }
    } else {
      const customs = characters.filter(c => c.isCustom);
      const cloned = { ...updated, id: `${activeChar.id}_session`, isCustom: true };
      saveCustomCharacters([...customs, cloned]);
      setSelectedCharId(cloned.id);
    }
    setCharacters(prev => prev.map(c => c.id === selectedCharId || c.id === activeChar.id ? updated : c));
    showNotification(`已更新 ${activeChar.name} 的技能：${skillKey} 为 +${val}`, 'success');
  };

  // Delete custom character
  const deleteCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这个人物卡吗？此操作无法撤销。')) return;

    const customs = characters.filter(c => c.isCustom && c.id !== id);
    saveCustomCharacters(customs);
    showNotification('人物卡已删除', 'info');
    if (selectedCharId === id) {
      setSelectedCharId('');
    }
  };

  // JSON Import
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const charData = JSON.parse(event.target?.result as string);
        if (!charData.name || !charData.tool || !charData.specialty) {
          showNotification('无效的人物卡数据：缺少核心属性', 'error');
          return;
        }

        const newChar: Character = {
          ...charData,
          id: `custom_${Date.now()}`,
          isCustom: true
        };

        const customs = characters.filter(c => c.isCustom);
        saveCustomCharacters([...customs, newChar]);
        setSelectedCharId(newChar.id);
        setActiveTab('play');
        showNotification(`成功导入人物 ${newChar.name}!`, 'success');
      } catch (error) {
        showNotification('解析 JSON 文件失败', 'error');
      }
    };
    reader.readAsText(file);
  };

  // JSON Export
  const handleJsonExport = (char: Character) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(char, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${char.name}_${char.specialty}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('导出 JSON 成功', 'success');
  };

  // Export to PNG Image using html2canvas
  const exportToPng = async () => {
    if (!cardPrintRef.current) return;
    showNotification('正在生成高清人物卡图片，请稍候...', 'info');
    
    try {
      const canvas = await html2canvas(cardPrintRef.current, {
        useCORS: true,
        scale: 2, // High DPI
        backgroundColor: '#150a02', // dark amber backdrop
      });
      
      const imgData = canvas.toDataURL('image/png');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", imgData);
      downloadAnchor.setAttribute("download", `${activeChar?.name}_电子人物卡.png`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification('图片生成并导出成功！', 'success');
    } catch (e) {
      console.error(e);
      showNotification('生成图片失败', 'error');
    }
  };

  // Print friendly PDF/Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Wizard Tool selection changes to reset styles/adjectives
  useEffect(() => {
    setWizAdjectiveCurrent(wizTool.adjectives[0]);
    setWizAdjectiveAspiring(wizTool.adjectives[1] || wizTool.adjectives[0]);
    setWizSecondaryTech(wizTool.techniques.filter(t => t.type === 'optional')[0]);
  }, [wizTool]);

  // Handle Wizard Lineage selection changes to reset primary trait
  useEffect(() => {
    setWizTraitPrimary(wizLineage.traits[0]);
    setWizCompanionCustomName('');
    // Also default secondary trait from another lineage
    const otherLineages = LINEAGES.filter(l => l.name !== wizLineage.name);
    setWizTraitSecondary(otherLineages[0].traits[0]);
  }, [wizLineage]);

  // Handle wizard lists roll / randomize
  const getBoldLabel = (desc: string) => {
    const commaIdx = desc.indexOf('\uFF0C');
    const periodIdx = desc.indexOf('\u3002');
    const firstBreak = commaIdx === -1 ? periodIdx : (periodIdx === -1 ? commaIdx : Math.min(commaIdx, periodIdx));
    return firstBreak === -1 ? desc : desc.substring(0, firstBreak);
  };

  const rollBackgroundOption = (course: 'upbringing' | 'motivation' | 'ambition') => {
    const roll = Math.floor(Math.random() * 20);
    if (course === 'upbringing') {
      setWizUpbringingIndex(roll);
      setWizUpbringingMeal(getBoldLabel(UPBRINGINGS[roll].description));
      setWizUpbringingText(UPBRINGINGS[roll].description);
    } else if (course === 'motivation') {
      setWizMotivationIndex(roll);
      setWizMotivationMeal(getBoldLabel(MOTIVATIONS[roll].description));
      setWizMotivationText(MOTIVATIONS[roll].description);
    } else if (course === 'ambition') {
      setWizAmbitionIndex(roll);
      setWizAmbitionMeal(getBoldLabel(AMBITIONS[roll].description));
      setWizAmbitionText(AMBITIONS[roll].description);
    }
    showNotification('掷骰选取背景成功！', 'success');
  };

  // Build style points based on wizard selection
  const calculateWizStyles = () => {
    let power = 1, precision = 1, swiftness = 1, technique = 1;

    // Get primary/secondary style pairs based on tool
    if (wizTool.name === '大砍刀' || wizTool.name === '防护手套') {
      // Power / Precision
      if (wizStylesChoice === 'a') {
        power = 3; precision = 2;
      } else {
        power = 2; precision = 3;
      }
    } else if (wizTool.name === '平底锅') {
      // Power / Technique
      if (wizStylesChoice === 'a') {
        power = 3; technique = 2;
      } else {
        power = 2; technique = 3;
      }
    } else if (wizTool.name === '叉子') {
      // Precision / Swiftness
      if (wizStylesChoice === 'a') {
        precision = 3; swiftness = 2;
      } else {
        precision = 2; swiftness = 3;
      }
    } else if (wizTool.name === '喷火器') {
      // Precision / Technique
      if (wizStylesChoice === 'a') {
        precision = 3; technique = 2;
      } else {
        precision = 2; technique = 3;
      }
    } else if (wizTool.name === '钢绳') {
      // Swiftness / Technique
      if (wizStylesChoice === 'a') {
        swiftness = 3; technique = 2;
      } else {
        swiftness = 2; technique = 3;
      }
    }

    return { power, precision, swiftness, technique };
  };

  // Validate step transitions in Wizard
  const nextStep = () => {
    if (wizardStep === 1) {
      if (!wizName.trim()) {
        showNotification('请先输入荒野猎人的名字', 'error');
        return;
      }
    }
    if (wizardStep === 2) {
      if (!wizTraitPrimary || !wizTraitSecondary) {
        showNotification('请选择完你的两项初始特性', 'error');
        return;
      }
      if (wizTraitPrimary.name === wizTraitSecondary.name) {
        showNotification('初始特性和次要特性不能相同', 'error');
        return;
      }
    }
    setWizardStep(prev => Math.min(4, prev + 1));
  };

  // Create character on wizard completion
  const handleCreateCharacter = () => {
    // Skills checklist based on backgrounds
    const upbringingSkill = wizUpbringingIndex === -1 ? wizUpbringingCustomSkill : UPBRINGINGS[wizUpbringingIndex].skill;
    const motivationSkill = wizMotivationIndex === -1 ? wizMotivationCustomSkill : MOTIVATIONS[wizMotivationIndex].skill;
    const ambitionSkill = wizAmbitionIndex === -1 ? wizAmbitionCustomSkill : AMBITIONS[wizAmbitionIndex].skill;

    // Calculate skills (+1 for the three different background skills, +0 for rest)
    const skills: { [key: string]: number } = {
      '激励': 0, '发声': 0, '手艺': 0, '治愈': 0, '展示': 0, '抓取': 0,
      '储存': 0, '搜索': 0, '射击': 0, '打击': 0, '学习': 0, '穿越': 0
    };
    skills[upbringingSkill] = 1;
    skills[motivationSkill] = 1;
    skills[ambitionSkill] = 1;

    // Traits collection
    const signatureTech = wizTool.techniques.find(t => t.type === 'signature')?.name || '';
    const chosenTech = wizSecondaryTech?.name || '';
    const traitPrimary = wizTraitPrimary?.name || '';
    const traitSecondary = wizTraitSecondary?.name || '';

    const traitList = [signatureTech, chosenTech, traitPrimary, traitSecondary];

    // Compute max durability
    let durMax = 20;
    if (wizTool.name === '平底锅' && traitList.includes('钢铁之盾')) {
      durMax = 50;
    }

    const newChar: Character = {
      id: `custom_${Date.now()}`,
      isCustom: true,
      name: wizName,
      playerName: wizPlayerName,
      specialty: wizLineage.name,
      adjectives: [wizAdjectiveCurrent, wizAdjectiveAspiring],
      tool: wizTool.name,
      stylesChoice: wizStylesChoice,
      styleValues: calculateWizStyles(),
      skills,
      traits: traitList,
      techniques: [signatureTech, chosenTech],
      companion: {
        name: wizCompanionCustomName.trim() || wizLineage.companions[wizCompanionIndex].name,
        description: wizLineage.companions[wizCompanionIndex].description
      },
      backgroundMeals: {
        upbringing: {
          meal: wizUpbringingMeal || '家乡咸鱼饭',
          text: `${wizUpbringingText} (特产: ${wizUpbringingSpecialty || '大米'}, 香料: ${wizUpbringingSpice || '生姜'})`,
          skill: upbringingSkill
        },
        motivation: {
          meal: wizMotivationMeal || '秘制炖煮野兽肉',
          text: wizMotivationText,
          skill: motivationSkill
        },
        ambition: {
          meal: wizAmbitionMeal || '巨人之心',
          text: wizAmbitionText,
          skill: ambitionSkill
        }
      },
      bond: wizBond.trim() || '与某位同伴一同分享了美味的童年餐食，在此刻共同战斗。',
      durabilityMax: durMax,
      stamina: 20,
      durability: durMax,
      harmony: 3,
      harmonyMax: 3,
      states: {
        injured1: false,
        injured2: false,
        injured3: false,
        exposed: false,
        hidden: false,
        disharmony: false
      },
      statesActive: [],
      avatarType: wizAvatarType,
      avatarValue: wizAvatarValue,
      backgroundType: wizBackgroundType,
      backgroundValue: wizBackgroundValue
    };

    // Save
    const customs = characters.filter(c => c.isCustom);
    saveCustomCharacters([...customs, newChar]);

    // Select and navigate to interactive card
    setSelectedCharId(newChar.id);
    setActiveTab('play');
    showNotification(`恭喜你！荒野猎人 ${newChar.name} 已经创建成功！`, 'success');

    // Reset wizard variables
    setWizName('');
    setWizPlayerName('');
    setWizardStep(1);
  };

  // Background Image Upload Handler
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setWizBackgroundType('upload');
      setWizBackgroundValue(event.target?.result as string);
      showNotification('自定义背景图上传成功！', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Drawing Canvas Handlers (for background image)
  const openBackgroundDrawingModal = () => {
    setIsDrawingModalOpen(true);
    setTimeout(() => {
      initCanvas();
      // Load existing drawing onto canvas for re-editing
      if (wizBackgroundType === 'drawing' && wizBackgroundValue) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.scale(2, 2);
          ctx.strokeStyle = drawPenColor;
          ctx.lineWidth = drawPenSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          // Save initial state for undo
          saveHistoryState();
        };
        img.src = wizBackgroundValue;
      } else {
        initCanvas();
      }
    }, 100);
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawPenSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const applyPenStyle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawPenSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Also update the color/size for next stroke without affecting current canvas state
  };

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const hist = canvasHistoryRef.current;
    const idx = historyIndexRef.current;
    // Truncate any redo states beyond current position
    hist.length = idx + 1;
    hist.push(dataUrl);
    if (hist.length > 20) hist.shift();
    historyIndexRef.current = hist.length - 1;
  };

  const undoCanvas = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const hist = canvasHistoryRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !hist[historyIndexRef.current]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.strokeStyle = drawPenColor;
      ctx.lineWidth = drawPenSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    img.src = hist[historyIndexRef.current];
  };

  const redoCanvas = () => {
    const hist = canvasHistoryRef.current;
    if (historyIndexRef.current >= hist.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas || !hist[historyIndexRef.current]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.strokeStyle = drawPenColor;
      ctx.lineWidth = drawPenSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    img.src = hist[historyIndexRef.current];
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getTouchCanvasPos = (touch: React.Touch | Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    applyPenStyle();
    const pos = getCanvasPos(e);
    drawingStateRef.current.isDrawing = true;
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingStateRef.current.isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);

    ctx.beginPath();
    ctx.moveTo(drawingStateRef.current.lastX, drawingStateRef.current.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
  };

  const stopDrawing = () => {
    if (drawingStateRef.current.isDrawing) {
      drawingStateRef.current.isDrawing = false;
      saveHistoryState();
    }
  };

  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    applyPenStyle();
    const touch = e.touches[0];
    const pos = getTouchCanvasPos(touch);
    drawingStateRef.current.isDrawing = true;
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
    e.preventDefault();
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingStateRef.current.isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const touch = e.touches[0];
    const pos = getTouchCanvasPos(touch);

    ctx.beginPath();
    ctx.moveTo(drawingStateRef.current.lastX, drawingStateRef.current.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    drawingStateRef.current.lastX = pos.x;
    drawingStateRef.current.lastY = pos.y;
    e.preventDefault();
  };

  const stopTouchDrawing = () => {
    if (drawingStateRef.current.isDrawing) {
      drawingStateRef.current.isDrawing = false;
      saveHistoryState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawPenSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Reset history
    canvasHistoryRef.current = [];
    historyIndexRef.current = -1;
  };

  const saveBackgroundDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setWizBackgroundType('drawing');
    setWizBackgroundValue(dataUrl);
    setIsDrawingModalOpen(false);
    showNotification('手绘背景图保存成功！', 'success');
  };

  const uploadDrawingPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.scale(2, 2);
        ctx.strokeStyle = drawPenColor;
        ctx.lineWidth = drawPenSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        saveHistoryState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Dice Rolling Logic
  const handleRollDice = (styleName: string, styleCount: number, skillName: string, skillBonus: number, dieMode: 'focus' | 'wild') => {
    // Generate fresh d6 values
    const diceList = Array.from({ length: styleCount }, () => {
      const val = Math.floor(Math.random() * 6) + 1;
      return { value: val, active: false, adjustedValue: val };
    });

    const dieType = dieMode === 'focus' ? 'd8' : 'd20';
    const dieVal = Math.floor(Math.random() * (dieMode === 'focus' ? 8 : 20)) + 1;

    // Initially count successes on the unmodified d6s
    const successes = diceList.filter(d => d.value >= 5).length;

    setDiceRoll({
      styleName,
      skillName,
      styleCount,
      skillBonus,
      rolled: true,
      dice: diceList,
      successes,
      actionRating: successes > 0 ? dieVal : 0,
      actionDieType: dieType,
      actionDieValue: dieVal
    });
  };

  // Calculate dice successes after choosing which dice gets skill +1
  const toggleDiceActive = (index: number) => {
    if (!diceRoll) return;

    const currentBonusUsed = diceRoll.dice.filter(d => d.active).length;

    // Toggle active state
    const nextDice = diceRoll.dice.map((d, i) => {
      if (i === index) {
        // Can only activate if we have remaining skill bonuses, OR if we are turning it off
        const willBeActive = !d.active;
        if (willBeActive && currentBonusUsed >= diceRoll.skillBonus) {
          showNotification(`你的 [${diceRoll.skillName}] 技能等级只有 +${diceRoll.skillBonus}，无法应用更多加值。`, 'info');
          return d;
        }
        return {
          ...d,
          active: willBeActive,
          adjustedValue: willBeActive ? Math.min(6, d.value + 1) : d.value
        };
      }
      return d;
    });

    // Count successes (dice value >= 5 after adjustments)
    const successes = nextDice.filter(d => d.adjustedValue >= 5).length;

    setDiceRoll({
      ...diceRoll,
      dice: nextDice,
      successes,
      actionRating: successes > 0 ? diceRoll.actionDieValue : 0
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-center pb-6 mb-6 border-b-2 border-surface-border">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <span className="text-[#E07A2B]">{getInkIcon('屠夫', 40)}</span>
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
            onClick={() => { setActiveTab('roster'); setDiceRoll(null); }}
            className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${activeTab === 'roster' ? 'bg-wilder-blue border-wilder-amber text-white' : 'bg-surface border-orange-700 text-ink'}`}
          >
            <Users size={16} /> 猎人列表
          </button>
          <button 
            onClick={() => { setActiveTab('create'); setWizardStep(1); setDiceRoll(null); }}
            className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${activeTab === 'create' ? 'bg-wilder-blue border-wilder-amber text-white' : 'bg-surface border-orange-700 text-ink'}`}
          >
            <Plus size={16} /> 新建猎人
          </button>
        </div>
      </header>

      {/* NOTIFICATIONS */}
      {notification && (
        <div className="fixed top-4 left-4 z-[60] px-5 py-3 rounded-md shadow-rough border-l-3 text-sm flex items-center gap-2 bg-surface text-ink ${
          notification.type === 'success' ? 'border-l-wilder-amber' : 
          notification.type === 'error' ? 'border-l-wilder-blue' : 
          'border-l-surface-border'
        }">
          <span className="flex-shrink-0">{notification.type === 'success' ? '✨' : notification.type === 'error' ? '💥' : '🔍'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* MAIN LAYOUT - FULL WIDTH AND SPACIOUS */}
      <main className="max-w-4xl mx-auto w-full px-2 sm:px-4">
          
          {/* TAB 1: ROSTER & SELECTION */}
          {activeTab === 'roster' && (
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
                    onClick={() => { setSelectedCharId(char.id); setActiveTab('play'); }}
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
                  onClick={() => { setActiveTab('create'); setWizardStep(1); }}
                  className="border-3 border-dashed border-orange-700 p-6 rounded-md cursor-pointer transition-all hover:bg-surface flex flex-col items-center justify-center text-ink-muted"
                >
                  <Plus size={32} className="mb-2" />
                  <span className="font-bold">契约新猎人</span>
                  <span className="text-xs mt-1 text-wilder-amber">开始分步向导，定制属于你的荒野食客</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WIZARD CHARACTER CREATOR */}
          {activeTab === 'create' && (
            <div className="wood-panel p-6 rounded-lg text-ink">
              {/* Step bar indicator */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-border">
                <span className="font-serif font-bold text-xl text-ink">
                  创建荒野食客 ({wizardStep}/3 步)
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3].map(s => (
                    <div 
                      key={s} 
                      className={`h-2 w-10 rounded ${s <= wizardStep ? 'bg-wilder-blue' : 'bg-surface-border'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: TOOL & IDENTITY */}
              {wizardStep === 1 && (
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
                              <span>分配 (A): 3级高点，2级次高点</span>
                            </label>
                            <label className="flex items-center space-x-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                checked={wizStylesChoice === 'b'} 
                                onChange={() => setWizStylesChoice('b')} 
                                className="accent-wilder-teal" 
                              />
                              <span>分配 (B): 2级高点，3级次高点</span>
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

                  {/* Avatar Picker - emoji only */}
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
                      onClick={nextStep}
                      className="btn-sketch rounded px-6 py-2.5 bg-wilder-blue border-wilder-amber text-white flex items-center gap-1 font-serif font-bold text-md"
                    >
                      下一步：选择你的专长 (谱系) →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SPECIALTY & TRAITS */}
              {wizardStep === 2 && (
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

                      {/* Lineage traits selection */}
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

                      {/* General second trait selection */}
                      <div className="border-t border-surface-border pt-3 space-y-3">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                          <span className="block text-xs font-bold text-ink">初始特性二（杂学：可自选自大专长或附录A特性库）：</span>
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

                  {/* Companion choice */}
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
                      onClick={() => setWizardStep(1)}
                      className="btn-sketch rounded px-4 py-2 bg-surface border-wilder-amber text-ink"
                    >
                      ← 上一步
                    </button>
                    <button 
                      onClick={nextStep}
                      className="btn-sketch rounded px-6 py-2.5 bg-wilder-blue border-wilder-amber text-white flex items-center gap-1 font-serif font-bold text-md"
                    >
                      下一步：三道菜式背景设置 →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: BACKGROUND COURSES & CONFIRM */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold font-serif mb-1 text-wilder-blue">第三步：设定“三道菜式”背景故事</h3>
                    <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                      在选择了一项工具和专长后，请按照以下步骤，为自己打造一份“三道菜式”的背景。通过食物来构建你的角色故事，通过你的背景，你将获得初始技能。
                      <span className="text-wilder-blue font-bold block mt-1">💡 规则计算：每个背景对应的选择会给你提供一项唯一的 +1 初始技能加值，三种背景对应的初始技能必须各不相同！</span>
                    </p>

                    <div className="space-y-4">
                      {/* Course 1: Upbringing */}
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

                      {/* Course 2: Motivation */}
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

                      {/* Course 3: Ambition */}
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

                  {/* Bond input */}
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

                  {/* Background Image Picker */}
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

                  {/* Navigation and validate skill selection */}
                  <div className="flex justify-between pt-4">
                    <button 
                      onClick={() => setWizardStep(2)}
                      className="btn-sketch rounded px-4 py-2 bg-surface border-wilder-amber text-ink"
                    >
                      ← 上一步
                    </button>
                    
                    <button 
                      onClick={handleCreateCharacter}
                      className="btn-sketch rounded px-8 py-3 bg-wilder-blue border-wilder-amber text-white flex items-center gap-2 font-serif font-bold text-lg hover:shadow-rough"
                    >
                      刻入猎群契约（创建荒野食客）
                    </button>
                  </div>
                </div>
              )}

              {/* Drawing Canvas Modal - available across all wizard steps */}
              {isDrawingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4" onTouchMove={(e) => e.preventDefault()}>
                  <div className="bg-[#2d100c] border-3 border-wilder-blue rounded-xl p-3 sm:p-5 max-w-lg w-full shadow-rough-lg">
                    <h3 className="text-lg font-bold font-serif text-wilder-blue mb-1">✏️ 手绘背景插图</h3>
                    <p className="text-xs text-wilder-amber mb-3">在下方区域自由绘制你的角色背景插图</p>

                    {/* Color palette + Pen size row */}
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-wilder-amber mr-1">颜色</span>
                        {['#2d100c','#1a1a1a','#8b4513','#a0522d','#556b2f','#8b6c4c','#d2691e','#c56b4e'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setDrawPenColor(c)}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${drawPenColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-wilder-amber mr-1">粗细</span>
                        {[2, 4, 6, 10].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setDrawPenSize(s)}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${drawPenSize === s ? 'bg-wilder-blue text-white' : 'bg-surface-border text-ink-muted'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="drawing-grid rounded-lg overflow-hidden border-2 border-wilder-blue w-full h-[260px] sm:h-[320px]">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startTouchDrawing}
                        onTouchMove={drawTouch}
                        onTouchEnd={stopTouchDrawing}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={undoCanvas}
                          disabled={historyIndexRef.current <= 0}
                          className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded hover:bg-amber-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↩️ 撤销
                        </button>
                        <button
                          type="button"
                          onClick={redoCanvas}
                          disabled={historyIndexRef.current >= canvasHistoryRef.current.length - 1}
                          className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded hover:bg-amber-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↪️ 重做
                        </button>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded hover:bg-amber-900"
                        >
                          🗑️ 清除
                        </button>
                        <label className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-2 py-1 rounded cursor-pointer hover:bg-amber-900">
                          🖼️ 底图
                          <input type="file" accept="image/*" onChange={uploadDrawingPhoto} className="hidden" />
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsDrawingModalOpen(false)}
                          className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-3 py-1 rounded hover:bg-amber-900"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={saveBackgroundDrawing}
                          className="text-xs bg-wilder-blue border border-wilder-blue text-white px-3 py-1 rounded font-bold hover:bg-wilder-blue"
                        >
                          💾 保存背景图
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLAY MODE INTERACTIVE SHEET */}
          {activeTab === 'play' && activeChar && (
            <div className="space-y-6">
              


              {/* ACTION SHEET PREVIEW CARD */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-surface p-3 rounded border border-wilder-amber">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setActiveTab('roster')} 
                    className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs text-ink flex items-center gap-1 whitespace-nowrap"
                  >
                    <ArrowLeft size={14} /> 返回列表
                  </button>
                  <button 
                    onClick={() => handleJsonExport(activeChar)} 
                    className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs text-ink flex items-center gap-1 whitespace-nowrap"
                  >
                    <Download size={14} /> 导出 JSON
                  </button>
                  <button 
                    onClick={exportToPng} 
                    className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs text-ink flex items-center gap-1 whitespace-nowrap"
                  >
                    <Share2 size={14} /> 导出 PNG
                  </button>
                  <button 
                    onClick={handlePrint} 
                    className="btn-sketch rounded px-3 py-1.5 bg-surface-border border-orange-700 text-xs text-ink flex items-center gap-1 whitespace-nowrap"
                  >
                    <Printer size={14} /> 打印本卡
                  </button>
                </div>
              </div>

              {/* INTERACTIVE SHEET WRAPPED IN ORANGE DOTTED MAT BACKGROUND - RESPONSIVE 2-PAGE OPEN BOOK */}
              <div 
                ref={cardPrintRef}
                className="wilder-dot-bg p-2 sm:p-4 md:p-8 rounded-lg shadow-rough-lg border-3 border-surface-border flex flex-col gap-6 print:p-0 print:border-0 print:shadow-none"
              >
                
                {/* ==================== PAGE 1 OF THE CHARACTER SHEET ==================== */}
                <div className="bg-[#faf6ef] text-ink p-6 rounded border-2 border-surface-border shadow-rough space-y-6 relative overflow-hidden">
                  
                  {/* Decorative Header Border Line */}
                  <div className="flex justify-between items-center border-b-2 border-surface-border pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-ink">{getInkIcon('屠夫', 32)}</span>
                      <span className="font-serif font-black text-2xl tracking-wider text-sky-950">属性</span>
                      <span className="text-ink rotate-180">{getInkIcon('屠夫', 32)}</span>
                    </div>
                    <span className="text-xs font-serif font-bold text-ink-muted border border-stone-400 px-2 py-0.5 rounded bg-white/50">PAGE 1 / 2</span>
                  </div>

                  {/* Character Name / Player / Specialty Table */}
                  <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-surface-border divide-y-2 md:divide-y-0 md:divide-x-2 divide-stone-900 bg-white font-serif text-sm">
                    <div className="p-2">
                      <span className="block text-[10px] text-ink-light font-bold uppercase">角色名</span>
                      <span className="font-extrabold text-lg text-ink">{activeChar.name}</span>
                    </div>
                    <div className="p-2">
                      <span className="block text-[10px] text-ink-light font-bold uppercase">玩家名</span>
                      <span className="font-extrabold text-lg text-ink">{activeChar.playerName || activeChar.name}</span>
                    </div>
                    <div className="p-2 bg-amber-50">
                      <span className="block text-[10px] text-amber-700 font-bold uppercase">专长 (谱系)</span>
                      <span className="font-extrabold text-lg text-amber-900 flex items-center gap-1.5">
                        {getInkIcon(activeChar.specialty, 18, 'text-amber-800')}
                        {activeChar.specialty}
                      </span>
                    </div>
                  </div>

                  {/* MAIN GRID: STYLES (LEFT) & ALL 12 SKILLS (RIGHT) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left: Styles Column (Col Span 4) */}
                    <div className="lg:col-span-4 border-2 border-orange-500 rounded p-4 bg-orange-50/50 space-y-3">
                      {/* Decorative SVG Style Title Banner */}
                      <div className="flex items-center justify-center select-none mt-[-5px]">
                        <svg className="w-full h-8 max-w-[150px] text-wilder-amber" viewBox="0 0 160 30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 15l4-4 4 4-4 4zM24 15l3-3 3 3-3 3z" strokeWidth="1.5" />
                          <path d="M136 15l3-3 3 3-3 3zM148 15l4-4 4 4-4 4z" strokeWidth="1.5" />
                          <text x="80" y="19" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="serif" stroke="none" fill="currentColor">风 格</text>
                        </svg>
                      </div>
                      <p className="text-[9px] text-wilder-amber text-center leading-none mt-[-4px]">点击属性，在右侧骰池中快速装填风格骰</p>

                      <div className="space-y-2.5">
                        {[
                          { key: 'power', label: '力量', desc: '强大、坚韧、坚定或直率' },
                          { key: 'precision', label: '精准', desc: '冷静、条理、专注或准确' },
                          { key: 'swiftness', label: '迅捷', desc: '迅速、活力、警觉或灵巧' },
                          { key: 'technique', label: '技巧', desc: '巧妙、狡诈、技术性或精明' }
                        ].map(st => {
                          const val = activeChar.styleValues[st.key as keyof typeof activeChar.styleValues] || 1;
                          const isSelected = selectedRollStyle === st.label;
                          return (
                            <div 
                              key={st.key}
                              onClick={() => { setSelectedRollStyle(st.label); setIsDiceDrawerOpen(true); showNotification(`已选择风格骰：[${st.label}] (${val}d6)`, 'info'); }}
                              className={`border-2 border-surface-border rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-[#fc8419] text-white shadow-rough border-surface-border scale-[1.02]' 
                                  : 'bg-white hover:bg-orange-100 text-ink'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <span className="font-serif font-extrabold text-sm block truncate">{st.label}</span>
                                <span className={`text-[8px] block truncate ${isSelected ? 'text-wilder-amber' : 'text-ink-light'}`}>{st.desc}</span>
                              </div>
                              
                              {/* Sturdy Interactive Styles Adjuster */}
                              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => updateActiveCharStyle(st.key, Math.max(1, val - 1))}
                                  className="w-6 h-6 bg-surface-border hover:bg-surface-border border border-surface-border flex items-center justify-center font-bold text-ink rounded-sm text-xs"
                                  title="减少风格值"
                                >
                                  -
                                </button>
                                <div className="border border-surface-border px-3 py-1 bg-surface-border font-mono font-black text-sm text-ink rounded-sm min-w-[28px] text-center">
                                  {val}
                                </div>
                                <button 
                                  onClick={() => updateActiveCharStyle(st.key, Math.min(5, val + 1))}
                                  className="w-6 h-6 bg-surface-border hover:bg-surface-border border border-surface-border flex items-center justify-center font-bold text-ink rounded-sm text-xs"
                                  title="增加风格值"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Right: Skills Grid (Col Span 8) - ALWAYS SHOWING ALL 12 SKILLS */}
                    <div className="lg:col-span-8 border-2 border-sky-950 rounded p-4 bg-sky-50/20 space-y-3">
                      {/* Gorgeous SVG Skill Title Banner matching official card exactly */}
                      <div className="flex items-center justify-center select-none mt-[-5px]">
                        <svg className="w-full h-8 max-w-lg text-sky-950" viewBox="0 0 320 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {/* Fish outline on the left */}
                          <path d="M5 15c4-2.5 12-3.5 17-1.5c2.5.8 4 2.5 4 4.2s-1.5 3.3-4 4.2c-5 2-13 1-17-1.5l-2.5 3.5V11.5l2.5 3.5z" strokeWidth="1.5" />
                          <circle cx="18" cy="14" r="0.8" fill="currentColor" stroke="none" />
                          {/* Symmetrical ink parallel lines */}
                          <path d="M28 12h84M28 18h84" strokeWidth="1.5" />
                          <path d="M208 12h106M208 18h106" strokeWidth="1.5" />
                          <text x="160" y="19" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="serif" stroke="none" fill="currentColor">技  能</text>
                        </svg>
                      </div>
                      <p className="text-[9px] text-sky-800 text-center leading-none mt-[-4px]">点击对应技能，在右侧骰池中快速装填（使用小箭头直接修改属性增长）</p>

                      {/* 12-cell skill layout styled exactly like physical card, fully responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-2 border-surface-border bg-white text-xs font-serif shadow-sm">
                        {['激励', '展示', '射击', '发声', '抓取', '打击', '手艺', '储存', '学习', '治愈', '搜索', '穿越'].map((sk, index) => {
                          const val = activeChar.skills[sk] || 0;
                          const isSelected = selectedRollSkill === sk;
                          return (
                            <div 
                              key={sk}
                              onClick={() => { setSelectedRollSkill(sk); setIsDiceDrawerOpen(true); showNotification(`已选择技能：[${sk}] (+${val})`, 'info'); }}
                              className={`p-2 flex items-center justify-between cursor-pointer transition-all ${
                                index < 9 ? 'border-b-2 border-surface-border' : 'border-b-2 border-surface-border md:border-b-0'
                              } ${
                                index === 11 ? 'border-b-0' : ''
                              } ${
                                index % 3 !== 2 ? 'md:border-r-2 md:border-surface-border' : ''
                              } ${
                                isSelected ? 'bg-sky-50 font-extrabold text-sky-950' : 'hover:bg-surface-border text-ink'
                              }`}
                            >
                              <span className={val > 0 ? 'text-sky-900 font-extrabold' : 'text-ink'}>{sk}</span>
                              
                              {/* Skill value display */}
                              <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <div className="bg-surface-border border border-surface-border px-1.5 py-0.5 rounded-sm">
                                  <span className="font-bold text-[11px] text-sky-900">+{val}</span>
                                </div>
                                
                                {/* Small adjustable buttons */}
                                <div className="flex flex-col -space-y-0.5">
                                  <button 
                                    onClick={() => updateActiveCharSkill(sk, Math.min(3, val + 1))}
                                    className="w-3.5 h-3.5 bg-surface-border hover:bg-surface-border border border-stone-400 flex items-center justify-center text-[8px] text-ink rounded-sm font-bold"
                                    title="增加技能值"
                                  >
                                    ▲
                                  </button>
                                  <button 
                                    onClick={() => updateActiveCharSkill(sk, Math.max(0, val - 1))}
                                    className="w-3.5 h-3.5 bg-surface-border hover:bg-surface-border border border-stone-400 flex items-center justify-center text-[8px] text-ink rounded-sm font-bold"
                                    title="减少技能值"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM HALF OF PAGE 1: TOOL BOX & TRAITS BOX */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-surface-border">
                    
                    {/* Left: Tool and Techniques Box */}
                    <div className="border-3 border-surface-border bg-white rounded p-4 space-y-3 relative shadow-sm">
                      <div className="absolute top-1 right-2 flex space-x-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#fc8419]"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#fc8419]"></span>
                      </div>
                      
                      <h4 className="font-serif font-black text-md text-ink border-b-2 border-surface-border pb-1.5 flex items-center gap-1">
                        ❖ 工具与战技 ❖
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-surface-border p-2 border border-surface-border rounded">
                          <span className="block text-[9px] text-ink-light font-bold uppercase">装备工具</span>
                          <span className="font-bold text-ink text-sm">{activeChar.tool}</span>
                        </div>
                        <div className="bg-surface-border p-2 border border-surface-border rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="block text-[9px] text-ink-light font-bold uppercase">当前耐久</span>
                            <span className="block text-[9px] text-ink-light font-bold uppercase">最大耐久</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-ink text-sm">{activeChar.durability}</span>
                            <span className="font-bold text-ink text-sm">{activeChar.durabilityMax}</span>
                          </div>
                          <div className="flex justify-center space-x-2 mt-1">
                            <button 
                              onClick={() => updateActiveCharStat('durability', activeChar.durability - 1)}
                              className="px-2 py-0.5 bg-surface border border-orange-700 rounded font-bold hover:bg-orange-800 text-[10px]"
                            >-1</button>
                            <button 
                              onClick={() => updateActiveCharStat('durability', activeChar.durability + 1)}
                              className="px-2 py-0.5 bg-surface border border-orange-700 rounded font-bold hover:bg-orange-800 text-[10px]"
                            >+1</button>
                          </div>
                        </div>
                        <div className="col-span-2 bg-surface-border p-2 border border-surface-border rounded text-[11px]">
                          <span className="font-bold text-ink">射程: </span>
                          <span className="font-mono">1 (打击)</span> | 损坏时：射程:1(打击)。该身体部位造成伤害减半。
                        </div>
                      </div>

                      {/* Tool specific Techniques */}
                      <div className="pt-2 border-t border-surface-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="block text-[10px] font-bold text-ink-light uppercase">战技:</span>
                          <button
                            onClick={() => { setPickerModal('technique'); setPickerSearch(''); }}
                            className="text-[9px] bg-wilder-blue/10 text-wilder-blue border border-wilder-blue/30 px-1.5 py-0.5 rounded hover:bg-wilder-blue/20"
                          >
                            + 添加战技
                          </button>
                        </div>
                        {activeChar.techniques && activeChar.techniques.length > 0 ? (
                          activeChar.techniques.map(tName => {
                            const foundTech = TOOLS.flatMap(tl => tl.techniques).find(tk => tk.name === tName);
                            return (
                              <div key={tName} className="flex items-start justify-between group">
                                <div className="text-xs flex-1">
                                  <span className="font-bold text-ink">{tName}</span>
                                  <span className="text-[9px] bg-surface-border border border-surface-border px-1 rounded ml-1 text-ink-light">{foundTech?.cost || '被动'}</span>
                                  <p className="text-[10px] text-ink-muted leading-tight mt-0.5">{foundTech?.effect || tName}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    const updated = characters.map(c => c.id === activeChar.id ? { ...c, techniques: c.techniques.filter((t: string) => t !== tName) } : c);
                                    setCharacters(updated);
                                    saveCustomCharacters(updated.filter(c => c.isCustom));
                                  }}
                                  className="text-ink-light hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                                  title="移除战技"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[10px] text-ink-light italic">暂无战技</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Traits Box */}
                    <div className="border-3 border-emerald-800 bg-emerald-50/10 rounded p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-1.5">
                        <h4 className="font-serif font-black text-md text-emerald-950">
                          ❖ 特性 ❖
                        </h4>
                        <button
                          onClick={() => { setPickerModal('trait'); setPickerSearch(''); }}
                          className="text-[9px] bg-emerald-900/10 text-emerald-900 border border-emerald-900/30 px-1.5 py-0.5 rounded hover:bg-emerald-900/20"
                        >
                          + 添加特性
                        </button>
                      </div>

                      <div className="space-y-3 text-xs leading-tight">
                        {/* Base traits - always present, cannot be removed */}
                        <div className="border-b border-dashed border-emerald-300 pb-1.5 flex items-start justify-between">
                          <div>
                            <span className="font-extrabold text-emerald-900">毅力。</span>
                            <span className="text-[9px] bg-emerald-900 text-white px-1 rounded font-mono">1次成功</span>
                            <p className="text-[10px] text-ink mt-0.5">将 行动评级 [A] 增加 1。</p>
                          </div>
                        </div>
                        <div className="border-b border-dashed border-emerald-300 pb-1.5 flex items-start justify-between">
                          <div>
                            <span className="font-extrabold text-emerald-900">洞察。</span>
                            <span className="text-[9px] bg-emerald-900 text-white px-1 rounded font-mono">1次成功</span>
                            <p className="text-[10px] text-ink mt-0.5">确立一个关于当前情境的细节。</p>
                          </div>
                        </div>

                        {/* Lineage/appendix traits - removable */}
                        {activeChar.traits.slice(2).map((tName: string, idx: number) => {
                          let trEffect = '融入你自身的野性肉体异能与突变绝技。';
                          let trCost = '被动';
                          const foundA = APPENDIX_TRAITS.find(at => at.name === tName);
                          if (foundA) {
                            trEffect = foundA.effect;
                            trCost = foundA.cost;
                          } else {
                            const foundLineageTrait = LINEAGES.flatMap(l => l.traits).find(t => t.name === tName);
                            if (foundLineageTrait) {
                              trEffect = foundLineageTrait.effect;
                              trCost = foundLineageTrait.cost || '被动';
                            }
                          }
                          return (
                            <div key={tName} className="flex items-start justify-between group">
                              <div>
                                <span className="font-extrabold text-amber-900">{tName}。</span>
                                <span className="text-[9px] bg-amber-900 text-white px-1 rounded font-mono">{trCost}</span>
                                <p className="text-[10px] text-ink mt-0.5">{trEffect}</p>
                              </div>
                              <button
                                onClick={() => {
                                  const newTraits = [...activeChar.traits];
                                  newTraits.splice(idx + 2, 1);
                                  const updated = characters.map(c => c.id === activeChar.id ? { ...c, traits: newTraits } : c);
                                  setCharacters(updated);
                                  saveCustomCharacters(updated.filter(c => c.isCustom));
                                }}
                                className="text-ink-light hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                                title="移除特性"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* States Box - standalone, below traits */}
                  <div className="border-3 border-red-600 bg-red-50/10 rounded p-4 space-y-3 mt-6">
                    <div className="flex items-center justify-between border-b border-red-600 pb-1.5">
                      <h4 className="font-serif font-black text-xs text-red-700">⚠️ 状态</h4>
                      <button
                        onClick={() => { setIsStateModalOpen(true); setPendingState(''); setPendingStateLevel(1); }}
                        className="text-[9px] bg-wilder-blue/10 text-wilder-blue border border-wilder-blue/30 px-1.5 py-0.5 rounded hover:bg-wilder-blue/20"
                      >
                        + 添加状态
                      </button>
                    </div>
                    {activeChar.statesActive.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {activeChar.statesActive.map((st, i) => {
                            const found = APPENDIX_STATES.find(s => s.name.replace('X', '').trim() === st.name || s.name.startsWith(st.name));
                            return (
                              <div key={`${st.name}-${i}`} className="flex items-center bg-red-600/10 text-red-700 border border-red-600/30 rounded px-2.5 py-1 group">
                                <span className="font-bold text-xs font-serif">
                                  {st.name}{found?.name.includes('X') || found?.name.includes('至') ? st.level : ''}
                                </span>
                                <button
                                  onClick={() => {
                                    const newStates = activeChar.statesActive.filter((_, idx) => idx !== i);
                                    const updated = characters.map(c => c.id === activeChar.id ? { ...c, statesActive: newStates } : c);
                                    setCharacters(updated);
                                    saveCustomCharacters(updated.filter(c => c.isCustom));
                                  }}
                                  className="text-red-400 hover:text-red-700 text-xs ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="移除状态"
                                >×</button>
                              </div>
                            );
                          })}
                        </div>
                        {activeChar.statesActive.map(st => {
                          const found = APPENDIX_STATES.find(s => s.name.replace('X', '').trim() === st.name || s.name.startsWith(st.name));
                          if (!found) return null;
                          const effect = found.name.includes('X') ? found.effect.replace(/X/g, String(st.level)) : found.effect;
                          const isInjury = st.name === '受伤';
                          const displayEffect = isInjury
                            ? found.effect.split(/受伤\d[：:]/g).filter(Boolean)[st.level - 1] || found.effect
                            : effect;
                          const showEndCond = !isInjury && found.endCondition.length > 0;
                          const endCond = found.name.includes('X') ? found.endCondition.replace(/X/g, String(st.level)) : found.endCondition;
                          return (
                            <div key={`desc-${st.name}`} className="text-[9px] text-ink-muted leading-tight bg-surface/40 p-1.5 rounded border border-surface-border">
                              <span className="font-bold">{st.name}{found?.name.includes('X') || found?.name.includes('至') ? st.level : ''}：</span>{displayEffect}
                              {showEndCond && <><br /><span className="italic">结束条件：{endCond}</span></>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-ink-light italic">无活跃状态 (全部良好)</p>
                    )}
                  </div>

                  {/* Stamina Box - standalone, with +/- buttons */}
                  <div className="border-3 border-wilder-amber bg-white rounded p-4 relative shadow-sm mt-6">
                    <h4 className="font-serif font-black text-xs text-wilder-amber border-b border-wilder-amber pb-1 mb-3 flex items-center justify-between select-none">
                      <span>体力 ❤</span>
                    </h4>
                    <div className="grid grid-cols-2 text-center divide-x divide-surface-border mb-3">
                      <div>
                        <span className="text-[9px] text-ink-light block uppercase font-bold">当前</span>
                        <span className="text-2xl font-black font-serif text-ink">{activeChar.stamina}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ink-light block uppercase font-bold">最大</span>
                        <span className="text-2xl font-black font-serif text-ink">20</span>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button 
                        onClick={() => updateActiveCharStat('stamina', activeChar.stamina - 1)}
                        className="px-4 py-1.5 bg-surface-border border border-orange-700 rounded font-bold hover:bg-orange-800 text-sm"
                      >
                        -1
                      </button>
                      <button 
                        onClick={() => updateActiveCharStat('stamina', activeChar.stamina + 1)}
                        className="px-4 py-1.5 bg-surface-border border border-orange-700 rounded font-bold hover:bg-orange-800 text-sm"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>

                {/* ==================== PAGE 2 OF THE CHARACTER SHEET ==================== */}
                <div className="bg-[#faf6ef] text-ink p-6 rounded border-2 border-surface-border shadow-rough space-y-6 relative overflow-hidden">
                  
                  {/* Decorative Page 2 Header */}
                  <div className="flex justify-between items-center border-b-2 border-surface-border pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-ink">{getInkIcon('园丁', 32)}</span>
                      <span className="font-serif font-black text-2xl tracking-wider text-sky-950">背景</span>
                      <span className="text-ink rotate-180">{getInkIcon('园丁', 32)}</span>
                    </div>
                    <span className="text-xs font-serif font-bold text-ink-muted border border-stone-400 px-2 py-0.5 rounded bg-white/50">PAGE 2 / 2</span>
                  </div>

                  {/* Top half: Identity grid and Sketched portrait side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left details column (Col Span 7) */}
                    <div className="md:col-span-7 space-y-4">
                      {/* Identity boxes */}
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

                      {/* Local specialties & Spices */}
                      <div className="grid grid-cols-2 border-2 border-surface-border divide-x-2 divide-stone-900 bg-white text-xs">
                        <div className="p-3">
                          <span className="block text-[9px] text-ink-light font-bold uppercase mb-1">家乡特产 (Specialty)</span>
                          <span className="font-bold text-ink text-sm">
                            {activeChar.backgroundMeals.upbringing.meal.split('&')[0]?.trim() || '黑麦酸面包'}
                          </span>
                        </div>
                        <div className="p-3 bg-orange-50/20">
                          <span className="block text-[9px] text-wilder-amber font-bold uppercase mb-1">家乡香料 (Spice)</span>
                          <span className="font-bold text-ink text-sm">
                            {activeChar.backgroundMeals.upbringing.meal.split('&')[1]?.trim() || '方舟乌木胡椒'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Portrait/Background Column (Col Span 5) */}
                    <div className="md:col-span-5 border-2 border-surface-border rounded bg-white p-4 flex flex-col items-center justify-center min-h-[220px] shadow-sm relative">
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

                  {/* BOTTOM HALF OF PAGE 2: BACKGROUND STORIES & LOGS */}
                  <div className="border-t-2 border-surface-border pt-4 space-y-4">
                    <div className="flex items-center justify-center space-x-2 select-none">
                      <span className="text-wilder-amber font-serif font-black">~❖~</span>
                      <span className="font-serif font-black text-md text-ink tracking-wider">“三道菜式”的背景故事</span>
                      <span className="text-wilder-amber font-serif font-black">~❖~</span>
                    </div>

                    <div className="space-y-3">
                      {/* Row 1: Upbringing */}
                      <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
                        <div className="w-8 bg-[#1E4D8C] text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0">
                          <div>成</div>
                          <div className="mt-0.5">长</div>
                          <div className="mt-0.5">背</div>
                          <div className="mt-0.5">景</div>
                        </div>
                        <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
                          <p className="font-extrabold text-[#1E4D8C] text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center justify-between">
                            <span>哪一道餐食定义了你的童年？ (童年餐食: {activeChar.backgroundMeals.upbringing.meal})</span>
                            <span className="font-mono text-[9px] bg-[#1E4D8C]/10 text-[#1E4D8C] px-1 rounded font-bold">+1 {activeChar.backgroundMeals.upbringing.skill}</span>
                          </p>
                          <p className="text-ink leading-relaxed font-serif">{highlightKeywords(activeChar.backgroundMeals.upbringing.text)}</p>
                        </div>
                      </div>

                      {/* Row 2: Motivation */}
                      <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
                        <div className="w-8 bg-stone-700 text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0">
                          <div>动</div>
                          <div className="mt-0.5">机</div>
                        </div>
                        <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
                          <p className="font-extrabold text-stone-700 text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center justify-between">
                            <span>哪一道餐食让你成为了一名荒野食客？ (动机餐食: {activeChar.backgroundMeals.motivation.meal})</span>
                            <span className="font-mono text-[9px] bg-stone-100 text-stone-700 px-1 rounded font-bold">+1 {activeChar.backgroundMeals.motivation.skill}</span>
                          </p>
                          <p className="text-ink leading-relaxed font-serif">{highlightKeywords(activeChar.backgroundMeals.motivation.text)}</p>
                        </div>
                      </div>

                      {/* Row 3: Ambition */}
                      <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
                        <div className="w-8 bg-[#E07A2C] text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0">
                          <div>雄</div>
                          <div className="mt-0.5">心</div>
                        </div>
                        <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
                          <p className="font-extrabold text-[#E07A2C] text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center justify-between">
                            <span>你最想吃哪一道餐食？ (雄心餐食: {activeChar.backgroundMeals.ambition.meal})</span>
                            <span className="font-mono text-[9px] bg-[#E07A2C]/10 text-[#E07A2C] px-1 rounded font-bold">+1 {activeChar.backgroundMeals.ambition.skill}</span>
                          </p>
                          <p className="text-ink leading-relaxed font-serif">{highlightKeywords(activeChar.backgroundMeals.ambition.text)}</p>
                        </div>
                      </div>

                      {/* Row 4: Connection Bond */}
                      <div className="flex rounded-lg overflow-hidden border-2 border-surface-border shadow-sm">
                        <div className="w-8 bg-red-800 text-white flex flex-col items-center justify-center font-serif font-black text-[11px] py-4 select-none shrink-0">
                          <div>联</div>
                          <div className="mt-0.5">结</div>
                        </div>
                        <div className="flex-1 bg-white p-3 text-xs leading-relaxed text-ink space-y-1">
                          <p className="font-extrabold text-red-800 text-[10px] border-b border-surface-border/40 pb-0.5 mb-1.5 flex items-center gap-1">
                            <span>🤝 盟约羁绊 (Bonds)</span>
                          </p>
                          <p className="text-ink leading-relaxed font-serif italic">"{activeChar.bond}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes log */}
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
              </div>
            </div>
          )}

        {/* Technique / Trait Picker Modal */}
        {pickerModal !== 'none' && activeChar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onTouchMove={(e) => e.preventDefault()}>
            <div className="bg-surface border-3 border-wilder-blue rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-rough-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-serif font-bold text-wilder-blue text-base">
                  {pickerModal === 'technique' ? '选择战技' : '选择特性'}
                </h3>
                <button onClick={() => setPickerModal('none')} className="text-ink-muted hover:text-ink text-lg leading-none">&times;</button>
              </div>

              {/* Search filter for techniques */}
              {pickerModal === 'technique' && (
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder={`搜索${activeChar?.tool || ''}战技或通用战技...`}
                  className="text-xs bg-surface-well border border-surface-border rounded px-2 py-1.5 text-ink w-full mb-3"
                />
              )}
              {pickerModal === 'trait' && (
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="搜索特性名称..."
                  className="text-xs bg-surface-well border border-surface-border rounded px-2 py-1.5 text-ink w-full mb-3"
                />
              )}

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 border-t border-surface-border pt-3">
                {pickerModal === 'technique' && (
                  <>
                    {APPENDIX_TECHNIQUES.filter(t => {
                      if (!activeChar) return false;
                      // Only show techniques for the current tool or general techniques that include this tool
                      const toolName = activeChar.tool;
                      const isToolSpecific = t.weapon === toolName;
                      const isGeneral = t.weapon.includes('/') && t.weapon.includes(toolName);
                      if (!isToolSpecific && !isGeneral) return false;
                      if (pickerSearch && !t.name.includes(pickerSearch) && !t.effect.includes(pickerSearch)) return false;
                      return true;
                    }).map(t => (
                      <div
                        key={t.name}
                        onClick={() => {
                          if (!activeChar || activeChar.techniques.includes(t.name)) {
                            showNotification('该战技已存在', 'info');
                          } else {
                            const updated = characters.map(c => c.id === activeChar.id ? { ...c, techniques: [...c.techniques, t.name] } : c);
                            setCharacters(updated);
                            saveCustomCharacters(updated.filter(c => c.isCustom));
                            showNotification(`已添加战技：${t.name}`, 'success');
                          }
                          setPickerModal('none');
                        }}
                        className="p-2 rounded cursor-pointer hover:bg-wilder-blue/10 border border-surface-border text-xs flex items-start justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-ink">{t.name}</span>
                          <span className="text-[9px] text-ink-light ml-1">[{t.weapon.includes('/') ? `通用 (${t.weapon})` : t.weapon}]</span>
                          <span className="text-[9px] bg-surface-border px-1 rounded ml-1 text-ink-light">{t.cost}</span>
                          <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-2">{t.effect}</p>
                        </div>
                        <span className="text-wilder-blue text-xs ml-2 flex-shrink-0">
                          {activeChar && activeChar.techniques.includes(t.name) ? '✓' : '+'}
                        </span>
                      </div>
                    ))}
                  </>
                )}
                {pickerModal === 'trait' && (
                  <>
                    {/* Lineage traits */}
                    {LINEAGES.flatMap(l => l.traits).concat(APPENDIX_TRAITS.map(t => ({ name: t.name, cost: t.cost, effect: t.effect })))
                      .filter(t => {
                        if (!activeChar) return false;
                        if (activeChar.traits.slice(2).includes(t.name) || t.name === '毅力' || t.name === '洞察') return false;
                        if (pickerSearch && !t.name.includes(pickerSearch) && !t.effect.includes(pickerSearch)) return false;
                        return true;
                      })
                      .map(t => (
                        <div
                          key={t.name}
                          onClick={() => {
                            if (!activeChar) return;
                            const newTraits = [...activeChar.traits, t.name];
                            const updated = characters.map(c => c.id === activeChar.id ? { ...c, traits: newTraits } : c);
                            setCharacters(updated);
                            saveCustomCharacters(updated.filter(c => c.isCustom));
                            showNotification(`已添加特性：${t.name}`, 'success');
                            setPickerModal('none');
                          }}
                          className="p-2 rounded cursor-pointer hover:bg-emerald-50 border border-surface-border text-xs"
                        >
                          <span className="font-bold text-emerald-900">{t.name}</span>
                          <span className="text-[9px] bg-amber-900 text-white px-1 rounded ml-1">{t.cost || '被动'}</span>
                          <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-2">{t.effect}</p>
                        </div>
                    ))}
                  </>
                )}
              </div>

              <div className="flex justify-end mt-3 pt-3 border-t border-surface-border">
                <button onClick={() => setPickerModal('none')} className="text-xs bg-surface border border-surface-border text-ink px-3 py-1.5 rounded hover:bg-surface-border">
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop Overlay */}
        {(isDiceDrawerOpen || isManualDrawerOpen) && (
          <div 
            onClick={() => { setIsDiceDrawerOpen(false); setIsManualDrawerOpen(false); }}
            className="fixed inset-0 bg-stone-950/60 z-30 transition-opacity animate-fade-in print:hidden"
          />
        )}

        {/* Floating Button Bar */}
        {(activeTab === 'roster' || (activeChar && activeTab === 'play')) && (
          <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 print:hidden">
            {activeChar && activeTab === 'play' && (
              /* Dice Roller Toggle Button */
              <button
                onClick={() => { setIsDiceDrawerOpen(!isDiceDrawerOpen); setIsManualDrawerOpen(false); }}
                className="w-14 h-14 bg-wilder-blue border-3 border-surface-border hover:bg-wilder-blue rounded-full flex flex-col items-center justify-center text-white shadow-rough-md transition-all active:translate-x-0.5 active:translate-y-0.5 group relative"
              >
                <Dice5 size={22} className="group-hover:rotate-45 transition-transform" />
                <span className="text-[9px] font-bold mt-0.5 select-none">进行检定</span>
                <span className="absolute right-16 bg-surface-dark text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-surface-border">
                  打开掷骰检定面板
                </span>
              </button>
            )}

            {/* Manual Toggle Button */}
            <button
              onClick={() => { setIsManualDrawerOpen(!isManualDrawerOpen); setIsDiceDrawerOpen(false); }}
              className="w-14 h-14 bg-orange-700 border-3 border-surface-border hover:bg-orange-600 rounded-full flex flex-col items-center justify-center text-white shadow-rough-md transition-all active:translate-x-0.5 active:translate-y-0.5 group relative"
            >
              <BookIcon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold mt-0.5 select-none">参考手册</span>
              <span className="absolute right-16 bg-surface-dark text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-surface-border">
                打开附录规则手册
              </span>
            </button>
          </div>
        )}

        {/* State Picker Modal */}
        {isStateModalOpen && activeChar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onTouchMove={(e) => e.preventDefault()}>
            <div className="bg-surface border-3 border-wilder-blue rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-rough-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-serif font-bold text-wilder-blue text-base">添加状态</h3>
                <button onClick={() => setIsStateModalOpen(false)} className="text-ink-muted hover:text-ink text-lg leading-none">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {APPENDIX_STATES.filter(s => !appendixSearchQuery || s.name.includes(appendixSearchQuery) || s.effect.includes(appendixSearchQuery)).map(s => {
                  const isX = s.name.includes('X');
                  const rangeMatch = s.name.match(/(\d+)至(\d+)/);
                  const hasRange = !!rangeMatch;
                  const minLevel = hasRange ? parseInt(rangeMatch![1]) : 1;
                  const maxLevel = hasRange ? parseInt(rangeMatch![2]) : 20;
                  const displayName = s.name.replace(/ X$/, '').replace(/ \d+至\d+$/, '');
                  const baseName = s.name.includes('至') ? s.name.replace(/ \d+至\d+$/, '') : s.name.replace(/ X$/, '').trim();
                  const isSelected = pendingState === baseName;
                  return (
                    <div key={s.name} className="p-2 rounded border border-surface-border text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">{displayName}</span>
                        <div className="flex items-center space-x-2">
                          {(isX || hasRange) && (
                            <input
                              type="number"
                              min={minLevel}
                              max={maxLevel}
                              value={isSelected ? pendingStateLevel : minLevel}
                              onChange={(e) => {
                                setPendingState(baseName);
                                setPendingStateLevel(Math.max(minLevel, Math.min(maxLevel, parseInt(e.target.value) || minLevel)));
                              }}
                              onClick={() => setPendingState(baseName)}
                              className="w-12 text-center text-[10px] bg-surface-well border border-surface-border rounded px-1 py-0.5 text-ink"
                              placeholder="等级"
                            />
                          )}
                          <button
                            onClick={() => {
                              const level = (isX || hasRange) ? (isSelected && pendingState === baseName ? pendingStateLevel : minLevel) : 1;
                              const existing = activeChar.statesActive.find(st => st.name === baseName);
                              const newStates = existing
                                ? activeChar.statesActive.map(st => st.name === baseName ? { ...st, level: st.level + level } : st)
                                : [...activeChar.statesActive, { name: baseName, level }];
                              const updated = characters.map(c => c.id === activeChar.id ? { ...c, statesActive: newStates } : c);
                              setCharacters(updated);
                              saveCustomCharacters(updated.filter(c => c.isCustom));
                              showNotification(`已添加状态：${baseName}`, 'success');
                              setIsStateModalOpen(false);
                              setPendingState('');
                              setPendingStateLevel(1);
                            }}
                            className="text-[10px] bg-wilder-blue/10 text-wilder-blue border border-wilder-blue/30 px-2 py-0.5 rounded hover:bg-wilder-blue/20 flex-shrink-0"
                          >
                            + 添加
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-ink-muted mt-1">{s.effect}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Slide-out Dice Roller Drawer */}
      {activeChar && (
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface border-l-3 border-surface-border p-6 shadow-rough-lg overflow-y-auto z-40 transition-transform duration-300 transform print:hidden ${
          isDiceDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex justify-between items-center border-b border-surface-border pb-3 mb-4">
            <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-1.5">
              <Dice5 className="text-wilder-amber" /> 荒野掷骰检定
            </h3>
            <button 
              onClick={() => setIsDiceDrawerOpen(false)}
              className="text-ink-muted hover:text-ink font-bold text-lg border border-surface-border rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed mb-4">
            你可以<b>任意组合</b> 1 种风格和 1 种技能。在下方配置并进行投掷！
          </p>

          {(() => {
            const styleKeyMap: { [key: string]: 'power' | 'precision' | 'swiftness' | 'technique' } = { 
              '力量': 'power', 
              '精准': 'precision', 
              '迅捷': 'swiftness', 
              '技巧': 'technique' 
            };
            const currentStyleKey = styleKeyMap[selectedRollStyle] || 'power';
            const styleDiceCount = actionDieMode === 'wild' ? Math.max(1, (activeChar.styleValues[currentStyleKey] || 1) - 1) : (activeChar.styleValues[currentStyleKey] || 1);
            const currentSkillVal = activeChar.skills[selectedRollSkill] || 0;

            return (
              <div className="space-y-4 bg-surface-border/40 p-4 rounded border border-surface-border text-xs">
                {/* Style selection */}
                <div>
                  <label className="block text-[10px] text-ink-muted font-bold mb-1.5 uppercase">1. 选择行动风格 ( d6 风格骰 ):</label>
                  <div className="grid grid-cols-4 gap-1">
                    {['力量', '精准', '迅捷', '技巧'].map(st => {
                      const styleVal = activeChar.styleValues[styleKeyMap[st] || 'power'] || 1;
                      const isSelected = selectedRollStyle === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedRollStyle(st)}
                          className={`py-1.5 rounded text-center border font-bold transition-all text-[11px] ${
                            isSelected 
                              ? 'bg-wilder-blue border-wilder-amber text-white font-extrabold shadow scale-105' 
                              : 'bg-surface-well border-surface-border text-ink-muted hover:border-orange-855'
                          }`}
                        >
                          <div>{st}</div>
                          <div className="text-[9px] font-mono opacity-80">{styleVal}d6</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skill selection */}
                <div>
                  <label className="block text-[10px] text-ink-muted font-bold mb-1.5 uppercase">2. 选择配套技能 ( +1 等级加成 ):</label>
                  <select
                    value={selectedRollSkill}
                    onChange={(e) => setSelectedRollSkill(e.target.value)}
                    className="w-full bg-surface-well border-2 border-surface-border text-ink rounded px-2.5 py-2 text-xs focus:outline-none focus:border-wilder-blue"
                  >
                    {['激励', '发声', '手艺', '治愈', '展示', '抓取', '储存', '搜索', '射击', '打击', '学习', '穿越'].map(sk => {
                      const skillVal = activeChar.skills[sk] || 0;
                      return (
                        <option key={sk} value={sk}>
                          {sk} ( 加值: +{skillVal} )
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Action Die selection */}
                <div>
                  <label className="block text-[10px] text-ink-muted font-bold mb-1.5 uppercase">3. 选择行动骰与心境 (Action Die & Mindset):</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => { setActionDieMode('focus'); showNotification('心境已设为：集中精神 (d8)', 'success'); }}
                      className={`p-2 rounded text-left border transition-all ${
                        actionDieMode === 'focus'
                          ? 'bg-wilder-blue border-wilder-blue text-white font-extrabold shadow scale-102'
                          : 'bg-surface-well border-surface-border text-wilder-amber hover:border-orange-850'
                      }`}
                    >
                      <div className="font-bold font-serif text-xs">集中精神 (Focus)</div>
                      <p className="text-[9px] text-ink-light leading-snug mt-0.5">使用 1d8 行动骰。获得稳定、可靠、安全的判定效果。</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActionDieMode('wild'); showNotification('心境已设为：释放野性 (d20, 风格骰-1)', 'success'); }}
                      className={`p-2 rounded text-left border transition-all ${
                        actionDieMode === 'wild'
                          ? 'bg-red-950 border-red-500 text-white font-extrabold shadow scale-102'
                          : 'bg-surface-well border-surface-border text-wilder-amber hover:border-orange-850'
                      }`}
                    >
                      <div className="font-bold font-serif text-xs text-red-400">释放野性 (Go Wild)</div>
                      <p className="text-[9px] text-ink-light leading-snug mt-0.5">使用 1d20 行动骰。风格骰 d6 数量将扣减 1（代表丧失理智）。</p>
                    </button>
                  </div>
                </div>

                {/* Confirm combination message */}
                <div className="border-t border-surface-border pt-3 text-center">
                  <div className="text-ink font-serif text-sm font-bold">
                    当前备战：<span className="text-wilder-blue font-black">{selectedRollStyle}</span> + <span className="text-yellow-500 font-black">{selectedRollSkill}</span>
                  </div>
                  <div className="text-[10px] text-wilder-amber mt-1">
                    投掷：{styleDiceCount}d6 (风格) + {actionDieMode === 'focus' ? '1d8' : '1d20'} (行动) • +{currentSkillVal} 技能加值
                  </div>
                  
                  <button
                    onClick={() => handleRollDice(selectedRollStyle, styleDiceCount, selectedRollSkill, currentSkillVal, actionDieMode)}
                    className="w-full btn-sketch rounded mt-3 py-2.5 bg-wilder-blue border-wilder-amber text-white font-serif font-black text-sm flex items-center justify-center gap-1.5"
                  >
                    进行掷骰检定
                  </button>
                </div>
              </div>
            );
          })()}

          {/* RESULTS RENDERING */}
          {diceRoll && (
            <div className="mt-4 space-y-4 pt-4 border-t border-surface-border">
              <div className="space-y-2">
                <span className="block text-xs font-bold text-ink-muted">
                  投掷结果（点击骰子应用技能 +1 加成，最多可点 {diceRoll.skillBonus} 个）：
                </span>

                <div className="flex flex-wrap gap-2.5 justify-center py-2 items-center">
                  {/* Style D6 Dice */}
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {diceRoll.dice.map((d, index) => (
                      <div 
                        key={index}
                        onClick={() => toggleDiceActive(index)}
                        className={`w-11 h-11 border-3 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                          d.adjustedValue >= 5 
                            ? 'bg-wilder-blue border-wilder-amber text-white shadow-md scale-105' 
                            : 'bg-surface-well border-surface-border text-ink-light'
                        }`}
                        title="点击应用或撤销技能 +1 修正"
                      >
                        <span className="text-lg font-extrabold font-serif">{d.adjustedValue}</span>
                        {d.active && <span className="text-[8px] bg-yellow-500 text-amber-950 font-bold px-1 rounded scale-75 mt-[-3px]">+1</span>}
                      </div>
                    ))}
                  </div>

                  {/* Divider spacer */}
                  <span className="text-ink-muted font-bold mx-1">＋</span>

                  {/* Action Die Box */}
                  <div className={`p-1.5 border-3 rounded-lg flex flex-col items-center justify-center text-center shadow-md min-w-[70px] ${
                    diceRoll.actionDieType === 'd8'
                      ? 'bg-amber-900/40 border-amber-500 text-amber-100'
                      : 'bg-red-950/40 border-red-500 text-red-200'
                  }`}>
                    <span className="text-[8px] font-bold uppercase tracking-wider block leading-none">行动骰 {diceRoll.actionDieType}</span>
                    <span className="text-xl font-serif font-black block mt-0.5">{diceRoll.actionDieValue}</span>
                  </div>
                </div>
              </div>

              {/* Score results card */}
              <div className="bg-surface-well p-4 rounded-lg border border-surface-border text-center space-y-2 shadow-inner text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border-r border-surface-border">
                    <span className="text-[10px] text-wilder-amber block uppercase font-bold">成功次数</span>
                    <span className="text-3xl font-black font-serif text-wilder-blue">
                      {diceRoll.successes}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-wilder-amber block uppercase font-bold">行动评级 [A]</span>
                    <span className="text-3xl font-black font-serif text-yellow-500">
                      {diceRoll.actionRating}
                    </span>
                  </div>
                </div>

                <div className="text-xs pt-2 border-t border-surface-border leading-tight">
                  {diceRoll.successes > 0 ? (
                    <span className="text-wilder-amber font-bold">
                      检定成功！最高骰为 [A]={diceRoll.actionRating}，造成对应的结算效果！
                    </span>
                  ) : (
                    <span className="text-wilder-blue font-bold">
                      检定失败！未掷出5点以上的成功值。你可以配合技能修正是达到成功。
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-out Reference Manual Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-surface border-l-3 border-surface-border p-6 shadow-rough-lg overflow-y-auto z-40 transition-transform duration-300 transform print:hidden ${
        isManualDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
          <div className="flex justify-between items-center border-b border-surface-border pb-3 mb-4">
            <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-1.5">
              <BookIcon size={18} className="text-wilder-amber" /> 附录参考手册
            </h3>
            <button 
              onClick={() => setIsManualDrawerOpen(false)}
              className="text-wilder-amber hover:text-white font-bold text-lg border border-wilder-amber rounded-full w-6 h-6 flex items-center justify-center bg-stone-950/30"
            >
              ×
            </button>
          </div>

          {/* Tab Selection buttons */}
          <div className="grid grid-cols-5 gap-1">
            {[
              { key: 'd', label: 'D：速查' },
              { key: 'a', label: 'A.1：特性' },
              { key: 'e', label: 'A.2 区域' },
              { key: 'b', label: 'B：战技' },
              { key: 'c', label: 'C：状态' }
            ].map(tb => (
              <button
                key={tb.key}
                type="button"
                onClick={() => { setActiveAppendixTab(tb.key as any); setAppendixSearchQuery(''); }}
                className={`py-1.5 text-center text-xs font-bold transition-all border rounded ${
                  activeAppendixTab === tb.key 
                    ? 'bg-wilder-blue border-wilder-amber text-white shadow' 
                    : 'bg-surface border-wilder-amber text-ink-muted hover:bg-surface-well'
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {/* Search Input bar */}
          <div className="flex items-center bg-surface-well border border-surface-border rounded px-2.5 py-1.5 mt-3">
            <Search size={14} className="text-wilder-amber mr-2" />
            <input 
              type="text"
              value={appendixSearchQuery}
              onChange={(e) => setAppendixSearchQuery(e.target.value)}
              placeholder="搜索当前手册内容..."
              className="bg-transparent focus:outline-none text-xs text-ink placeholder:text-wilder-amber w-full"
            />
          </div>

          {/* If tab B (techniques) is chosen, show weapon filter buttons */}
          {activeAppendixTab === 'b' && (
            <div className="flex flex-wrap gap-1 pt-1.5">
              {['all', '大砍刀', '防护手套', '平底锅', '叉子', '喷火器', '钢绳', '通用'].map(wp => (
                <button
                  key={wp}
                  type="button"
                  onClick={() => setAppendixFilterWeapon(wp)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all border ${
                    appendixFilterWeapon === wp 
                      ? 'bg-wilder-blue border-wilder-blue text-white font-bold' 
                      : 'bg-surface-well border-surface-border text-ink-muted'
                  }`}
                >
                  {wp === 'all' ? '全部' : wp === '通用' ? '通用' : wp}
                </button>
              ))}
            </div>
          )}

          {/* Interactive Lists */}
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto space-y-3 pr-1 text-xs mt-4">
            
            {/* Appendix A.1: Traits */}
            {activeAppendixTab === 'a' && (
              <div className="space-y-3">
                <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5">
                  <span className="text-wilder-orange text-xl">🌶️</span>
                  <span className="font-serif font-black text-lg text-wilder-blue">附录A.1：特性</span>
                </div>
                <div className="text-[10px] bg-surface-well px-2 py-1 text-ink-muted font-bold border-l-2 border-wilder-blue mb-2">
                  默认特性（所有人自动获得毅力与洞察）及在狩猎、盛宴、突变中获得的特性。
                </div>
                {APPENDIX_TRAITS.filter(tr => 
                  tr.name.includes(appendixSearchQuery) || 
                  tr.effect.includes(appendixSearchQuery)
                ).map(tr => (
                  <div key={tr.name} className="bg-surface border border-surface-border p-2.5 rounded hover:border-wilder-amber shadow-sm">
                    <div className="flex justify-between items-center font-bold text-ink">
                      <span className="font-serif text-sm">{tr.name}</span>
                      <span className="text-[9px] bg-surface-well text-wilder-amber border border-surface-border px-1.5 py-0.5 rounded font-mono">{tr.cost}</span>
                    </div>
                    <p className="text-ink-muted text-[11px] mt-1.5 leading-relaxed font-serif">{highlightKeywords(tr.effect)}</p>
                    
                    {/* Add specific official callouts for major traits */}
                    {tr.name === '保护色' && (
                      <div className="border border-wilder-amber/60 bg-surface-well/50 p-2.5 rounded-lg text-[9px] text-ink-muted italic text-center mt-2 leading-relaxed">
                        拥有<span className="font-bold text-wilder-teal">保护色</span>的生物通常通过鲜艳的颜色来警告潜在的捕食者，它们不值得被捕食。
                        <br />此<span className="font-bold text-wilder-teal">特性</span>也可以用来代表所拟态或惊吓展示，而无需改变其机制。
                      </div>
                    )}
                    {tr.name === '感知电流' && (
                      <div className="border border-wilder-amber/60 bg-surface-well/50 p-2.5 rounded-lg text-[9px] text-ink-muted italic text-center mt-2 leading-relaxed">
                        拥有<span className="font-bold text-wilder-teal">感知电流</span>特性的生物能感应到电流，尤其是其他动物产生的电流。
                        <br />此<span className="font-bold text-wilder-teal">特性</span>也可以用来代表其他非传统的感官，例如探测红外线或地脉的能力，而无需改变其机制。
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Appendix B: Techniques */}
            {activeAppendixTab === 'b' && (
              <div className="space-y-3">
                <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5">
                  <span className="text-wilder-orange text-xl">⚔️</span>
                  <span className="font-serif font-black text-lg text-wilder-blue">附录B：战技</span>
                </div>
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
                        <div className={`w-14 ${rankColor} text-white flex flex-col items-center justify-center font-serif font-black text-xs text-center p-1.5 shrink-0 select-none`}>
                          <div>{tk.rank[0]}</div>
                          <div className="mt-0.5">{tk.rank[1]}</div>
                        </div>
                        <div className="flex-1 bg-surface-well p-3 text-[11px] leading-relaxed text-ink space-y-1">
                          <div className="flex justify-between items-center font-bold text-ink">
                            <span className="font-serif text-sm">{tk.name}</span>
                            <span className="text-[9px] bg-surface border border-surface-border text-wilder-amber px-1.5 py-0.5 rounded font-mono">{tk.cost}</span>
                          </div>
                          <div className="flex space-x-2 text-[9px] text-ink-light mt-0.5 font-mono">
                            <span>🔧 {tk.weapon.includes('/') ? `通用 (${tk.weapon})` : tk.weapon}</span>
                          </div>
                          <p className="text-ink-muted text-[11px] mt-1 font-serif leading-relaxed">{highlightKeywords(tk.effect)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Appendix C: States */}
            {activeAppendixTab === 'c' && (
              <div className="space-y-3">
                <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5">
                  <span className="text-wilder-orange text-xl">🌶️</span>
                  <span className="font-serif font-black text-lg text-wilder-blue">附录C：状态</span>
                </div>
                {APPENDIX_STATES.filter(st => 
                  st.name.includes(appendixSearchQuery) || 
                  st.effect.includes(appendixSearchQuery)
                ).map(st => (
                  <div key={st.name} className="flex rounded-lg border border-surface-border overflow-hidden shadow-sm">
                    <div className="w-20 bg-[#B5523A] text-white flex items-center justify-center font-serif font-black text-xs text-center p-2 shrink-0 select-none">
                      {st.name}
                    </div>
                    <div className="flex-1 bg-surface-well p-3 text-[11px] leading-relaxed text-ink space-y-1.5">
                      <p className="font-serif">
                        {highlightKeywords(st.effect)}
                      </p>
                      {st.endCondition && (
                        <p className="text-[10px] text-ink-muted border-t border-surface-border/40 pt-1">
                          <span className="font-extrabold text-ink">结束条件：</span>
                          {highlightKeywords(st.endCondition)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Appendix Regions */}
            {activeAppendixTab === 'e' && (
              <div className="space-y-3">
                <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5">
                  <span className="text-wilder-orange text-xl">🗺️</span>
                  <span className="font-serif font-black text-lg text-wilder-blue">附录A.2：地区与区域特性</span>
                </div>
                <div className="text-[10px] bg-surface-well px-2 py-1 text-ink-muted font-bold border-l-2 border-wilder-blue mb-2">
                  地区与区域特性会影响猎群在旅行和特定环境中的生存与移动难度。
                </div>
                <div className="space-y-3">
                  {APPENDIX_REGIONS.filter(r => !appendixSearchQuery || r.name.includes(appendixSearchQuery) || r.effect.includes(appendixSearchQuery)).map(r => (
                    <div key={r.name} className="flex rounded-lg border border-surface-border overflow-hidden shadow-sm">
                      <div className="w-20 bg-stone-700 text-white flex items-center justify-center font-serif font-black text-xs text-center p-2 shrink-0 select-none">
                        {r.name}
                      </div>
                      <div className="flex-1 bg-surface-well p-3 text-[11px] leading-relaxed text-ink">
                        <p className="font-serif">
                          {highlightKeywords(r.effect)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appendix D: Quick Reference */}
            {activeAppendixTab === 'd' && (() => {
              const showTracking = !appendixSearchQuery || '追踪每个行进轮包含以下阶段寻踪选择该区域中的一个聚落收集物资觅食搜索风格扎营不谐受伤前进开始挑战难度值旅行穿越'.includes(appendixSearchQuery);
              const showHunting = !appendixSearchQuery || '狩猎每个回合有3点行动攻击力量精准迅捷技巧防御饮食即时动作移动准备修复嘲讽特性'.includes(appendixSearchQuery);
              const showFeast = !appendixSearchQuery || '盛宴问题烹饪风格技能特性'.includes(appendixSearchQuery);
              const showRest = !appendixSearchQuery || '休整首先完成以下所有事项体力耐久度受伤不谐烹饪恢复照料补给训练投入项目'.includes(appendixSearchQuery);

              return (
                <div className="space-y-4">
                  <div className="border-b-2 border-wilder-blue pb-2 mb-3 flex items-center gap-1.5">
                    <span className="text-wilder-orange text-xl">📋</span>
                    <span className="font-serif font-black text-lg text-wilder-blue">附录D：游戏流程快速参考</span>
                  </div>
                  {/* 追踪 (Tracking) */}
                  {showTracking && (
                    <div className="flex rounded-lg shadow-sm border border-surface-border">
                      <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0">
                        <div>追</div>
                        <div className="mt-1">踪</div>
                      </div>
                      <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2">
                        <p className="font-bold text-ink-muted mb-1 text-[11px]">每个行进轮包含以下阶段：</p>
                        <ul className="space-y-1.5 pl-1">
                          <li className="list-none">
                            <span className="font-extrabold text-ink">● 寻踪（可选）</span>
                            <ul className="pl-4 mt-0.5 space-y-1">
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="font-extrabold">选择该区域中的一个聚落</span>。通过与该聚落互动，你们可以找到可行的觅食方式、安全的旅行方式以及足迹。
                                </span>
                              </li>
                            </ul>
                          </li>
                          <li className="list-none">
                            <span className="font-extrabold text-ink">● 收集物资（可选）</span>
                            <ul className="pl-4 mt-0.5 space-y-1">
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="font-extrabold">步骤1：觅食</span>。每位荒野食客都进行一次<span className="text-wilder-blue font-bold">搜索</span>检定。若成功，你获得 [A] 份与你所用<span className="text-wilder-amber font-bold">风格</span>相对应的食材。
                                </span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="font-extrabold">步骤2：扎营</span>。结束除<span className="text-red-600 font-bold">不谐</span>与<span className="text-red-600 font-bold">受伤</span>外的所有状态。回复 &lt;H&gt; 耐久度。猎群烹饪一餐。
                                </span>
                              </li>
                            </ul>
                          </li>
                          <li className="list-none">
                            <span className="font-extrabold text-ink">● 前进</span>
                            <ul className="pl-4 mt-0.5 space-y-1">
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="font-extrabold">步骤1：开始挑战</span>。猎群必须完成一个难度值为 5 × 荒野食客人数的挑战，才能穿过该区域。
                                </span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="font-extrabold">步骤2：旅行</span>。每位荒野食客都进行一次<span className="text-wilder-blue font-bold">穿越</span>检定。若成功，将你的 [A] 值加入猎群的总数中。
                                </span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="font-extrabold">步骤3：检查结果</span>。如果你们完成了挑战，则开始一次安全事件。如果你们挑战失败，则开始一次危险事件。此外，如果你们使用了猎群尚未学会的<span className="text-wilder-amber font-bold">风格</span>进行旅行，则会受到等同于剩余难度值的伤害。
                                </span>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 狩猎 (Hunting) */}
                  {showHunting && (
                    <div className="flex rounded-lg shadow-sm border border-surface-border">
                      <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0">
                        <div>狩</div>
                        <div className="mt-1">猎</div>
                      </div>
                      <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2">
                        <p className="font-bold text-ink-muted mb-1 text-[11px]">你每回合有3点行动，可用于以下选项：</p>
                        <ul className="space-y-2 pl-1">
                          <li className="list-none">
                            <span className="font-extrabold text-ink">● 攻击</span>。（费用：可变）对射程内的一只生物进行一次<span className="text-wilder-blue font-bold">打击</span>或<span className="text-wilder-blue font-bold">射击</span>检定。每种<span className="text-wilder-amber font-bold">风格</span>都有不同的费用与效果。如果你在一个回合内进行多次攻击，每次都必须选择不同的<span className="text-wilder-amber font-bold">风格</span>。
                            <ul className="pl-4 mt-1 space-y-1">
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="text-wilder-amber font-extrabold">力量</span>。（费用：2点行动）[A]×2点伤害。若失败，你陷入<span className="text-red-600 font-bold">暴露</span>状态。
                                </span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="text-wilder-amber font-extrabold">精准</span>。（费用：2点行动）[A]点身体部位伤害。
                                </span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="text-wilder-amber font-extrabold">迅捷</span>。（费用：1点行动）[A]点伤害。
                                </span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1 text-wilder-amber font-mono">◇</span>
                                <span>
                                  <span className="text-wilder-amber font-extrabold">技巧</span>。（费用：1点行动）[A]点身体部位伤害。若失败，你陷入<span className="text-red-600 font-bold">暴露</span>状态。
                                </span>
                              </li>
                            </ul>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">防御</span>。（费用：2点行动）直到你的下个回合开始前，你受到的任何伤害减半。
                            </span>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">饮食</span>。（费用：1点行动）吃下一份零食。
                            </span>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">即时动作</span>。（费用：1点行动）陈述你的目标，设定你的方式，并进行一次检定。
                            </span>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">移动</span>。（费用：1点行动）移动1跨度（靠近或远离），与队友进行跟随，或改变地形。
                            </span>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">准备</span>。（费用：1点行动）在下个回合获得1点额外行动。你每回合只能进行一次准备。
                            </span>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">修复</span>。（费用：2点行动）为你的<span className="font-extrabold">工具</span>回复1点耐久度。目标怪物无法进行修复。
                            </span>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">嘲讽</span>。（费用：1点行动）如果你在1跨度范围内，便会成为目标怪物的目标。
                            </span>
                          </li>
                          <li className="list-none flex items-start">
                            <span className="mr-1.5 text-ink font-mono">●</span>
                            <span>
                              <span className="font-extrabold">使用特性</span>。（费用：可变）每项<span className="text-wilder-teal font-bold">特性</span>都会说明其使用时机与费用。
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 盛宴 (Feast) */}
                  {showFeast && (
                    <div className="flex rounded-lg shadow-sm border border-surface-border">
                      <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0">
                        <div>盛</div>
                        <div className="mt-1">宴</div>
                      </div>
                      <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2">
                        <p className="font-bold text-ink-muted mb-1 text-[11px]">在荒野盛宴期间，你可以...</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="font-extrabold text-ink block text-[11px] border-b border-surface-border pb-1">回答以下问题...</span>
                            <ul className="space-y-1 pl-1">
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>你们如何烹饪目标怪物？</span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>你们在准备餐食时做什么？</span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>你们在荒野盛宴上还准备了什么？</span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>这道餐食与你们的过往有何关联？</span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>下一次你们吃这道餐食时，会想起什么？</span>
                              </li>
                            </ul>
                          </div>
                          <div className="space-y-1">
                            <span className="font-extrabold text-ink block text-[11px] border-b border-surface-border pb-1">来提出以下问题...</span>
                            <ul className="space-y-1 pl-1">
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>目标怪物在某项<span className="text-wilder-amber font-bold">风格</span>上有多少等级？</span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>目标怪物在某项<span className="text-wilder-blue font-bold">技能</span>上有多少等级？</span>
                              </li>
                              <li className="list-none flex items-start">
                                <span className="mr-1.5 text-ink-muted">•</span>
                                <span>目标怪物的<span className="text-wilder-teal font-bold">特性</span>之一是什么？</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 休整 (Rest) */}
                  {showRest && (
                    <div className="flex rounded-lg shadow-sm border border-surface-border">
                      <div className="w-8 bg-stone-700 text-white rounded-l-lg flex flex-col items-center justify-center font-serif font-black text-sm py-4 select-none shrink-0">
                        <div>休</div>
                        <div className="mt-1">整</div>
                      </div>
                      <div className="flex-1 bg-surface-well rounded-r-lg p-3 text-xs leading-relaxed text-ink space-y-2.5">
                        <div className="space-y-1">
                          <p className="font-bold text-ink mb-1 text-[11px]">首先，完成以下所有事项：</p>
                          <ul className="space-y-0.5 pl-1.5">
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>回复所有体力。</span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>回复所有耐久度。</span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>移除1个等级的<span className="text-red-600 font-bold">受伤</span>状态，并结束除<span className="text-red-600 font-bold">不谐</span>外的所有其他状态的所有等级。</span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>获得 &lt;H&gt; 份家乡特产和1份家乡香料。</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="space-y-1 pt-1.5 border-t border-surface-border/60">
                          <p className="font-bold text-ink mb-1 text-[11px]">然后，你们获得2点行动，可用于以下选项：</p>
                          <ul className="space-y-1 pl-1.5">
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>
                                <span className="font-extrabold">烹饪</span>。（费用：0点行动）烹饪任意数量的餐食。
                              </span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>
                                <span className="font-extrabold">恢复</span>。（费用：1点行动）移除1个等级的<span className="text-red-600 font-bold">受伤</span>状态。
                              </span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>
                                <span className="font-extrabold">照料</span>。（费用：0点行动）将一餐饭喂给正在<span className="text-red-600 font-bold">康复</span>的生物。
                              </span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>
                                <span className="font-extrabold">补给</span>。（费用：1点行动）获得 &lt;H&gt; 份家乡特产和1份家乡香料。
                              </span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>
                                <span className="font-extrabold">训练</span>。（费用：1点行动）完成一次训练，以学习一项战技。你们每个休整阶段只能进行一次训练。
                              </span>
                            </li>
                            <li className="list-none flex items-start">
                              <span className="mr-1.5 text-ink-muted">•</span>
                              <span>
                                <span className="font-extrabold">投入项目</span>。（费用：1点行动）进行一次检定，以完成一个自定义挑战。
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
          </div>

      {/* FOOTER */}
      <footer className="text-center py-8 mt-12 border-t border-surface-border text-xs text-wilder-amber">
        <p>© 2026 荒野盛宴 TTRPG 电子人物卡辅助工具. All Rules and Concepts belong to KC Shi and respective authors.</p>
        <p className="mt-1">Based on "Wilderfeast" core rules. Craft with Love & Wilderness.</p>
      </footer>
    </div>
  );
}
