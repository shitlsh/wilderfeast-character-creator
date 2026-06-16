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
  traits: string[]; // List of trait/technique names
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

// 6 Tools
export const TOOLS: Tool[] = [
  {
    name: "大砍刀",
    description: "具有标志性的巨型钢刃，擅长在狩猎中切断怪物危险的身体部位，不浪费一丝一毫的肉。使用者更像外科医生而非士兵。",
    styles: {
      name: "力量与精准",
      choices: ["(a) 3点力量、2点精准，其余1点", "(b) 3点精准、2点力量，其余1点"]
    },
    adjectives: ["残暴", "谨慎", "果断", "高效", "骇人", "务实"],
    techniques: [
      {
        name: "干净利落斩",
        type: "signature",
        cost: "4点行动",
        effect: "对1跨度内的一只生物进行一次力量打击或精准打击检定。若成功，造成 [A]×2 点身体部位伤害。若失败，你陷入暴露状态。"
      },
      {
        name: "吃我大宝剑",
        type: "optional",
        cost: "3点体力",
        effect: "选择一名人类，使其陷入惊恐状态。"
      },
      {
        name: "医疗训练",
        type: "optional",
        cost: "被动",
        effect: "每个休整阶段一次，选择一名队友。其受伤状态的等级降低1级。"
      },
      {
        name: "物尽其用",
        type: "optional",
        cost: "被动",
        effect: "在你结束盛宴后，你会获得1份以下食材：精华身体部位。任意一项风格获得+1。"
      }
    ]
  },
  {
    name: "防护手套",
    description: "由方舟钢纤维编织而成，适合那些既想亲自动手，又不想弄脏双手的荒野食客。可以承受猛烈的震荡性冲击。",
    styles: {
      name: "力量与精准",
      choices: ["(a) 3点力量、2点精准，其余1点", "(b) 3点精准、2点力量，其余1点"]
    },
    adjectives: ["勇敢", "随和", "专注", "诚实", "善解人意", "乐观"],
    techniques: [
      {
        name: "近身优势",
        type: "signature",
        cost: "被动",
        effect: "当你对0跨度内的生物进行打击检定时，你获得优势。"
      },
      {
        name: "严密盔甲",
        type: "optional",
        cost: "被动",
        effect: "你不会因被动特性（如燃烧体或“别碰我”）而受到伤害。"
      },
      {
        name: "舍身护佑",
        type: "optional",
        cost: "2点体力",
        effect: "选择0跨度内一只处于康复或受伤状态的生物。你背起它。只要你背着这只生物，你就无法攻击；如果它受到伤害，则由你代为承受。如果是怪物，此战技需额外消耗3点体力。"
      },
      {
        name: "身手矫健",
        type: "optional",
        cost: "2点体力",
        effect: "直到你的下个回合开始前，你在以下一项特性上获得1个等级：精通攀爬、挖掘或精通游泳。"
      }
    ]
  },
  {
    name: "平底锅",
    description: "最受普通人喜欢的工具。在篝火上受热均匀，也能充当坚不摧的方舟钢之盾，让怪物分心并掩护队友。",
    styles: {
      name: "力量与技巧",
      choices: ["(a) 3点力量、2点技巧，其余1点", "(b) 3点技巧、2点力量，其余1点"]
    },
    adjectives: ["沉着", "慷慨", "有领导力", "受欢迎", "果断", "警惕"],
    techniques: [
      {
        name: "钢铁之盾",
        type: "signature",
        cost: "被动",
        effect: "你的平底锅的最大耐久度增加30点（默认耐久度20升至50）。"
      },
      {
        name: "震击投掷",
        type: "optional",
        cost: "被动",
        effect: "你的平底锅获得“射程：2（射击）。如果你通过一次射击检定造成10点或更多伤害，你的目标将陷入震慑状态。”"
      },
      {
        name: "凝神架势",
        type: "optional",
        cost: "被动",
        effect: "当你回复体力时，你也可以结束任意一个等级的状态，受伤或不谐除外。"
      },
      {
        name: "全域嘲讽",
        type: "optional",
        cost: "被动",
        effect: "你可以从任意距离进行嘲讽。"
      }
    ]
  },
  {
    name: "叉子",
    description: "带有优雅装饰或雕刻的长扦，使用者擅长远距离快速移动和高精度刺击。可在尾端系上绳线以投掷并回收，或拉近目标。",
    styles: {
      name: "精准与迅捷",
      choices: ["(a) 3点精准、2点迅捷，其余1点", "(b) 3点迅捷、2点精准，其余1点"]
    },
    adjectives: ["好奇", "雅致", "高尚", "乐观", "有礼", "随性"],
    techniques: [
      {
        name: "疾风脚步",
        type: "signature",
        cost: "5点体力",
        effect: "如果你正在狩猎，你获得一个额外行动。"
      },
      {
        name: "餐桌礼仪",
        type: "optional",
        cost: "3点体力",
        effect: "选择一个人类聚落。向导会告诉你一种会让他们认可你的行为，以及一种会让他们反感你的行为。"
      },
      {
        name: "牵丝引线",
        type: "optional",
        cost: "被动",
        effect: "你的叉子获得：“射程：2（射击）。如果你使用此工具进行一次射击检定并成功，你可以将自己拉向目标1跨度。”"
      },
      {
        name: "轻装前行",
        type: "optional",
        cost: "3点体力",
        effect: "你可以重掷一次穿越检定。"
      }
    ]
  },
  {
    name: "喷火器",
    description: "最神秘莫测的工具，带有喷嘴、罐体和扳机，不需要补充燃料。宪章学者声称其连接着恒星核心，喷出蓝色焰刃。",
    styles: {
      name: "精准与技巧",
      choices: ["(a) 3点精准、2点技巧，其余1点", "(b) 3点技巧、2点精准，其余1点"]
    },
    adjectives: ["掌控", "耐心", "谋划", "神秘", "好学", "周全"],
    techniques: [
      {
        name: "火之血脉",
        type: "signature",
        cost: "被动",
        effect: "你的喷火器获得：“射程：3（射击）。”"
      },
      {
        name: "引导光明",
        type: "optional",
        cost: "被动",
        effect: "如果你进行一次穿越检定并成功，下一个进行穿越检定的队友获得优势。"
      },
      {
        name: "预热",
        type: "optional",
        cost: "3点体力",
        effect: "选择0跨度内的一名队友。直到本轮结束，如果被选中的队友造成身体部位伤害，则该身体部位也会陷入燃烧状态。"
      },
      {
        name: "快速点火",
        type: "optional",
        cost: "被动",
        effect: "当你的猎群扎营并烹饪餐食时，你可以额外烹饪一餐。"
      }
    ]
  },
  {
    name: "钢绳",
    description: "最全能的工具，可做提篮、套索、网或陷阱。可以像挥鞭子一样舞动，紧紧束缚住怪物，由队友给予致命一击。",
    styles: {
      name: "迅捷与技巧",
      choices: ["(a) 3点迅捷、2点技巧，其余1点", "(b) 3点技巧、2点迅捷，其余1点"]
    },
    adjectives: ["坚韧", "有创意", "灵活", "温柔", "安静", "聪慧"],
    techniques: [
      {
        name: "套索牵引",
        type: "signature",
        cost: "3点体力",
        effect: "将自己拉向一只生物1跨度，或将一名队友拉向自己1跨度。"
      },
      {
        name: "应急修补",
        type: "optional",
        cost: "2点行动",
        effect: "选择0跨度内的一名队友，并进行一次迅捷手艺检定。若成功，为被选中队友的工具回复 [A] 点耐久度。"
      },
      {
        name: "机巧陷阱",
        type: "optional",
        cost: "2点行动",
        effect: "进行一次技巧手艺检定。若成功，下一次有敌对生物向你移动时，它则会改为受到 [A] 点身体部位伤害，并且直到其下个回合开始前都无法移动。"
      },
      {
        name: "挥鞭",
        type: "optional",
        cost: "被动",
        effect: "你的钢绳获得：“射程：2（打击）。”"
      }
    ]
  }
];

