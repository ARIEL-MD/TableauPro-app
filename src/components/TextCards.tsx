import React from 'react';

/**
 * Cartes « Texte » et « Tableau » — reproduction de la capture de référence (sans badge PRO).
 * Cotes mesurées (px de capture) : cartes 120 × 146, rayon 20, espacement 12, fond #6f6f6f,
 * icône grise 52 × 50 à 30 px du haut, libellé blanc 22 px centré à 112 px du haut.
 * Tout est multiplié par `scale` (0.55 dans le tiroir).
 */
const CARD = '#6f6f6f';
const CARD_PRESSED = '#3b3b3b';

const TileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 64 64" width="100%" height="100%" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x={4} y={5} width={56} height={54} rx={10} fill="#e6e6e8" stroke="#4d4d4f" strokeWidth={3} />
    {children}
  </svg>
);

const TextArt: React.FC = () => (
  <TileFrame>
    <path d="M14 19 H36 M25 19 V45 M19 45 H31" stroke="#4d4d4f" strokeWidth={4.5} />
    <path d="M14 19 V24 M36 19 V24" stroke="#4d4d4f" strokeWidth={3} />
    <path d="M41 30 H52 M41 38 H52" stroke="#4d4d4f" strokeWidth={3.2} />
  </TileFrame>
);

const TableArt: React.FC = () => (
  <TileFrame>
    <rect x={15} y={15} width={34} height={34} rx={2} stroke="#5a5a5c" strokeWidth={2.6} />
    <path d="M26.3 15 V49 M37.7 15 V49 M15 26.3 H49 M15 37.7 H49" stroke="#5a5a5c" strokeWidth={2.6} />
  </TileFrame>
);

interface Props {
  onAddText: () => void;
  onAddTable: () => void;
  scale?: number;
}

export const TextCards: React.FC<Props> = ({ onAddText, onAddTable, scale = 0.55 }) => {
  const px = (n: number) => n * scale;
  const [pressed, setPressed] = React.useState<string | null>(null);
  const font = 'Roboto, "Samsung Sans", Arial, sans-serif';
  const items = [
    { id: 'text', label: 'Texte', art: <TextArt />, onClick: onAddText },
    { id: 'table', label: 'Tableau', art: <TableArt />, onClick: onAddTable },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: px(12) }}>
      {items.map((it) => (
        <div
          key={it.id}
          onClick={it.onClick}
          onPointerDown={() => setPressed(it.id)}
          onPointerUp={() => setPressed(null)}
          onPointerLeave={() => setPressed(null)}
          onPointerCancel={() => setPressed(null)}
          style={{
            position: 'relative',
            cursor: 'pointer',
            width: px(120),
            height: px(146),
            borderRadius: px(20),
            background: pressed === it.id ? CARD_PRESSED : CARD,
            transition: 'background 0.1s',
          }}
        >
          <div style={{ position: 'absolute', left: px(34), top: px(28), width: px(52), height: px(52), opacity: 0.8 }}>
            {it.art}
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              top: px(112 - 14),
              lineHeight: `${px(28)}px`,
              textAlign: 'center',
              color: '#fff',
              fontFamily: font,
              fontSize: px(22),
            }}
          >
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
};
