import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// All icons rendered as rustic, thick-stroke hand-drawn ink sketches (strokeWidth=2.2, strokeLinecap="round", strokeLinejoin="round")
export const InkFish: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2C11.5 5 9.5 8 6 9c-3 1-4 3.5-4 5s2.5 3 5 2c3.5-1.5 5.5-4.5 5-9" />
    <path d="M12 9c.5 4.5 2.5 7.5 6 9 2.5 1 5-.5 5-2s-1-4-4-5c-3.5-1-5.5-4-5-11" />
    <path d="M12 2c-.5 2-.5 4 0 7" />
    <path d="M6 13c1.5-.5 3 .5 4 2" />
    <path d="M14 11c1 .5 2 1.5 2 3" />
  </svg>
);

export const InkWheat: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 22c1-3.5 3.5-6.5 6.5-8.5" />
    <path d="M20 2c-1.5 1.5-2.5 3.5-2.5 5.5 0 1 .5 2 1.5 2.5s2.5-.5 3-2.5c.5-2-1-4-2-5.5z" />
    <path d="M13 5c-1.5.5-2.5 2-2.5 3.5s.5 2.5 1.5 3 2.5-.5 3.5-2.5c.5-2-.5-4-1.5-5.5z" />
    <path d="M16 9c-1 1-1.5 2.5-1 3.5s1.5 1.5 2.5 1 2-2 1.5-3.5c-.5-1.5-1.5-2-2-2.5z" />
    <path d="M8 11c-1.5.5-2.5 2-2.5 3.5s.5 2.5 1.5 3 2.5-.5 3.5-2.5c.5-2-.5-4-1.5-5.5z" />
  </svg>
);

export const InkMeat: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M15 3c-4.5 0-8.5 2-10.5 5-2 3.5-1 8 2.5 10s8.5 1 10.5-2c2-3.5 1-8.5-2.5-11z" />
    <path d="M4.5 18l-2.5 3" />
    <path d="M19.5 6l2.5-3" />
    <path d="M12 11c1.5-1.5 3.5-1.5 4.5 0s.5 3.5-1 4.5-3.5.5-4.5-1-1-2.5 1-3.5z" />
  </svg>
);

export const InkFlame: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z" />
  </svg>
);

export const InkLeaf: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 21 2c-1 5-1.5 7.5-6.1 13.2A7 7 0 0111 20z" />
    <path d="M11 20l-8 2" />
    <path d="M12.5 11.5c1.5-1.5 3-2 5-2.5" />
  </svg>
);

export const InkChest: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 8h18" />
    <rect x="3" y="4" width="18" height="15" rx="2" />
    <path d="M10 11v3h4v-3" />
    <path d="M12 4v4" />
  </svg>
);

export const InkSpiral: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2a10 10 0 1010 10c0-4.5-3.5-8-8-8a6 6 0 100 12c2.5 0 4-1.5 4-4a2 2 0 10-4 0" />
  </svg>
);

export const InkMortar: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 10h16" />
    <path d="M4 10c1 6.5 4.5 10 8 10s7-3.5 8-10" />
    <path d="M15 4l-4 6" />
    <circle cx="15" cy="4" r="1.5" />
  </svg>
);

// Tool Icons
export const InkSword: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l2 2m1.5-5.5l4 4-2 2-4-4" />
    <path d="M19 14.5l2 2" />
  </svg>
);

export const InkGlove: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 11V6a2 2 0 00-4 0v5" />
    <path d="M14 10V4a2 2 0 00-4 0v6" />
    <path d="M10 11V5a2 2 0 00-4 0v6" />
    <path d="M6 14v4" />
    <path d="M6 11c-1.5.5-2 2-2 3.5v4.5A3 3 0 007.5 22h9a3 3 0 003-3v-8H18" />
  </svg>
);

export const InkPan: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16 16l6 6" />
    <path d="M11 6a5 5 0 015 5" />
  </svg>
);

export const InkFork: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 2v10a3 3 0 01-3 3h-3m-6-13v10a3 3 0 003 3h3" />
    <path d="M12 2v13" />
    <path d="M12 15v7" />
  </svg>
);

export const InkLasso: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 15a6 6 0 100-12 6 6 0 000 12z" />
    <path d="M18 12c1 3.5-1 7.5-4.5 9s-7.5-1-9-4.5" />
  </svg>
);

// Extra monster/silhouette symbols instead of Emojis
export const InkWolf: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2l3 4 5-1-2 5 2 3-4 1-2 5-2-5-4-1-2-3 2-5-5 1 3-4 4 1z" />
  </svg>
);

export const InkEagle: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2l3 5c2-.5 4-1 6-2l-3 5 4 2-8 3-2 6-2-6-8-3 4-2-3-5c2 1 4 1.5 6 2l3-5z" />
  </svg>
);

