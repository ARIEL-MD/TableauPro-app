import React, { useState } from 'react';

/**
 * Cartes « Barres auto-serrantes » — reproduction de la capture de référence (sans badge PRO).
 * Mesures faites sur la capture (1200 × 499) :
 *  - cartes : 264 × 147 (colonnes 1-2) et 277 × 147 (colonnes 3-4 et ligne 2), écart 12, rayon ~16
 *  - pastilles : Ø 41, centre à 46 px du bord droit, y = 47 (bleue) et y = 101.5 (verte)
 *  - miniature : 84 de large, centre vertical à y = 54, hauteur selon le nombre de contacts
 *  - libellé « N + M contacts » : x = 19, haut = 102, taille 24
 * Échelle S = 96 / 264 : une carte fait 96 px, comme les autres cartes du tiroir.
 */
const S = 96 / 264;
const px = (n: number) => n * S;

const CARD_BG = '#6f6f6f';
const CARD_H = 147;
const HOUSING = '#dfe1e5';
const SCREW = '#8d939c';
const SCREW_RING = '#6b7280';
const WINDOW = '#3f7fc4';

type ChipKey = 'blue' | 'green';

const CHIP_HEX: Record<ChipKey, string> = { blue: '#4ba9f3', green: '#6ebc71' };
const CHIP_VALUE: Record<ChipKey, string> = { blue: 'blue', green: 'green' };
const PALETTE: Record<ChipKey, { body: string; slot: string; teeth: string }> = {
  blue: { body: '#6c9fd8', slot: '#3f6f9e', teeth: '#5f93cf' },
  green: { body: '#6aa572', slot: '#3b6b44', teeth: '#5c9466' },
};

/** Cotes mesurées sur la capture, dans l'ordre des cartes (gauche → droite, haut → bas). */
const BARS: { label: string; slots: number; poles: number; h: number; holes: number; cardW: number; w: number }[] = [
  { label: '5 + 1 contacts', poles: 1, slots: 5, h: 73, holes: 6, cardW: 264, w: 72 },
  { label: '8 + 2 contacts', poles: 2, slots: 8, h: 57, holes: 10, cardW: 264, w: 84 },
  { label: '11 + 3 contacts', poles: 3, slots: 11, h: 42, holes: 14, cardW: 277, w: 84 },
  { label: '14 + 4 contacts', poles: 4, slots: 14, h: 33, holes: 18, cardW: 277, w: 84 },
  { label: '17 + 5 contacts', poles: 5, slots: 17, h: 28, holes: 22, cardW: 277, w: 84 },
  { label: '20 + 6 contacts', poles: 6, slots: 20, h: 25, holes: 26, cardW: 277, w: 84 },
];

