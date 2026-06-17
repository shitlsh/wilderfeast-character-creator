import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  Dice5, Download, Upload, Plus, Trash2, 
  Heart, Shield, Printer, ArrowLeft, Shuffle, 
  Users, Share2, Compass, Feather, BookOpen as BookIcon, Search
} from 'lucide-react';
import { 
  TOOLS, LINEAGES, UPBRINGINGS, MOTIVATIONS, AMBITIONS, PRE_GENS,
  Tool, Lineage, Trait, Technique
} from './data';
import { getInkIcon, getCharacterPortrait } from './icons';
import { 
  APPENDIX_TRAITS, APPENDIX_TECHNIQUES, APPENDIX_STATES, APPENDIX_ACTIONS 
} from './appendixData';

// Definition for our dynamic character state
interface Character {
  id: string;
  isCustom: boolean;
  name: string;
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
  traits: string[]; // List of names of traits & techniques
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
  avatarType: 'emoji' | 'upload';
  avatarValue: string; // emoji character or base64 data url
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

  // Background Course 2 (Motivation)
  const [wizMotivationIndex, setWizMotivationIndex] = useState<number>(0);
  const [wizMotivationMeal, setWizMotivationMeal] = useState('');
  const [wizMotivationText, setWizMotivationText] = useState('');

  // Background Course 3 (Ambition)
  const [wizAmbitionIndex, setWizAmbitionIndex] = useState<number>(0);
  const [wizAmbitionMeal, setWizAmbitionMeal] = useState('');
  const [wizAmbitionText, setWizAmbitionText] = useState('');

  const [wizBond, setWizBond] = useState('');
  const [wizAvatarType, setWizAvatarType] = useState<'emoji' | 'upload'>('emoji');
  const [wizAvatarValue, setWizAvatarValue] = useState('渔夫');

  // Appendix State
  const [activeAppendixTab, setActiveAppendixTab] = useState<'a' | 'b' | 'c' | 'd'>('d');
  const [appendixSearchQuery, setAppendixSearchQuery] = useState('');
  const [appendixFilterWeapon, setAppendixFilterWeapon] = useState('all');

  // Drawer States
  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState<boolean>(false);
  const [isManualDrawerOpen, setIsManualDrawerOpen] = useState<boolean>(false);

  // Alert/Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Ref for card export
  const cardPrintRef = useRef<HTMLDivElement>(null);

