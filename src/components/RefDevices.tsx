import React from 'react';

/**
 * Trois appareils dessinés à l'identique des captures de référence :
 *  - le voyant (fine réglette grise à deux bandes de couleur),
 *  - le Guardmotor (boîtier blanc, boutons rouge « OFF » et vert « ON », barre bleue),
 *  - l'interrupteur-sectionneur inverseur (boîtier gris foncé, bande rouge, manette centrale).
 *
 * Toutes les cotes sont des fractions de la hauteur / largeur relevées sur les captures.
 * Les valeurs de METER_GEOMETRY (meterGeometry.ts) reprennent les mêmes proportions pour que
 * les ancres de câblage tombent exactement sur les vis dessinées.
 */

/* ------------------------------------------------------------------ */
/*  Voyant                                                              */
/* ------------------------------------------------------------------ */

export type IndicatorColorName = 'red' | 'teal' | 'yellow' | 'blue' | 'white';

/** Couleurs des pastilles de la capture (rouge, turquoise, jaune, bleu, blanc). */
export const INDICATOR_COLORS: Record<IndicatorColorName, string> = {
  red: '#ca4246',
  teal: '#56c8c9',
  yellow: '#edd678',
  blue: '#35a0d6',
  white: '#f6f7f9',
};

/** Liseré plus foncé des pastilles non sélectionnées. */
export const INDICATOR_RIMS: Record<IndicatorColorName, string> = {
  red: '#b0373b',
  teal: '#47aeb0',
  yellow: '#d2bb5c',
  blue: '#2c88b8',
  white: '#c3c6ca',
};

/** Assombrit un « #rrggbb » (0 = inchangé, 1 = noir). */
const darken = (hex: string, amount: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - amount));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/** Hauteur du dessin d'un voyant (celle d'un appareil modulaire sur le plan) et largeur d'une lampe (1 module). */
export const INDICATOR_H = 118;
export const INDICATOR_CELL = 36;

