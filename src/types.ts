export interface Technique {
  name: string;
  type: 'signature' | 'optional';
  cost?: string;
  effect: string;
  desc?: string;
}

export interface Tool {
  name: string;
  description: string;
  styles: {
    name: string;
    choices: string[];
  };
  techniques: Technique[];
  adjectives: string[];
}

export interface Trait {
  name: string;
  cost?: string;
  effect: string;
  type?: string;
}

export interface Lineage {
  name: string;
  description: string;
  traits: Trait[];
  companions: {
    name: string;
    description: string;
  }[];
}

export interface BackgroundOption {
  id: number;
  description: string;
  skill: string;
}

export interface PreGeneratedCharacter {
  name: string;
  specialty: string;
  adjectives: [string, string];
  tool: string;
  stylesChoice: 'a' | 'b';
  styleValues: {
    power: number;
    precision: number;
    swiftness: number;
    technique: number;
  };
  skills: { [key: string]: number };
  traits: string[];
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
  durability: number;
}

export interface BondOption {
  id: number;
  type: '成长背景' | '动机' | '雄心';
  description: string;
}

export interface Character {
  id: string;
  isCustom: boolean;
  name: string;
  playerName: string;
  specialty: string;
  adjectives: [string, string];
  tool: string;
  stylesChoice: 'a' | 'b';
  styleValues: {
    power: number;
    precision: number;
    swiftness: number;
    technique: number;
  };
  skills: { [key: string]: number };
  traits: string[];
  techniques: string[];
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
  statesActive: { name: string; level: number }[];
  avatarType: 'emoji' | 'upload' | 'drawing';
  avatarValue: string;
  backgroundType: 'portrait' | 'upload' | 'drawing';
  backgroundValue: string;
  notes?: string;
}

export interface DiceRollResult {
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
}

export const BUILTIN_AVATARS = [
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

export const ALL_SKILLS = ['激励', '发声', '手艺', '治愈', '展示', '抓取', '储存', '搜索', '射击', '打击', '学习', '穿越'];

export { type AppendixTrait, type AppendixTechnique, type AppendixState, type AppendixRegion, type AppendixAction } from './appendixData';