  // Initialize and load characters
  useEffect(() => {
    const loadedCustoms = localStorage.getItem('wilder_customs');
    let customChars: Character[] = [];
    if (loadedCustoms) {
      try {
        customChars = JSON.parse(loadedCustoms);
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
      return {
        id: `pregen_${i}`,
        isCustom: false,
        name: pg.name,
        specialty: pg.specialty,
        adjectives: pg.adjectives,
        tool: pg.tool,
        stylesChoice: pg.stylesChoice,
        styleValues: pg.styleValues,
        skills: pg.skills,
        traits: pg.traits,
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
        avatarType: 'emoji',
        avatarValue: pg.name === '普莱兹' ? '渔夫' : 
                     pg.name === '巴格' ? '储藏者' : 
                     pg.name === '娜特·辛' ? '面包师' : 
                     pg.name === '泰伦' ? '屠夫' : 
                     pg.name === '莲恩' ? '调味者' : '变形者',
        notes: `预设角色 ${pg.name} (${pg.specialty})`
      };
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
      customChars = JSON.parse(loadedCustoms);
    }
    
    // Keep pregens
    const preGenList: Character[] = PRE_GENS.map((pg, i) => {
      let dbMax = pg.durability;
      if (pg.traits.includes('钢铁之盾')) dbMax = 50;
      return {
        id: `pregen_${i}`,
        isCustom: false,
        name: pg.name,
        specialty: pg.specialty,
        adjectives: pg.adjectives,
        tool: pg.tool,
        stylesChoice: pg.stylesChoice,
        styleValues: pg.styleValues,
        skills: pg.skills,
        traits: pg.traits,
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
        avatarType: 'emoji',
        avatarValue: pg.name === '普莱兹' ? '渔夫' : 
                     pg.name === '巴格' ? '储藏者' : 
                     pg.name === '娜特·辛' ? '面包师' : 
                     pg.name === '泰伦' ? '屠夫' : 
                     pg.name === '莲恩' ? '调味者' : '变形者'
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

  const updateActiveCharStates = (stateKey: keyof Character['states']) => {
    if (!activeChar) return;
    const updatedStates = { ...activeChar.states, [stateKey]: !activeChar.states[stateKey] };
    
    // If Harmony falls and dishamony triggers
    const updated = { ...activeChar, states: updatedStates };
    
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
  const rollBackgroundOption = (course: 'upbringing' | 'motivation' | 'ambition') => {
    const roll = Math.floor(Math.random() * 20);
    if (course === 'upbringing') {
      setWizUpbringingIndex(roll);
      setWizUpbringingMeal(UPBRINGINGS[roll].description.split('，')[0] || '特色乱炖');
      setWizUpbringingText(UPBRINGINGS[roll].description);
    } else if (course === 'motivation') {
      setWizMotivationIndex(roll);
      setWizMotivationMeal(MOTIVATIONS[roll].description.split('。')[0] || '怪物牛排');
      setWizMotivationText(MOTIVATIONS[roll].description);
    } else if (course === 'ambition') {
      setWizAmbitionIndex(roll);
      setWizAmbitionMeal(AMBITIONS[roll].description.split('。')[0] || '巨人之心');
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
    const upbringingSkill = UPBRINGINGS[wizUpbringingIndex].skill;
    const motivationSkill = MOTIVATIONS[wizMotivationIndex].skill;
    const ambitionSkill = AMBITIONS[wizAmbitionIndex].skill;

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
      specialty: wizLineage.name,
      adjectives: [wizAdjectiveCurrent, wizAdjectiveAspiring],
      tool: wizTool.name,
      stylesChoice: wizStylesChoice,
      styleValues: calculateWizStyles(),
      skills,
      traits: traitList,
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
      avatarType: wizAvatarType,
      avatarValue: wizAvatarValue
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
    setWizardStep(1);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setWizAvatarType('upload');
      setWizAvatarValue(event.target?.result as string);
      showNotification('自定义头像上传成功！', 'success');
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
      <header className="flex flex-col md:flex-row justify-between items-center pb-6 mb-6 border-b-2 border-orange-900">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <span className="text-parchment-200">{getInkIcon('屠夫', 40)}</span>
          <div>
            <h1 className="text-3xl font-extrabold text-parchment-200 tracking-wide font-serif">
              荒野盛宴电子人物卡
            </h1>
            <p className="text-xs text-orange-300">
              Wilderfeast Character Sheet & Creator Wizard
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => { setActiveTab('roster'); setDiceRoll(null); }}
            className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${activeTab === 'roster' ? 'bg-earth-600 border-earth-400 text-white' : 'bg-[#241103] border-orange-700 text-parchment-200'}`}
          >
            <Users size={16} /> 猎人群罗盘 (猎人列表)
          </button>
          <button 
            onClick={() => { setActiveTab('create'); setWizardStep(1); setDiceRoll(null); }}
            className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${activeTab === 'create' ? 'bg-earth-600 border-earth-400 text-white' : 'bg-[#241103] border-orange-700 text-parchment-200'}`}
          >
            <Plus size={16} /> 新建荒野角色
          </button>
        </div>
      </header>

      {/* NOTIFICATIONS */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-md shadow-rough border-3 text-sm flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-orange-700 border-orange-500 text-white' : 
          notification.type === 'error' ? 'bg-earth-700 border-earth-500 text-white' : 
          'bg-yellow-850 border-yellow-500 text-yellow-100'
        }`}>
          <span>{notification.type === 'success' ? '✨' : notification.type === 'error' ? '💥' : '🔍'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* MAIN LAYOUT - FULL WIDTH AND SPACIOUS */}
      <main className="max-w-4xl mx-auto w-full px-2 sm:px-4">
          
          {/* TAB 1: ROSTER & SELECTION */}
          {activeTab === 'roster' && (
            <div className="wood-panel p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-parchment-200 flex items-center gap-2">
                  <Compass className="text-earth-400" /> 猎群契约 (我的猎人列表)
                </h2>
                
                <div className="relative">
                  <label className="btn-sketch rounded px-3 py-1.5 bg-orange-950 border-orange-700 text-parchment-200 flex items-center gap-1 cursor-pointer text-xs">
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
                        ? 'bg-earth-900 border-earth-500 text-white shadow-rough' 
                        : 'bg-[#241103] border-orange-800 text-parchment-200'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-parchment-300 flex items-center justify-center bg-amber-950 overflow-hidden flex-shrink-0 text-parchment-300">
                      {char.avatarType === 'emoji' ? (
                        getInkIcon(char.avatarValue, 32)
                      ) : (
                        <img src={char.avatarValue} alt="avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-serif text-lg truncate">{char.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${char.isCustom ? 'bg-earth-600 text-white' : 'bg-orange-800 text-orange-200'}`}>
                          {char.isCustom ? '自建' : '官方预设'}
                        </span>
                      </div>
                      <p className="text-xs text-orange-300 truncate">
                        {char.adjectives.join(' / ')} • {char.specialty}
                      </p>
                      <p className="text-xs text-parchment-300 font-serif mt-1 flex items-center gap-1">
                        工具: {char.tool} | 体力: {char.stamina}/20 | 和谐: {char.harmony}/{char.harmonyMax}
                      </p>
                    </div>
                    {char.isCustom && (
                      <button 
                        onClick={(e) => deleteCharacter(char.id, e)}
                        className="text-orange-400 hover:text-earth-400 p-2"
                        title="删除角色"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <div 
                  onClick={() => { setActiveTab('create'); setWizardStep(1); }}
                  className="border-3 border-dashed border-orange-700 p-6 rounded-md cursor-pointer transition-all hover:bg-[#241103] flex flex-col items-center justify-center text-orange-300"
                >
                  <Plus size={32} className="mb-2" />
                  <span className="font-bold">契约新猎人</span>
                  <span className="text-xs mt-1 text-orange-400">开始分步向导，定制属于你的荒野食客</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WIZARD CHARACTER CREATOR */}
          {activeTab === 'create' && (
            <div className="wood-panel p-6 rounded-lg text-parchment-100">
              {/* Step bar indicator */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-orange-900">
                <span className="font-serif font-bold text-xl text-parchment-200">
                  创建荒野食客 ({wizardStep}/3 步)
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3].map(s => (
                    <div 
                      key={s} 
                      className={`h-2 w-10 rounded ${s <= wizardStep ? 'bg-earth-500' : 'bg-orange-950'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: TOOL & IDENTITY */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold font-serif mb-2 text-earth-400">第一步：输入名字与身份描述</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-orange-300">姓名 (Name)</label>
                        <input 
                          type="text" 
                          value={wizName} 
                          onChange={(e) => setWizName(e.target.value)}
                          placeholder="例如: 普莱兹, 巴格, 或是你自己的称呼"
                          className="w-full bg-[#241103] border-2 border-orange-800 rounded px-3 py-2 text-parchment-100 focus:outline-none focus:border-earth-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold mb-1 text-orange-300">目前的你 (形容词)</label>
                          <select 
                            value={wizAdjectiveCurrent} 
                            onChange={(e) => setWizAdjectiveCurrent(e.target.value)}
                            className="w-full bg-[#241103] border-2 border-orange-800 rounded px-2 py-2 text-parchment-100 focus:outline-none"
                          >
                            {wizTool.adjectives.map(adj => (
                              <option key={adj} value={adj}>{adj}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1 text-orange-300">向往却难成为的你</label>
                          <select 
                            value={wizAdjectiveAspiring} 
                            onChange={(e) => setWizAdjectiveAspiring(e.target.value)}
                            className="w-full bg-[#241103] border-2 border-orange-800 rounded px-2 py-2 text-parchment-100 focus:outline-none"
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
                    <h3 className="text-lg font-bold font-serif mb-2 text-earth-400">选择你的方舟钢工具</h3>
                    <p className="text-xs text-orange-300 mb-4">
                      工具决定你的核心战斗风格 (Styles) 与初始招式 (Techniques)。每项工具代表你在战斗中的独特战术定位。
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TOOLS.map(t => (
                        <div 
                          key={t.name}
                          onClick={() => setWizTool(t)}
                          className={`border-3 p-3 rounded cursor-pointer transition-all ${
                            wizTool.name === t.name 
                              ? 'bg-earth-900 border-earth-500 text-white shadow-rough' 
                              : 'bg-[#241103] border-orange-900 text-parchment-300 hover:border-orange-700'
                          }`}
                        >
                          <div className="font-bold font-serif text-md">{t.name}</div>
                          <div className="text-[10px] text-orange-400 mt-1 truncate">{t.styles.name}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#241103] p-4 rounded border border-orange-900 mt-4">
                      <h4 className="font-bold text-sm text-parchment-200">{wizTool.name} 的机制细节:</h4>
                      <p className="text-xs text-orange-300 mt-1 leading-relaxed">{wizTool.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-orange-900">
                        <div>
                          <span className="block text-xs font-bold text-parchment-200 mb-1">风格分配选择：</span>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                checked={wizStylesChoice === 'a'} 
                                onChange={() => setWizStylesChoice('a')} 
                                className="accent-earth-500" 
                              />
                              <span>分配 (A): 3级高点，2级次高点</span>
                            </label>
                            <label className="flex items-center space-x-2 text-xs cursor-pointer">
                              <input 
                                type="radio" 
                                checked={wizStylesChoice === 'b'} 
                                onChange={() => setWizStylesChoice('b')} 
                                className="accent-earth-500" 
                              />
                              <span>分配 (B): 2级高点，3级次高点</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <span className="block text-xs font-bold text-parchment-200 mb-1">招牌战技（自动获得）：</span>
                          {wizTool.techniques.filter(tk => tk.type === 'signature').map(tk => (
                            <div key={tk.name} className="text-xs">
                              <span className="font-bold text-earth-400">{tk.name}</span> <span className="text-[10px] bg-orange-950 px-1 rounded">{tk.cost}</span>
                              <p className="text-[10px] text-orange-400 mt-0.5">{tk.effect}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="block text-xs font-bold text-parchment-200 mb-2">自选次要初始战技（从下列 3 选 1）：</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {wizTool.techniques.filter(tk => tk.type === 'optional').map(tk => (
                            <div 
                              key={tk.name}
                              onClick={() => setWizSecondaryTech(tk)}
                              className={`border-2 p-2.5 rounded cursor-pointer transition-all text-xs ${
                                wizSecondaryTech?.name === tk.name 
                                  ? 'bg-earth-950 border-earth-600 text-white' 
                                  : 'bg-amber-950 border-orange-900 text-parchment-300'
                              }`}
                            >
                              <div className="flex justify-between font-bold">
                                <span>{tk.name}</span>
                                <span className="text-[9px] bg-orange-950 px-1 rounded text-earth-300">{tk.cost}</span>
                              </div>
                              <p className="text-[10px] text-orange-400 mt-1 line-clamp-3">{tk.effect}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <h3 className="text-lg font-bold font-serif mb-2 text-earth-400">选择人物卡头像</h3>
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 rounded-full border-3 border-dashed border-earth-500 bg-[#241103] flex items-center justify-center text-parchment-200 overflow-hidden flex-shrink-0">
                        {wizAvatarType === 'emoji' ? (
                          getInkIcon(wizAvatarValue, 40)
                        ) : (
                          <img src={wizAvatarValue} alt="avatar" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {BUILTIN_AVATARS.map(av => (
                            <button
                              key={av.value}
                              type="button"
                              onClick={() => { setWizAvatarType('emoji'); setWizAvatarValue(av.value); }}
                              className={`w-10 h-10 rounded border-2 text-parchment-200 flex items-center justify-center transition-all ${
                                wizAvatarType === 'emoji' && wizAvatarValue === av.value 
                                  ? 'bg-earth-800 border-earth-500 ring-2 ring-earth-400' 
                                  : 'bg-[#241103] border-orange-800 hover:border-orange-500'
                              }`}
                              title={av.label}
                            >
                              {getInkIcon(av.value, 20)}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-orange-400">或者自己上传图片：</span>
                          <label className="btn-sketch rounded px-2.5 py-1 bg-orange-950 border-orange-700 cursor-pointer text-[11px]">
                            选择文件
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={nextStep}
                      className="btn-sketch rounded px-6 py-2.5 bg-earth-600 border-earth-400 text-white flex items-center gap-1 font-serif font-bold text-md"
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
                    <h3 className="text-lg font-bold font-serif mb-2 text-earth-400 font-serif">选择你的突变专长 (Specialty)</h3>
                    <p className="text-xs text-orange-300 mb-4">
                      荒野食客通过烹食怪物来获得基因突变。选择你所擅长的怪物谱系。专长决定你的初始特性和亲密同伴。
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {LINEAGES.map(l => (
                        <div 
                          key={l.name}
                          onClick={() => setWizLineage(l)}
                          className={`border-3 p-3 rounded cursor-pointer transition-all ${
                            wizLineage.name === l.name 
                              ? 'bg-earth-900 border-earth-500 text-white shadow-rough' 
                              : 'bg-[#241103] border-orange-900 text-parchment-300 hover:border-orange-700'
                          }`}
                        >
                          <div className="font-bold font-serif text-md">{l.name}</div>
                          <div className="text-[9px] text-orange-400 mt-1 line-clamp-1">{l.description}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#241103] p-4 rounded border border-orange-900 mt-4 space-y-4">
                      <div>
                        <h4 className="font-bold text-sm text-parchment-200">🥗 {wizLineage.name} 的生物特征:</h4>
                        <p className="text-xs text-orange-300 mt-1 leading-relaxed">{wizLineage.description}</p>
                      </div>

                      {/* Lineage traits selection */}
                      <div className="border-t border-orange-900 pt-3">
                        <span className="block text-xs font-bold text-parchment-200 mb-2">🧬 初始特性一（从本谱系专属特性中 3 选 1）：</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {wizLineage.traits.map(tr => (
                            <div 
                              key={tr.name}
                              onClick={() => setWizTraitPrimary(tr)}
                              className={`border-2 p-2.5 rounded cursor-pointer transition-all text-xs ${
                                wizTraitPrimary?.name === tr.name 
                                  ? 'bg-earth-950 border-earth-600 text-white' 
                                  : 'bg-amber-950 border-orange-900 text-parchment-300'
                              }`}
                            >
                              <div className="flex justify-between font-bold text-earth-400">
                                <span>{tr.name}</span>
                                <span className="text-[9px] bg-amber-950 px-1 rounded text-parchment-400">{tr.cost}</span>
                              </div>
                              <p className="text-[10px] text-orange-400 mt-1">{tr.effect}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General second trait selection */}
                      <div className="border-t border-orange-900 pt-3 space-y-3">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                          <span className="block text-xs font-bold text-parchment-200">初始特性二（杂学：可自选自大专长或附录A特性库）：</span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setWizSecondaryTraitSource('specialty')}
                              className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                                wizSecondaryTraitSource === 'specialty' 
                                  ? 'bg-earth-600 border-earth-400 text-white shadow-rough' 
                                  : 'bg-[#241103] border-orange-800 text-parchment-300'
                              }`}
                            >
                              8大专长特性
                            </button>
                            <button
                              type="button"
                              onClick={() => setWizSecondaryTraitSource('appendix')}
                              className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                                wizSecondaryTraitSource === 'appendix' 
                                  ? 'bg-earth-600 border-earth-400 text-white shadow-rough' 
                                  : 'bg-[#241103] border-orange-800 text-parchment-300'
                              }`}
                            >
                              附录A特性库
                            </button>
                          </div>
                        </div>

                        {wizSecondaryTraitSource === 'specialty' ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-[#150a02] rounded border border-orange-900">
                            {LINEAGES.map(lg => (
                              <div key={lg.name} className="space-y-1">
                                <div className="text-[9px] bg-orange-950 px-1.5 py-0.5 text-parchment-300 font-bold truncate">{lg.name}</div>
                                {lg.traits.map(tr => (
                                  <div 
                                    key={tr.name}
                                    onClick={() => setWizTraitSecondary(tr)}
                                    className={`p-1.5 rounded cursor-pointer text-[10px] transition-all truncate ${
                                      wizTraitSecondary?.name === tr.name 
                                        ? 'bg-earth-800 text-white' 
                                        : 'text-parchment-400 hover:bg-[#241103]'
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
                            <div className="flex items-center bg-[#150a02] border border-orange-900 rounded px-2 py-1">
                              <Search size={14} className="text-orange-400 mr-1.5" />
                              <input 
                                type="text"
                                value={wizSecondarySearchQuery}
                                onChange={(e) => setWizSecondarySearchQuery(e.target.value)}
                                placeholder="搜索附录A特性名称 or 描述..."
                                className="bg-transparent focus:outline-none text-xs text-parchment-200 placeholder:text-orange-800 w-full"
                              />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#150a02] rounded border border-orange-900">
                              {APPENDIX_TRAITS.filter(tr => 
                                tr.name.includes(wizSecondarySearchQuery) || 
                                tr.effect.includes(wizSecondarySearchQuery)
                              ).map(tr => (
                                <div 
                                  key={tr.name}
                                  onClick={() => setWizTraitSecondary({ name: tr.name, cost: tr.cost, effect: tr.effect })}
                                  className={`p-2 rounded cursor-pointer text-[10px] transition-all border ${
                                    wizTraitSecondary?.name === tr.name 
                                      ? 'bg-earth-800 border-earth-500 text-white' 
                                      : 'bg-[#241103] border-orange-900 text-parchment-400 hover:bg-amber-950 hover:text-white'
                                  }`}
                                  title={`${tr.name} (${tr.cost}): ${tr.effect}`}
                                >
                                  <div className="font-bold truncate">{tr.name}</div>
                                  <div className="text-[8px] text-orange-400 truncate mt-0.5">{tr.cost}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {wizTraitSecondary && (
                          <div className="mt-2 text-xs bg-amber-950 p-2 rounded border border-orange-900 text-orange-300">
                            已选择次要特性: <span className="font-bold text-earth-400">{wizTraitSecondary.name}</span> ({wizTraitSecondary.cost}) — {wizTraitSecondary.effect}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Companion choice */}
                  <div>
                    <h3 className="text-lg font-bold font-serif mb-2 text-earth-400">选择你的密切同伴 (Companion)</h3>
                    <p className="text-xs text-orange-300 mb-3">
                      每一名荒野食客都与一只怪物同伴有着深厚的默契和牵绊。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {wizLineage.companions.map((comp, i) => (
                        <div 
                          key={comp.name}
                          onClick={() => setWizCompanionIndex(i)}
                          className={`border-2 p-2.5 rounded cursor-pointer text-xs transition-all ${
                            wizCompanionIndex === i 
                              ? 'bg-earth-900 border-earth-600 text-white' 
                              : 'bg-[#241103] border-orange-900 text-parchment-400 hover:border-orange-800'
                          }`}
                        >
                          <div className="font-bold font-serif">{comp.name}</div>
                          <p className="text-[10px] text-orange-400 mt-1 line-clamp-3">{comp.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-bold mb-1 text-orange-300">给同伴起个自定义名字（留空则使用默认名）：</label>
                      <input 
                        type="text" 
                        value={wizCompanionCustomName} 
                        onChange={(e) => setWizCompanionCustomName(e.target.value)}
                        placeholder={`默认：${wizLineage.companions[wizCompanionIndex].name}`}
                        className="w-full max-w-md bg-[#241103] border-2 border-orange-800 rounded px-3 py-1.5 text-xs text-parchment-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      onClick={() => setWizardStep(1)}
                      className="btn-sketch rounded px-4 py-2 bg-[#241103] border-orange-800 text-parchment-200"
                    >
                      ← 上一步
                    </button>
                    <button 
                      onClick={nextStep}
                      className="btn-sketch rounded px-6 py-2.5 bg-earth-600 border-earth-400 text-white flex items-center gap-1 font-serif font-bold text-md"
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
                    <h3 className="text-lg font-bold font-serif mb-1 text-earth-400">第三步：设定“三道菜式”背景故事</h3>
                    <p className="text-xs text-orange-300 mb-4 leading-relaxed">
                      荒野食客通过特定的食物铭记自己的过往。在下方设定你的童年餐食、入伙动机以及毕生雄心。
                      <span className="text-earth-400 font-bold block mt-1">💡 规则计算：每个背景对应的选择会给你提供一项唯一的 +1 初始技能加值，三种背景对应的初始技能必须各不相同！</span>
                    </p>

                    <div className="space-y-4">
                      {/* Course 1: Upbringing */}
                      <div className="bg-[#241103] p-4 rounded border border-orange-900 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-parchment-200 text-sm flex items-center gap-1">
                            第一道菜：成长背景 (Upbringing) — 童年餐食
                          </span>
                          <button 
                            onClick={() => rollBackgroundOption('upbringing')}
                            className="text-xs bg-earth-700 border border-earth-500 px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-earth-600"
                          >
                            <Shuffle size={12} /> 随机骰选
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-4">
                            <label className="block text-[10px] text-orange-400 mb-1">童年美食名称</label>
                            <input 
                              type="text" 
                              value={wizUpbringingMeal} 
                              onChange={(e) => setWizUpbringingMeal(e.target.value)}
                              placeholder="例如: 黑麦酸面包配咸鱼"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="block text-[10px] text-orange-400 mb-1">童年成长细节</label>
                            <textarea 
                              rows={2}
                              value={wizUpbringingText} 
                              onChange={(e) => setWizUpbringingText(e.target.value)}
                              placeholder="描述在什么环境下吃、谁在身边、什么样的情感"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-orange-400 mb-1">对应技能加成</label>
                            <div className="bg-[#150a02] border border-orange-800 text-earth-400 text-xs text-center font-bold py-2 rounded">
                              +1 {UPBRINGINGS[wizUpbringingIndex].skill}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-orange-950">
                          <div>
                            <label className="block text-[10px] text-orange-400 mb-0.5">家乡特产</label>
                            <input 
                              type="text" 
                              value={wizUpbringingSpecialty} 
                              onChange={(e) => setWizUpbringingSpecialty(e.target.value)}
                              placeholder="例如: 白米, 玉米, 虫尾"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-orange-400 mb-0.5">家乡香料</label>
                            <input 
                              type="text" 
                              value={wizUpbringingSpice} 
                              onChange={(e) => setWizUpbringingSpice(e.target.value)}
                              placeholder="例如: 大蒜, 鱼露, 怪物之血"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Course 2: Motivation */}
                      <div className="bg-[#241103] p-4 rounded border border-orange-900 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-parchment-200 text-sm flex items-center gap-1">
                            第二道菜：入伙动机 (Motivation) — 变异野兽餐
                          </span>
                          <button 
                            onClick={() => rollBackgroundOption('motivation')}
                            className="text-xs bg-earth-700 border border-earth-500 px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-earth-600"
                          >
                            <Shuffle size={12} /> 随机骰选
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-4">
                            <label className="block text-[10px] text-orange-400 mb-1">怪物之餐名称</label>
                            <input 
                              type="text" 
                              value={wizMotivationMeal} 
                              onChange={(e) => setWizMotivationMeal(e.target.value)}
                              placeholder="例如: 类似鲨鱼肉的稠粥"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="block text-[10px] text-orange-400 mb-1">入伙故事与野性觉醒</label>
                            <textarea 
                              rows={2}
                              value={wizMotivationText} 
                              onChange={(e) => setWizMotivationText(e.target.value)}
                              placeholder="那是什么怪物？怎么死的？你为什么吃它？"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-orange-400 mb-1">对应技能加成</label>
                            <div className="bg-[#150a02] border border-orange-800 text-earth-400 text-xs text-center font-bold py-2 rounded">
                              +1 {MOTIVATIONS[wizMotivationIndex].skill}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Course 3: Ambition */}
                      <div className="bg-[#241103] p-4 rounded border border-orange-900 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-parchment-200 text-sm flex items-center gap-1">
                            第三道菜：一生雄心 (Ambition) — 梦想终极餐
                          </span>
                          <button 
                            onClick={() => rollBackgroundOption('ambition')}
                            className="text-xs bg-earth-700 border border-earth-500 px-2 py-1 rounded text-white flex items-center gap-1 hover:bg-earth-600"
                          >
                            <Shuffle size={12} /> 随机骰选
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-4">
                            <label className="block text-[10px] text-orange-400 mb-1">梦想终极料理名称</label>
                            <input 
                              type="text" 
                              value={wizAmbitionMeal} 
                              onChange={(e) => setWizAmbitionMeal(e.target.value)}
                              placeholder="例如: 巨人之心, 传奇盛宴"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="block text-[10px] text-orange-400 mb-1">渴望达成的成就</label>
                            <textarea 
                              rows={2}
                              value={wizAmbitionText} 
                              onChange={(e) => setWizAmbitionText(e.target.value)}
                              placeholder="这道餐代表什么？你为什么如此渴望？什么在阻碍你？"
                              className="w-full bg-[#150a02] border border-orange-800 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-orange-400 mb-1">对应技能加成</label>
                            <div className="bg-[#150a02] border border-orange-800 text-earth-400 text-xs text-center font-bold py-2 rounded">
                              +1 {AMBITIONS[wizAmbitionIndex].skill}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bond input */}
                  <div>
                    <h3 className="text-lg font-bold font-serif mb-2 text-earth-400">设立契约牵绊 (Connection Bond)</h3>
                    <p className="text-xs text-orange-300 mb-2">
                      餐食很少独自享用。选择一道菜，指定你与猎群中另一名队友建立特定的情感羁绊（Connection）。
                    </p>
                    <textarea 
                      rows={2}
                      value={wizBond} 
                      onChange={(e) => setWizBond(e.target.value)}
                      placeholder="例如: 每次你吃黑麦咸鱼时，队友都在场，你们在生死关头曾互相帮扶过，你发誓守护他们..."
                      className="w-full bg-[#241103] border-2 border-orange-800 rounded px-3 py-2 text-xs text-parchment-100"
                    />
                  </div>

                  {/* Navigation and validate skill selection */}
                  <div className="flex justify-between pt-4">
                    <button 
                      onClick={() => setWizardStep(2)}
                      className="btn-sketch rounded px-4 py-2 bg-[#241103] border-orange-800 text-parchment-200"
                    >
                      ← 上一步
                    </button>
                    
                    <button 
                      onClick={handleCreateCharacter}
                      className="btn-sketch rounded px-8 py-3 bg-earth-600 border-earth-400 text-white flex items-center gap-2 font-serif font-bold text-lg hover:shadow-rough"
                    >
                      刻入猎群契约（创建荒野食客）
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLAY MODE INTERACTIVE SHEET */}
          {activeTab === 'play' && activeChar && (
            <div className="space-y-6">
              
              {/* INTERACTIVE TRACKERS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 wood-panel p-5 rounded-lg">
                {/* Stamina Tracker */}
                <div className="bg-[#241103] p-3 rounded border border-orange-800 text-center flex flex-col justify-between">
                  <span className="text-xs font-bold text-parchment-300 flex items-center justify-center gap-1">
                    <Heart size={14} className="text-earth-500 fill-earth-500" /> 最大体力 (Stamina)
                  </span>
                  <div className="text-3xl font-extrabold font-serif my-2 text-earth-400">
                    {activeChar.stamina} / 20
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => updateActiveCharStat('stamina', activeChar.stamina - 1)}
                      className="px-3 py-1 bg-orange-950 rounded border border-orange-700 font-bold hover:bg-orange-800 text-sm"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateActiveCharStat('stamina', activeChar.stamina + 1)}
                      className="px-3 py-1 bg-orange-950 rounded border border-orange-700 font-bold hover:bg-orange-800 text-sm"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Durability Tracker */}
                <div className="bg-[#241103] p-3 rounded border border-orange-800 text-center flex flex-col justify-between">
                  <span className="text-xs font-bold text-parchment-300 flex items-center justify-center gap-1">
                    <Shield size={14} className="text-yellow-500" /> 工具耐久度 (Durability)
                  </span>
                  <div className="text-3xl font-extrabold font-serif my-2 text-yellow-500">
                    {activeChar.durability} / {activeChar.durabilityMax}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => updateActiveCharStat('durability', activeChar.durability - 1)}
                      className="px-3 py-1 bg-orange-950 rounded border border-orange-700 font-bold hover:bg-orange-800 text-sm"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateActiveCharStat('durability', activeChar.durability + 1)}
                      className="px-3 py-1 bg-orange-950 rounded border border-orange-700 font-bold hover:bg-orange-800 text-sm"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Harmony Tracker */}
                <div className="bg-[#241103] p-3 rounded border border-orange-800 text-center flex flex-col justify-between">
                  <span className="text-xs font-bold text-parchment-300 flex items-center justify-center gap-1">
                    <Feather size={14} className="text-parchment-300" /> 和谐值 (Harmony) &lt;H&gt;
                  </span>
                  <div className="text-3xl font-extrabold font-serif my-2 text-parchment-100">
                    {activeChar.harmony} / {activeChar.harmonyMax}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => updateActiveCharStat('harmony', activeChar.harmony - 1)}
                      className="px-3 py-1 bg-orange-950 rounded border border-orange-700 font-bold hover:bg-orange-800 text-sm"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateActiveCharStat('harmony', activeChar.harmony + 1)}
                      className="px-3 py-1 bg-orange-950 rounded border border-orange-700 font-bold hover:bg-orange-800 text-sm"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Harmony Max cap modifier */}
                <div className="bg-[#241103] p-3 rounded border border-orange-800 text-center flex flex-col justify-between text-xs">
                  <span className="font-bold text-parchment-300">⚙️ 调整和谐上限</span>
                  <p className="text-[10px] text-orange-400 my-1 leading-tight">休整期间，上限会根据旅途成功与否而波动。</p>
                  <div className="flex justify-center items-center space-x-3 my-1">
                    <button 
                      onClick={() => updateActiveCharStat('harmonyMax', activeChar.harmonyMax - 1)}
                      className="px-2 py-0.5 bg-orange-950 border border-orange-700 rounded font-bold hover:bg-orange-800"
                    >
                      -
                    </button>
                    <span className="font-bold font-serif text-sm">{activeChar.harmonyMax}</span>
                    <button 
                      onClick={() => updateActiveCharStat('harmonyMax', activeChar.harmonyMax + 1)}
                      className="px-2 py-0.5 bg-orange-950 border border-orange-700 rounded font-bold hover:bg-orange-800"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[9px] text-earth-400 font-bold mt-1">初始默认和谐上限为 3</div>
                </div>
              </div>

              {/* ACTION SHEET PREVIEW CARD */}
              <div className="flex justify-between items-center bg-[#241103] p-3 rounded border border-orange-800">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('roster')} 
                    className="btn-sketch rounded px-3 py-1.5 bg-orange-950 border-orange-700 text-xs text-parchment-200 flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> 返回列表
                  </button>
                  <button 
                    onClick={() => handleJsonExport(activeChar)} 
                    className="btn-sketch rounded px-3 py-1.5 bg-orange-950 border-orange-700 text-xs text-parchment-200 flex items-center gap-1"
                  >
                    <Download size={14} /> 导出 JSON
                  </button>
                  <button 
                    onClick={exportToPng} 
                    className="btn-sketch rounded px-3 py-1.5 bg-earth-700 border-earth-500 text-xs text-white flex items-center gap-1"
                  >
                    <Share2 size={14} /> 导出 PNG
                  </button>
                  <button 
                    onClick={handlePrint} 
                    className="btn-sketch rounded px-3 py-1.5 bg-orange-950 border-orange-700 text-xs text-parchment-200 flex items-center gap-1"
                  >
                    <Printer size={14} /> 打印本卡
                  </button>
                </div>
                <div className="text-xs text-orange-300 font-bold italic">
                  点击任意【属性风格】即可快捷模拟掷骰
                </div>
              </div>

              {/* INTERACTIVE SHEET WRAPPED IN ORANGE DOTTED MAT BACKGROUND - RESPONSIVE 2-PAGE OPEN BOOK */}
              <div 
                ref={cardPrintRef}
                className="wilder-dot-bg p-2 sm:p-4 md:p-8 rounded-lg shadow-rough-lg border-3 border-stone-950 flex flex-col gap-6 print:p-0 print:border-0 print:shadow-none"
              >
                
                {/* ==================== PAGE 1 OF THE CHARACTER SHEET ==================== */}
                <div className="bg-[#faf6ef] text-stone-950 p-6 rounded border-2 border-stone-900 shadow-rough space-y-6 relative overflow-hidden">
                  
                  {/* Decorative Header Border Line */}
                  <div className="flex justify-between items-center border-b-2 border-stone-900 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-stone-900">{getInkIcon('屠夫', 32)}</span>
                      <span className="font-serif font-black text-2xl tracking-wider text-sky-950">荒 野 盛 宴</span>
                      <span className="text-stone-900 rotate-180">{getInkIcon('屠夫', 32)}</span>
                    </div>
                    <span className="text-xs font-serif font-bold text-stone-600 border border-stone-400 px-2 py-0.5 rounded bg-white/50">PAGE 1 / 2</span>
                  </div>

                  {/* Character Name / Player / Specialty Table */}
                  <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-stone-900 divide-y-2 md:divide-y-0 md:divide-x-2 divide-stone-900 bg-white font-serif text-sm">
                    <div className="p-2">
                      <span className="block text-[10px] text-stone-500 font-bold uppercase">角色名</span>
                      <span className="font-extrabold text-lg text-stone-900">{activeChar.name}</span>
                    </div>
                    <div className="p-2">
                      <span className="block text-[10px] text-stone-500 font-bold uppercase">玩家名</span>
                      <span className="font-extrabold text-lg text-stone-900">{activeChar.isCustom ? '自定义食客' : '官方预设'}</span>
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
                        <svg className="w-full h-8 max-w-[150px] text-orange-850" viewBox="0 0 160 30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 15l4-4 4 4-4 4zM24 15l3-3 3 3-3 3z" strokeWidth="1.5" />
                          <path d="M136 15l3-3 3 3-3 3zM148 15l4-4 4 4-4 4z" strokeWidth="1.5" />
                          <text x="80" y="19" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="serif" stroke="none" fill="currentColor">风 格</text>
                        </svg>
                      </div>
                      <p className="text-[9px] text-orange-700 text-center leading-none mt-[-4px]">点击属性，在右侧骰池中快速装填风格骰</p>

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
                              className={`border-2 border-stone-900 rounded p-2 flex items-center justify-between cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-[#fc8419] text-white shadow-rough border-stone-950 scale-[1.02]' 
                                  : 'bg-white hover:bg-orange-100 text-stone-900'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <span className="font-serif font-extrabold text-sm block truncate">{st.label}</span>
                                <span className={`text-[8px] block truncate ${isSelected ? 'text-orange-100' : 'text-stone-500'}`}>{st.desc}</span>
                              </div>
                              
                              {/* Sturdy Interactive Styles Adjuster */}
                              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => updateActiveCharStyle(st.key, Math.max(1, val - 1))}
                                  className="w-5 h-5 bg-stone-100 hover:bg-stone-200 border border-stone-800 flex items-center justify-center font-bold text-stone-900 rounded-sm text-[10px]"
                                  title="减少风格值"
                                >
                                  -
                                </button>
                                <div className="border border-stone-800 px-2 py-0.5 bg-stone-50 font-mono font-black text-xs text-stone-900 rounded-sm min-w-[22px] text-center">
                                  {val}
                                </div>
                                <button 
                                  onClick={() => updateActiveCharStyle(st.key, Math.min(5, val + 1))}
                                  className="w-5 h-5 bg-stone-100 hover:bg-stone-200 border border-stone-800 flex items-center justify-center font-bold text-stone-900 rounded-sm text-[10px]"
                                  title="增加风格值"
                                >
                                  +
                                </button>
                              </div>
                              <div className="border-2 border-stone-900 px-3 py-1 bg-stone-100 font-mono font-black text-lg text-stone-900 rounded shadow-sm">
                                {val}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* States Tracker inside style box */}
                      <div className="border-t border-dashed border-orange-300 pt-3 space-y-2">
                        <span className="block text-[10px] font-black text-orange-900 uppercase">⚠️ 临时状态 / 异常标记</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { key: 'exposed', label: '暴露 (Exposed)' },
                            { key: 'hidden', label: '隐藏 (Hidden)' },
                            { key: 'disharmony', label: '不谐 (Disharmony)' }
                          ].map(st => (
                            <label key={st.key} className="flex items-center space-x-1.5 cursor-pointer bg-white/80 p-1 rounded border border-stone-300 text-stone-900">
                              <input 
                                type="checkbox" 
                                checked={activeChar.states[st.key as keyof typeof activeChar.states]} 
                                onChange={() => updateActiveCharStates(st.key as any)}
                                className="accent-orange-600 rounded"
                              />
                              <span className="scale-90 origin-left text-[10px] truncate">{st.label}</span>
                            </label>
                          ))}
                        </div>

                        {/* Injured trackers */}
                        <div className="pt-1.5 border-t border-dashed border-orange-200">
                          <span className="block text-[9px] font-black text-orange-900 mb-1">受伤等级 (Injured Ranks):</span>
                          <div className="grid grid-cols-3 gap-1">
                            {['injured1', 'injured2', 'injured3'].map((inj, index) => (
                              <label key={inj} className="flex items-center justify-center space-x-1 py-1 rounded border border-stone-300 bg-white text-[9px] font-bold text-stone-800 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={activeChar.states[inj as keyof typeof activeChar.states]} 
                                  onChange={() => updateActiveCharStates(inj as any)}
                                  className="accent-red-600 scale-90"
                                />
                                <span>受伤{index + 1}</span>
                              </label>
                            ))}
                          </div>
                        </div>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-2 border-stone-900 bg-white text-xs font-serif shadow-sm">
                        {['激励', '展示', '射击', '发声', '抓取', '打击', '手艺', '储存', '学习', '治愈', '搜索', '穿越'].map((sk, index) => {
                          const val = activeChar.skills[sk] || 0;
                          const isSelected = selectedRollSkill === sk;
                          return (
                            <div 
                              key={sk}
                              onClick={() => { setSelectedRollSkill(sk); setIsDiceDrawerOpen(true); showNotification(`已选择技能：[${sk}] (+${val})`, 'info'); }}
                              className={`p-2 flex items-center justify-between cursor-pointer transition-all ${
                                index < 9 ? 'border-b-2 border-stone-900' : 'border-b-2 border-stone-900 md:border-b-0'
                              } ${
                                index === 11 ? 'border-b-0' : ''
                              } ${
                                index % 3 !== 2 ? 'md:border-r-2 md:border-stone-900' : ''
                              } ${
                                isSelected ? 'bg-sky-50 font-extrabold text-sky-950' : 'hover:bg-stone-50 text-stone-900'
                              }`}
                            >
                              <span className={val > 0 ? 'text-sky-900 font-extrabold' : 'text-stone-700'}>{sk}</span>
                              
                              {/* Skill Value & Slashes checkbox rendering */}
                              <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center space-x-0.5 text-stone-700 bg-stone-50 border border-stone-300 px-1 rounded-sm">
                                  <span className="font-bold text-[9px] text-sky-900 pr-0.5">+{val}</span>
                                  <span className="font-mono text-xs select-none">⊕</span>
                                  {val >= 1 && <span className="font-mono text-xs font-black text-sky-900 select-none">/</span>}
                                  {val >= 2 && <span className="font-mono text-xs font-black text-sky-900 select-none">/</span>}
                                  {val >= 3 && <span className="font-mono text-xs font-black text-sky-900 select-none">/</span>}
                                </div>
                                
                                {/* Small adjustable buttons */}
                                <div className="flex flex-col -space-y-0.5">
                                  <button 
                                    onClick={() => updateActiveCharSkill(sk, Math.min(3, val + 1))}
                                    className="w-3.5 h-3.5 bg-stone-50 hover:bg-stone-200 border border-stone-400 flex items-center justify-center text-[8px] text-stone-700 rounded-sm font-bold"
                                    title="增加技能值"
                                  >
                                    ▲
                                  </button>
                                  <button 
                                    onClick={() => updateActiveCharSkill(sk, Math.max(0, val - 1))}
                                    className="w-3.5 h-3.5 bg-stone-50 hover:bg-stone-200 border border-stone-400 flex items-center justify-center text-[8px] text-stone-700 rounded-sm font-bold"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-stone-900">
                    
                    {/* Left: Tool and Techniques Box */}
                    <div className="border-3 border-stone-900 bg-white rounded p-4 space-y-3 relative shadow-sm">
                      <div className="absolute top-1 right-2 flex space-x-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#fc8419]"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#fc8419]"></span>
                      </div>
                      
                      <h4 className="font-serif font-black text-md text-stone-900 border-b-2 border-stone-900 pb-1.5 flex items-center gap-1">
                        ❖ 工具与战技 ❖
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-stone-50 p-2 border border-stone-300 rounded">
                          <span className="block text-[9px] text-stone-500 font-bold uppercase">装备工具</span>
                          <span className="font-bold text-stone-900 text-sm">{activeChar.tool}</span>
                        </div>
                        <div className="bg-stone-50 p-2 border border-stone-300 rounded flex justify-between items-center">
                          <div>
                            <span className="block text-[9px] text-stone-500 font-bold uppercase">当前耐久</span>
                            <span className="font-bold text-stone-900 text-sm">{activeChar.durability}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[9px] text-stone-500 font-bold uppercase">最大耐久</span>
                            <span className="font-bold text-stone-900 text-sm">{activeChar.durabilityMax}</span>
                          </div>
                        </div>
                        <div className="col-span-2 bg-stone-50 p-2 border border-stone-300 rounded text-[11px]">
                          <span className="font-bold text-stone-900">射程: </span>
                          <span className="font-mono">1 (打击)</span> | 损坏时：射程:1(打击)。该身体部位造成伤害减半。
                        </div>
                      </div>

                      {/* Tool specific Techniques */}
                      <div className="pt-2 border-t border-stone-200 space-y-2">
                        <span className="block text-[10px] font-bold text-stone-500 uppercase">武器流派特性:</span>
                        {activeChar.traits.slice(0, 2).map(tName => {
                          const foundTech = TOOLS.flatMap(tl => tl.techniques).find(tk => tk.name === tName);
                          return (
                            <div key={tName} className="text-xs">
                              <span className="font-bold text-[#fc8419]">{tName}</span> <span className="text-[9px] bg-stone-100 border border-stone-300 px-1 rounded">{foundTech?.cost || '被动'}</span>
                              <p className="text-[10px] text-stone-600 leading-tight mt-0.5">{foundTech?.effect}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Green Traits Box */}
                    <div className="border-3 border-emerald-800 bg-emerald-50/10 rounded p-4 space-y-3 shadow-sm">
                      <h4 className="font-serif font-black text-md text-emerald-950 border-b-2 border-emerald-800 pb-1.5">
                        ❖ 特性 (Traits) ❖
                      </h4>

                      <div className="space-y-3 text-xs leading-tight">
                        <div className="border-b border-dashed border-emerald-300 pb-1.5">
                          <span className="font-extrabold text-emerald-900">毅力。</span><span className="text-[9px] bg-emerald-900 text-white px-1 rounded font-mono">1次成功</span>
                          <p className="text-[10px] text-stone-700 mt-0.5">将 行动评级 [A] 增加 1。</p>
                        </div>
                        <div className="border-b border-dashed border-emerald-300 pb-1.5">
                          <span className="font-extrabold text-emerald-900">洞察。</span><span className="text-[9px] bg-emerald-900 text-white px-1 rounded font-mono">1次成功</span>
                          <p className="text-[10px] text-stone-700 mt-0.5">确立一个关于当前情境的细节。</p>
                        </div>

                        {/* Linage starting traits */}
                        {activeChar.traits.slice(2).map(tName => {
                          // Search inside databases
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
                            <div key={tName}>
                              <span className="font-extrabold text-amber-900">{tName}。</span>
                              <span className="text-[9px] bg-amber-900 text-white px-1 rounded font-mono">{trCost}</span>
                              <p className="text-[10px] text-stone-700 mt-0.5">{trEffect}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* ==================== PAGE 2 OF THE CHARACTER SHEET ==================== */}
                <div className="bg-[#faf6ef] text-stone-950 p-6 rounded border-2 border-stone-900 shadow-rough space-y-6 relative overflow-hidden">
                  
                  {/* Decorative Page 2 Header */}
                  <div className="flex justify-between items-center border-b-2 border-stone-900 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-stone-900">{getInkIcon('园丁', 32)}</span>
                      <span className="font-serif font-black text-2xl tracking-wider text-sky-950">猎 群 契 约 · 背景与同伴</span>
                      <span className="text-stone-900 rotate-180">{getInkIcon('园丁', 32)}</span>
                    </div>
                    <span className="text-xs font-serif font-bold text-stone-600 border border-stone-400 px-2 py-0.5 rounded bg-white/50">PAGE 2 / 2</span>
                  </div>

                  {/* Top half: Identity grid and Sketched portrait side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left details column (Col Span 7) */}
                    <div className="md:col-span-7 space-y-4">
                      {/* Identity boxes */}
                      <div className="border-2 border-stone-900 bg-white rounded divide-y-2 divide-stone-900 text-xs">
                        <div className="p-3">
                          <span className="block text-[9px] text-stone-500 font-bold uppercase mb-1">你现在的样子</span>
                          <span className="font-serif font-black text-lg text-stone-900">{activeChar.adjectives[0]}</span>
                        </div>
                        <div className="p-3">
                          <span className="block text-[9px] text-stone-500 font-bold uppercase mb-1">你想要成为的样子</span>
                          <span className="font-serif font-black text-lg text-sky-900">{activeChar.adjectives[1]}</span>
                        </div>
                        <div className="p-3 bg-amber-50/30">
                          <span className="block text-[9px] text-amber-700 font-bold uppercase mb-1">密切关系怪物 (Companion)</span>
                          <span className="font-serif font-black text-sm text-amber-950">{activeChar.companion.name}</span>
                          <p className="text-[11px] text-stone-600 leading-snug mt-1 italic">"{activeChar.companion.description}"</p>
                        </div>
                      </div>

                      {/* Local specialties & Spices */}
                      <div className="grid grid-cols-2 border-2 border-stone-900 divide-x-2 divide-stone-900 bg-white text-xs">
                        <div className="p-3">
                          <span className="block text-[9px] text-stone-500 font-bold uppercase mb-1">家乡特产 (Specialty)</span>
                          <span className="font-bold text-stone-900 text-sm">
                            {activeChar.backgroundMeals.upbringing.meal.split('&')[0]?.trim() || '黑麦酸面包'}
                          </span>
                        </div>
                        <div className="p-3 bg-orange-50/20">
                          <span className="block text-[9px] text-orange-850 font-bold uppercase mb-1">家乡香料 (Spice)</span>
                          <span className="font-bold text-orange-950 text-sm">
                            {activeChar.backgroundMeals.upbringing.meal.split('&')[1]?.trim() || '方舟乌木胡椒'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Portrait Column (Col Span 5) */}
                    <div className="md:col-span-5 border-2 border-stone-900 rounded bg-white p-4 flex flex-col items-center justify-center min-h-[220px] shadow-sm relative">
                      <div className="absolute top-2 left-2 text-[9px] font-bold text-stone-400 font-serif">SKETCH</div>
                      {getCharacterPortrait(activeChar.name, 190, 'text-stone-900')}
                      <span className="text-[10px] text-stone-400 font-serif mt-2 border-t border-stone-200 pt-1 w-full text-center">
                        - 猎人 {activeChar.name} 炭笔墨线肖像 -
                      </span>
                    </div>

                  </div>

                  {/* BOTTOM HALF OF PAGE 2: BACKGROUND STORIES & LOGS */}
                  <div className="border-t-2 border-stone-900 pt-4 space-y-4">
                    <h3 className="text-center font-serif font-black text-md tracking-wider text-stone-900">
                      ❖ “三道菜式”的背景故事 (The Three Courses Background) ❖
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif leading-relaxed">
                      <div className="border border-stone-300 rounded p-3 bg-white/70 shadow-sm">
                        <span className="font-black text-stone-900 block border-b border-stone-300 pb-1 mb-1">🍰 第一道菜：成长背景 (Upbringing)</span>
                        <span className="font-bold text-orange-900 block text-[11px] mb-1">童年餐食：{activeChar.backgroundMeals.upbringing.meal}</span>
                        <p className="text-stone-700 italic">"{activeChar.backgroundMeals.upbringing.text}"</p>
                      </div>

                      <div className="border border-stone-300 rounded p-3 bg-white/70 shadow-sm">
                        <span className="font-black text-stone-900 block border-b border-stone-300 pb-1 mb-1">🥣 第二道菜：入伙动机 (Motivation)</span>
                        <span className="font-bold text-sky-900 block text-[11px] mb-1">怪物之餐：{activeChar.backgroundMeals.motivation.meal}</span>
                        <p className="text-stone-700 italic">"{activeChar.backgroundMeals.motivation.text}"</p>
                      </div>

                      <div className="border border-stone-300 rounded p-3 bg-white/70 shadow-sm">
                        <span className="font-black text-stone-900 block border-b border-stone-300 pb-1 mb-1">🥧 第三道菜：一生雄心 (Ambition)</span>
                        <span className="font-bold text-amber-900 block text-[11px] mb-1">梦想终极：{activeChar.backgroundMeals.ambition.meal}</span>
                        <p className="text-stone-700 italic">"{activeChar.backgroundMeals.ambition.text}"</p>
                      </div>
                    </div>

                    {/* Bonds and notes log */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                      <div className="md:col-span-4 border border-stone-300 rounded p-3 bg-white text-xs">
                        <span className="font-bold block border-b border-stone-200 pb-1 mb-1">🤝 盟约羁绊 (Bonds)</span>
                        <p className="text-stone-600 leading-normal italic">"{activeChar.bond}"</p>
                      </div>
                      <div className="md:col-span-8">
                        <textarea 
                          value={activeChar.notes || ''}
                          onChange={(e) => updateActiveCharStat('notes', e.target.value)}
                          placeholder="在此记录你本次冒险中狩猎到的怪物身体部位、获取的食材、或是休整期间的烹饪灵感与笔记..."
                          className="w-full bg-white border-2 border-stone-900 rounded p-3 text-xs text-stone-950 focus:outline-none focus:bg-stone-50 h-[84px] resize-none"
                        />
                      </div>
                    </div>
                  </div>

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
        {activeChar && activeTab === 'play' && (
          <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 print:hidden">
            {/* Dice Roller Toggle Button */}
            <button
              onClick={() => { setIsDiceDrawerOpen(!isDiceDrawerOpen); setIsManualDrawerOpen(false); }}
              className="w-14 h-14 bg-earth-700 border-3 border-stone-950 hover:bg-earth-600 rounded-full flex flex-col items-center justify-center text-white shadow-rough-md transition-all active:translate-x-0.5 active:translate-y-0.5 group relative"
            >
              <Dice5 size={22} className="group-hover:rotate-45 transition-transform" />
              <span className="text-[9px] font-bold mt-0.5 select-none">进行检定</span>
              <span className="absolute right-16 bg-stone-950 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-stone-800">
                打开掷骰检定面板
              </span>
            </button>

            {/* Manual Toggle Button */}
            <button
              onClick={() => { setIsManualDrawerOpen(!isManualDrawerOpen); setIsDiceDrawerOpen(false); }}
              className="w-14 h-14 bg-orange-700 border-3 border-stone-950 hover:bg-orange-600 rounded-full flex flex-col items-center justify-center text-white shadow-rough-md transition-all active:translate-x-0.5 active:translate-y-0.5 group relative"
            >
              <BookIcon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold mt-0.5 select-none">参考手册</span>
              <span className="absolute right-16 bg-stone-950 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-stone-800">
                打开附录规则手册
              </span>
            </button>
          </div>
        )}

      </main>

      {/* Slide-out Dice Roller Drawer */}
      {activeChar && (
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#150a02] border-l-3 border-stone-950 p-6 shadow-rough-lg overflow-y-auto z-40 transition-transform duration-300 transform print:hidden ${
          isDiceDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex justify-between items-center border-b border-orange-900 pb-3 mb-4">
            <h3 className="font-serif font-bold text-lg text-parchment-200 flex items-center gap-1.5">
              <Dice5 className="text-orange-400" /> 荒野掷骰检定
            </h3>
            <button 
              onClick={() => setIsDiceDrawerOpen(false)}
              className="text-orange-400 hover:text-white font-bold text-lg border border-orange-800 rounded-full w-6 h-6 flex items-center justify-center bg-stone-950/30"
            >
              ×
            </button>
          </div>

          <p className="text-[11px] text-orange-300 leading-relaxed mb-4">
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
              <div className="space-y-4 bg-orange-950/40 p-4 rounded border border-orange-900 text-xs">
                {/* Style selection */}
                <div>
                  <label className="block text-[10px] text-orange-300 font-bold mb-1.5 uppercase">1. 选择行动风格 ( d6 风格骰 ):</label>
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
                              ? 'bg-earth-600 border-earth-400 text-white font-extrabold shadow scale-105' 
                              : 'bg-[#150a02] border-orange-900 text-orange-300 hover:border-orange-855'
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
                  <label className="block text-[10px] text-orange-300 font-bold mb-1.5 uppercase">2. 选择配套技能 ( +1 等级加成 ):</label>
                  <select
                    value={selectedRollSkill}
                    onChange={(e) => setSelectedRollSkill(e.target.value)}
                    className="w-full bg-[#150a02] border-2 border-orange-900 text-parchment-200 rounded px-2.5 py-2 text-xs focus:outline-none focus:border-earth-500"
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
                  <label className="block text-[10px] text-orange-300 font-bold mb-1.5 uppercase">3. 选择行动骰与心境 (Action Die & Mindset):</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => { setActionDieMode('focus'); showNotification('心境已设为：集中精神 (d8)', 'success'); }}
                      className={`p-2 rounded text-left border transition-all ${
                        actionDieMode === 'focus'
                          ? 'bg-earth-900 border-earth-500 text-white font-extrabold shadow scale-102'
                          : 'bg-[#150a02] border-orange-900 text-orange-400 hover:border-orange-850'
                      }`}
                    >
                      <div className="font-bold font-serif text-xs">集中精神 (Focus)</div>
                      <p className="text-[9px] text-stone-400 leading-snug mt-0.5">使用 1d8 行动骰。获得稳定、可靠、安全的判定效果。</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActionDieMode('wild'); showNotification('心境已设为：释放野性 (d20, 风格骰-1)', 'success'); }}
                      className={`p-2 rounded text-left border transition-all ${
                        actionDieMode === 'wild'
                          ? 'bg-red-950 border-red-500 text-white font-extrabold shadow scale-102'
                          : 'bg-[#150a02] border-orange-900 text-orange-400 hover:border-orange-850'
                      }`}
                    >
                      <div className="font-bold font-serif text-xs text-red-400">释放野性 (Go Wild)</div>
                      <p className="text-[9px] text-stone-400 leading-snug mt-0.5">使用 1d20 行动骰。风格骰 d6 数量将扣减 1（代表丧失理智）。</p>
                    </button>
                  </div>
                </div>

                {/* Confirm combination message */}
                <div className="border-t border-orange-950 pt-3 text-center">
                  <div className="text-parchment-200 font-serif text-sm font-bold">
                    当前备战：<span className="text-earth-400 font-black">{selectedRollStyle}</span> + <span className="text-yellow-500 font-black">{selectedRollSkill}</span>
                  </div>
                  <div className="text-[10px] text-orange-400 mt-1">
                    投掷：{styleDiceCount}d6 (风格) + {actionDieMode === 'focus' ? '1d8' : '1d20'} (行动) • +{currentSkillVal} 技能加值
                  </div>
                  
                  <button
                    onClick={() => handleRollDice(selectedRollStyle, styleDiceCount, selectedRollSkill, currentSkillVal, actionDieMode)}
                    className="w-full btn-sketch rounded mt-3 py-2.5 bg-earth-600 border-earth-400 text-white font-serif font-black text-sm flex items-center justify-center gap-1.5"
                  >
                    进行掷骰检定
                  </button>
                </div>
              </div>
            );
          })()}

          {/* RESULTS RENDERING */}
          {diceRoll && (
            <div className="mt-4 space-y-4 pt-4 border-t border-orange-900">
              <div className="space-y-2">
                <span className="block text-xs font-bold text-parchment-300">
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
                            ? 'bg-earth-600 border-earth-300 text-white shadow-md scale-105' 
                            : 'bg-[#150a02] border-orange-900 text-parchment-400'
                        }`}
                        title="点击应用或撤销技能 +1 修正"
                      >
                        <span className="text-lg font-extrabold font-serif">{d.adjustedValue}</span>
                        {d.active && <span className="text-[8px] bg-yellow-500 text-amber-950 font-bold px-1 rounded scale-75 mt-[-3px]">+1</span>}
                      </div>
                    ))}
                  </div>

                  {/* Divider spacer */}
                  <span className="text-orange-900 font-bold mx-1">＋</span>

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
              <div className="bg-[#150a02] p-4 rounded-lg border border-orange-900 text-center space-y-2 shadow-inner text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border-r border-orange-900">
                    <span className="text-[10px] text-orange-400 block uppercase font-bold">成功次数</span>
                    <span className="text-3xl font-black font-serif text-earth-400">
                      {diceRoll.successes}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-orange-400 block uppercase font-bold">行动评级 [A]</span>
                    <span className="text-3xl font-black font-serif text-yellow-500">
                      {diceRoll.actionRating}
                    </span>
                  </div>
                </div>

                <div className="text-xs pt-2 border-t border-orange-900 leading-tight">
                  {diceRoll.successes > 0 ? (
                    <span className="text-orange-400 font-bold">
                      检定成功！最高骰为 [A]={diceRoll.actionRating}，造成对应的结算效果！
                    </span>
                  ) : (
                    <span className="text-earth-400 font-bold">
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
      {activeChar && (
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-amber-950 border-l-3 border-stone-950 p-6 shadow-rough-lg overflow-y-auto z-40 transition-transform duration-300 transform print:hidden ${
          isManualDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex justify-between items-center border-b border-orange-900 pb-3 mb-4">
            <h3 className="font-serif font-bold text-lg text-parchment-200 flex items-center gap-1.5">
              <BookIcon size={18} className="text-orange-400" /> 附录参考手册
            </h3>
            <button 
              onClick={() => setIsManualDrawerOpen(false)}
              className="text-orange-400 hover:text-white font-bold text-lg border border-orange-800 rounded-full w-6 h-6 flex items-center justify-center bg-stone-950/30"
            >
              ×
            </button>
          </div>

          {/* Tab Selection buttons */}
          <div className="grid grid-cols-4 gap-1">
            {[
              { key: 'd', label: 'D：速查' },
              { key: 'a', label: 'A：特性' },
              { key: 'b', label: 'B：战技' },
              { key: 'c', label: 'C：状态' }
            ].map(tb => (
              <button
                key={tb.key}
                type="button"
                onClick={() => { setActiveAppendixTab(tb.key as any); setAppendixSearchQuery(''); }}
                className={`py-1.5 text-center text-xs font-bold transition-all border rounded ${
                  activeAppendixTab === tb.key 
                    ? 'bg-earth-600 border-earth-400 text-white shadow' 
                    : 'bg-[#241103] border-orange-800 text-parchment-300 hover:bg-[#150a02]'
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {/* Search Input bar */}
          <div className="flex items-center bg-[#150a02] border border-orange-900 rounded px-2.5 py-1.5 mt-3">
            <Search size={14} className="text-orange-400 mr-2" />
            <input 
              type="text"
              value={appendixSearchQuery}
              onChange={(e) => setAppendixSearchQuery(e.target.value)}
              placeholder="搜索当前手册内容..."
              className="bg-transparent focus:outline-none text-xs text-parchment-200 placeholder:text-orange-800 w-full"
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
                      ? 'bg-earth-800 border-earth-500 text-white font-bold' 
                      : 'bg-[#150a02] border-orange-900 text-orange-300'
                  }`}
                >
                  {wp === 'all' ? '全部' : wp === '通用' ? '通用' : wp}
                </button>
              ))}
            </div>
          )}

          {/* Interactive Lists */}
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto space-y-3 pr-1 text-xs mt-4">
            
            {/* Appendix A: Traits */}
            {activeAppendixTab === 'a' && (
              APPENDIX_TRAITS.filter(tr => 
                tr.name.includes(appendixSearchQuery) || 
                tr.effect.includes(appendixSearchQuery)
              ).map(tr => (
                <div key={tr.name} className="bg-[#241103] border border-orange-950 p-2.5 rounded hover:border-orange-800">
                  <div className="flex justify-between items-center font-bold text-parchment-200">
                    <span className="font-serif">{tr.name}</span>
                    <span className="text-[9px] bg-[#150a02] text-earth-300 px-1.5 rounded">{tr.cost}</span>
                  </div>
                  <p className="text-orange-300 text-[11px] mt-1 leading-tight">{tr.effect}</p>
                </div>
              ))
            )}

            {/* Appendix B: Techniques */}
            {activeAppendixTab === 'b' && (
              APPENDIX_TECHNIQUES.filter(tk => {
                const matchesSearch = tk.name.includes(appendixSearchQuery) || tk.effect.includes(appendixSearchQuery);
                if (appendixFilterWeapon === 'all') return matchesSearch;
                if (appendixFilterWeapon === '通用') return tk.weapon.includes('/') && matchesSearch;
                return tk.weapon === appendixFilterWeapon && matchesSearch;
              }).map(tk => (
                <div key={tk.name} className="bg-[#241103] border border-orange-950 p-2.5 rounded hover:border-orange-800">
                  <div className="flex justify-between items-center font-bold text-parchment-200">
                    <span className="font-serif">{tk.name}</span>
                    <span className="text-[9px] bg-[#150a02] text-earth-300 px-1.5 rounded">{tk.cost}</span>
                  </div>
                  <div className="flex space-x-2 text-[9px] text-orange-400 mt-0.5">
                    <span>🔧 {tk.weapon}</span>
                    <span>•</span>
                    <span>⭐ {tk.rank}</span>
                  </div>
                  <p className="text-orange-300 text-[11px] mt-1.5 leading-tight">{tk.effect}</p>
                </div>
              ))
            )}

            {/* Appendix C: States */}
            {activeAppendixTab === 'c' && (
              APPENDIX_STATES.filter(st => 
                st.name.includes(appendixSearchQuery) || 
                st.effect.includes(appendixSearchQuery)
              ).map(st => (
                <div key={st.name} className="bg-[#241103] border border-orange-950 p-2.5 rounded hover:border-orange-800">
                  <div className="font-serif font-bold text-parchment-200">{st.name}</div>
                  <p className="text-orange-300 text-[11px] mt-1 leading-tight"><span className="font-bold text-earth-400">效果:</span> {st.effect}</p>
                  <p className="text-[10px] text-orange-400 mt-1"><span className="font-bold text-parchment-300">结束条件:</span> {st.endCondition}</p>
                </div>
              ))
            )}

            {/* Appendix D: Quick Reference Actions */}
            {activeAppendixTab === 'd' && (
              <div className="space-y-4">
                {/* Combat */}
                {(!appendixSearchQuery || '战斗行动'.includes(appendixSearchQuery)) && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] bg-[#150a02] px-2 py-0.5 text-parchment-300 font-bold border-l-2 border-earth-500">⚔️ 狩猎行动 (Combat Actions)</div>
                    {APPENDIX_ACTIONS.filter(act => act.type === 'combat' && (act.name.includes(appendixSearchQuery) || act.effect.includes(appendixSearchQuery))).map(act => (
                      <div key={act.name} className="bg-[#241103]/50 p-2 rounded border border-orange-950">
                        <div className="flex justify-between font-bold text-parchment-200 text-[11px]">
                          <span>{act.name}</span>
                          <span className="text-[9px] text-orange-400 font-mono">{act.cost}</span>
                        </div>
                        <p className="text-orange-400 text-[10px] mt-0.5 leading-snug">{act.effect}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feast */}
                {(!appendixSearchQuery || '盛宴问题'.includes(appendixSearchQuery)) && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] bg-[#150a02] px-2 py-0.5 text-parchment-300 font-bold border-l-2 border-earth-500">🍲 盛宴问题 (Feast Questions)</div>
                    {APPENDIX_ACTIONS.filter(act => act.type === 'feast' && (act.name.includes(appendixSearchQuery) || act.effect.includes(appendixSearchQuery))).map(act => (
                      <div key={act.name} className="bg-[#241103]/50 p-2 rounded border border-orange-950">
                        <p className="text-parchment-200 text-[11px] leading-tight font-serif">{act.effect}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rest */}
                {(!appendixSearchQuery || '休整行动'.includes(appendixSearchQuery)) && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] bg-[#150a02] px-2 py-0.5 text-parchment-300 font-bold border-l-2 border-earth-500">🏕️ 休整行动 (Rest Actions)</div>
                    {APPENDIX_ACTIONS.filter(act => act.type === 'rest' && (act.name.includes(appendixSearchQuery) || act.effect.includes(appendixSearchQuery))).map(act => (
                      <div key={act.name} className="bg-[#241103]/50 p-2 rounded border border-orange-950">
                        <div className="flex justify-between font-bold text-parchment-200 text-[11px]">
                          <span>{act.name}</span>
                          <span className="text-[9px] text-orange-400 font-mono">{act.cost}</span>
                        </div>
                        <p className="text-orange-400 text-[10px] mt-0.5 leading-snug">{act.effect}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
          </div>
        )}

      {/* FOOTER */}
      <footer className="text-center py-8 mt-12 border-t border-orange-950 text-xs text-orange-400">
        <p>© 2026 荒野盛宴 TTRPG 电子人物卡辅助工具. All Rules and Concepts belong to KC Shi and respective authors.</p>
        <p className="mt-1">Based on "Wilderfeast" core rules. Craft with Love & Wilderness.</p>
      </footer>
    </div>
  );
}
