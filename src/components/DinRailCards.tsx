import React from 'react';

/**
 * Cartes « Tous les rails » — reproduction à l'identique de la capture de référence (sans badge PRO).
 * Toutes les cotes (en px de la capture) ont été mesurées sur l'image :
 *  - carte : 121 × 146, rayon ~20, fond #6f6f6f
 *  - dessin du rail : toujours 84 px de large, hauteur propre à chaque longueur (30, 15, 13, 11, 9, 7, 5)
 *  - fentes : positions mesurées pixel par pixel, bouts arrondis
 *  - libellé « 100 mm » blanc, 20 px, centré à y = 113 depuis le haut de la carte
 * Tout est multiplié par S pour tenir dans le tiroir (même échelle que WireTerminalCards).
 */
const S = 0.55;
const px = (n: number) => n * S;

const CARD_BG = '#6f6f6f';
const CARD_BG_PRESSED = '#3b3b3b';
// Sur la capture, la carte « 200 mm » (sans badge PRO) est plus foncée que les autres.
const CARD_BG_FREE = '#4e4e4e';
const FREE_LENGTHS: number[] = [200];
const ICON_W = 84;

interface RailSpec {
  /** Niveaux de gris de chaque ligne du profil (haut → bas) : contour, reflets, rainures, âme. */
  rows: number[];
  /** Fentes visibles (début/fin inclus, en px de la capture, 0 → 83). */
  runs: [number, number][];
  /** Longueur d'une fente entière (pour prolonger les fentes coupées au bord). */
  slotLen: number;
  /** Ligne de départ et hauteur des fentes. */
  slotY: number;
  slotH: number;
  slotFill: string;
}

const g = (v: number) => {
  const h = v.toString(16).padStart(2, '0');
  return `#${h}${h}${h}`;
};

const RAILS: Record<number, RailSpec> = {
  100: {
    rows: [
      116, 188, 186, 188, 178, 149,
      170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170, 170,
      148, 188, 187, 188, 166, 109,
    ],
    runs: [[0, 6], [19, 35], [49, 65], [77, 83]],
    slotLen: 17, slotY: 12, slotH: 6, slotFill: '#707070',
  },
  200: {
    rows: [107, 197, 190, 170, 171, 168, 170, 170, 170, 170, 171, 171, 179, 197, 167],
    runs: [[0, 2], [6, 14], [19, 26], [32, 39], [44, 51], [57, 64], [69, 77], [81, 83]],
    slotLen: 9, slotY: 6.2, slotH: 3.6, slotFill: '#555557',
  },
  250: {
    rows: [130, 188, 183, 170, 171, 170, 170, 170, 170, 171, 174, 187, 169],
    runs: [[0, 2], [5, 11], [15, 21], [25, 31], [35, 41], [45, 51], [56, 61], [66, 71], [76, 81]],
    slotLen: 7, slotY: 5.4, slotH: 3.2, slotFill: '#717171',
  },
  300: {
    rows: [130, 187, 187, 170, 170, 170, 170, 170, 174, 192, 168],
    runs: [[0, 1], [4, 9], [13, 18], [22, 26], [30, 35], [39, 44], [48, 52], [57, 61], [65, 70], [74, 79], [82, 83]],
    slotLen: 6, slotY: 4.6, slotH: 3, slotFill: '#727272',
  },
  400: {
    rows: [131, 170, 124, 160, 165, 165, 156, 134, 171],
    runs: [[0, 1], [3, 6], [10, 13], [17, 20], [24, 26], [30, 33], [37, 40], [44, 46], [50, 53], [57, 60], [63, 66], [70, 73], [77, 80], [82, 83]],
    slotLen: 4, slotY: 3.6, slotH: 3, slotFill: '#717171',
  },
  500: {
    rows: [130, 182, 153, 160, 160, 174, 168],
    runs: [[0, 0], [3, 5], [8, 10], [13, 15], [18, 20], [23, 25], [28, 30], [33, 35], [38, 40], [43, 45], [48, 50], [53, 55], [58, 60], [63, 65], [68, 70], [73, 75], [78, 80], [83, 83]],
    slotLen: 3, slotY: 2.5, slotH: 2.5, slotFill: '#656565',
  },
  600: {
    rows: [126, 168, 155, 146, 156],
    runs: [[0, 0], [2, 4], [7, 8], [11, 12], [15, 17], [20, 21], [24, 25], [28, 29], [33, 34], [37, 38], [41, 42], [45, 47], [50, 51], [54, 55], [58, 59], [62, 64], [67, 68], [71, 72], [75, 76], [79, 81], [83, 83]],
    slotLen: 3, slotY: 2, slotH: 2, slotFill: '#929292',
  },
};

