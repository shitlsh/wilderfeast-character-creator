import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Search } from 'lucide-react';
import {
  TOOLS, LINEAGES, UPBRINGINGS, MOTIVATIONS, AMBITIONS, BONDS,
  type Tool, type Lineage, type Trait, type Technique
} from '../data';
import { getInkIcon } from '../icons';
import { APPENDIX_TRAITS } from '../appendixData';
import { BUILTIN_AVATARS, ALL_SKILLS } from '../types';
import type { Character } from '../types';
import { useCharacter } from '../context/CharacterContext';

export default function CreatePage() {
  const navigate = useNavigate();
  const { characters, showNotification, saveCustomCharacters, setSelectedCharId } = useCharacter();

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

  const [wizUpbringingIndex, setWizUpbringingIndex] = useState<number>(0);
  const [wizUpbringingMeal, setWizUpbringingMeal] = useState('');
  const [wizUpbringingText, setWizUpbringingText] = useState('');
  const [wizUpbringingSpecialty, setWizUpbringingSpecialty] = useState('');
  const [wizUpbringingSpice, setWizUpbringingSpice] = useState('');
  const [wizUpbringingCustomSkill, setWizUpbringingCustomSkill] = useState('搜索');

  const [wizMotivationIndex, setWizMotivationIndex] = useState<number>(0);
  const [wizMotivationMeal, setWizMotivationMeal] = useState('');
  const [wizMotivationText, setWizMotivationText] = useState('');
  const [wizMotivationCustomSkill, setWizMotivationCustomSkill] = useState('搜索');

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
  const [isPortraitEditMode, setIsPortraitEditMode] = useState(false);
  const [drawPenColor, setDrawPenColor] = useState('#2d100c');
  const [drawPenSize, setDrawPenSize] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingStateRef = useRef<{ isDrawing: boolean; lastX: number; lastY: number }>({ isDrawing: false, lastX: 0, lastY: 0 });
  const canvasHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canvasHistoryTick, setCanvasHistoryTick] = useState(0);

  useEffect(() => {
    if (isDrawingModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (isPortraitEditMode) {
            setIsPortraitEditMode(false);
          }
          setIsDrawingModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKey);
      };
    }
    return () => {};
  }, [isDrawingModalOpen]);

  useEffect(() => {
    setWizAdjectiveCurrent(wizTool.adjectives[0]);
    setWizAdjectiveAspiring(wizTool.adjectives[1] || wizTool.adjectives[0]);
    setWizSecondaryTech(wizTool.techniques.filter(t => t.type === 'optional')[0]);
  }, [wizTool]);

  useEffect(() => {
    setWizTraitPrimary(wizLineage.traits[0]);
    setWizCompanionCustomName('');
    const otherLineages = LINEAGES.filter(l => l.name !== wizLineage.name);
    setWizTraitSecondary(otherLineages[0].traits[0]);
  }, [wizLineage]);

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

  const calculateWizStyles = () => {
    let power = 1, precision = 1, swiftness = 1, technique = 1;

    if (wizTool.name === '大砍刀' || wizTool.name === '防护手套') {
      if (wizStylesChoice === 'a') {
        power = 3; precision = 2;
      } else {
        power = 2; precision = 3;
      }
    } else if (wizTool.name === '平底锅') {
      if (wizStylesChoice === 'a') {
        power = 3; technique = 2;
      } else {
        power = 2; technique = 3;
      }
    } else if (wizTool.name === '叉子') {
      if (wizStylesChoice === 'a') {
        precision = 3; swiftness = 2;
      } else {
        precision = 2; swiftness = 3;
      }
    } else if (wizTool.name === '喷火器') {
      if (wizStylesChoice === 'a') {
        precision = 3; technique = 2;
      } else {
        precision = 2; technique = 3;
      }
    } else if (wizTool.name === '钢绳') {
      if (wizStylesChoice === 'a') {
        swiftness = 3; technique = 2;
      } else {
        swiftness = 2; technique = 3;
      }
    }

    return { power, precision, swiftness, technique };
  };

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

  const handleCreateCharacter = () => {
    const upbringingSkill = wizUpbringingIndex === -1 ? wizUpbringingCustomSkill : UPBRINGINGS[wizUpbringingIndex].skill;
    const motivationSkill = wizMotivationIndex === -1 ? wizMotivationCustomSkill : MOTIVATIONS[wizMotivationIndex].skill;
    const ambitionSkill = wizAmbitionIndex === -1 ? wizAmbitionCustomSkill : AMBITIONS[wizAmbitionIndex].skill;

    const skills: { [key: string]: number } = {
      '激励': 0, '发声': 0, '手艺': 0, '治愈': 0, '展示': 0, '抓取': 0,
      '储存': 0, '搜索': 0, '射击': 0, '打击': 0, '学习': 0, '穿越': 0
    };
    skills[upbringingSkill] = 1;
    skills[motivationSkill] = 1;
    skills[ambitionSkill] = 1;

    const signatureTech = wizTool.techniques.find(t => t.type === 'signature')?.name || '';
    const chosenTech = wizSecondaryTech?.name || '';
    const traitPrimary = wizTraitPrimary?.name || '';
    const traitSecondary = wizTraitSecondary?.name || '';

    const traitList = [signatureTech, chosenTech, traitPrimary, traitSecondary];

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

    const customs = characters.filter(c => c.isCustom);
    saveCustomCharacters([...customs, newChar]);
    setSelectedCharId(newChar.id);
    navigate(`/play/${newChar.id}`);
    showNotification(`恭喜你！荒野猎人 ${newChar.name} 已经创建成功！`, 'success');

    setWizName('');
    setWizPlayerName('');
    setWizardStep(1);
  };

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
  };

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const hist = canvasHistoryRef.current;
    const idx = historyIndexRef.current;
    hist.length = idx + 1;
    hist.push(dataUrl);
    if (hist.length > 20) hist.shift();
    historyIndexRef.current = hist.length - 1;
    setCanvasHistoryTick(t => t + 1);
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
    setCanvasHistoryTick(t => t + 1);
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
    setCanvasHistoryTick(t => t + 1);
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
    canvasHistoryRef.current = [];
    historyIndexRef.current = -1;
    setCanvasHistoryTick(t => t + 1);
  };

  const saveBackgroundDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (isPortraitEditMode) {
      setIsDrawingModalOpen(false);
      showNotification('手绘插图保存成功！', 'success');
    } else {
      setWizBackgroundType('drawing');
      setWizBackgroundValue(dataUrl);
      setIsDrawingModalOpen(false);
      showNotification('手绘背景图保存成功！', 'success');
    }
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

  const openBackgroundDrawingModal = () => {
    setIsDrawingModalOpen(true);
    canvasHistoryRef.current = [];
    historyIndexRef.current = -1;
    setCanvasHistoryTick(t => t + 1);
    setTimeout(() => {
      initCanvas();
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
          saveHistoryState();
        };
        img.src = wizBackgroundValue;
      } else {
        initCanvas();
        saveHistoryState();
      }
    }, 100);
  };

  return (
    <div className="wood-panel p-6 rounded-lg text-ink">
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

      {wizardStep === 3 && (
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

      {isDrawingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4" onTouchMove={(e) => e.preventDefault()}>
          <div className="bg-[#2d100c] border-3 border-wilder-blue rounded-xl p-3 sm:p-5 max-w-lg w-full shadow-rough-lg">
            <h3 className="text-lg font-bold font-serif text-wilder-blue mb-1">✏️ {isPortraitEditMode ? '手绘角色插图' : '手绘背景插图'}</h3>
            <p className="text-xs text-wilder-amber mb-3">在下方区域自由绘制你的角色{isPortraitEditMode ? '插图' : '背景插图'}</p>

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
                  data-tick={canvasHistoryTick}
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
                  onClick={() => {
                    if (isPortraitEditMode) {
                      setIsDrawingModalOpen(false);
                    } else {
                      setIsDrawingModalOpen(false);
                    }
                  }}
                  className="text-xs bg-surface-border border border-wilder-amber text-ink-muted px-3 py-1 rounded hover:bg-amber-900"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveBackgroundDrawing}
                  className="text-xs bg-wilder-blue border border-wilder-blue text-white px-3 py-1 rounded font-bold hover:bg-wilder-blue"
                >
                  💾 {isPortraitEditMode ? '保存插图' : '保存背景图'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
