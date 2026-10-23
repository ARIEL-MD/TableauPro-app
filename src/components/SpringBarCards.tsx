import React, { useState } from 'react';

/**
 * Cartes « Barres auto-serrantes » — reproduction de la capture de référence (sans badge PRO).
 * Les miniatures sont les pixels exacts de la capture (public/assets/barres/*.png), placés
 * à leur position mesurée dans la carte. Cotes de la capture (1200 × 499) :
 *  - cartes : 264 × 147 (colonnes 1-2) et 277 × 147 (colonnes 3-4 et ligne 2), écart 12, rayon ~16
 *  - pastilles : Ø 41, centre à 46 px du bord droit, y = 47 (bleue) et y = 101.5 (verte)
 *  - libellé « N + M contacts » : x = 19, haut = 102, taille 24
 * Échelle S = 96 / 264 : une carte fait 96 px, comme les autres cartes du tiroir.
 */
const S = 96 / 264;
const px = (n: number) => n * S;

const CARD_BG = '#6f6f6f';
const CARD_H = 147;

type ChipKey = 'blue' | 'green';

const CHIP_HEX: Record<ChipKey, string> = { blue: '#4ba9f3', green: '#6ebc71' };
const CHIP_VALUE: Record<ChipKey, string> = { blue: 'blue', green: 'green' };
/** Teinte appliquée aux miniatures bleues pour la couleur verte (bleu ≈ 210°, vert ≈ 120°). */
const THUMB_FILTER: Record<ChipKey, string> = { blue: 'none', green: 'hue-rotate(-90deg)' };

/**
 * Position de chaque miniature dans la carte (en px de la capture) : x, y, largeur, hauteur.
 * `image` = fichier PNG découpé dans la capture.
 */
const BARS: {
  label: string;
  holes: number;
  cardW: number;
  image: string;
  thumb: { x: number; y: number; w: number; h: number };
}[] = [
  { label: '5 + 1 contacts', holes: 6, cardW: 264, image: '5-1', thumb: { x: 56, y: 18, w: 73, h: 73 } },
  { label: '8 + 2 contacts', holes: 10, cardW: 264, image: '8-2', thumb: { x: 50, y: 26, w: 85, h: 57 } },
  { label: '11 + 3 contacts', holes: 14, cardW: 277, image: '11-3', thumb: { x: 55, y: 33, w: 86, h: 43 } },
  { label: '14 + 4 contacts', holes: 18, cardW: 277, image: '14-4', thumb: { x: 55, y: 37, w: 86, h: 34 } },
  { label: '17 + 5 contacts', holes: 22, cardW: 277, image: '17-5', thumb: { x: 55, y: 40, w: 86, h: 29 } },
  { label: '20 + 6 contacts', holes: 26, cardW: 277, image: '20-6', thumb: { x: 55, y: 42, w: 86, h: 25 } },
];

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
          {/* Miniature : pixels de la capture */}
          <img
            src={`${import.meta.env.BASE_URL}assets/barres/${b.image}.png`}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: px(b.thumb.x),
              top: px(b.thumb.y),
              width: px(b.thumb.w),
              height: px(b.thumb.h),
              filter: THUMB_FILTER[color],
              pointerEvents: 'none',
            }}
          />

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