export const InkBear: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="5" cy="5" r="2.5" />
    <circle cx="19" cy="5" r="2.5" />
    <path d="M12 6c-5 0-8 3-8 8.5v3.5A2 2 0 006 20h12a2 2 0 002-2v-3.5c0-5.5-3-8.5-8-8.5z" />
    <circle cx="9" cy="13" r="1" />
    <circle cx="15" cy="13" r="1" />
    <path d="M11 16h2" />
  </svg>
);

export const InkDragon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2l2 4 4 1-3 3.5 1 4.5-4-2-4 2 1-4.5-3-3.5 4-1z" />
    <path d="M12 11c0 4.5 2.5 8 6 9.5" />
    <path d="M12 11c0 4.5-2.5 8-6 9.5" />
  </svg>
);

export const InkTree: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2L3 14h6v6h6v-6h6L12 2z" />
    <path d="M12 20v2" />
  </svg>
);

// Map visual components for easy lookup by name
export const getInkIcon = (name: string, size = 24, className = ''): React.ReactNode => {
  switch (name) {
    // Specialties
    case '渔夫': return <InkFish size={size} className={className} />;
    case '面包师': return <InkWheat size={size} className={className} />;
    case '屠夫': return <InkMeat size={size} className={className} />;
    case '调味者': return <InkMortar size={size} className={className} />;
    case '储藏者': return <InkChest size={size} className={className} />;
    case '变形者': return <InkSpiral size={size} className={className} />;
    case '园丁': return <InkLeaf size={size} className={className} />;
    case '烧烤师': return <InkFlame size={size} className={className} />;

    // Tools
    case '大砍刀': return <InkSword size={size} className={className} />;
    case '防护手套': return <InkGlove size={size} className={className} />;
    case '平底锅': return <InkPan size={size} className={className} />;
    case '叉子': return <InkFork size={size} className={className} />;
    case '喷火器': return <InkFlame size={size} className={className} />;
    case '钢绳': return <InkLasso size={size} className={className} />;

    // Extra silhouettes
    case 'wolf': return <InkWolf size={size} className={className} />;
    case 'eagle': return <InkEagle size={size} className={className} />;
    case 'bear': return <InkBear size={size} className={className} />;
    case 'dragon': return <InkDragon size={size} className={className} />;
    case 'tree': return <InkTree size={size} className={className} />;
    default: return null;
  }
};

// 6 Full Character Ink Portrait Sketches for the Roster / Character Cards
export const PrisePortrait: React.FC<IconProps> = ({ size = 200, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Head & Gills */}
    <path d="M45 25c0-4 3-8 5-8s5 4 5 8c0 5-2 9-5 9s-5-4-5-9z" />
    <path d="M42 22c-2 1-3 3-3 5m16-5c2 1 3 3 3 5" />
    {/* Body / Coat */}
    <path d="M35 34c5 1 25 1 30 0l5 30H30l5-30z" fill="none" />
    <path d="M38 34c2 10 2 20 0 30m24-30c-2 10-2 20 0 30" />
    <path d="M42 34l8 12 8-12" />
    {/* Giant Machete */}
    <path d="M68 28l18-18c2-2 4 0 3 2L75 26l-2-2z" fill="#f4f1ea" />
    <path d="M65 42l10-14" strokeWidth="3" />
    <path d="M72 18l3 3m2-12l3 3" />
    {/* Left hand & Handle */}
    <path d="M65 42l4 4-2 2-4-4z" />
    {/* Right Hand & Fish */}
    <path d="M32 50s-4 4-2 6 6-2 6-2" />
    <path d="M22 55c2-2 4-2 5-1s2 3 0 5-5 2-6-1z" />
    <path d="M27 58l4 2m-8-2l-3 1" />
  </svg>
);

export const BagPortrait: React.FC<IconProps> = ({ size = 200, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Head & Cute face */}
    <path d="M50 20c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" />
    <path d="M47 26h1m4 0h1m-5 4a3 3 0 004 0" />
    {/* Left glove - huge forearm guard */}
    <path d="M25 45h15v18H25z" fill="#f4f1ea" strokeWidth="2.5" />
    <path d="M22 45l3-5h12l3 5" />
    <path d="M32 50v8" />
    {/* Right glove */}
    <path d="M60 45h15v18H60z" fill="#f4f1ea" strokeWidth="2.5" />
    <path d="M57 45l3-5h12l3 5" />
    <path d="M67 50v8" />
    {/* Little dragon on shoulder */}
    <path d="M68 22c3-1 6-2 7 1s-1 5-4 6" />
    <path d="M73 23c2-1 4-1 4 1" />
    {/* Feet / Sturdy base */}
    <path d="M38 63v12h6M62 63v12h-6" />
  </svg>
);

