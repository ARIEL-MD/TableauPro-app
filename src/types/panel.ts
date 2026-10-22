/**
 * TableauPro - Electrical Panel Designer
 * Types & Data Model matching official specifications and mobile CAD references
 */

export type DeviceCategory = 
  | 'breaker' // MCB (Disjoncteurs)
  | 'differential' // RCCB (Dispositif différentiel résiduel)
  | 'rcbo' // RCBO (Disjoncteur différentiel avec protection contre surintensités)
  | 'switch_disconnector' // SD (Interrupteur-sectionneur)
  | 'isolator'
  | 'voltage_relay' // Relais de tension (1 phase / 3 phases)
  | 'contactor' // Contacteurs (1NO+1NC, 2NO, 4NO)
  | 'impulse_relay' // Télérupteurs (1NO, 2NO, 1NO+1NC)
  | 'time_relay' // Relais temporisés (électromécanique, numérique)
  | 'relay'
  | 'timer'
  | 'afdd' // Dispositif de détection d'arc électrique (AFDD+MCB, AFDD+RCBO)
  | 'surge_arrester' // SPD Parafoudre (1P, 1P+N, 3P, 3P+N)
  | 'indicator_light' // Voyants
  | 'indicator'
  | 'meter' // Compteur d'énergie monophasé / triphasé
  | 'socket' // Prise modulaire tableau
  | 'motor_starter' // Guardmotor
  | 'changeover' // Interrupteur-sectionneur inverseur
  | 'distribution_block' // Blocs de distribution étagés
  | 'terminal_bar' // Barres et bornes pour fils
  | 'busbar' // Peignes de raccordement
  | 'din_rail'; // Rails DIN

export type DevicePoles = '1P' | '1P+N' | '2P' | '3P' | '3P+N' | '4P';

export type BreakerCalibre = 2 | 6 | 10 | 16 | 20 | 25 | 32 | 40 | 45 | 50 | 63 | 80 | 100 | 125 | 160;

export type DifferentialSensibility = 10 | 30 | 100 | 300 | 500; // mA

export type DifferentialType = 'AC' | 'A' | 'F' | 'B';

export type WireGauge = '1.5mm²' | '2.5mm²' | '4mm²' | '6mm²' | '10mm²' | '16mm²' | '25mm²' | '35mm²';

export type IndicatorColor = 'red' | 'teal' | 'yellow' | 'blue' | 'white';

export type PictogramKey =
  | 'lighting'
  | 'socket'
  | 'oven'
  | 'washing_machine'
  | 'earth'
  | 'boiler'
  | 'air_conditioning'
  | 'bathroom'
  | 'kitchen'
  | 'microwave'
  | 'cooktop'
  | 'router'
  | 'dryer'
  | 'motor'
  | 'toilet'
  | 'house'
  | 'bedroom'
  | 'hallway'
  | 'intercom'
  | 'tv'
  | 'gate'
  | 'garage'
  | 'fridge'
  | 'ventilation'
  | 'floor_heating'
  | 'computer'
  | 'alarm'
  | 'camera'
  | 'ev_charger'
  | 'roller_shutter'
  | 'heat_pump'
  | 'solar'
  | 'blank';

export interface PictogramInfo {
  key: PictogramKey;
  label: string;
  category?: string;
}

export type WireTerminal = 'top' | 'bottom';

/**
 * Ancre d'une borne : `dev:<deviceId>:top|bottom` pour une borne d'appareil,
 * `bar:<barId>` pour un bornier (connexion par le haut).
 */
export type WireAnchor = string;

export interface CableWire {
  id: string;
  from: WireAnchor;
  to: WireAnchor;
  color: string; // hex
  colorName: string;
  thickness: WireThickness;
  /**
   * Tracé guidé aux flèches : [borne A, départ, ...coudes, arrivée, borne B],
   * en px de plan. Absent sur les anciens projets : tracé automatique.
   */
  route?: { x: number; y: number }[];
}
export type WireThickness = 1 | 2 | 3 | 4;