// Common traits every character has
export const UNIVERSAL_TRAITS: Trait[] = [
  {
    name: "毅力",
    cost: "1次成功",
    effect: "将 [A] 增加 1。"
  },
  {
    name: "洞察",
    cost: "1次成功",
    effect: "确立一个关于当前情境的细节。"
  }
];

// 8 Lineages
export const LINEAGES: Lineage[] = [
  {
    name: "面包师",
    description: "面包师谱系的怪物具有数百年的寿命，多为以蜂蜜、花蜜、树汁为食的授粉者。面包师以其耐心而闻名，倾向于专精甜点。",
    traits: [
      {
        name: "授粉者",
        cost: "1次搜索成功",
        effect: "和谐增加 1 点。"
      },
      {
        name: "站稳脚跟",
        cost: "被动",
        effect: "除非你允许，或者陷入捕获状态，否则任何事物都无法推斥或拉拽你。"
      },
      {
        name: "惺惺相惜",
        cost: "被动",
        effect: "如果你帮助一个同样拥有此特性的生物，你们双方都会回复 <H> 点体力（<H> 为和谐上限）。"
      }
    ],
    companions: [
      { name: "甜面包", description: "温顺的吸蜜麟甲兽，你大部分时间都陪着它进行漫长而悠闲的散步。" },
      { name: "惠尔", description: "喜怒无常的荒漠巨龟，你便是在它的背上出生长大的。" },
      { name: "卷毛", description: "脾气暴躁的崩雪岩羊，曾因你不愿分享零食而将你从山上顶了下去。" },
      { name: "普阿·李", description: "随和的凿喙鸟，在长达数十年的怪物认知实验中一直处于懵逼状态。" },
      { name: "母亲之母", description: "受人尊敬的沃特拉蝇集群，你的家族已照料其后代长达数代之久。" }
    ]
  },
  {
    name: "屠夫",
    description: "屠夫谱系的怪物身上长有金属或矿物，多为食腐和食碎屑者，有强大的胃。屠夫对死亡习以为常，常常承担起终结怪物的职责。",
    traits: [
      {
        name: "血腥吸引",
        cost: "被动",
        effect: "如果在狩猎的第一轮，敌方有处于受伤状态的生物，则你在该轮的所有检定中获得优势。"
      },
      {
        name: "天然护甲",
        cost: "被动",
        effect: "你从力量打击和力量射击中受到的伤害减半（降为 [A] 伤害）。"
      },
      {
        name: "拾荒者",
        cost: "被动",
        effect: "你不会因食物而中毒。如果你进行觅食（无论成功与否），你还会获得 <H> 份以下食材：碎屑（获得1层中毒状态）。"
      }
    ],
    companions: [
      { name: "落日荣耀", description: "高傲的钢羽孔雀，不在为表演训练时，它总在花园里昂首阔步。" },
      { name: "碎牙", description: "勇猛的冠狼，你用屠宰牲畜后剩下的骨头喂养它。" },
      { name: "洋葱", description: "亲人的钢丝兔，它热情的拥抱有时会不小心把裸露的皮肤磨破。" },
      { name: "马哈拉", description: "警惕的刀刃巨蟒，总是在自己的领地周围留下生锈的、盘绕的蛇蜕。" },
      { name: "静默的小可", description: "深不可测的流光浮空水母，你及早发现了它的狂厄并控制至今。" }
    ]
  },
  {
    name: "渔夫",
    description: "生活在海洋、湖泊与河流中的海洋生物，是迄今为止最大的谱系。渔夫荒野食客常因变异而能够进入神秘的水下世界。",
    traits: [
      {
        name: "回声定位",
        cost: "1次发声成功",
        effect: "选择一只生物，使其陷入暴露状态。"
      },
      {
        name: "电击",
        cost: "2点行动",
        effect: "进行一次迅捷发声检定。若成功，1跨度内的每只生物都受到 [A] 点伤害并陷入震慑状态。"
      },
      {
        name: "精通游泳",
        cost: "被动",
        effect: "你游泳时不会有劣势。"
      }
    ],
    companions: [
      { name: "阿努", description: "孤独的巨爪龙虾，你将它藏在一个隐蔽的入口，保护它免受猎人伤害。" },
      { name: "长仔", description: "爱玩的锤头水蛇，除非你把它变成游戏，否则它什么都不吃。" },
      { name: "皮奇奇", description: "优柔孤绝的雷鸣海豹，你在海滩上发现这只被遗弃的幼崽后抚养长大。" },
      { name: "大脸", description: "爱评头论足的刺球鱼，能读懂陌生人隐藏的意图。" },
      { name: "麦乐迪", description: "聪明的长吻跃鱼，会从古代沉船中搜寻宝藏和废品送给你。" }
    ]
  },
  {
    name: "园丁",
    description: "园丁谱系管理世界植物群，大多依靠速度躲避捕食。园丁食客提倡素食或尽量减少杀戮和流血。",
    traits: [
      {
        name: "冲撞",
        cost: "1点行动",
        effect: "选择3跨度内的一只生物。你移动到该生物0跨度范围内，然后对它和你自己都造成伤害，数值等于你移动的跨度数（不计为消耗体力）。"
      },
      {
        name: "疾速",
        cost: "1次迅捷成功",
        effect: "你可以不消耗行动来进行移动。"
      },
      {
        name: "新陈代谢缓慢",
        cost: "被动",
        effect: "原本持续到下一餐的餐食效果，现在将持续到旅途结束。"
      }
    ],
    companions: [
      { name: "白心", description: "超凡脱俗的巨角鹿，你追逐了它多年，只希望能更近地看它一眼。" },
      { name: "舒舒", description: "迟钝的悠悠熊，在它不知情的情况下，你已多次拯救了它的竹林。" },
      { name: "鼻屎", description: "自信的梅酒毒蛙，只要你为它赔偿损失，它就敢随意洗劫农田。" },
      { name: "孟坦", description: "温和的云鬃兽，其低沉的歌声能让紧张的心情平静下来。" },
      { name: "收割者", description: "挑剔的暗影螳螂，对巢穴里每件玩具和食物的摆放都极为讲究。" }
    ]
  },
  {
    name: "烧烤师",
    description: "烧烤师谱系的怪物与火为伴，在许多生态系统中扮演关键角色。烧烤师食客以烹饪酣畅淋漓、滋味肥美浓郁的美食著称。",
    traits: [
      {
        name: "燃烧体",
        cost: "被动",
        effect: "每轮开始时，你0跨度内所有你选择的生物受到2点伤害。此外，如果你被一个身体部位捕获，则该部位陷入燃烧状态。最后，你自己的部位免疫燃烧状态。"
      },
      {
        name: "火焰吐息",
        cost: "2点行动",
        effect: "对2跨度内的一只生物进行一次力量射击检定。若成功，你造成 [A] 点身体部位伤害，且目标身体部位陷入燃烧状态。"
      },
      {
        name: "恐吓",
        cost: "1次力量成功",
        effect: "选择一只生物，使其陷入惊恐状态。"
      }
    ],
    companions: [
      { name: "红斗篷", description: "无精打采的燧拳猿人，曾是马戏团的演员，如今正在享受宁静的退休生活。" },
      { name: "逐烟者", description: "精明的聚火鹰，你曾为了私利而利用它纵火的能力。" },
      { name: "煤渣", description: "独立的炉灶蜘蛛，你一不留神，它就总是惹上麻烦。" },
      { name: "飘灵", description: "贪婪的赤焰浮空水母，每个月圆之夜，村里都会向它献祭一只刚宰杀的棉毛兽。" },
      { name: "小婷", description: "无畏的闪光鱼，它仅凭胆大包天，就从更庞大的怪物手中夺走了最好的地盘。" }
    ]
  },
  {
    name: "变形者",
    description: "以‘变化’为核心的谱系，多具有适应性的伪装和拟态。变形者食客又称‘多面手’，哪里缺人手就去哪里帮忙。",
    traits: [
      {
        name: "伪装",
        cost: "1次技巧成功",
        effect: "你进入隐藏状态。"
      },
      {
        name: "变化",
        cost: "被动",
        effect: "在盛宴期间，你可以选择永久丢弃此特性。若如此做，你可以在两项风格、技能或特性上各提升一级，而非一项。"
      },
      {
        name: "再生",
        cost: "1次成功",
        effect: "为你的任意一个身体部位回复1点耐久度。"
      }
    ],
    companions: [
      { name: "希姆", description: "好奇的森林触手怪，每次与它相遇时，你总会留给它一个新的谜题盒玩耍。" },
      { name: "巨人杀手", description: "受伤的阴影翡翠鸟，是一场战利品狩猎的幸存者，你通过耐心赢得了它的信任。" },
      { name: "小公爵", description: "拟声蛙，在圈养中长大，为了达到目的可以哀嚎或嚎叫数小时之久。" },
      { name: "掘墓人", description: "翼盗者，对人类尸体有独特的嗜好，让它闪现出诡异的智慧。" },
      { name: "邹卓", description: "皱纹蜥蜴，它是你经历第一次剧烈转变后，唯一还认得你的生物。" }
    ]
  },
  {
    name: "调味者",
    description: "会分泌毒素、药用物质或其他物质的深奥怪物。调味者荒野食客以挑剔善变和极其精准的味觉而闻名。",
    traits: [
      {
        name: "迷失",
        cost: "被动",
        effect: "攻击你的生物（无论成功与否）都会陷入困惑状态。"
      },
      {
        name: "滑溜溜",
        cost: "被动",
        effect: "你不会陷入捕获状态。"
      },
      {
        name: "毒液",
        cost: "1次射击或打击成功",
        effect: "被你的射击或打击击中的生物陷入中毒状态。"
      }
    ],
    companions: [
      { name: "暗影加恩", description: "投机的滋滋蚊，当地人相信它是厄运的预兆。" },
      { name: "萨麦", description: "特别的变形粘液兽，经常突然开始讨厌自己最喜欢的食物。" },
      { name: "半橡", description: "耐心的树根蟹，在一个不便的地点安家后，就再也没挪过窝。" },
      { name: "无畏", description: "胆小的深岩鳄，你曾发誓总有一天要将它从不负责任的地方法官手中救出。" },
      { name: "泥屁股", description: "好斗的恶臭喷吐兽，每次见到你都会亲昵地朝你打喷嚏喷出粘液。" }
    ]
  },
  {
    name: "储藏者",
    description: "会囤积食物和脂肪的怪物，依靠储备物资度过寒冬。储藏者食客会使用普通工具与冷冻器延长保质期，精于周密准备。",
    traits: [
      {
        name: "冬眠者",
        cost: "被动",
        effect: "每级休息状态使你的最大体力增加 2 点，而非 1 点。"
      },
      {
        name: "筑巢者",
        cost: "被动",
        effect: "当猎群扎营时，你和你的队友可以选择保留某一项状态的所有等级，而不是结束它们。"
      },
      {
        name: "整口吞下",
        cost: "1点行动",
        effect: "食用任意数量的食材，回复等量的体力。你不会获得任何增益效果。"
      }
    ],
    companions: [
      { name: "齐达夫人", description: "冷漠的阿西格冰蜘蛛，织出的闪亮挂毯总让你惊叹不已。" },
      { name: "碎屑", description: "穴居胖墩鼬，每天都需要花上几个小时梳理才能解开它毛皮上的结。" },
      { name: "强盗", description: "钉刺鸟，对闪亮物体有极端痴迷，经常偷走你的工具。" },
      { name: "尘翼", description: "大嘴水鸟，你给了它们一颗蛋，让它们能够共同抚养。" },
      { name: "乐乐", description: "肥胖的泥壳兽，由于偏爱长时间泡澡，成了当地澡堂的吉祥物。" }
    ]
  }
];

