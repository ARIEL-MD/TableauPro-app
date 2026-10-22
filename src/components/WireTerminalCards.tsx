import React, { useState } from 'react';

/**
 * Cartes « Barres et bornes pour fils » — reproduction à l'identique de la capture de référence
 * (sans badge PRO). Toutes les dimensions viennent de la capture (carte gauche 445×201,
 * carte droite 312×147) et sont multipliées par S pour tenir dans le tiroir.
 */
const S = 0.55;
const px = (n: number) => n * S;

const CARD_BG = '#6f6f6f';
const BTN_BG = '#848484';

type ChipKey = 'blue' | 'orange' | 'dark' | 'yellow' | 'green' | 'red';
const CHIPS: Record<ChipKey, { hex: string; value: string }> = {
  blue: { hex: '#4ba9f3', value: 'blue' },
  orange: { hex: '#fdaa32', value: 'orange' },
  dark: { hex: '#454545', value: '#334155' },
  yellow: { hex: '#fced60', value: 'yellow' },
  green: { hex: '#6ebc71', value: 'green' },
  red: { hex: '#f4665c', value: 'red' },
};

// Mélange simple d'une couleur hex avec du noir (t<0) ou du blanc (t>0)
const shade = (hex: string, t: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(t < 0 ? c * (1 + t) : c + (255 - c) * t);
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/** Dessin de la barre à vis (8 contacts) — viewBox 84×12, comme sur la capture. */
export const BarDrawing: React.FC<{ color?: string; contacts?: number; width: number }> = ({
  color = '#6f9be6',
  contacts = 8,
  width,
}) => {
  const dark = shade(color, -0.55);
  const first = 16;
  const step = (68 - 16) / 7;
  const last = first + step * (contacts - 1);
  const vbW = Math.max(84, last + 16);
  return (
    <svg width={width} height={(width * 12) / vbW} viewBox={`0 0 ${vbW} 12`} aria-hidden>
      <rect x="0" y="0" width={vbW} height="12" fill={dark} />
      <rect x="0.3" y="1" width={vbW - 0.6} height="10" fill={color} />
      <rect x="8.4" y="1.8" width="1.3" height="8.4" fill={dark} />
      <rect x={vbW - 9.7} y="1.8" width="1.3" height="8.4" fill={dark} />
      <circle cx="4" cy="6" r="1.6" fill={shade(color, -0.15)} />
      <circle cx={vbW - 4} cy="6" r="1.6" fill={shade(color, -0.15)} />
      {Array.from({ length: contacts }).map((_, i) => (
        <g key={i}>
          <circle cx={first + step * i} cy="6" r="2.4" fill="#e8eef7" stroke="#aebfda" strokeWidth="0.3" />
          <circle cx={first + step * i} cy="6" r="1.1" fill="#5d6a80" />
        </g>
      ))}
    </svg>
  );
};

/** Dessin de la borne simple — viewBox 18×72, comme sur la capture. */
export const SimpleDrawing: React.FC<{ color?: string; height: number }> = ({
  color = '#4f86b3',
  height,
}) => {
  const light = shade(color, 0.35);
  const mid = shade(color, -0.12);
  return (
    <svg width={(height * 18) / 72} height={height} viewBox="0 0 18 72" aria-hidden>
      <rect width="18" height="72" fill={color} />
      <g stroke={mid} strokeWidth="0.5">
        <path d="M0 2.5H18M0 5H18M0 7.5H18M0 64.5H18M0 67H18M0 69.5H18" />
      </g>
      <rect y="9" width="18" height="18" fill={light} />
      <rect y="45" width="18" height="18" fill={light} />
      <rect y="27" width="18" height="18" fill={mid} />
      <rect x="7" y="31" width="4" height="10" fill="#e8ebee" />
      <g fill="none" stroke="#5a6672" strokeWidth="0.5">
        <circle cx="9" cy="18" r="3.6" />
        <path d="M7.4 16.4L10.6 19.6M10.6 16.4L7.4 19.6" />
        <circle cx="9" cy="54" r="3.6" />
        <path d="M7.4 52.4L10.6 55.6M10.6 52.4L7.4 55.6" />
      </g>
    </svg>
  );
};

const Chip: React.FC<{ hex: string; selected: boolean; onClick: (e: React.MouseEvent) => void; x: number; y: number; label: string }> = ({
  hex, selected, onClick, x, y, label,
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    style={{
      position: 'absolute',
      left: px(x - 22),
      top: px(y - 22),
      width: px(44),
      height: px(44),
      borderRadius: '50%',
      backgroundColor: hex,
      border: selected ? `${Math.max(2, px(4))}px solid #ffffff` : 'none',
      boxSizing: 'border-box',
      cursor: 'pointer',
      padding: 0,
    }}
  />
);

const RoundBtn: React.FC<{ x: number; y: number; onClick: (e: React.MouseEvent) => void; children: React.ReactNode; label: string }> = ({
  x, y, onClick, children, label,
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    style={{
      position: 'absolute',
      left: px(x - 20),
      top: px(y - 20),
      width: px(40),
      height: px(40),
      borderRadius: '50%',
      background: BTN_BG,
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: px(34),
      lineHeight: 1,
      padding: 0,
    }}
  >
    {children}
  </button>
);

const labelStyle = (x: number): React.CSSProperties => ({
  position: 'absolute',
  left: px(x - 90),
  width: px(180),
  top: px(112 - 14),
  textAlign: 'center',
  color: '#fff',
  fontSize: px(24),
  fontWeight: 400,
  whiteSpace: 'nowrap',
});

interface Props {
  onAddTerminalBar: (type: 'screw' | 'spring' | 'simple' | 'custom', holes: number, color?: string) => void;
}

export const WireTerminalCards: React.FC<Props> = ({ onAddTerminalBar }) => {
  const [barColor, setBarColor] = useState<ChipKey>('blue');
  const [simpleColor, setSimpleColor] = useState<ChipKey>('blue');
  const [contacts, setContacts] = useState(8);

  const barPalette: Record<ChipKey, string> = {
    blue: '#6f9be6', orange: '#f0b25e', dark: '#6b7585', yellow: '#efe27a', green: '#8cc98f', red: '#ee8a82',
  };
  const simplePalette: Record<ChipKey, string> = {
    blue: '#4f86b3', orange: '#d49440', dark: '#4d5560', yellow: '#cdbb45', green: '#5a9f62', red: '#c9615a',
  };

  // Carte de gauche : ligne 1 = bleu, orange, sombre — ligne 2 = jaune, vert
  const leftChips: { k: ChipKey; x: number; y: number }[] = [
    { k: 'blue', x: 286, y: 46 }, { k: 'orange', x: 343, y: 46 }, { k: 'dark', x: 399, y: 46 },
    { k: 'yellow', x: 286, y: 103 }, { k: 'green', x: 343, y: 103 },
  ];
  // Carte de droite : ligne 1 = bleu, orange, rouge — ligne 2 = jaune, vert, sombre
  const rightChips: { k: ChipKey; x: number; y: number }[] = [
    { k: 'blue', x: 154, y: 46 }, { k: 'orange', x: 211, y: 46 }, { k: 'red', x: 267, y: 46 },
    { k: 'yellow', x: 154, y: 103 }, { k: 'green', x: 211, y: 103 }, { k: 'dark', x: 267, y: 103 },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: px(12), overflowX: 'auto', paddingBottom: 4 }}>
      {/* Carte gauche : barre N contacts */}
      <div
        onClick={() => onAddTerminalBar('custom', contacts, CHIPS[barColor].value)}
        style={{
          position: 'relative', flexShrink: 0, cursor: 'pointer',
          width: px(445), height: px(201), borderRadius: px(28), background: CARD_BG,
        }}
      >
        <div style={{ position: 'absolute', left: px(127 - 42), top: px(53 - 6), width: px(84) }}>
          <BarDrawing color={barPalette[barColor]} contacts={Math.min(contacts, 8)} width={px(84)} />
        </div>
        <div style={labelStyle(127)}>{contacts} contacts</div>
        {leftChips.map((c) => (
          <Chip key={c.k} label={`Couleur ${c.k}`} hex={CHIPS[c.k].hex} selected={barColor === c.k}
            x={c.x} y={c.y} onClick={(e) => { e.stopPropagation(); setBarColor(c.k); }} />
        ))}
        <RoundBtn x={280} y={163} label="Moins de contacts"
          onClick={(e) => { e.stopPropagation(); setContacts((n) => Math.max(2, n - 1)); }}>−</RoundBtn>
        <div style={{
          position: 'absolute', left: px(328 - 20), top: px(163 - 18), width: px(40), height: px(36),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: px(30),
        }}>{contacts}</div>
        <RoundBtn x={375} y={163} label="Plus de contacts"
          onClick={(e) => { e.stopPropagation(); setContacts((n) => Math.min(30, n + 1)); }}>+</RoundBtn>
      </div>

      {/* Carte droite : borne simple */}
      <div
        onClick={() => onAddTerminalBar('simple', 1, CHIPS[simpleColor].value)}
        style={{
          position: 'relative', flexShrink: 0, cursor: 'pointer',
          width: px(312), height: px(147), borderRadius: px(28), background: CARD_BG,
        }}
      >
        <div style={{ position: 'absolute', left: px(61 - 9), top: px(17) }}>
          <SimpleDrawing color={simplePalette[simpleColor]} height={px(72)} />
        </div>
        <div style={labelStyle(61)}>Simple</div>
        {rightChips.map((c) => (
          <Chip key={c.k} label={`Couleur ${c.k}`} hex={CHIPS[c.k].hex} selected={simpleColor === c.k}
            x={c.x} y={c.y} onClick={(e) => { e.stopPropagation(); setSimpleColor(c.k); }} />
        ))}
      </div>
    </div>
  );
};