export interface ElectricalDevice {
  id: string;
  railId: string;
  slotIndex: number; // 0-based module position on the DIN rail
  moduleWidth: number; // in DIN modules (1 module = 17.5mm)
  category: DeviceCategory;
  name: string;
  reference: string;
  manufacturer?: 'Legrand' | 'Schneider Electric' | 'Hager' | 'ABB' | string;
  modelSeries?: string; // e.g. "Drivia", "Resi9", "SanVis", "Acti9"
  poles: DevicePoles;
  calibre?: BreakerCalibre | number;
  curve?: 'A' | 'B' | 'C' | 'D' | 'K' | 'Z' | 'none';
  differentialSensibility?: DifferentialSensibility | number;
  differentialType?: DifferentialType;
  breakingCapacity?: '4.5 kA' | '6 kA' | '10 kA';
  ratedVoltage?: '230V' | '400V';
  terminalType?: 'auto' | 'screw';
  contactorState?: 'AUTO' | '1' | '0';
  cartridgeState?: 'good' | 'replace';
  meterKwh?: number;
  indicatorColor?: IndicatorColor;
  indicatorCount?: number;
  isOn?: boolean; // switch toggle state
  assignedPictogram?: PictogramKey;
  circuitLabel?: string;
  wireGauge?: WireGauge | string;
  colorTag?: 'red' | 'green' | 'blue' | 'orange' | 'yellow';
  notes?: string;
  upstreamId?: string;
  /** true = appareil libre posé sur le plan (x/y), indépendant des rails */
  free?: boolean;
  x?: number;
  y?: number;
}

export interface DinRail {
  id: string;
  order: number;
  label: string; // e.g., "100 mm", "200 mm", "300 mm" or "Rangée 1"
  lengthMm?: number; // 100, 200, 250, 300, 400, 500, 600 mm
  capacityModules: number; // calculated from length: Math.floor(lengthMm / 17.5) or standard
  x: number;
  y: number;
  isPro?: boolean;
}

export interface BusbarComb {
  id: string;
  railId: string;
  polesCount?: 1 | 2 | 3 | 4;
  type?: string;
  config?: string;
  moduleLength: number; // e.g. 2, 4, 6, 8, 12, 13, 18
  startSlot: number;
  isPro?: boolean;
}

export interface DistributionBlock {
  id: string;
  name: string;
  configuration: '2x7' | '2x11' | '2x15' | '4x7' | '4x11' | '4x15';
  poles: '2P' | '4P';
  maxCurrentAmps: number;
  x: number;
  y: number;
  isPro?: boolean;
}

export interface TerminalBar {
  id: string;
  subType?: 'screw' | 'spring' | 'simple' | 'custom_contacts';
  type: 'earth' | 'neutral' | 'phase';
  holesCount: number; // e.g. 6, 11, 16, 21, 26 or "5+1", "8+2", etc.
  label?: string;
  color?: string; // 'blue' | 'green' | 'orange' | 'black' | 'yellow'
  x: number;
  y: number;
  isPro?: boolean;
}

export interface EnclosureMetadata {
  name: string;
  rows: number;
  modulesPerRow: number;
  brand: string;
  hasDoor: boolean;
  ipRating: string;
  ikRating: string;
}

/**
 * Objet libre posé sur le plan (onglet Marquage) : texte, tableau ou pictogramme.
 * Les coordonnées sont celles du plan (avant zoom).
 */
export interface PanelAnnotation {
  id: string;
  kind: 'text' | 'table' | 'pictogram';
  x: number;
  y: number;
  text?: string; // kind = 'text'
  fontSize?: number; // kind = 'text' (px)
  cells?: string[][]; // kind = 'table' (lignes x colonnes)
  pictogram?: PictogramKey; // kind = 'pictogram'
  size?: number; // kind = 'pictogram' (px)
  color?: string; // kind = 'pictogram' (couleur CSS)
}

export interface ElectricalPanelProject {
  id: string;
  version: string;
  title: string;
  clientName: string;
  location: string;
  dateCreated: string;
  dateUpdated: string;
  standard: 'NF C 15-100' | 'IEC 60364' | 'RGIE';
  enclosure: EnclosureMetadata;
  rails: DinRail[];
  devices: ElectricalDevice[];
  busbars: BusbarComb[];
  distributionBlocks: DistributionBlock[];
  terminalBars: TerminalBar[];
  wires?: CableWire[]; // fils reliant deux bornes (appareil ou bornier)
  annotations?: PanelAnnotation[]; // optionnel : anciens projets sauvegardés sans ce champ
}

export interface CatalogItem {
  id: string;
  title: string;
  category: DeviceCategory;
  subcategory: string;
  moduleWidth: number;
  poles: DevicePoles;
  calibre?: BreakerCalibre;
  curve?: 'A' | 'B' | 'C' | 'D' | 'K' | 'Z' | 'none';
  differentialSensibility?: DifferentialSensibility;
  differentialType?: DifferentialType;
  description: string;
  reference: string;
  estimatedPrice: number;
  isPro?: boolean;
  defaultPictogram?: PictogramKey;
}

export interface BOMItem {
  reference: string;
  designation: string;
  category: string;
  quantity: number;
  totalModules: number;
  unitPrice: number;
  totalPrice: number;
}