/** Dessin d'une barre auto-serrante (vue de face) — viewBox w × h, comme sur la capture. */
export const SpringBarDrawing: React.FC<{
  slots: number;
  poles: number;
  h: number;
  w: number;
  width: number;
  palette: { body: string; slot: string; teeth: string };
}> = ({ slots, poles, h, w, width, palette }) => {
  const top = h * 0.42;
  const mid = h * 0.7;
  const chamfer = Math.min(w * 0.12, top * 0.6);
  const chamferY = top * 0.6;
  const teeth = Math.max(2, slots * 2 - 2);
  const slotW = Math.max(1.4, Math.min(4.2, ((w - 8) / slots) * 0.7));
  const slotH = Math.max(1.2, (mid - top) * 0.72);
  const screwR = Math.min(4.2, h * 0.12);
  const windows = poles + 1;

  return (
    <svg width={width} height={(width * h) / w} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {/* Capot gris clair, coins supérieurs biseautés */}
      <path
        d={`M${chamfer},0 L${w - chamfer},0 L${w},${chamferY} L${w},${top} L0,${top} L0,${chamferY} Z`}
        fill={HOUSING}
      />
      {/* Fenêtres bleu foncé sous le capot */}
      {Array.from({ length: windows }).map((_, i) => (
        <rect
          key={`win${i}`}
          x={((i + 0.5) * w) / windows - w * 0.05}
          y={top - top * 0.36}
          width={w * 0.1}
          height={top * 0.26}
          fill={WINDOW}
        />
      ))}
      {/* Vis : une par pôle */}
      {h >= 30 &&
        Array.from({ length: poles }).map((_, i) => {
          const cx = ((i + 0.5) * w) / poles;
          return (
            <circle key={`screw${i}`} cx={cx} cy={chamferY + (top - chamferY) * 0.35} r={screwR}
              fill={SCREW} stroke={SCREW_RING} strokeWidth={Math.min(0.6, screwR * 0.25)} />
          );
        })}
      {/* Corps bleu */}
      <rect x="0" y={top} width={w} height={mid - top} fill={palette.body} />
      {/* Logements des contacts, ovales */}
      {Array.from({ length: slots }).map((_, i) => {
        const cx = slots === 1 ? w / 2 : 4 + i * ((w - 8) / (slots - 1));
        return (
          <rect key={`slot${i}`} x={cx - slotW / 2} y={top + (mid - top - slotH) / 2}
            width={slotW} height={slotH} rx={slotW / 2}
            fill="#8593a6" stroke={palette.slot} strokeWidth={Math.min(0.5, slotW * 0.2)} />
        );
      })}
      {/* Peigne inférieur */}
      {Array.from({ length: teeth }).map((_, i) => {
        const pitch = (w - 4) / teeth;
        return (
          <rect key={`tooth${i}`} x={2 + i * pitch + pitch * 0.15} y={mid}
            width={pitch * 0.7} height={h - mid} fill={palette.teeth} />
        );
      })}
    </svg>
  );
};

interface Props {
  onAddTerminalBar: (type: 'screw' | 'spring' | 'simple' | 'custom', holes: number, color?: string) => void;
}

export const SpringBarCards: React.FC<Props> = ({ onAddTerminalBar }) => {
  const [color, setColor] = useState<ChipKey>('blue');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: px(12) }}>
      {BARS.map((b) => (
        <div
          key={b.label}
          onClick={() => onAddTerminalBar('spring', b.holes, CHIP_VALUE[color])}
          style={{
            position: 'relative',
            flexShrink: 0,
            cursor: 'pointer',
            width: px(b.cardW),
            height: px(CARD_H),
            borderRadius: px(16),
            background: CARD_BG,
          }}
        >
          {/* Miniature centrée à 35 % de la largeur de la carte */}
          <div
            style={{
              position: 'absolute',
              left: px(b.cardW * 0.35 - b.w / 2),
              top: px(54 - b.h / 2),
              width: px(b.w),
            }}
          >
            <SpringBarDrawing slots={b.slots} poles={b.poles} h={b.h} w={b.w} width={px(b.w)} palette={PALETTE[color]} />
          </div>

          {/* Libellé */}
          <div
            style={{
              position: 'absolute',
              left: px(19),
              top: px(102),
              color: '#fff',
              fontSize: px(24),
              lineHeight: 1,
              fontWeight: 400,
              whiteSpace: 'nowrap',
            }}
          >
            {b.label}
          </div>

          {/* Pastilles couleur : bleue (sélectionnée par défaut) et verte */}
          {(['blue', 'green'] as ChipKey[]).map((k, i) => (
            <button
              key={k}
              type="button"
              aria-label={`Couleur ${k}`}
              onClick={(e) => {
                e.stopPropagation();
                setColor(k);
              }}
              style={{
                position: 'absolute',
                left: px(b.cardW - 46 - 20.5),
                top: px((i === 0 ? 47 : 101.5) - 20.5),
                width: px(41),
                height: px(41),
                borderRadius: '50%',
                backgroundColor: CHIP_HEX[k],
                border: color === k ? `${Math.max(1.5, px(4.5))}px solid #ffffff` : 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
