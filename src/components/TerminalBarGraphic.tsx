import React from 'react';

/**
 * Barrette de bornes à vis : une seule forme, plusieurs couleurs.
 * Corps plat coloré, deux embouts plus foncés avec un trou de fixation blanc,
 * et une rangée de vis grises à tête cruciforme entre les deux.
 */
const PALETTE: Record<string, { body: string; cap: string; edge: string }> = {
  green: { body: '#1f9d1f', cap: '#0f6f12', edge: '#0a5a0d' },
  yellow: { body: '#e8c52e', cap: '#b6960f', edge: '#8a700a' },
  black: { body: '#585c63', cap: '#2e3137', edge: '#17191d' },
  blue: { body: '#2f6fe0', cap: '#1f4fb4', edge: '#163c8c' },
  orange: { body: '#f08a24', cap: '#b9620f', edge: '#8a460a' },
  red: { body: '#d94a4a', cap: '#a32c2c', edge: '#7a1f1f' },
};

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
const darken = (hex: string, f: number) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = clamp(((n >> 16) & 255) * f);
  const g = clamp(((n >> 8) & 255) * f);
  const b = clamp((n & 255) * f);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/** Couleur de la barrette : nom connu, « #334155 » du tiroir (= noir) ou code hexadécimal quelconque. */
export const terminalBarColors = (color?: string) => {
  if (!color) return PALETTE.blue;
  if (PALETTE[color]) return PALETTE[color];
  if (color.toLowerCase() === '#334155') return PALETTE.black;
  if (/^#[0-9a-f]{6}$/i.test(color)) return { body: color, cap: darken(color, 0.7), edge: darken(color, 0.5) };
  return PALETTE.blue;
};

interface TerminalBarGraphicProps {
  /** Nombre de vis (contacts). */
  count: number;
  color?: string;
  className?: string;
}

const H = 22;
const PITCH = 0.664 * H;
const CAP = 0.77 * H;
const PAD = 1;

export const terminalBarWidth = (count: number) => H * (2.2 + 0.664 * Math.max(1, count));

export const TerminalBarGraphic: React.FC<TerminalBarGraphicProps> = ({ count, color, className }) => {
  const n = Math.max(1, Math.round(count));
  const W = terminalBarWidth(n);
  const c = terminalBarColors(color);
  const rScrew = 0.19 * H;
  const rHole = 0.17 * H;
  const startX = PAD + CAP + (W - 2 * CAP - n * PITCH) / 2 + PITCH / 2;
  const cy = PAD + H / 2;

  return (
    <svg viewBox={`0 0 ${W + PAD * 2} ${H + PAD * 2}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="tbg-screw" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#c3cad6" />
          <stop offset="1" stopColor="#8f98a8" />
        </radialGradient>
      </defs>

      {/* Corps + embouts plus foncés */}
      <rect x={PAD} y={PAD} width={W} height={H} rx={0.6} fill={c.body} stroke={c.edge} strokeWidth={1} />
      <rect x={PAD + 0.5} y={PAD + 0.5} width={CAP} height={H - 1} fill={c.cap} />
      <rect x={PAD + W - CAP - 0.5} y={PAD + 0.5} width={CAP} height={H - 1} fill={c.cap} />

      {/* Trous de fixation */}
      <circle cx={PAD + CAP * 0.5} cy={cy} r={rHole} fill="#ffffff" stroke="#d1d5db" strokeWidth={0.5} />
      <circle cx={PAD + W - CAP * 0.5} cy={cy} r={rHole} fill="#ffffff" stroke="#d1d5db" strokeWidth={0.5} />

      {/* Vis à tête cruciforme */}
      {Array.from({ length: n }).map((_, i) => {
        const x = startX + i * PITCH;
        const k = rScrew * 0.5;
        return (
          <g key={i}>
            <circle cx={x} cy={cy} r={rScrew} fill="url(#tbg-screw)" stroke="#6b7280" strokeWidth={0.6} />
            <path d={`M${x - k} ${cy - k} L${x + k} ${cy + k} M${x + k} ${cy - k} L${x - k} ${cy + k}`} stroke="#4b5563" strokeWidth={1.2} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};
