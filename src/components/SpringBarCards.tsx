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
const HOUSING = '#d3d6dc';
const SCREW = '#8a9099';

type ChipKey = 'blue' | 'green';

const CHIP_HEX: Record<ChipKey, string> = { blue: '#4ba9f3', green: '#6ebc71' };
const CHIP_VALUE: Record<ChipKey, string> = { blue: 'blue', green: 'green' };
const PALETTE: Record<ChipKey, { body: string; slot: string; teeth: string }> = {
  blue: { body: '#5b8fcf', slot: '#2e5a92', teeth: '#6a9fdc' },
  green: { body: '#5f9f68', slot: '#2f5d37', teeth: '#6fb277' },
};

/** Cotes mesurées sur la capture, dans l'ordre des cartes (gauche → droite, haut → bas). */
const BARS: { label: string; slots: number; h: number; holes: number; cardW: number }[] = [
  { label: '5 + 1 contacts', slots: 5, h: 73, holes: 6, cardW: 264 },
  { label: '8 + 2 contacts', slots: 8, h: 57, holes: 10, cardW: 264 },
  { label: '11 + 3 contacts', slots: 11, h: 42, holes: 14, cardW: 277 },
  { label: '14 + 4 contacts', slots: 14, h: 33, holes: 18, cardW: 277 },
  { label: '17 + 5 contacts', slots: 17, h: 28, holes: 22, cardW: 277 },
  { label: '20 + 6 contacts', slots: 20, h: 25, holes: 26, cardW: 277 },
];

/** Dessin d'une barre auto-serrante — viewBox 84 × h, comme sur la capture. */
export const SpringBarDrawing: React.FC<{
  slots: number;
  h: number;
  width: number;
  palette: { body: string; slot: string; teeth: string };
}> = ({ slots, h, width, palette }) => {
  const W = 84;
  const top = h * 0.38;
  const mid = h * 0.72;
  const teeth = slots * 2;
  const slotW = Math.max(1.6, Math.min(3.2, 60 / slots));
  const slotH = Math.max(1, (mid - top) * 0.4);
  const screwR = Math.min(4, h * 0.1);
  const screwY = top * 0.5;

  return (
    <svg width={width} height={(width * h) / W} viewBox={`0 0 ${W} ${h}`} aria-hidden>
      {/* Capot supérieur gris clair avec vis */}
      <rect x="0" y="0" width={W} height={top} rx="2" fill={HOUSING} />
      {h >= 40 &&
        [22, 62].map((x) => <circle key={x} cx={x} cy={screwY} r={screwR} fill={SCREW} />)}
      {/* Corps bleu avec logements des contacts */}
      <rect x="0" y={top} width={W} height={mid - top} fill={palette.body} />
      {Array.from({ length: slots }).map((_, i) => {
        const cx = slots === 1 ? W / 2 : 8 + i * ((W - 16) / (slots - 1));
        return (
          <rect
            key={i}
            x={cx - slotW / 2}
            y={top + (mid - top - slotH) / 2}
            width={slotW}
            height={slotH}
            rx={slotW / 2}
            fill={palette.slot}
          />
        );
      })}
      {/* Peigne inférieur */}
      {Array.from({ length: teeth }).map((_, i) => {
        const x = 3 + i * ((W - 6) / (teeth - 1));
        return <rect key={i} x={x - 0.6} y={mid} width={1.2} height={h - mid} fill={palette.teeth} />;
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
              left: px(b.cardW * 0.35 - 42),
              top: px(54 - b.h / 2),
              width: px(84),
            }}
          >
            <SpringBarDrawing slots={b.slots} h={b.h} width={px(84)} palette={PALETTE[color]} />
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