// Upbringing options (20 rows)
export const UPBRINGINGS: BackgroundOption[] = [
  { id: 1, description: "野生的甜叶，是你在灌木丛中玩耍时觅食到的。吃完一片才能再摘一片，免得贪婪惹怒森林。", skill: "搜索" },
  { id: 2, description: "晒干的咸鱼干，在手脚并用爬绳索时紧叼嘴里。船长不喜欢生火，只能将就吃腌制品。", skill: "抓取" },
  { id: 3, description: "奶酪和一块面包皮，放牧棉毛兽群咩咩叫中吃下。享受微风、阳光和柔软青草。", skill: "穿越" },
  { id: 4, description: "车站镇流动厨房稀粥。孤儿集聚在车站周围乞讨，大人们一转身就扭打在一起。", skill: "打击" },
  { id: 5, description: "点缀金箔侧腹牛排。晚餐热腾腾从庄园端来，但餐桌对面家人的眼神却冰冷刺骨。", skill: "储存" },
  { id: 6, description: "撒着肉桂粉的炸麻花。在市集摊位叫卖到嗓音沙哑，你总在轮班快结束时偷吃一两口。", skill: "发声" },
  { id: 7, description: "薄荷花茶。即使病愈之后，药剂师也教会了你带给他们的每一种植物的用途。", skill: "治愈" },
  { id: 8, description: "门廊石阶上吃的包子。一整年每晚在门廊吃，直到你接受了父母不会回来的事实。", skill: "激励" },
  { id: 9, description: "和脑袋一样大的蜜瓜橙，刚从寺庙花园摘下。你用自己做的盘子切好分给大家。", skill: "手艺" },
  { id: 10, description: "鞍边肉干，由追踪中猎到的野味制成。怪物坐骑已年迈嗜睡，但仍与你同住。", skill: "射击" },
  { id: 11, description: "炖蔬菜和一杯牛奶。寄宿学校里，他们给你吃的都是经过科学优化的定制饮食。", skill: "治愈" },
  { id: 12, description: "炒鸡蛋，还带着点蛋壳。练习杂耍时，导师让你吃掉每一个没接住的鸡蛋。", skill: "展示" },
  { id: 13, description: "饵鱼。如果销售骗局没成功，你就得吃掉试图兜售的剩鱼，然后在第二日重新开始。", skill: "展示" },
  { id: 14, description: "发酵蔬菜，香料浓郁刺鼻。村民总是把你带去的罐子装满泡菜，无法拒绝。", skill: "手艺" },
  { id: 15, description: "淡而无味硬米饭，掺了锯末。但你还是吃了，为了有体力逃离囚禁牢笼。", skill: "打击" },
  { id: 16, description: "葱油拌面配香肠。在你打猎挣来肉食的日子里，兄弟姐妹会为了最好的几口打架。", skill: "射击" },
  { id: 17, description: "哐当火锅，抢劫火车时吃到的炖菜。对你而言货运车厢是世界上最大的储藏室。", skill: "穿越" },
  { id: 18, description: "煮河蟹，双手在浅滩捞上的。你的手指总是缠着绷带，但蟹肉美味值得这一切。", skill: "抓取" },
  { id: 19, description: "印着祈祷符印的豆糕。长者教导你每个符印的含义，至今仍能凭记忆画出所有符印。", skill: "激励" },
  { id: 20, description: "在口中蠕动繁殖的蠕虫。监护人利用这些奇特物种带你探索世界深处的奥秘。", skill: "学习" }
];

