import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TOOLS, LINEAGES, UPBRINGINGS, MOTIVATIONS, AMBITIONS,
  type Tool, type Lineage, type Trait, type Technique
} from '../data';
import type { Character } from '../types';
import { useCharacter } from '../context/CharacterContext';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { Step1ToolIdentity } from '../components/wizard/Step1ToolIdentity';
import { Step2Specialty } from '../components/wizard/Step2Specialty';
import { Step3Background } from '../components/wizard/Step3Background';
import { DrawingCanvasModal } from '../components/modals/DrawingCanvasModal';

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
  const drawing = useCanvasDrawing();

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

  const openBackgroundDrawingModal = () => {
    setIsDrawingModalOpen(true);
    drawing.resetHistory();
    setTimeout(() => {
      drawing.initCanvas();
      if (wizBackgroundType === 'drawing' && wizBackgroundValue) {
        drawing.loadImageOntoCanvas(wizBackgroundValue);
      }
    }, 100);
  };

  const saveBackgroundDrawing = () => {
    const dataUrl = drawing.getCanvasDataUrl();
    if (!dataUrl) return;
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
        <Step1ToolIdentity
          wizName={wizName} setWizName={setWizName}
          wizPlayerName={wizPlayerName} setWizPlayerName={setWizPlayerName}
          wizAdjectiveCurrent={wizAdjectiveCurrent} setWizAdjectiveCurrent={setWizAdjectiveCurrent}
          wizAdjectiveAspiring={wizAdjectiveAspiring} setWizAdjectiveAspiring={setWizAdjectiveAspiring}
          wizTool={wizTool} setWizTool={setWizTool}
          wizStylesChoice={wizStylesChoice} setWizStylesChoice={setWizStylesChoice}
          wizSecondaryTech={wizSecondaryTech} setWizSecondaryTech={setWizSecondaryTech}
          wizAvatarType={wizAvatarType} setWizAvatarType={setWizAvatarType}
          wizAvatarValue={wizAvatarValue} setWizAvatarValue={setWizAvatarValue}
          onNext={nextStep}
        />
      )}

      {wizardStep === 2 && (
        <Step2Specialty
          wizLineage={wizLineage} setWizLineage={setWizLineage}
          wizTraitPrimary={wizTraitPrimary} setWizTraitPrimary={setWizTraitPrimary}
          wizTraitSecondary={wizTraitSecondary} setWizTraitSecondary={setWizTraitSecondary}
          wizSecondaryTraitSource={wizSecondaryTraitSource} setWizSecondaryTraitSource={setWizSecondaryTraitSource}
          wizSecondarySearchQuery={wizSecondarySearchQuery} setWizSecondarySearchQuery={setWizSecondarySearchQuery}
          wizCompanionIndex={wizCompanionIndex} setWizCompanionIndex={setWizCompanionIndex}
          wizCompanionCustomName={wizCompanionCustomName} setWizCompanionCustomName={setWizCompanionCustomName}
          onNext={nextStep}
          onPrev={() => setWizardStep(1)}
        />
      )}

      {wizardStep === 3 && (
        <Step3Background
          wizUpbringingIndex={wizUpbringingIndex} setWizUpbringingIndex={setWizUpbringingIndex}
          wizUpbringingMeal={wizUpbringingMeal} setWizUpbringingMeal={setWizUpbringingMeal}
          wizUpbringingText={wizUpbringingText} setWizUpbringingText={setWizUpbringingText}
          wizUpbringingSpecialty={wizUpbringingSpecialty} setWizUpbringingSpecialty={setWizUpbringingSpecialty}
          wizUpbringingSpice={wizUpbringingSpice} setWizUpbringingSpice={setWizUpbringingSpice}
          wizUpbringingCustomSkill={wizUpbringingCustomSkill} setWizUpbringingCustomSkill={setWizUpbringingCustomSkill}
          wizMotivationIndex={wizMotivationIndex} setWizMotivationIndex={setWizMotivationIndex}
          wizMotivationMeal={wizMotivationMeal} setWizMotivationMeal={setWizMotivationMeal}
          wizMotivationText={wizMotivationText} setWizMotivationText={setWizMotivationText}
          wizMotivationCustomSkill={wizMotivationCustomSkill} setWizMotivationCustomSkill={setWizMotivationCustomSkill}
          wizAmbitionIndex={wizAmbitionIndex} setWizAmbitionIndex={setWizAmbitionIndex}
          wizAmbitionMeal={wizAmbitionMeal} setWizAmbitionMeal={setWizAmbitionMeal}
          wizAmbitionText={wizAmbitionText} setWizAmbitionText={setWizAmbitionText}
          wizAmbitionCustomSkill={wizAmbitionCustomSkill} setWizAmbitionCustomSkill={setWizAmbitionCustomSkill}
          wizBondIndex={wizBondIndex} setWizBondIndex={setWizBondIndex}
          wizBond={wizBond} setWizBond={setWizBond}
          wizBackgroundType={wizBackgroundType} setWizBackgroundType={setWizBackgroundType}
          wizBackgroundValue={wizBackgroundValue} setWizBackgroundValue={setWizBackgroundValue}
          rollBackgroundOption={rollBackgroundOption}
          openBackgroundDrawingModal={openBackgroundDrawingModal}
          handleBackgroundUpload={handleBackgroundUpload}
          onPrev={() => setWizardStep(2)}
          onCreate={handleCreateCharacter}
        />
      )}

      {isDrawingModalOpen && (
        <DrawingCanvasModal
          isDrawingModalOpen={isDrawingModalOpen}
          setIsDrawingModalOpen={setIsDrawingModalOpen}
          isPortraitEditMode={isPortraitEditMode}
          setIsPortraitModalOpen={() => {}}
          drawing={drawing}
          saveBackgroundDrawing={saveBackgroundDrawing}
        />
      )}
    </div>
  );
}
