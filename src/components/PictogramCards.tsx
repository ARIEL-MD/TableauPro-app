import React from 'react';
import { PictogramKey } from '../types/panel';
import { PictogramTile } from './PictogramIcon';

/**
 * Cartes « Objets & Symboles » — reproduction de la capture de référence (sans badge PRO).
 * « Éclairage » et « Prise » sont les cartes gratuites (fond plus foncé).
 * Cotes mesurées sur la capture (en px) : carte 158 de haut (largeur selon le libellé, mini 120),
 * rayon 20, espacement 12, fond #6f6f6f, tuile blanche 82 × 82 à 18 px du haut,
 * libellé blanc 22 px centré à 125 px du haut. Tout est multiplié par `scale` (0.55).
 * Les lignes passent à la ligne selon la largeur disponible.
 */
const CARD = '#6f6f6f';
const CARD_FREE = '#4e4e4e';
const CARD_PRESSED = '#3b3b3b';

const ITEMS: { key: PictogramKey; label: string; free?: boolean }[] = [
  { key: 'lighting', label: 'Éclairage', free: true },
  { key: 'socket', label: 'Prise', free: true },
  { key: 'oven', label: 'Four' },
  { key: 'washing_machine', label: 'Lave-linge' },
  { key: 'earth', label: 'Mise à la terre' },
  { key: 'boiler', label: 'Chaudière' },
  { key: 'air_conditioning', label: 'Climatiseur' },
  { key: 'bathroom', label: 'Salle de bain' },
  { key: 'kitchen', label: 'Cuisine' },
  { key: 'microwave', label: 'Micro-ondes' },
  { key: 'cooktop', label: 'Plaque de cuisson' },
  { key: 'router', label: 'Routeur' },
  { key: 'dryer', label: 'Sèche-linge' },
  { key: 'motor', label: 'Moteur' },
  { key: 'toilet', label: 'Toilettes' },
  { key: 'house', label: 'Maison' },
  { key: 'bedroom', label: 'Chambre' },
  { key: 'hallway', label: 'Hall' },
  { key: 'intercom', label: 'Interphone' },
  { key: 'tv', label: 'Téléviseur' },
  { key: 'gate', label: 'Portail' },
  { key: 'garage', label: 'Garage' },
  { key: 'fridge', label: 'Réfrigérateur' },
  { key: 'ventilation', label: 'Ventilation' },
  { key: 'floor_heating', label: 'Chauffage au sol' },
  { key: 'computer', label: 'Ordinateur' },
  { key: 'alarm', label: 'Alarme' },
  { key: 'camera', label: 'Caméra' },
  { key: 'blank', label: '---' },
];

interface Props {
  onAdd: (key: PictogramKey) => void;
  scale?: number;
}

export const PictogramCards: React.FC<Props> = ({ onAdd, scale = 0.55 }) => {
  const px = (n: number) => n * scale;
  const [pressed, setPressed] = React.useState<string | null>(null);
  const font = 'Roboto, "Samsung Sans", Arial, sans-serif';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: px(12) }}>
      {ITEMS.map((it) => (
        <div
          key={it.key}
          onClick={() => onAdd(it.key)}
          onPointerDown={() => setPressed(it.key)}
          onPointerUp={() => setPressed(null)}
          onPointerLeave={() => setPressed(null)}
          onPointerCancel={() => setPressed(null)}
          style={{
            boxSizing: 'border-box',
            cursor: 'pointer',
            minWidth: px(120),
            height: px(158),
            padding: `${px(18)}px ${px(18)}px 0`,
            borderRadius: px(20),
            background: pressed === it.key ? CARD_PRESSED : it.free ? CARD_FREE : CARD,
            transition: 'background 0.1s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <PictogramTile name={it.key} size={px(82)} />
          <div
            style={{
              marginTop: px(125 - 14 - 18 - 82),
              lineHeight: `${px(28)}px`,
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
    </div>
  );
};
