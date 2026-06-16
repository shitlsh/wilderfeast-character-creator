import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  BookOpen, RotateCcw, Dice5, Download, Upload, Plus, Trash2, 
  Heart, Shield, Printer, ArrowLeft, Shuffle, 
  Users, Share2, Compass, Feather
} from 'lucide-react';
import { 
  TOOLS, LINEAGES, UPBRINGINGS, MOTIVATIONS, AMBITIONS, PRE_GENS, UNIVERSAL_TRAITS,
  Tool, Lineage, Trait, Technique
} from './data';

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
  { value: '🎣', label: '渔夫' },
  { value: '🥐', label: '面包师' },
  { value: '🍖', label: '屠夫' },
  { value: '🌶️', label: '调味者' },
  { value: '🦫', label: '储藏者' },
  { value: '🦎', label: '变形者' },
  { value: '🐺', label: '狼' },
  { value: '🦅', label: '鹰' },
  { value: '🐻', label: '熊' },
  { value: '🦀', label: '蟹' },
  { value: '🐙', label: '触手' },
  { value: '🌲', label: '森林' }
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
  } | null>(null);

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
  const [wizAvatarValue, setWizAvatarValue] = useState('🎣');

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
        avatarValue: pg.name === '普莱兹' ? '🎣' : 
                     pg.name === '巴格' ? '🦫' : 
                     pg.name === '娜特·辛' ? '🥐' : 
                     pg.name === '泰伦' ? '🍖' : 
                     pg.name === '莲恩' ? '🌶️' : '🦎',
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
        avatarValue: pg.name === '普莱兹' ? '🎣' : 
                     pg.name === '巴格' ? '🦫' : 
                     pg.name === '娜特·辛' ? '🥐' : 
                     pg.name === '泰伦' ? '🍖' : 
                     pg.name === '莲恩' ? '🌶️' : '🦎'
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
        backgroundColor: '#142b1f', // dark forest backdrop
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
  const handleRollDice = (styleName: string, styleCount: number, skillName: string, skillBonus: number) => {
    // Generate fresh d6 values
    const diceList = Array.from({ length: styleCount }, () => {
      const val = Math.floor(Math.random() * 6) + 1;
      return { value: val, active: false, adjustedValue: val };
    });

    setDiceRoll({
      styleName,
      skillName,
      styleCount,
      skillBonus,
      rolled: true,
      dice: diceList,
      successes: 0,
      actionRating: 0
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
    // Action Rating [A] is the highest adjusted dice value
    const highestVal = nextDice.reduce((max, d) => d.adjustedValue > max ? d.adjustedValue : max, 0);

    setDiceRoll({
      ...diceRoll,
      dice: nextDice,
      successes,
      actionRating: successes > 0 ? highestVal : 0
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-center pb-6 mb-6 border-b-2 border-forest-800">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <span className="text-4xl">🍖</span>
          <div>
            <h1 className="text-3xl font-extrabold text-parchment-200 tracking-wide font-serif">
              荒野盛宴电子人物卡
            </h1>
            <p className="text-xs text-forest-300">
              Wilderfeast Character Sheet & Creator Wizard — 纯前端本地免登版
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => { setActiveTab('roster'); setDiceRoll(null); }}
            className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${activeTab === 'roster' ? 'bg-earth-600 border-earth-400 text-white' : 'bg-forest-900 border-forest-600 text-parchment-200'}`}
          >
            <Users size={16} /> 猎人群罗盘 (猎人列表)
          </button>
          <button 
            onClick={() => { setActiveTab('create'); setWizardStep(1); setDiceRoll(null); }}
            className={`btn-sketch rounded px-4 py-2 flex items-center gap-1 ${activeTab === 'create' ? 'bg-earth-600 border-earth-400 text-white' : 'bg-forest-900 border-forest-600 text-parchment-200'}`}
          >
            <Plus size={16} /> 新建荒野角色
          </button>
        </div>
      </header>

      {/* NOTIFICATIONS */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-md shadow-rough border-3 text-sm flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-forest-600 border-forest-400 text-white' : 
          notification.type === 'error' ? 'bg-earth-700 border-earth-500 text-white' : 
          'bg-yellow-850 border-yellow-500 text-yellow-100'
        }`}>
          <span>{notification.type === 'success' ? '✨' : notification.type === 'error' ? '💥' : '🔍'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* MAIN LAYOUT SPLIT */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT/MAIN AREA */}
        <div className="lg:col-span-8">
          
          {/* TAB 1: ROSTER & SELECTION */}
          {activeTab === 'roster' && (
            <div className="wood-panel p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-parchment-200 flex items-center gap-2">
                  <Compass className="text-earth-400" /> 猎群契约 (我的猎人列表)
                </h2>
                
                <div className="relative">
                  <label className="btn-sketch rounded px-3 py-1.5 bg-forest-800 border-forest-600 text-parchment-200 flex items-center gap-1 cursor-pointer text-xs">
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
                        : 'bg-forest-900 border-forest-700 text-parchment-200'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-parchment-300 flex items-center justify-center bg-forest-850 overflow-hidden flex-shrink-0">
                      {char.avatarType === 'emoji' ? (
                        <span className="text-3xl">{char.avatarValue}</span>
                      ) : (
                        <img src={char.avatarValue} alt="avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-serif text-lg truncate">{char.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${char.isCustom ? 'bg-earth-600 text-white' : 'bg-forest-700 text-forest-200'}`}>
                          {char.isCustom ? '自建' : '官方预设'}
                        </span>
                      </div>
                      <p className="text-xs text-forest-300 truncate">
                        {char.adjectives.join(' / ')} • {char.specialty}
                      </p>
                      <p className="text-xs text-parchment-300 font-mono mt-1 flex items-center gap-1">
                        ⚔️ {char.tool} | ❤️ 体力: {char.stamina}/20 | 🤝 和谐: {char.harmony}/{char.harmonyMax}
                      </p>
                    </div>
                    {char.isCustom && (
                      <button 
                        onClick={(e) => deleteCharacter(char.id, e)}
                        className="text-forest-400 hover:text-earth-400 p-2"
                        title="删除角色"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <div 
                  onClick={() => { setActiveTab('create'); setWizardStep(1); }}
                  className="border-3 border-dashed border-forest-600 p-6 rounded-md cursor-pointer transition-all hover:bg-forest-900 flex flex-col items-center justify-center text-forest-300"
                >
                  <Plus size={32} className="mb-2" />
                  <span className="font-bold">契约新猎人</span>
                  <span className="text-xs mt-1 text-forest-400">开始分步向导，定制属于你的荒野食客</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WIZARD CHARACTER CREATOR */}
          {activeTab === 'create' && (
            <div className="wood-panel p-6 rounded-lg text-parchment-100">
              {/* Step bar indicator */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-forest-800">
                <span className="font-serif font-bold text-xl text-parchment-200">
                  🍖 创建荒野食客 ({wizardStep}/3 步)
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3].map(s => (
                    <div 
                      key={s} 
                      className={`h-2 w-10 rounded ${s <= wizardStep ? 'bg-earth-500' : 'bg-forest-800'}`} 
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
                        <label className="block text-xs font-bold mb-1 text-forest-300">姓名 (Name)</label>
                        <input 
                          type="text" 
                          value={wizName} 
                          onChange={(e) => setWizName(e.target.value)}
                          placeholder="例如: 普莱兹, 巴格, 或是你自己的称呼"
                          className="w-full bg-forest-900 border-2 border-forest-700 rounded px-3 py-2 text-parchment-100 focus:outline-none focus:border-earth-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold mb-1 text-forest-300">目前的你 (形容词)</label>
                          <select 
                            value={wizAdjectiveCurrent} 
                            onChange={(e) => setWizAdjectiveCurrent(e.target.value)}
                            className="w-full bg-forest-900 border-2 border-forest-700 rounded px-2 py-2 text-parchment-100 focus:outline-none"
                          >
                            {wizTool.adjectives.map(adj => (
                              <option key={adj} value={adj}>{adj}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1 text-forest-300">向往却难成为的你</label>
                          <select 
                            value={wizAdjectiveAspiring} 
                            onChange={(e) => setWizAdjectiveAspiring(e.target.value)}
                            className="w-full bg-forest-900 border-2 border-forest-700 rounded px-2 py-2 text-parchment-100 focus:outline-none"
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
                    <p className="text-xs text-forest-300 mb-4">
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
                              : 'bg-forest-900 border-forest-800 text-parchment-300 hover:border-forest-600'
                          }`}
                        >
                          <div className="font-bold font-serif text-md">{t.name}</div>
                          <div className="text-[10px] text-forest-400 mt-1 truncate">{t.styles.name}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-forest-900 p-4 rounded border border-forest-800 mt-4">
                      <h4 className="font-bold text-sm text-parchment-200">⚔️ {wizTool.name} 的机制细节:</h4>
                      <p className="text-xs text-forest-300 mt-1 leading-relaxed">{wizTool.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-forest-800">
                        <div>
                          <span className="block text-xs font-bold text-parchment-200 mb-1">📐 风格分配选择：</span>
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
                          <span className="block text-xs font-bold text-parchment-200 mb-1">🛡️ 招牌战技（自动获得）：</span>
                          {wizTool.techniques.filter(tk => tk.type === 'signature').map(tk => (
                            <div key={tk.name} className="text-xs">
                              <span className="font-bold text-earth-400">{tk.name}</span> <span className="text-[10px] bg-forest-800 px-1 rounded">{tk.cost}</span>
                              <p className="text-[10px] text-forest-400 mt-0.5">{tk.effect}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="block text-xs font-bold text-parchment-200 mb-2">🎁 自选次要初始战技（从下列 3 选 1）：</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {wizTool.techniques.filter(tk => tk.type === 'optional').map(tk => (
                            <div 
                              key={tk.name}
                              onClick={() => setWizSecondaryTech(tk)}
                              className={`border-2 p-2.5 rounded cursor-pointer transition-all text-xs ${
                                wizSecondaryTech?.name === tk.name 
                                  ? 'bg-earth-950 border-earth-600 text-white' 
                                  : 'bg-forest-850 border-forest-800 text-parchment-300'
                              }`}
                            >
                              <div className="flex justify-between font-bold">
                                <span>{tk.name}</span>
                                <span className="text-[9px] bg-forest-800 px-1 rounded text-earth-300">{tk.cost}</span>
                              </div>
                              <p className="text-[10px] text-forest-400 mt-1 line-clamp-3">{tk.effect}</p>
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
                      <div className="w-20 h-20 rounded-full border-3 border-dashed border-earth-500 bg-forest-900 flex items-center justify-center text-4xl overflow-hidden flex-shrink-0">
                        {wizAvatarType === 'emoji' ? (
                          wizAvatarValue
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
                              className={`w-10 h-10 rounded border-2 text-xl flex items-center justify-center ${
                                wizAvatarType === 'emoji' && wizAvatarValue === av.value 
                                  ? 'bg-earth-800 border-earth-500' 
                                  : 'bg-forest-900 border-forest-700 hover:border-forest-500'
                              }`}
                              title={av.label}
                            >
                              {av.value}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-forest-400">或者自己上传图片：</span>
                          <label className="btn-sketch rounded px-2.5 py-1 bg-forest-800 border-forest-600 cursor-pointer text-[11px]">
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
                    <p className="text-xs text-forest-300 mb-4">
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
                              : 'bg-forest-900 border-forest-800 text-parchment-300 hover:border-forest-600'
                          }`}
                        >
                          <div className="font-bold font-serif text-md">{l.name}</div>
                          <div className="text-[9px] text-forest-400 mt-1 line-clamp-1">{l.description}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-forest-900 p-4 rounded border border-forest-800 mt-4 space-y-4">
                      <div>
                        <h4 className="font-bold text-sm text-parchment-200">🥗 {wizLineage.name} 的生物特征:</h4>
                        <p className="text-xs text-forest-300 mt-1 leading-relaxed">{wizLineage.description}</p>
                      </div>

                      {/* Lineage traits selection */}
                      <div className="border-t border-forest-800 pt-3">
                        <span className="block text-xs font-bold text-parchment-200 mb-2">🧬 初始特性一（从本谱系专属特性中 3 选 1）：</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {wizLineage.traits.map(tr => (
                            <div 
                              key={tr.name}
                              onClick={() => setWizTraitPrimary(tr)}
                              className={`border-2 p-2.5 rounded cursor-pointer transition-all text-xs ${
                                wizTraitPrimary?.name === tr.name 
                                  ? 'bg-earth-950 border-earth-600 text-white' 
                                  : 'bg-forest-850 border-forest-800 text-parchment-300'
                              }`}
                            >
                              <div className="flex justify-between font-bold text-earth-400">
                                <span>{tr.name}</span>
                                <span className="text-[9px] bg-forest-850 px-1 rounded text-parchment-400">{tr.cost}</span>
                              </div>
                              <p className="text-[10px] text-forest-400 mt-1">{tr.effect}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General second trait selection */}
                      <div className="border-t border-forest-800 pt-3">
                        <span className="block text-xs font-bold text-parchment-200 mb-2">🌍 初始特性二（杂学：可从 8 种专长的全部 24 项特性中任选其一！）：</span>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-forest-950 rounded border border-forest-800">
                          {LINEAGES.map(lg => (
                            <div key={lg.name} className="space-y-1">
                              <div className="text-[9px] bg-forest-800 px-1.5 py-0.5 text-parchment-300 font-bold truncate">{lg.name}</div>
                              {lg.traits.map(tr => (
                                <div 
                                  key={tr.name}
                                  onClick={() => setWizTraitSecondary(tr)}
                                  className={`p-1.5 rounded cursor-pointer text-[10px] transition-all truncate ${
                                    wizTraitSecondary?.name === tr.name 
                                      ? 'bg-earth-800 text-white' 
                                      : 'text-parchment-400 hover:bg-forest-900'
                                  }`}
                                  title={`${tr.name}: ${tr.effect}`}
                                >
                                  {tr.name}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        {wizTraitSecondary && (
                          <div className="mt-2 text-xs bg-forest-850 p-2 rounded border border-forest-800 text-forest-300">
                            已选择次要特性: <span className="font-bold text-earth-400">{wizTraitSecondary.name}</span> ({wizTraitSecondary.cost}) — {wizTraitSecondary.effect}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Companion choice */}
                  <div>
                    <h3 className="text-lg font-bold font-serif mb-2 text-earth-400">选择你的密切同伴 (Companion)</h3>
                    <p className="text-xs text-forest-300 mb-3">
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
                              : 'bg-forest-900 border-forest-800 text-parchment-400 hover:border-forest-700'
                          }`}
                        >
                          <div className="font-bold font-serif">{comp.name}</div>
                          <p className="text-[10px] text-forest-400 mt-1 line-clamp-3">{comp.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-bold mb-1 text-forest-300">给同伴起个自定义名字（留空则使用默认名）：</label>
                      <input 
                        type="text" 
                        value={wizCompanionCustomName} 
                        onChange={(e) => setWizCompanionCustomName(e.target.value)}
                        placeholder={`默认：${wizLineage.companions[wizCompanionIndex].name}`}
                        className="w-full max-w-md bg-forest-900 border-2 border-forest-700 rounded px-3 py-1.5 text-xs text-parchment-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      onClick={() => setWizardStep(1)}
                      className="btn-sketch rounded px-4 py-2 bg-forest-900 border-forest-700 text-parchment-200"
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
                    <p className="text-xs text-forest-300 mb-4 leading-relaxed">
                      荒野食客通过特定的食物铭记自己的过往。在下方设定你的童年餐食、入伙动机以及毕生雄心。
                      <span className="text-earth-400 font-bold block mt-1">💡 规则计算：每个背景对应的选择会给你提供一项唯一的 +1 初始技能加值，三种背景对应的初始技能必须各不相同！</span>
                    </p>

                    <div className="space-y-4">
                      {/* Course 1: Upbringing */}
                      <div className="bg-forest-900 p-4 rounded border border-forest-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-parchment-200 text-sm flex items-center gap-1">
                            🍽️ 第一道菜：成长背景 (Upbringing) — 童年餐食
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
                            <label className="block text-[10px] text-forest-400 mb-1">童年美食名称</label>
                            <input 
                              type="text" 
                              value={wizUpbringingMeal} 
                              onChange={(e) => setWizUpbringingMeal(e.target.value)}
                              placeholder="例如: 黑麦酸面包配咸鱼"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="block text-[10px] text-forest-400 mb-1">童年成长细节</label>
                            <textarea 
                              rows={2}
                              value={wizUpbringingText} 
                              onChange={(e) => setWizUpbringingText(e.target.value)}
                              placeholder="描述在什么环境下吃、谁在身边、什么样的情感"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-forest-400 mb-1">对应技能加成</label>
                            <div className="bg-forest-950 border border-forest-700 text-earth-400 text-xs text-center font-bold py-2 rounded">
                              +1 {UPBRINGINGS[wizUpbringingIndex].skill}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-forest-850">
                          <div>
                            <label className="block text-[10px] text-forest-400 mb-0.5">家乡特产</label>
                            <input 
                              type="text" 
                              value={wizUpbringingSpecialty} 
                              onChange={(e) => setWizUpbringingSpecialty(e.target.value)}
                              placeholder="例如: 白米, 玉米, 虫尾"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-forest-400 mb-0.5">家乡香料</label>
                            <input 
                              type="text" 
                              value={wizUpbringingSpice} 
                              onChange={(e) => setWizUpbringingSpice(e.target.value)}
                              placeholder="例如: 大蒜, 鱼露, 怪物之血"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2 py-1 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Course 2: Motivation */}
                      <div className="bg-forest-900 p-4 rounded border border-forest-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-parchment-200 text-sm flex items-center gap-1">
                            🥩 第二道菜：入伙动机 (Motivation) — 变异野兽餐
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
                            <label className="block text-[10px] text-forest-400 mb-1">怪物之餐名称</label>
                            <input 
                              type="text" 
                              value={wizMotivationMeal} 
                              onChange={(e) => setWizMotivationMeal(e.target.value)}
                              placeholder="例如: 类似鲨鱼肉的稠粥"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="block text-[10px] text-forest-400 mb-1">入伙故事与野性觉醒</label>
                            <textarea 
                              rows={2}
                              value={wizMotivationText} 
                              onChange={(e) => setWizMotivationText(e.target.value)}
                              placeholder="那是什么怪物？怎么死的？你为什么吃它？"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-forest-400 mb-1">对应技能加成</label>
                            <div className="bg-forest-950 border border-forest-700 text-earth-400 text-xs text-center font-bold py-2 rounded">
                              +1 {MOTIVATIONS[wizMotivationIndex].skill}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Course 3: Ambition */}
                      <div className="bg-forest-900 p-4 rounded border border-forest-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-parchment-200 text-sm flex items-center gap-1">
                            🥧 第三道菜：一生雄心 (Ambition) — 梦想终极餐
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
                            <label className="block text-[10px] text-forest-400 mb-1">梦想终极料理名称</label>
                            <input 
                              type="text" 
                              value={wizAmbitionMeal} 
                              onChange={(e) => setWizAmbitionMeal(e.target.value)}
                              placeholder="例如: 巨人之心, 传奇盛宴"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="block text-[10px] text-forest-400 mb-1">渴望达成的成就</label>
                            <textarea 
                              rows={2}
                              value={wizAmbitionText} 
                              onChange={(e) => setWizAmbitionText(e.target.value)}
                              placeholder="这道餐代表什么？你为什么如此渴望？什么在阻碍你？"
                              className="w-full bg-forest-950 border border-forest-700 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-forest-400 mb-1">对应技能加成</label>
                            <div className="bg-forest-950 border border-forest-700 text-earth-400 text-xs text-center font-bold py-2 rounded">
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
                    <p className="text-xs text-forest-300 mb-2">
                      餐食很少独自享用。选择一道菜，指定你与猎群中另一名队友建立特定的情感羁绊（Connection）。
                    </p>
                    <textarea 
                      rows={2}
                      value={wizBond} 
                      onChange={(e) => setWizBond(e.target.value)}
                      placeholder="例如: 每次你吃黑麦咸鱼时，队友都在场，你们在生死关头曾互相帮扶过，你发誓守护他们..."
                      className="w-full bg-forest-900 border-2 border-forest-700 rounded px-3 py-2 text-xs text-parchment-100"
                    />
                  </div>

                  {/* Navigation and validate skill selection */}
                  <div className="flex justify-between pt-4">
                    <button 
                      onClick={() => setWizardStep(2)}
                      className="btn-sketch rounded px-4 py-2 bg-forest-900 border-forest-700 text-parchment-200"
                    >
                      ← 上一步
                    </button>
                    
                    <button 
                      onClick={handleCreateCharacter}
                      className="btn-sketch rounded px-8 py-3 bg-earth-600 border-earth-400 text-white flex items-center gap-2 font-serif font-bold text-lg hover:shadow-rough"
                    >
                      ⚔️ 刻入猎群契约（创建荒野食客）
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
                <div className="bg-forest-900 p-3 rounded border border-forest-700 text-center flex flex-col justify-between">
                  <span className="text-xs font-bold text-parchment-300 flex items-center justify-center gap-1">
                    <Heart size={14} className="text-earth-500 fill-earth-500" /> 最大体力 (Stamina)
                  </span>
                  <div className="text-3xl font-extrabold font-serif my-2 text-earth-400">
                    {activeChar.stamina} / 20
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => updateActiveCharStat('stamina', activeChar.stamina - 1)}
                      className="px-3 py-1 bg-forest-800 rounded border border-forest-600 font-bold hover:bg-forest-700 text-sm"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateActiveCharStat('stamina', activeChar.stamina + 1)}
                      className="px-3 py-1 bg-forest-800 rounded border border-forest-600 font-bold hover:bg-forest-700 text-sm"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Durability Tracker */}
                <div className="bg-forest-900 p-3 rounded border border-forest-700 text-center flex flex-col justify-between">
                  <span className="text-xs font-bold text-parchment-300 flex items-center justify-center gap-1">
                    <Shield size={14} className="text-yellow-500" /> 工具耐久度 (Durability)
                  </span>
                  <div className="text-3xl font-extrabold font-serif my-2 text-yellow-500">
                    {activeChar.durability} / {activeChar.durabilityMax}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => updateActiveCharStat('durability', activeChar.durability - 1)}
                      className="px-3 py-1 bg-forest-800 rounded border border-forest-600 font-bold hover:bg-forest-700 text-sm"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateActiveCharStat('durability', activeChar.durability + 1)}
                      className="px-3 py-1 bg-forest-800 rounded border border-forest-600 font-bold hover:bg-forest-700 text-sm"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Harmony Tracker */}
                <div className="bg-forest-900 p-3 rounded border border-forest-700 text-center flex flex-col justify-between">
                  <span className="text-xs font-bold text-parchment-300 flex items-center justify-center gap-1">
                    <Feather size={14} className="text-parchment-300" /> 和谐值 (Harmony) &lt;H&gt;
                  </span>
                  <div className="text-3xl font-extrabold font-serif my-2 text-parchment-100">
                    {activeChar.harmony} / {activeChar.harmonyMax}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => updateActiveCharStat('harmony', activeChar.harmony - 1)}
                      className="px-3 py-1 bg-forest-800 rounded border border-forest-600 font-bold hover:bg-forest-700 text-sm"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateActiveCharStat('harmony', activeChar.harmony + 1)}
                      className="px-3 py-1 bg-forest-800 rounded border border-forest-600 font-bold hover:bg-forest-700 text-sm"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Harmony Max cap modifier */}
                <div className="bg-forest-900 p-3 rounded border border-forest-700 text-center flex flex-col justify-between text-xs">
                  <span className="font-bold text-parchment-300">⚙️ 调整和谐上限</span>
                  <p className="text-[10px] text-forest-400 my-1 leading-tight">休整期间，上限会根据旅途成功与否而波动。</p>
                  <div className="flex justify-center items-center space-x-3 my-1">
                    <button 
                      onClick={() => updateActiveCharStat('harmonyMax', activeChar.harmonyMax - 1)}
                      className="px-2 py-0.5 bg-forest-800 border border-forest-600 rounded font-bold hover:bg-forest-700"
                    >
                      -
                    </button>
                    <span className="font-bold font-serif text-sm">{activeChar.harmonyMax}</span>
                    <button 
                      onClick={() => updateActiveCharStat('harmonyMax', activeChar.harmonyMax + 1)}
                      className="px-2 py-0.5 bg-forest-800 border border-forest-600 rounded font-bold hover:bg-forest-700"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[9px] text-earth-400 font-bold mt-1">初始默认和谐上限为 3</div>
                </div>
              </div>

              {/* ACTION SHEET PREVIEW CARD */}
              <div className="flex justify-between items-center bg-forest-900 p-3 rounded border border-forest-700">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('roster')} 
                    className="btn-sketch rounded px-3 py-1.5 bg-forest-800 border-forest-600 text-xs text-parchment-200 flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> 返回列表
                  </button>
                  <button 
                    onClick={() => handleJsonExport(activeChar)} 
                    className="btn-sketch rounded px-3 py-1.5 bg-forest-800 border-forest-600 text-xs text-parchment-200 flex items-center gap-1"
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
                    className="btn-sketch rounded px-3 py-1.5 bg-forest-800 border-forest-600 text-xs text-parchment-200 flex items-center gap-1"
                  >
                    <Printer size={14} /> 打印本卡
                  </button>
                </div>
                <div className="text-xs text-forest-300 font-bold italic">
                  点击任意【属性风格】即可快捷模拟掷骰
                </div>
              </div>

              {/* INTERACTIVE SHEET CONTAINER */}
              <div 
                ref={cardPrintRef}
                className="parchment-card p-6 md:p-8 rounded-lg space-y-6 text-earth-950 font-sans print:border-0 print:shadow-none"
              >
                {/* Print layout header */}
                <div className="flex flex-col md:flex-row justify-between items-start pb-4 border-b-2 border-earth-900">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full border-2 border-earth-900 flex items-center justify-center bg-white/50 text-4xl overflow-hidden shadow-sm flex-shrink-0">
                      {activeChar.avatarType === 'emoji' ? (
                        activeChar.avatarValue
                      ) : (
                        <img src={activeChar.avatarValue} alt="avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold font-serif leading-none">{activeChar.name}</h2>
                      <p className="text-sm font-serif mt-1 font-bold text-earth-800 italic">
                        {activeChar.adjectives.join(' / ')} • {activeChar.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right mt-3 md:mt-0 font-serif text-sm">
                    <div className="border-2 border-earth-900 px-3 py-1 bg-white/40 font-bold">
                      ⚔️ 工具：{activeChar.tool}
                    </div>
                    <div className="text-[10px] text-earth-800 mt-1 font-mono">
                      《荒野盛宴》 官方标准电子角色卡
                    </div>
                  </div>
                </div>

                {/* MIDDLE ROW: STYLES & SKILLS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: 4 Styles */}
                  <div className="md:col-span-4 space-y-3">
                    <h3 className="font-serif font-bold border-b border-earth-900 pb-1 flex items-center justify-between text-sm">
                      <span>🎯 行动风格 (Styles)</span>
                      <span className="text-[10px] text-earth-700 font-mono">点击进行检定</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div 
                        onClick={() => handleRollDice('力量', activeChar.styleValues.power, '打击', activeChar.skills['打击'] || 0)}
                        className="bg-white/40 hover:bg-earth-200 border-2 border-earth-900 p-2.5 rounded cursor-pointer transition-all text-center"
                      >
                        <span className="text-xs text-earth-800 font-serif">力量 (Power)</span>
                        <div className="text-2xl font-extrabold font-serif mt-1">{activeChar.styleValues.power}d6</div>
                      </div>

                      <div 
                        onClick={() => handleRollDice('精准', activeChar.styleValues.precision, '射击', activeChar.skills['射击'] || 0)}
                        className="bg-white/40 hover:bg-earth-200 border-2 border-earth-900 p-2.5 rounded cursor-pointer transition-all text-center"
                      >
                        <span className="text-xs text-earth-800 font-serif">精准 (Precision)</span>
                        <div className="text-2xl font-extrabold font-serif mt-1">{activeChar.styleValues.precision}d6</div>
                      </div>

                      <div 
                        onClick={() => handleRollDice('迅捷', activeChar.styleValues.swiftness, '穿越', activeChar.skills['穿越'] || 0)}
                        className="bg-white/40 hover:bg-earth-200 border-2 border-earth-900 p-2.5 rounded cursor-pointer transition-all text-center"
                      >
                        <span className="text-xs text-earth-800 font-serif">迅捷 (Swiftness)</span>
                        <div className="text-2xl font-extrabold font-serif mt-1">{activeChar.styleValues.swiftness}d6</div>
                      </div>

                      <div 
                        onClick={() => handleRollDice('技巧', activeChar.styleValues.technique, '手艺', activeChar.skills['手艺'] || 0)}
                        className="bg-white/40 hover:bg-earth-200 border-2 border-earth-900 p-2.5 rounded cursor-pointer transition-all text-center"
                      >
                        <span className="text-xs text-earth-800 font-serif">技巧 (Technique)</span>
                        <div className="text-2xl font-extrabold font-serif mt-1">{activeChar.styleValues.technique}d6</div>
                      </div>
                    </div>

                    {/* Checkbox States */}
                    <div className="border-2 border-earth-900 p-3 bg-white/30 space-y-2 mt-4 rounded">
                      <span className="block text-xs font-bold font-serif border-b border-earth-800 pb-1">⚠️ 临时与不和谐状态 (States)</span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={activeChar.states.exposed} 
                            onChange={() => updateActiveCharStates('exposed')}
                            className="accent-earth-700"
                          />
                          <span>暴露 (Exposed)</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={activeChar.states.hidden} 
                            onChange={() => updateActiveCharStates('hidden')}
                            className="accent-earth-700"
                          />
                          <span>隐藏 (Hidden)</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer col-span-2">
                          <input 
                            type="checkbox" 
                            checked={activeChar.states.disharmony} 
                            onChange={() => updateActiveCharStates('disharmony')}
                            className="accent-earth-700"
                          />
                          <span className="text-red-800 font-bold">不谐 (Disharmony)</span>
                        </label>
                      </div>
                      
                      <div className="border-t border-earth-800 pt-2 text-[10px] text-earth-800 leading-tight">
                        <p className="font-bold">受伤等级 (Injured Rank):</p>
                        <div className="flex space-x-3 mt-1.5">
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={activeChar.states.injured1} 
                              onChange={() => updateActiveCharStates('injured1')}
                              className="accent-earth-700"
                            />
                            <span>受伤1</span>
                          </label>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={activeChar.states.injured2} 
                              onChange={() => updateActiveCharStates('injured2')}
                              className="accent-earth-700"
                            />
                            <span>受伤2</span>
                          </label>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={activeChar.states.injured3} 
                              onChange={() => updateActiveCharStates('injured3')}
                              className="accent-earth-700"
                            />
                            <span>受伤3</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: 12 Skills */}
                  <div className="md:col-span-5 space-y-2">
                    <h3 className="font-serif font-bold border-b border-earth-900 pb-1 flex justify-between text-sm">
                      <span>📖 荒野技能 (Skills)</span>
                      <span className="text-[10px] text-earth-700 font-mono">点击掷骰组合</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      {Object.entries(activeChar.skills).map(([sk, val]) => (
                        <div 
                          key={sk}
                          onClick={() => {
                            // Automatically find high style pairing
                            let style = '力量';
                            let count = activeChar.styleValues.power;
                            if (sk === '射击' || sk === '学习' || sk === '搜索') {
                              style = '精准';
                              count = activeChar.styleValues.precision;
                            } else if (sk === '穿越' || sk === '展示') {
                              style = '迅捷';
                              count = activeChar.styleValues.swiftness;
                            } else if (sk === '手艺' || sk === '储存') {
                              style = '技巧';
                              count = activeChar.styleValues.technique;
                            }
                            handleRollDice(style, count, sk, val);
                          }}
                          className="flex items-center justify-between p-1 hover:bg-white/40 cursor-pointer rounded transition-all"
                        >
                          <div className="flex items-center space-x-1">
                            <span className={val > 0 ? 'text-earth-700 font-bold' : 'text-earth-950'}>{sk}</span>
                          </div>
                          <span className={`font-mono px-2 py-0.5 rounded text-[11px] ${val > 0 ? 'bg-earth-600 text-white font-bold' : 'bg-earth-300'}`}>
                            +{val}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-earth-800 leading-tight pt-2 border-t border-earth-800">
                      * 点击技能会自动配合其对应最擅长的风格（例如【打击】配力量，【射击】配精准）生成快速骰。
                    </p>
                  </div>

                  {/* Right Column: Techniques & Traits */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="border-2 border-earth-900 p-3 bg-white/40 rounded">
                      <h3 className="font-serif font-bold border-b border-earth-900 pb-1 text-xs mb-2">🐾 突变特性与战技 (Traits)</h3>
                      <div className="space-y-2">
                        {activeChar.traits.map(tName => {
                          // Search for trait details
                          let detail = '';
                          let cost = '被动';
                          
                          // Search in tools
                          TOOLS.forEach(tl => {
                            const found = tl.techniques.find(tk => tk.name === tName);
                            if (found) {
                              detail = found.effect;
                              cost = found.cost || '被动';
                            }
                          });

                          // Search in lineages
                          LINEAGES.forEach(ln => {
                            const found = ln.traits.find(tr => tr.name === tName);
                            if (found) {
                              detail = found.effect;
                              cost = found.cost || '被动';
                            }
                          });

                          // Search in universal traits
                          const foundUniv = UNIVERSAL_TRAITS.find(ut => ut.name === tName);
                          if (foundUniv) {
                            detail = foundUniv.effect;
                            cost = foundUniv.cost || '被动';
                          }

                          if (!detail && (tName === '毅力' || tName === '洞察')) {
                            detail = tName === '毅力' ? '（费用：1次成功。）将[A]增加1。' : '（费用：1次成功。）确立一个关于当前情境的细节。';
                            cost = '1次成功';
                          }

                          return (
                            <div key={tName} className="text-xs border-b border-dashed border-earth-300 pb-1.5 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-earth-900">{tName}</span>
                                <span className="text-[8px] bg-earth-800 text-white px-1.5 py-0.2 rounded font-mono">{cost}</span>
                              </div>
                              <p className="text-[10px] text-earth-800 mt-0.5 leading-tight">{detail || '特性代表你融入自身的突变生物血肉与绝技。'}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BACKGROUND COURSES & BOND INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-earth-900">
                  <div className="space-y-3">
                    <h3 className="font-serif font-bold text-sm border-b border-earth-900 pb-1">🍲 荒野食客背景三道菜</h3>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white/40 p-2.5 rounded border border-earth-300">
                        <span className="font-bold text-earth-800 block mb-0.5">🍰 第一道菜（成长背景） — {activeChar.backgroundMeals.upbringing.meal}</span>
                        <p className="text-earth-950 text-[11px] leading-tight italic">"{activeChar.backgroundMeals.upbringing.text}"</p>
                      </div>
                      <div className="bg-white/40 p-2.5 rounded border border-earth-300">
                        <span className="font-bold text-earth-800 block mb-0.5">🥣 第二道菜（求生动机） — {activeChar.backgroundMeals.motivation.meal}</span>
                        <p className="text-earth-950 text-[11px] leading-tight italic">"{activeChar.backgroundMeals.motivation.text}"</p>
                      </div>
                      <div className="bg-white/40 p-2.5 rounded border border-earth-300">
                        <span className="font-bold text-earth-800 block mb-0.5">🥧 第三道菜（终生雄心） — {activeChar.backgroundMeals.ambition.meal}</span>
                        <p className="text-earth-950 text-[11px] leading-tight italic">"{activeChar.backgroundMeals.ambition.text}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/40 p-3 rounded border border-earth-300 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-xs text-earth-800 flex items-center gap-1 border-b border-earth-900 pb-1 mb-2">
                          <Users size={12} /> 猎群羁绊与盟约 (Bonds & Connections)
                        </h3>
                        <p className="text-xs text-earth-900 leading-relaxed italic">
                          "{activeChar.bond}"
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-earth-300 text-xs">
                        <span className="font-bold block text-earth-800 mb-1">🐾 契约怪物同伴 (Companion)</span>
                        <p className="font-bold text-earth-950 text-sm">{activeChar.companion.name}</p>
                        <p className="text-[10px] text-earth-800 mt-0.5 leading-tight">{activeChar.companion.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Player Notes */}
                <div className="pt-4 border-t border-earth-900">
                  <label className="block text-xs font-serif font-bold text-earth-800 mb-1">📝 冒险笔记与食谱素材 (Adventure Log):</label>
                  <textarea 
                    value={activeChar.notes || ''}
                    onChange={(e) => updateActiveCharStat('notes', e.target.value)}
                    placeholder="在此记录你本次冒险中狩猎到的怪物身体部位、获取的食材、或是休整期间的烹饪灵感..."
                    className="w-full bg-white/40 border-2 border-earth-900 rounded p-2 text-xs text-earth-950 focus:outline-none focus:bg-white/60 h-24 print:border-0 print:bg-transparent print:resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT AREA: DICE ROLLING SIMULATOR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="wood-panel p-5 rounded-lg text-parchment-100">
            <h3 className="font-serif font-bold text-lg mb-2 text-parchment-200 flex items-center gap-1.5">
              <Dice5 className="text-earth-400" /> 荒野掷骰契约 (Dice Roller)
            </h3>
            <p className="text-[11px] text-forest-300 leading-relaxed mb-4">
              在《荒野盛宴》中，检定使用 <b>【风格等级数】的 d6</b>。
              骰值 5、6 代表成功。你的 <b>【技能等级】</b> 允许你在掷骰后选择若干个骰子结果 <b>+1</b>，以此来提高成功几率！
            </p>

            {diceRoll ? (
              <div className="space-y-4">
                <div className="bg-forest-900 p-3 rounded border border-forest-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-earth-400 text-sm block">组合检定：</span>
                    <span className="font-serif font-bold text-parchment-100 text-md">
                      {diceRoll.styleName} ({diceRoll.styleCount}d6) + {diceRoll.skillName} (+{diceRoll.skillBonus})
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRollDice(diceRoll.styleName, diceRoll.styleCount, diceRoll.skillName, diceRoll.skillBonus)}
                    className="p-1.5 bg-earth-700 hover:bg-earth-600 rounded text-white"
                    title="重骰"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-parchment-300">
                    🎲 投掷结果（点击骰子应用技能 +1 加成，最多可点 {diceRoll.skillBonus} 个）：
                  </span>

                  <div className="flex flex-wrap gap-2.5 justify-center py-2">
                    {diceRoll.dice.map((d, index) => (
                      <div 
                        key={index}
                        onClick={() => toggleDiceActive(index)}
                        className={`w-11 h-11 border-3 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                          d.adjustedValue >= 5 
                            ? 'bg-earth-600 border-earth-300 text-white shadow-md scale-105' 
                            : 'bg-forest-950 border-forest-800 text-parchment-400'
                        }`}
                      >
                        <span className="text-lg font-extrabold font-serif">{d.adjustedValue}</span>
                        {d.active && <span className="text-[8px] bg-yellow-500 text-forest-950 font-bold px-1 rounded scale-75 mt-[-3px]">+1</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score results card */}
                <div className="bg-forest-950 p-4 rounded-lg border border-forest-800 text-center space-y-2 shadow-inner">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border-r border-forest-800">
                      <span className="text-[10px] text-forest-400 block uppercase font-bold">成功次数</span>
                      <span className="text-3xl font-black font-serif text-earth-400">
                        {diceRoll.successes}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-forest-400 block uppercase font-bold">行动评级 [A]</span>
                      <span className="text-3xl font-black font-serif text-yellow-500">
                        {diceRoll.actionRating}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs pt-2 border-t border-forest-800 leading-tight">
                    {diceRoll.successes > 0 ? (
                      <span className="text-forest-400 font-bold">
                        🎉 检定成功！最高骰为 [A]={diceRoll.actionRating}，造成对应的结算效果！
                      </span>
                    ) : (
                      <span className="text-earth-400 font-bold">
                        💀 检定失败！未掷出5点以上的成功值。你可能会陷入暴露、遭遇阻碍或导致和谐度降！
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 border-2 border-dashed border-forest-800 rounded-lg flex flex-col items-center justify-center text-center p-4 text-forest-400">
                <Dice5 size={40} className="mb-2 text-forest-600 animate-pulse" />
                <p className="text-xs">
                  暂未进行检定投掷。<br />
                  请在左侧电子卡面板中点击任何 <b>【属性风格】</b> 或是 <b>【技能组合】</b> 来直接发起投掷契约！
                </p>
              </div>
            )}
          </div>

          {/* QUICK RULES TIPS PANEL */}
          <div className="wood-panel p-5 rounded-lg text-parchment-100 space-y-4">
            <h3 className="font-serif font-bold text-lg text-parchment-200 flex items-center gap-1.5">
              <BookOpen size={18} className="text-earth-400" /> 荒野契约快速备忘
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-forest-300">
              <div className="border-b border-forest-800 pb-2">
                <span className="font-bold text-parchment-200 block mb-0.5">🎯 检定判定核心规则</span>
                <p>风格决定你的骰子池（d6个数）。技能等级决定在投掷后，你有多少次机会将任意骰子结果 <b>+1</b>。</p>
                <p className="mt-1"><b>成功：</b> 任何 5、6 点。 <b>[A] 行动评级：</b> 成功中最高的骰子点数。</p>
              </div>

              <div className="border-b border-forest-800 pb-2">
                <span className="font-bold text-parchment-200 block mb-0.5">🤝 和谐与不谐规则 &lt;H&gt;</span>
                <p>和谐代表与自然世界及队友的关系。<b>“释放野性”并失败</b> 或 <b>帮助队友但队友失败</b> 会扣除 1 点和谐。</p>
                <p className="mt-1">和谐降到0再扣除时，该猎人陷入 <b>【不谐】</b> 状态：脑海中冲突加剧，<b>所有检定获得劣势（重投最高成功骰）</b>。</p>
              </div>

              <div>
                <span className="font-bold text-parchment-200 block mb-0.5">🍖 盛宴烹饪净化</span>
                <p>在休整期，荒野食客可以将打猎得到的怪物部位配合家乡特产和香料进行烹饪。成功烹食能够净化狂厄，恢复体力并获得不可思议的突变力量！</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="text-center py-8 mt-12 border-t border-forest-900 text-xs text-forest-400">
        <p>© 2026 荒野盛宴 TTRPG 电子人物卡辅助工具. All Rules and Concepts belong to KC Shi and respective authors.</p>
        <p className="mt-1">Based on "Wilderfeast" core rules. Craft with Love & Wilderness.</p>
      </footer>
    </div>
  );
}