// Motivation options (20 rows)
export const MOTIVATIONS: BackgroundOption[] = [
  { id: 1, description: "在父母手把手教导下。祖先立下神圣誓言守护荒野。自幼练习家族食谱。", skill: "手艺" },
  { id: 2, description: "在父母确认这确是你所愿之后。被荒野食客收养，但他们迟迟不愿强加这种生活给你。", skill: "激励" },
  { id: 3, description: "在父母困惑的低吼声中。你被怪物收养。为保护它们，学会了烹饪、交谈等人类技能。", skill: "发声" },
  { id: 4, description: "父母沉默而面如死灰注视下。家里要养活的嘴太多，你踏上狩猎路以减轻家庭负担。", skill: "搜索" },
  { id: 5, description: "在被诊断出患有狂厄后。加入猎群的条件是：如果诅咒恶化，他们有权彻底制约你。", skill: "治愈" },
  { id: 6, description: "为了拯救村庄。狂厄怪物威胁着家园，在下定决心烹食它前，你了解了它的一切。", skill: "学习" },
  { id: 7, description: "为了给村庄复仇。没能及时拯救家园，当你吃掉毁灭家园的元凶时，它的肉尝起来如灰烬。", skill: "射击" },
  { id: 8, description: "为了毁灭你的村庄。邻居的贪婪威胁着共享土地的生灵。你将荒野融入自身只为拯救它。", skill: "展示" },
  { id: 9, description: "作为对一桩滔天罪行惩罚。暴力行径让你只剩选择：要么当荒野食客，要么交出当劳工。", skill: "打击" },
  { id: 10, description: "逃避一桩滔天罪行的惩罚。逃离家园后，偷窃并吃掉任何能找到的肉食，是生存唯一方法。", skill: "抓取" },
  { id: 11, description: "遵从长官命令。将荒野食客改造为士兵计划十分罕见且结局悲惨，你是唯一幸存者。", skill: "射击" },
  { id: 12, description: "签订契约后。富有的资助人承诺提供财富，代价是你将一生献给狩猎。动机是个谜。", skill: "储存" },
  { id: 13, description: "为了治愈你的身体。你曾遭受重创或身患衰弱恶疾，成为荒野食客是活下去的唯一出路。", skill: "治愈" },
  { id: 14, description: "为了研究唯一律法。作为学者，你需要亲身经历才能理解它。你保留着最初实验的笔记。", skill: "学习" },
  { id: 15, description: "为了见识唯一大陆。你渴望见识狭窄家园之外的世界，让身体变异得更适合在荒原中前行。", skill: "穿越" },
  { id: 16, description: "它的孩子就在你的膝上。杀死狂厄怪物后，你发誓要抚养它新近成为孤儿的幼崽后代。", skill: "发声" },
  { id: 17, description: "在你成年之时。你一出生便有预兆昭示了你的宿命。为了履行职责，你获得了所需的一切训练。", skill: "储存" },
  { id: 18, description: "出于意外。你没能认出狂厄化怪物的症状，直到身体开始突变，你才意识到吃了什么。", skill: "搜索" },
  { id: 19, description: "为了狩猎的荣耀。当你第一次在战斗中直面怪物时，你才发觉自己从未如此真切地活着。", skill: "打击" },
  { id: 20, description: "在悼念挚友之时。在它因狂厄而死后，为了纪念它，你成为荒野食客。愿悲剧不再发生。", skill: "激励" }
];

