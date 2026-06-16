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