export const RAIL_LENGTHS = [100, 200, 250, 300, 400, 500, 600] as const;

/** Longueur standard dont le dessin est le plus proche d'une longueur quelconque (mm). */
export const nearestRailLength = (mm: number): number =>
  RAIL_LENGTHS.reduce((best, l) => (Math.abs(l - mm) < Math.abs(best - mm) ? l : best), 200 as number);

/** Hauteur (px) du dessin d'un rail affiché sur `width` px de large. */
export const railDrawingHeight = (length: number, width: number): number =>
  (width * (RAILS[length] ?? RAILS[200]).rows.length) / ICON_W;

/** Dessin d'un rail DIN — viewBox 84 × h, comme sur la capture. */
export const RailDrawing: React.FC<{ length: number; width: number; seeThrough?: boolean }> = ({
  length,
  width,
  seeThrough = false,
}) => {
  const spec = RAILS[length] ?? RAILS[200];
  const h = spec.rows.length;
  const maskId = React.useId();

  // Fentes : positions en px de la capture (celles coupées au bord sont prolongées)
  const slots = spec.runs.map(([s, e]) => {
    const w = e - s + 1;
    let x = s;
    let rw = w;
    if (s === 0 && w < spec.slotLen) {
      rw = spec.slotLen;
      x = e + 1 - spec.slotLen;
    } else if (e === ICON_W - 1 && w < spec.slotLen) {
      rw = spec.slotLen;
    }
    return { x, rw };
  });

  const rows = spec.rows.map((v, i) => <rect key={i} x="0" y={i} width={ICON_W} height="1.02" fill={g(v)} />);

  return (
    <svg width={width} height={(width * h) / ICON_W} viewBox={`0 0 ${ICON_W} ${h}`} aria-hidden>
      {seeThrough ? (
        <>
          {/* Sur le plan, les fentes sont ouvertes : on voit le fond à travers, avec un fin contour */}
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width={ICON_W} height={h} fill="white" />
              {slots.map((sl, i) => (
                <rect key={i} x={sl.x} y={spec.slotY} width={sl.rw} height={spec.slotH} rx={spec.slotH / 2} fill="black" />
              ))}
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>{rows}</g>
          {slots.map((sl, i) => (
            <rect
              key={i}
              x={sl.x}
              y={spec.slotY}
              width={sl.rw}
              height={spec.slotH}
              rx={spec.slotH / 2}
              fill="none"
              stroke="#5f5f5f"
              strokeWidth={(2.2 * ICON_W) / width}
            />
          ))}
        </>
      ) : (
        <>
          {rows}
          {slots.map((sl, i) => (
            <rect
              key={i}
              x={sl.x}
              y={spec.slotY}
              width={sl.rw}
              height={spec.slotH}
              rx={spec.slotH / 2}
              fill={spec.slotFill}
            />
          ))}
        </>
      )}
    </svg>
  );
};

interface Props {
  onAddRailByLength: (lengthMm: number) => void;
}

export const DinRailCards: React.FC<Props> = ({ onAddRailByLength }) => {
  const [pressed, setPressed] = React.useState<number | null>(null);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: px(12), overflowX: 'auto', paddingBottom: 4 }}>
      {RAIL_LENGTHS.map((mm) => {
        const h = RAILS[mm].rows.length;
        return (
          <div
            key={mm}
            onClick={() => onAddRailByLength(mm)}
            onPointerDown={() => setPressed(mm)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            onPointerCancel={() => setPressed(null)}
            style={{
              position: 'relative',
              flexShrink: 0,
              cursor: 'pointer',
              width: px(121),
              height: px(146),
              borderRadius: px(20),
              background: pressed === mm ? CARD_BG_PRESSED : FREE_LENGTHS.includes(mm) ? CARD_BG_FREE : CARD_BG,
              transition: 'background 0.1s',
            }}
          >
            {/* Dessin centré à 53 px du haut de la carte (y = 86 sur la capture) */}
            <div
              style={{
                position: 'absolute',
                left: px((121 - ICON_W) / 2),
                top: px(53 - h / 2),
                width: px(ICON_W),
              }}
            >
              <RailDrawing length={mm} width={px(ICON_W)} />
            </div>
            {/* Libellé centré à 113 px du haut */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                top: px(113 - 14),
                textAlign: 'center',
                color: '#fff',
                fontSize: px(24),
                fontWeight: 400,
                whiteSpace: 'nowrap',
              }}
            >
              {mm} mm
            </div>
          </div>
        );
      })}
    </div>
  );
};
