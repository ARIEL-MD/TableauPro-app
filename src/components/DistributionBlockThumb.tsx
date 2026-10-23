import React from 'react';

/**
 * Vignette d'un bloc de distribution (répartiteur étagé), reproduite d'après la capture
 * "Electrical Panel Designer" : rails blancs latéraux, cadre clair, fond bleu-gris, et pour
 * chaque rangée une borne carrée blanche à vis à chaque bout reliées par une barre laiton
 * dont chaque contact porte une vis sablier. Marches claires au-dessus des bornes.
 *
 * variant = '2x7' | '2x11' | '2x15' | '4x7' | '4x11' | '4x15' (rangées x contacts)
 */
interface Props {
  variant?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Rapport largeur / hauteur mesuré sur la capture de référence, par configuration. */
const RATIO: Record<string, number> = {
  '2x7': 1.65,
  '2x11': 3.2,
  '2x15': 4.35,
  '4x7': 0.93,
  '4x11': 1.72,
  '4x15': 2.26,
};

/** Hauteur d'affichage (px) de chaque vignette dans la carte, mesurée sur la capture. */
export const DISTRIBUTION_THUMB_HEIGHT: Record<string, number> = {
  '2x7': 51,
  '2x11': 35,
  '2x15': 26,
  '4x7': 70,
  '4x11': 60,
  '4x15': 46,
};

const PITCH = 97; // distance entre deux rangées
const END = 90; // rail + borne + jeu, de chaque côté de la barre

export const DistributionBlockThumb: React.FC<Props> = ({ variant = '2x7', className, style }) => {
  const [rows, cols] = variant.split('x').map(Number);
  const H = (rows + 0.5) * PITCH; // hauteur totale rails inclus
  const W = Math.round((RATIO[variant] ?? 1.65) * H);
  const barX = END;
  const barW = W - 2 * END;
  const cell = barW / cols;
  const first = 82;

  return (
    <svg
      viewBox={`-3 -3 ${W + 6} ${H + 6}`}
      className={className}
      style={style}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Fond bleu-gris et cadre clair */}
      <rect x={28} y={7} width={W - 56} height={H - 7} fill="#6a86a1" />
      <rect x={28} y={7} width={W - 56} height={11} fill="#dde0e4" />
      <rect x={28} y={7} width={4} height={H - 7} fill="#cfd4da" />
      <rect x={W - 32} y={7} width={4} height={H - 7} fill="#cfd4da" />
      <rect x={28} y={H - 4} width={W - 56} height={4} fill="#9fb0c0" />

      {/* Rails latéraux blancs, légèrement bombés */}
      <path d={`M4 0 H22 Q27 ${H / 2} 22 ${H} H4 Q-1 ${H / 2} 4 0 Z`} fill="#eeeff1" stroke="#c3c8ce" strokeWidth={2} />
      <path d={`M${W - 4} 0 H${W - 22} Q${W - 27} ${H / 2} ${W - 22} ${H} H${W - 4} Q${W + 1} ${H / 2} ${W - 4} 0 Z`} fill="#eeeff1" stroke="#c3c8ce" strokeWidth={2} />

      {Array.from({ length: rows }).map((_, ri) => {
        const cy = first + ri * PITCH;
        const xs = [38, W - 38 - 50];
        return (
          <g key={ri}>
            {/* Marches claires (répartiteur étagé) au-dessus de chaque borne */}
            <path d={`M36 ${cy - 26} V${cy - 46} H70 V${cy - 40} H96 V${cy - 34} H118 V${cy - 28} Z`} fill="#c5ccd4" />
            <path d={`M${W - 36} ${cy - 26} V${cy - 46} H${W - 70} V${cy - 40} H${W - 96} V${cy - 34} H${W - 118} V${cy - 28} Z`} fill="#c5ccd4" />
            <rect x={38} y={cy + 32} width={36} height={4} fill="#aab6c2" />
            <rect x={W - 74} y={cy + 32} width={36} height={4} fill="#aab6c2" />

            {/* Barre laiton + vis sablier de chaque contact */}
            <rect x={barX} y={cy - 22} width={barW} height={44} fill="#dcbd55" />
            {Array.from({ length: cols }).map((__, ci) => {
              const x0 = barX + ci * cell;
              const mx = x0 + cell / 2;
              const hw = Math.min(cell * 0.2, 11);
              return (
                <g key={ci}>
                  <rect x={x0 + 1} y={cy - 22} width={Math.max(cell * 0.2, 3)} height={44} fill="#6f8190" opacity={0.85} />
                  <path
                    d={`M${mx - hw} ${cy - 16} L${mx + hw} ${cy - 16} L${mx + hw * 0.25} ${cy} L${mx + hw} ${cy + 16} L${mx - hw} ${cy + 16} L${mx - hw * 0.25} ${cy} Z`}
                    fill="#efdc9c"
                    stroke="#b8921f"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
            <rect x={barX} y={cy - 22} width={barW} height={44} fill="none" stroke="#b8921f" strokeWidth={2} />

            {/* Bornes carrées blanches à vis (gauche / droite) */}
            {xs.map((x, k) => (
              <g key={k}>
                <rect x={x} y={cy - 26} width={50} height={52} rx={3} fill="#f5f5f6" stroke="#c4c9d0" strokeWidth={2} />
                <circle cx={x + 25} cy={cy} r={17} fill="#69727d" />
                <circle cx={x + 25} cy={cy} r={11} fill="#8d96a0" />
                <line x1={x + 25} y1={cy - 15} x2={x + 25} y2={cy + 15} stroke="#4c545e" strokeWidth={3.5} strokeLinecap="round" />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

export default DistributionBlockThumb;