// Ambition options (20 rows)
export const AMBITIONS: BackgroundOption[] = [
  { id: 1, description: "在温暖明亮餐桌上摆满饭碗，身边是共笑的朋友。希望再次足够信任某人共享一餐。", skill: "搜索" },
  { id: 2, description: "在曾经爬过树上吃野餐三明治。此地曾绿意盎然、鸟儿歌唱，希望当它痊愈时仍在此地。", skill: "抓取" },
  { id: 3, description: "所照料的幼年怪物捕来的野味生肉。一旦吃到它，就知道你养大的怪物已能独立活下去。", skill: "发声" },
  { id: 4, description: "在精英怪物倒下的地方享用烤肉。若能狩猎并烹食一头狂厄化神明，你的名字将被歌颂。", skill: "展示" },
  { id: 5, description: "新鲜田园沙拉。从未在一个地方停留足够久为自己种下食物。想体验创造与毁灭等量之感。", skill: "手艺" },
  { id: 6, description: "一道失传的古老家族食谱。了解你最古老的亲族，助你与尚在人世的亲人重新建立连结。", skill: "手艺" },
  { id: 7, description: "从宪章组织偷来的奢侈腌制品，与它的敌人们一同分享。通过设宴展示合作的无限可能。", skill: "射击" },
  { id: 8, description: "与你敬仰的荒野食客共饮一杯蜜酒。你幻想着向这位传奇人物展示战利品并分享故事。", skill: "储存" },
  { id: 9, description: "来自最高峰顶的泉水。在攀上世界之巅后，希望能有短暂而安静的片刻来品味世界美景。", skill: "穿越" },
  { id: 10, description: "婚宴寿桃，与挚爱并肩坐于上席。变异越深，越怀疑这是否能成为活生生的现实。", skill: "激励" },
  { id: 11, description: "胜利的庆功酒。在狠狠击败敌人、将他们的脸踩在尘土里后举杯共饮，观众越多越好。", skill: "展示" },
  { id: 12, description: "一道前所未有的餐食。在唯一大陆的某处，一定有你将成为第一个品尝的神奇食材。", skill: "搜索" },
  { id: 13, description: "宫廷御膳房里裹满香料的顶级菜肴，配上躬身仆从。想知道极致的奢华是什么滋味。", skill: "储存" },
  { id: 14, description: "由你的恩师所创的一道菜。很久以前便托付食谱给你，在你准备好烹饪它前仍需钻研。", skill: "学习" },
  { id: 15, description: "从巨人盘中夺来的美味馅饼。你吃过最美味的餐食，永远是那些被明令禁止享用的。", skill: "抓取" },
  { id: 16, description: "来自异域的神奇糕点。自幼便听闻关于那个富庶之地的传说，尽管想象可能超越现实。", skill: "穿越" },
  { id: 17, description: "宪章组织茶，巨商做生意专用。传闻他们知道如何在癌变地生存，为得到药你愿意做交易。", skill: "治愈" },
  { id: 18, description: "献给神圣怪物的裹糖苹果。向这只难以捉摸的传说野兽献上并分享祭品是至高无上的荣耀。", skill: "发声" },
  { id: 19, description: "一片来自界门之外的诡异蠕虫。你听过它的惊悚传说，也知道仍有无数异域深渊等待探索。", skill: "学习" },
  { id: 20, description: "一颗巨人之心，血淋淋、生吞活剥。要让他们亲眼看着自己的同类被凶残吞食。", skill: "打击" }
];