export const NatShinPortrait: React.FC<IconProps> = ({ size = 200, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Friendly Round Head */}
    <path d="M50 18c-6 0-11 4-11 10s5 10 11 10 11-4 11-10-5-10-11-10z" />
    {/* Baker's Chef Hat outline */}
    <path d="M43 18c-2-3-1-7 2-8s7 .5 7 3c1-2.5 4-4 7-3s4 5 2 8" />
    <path d="M42 18h16" />
    {/* Frying Pan Shield in Left Hand */}
    <circle cx="28" cy="48" r="14" fill="#f4f1ea" strokeWidth="2.5" />
    <path d="M28 62v14" strokeWidth="3" />
    <path d="M20 48c2 4.5 5 7 8 7s6-2.5 8-7" />
    {/* Gentle Mammoth silhouette background */}
    <path d="M65 30c5-5 12-5 16-2s3 10-1 15-12 10-15 15l-1 8" strokeDasharray="3 3" />
    <path d="M74 38c2-2 5-1 6 1s-1 5-3 6" />
    {/* Baker apron */}
    <path d="M44 38l-4 30h20l-4-30H44z" />
  </svg>
);

export const TylonPortrait: React.FC<IconProps> = ({ size = 200, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Head & Long Bunny Ears */}
    <path d="M50 25c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" />
    <path d="M43 26c-1-6-3-12-3-14s2-2 3 2l3 10M57 26c1-6 3-12 3-14s-2-2-3 2l-3 10" />
    {/* Long Triple Pronged Fork Spear */}
    <path d="M28 8v72" strokeWidth="2.5" />
    <path d="M24 14V8a2 2 0 014 0m0 0a2 2 0 014 0v6" />
    <path d="M20 14h16" />
    {/* Sleek robe */}
    <path d="M42 43c-2 10-4 22-6 32h28c-2-10-4-22-6-32" />
    <path d="M47 43l3 8 3-8" />
    {/* Cute onion rabbit companion */}
    <path d="M72 65c2-2 5-2 6 0s1 4-2 6-6 1-6-1m1-3l2-4" />
  </svg>
);

export const LanePortrait: React.FC<IconProps> = ({ size = 200, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Hooded head */}
    <path d="M50 22c-6 0-11 5-11 11s5 11 11 11 11-5 11-11-5-11-11-11z" />
    <path d="M37 32c0-8 6-12 13-12s13 4 13 12c0 10-6 14-13 14s-13-4-13-14z" fill="none" />
    {/* Flamethrower brass tank on back */}
    <path d="M30 40h12v25H30z" fill="#f4f1ea" />
    {/* Nozzle burner in hand */}
    <path d="M52 48l18 8" strokeWidth="2.5" />
    <path d="M68 53l3 3" strokeWidth="3.5" />
    {/* Flame blast */}
    <path d="M72 56c4-2 8-1 10 3s0 7-5 8-8-2-10-5" strokeWidth="1.5" />
    <path d="M75 58c2-1 4 0 5 2s0 3-2 3" strokeWidth="1" />
    {/* Root Crab companion claw */}
    <path d="M24 64c-3 1-5 4-5 6s4 3 6 1l1-5" />
    <path d="M22 68l-3 3" />
  </svg>
);

export const NottPortrait: React.FC<IconProps> = ({ size = 200, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Gymnastic Head & Feathers / Mask */}
    <path d="M50 22c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" />
    <path d="M41 26c-2 0-4-2-4-4s2-1 4 2m18 2c2 0 4-2 4-4s-2-1-4 2" />
    {/* Flying emerald bird feathers on shoulder */}
    <path d="M34 38c-3 1-7 4-10 8l3 2 7-6m32 2c3 1 7 4 10 8l-3 2-7-6" />
    {/* Slender athletic body */}
    <path d="M44 40l-2 32h16l-2-32H44z" />
    {/* Steel wire loops / lasso */}
    <path d="M42 55c-6 3-10 8-10 12s6 6 12 2 10-8 10-12" strokeWidth="1.5" />
    <path d="M58 55c6 3 10 8 10 12s-6 6-12 2-10-8-10-12" strokeWidth="1.5" />
  </svg>
);

// Companion custom drawing
export const DefaultPortrait: React.FC<IconProps> = ({ size = 200, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="25" y="25" width="50" height="50" rx="4" strokeDasharray="4 4" />
    <path d="M35 55l10-10 12 12 8-8 10 10" />
    <circle cx="45" cy="40" r="3" />
    <text x="50" y="68" textAnchor="middle" fontSize="6" fontFamily="serif" stroke="none" fill="currentColor">H u n t e r</text>
  </svg>
);

export const getCharacterPortrait = (name: string, size = 200, className = ''): React.ReactNode => {
  switch (name) {
    case '普莱兹': return <PrisePortrait size={size} className={className} />;
    case '巴格': return <BagPortrait size={size} className={className} />;
    case '娜特·辛': return <NatShinPortrait size={size} className={className} />;
    case '泰伦': return <TylonPortrait size={size} className={className} />;
    case '莲恩': return <LanePortrait size={size} className={className} />;
    case '诺特': return <NottPortrait size={size} className={className} />;
    default: return <DefaultPortrait size={size} className={className} />;
  }
};
