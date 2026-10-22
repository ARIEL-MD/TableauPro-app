/**
 * Géométrie des compteurs d'énergie, partagée entre le dessin (MeterSvg),
 * la pose sur le rail (ElectricalDeviceSvg) et le choix de borne (WireConnectionModal).
 *
 * Toutes les positions sont des fractions (0 à 1) de la largeur / hauteur du dessin.
 */
export interface MeterGeometry {
  /** Largeur / hauteur du dessin : le compteur n'est jamais déformé. */
  aspect: number;
  /** Position horizontale de chaque borne (une borne = une vis par pôle). */
  terminalX: number[];
  /** Hauteur de la vis haute et de la vis basse. */
  topY: number;
  bottomY: number;
}

export const METER_GEOMETRY: Record<string, MeterGeometry> = {
  // Compteur triphasé : 8 bornes à 2 vis
  'Meter 3P': {
    aspect: 870 / 714,
    terminalX: [0.106, 0.207, 0.313, 0.418, 0.524, 0.63, 0.736, 0.841],
    topY: 0.723,
    bottomY: 0.783,
  },
  // Compteur monophasé : 4 bornes à 1 vis
  'Meter 1P': {
    aspect: 868 / 886,
    terminalX: [0.158, 0.351, 0.545, 0.738],
    topY: 0.735,
    bottomY: 0.775,
  },
};

/** Largeur sur le plan, en modules DIN (1 module = 36 px). */
export const METER_MODULES: Record<string, number> = {
  'Meter 3P': 7,
  'Meter 1P': 5,
};