// Pre-generated character card definitions (6 templates)
export const PRE_GENS: PreGeneratedCharacter[] = [
  {
    name: "普莱兹",
    specialty: "渔夫",
    adjectives: ["果断", "骇人"],
    tool: "大砍刀",
    stylesChoice: "a",
    styleValues: { power: 3, precision: 2, swiftness: 1, technique: 1 },
    skills: { "搜索": 1, "打击": 1, "展示": 1 },
    traits: ["干净利落斩", "物尽其用", "恐吓", "感知电流"], // "感知电流" can be translated as "回声定位" or special
    companion: {
      name: "小偷",
      description: "一只聪明的长吻跃鱼，会从古代沉船中搜寻宝藏。"
    },
    backgroundMeals: {
      upbringing: { meal: "黑麦酸面包 & 方舟乌木胡椒", text: "酸面包上的烤鱼。你在码头市场搜罗了所有能找到的残羹剩饭，因为父母告诉你永远不要浪费这个世界慷慨给予你的任何东西。", skill: "搜索" },
      motivation: { meal: "类似鲨鱼肉的一碗粥", text: "里面有仔细切成方块的类似鲨鱼肉的肉块。你成为一名运动型荒野者，像猎犬一样协助官员进行狩猎。和他们在一起，你从未挨饿，但他们对你的待遇也仅比狗稍好一点。", skill: "打击" },
      ambition: { meal: "难缠猎物的最好部位", text: "捕获难缠猎物后得到的最好部位。你从未主动索求过它，但你期待有一天，会有人因你出色的工作而将它作为奖励赠予你。", skill: "展示" }
    },
    bond: "一个同伴在官员把你当作死人抛弃后找到并救了你。你欠他们一条命，更欠他一世忠诚。",
    durability: 20
  },
  {
    name: "巴格",
    specialty: "储藏者",
    adjectives: ["乐观", "专注"],
    tool: "防护手套",
    stylesChoice: "b",
    styleValues: { power: 2, precision: 3, swiftness: 1, technique: 1 },
    skills: { "打击": 1, "抓取": 1, "激励": 1 },
    traits: ["近身优势", "身手矫健", "筑巢者", "不知疲倦"],
    companion: {
      name: "丑宝宝",
      description: "一只乐观的幼龙，虽然是一窝中最弱小的，但成功存活到了成年。"
    },
    backgroundMeals: {
      upbringing: { meal: "香辣土豆 & 虫粟", text: "一杯生瓦里蛋、鱼油和草药的混合物。不知怎的，你说服了自己：这东西越恶心，就越能让你变得强壮。从小起你就渴望像传说中的野人一样强大。", skill: "打击" },
      motivation: { meal: "清蒸蝉般怪物", text: "一只蝉般的怪物，带壳清蒸。你从一位年长的野人手中抢了一份，急于证明自己并想要加入对抗狂乱的战斗。你当时没意识到这会让你陷入长达数年的冬眠。", skill: "抓取" },
      ambition: { meal: "上等白咖啡", text: "金钱能买到的最上等白咖啡，用你能拿到的最大杯子盛装。你从沉睡中醒来，仍有些昏昏欲睡，但现在你已准备好掌控自己的未来。你的希望具有感染力。", skill: "激励" }
    },
    bond: "一位同伴承诺要给你从未接受过的训练。但你开始怀疑，他们对如何成为野人的了解并不比你多多少……",
    durability: 20
  },
  {
    name: "娜特·辛",
    specialty: "面包师",
    adjectives: ["果断", "受欢迎"],
    tool: "平底锅",
    stylesChoice: "a",
    styleValues: { power: 3, precision: 1, swiftness: 1, technique: 2 },
    skills: { "储存": 1, "激励": 1, "搜索": 1 },
    traits: ["钢铁之盾", "凝神架势", "天然护甲", "授粉者"],
    companion: {
      name: "甜面包",
      description: "一只温和的猛犸兽，在你称之为家的森林中缓步漫游，啜饮花蜜。"
    },
    backgroundMeals: {
      upbringing: { meal: "悬枝稻米 & 烟花草蜂蜜", text: "冰糖，用你家蜂箱的蜂蜜制成。从小你就学会了口袋里总要备着零食，因为分享它们是你唯一知道的交朋友的方式。", skill: "储存" },
      motivation: { meal: "红烧猛犸兽肉", text: "红烧猛犸兽肉，你勉强让自己吃下去。那只狂乱的猛犸兽留下了一个孤儿，你给它取名甜面包，在放归野外之前，你尽了最大努力去安慰它。", skill: "激励" },
      ambition: { meal: "山坡上的野餐", text: "山坡上的野餐，俯瞰着一处怪物避难所。确信在那里的某个地方，有一个能让你所爱怪物安全栖息的所在。", skill: "搜索" }
    },
    bond: "一位同伴在你照顾甜面包长大的过程中帮了你，为此你永远心存感激。",
    durability: 50 // 20 + 30
  },
  {
    name: "泰伦",
    specialty: "屠夫",
    adjectives: ["高尚", "有礼"],
    tool: "叉子",
    stylesChoice: "b",
    styleValues: { power: 1, precision: 2, swiftness: 3, technique: 1 },
    skills: { "打击": 1, "穿越": 1, "学习": 1 },
    traits: ["疾风脚步", "牵丝引线", "追猎型捕食者", "疾速"],
    companion: {
      name: "洋葱",
      description: "一只亲人的钢丝兔，如今住在你旧神庙的废墟中。"
    },
    backgroundMeals: {
      upbringing: { meal: "芝麻薄饼 & 茴香籽", text: "一片山桃，多汁甘甜。当你训练格外勤奋时，僧侣们总会给你一片作为奖励。你在此练习了基础招式。", skill: "打击" },
      motivation: { meal: "烤至外皮金黄油亮的鸡腿肉", text: "鸡腿肉，烤至外皮金黄油亮。你跋涉数周追踪摧毁修道院的那只怪物，爬陡峭悬崖，翻越寒冷山峰。变异让你的动作异常迅猛敏捷。", skill: "穿越" },
      ambition: { meal: "集市上的麻花", text: "麻花，在拥挤的集市上。有朝一日，当职责尽完，你想坐下来休息，只是看着人来人往。你希望恢复修道院昔日的安宁。", skill: "学习" }
    },
    bond: "你和一位同伴相遇时，你们各自追踪的怪物恰好交叉路径。你们两人联手，互相帮助击倒了彼此的猎物。",
    durability: 20
  },
  {
    name: "莲恩",
    specialty: "调味者",
    adjectives: ["好学", "周全"],
    tool: "喷火器",
    stylesChoice: "b",
    styleValues: { power: 1, precision: 2, swiftness: 1, technique: 3 },
    skills: { "搜索": 1, "治愈": 1, "射击": 1 },
    traits: ["火之血脉", "预热", "再生", "一般性饮食"],
    companion: {
      name: "嫩芽",
      description: "一只固执的树根蟹，它在你一次冒险后跟着你回了家。"
    },
    backgroundMeals: {
      upbringing: { meal: "蒸面包 & 焦椒", text: "夏天最后的几颗朱莓。你在灌木丛中玩耍时采集的。你从鸟儿那里学会了在哪里找到这个季节最后的甜蜜。这也启迪了你的搜寻感官。", skill: "搜索" },
      motivation: { meal: "冷树根蟹 & 酱油香料", text: "冷树根蟹。已清除毒素并用酱油和香料腌制。这只怪物在变得狂暴之前就因污染而生病，你发誓要研究这两者之间的联系并将其治愈。", skill: "治愈" },
      ambition: { meal: "盖了图案的豆包", text: "一个盖了图案的豆包。你在教家人方舟钢的秘密时与他们分享。你研究了方舟钢喷火器的机制多年，快要解开它最后的秘密了。", skill: "射击" }
    },
    bond: "你在同伴年幼时曾多次为他们下厨。他们深信你的料理是他们吃过的最佳美味，可事实上，那只是你所会做的最快、最简单的一道菜。",
    durability: 20
  },
  {
    name: "诺特",
    specialty: "变形者",
    adjectives: ["灵活", "温柔"],
    tool: "钢绳",
    stylesChoice: "a",
    styleValues: { power: 1, precision: 1, swiftness: 3, technique: 2 },
    skills: { "抓取": 1, "手艺": 1, "穿越": 1 },
    traits: ["套索牵引", "应急修补", "伪装", "整口吞下"],
    companion: {
      name: "巨人杀手",
      description: "一只警惕的阴影翡翠鸟，被猎人们追逐多年。"
    },
    backgroundMeals: {
      upbringing: { meal: "苔藓-钉 & 岩盐", text: "叮当火锅。这是你的偷渡同伴给那锅点缀着苔藓与岩盐的炖菜起的绰号，你们偷偷溜上火车，从货物中偷来吃。对你来说车厢就是巨大的储物柜。", skill: "抓取" },
      motivation: { meal: "煎得恰到好处的怪物牛排", text: "怪物牛排。煎得恰到好处——你在破损的陷阱中间直接烹饪并享用了它。你的机械原型全都惨败，除了最终捕获猎物的那个装置起到了作用。", skill: "手艺" },
      ambition: { meal: "丰盛的庆功宴", text: "一场丰盛的庆功宴，由来自大陆各地的追随者共享。你梦想着战胜巨人，流传千古的荣耀，在整个一元之地上被广为传颂。你正带着热情在荒原中奔走。", skill: "穿越" }
    },
    bond: "你向一位同伴倾诉了反抗巨人的梦想。你的目标中的某些东西引起了他们的共鸣，但他们对你的口号和自制旗帜似乎并不感冒。",
    durability: 20
  }
];
