import React from 'react';
import { Plus } from 'lucide-react';
import { DeviceThumbSvg } from './DeviceThumbSvg';

/**
 * Cartes « Disjoncteurs » — reproduction de la capture de référence (sans badge PRO).
 * Cotes mesurées sur la capture (en px) :
 *  - cartes : 120 × 147 (160 pour « MCB 1P + N »), rayon 20, espacement 12
 *  - fond : #4e4e4e pour les appareils gratuits (1P, 2P), #6f6f6f pour les autres
 *  - miniature : corps de 73 px de haut, centré, à 18 px du haut de la carte
 *  - libellé blanc, centré à 113 px du haut
 *  - carte « Ajouter » : 106 × 122, fond #ebeaef, cadre pointillé 72 × 60
 * Tout est multiplié par `scale` (0.55 dans le tiroir).
 */
const CARD_FREE = '#4e4e4e';
const CARD_STD = '#6f6f6f';
const CARD_PRESSED = '#3b3b3b';

const ITEMS: { label: string; type: string; width: number; free: boolean }[] = [
  { label: 'MCB 1P', type: 'MCB 1P', width: 120, free: true },
  { label: 'MCB 2P', type: 'MCB 2P', width: 120, free: true },
  { label: 'MCB 3P', type: 'MCB 3P', width: 120, free: false },
  { label: 'MCB 4P', type: 'MCB 4P', width: 120, free: false },
  { label: 'MCB 1P + N', type: 'MCB 1P + N', width: 160, free: false },
];

// Le dessin SVG a 4 unités de marge sur 188 : corps de 73 px → SVG de 73 × 188/180 px.
const BODY_H = 73;
const SVG_H = (BODY_H * 188) / 180;
const SVG_TOP = 18 - (BODY_H * 4) / 180;

interface Props {
  color: string;
  onAdd: (type: string) => void;
  scale?: number;
}

export const McbCards: React.FC<Props> = ({ color, onAdd, scale = 0.55 }) => {
  const px = (n: number) => n * scale;
  const [pressed, setPressed] = React.useState<string | null>(null);
  const font = 'Roboto, "Samsung Sans", Arial, sans-serif';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: px(12), overflowX: 'auto', paddingBottom: 4 }}>
      {ITEMS.map((it) => (
        <div
          key={it.type}
          onClick={() => onAdd(it.type)}
          onPointerDown={() => setPressed(it.type)}
          onPointerUp={() => setPressed(null)}
          onPointerLeave={() => setPressed(null)}
          onPointerCancel={() => setPressed(null)}
          style={{
            position: 'relative',
            flexShrink: 0,
            cursor: 'pointer',
            width: px(it.width),
            height: px(147),
            borderRadius: px(20),
            background: pressed === it.type ? CARD_PRESSED : it.free ? CARD_FREE : CARD_STD,
            transition: 'background 0.1s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              top: px(SVG_TOP),
              height: px(SVG_H),
              display: 'flex',
              justifyContent: 'center',
              // Sur la capture, les appareils « PRO » ont une miniature atténuée (~70 %).
              opacity: it.free ? 1 : 0.7,
            }}
          >
            <DeviceThumbSvg type={it.type} color={color} className="h-full w-auto" />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              top: px(113 - 14),
              lineHeight: `${px(28)}px`,
              textAlign: 'center',
              color: '#fff',
              fontFamily: font,
              fontSize: px(22),
              whiteSpace: 'nowrap',
            }}
          >
            {it.label}
          </div>
        </div>
      ))}

      {/* Carte « Ajouter » */}
      <div
        onClick={() => onAdd('MCB 1P')}
        style={{
          position: 'relative',
          flexShrink: 0,
          cursor: 'pointer',
          width: px(106),
          height: px(122),
          borderRadius: px(20),
          background: '#ebeaef',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: px(17),
            top: px(15),
            width: px(72),
            height: px(60),
            boxSizing: 'border-box',
            border: `${px(2.5)}px dashed #cfced3`,
            borderRadius: px(14),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus style={{ width: px(28), height: px(28), color: '#c4c3c8' }} strokeWidth={1.6} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            top: px(95 - 12),
            lineHeight: `${px(24)}px`,
            textAlign: 'center',
            color: '#b1b0b5',
            fontFamily: font,
            fontSize: px(18),
          }}
        >
          Ajouter
        </div>
      </div>
    </div>
  );
};
