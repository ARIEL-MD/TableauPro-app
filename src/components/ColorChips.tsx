import React from 'react';

/**
 * Puces de couleur au-dessus des cartes d'appareils — reproduction de la capture de référence.
 * Cotes mesurées sur la capture (en px) : puce 74 × 33, rayon 8, espacement 10.
 * Puce choisie : 72 × 31 avec un contour noir de 4 px.
 * Tout est multiplié par `scale` (0.55 dans le tiroir, même échelle que les cartes).
 */
export const CHIP_LIST: { key: string; hex: string }[] = [
  { key: 'red', hex: '#db7f80' },
  { key: 'green', hex: '#62c08e' },
  { key: 'blue', hex: '#75b1ef' },
  { key: 'orange', hex: '#eb7f1a' },
  { key: 'yellow', hex: '#ecd877' },
];

interface Props {
  value: string;
  onChange: (key: string) => void;
  scale?: number;
}

export const ColorChips: React.FC<Props> = ({ value, onChange, scale = 0.55 }) => {
  const px = (n: number) => n * scale;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: px(10), marginBottom: px(11) }}>
      {CHIP_LIST.map((c) => {
        const selected = value === c.key;
        return (
          <button
            key={c.key}
            type="button"
            aria-label={`Couleur ${c.key}`}
            aria-pressed={selected}
            onClick={() => onChange(c.key)}
            style={{
              flexShrink: 0,
              width: px(74),
              height: px(33),
              padding: 0,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                boxSizing: 'border-box',
                width: px(selected ? 72 : 74),
                height: px(selected ? 31 : 33),
                borderRadius: px(8),
                backgroundColor: c.hex,
                border: selected ? `${px(4)}px solid #000` : 'none',
              }}
            />
          </button>
        );
      })}
    </div>
  );
};
