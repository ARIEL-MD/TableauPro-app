import React from 'react';
import { PictogramKey, PictogramInfo } from '../types/panel';
import { PICTO_ART } from './PictogramArt';

export const PICTOGRAM_LIST: PictogramInfo[] = [
  // Habitation & Pièces
  { key: 'house', label: 'Maison / Général', category: 'habitation' },
  { key: 'bedroom', label: 'Chambre', category: 'habitation' },
  { key: 'hallway', label: 'Couloir / Hall', category: 'habitation' },
  { key: 'kitchen', label: 'Cuisine', category: 'habitation' },
  { key: 'bathroom', label: 'Salle de bain', category: 'habitation' },
  { key: 'toilet', label: 'Toilettes (WC)', category: 'habitation' },
  { key: 'garage', label: 'Garage', category: 'habitation' },

  // Équipements de base
  { key: 'lighting', label: 'Éclairage', category: 'habitation' },
  { key: 'socket', label: 'Prise de courant', category: 'habitation' },
  { key: 'earth', label: 'Mise à la terre', category: 'habitation' },

  // Gros électroménager
  { key: 'cooktop', label: 'Plaque de cuisson (32A)', category: 'gros_electromenager' },
  { key: 'oven', label: 'Four électrique', category: 'gros_electromenager' },
  { key: 'microwave', label: 'Micro-ondes', category: 'gros_electromenager' },
  { key: 'washing_machine', label: 'Lave-linge', category: 'gros_electromenager' },
  { key: 'dryer', label: 'Sèche-linge', category: 'gros_electromenager' },
  { key: 'fridge', label: 'Réfrigérateur / Congélateur', category: 'gros_electromenager' },

  // Confort & Chauffage
  { key: 'boiler', label: 'Chauffe-eau / Chaudière', category: 'confort' },
  { key: 'air_conditioning', label: 'Climatisation', category: 'confort' },
  { key: 'floor_heating', label: 'Chauffage au sol', category: 'confort' },
  { key: 'ventilation', label: 'Ventilation VMC', category: 'confort' },
  { key: 'heat_pump', label: 'Pompe à chaleur', category: 'confort' },
  { key: 'roller_shutter', label: 'Volets roulants', category: 'confort' },
  { key: 'ev_charger', label: 'Borne de recharge VE', category: 'confort' },

  // Sécurité, Réseau & Multimédia
  { key: 'router', label: 'Box Internet / Routeur', category: 'securite_reseau' },
  { key: 'tv', label: 'Téléviseur', category: 'securite_reseau' },
  { key: 'computer', label: 'Ordinateur / Bureau', category: 'securite_reseau' },
  { key: 'intercom', label: 'Interphone / Visiophone', category: 'securite_reseau' },
  { key: 'alarm', label: 'Alarme intrusion', category: 'securite_reseau' },
  { key: 'camera', label: 'Vidéosurveillance', category: 'securite_reseau' },
  { key: 'gate', label: 'Portail motorisé', category: 'securite_reseau' },
  { key: 'motor', label: 'Moteur / Pompe', category: 'securite_reseau' },
  { key: 'solar', label: 'Onduleur Solaire', category: 'confort' },
];

interface PictogramIconProps {
  name?: PictogramKey;
  className?: string;
  size?: number;
}

