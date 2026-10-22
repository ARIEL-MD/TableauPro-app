import React from 'react';
import { Plus } from 'lucide-react';
import { DeviceThumbSvg } from './DeviceThumbSvg';

/**
 * Cartes « Relais temporisés » et « Dispositif de détection d'arc électrique » —
 * reproduction de la capture de référence (mêmes cotes que McbCards, en px de capture) :
 *  - cartes : 416 × 146 (relais) / 168 × 146 (AFDD), rayon 20, espacement 12
 *  - fond #6f6f6f, miniature atténuée (70 %), libellé blanc centré à 113 px du haut
 *  - carte « Ajouter » : 102 × 122, fond #ebeaef, cadre pointillé (sans badge PRO)
 * Tout est multiplié par `scale` (0.55 dans le tiroir).
 */
const CARD = '#6f6f6f';
const CARD_PRESSED = '#3b3b3b';

type Item = { label: string; type: string; width: number };

const font = 'Roboto, "Samsung Sans", Arial, sans-serif';

const CardRow: React.FC<{ items: Item[]; addType: string; onAdd: (type: string) => void; scale: number }> = ({
  items,
  addType,
  onAdd,
  scale,
}) => {
  const px = (n: number) => n * scale;
  const [pressed, setPressed] = React.useState<string | null>(null);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: px(12), overflowX: 'auto', paddingBottom: 4 }}>
      {items.map((it) => (
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
            height: px(146),
            borderRadius: px(20),
            background: pressed === it.type ? CARD_PRESSED : CARD,
            transition: 'background 0.1s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              top: px(16),
              height: px(78),
              display: 'flex',
              justifyContent: 'center',
              opacity: 0.7,
            }}
          >
            <DeviceThumbSvg type={it.type} className="h-full w-auto" />
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
        onClick={() => onAdd(addType)}
        style={{
          position: 'relative',
          flexShrink: 0,
          cursor: 'pointer',
          width: px(102),
          height: px(122),
          borderRadius: px(20),
          background: '#ebeaef',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: px(15),
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

interface Props {
  onAdd: (type: string) => void;
  scale?: number;
}

export const TimerRelayCards: React.FC<Props> = ({ onAdd, scale = 0.55 }) => (
  <CardRow
    scale={scale}
    onAdd={onAdd}
    addType="Relais temporisé (électromécanique)"
    items={[
      { label: 'Relais temporisé (électromécanique)', type: 'Relais temporisé (électromécanique)', width: 416 },
      { label: 'Relais temporisé (numérique)', type: 'Relais temporisé (numérique)', width: 341 },
    ]}
  />
);

export const AfddCards: React.FC<Props> = ({ onAdd, scale = 0.55 }) => (
  <CardRow
    scale={scale}
    onAdd={onAdd}
    addType="AFDD + MCB"
    items={[
      { label: 'AFDD + MCB', type: 'AFDD + MCB', width: 168 },
      { label: 'AFDD + RCBO', type: 'AFDD + RCBO', width: 178 },
    ]}
  />
);