export const IndicatorLightDevice: React.FC<{
  color?: string;
  count?: number;
  className?: string;
}> = ({ color, count = 1, className }) => {
  const key = (color && color in INDICATOR_COLORS ? color : 'red') as IndicatorColorName;
  const lens = INDICATOR_COLORS[key];
  const isWhite = key === 'white';
  const n = Math.max(1, Math.min(3, count));
  const W = INDICATOR_CELL * n;
  const H = INDICATOR_H;
  const bandStroke = isWhite ? '#9aa0a8' : 'none';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rf-vbody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cbcfcf" />
          <stop offset="0.45" stopColor="#d7dadb" />
          <stop offset="1" stopColor="#cacdce" />
        </linearGradient>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const cx = INDICATOR_CELL * i + INDICATOR_CELL / 2;
        const x0 = cx - 7;
        return (
          <g key={i}>
            {/* Réglette grise, deux fins traits sombres sur les côtés */}
            <rect x={x0} y={0.6} width={14} height={116.8} rx={1.2} fill="url(#rf-vbody)" />
            <rect x={x0} y={0.6} width={1.4} height={116.8} fill="#474749" />
            <rect x={x0 + 12.6} y={0.6} width={1.4} height={116.8} fill="#474749" />

            {/* Repères imprimés du haut : petits points, trait, cuvette pleine */}
            <rect x={cx - 3.2} y={10.6} width={1.6} height={0.6} fill="#c3c8ca" />
            <rect x={cx + 1.6} y={10.6} width={1.6} height={0.6} fill="#c3c8ca" />
            <line x1={cx + 1.3} y1={12.2} x2={cx + 0.4} y2={14.9} stroke="#4d5559" strokeWidth={0.8} strokeLinecap="round" />
            <path
              d={`M${cx - 3} 17.6 Q${cx - 3.3} 22.4 ${cx} 23.4 Q${cx + 3.3} 22.4 ${cx + 3} 17.6 Q${cx} 16.2 ${cx - 3} 17.6 Z`}
              fill="#4d5559"
            />
            <rect x={cx - 3.4} y={24.6} width={6.8} height={0.6} fill="#b4bcbc" />

            {/* Première bande de couleur */}
            <rect x={x0 + 1.4} y={28.6} width={11.2} height={6.3} fill={lens} stroke={bandStroke} strokeWidth={0.4} />

            {/* Petits repères entre les bandes */}
            <circle cx={cx - 1.4} cy={38} r={0.5} fill="#c7a3a5" />
            <circle cx={cx + 1.4} cy={38} r={0.5} fill="#c7a3a5" />
            <path d={`M${cx - 1.4} 41.2 L${cx + 1.4} 41.2 L${cx} 45 Z`} fill="#a4a9ac" />

            {/* Seconde bande de couleur, un peu plus sombre */}
            <rect x={x0 + 1.4} y={72.2} width={11.2} height={6.3} fill={darken(lens, 0.16)} stroke={bandStroke} strokeWidth={0.4} />

            {/* Bas : filet, dôme plein (type ampoule) et point */}
            <rect x={cx - 3.6} y={90.2} width={7.2} height={0.7} fill="#b4bcbc" />
            <path
              d={`M${cx - 2.8} 101.8 L${cx - 2.8} 98.4 Q${cx - 2.8} 94.8 ${cx} 94.8 Q${cx + 2.8} 94.8 ${cx + 2.8} 98.4 L${cx + 2.8} 101.8 Z`}
              fill="#4f555a"
            />
            <rect x={cx - 1.7} y={101.8} width={3.4} height={1.6} fill="#4f555a" />
            <circle cx={cx} cy={105.8} r={0.95} fill="#4f555a" />
          </g>
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Guardmotor                                                          */
/* ------------------------------------------------------------------ */

/** Une vis ronde à tête cruciforme, comme sur les bornes de la capture. */
const RefScrew: React.FC<{ cx: number; cy: number; r: number; fill: string; rim: string; mark: string }> = ({
  cx,
  cy,
  r,
  fill,
  rim,
  mark,
}) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={fill} stroke={rim} strokeWidth={r * 0.16} />
    <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="#ffffff" strokeOpacity={0.28} strokeWidth={r * 0.1} />
    <path
      d={`M${cx - r * 0.42} ${cy - r * 0.42} L${cx + r * 0.42} ${cy + r * 0.42} M${cx + r * 0.42} ${cy - r * 0.42} L${cx - r * 0.42} ${cy + r * 0.42}`}
      stroke={mark}
      strokeWidth={r * 0.2}
      strokeLinecap="round"
    />
  </g>
);

/** Dessin sur 72 × 118 : le boîtier (58 × 116) est centré dans la cellule de 2 modules. */
export const GUARDMOTOR_VIEW = { w: 72, h: 118 };

export const GuardmotorDevice: React.FC<{ className?: string }> = ({ className }) => {
  const { w, h } = GUARDMOTOR_VIEW;
  const bx = 7;
  const by = 1;
  const bw = 58;
  const bh = 116;
  const fx = (f: number) => bx + f * bw;
  const fy = (f: number) => by + f * bh;
  const tr = 5.7; // rayon des vis
  const xs = [0.175, 0.498, 0.818].map(fx);
  const topY = fy(0.067);
  const botY = fy(0.92);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rf-gbody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9dbde" />
          <stop offset="0.3" stopColor="#eceef0" />
          <stop offset="0.75" stopColor="#e6e8ea" />
          <stop offset="1" stopColor="#d3d6da" />
        </linearGradient>
        <linearGradient id="rf-gred" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e24f4f" />
          <stop offset="1" stopColor="#bf3a3d" />
        </linearGradient>
        <linearGradient id="rf-ggreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3aa56c" />
          <stop offset="1" stopColor="#2a8955" />
        </linearGradient>
      </defs>

      {/* Boîtier */}
      <rect x={bx} y={by} width={bw} height={bh} rx={2.2} fill="url(#rf-gbody)" stroke="#a3a8af" strokeWidth={0.7} />

      {/* Bandeau en creux sous les bornes du haut */}
      <rect x={bx + 0.4} y={fy(0.185)} width={bw - 0.8} height={bh * 0.105} fill="#d2d6da" />
      <line x1={bx + 0.4} y1={fy(0.185)} x2={bx + bw - 0.4} y2={fy(0.185)} stroke="#b6bbc1" strokeWidth={0.6} />
      <line x1={bx + 0.4} y1={fy(0.29)} x2={bx + bw - 0.4} y2={fy(0.29)} stroke="#f5f6f7" strokeWidth={0.6} />

      {/* Bornes du haut et leurs repères */}
      {xs.map((x, i) => (
        <g key={`t${i}`}>
          <RefScrew cx={x} cy={topY} r={tr} fill="#9a9ea5" rim="#6a6f77" mark="#464a51" />
          <text x={x} y={fy(0.148)} fontSize={2.5} textAnchor="middle" fill="#6d727a" fontFamily="Arial, sans-serif">
            {['1/L1', '3/L2', '5/L3'][i]}
          </text>
        </g>
      ))}

      {/* Petit schéma imprimé, très pâle, à gauche des boutons */}
      <g stroke="#bfc3c9" strokeWidth={0.5} strokeLinecap="round">
        <rect x={fx(0.07)} y={fy(0.335)} width={bw * 0.2} height={bh * 0.085} rx={0.8} />
        <line x1={fx(0.1)} y1={fy(0.36)} x2={fx(0.24)} y2={fy(0.36)} />
        <line x1={fx(0.1)} y1={fy(0.39)} x2={fx(0.2)} y2={fy(0.39)} />
      </g>

      {/* Bouton rouge « OFF » */}
      <rect x={fx(0.42)} y={fy(0.343)} width={bw * 0.236} height={bh * 0.285} rx={1.8} fill="url(#rf-gred)" stroke="#9e2e31" strokeWidth={0.4} />
      <path
        d={`M${fx(0.538) - 2.1} ${fy(0.395)} a2.1 2.1 0 1 0 4.2 0`}
        stroke="#ffffff"
        strokeWidth={0.9}
        strokeLinecap="round"
        fill="none"
      />
      <text x={fx(0.538)} y={fy(0.505)} fontSize={3.3} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif">
        OFF
      </text>

      {/* Bouton vert « ON » */}
      <rect x={fx(0.726)} y={fy(0.343)} width={bw * 0.221} height={bh * 0.285} rx={1.8} fill="url(#rf-ggreen)" stroke="#1f6e43" strokeWidth={0.4} />
      <line x1={fx(0.8365)} y1={fy(0.375)} x2={fx(0.8365)} y2={fy(0.43)} stroke="#ffffff" strokeWidth={1} strokeLinecap="round" />
      <text x={fx(0.8365)} y={fy(0.505)} fontSize={3.3} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif">
        ON
      </text>

      {/* Ligne d'inscriptions + pastille orange (réglage) */}
      <g fill="#9ba0a7">
        <rect x={fx(0.07)} y={fy(0.655)} width={bw * 0.16} height={1} rx={0.4} />
        <rect x={fx(0.07)} y={fy(0.672)} width={bw * 0.11} height={0.9} rx={0.4} />
      </g>
      <rect x={fx(0.274)} y={fy(0.652)} width={bw * 0.119} height={bh * 0.03} rx={0.6} fill="#e3a23d" />

      {/* Barre bleue puis liseré blanc */}
      <rect x={bx + 0.3} y={fy(0.707)} width={bw * 0.63} height={bh * 0.022} fill="#3a78b0" />
      <rect x={bx + 0.3 + bw * 0.63} y={fy(0.707)} width={bw * 0.37 - 0.6} height={bh * 0.022} fill="#f4f5f7" />

      {/* Ligne de séparation du bas */}
      <line x1={bx + 0.4} y1={fy(0.78)} x2={bx + bw - 0.4} y2={fy(0.78)} stroke="#c0c4ca" strokeWidth={0.6} />

      {/* Repères et bornes du bas */}
      {xs.map((x, i) => (
        <g key={`b${i}`}>
          <text x={x} y={fy(0.842)} fontSize={2.5} textAnchor="middle" fill="#6d727a" fontFamily="Arial, sans-serif">
            {['2/T1', '4/T2', '6/T3'][i]}
          </text>
          <RefScrew cx={x} cy={botY} r={tr} fill="#9a9ea5" rim="#6a6f77" mark="#464a51" />
        </g>
      ))}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Interrupteur-sectionneur inverseur                                  */
/* ------------------------------------------------------------------ */

/** Dessin sur 164 × 146 (rapport 1,123 relevé sur la capture). */
export const CHANGEOVER_VIEW = { w: 164, h: 146 };

export const ChangeoverDevice: React.FC<{ className?: string }> = ({ className }) => {
  const { w, h } = CHANGEOVER_VIEW;
  const bx = 2;
  const by = 2;
  const bw = 160;
  const bh = 142;
  const fx = (f: number) => bx + f * bw;
  const fy = (f: number) => by + f * bh;
  const txs = [0.108, 0.251, 0.389, 0.604, 0.739, 0.874].map(fx);
  const topY = fy(0.132);
  const botY = fy(0.868);
  const r = 7.6;
  const bandY = fy(0.248);
  const bandH = bh * 0.132;
  const botStripY = fy(0.775);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rf-cband" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9696c" />
          <stop offset="1" stopColor="#c0494d" />
        </linearGradient>
        <linearGradient id="rf-cknob" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3c3f44" />
          <stop offset="0.5" stopColor="#52555b" />
          <stop offset="1" stopColor="#3a3d42" />
        </linearGradient>
      </defs>

      {/* Boîtier gris foncé : bornier haut, façade, bornier bas */}
      <rect x={bx} y={by} width={bw} height={bh} rx={3} fill="#72777b" stroke="#34373b" strokeWidth={1} />
      <rect x={bx + 0.5} y={by + 0.5} width={bw - 1} height={bandY - by - 0.5} rx={2.6} fill="#64696c" />
      <rect x={bx + 0.5} y={botStripY} width={bw - 1} height={by + bh - botStripY - 0.5} rx={2.6} fill="#5b5e63" />
      {/* Séparation entre les deux sources */}
      <line x1={bx + bw / 2} y1={by + 1} x2={bx + bw / 2} y2={bandY} stroke="#4a4e52" strokeWidth={1} />
      <line x1={bx + bw / 2} y1={botStripY} x2={bx + bw / 2} y2={by + bh - 1} stroke="#4a4e52" strokeWidth={1} />

      {/* Bornes du haut et du bas */}
      {txs.map((x, i) => (
        <g key={i}>
          <text x={x} y={fy(0.045)} fontSize={3.6} textAnchor="middle" fill="#a9afb2" fontFamily="Arial, sans-serif">
            {['1/L1', '3/L2', '5/L3', '1/L1', '3/L2', '5/L3'][i]}
          </text>
          <RefScrew cx={x} cy={topY} r={r} fill="#858b8f" rim="#a9afb2" mark="#575c61" />
          <RefScrew cx={x} cy={botY} r={r} fill="#858b8f" rim="#a9afb2" mark="#575c61" />
          <text x={x} y={fy(0.965)} fontSize={3.6} textAnchor="middle" fill="#a9afb2" fontFamily="Arial, sans-serif">
            {['2/T1', '4/T2', '6/T3', '2/T1', '4/T2', '6/T3'][i]}
          </text>
        </g>
      ))}

      {/* Bande rouge et repères */}
      <rect x={bx} y={bandY} width={bw} height={bandH} fill="url(#rf-cband)" />
      <rect x={bx} y={bandY} width={bw} height={1.6} fill="#e48e90" opacity={0.9} />
      <path d={`M${bx + bw / 2 - 2.6} ${bandY + 2.2} L${bx + bw / 2 + 2.6} ${bandY + 2.2} L${bx + bw / 2} ${bandY + 6.4} Z`} fill="#ffffff" />
      <text x={fx(0.347)} y={bandY + bandH * 0.68} fontSize={7} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif">
        I ON
      </text>
      <text x={fx(0.689)} y={bandY + bandH * 0.68} fontSize={7} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif">
        II ON
      </text>

      {/* Schémas imprimés de chaque côté de la manette */}
      <g stroke="#e9ecee" strokeWidth={1.1} strokeLinecap="round" fill="none">
        <line x1={fx(0.276)} y1={fy(0.519)} x2={fx(0.324)} y2={fy(0.519)} />
        <line x1={fx(0.672)} y1={fy(0.519)} x2={fx(0.72)} y2={fy(0.519)} />
        {/* Symbole de contact, à droite */}
        <path d={`M${fx(0.912)} ${fy(0.46)} L${fx(0.912)} ${fy(0.5)} L${fx(0.89)} ${fy(0.56)}`} strokeWidth={0.9} />
        <path d={`M${fx(0.912)} ${fy(0.56)} L${fx(0.912)} ${fy(0.6)}`} strokeWidth={0.9} />
      </g>
      <g fill="#e9ecee" fontFamily="Arial, sans-serif" textAnchor="middle">
        <text x={fx(0.222)} y={fy(0.49)} fontSize={6.5} fontWeight="bold">
          I
        </text>
        <text x={fx(0.222)} y={fy(0.558)} fontSize={4.6}>
          ON
        </text>
        <text x={fx(0.782)} y={fy(0.49)} fontSize={6.5} fontWeight="bold">
          II
        </text>
        <text x={fx(0.782)} y={fy(0.558)} fontSize={4.6}>
          ON
        </text>
      </g>

      {/* Manette centrale en gélule, avec son logement */}
      <rect x={fx(0.43)} y={fy(0.326)} width={bw * 0.147} height={bh * 0.418} rx={12} fill="url(#rf-cknob)" stroke="#2f3236" strokeWidth={1} />
      <rect x={fx(0.43) + 3} y={fy(0.326) + 3} width={bw * 0.147 - 6} height={9} rx={4.5} fill="#ffffff" opacity={0.1} />
      <rect x={fx(0.481)} y={fy(0.48)} width={bw * 0.041} height={bh * 0.063} rx={1.2} fill="#2f3235" />
    </svg>
  );
};