export const PictogramIcon: React.FC<PictogramIconProps> = ({ name, className = 'w-4 h-4', size = 16 }) => {
  if (!name) return null;

  // Pictogrammes « tuile » (mêmes dessins dans le tiroir et sur le plan).
  if (name in PICTO_ART) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {PICTO_ART[name]}
      </svg>
    );
  }

  switch (name) {
    case 'lighting':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'socket':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="9" cy="11" r="1.5" fill="currentColor" />
          <circle cx="15" cy="11" r="1.5" fill="currentColor" />
          <line x1="12" y1="5" x2="12" y2="8" />
        </svg>
      );
    case 'oven':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <circle cx="6" cy="8" r="1.5" fill="currentColor" />
          <circle cx="10" cy="8" r="1.5" fill="currentColor" />
          <circle cx="14" cy="8" r="1.5" fill="currentColor" />
          <rect x="4" y="12" width="16" height="6" rx="1" />
        </svg>
      );
    case 'washing_machine':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="7" cy="6" r="1" fill="currentColor" />
          <circle cx="12" cy="14" r="5" />
          <circle cx="12" cy="14" r="2" />
        </svg>
      );
    case 'dryer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="12" cy="13" r="5" />
          <path d="M10 13a2 2 0 1 0 4 0" />
        </svg>
      );
    case 'earth':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <line x1="12" y1="3" x2="12" y2="13" />
          <line x1="4" y1="13" x2="20" y2="13" />
          <line x1="7" y1="17" x2="17" y2="17" />
          <line x1="10" y1="21" x2="14" y2="21" />
        </svg>
      );
    case 'boiler':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="6" y="3" width="12" height="18" rx="6" />
          <path d="M12 9v4" />
          <circle cx="12" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    case 'air_conditioning':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="5" width="20" height="9" rx="2" />
          <line x1="6" y1="18" x2="8" y2="14" />
          <line x1="12" y1="19" x2="12" y2="14" />
          <line x1="18" y1="18" x2="16" y2="14" />
        </svg>
      );
    case 'bathroom':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 12h16c0 4-3 7-8 7s-8-3-8-7z" />
          <path d="M6 12V6a2 2 0 0 1 2-2h1" />
        </svg>
      );
    case 'kitchen':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M18 2v20M2 12h16M7 2v20M2 7h10" />
        </svg>
      );
    case 'microwave':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="4" width="20" height="15" rx="2" />
          <rect x="4" y="7" width="11" height="9" rx="1" />
          <line x1="18" y1="8" x2="18.01" y2="8" strokeWidth="3" />
          <line x1="18" y1="12" x2="18.01" y2="12" strokeWidth="3" />
        </svg>
      );
    case 'cooktop':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <circle cx="7" cy="9" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <circle cx="17" cy="15" r="2.5" />
          <circle cx="7" cy="15" r="2" />
        </svg>
      );
    case 'router':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="14" width="20" height="7" rx="2" />
          <line x1="6" y1="14" x2="6" y2="5" />
          <line x1="18" y1="14" x2="18" y2="5" />
          <circle cx="6" cy="4" r="1" fill="currentColor" />
          <circle cx="18" cy="4" r="1" fill="currentColor" />
        </svg>
      );
    case 'motor':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 16V8l4 5 4-5v8" />
        </svg>
      );
    case 'toilet':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M7 3h10v6H7z" />
          <path d="M7 9v4c0 3 2.5 5 5 5s5-2 5-5V9" />
          <path d="M10 18v3h4v-3" />
        </svg>
      );
    case 'house':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      );
    case 'bedroom':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 19h20M2 8v11M22 13v6M4 13h16a2 2 0 0 0 2-2V8H2v3a2 2 0 0 0 2 2z" />
        </svg>
      );
    case 'hallway':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 21V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v17" />
          <path d="M9 21V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12" />
        </svg>
      );
    case 'intercom':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="8" r="2.5" />
          <line x1="9" y1="14" x2="15" y2="14" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      );
    case 'tv':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="7" width="20" height="13" rx="2" />
          <path d="m17 3-5 4-5-4" />
        </svg>
      );
    case 'gate':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <line x1="7" y1="5" x2="7" y2="19" />
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="17" y1="5" x2="17" y2="19" />
        </svg>
      );
    case 'garage':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" />
          <path d="M7 14h10M7 17h10M7 20h10" />
        </svg>
      );
    case 'fridge':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="5" y1="9" x2="19" y2="9" />
          <line x1="8" y1="5" x2="8" y2="7" />
          <line x1="8" y1="12" x2="8" y2="15" />
        </svg>
      );
    case 'ventilation':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 12c-2-3-4-1-4 1s3 2 4-1zm0 0c3-2 1-4-1-4s-2 3 1 4zm0 0c2 3 4 1 4-1s-3-2-4 1zm0 0c-3 2-1 4 1 4s2-3-1-4z" />
        </svg>
      );
    case 'floor_heating':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 18h16M4 14h16M4 10c2-2 3-2 5 0s3 2 5 0 3-2 5 0" />
          <line x1="4" y1="21" x2="20" y2="21" />
        </svg>
      );
    case 'computer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case 'alarm':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 4a6 6 0 0 0-6 6v4l-2 2h16l-2-2v-4a6 6 0 0 0-6-6z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'camera':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m15 10 5-3v10l-5-3" />
          <rect x="2" y="6" width="13" height="12" rx="2" />
        </svg>
      );
    case 'ev_charger':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="4" y="3" width="10" height="18" rx="2" />
          <path d="m8 9 2 3h-2l2 3" />
          <path d="M14 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1" />
        </svg>
      );
    case 'roller_shutter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="11" x2="20" y2="11" />
          <line x1="4" y1="15" x2="20" y2="15" />
        </svg>
      );
    case 'heat_pump':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="12" cy="12" r="5" />
          <path d="m12 7 2 5h-4l2 5" />
        </svg>
      );
    case 'solar':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 14 6 5h12l2 9z" />
          <line x1="6" y1="10" x2="18" y2="10" />
          <line x1="12" y1="5" x2="12" y2="14" />
          <path d="M12 14v6M8 20h8" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

/**
 * Tuile blanche arrondie à fine bordure sombre, avec le pictogramme au trait gris foncé.
 * Identique dans le tiroir « Objets & Symboles » et sur le plan.
 */
export const PictogramTile: React.FC<{ name?: PictogramKey; size?: number; color?: string }> = ({
  name,
  size = 82,
  color = '#4b4b4b',
}) => (
  <div
    style={{
      width: size,
      height: size,
      boxSizing: 'border-box',
      borderRadius: size * 0.17,
      background: '#fff',
      border: `${Math.max(1, size * 0.018)}px solid #2b2b2b`,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <PictogramIcon name={name} size={size * 0.78} className="shrink-0" />
  </div>
);
