import React, { useState } from 'react';
import {
  ElectricalDevice,
  BreakerCalibre,
  WireGauge,
  PictogramKey,
  DifferentialType,
  DifferentialSensibility,
} from '../types/panel';
import { PICTOGRAM_LIST, PictogramIcon } from './PictogramIcon';
import { WireConnectionModal, WireDraft } from './WireConnectionModal';
import { CableWire } from '../types/panel';
import {
  X,
  Trash2,
  Copy,
  MoveLeft,
  MoveRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Wrench,
  Tag,
  Gauge,
  SlidersHorizontal,
  Cable,
} from 'lucide-react';

interface PropertyInspectorProps {
  device: ElectricalDevice | null;
  allWires?: CableWire[];
  onStartWire?: (fromAnchor: string, draft: WireDraft) => void;
  onDeleteWire?: (wireId: string) => void;
  onClose: () => void;
  onUpdateDevice: (updated: ElectricalDevice) => void;
  onDeleteDevice: (deviceId: string) => void;
  onDuplicateDevice: (device: ElectricalDevice) => void;
  onMoveDevice: (deviceId: string, direction: 'left' | 'right') => void;
}

// Preset authentic manufacturer references from top brands
const MANUFACTURER_PRESETS: {
  id: string;
  name: string;
  brand: 'Legrand' | 'Schneider Electric' | 'Hager';
  series: string;
  ref: string;
  category: ElectricalDevice['category'];
  poles: ElectricalDevice['poles'];
  calibre?: number;
  curve?: 'A' | 'B' | 'C' | 'D' | 'K' | 'Z' | 'none';
  differentialType?: DifferentialType;
  differentialSensibility?: DifferentialSensibility;
  breakingCapacity?: '4.5 kA' | '6 kA' | '10 kA';
  moduleWidth: number;
  defaultLabel: string;
  defaultPictogram: PictogramKey;
  wireGauge: WireGauge;
  desc: string;
}[] = [
  // Disjoncteurs Legrand Drivia
  {
    id: 'leg_10a_auto',
    name: 'Disjoncteur 10A Drivia Auto',
    brand: 'Legrand',
    series: 'Drivia',
    ref: '406773',
    category: 'breaker',
    poles: '1P+N',
    calibre: 10,
    curve: 'C',
    breakingCapacity: '4.5 kA',
    moduleWidth: 1,
    defaultLabel: 'Éclairage Salon',
    defaultPictogram: 'lighting',
    wireGauge: '1.5mm²',
    desc: 'Circuit éclairage & volets. Bornes auto SanVis.',
  },
  {
    id: 'leg_16a_auto',
    name: 'Disjoncteur 16A Drivia Auto',
    brand: 'Legrand',
    series: 'Drivia',
    ref: '406774',
    category: 'breaker',
    poles: '1P+N',
    calibre: 16,
    curve: 'C',
    breakingCapacity: '4.5 kA',
    moduleWidth: 1,
    defaultLabel: 'Prises Séjour',
    defaultPictogram: 'socket',
    wireGauge: '1.5mm²',
    desc: 'Jusqu’à 8 prises standard 16A. Bornes automatiques.',
  },
  {
    id: 'leg_20a_auto',
    name: 'Disjoncteur 20A Drivia Auto',
    brand: 'Legrand',
    series: 'Drivia',
    ref: '406775',
    category: 'breaker',
    poles: '1P+N',
    calibre: 20,
    curve: 'C',
    breakingCapacity: '4.5 kA',
    moduleWidth: 1,
    defaultLabel: 'Lave-linge',
    defaultPictogram: 'washing_machine',
    wireGauge: '2.5mm²',
    desc: 'Circuit spécialisé 20A (Lave-linge, four, lave-vaisselle).',
  },
  {
    id: 'leg_32a_vis',
    name: 'Disjoncteur 32A Drivia Vis',
    brand: 'Legrand',
    series: 'Drivia',
    ref: '406777',
    category: 'breaker',
    poles: '1P+N',
    calibre: 32,
    curve: 'C',
    breakingCapacity: '4.5 kA',
    moduleWidth: 1,
    defaultLabel: 'Plaque de Cuisson',
    defaultPictogram: 'cooktop',
    wireGauge: '6mm²',
    desc: 'Circuit dédié plaque cuisson ou cuisinière 32A (câble 6mm²).',
  },
  // Schneider Electric Resi9
  {
    id: 'sch_16a_resi9',
    name: 'Disjoncteur 16A Resi9',
    brand: 'Schneider Electric',
    series: 'Resi9',
    ref: 'R9FS616',
    category: 'breaker',
    poles: '1P+N',
    calibre: 16,
    curve: 'C',
    breakingCapacity: '4.5 kA',
    moduleWidth: 1,
    defaultLabel: 'Prises Chambres',
    defaultPictogram: 'socket',
    wireGauge: '1.5mm²',
    desc: 'Disjoncteur embrochable Resi9 XE ou bornes à vis.',
  },
  {
    id: 'sch_20a_resi9',
    name: 'Disjoncteur 20A Resi9',
    brand: 'Schneider Electric',
    series: 'Resi9',
    ref: 'R9FS620',
    category: 'breaker',
    poles: '1P+N',
    calibre: 20,
    curve: 'C',
    breakingCapacity: '4.5 kA',
    moduleWidth: 1,
    defaultLabel: 'Four Électrique',
    defaultPictogram: 'oven',
    wireGauge: '2.5mm²',
    desc: 'Protection four encastrable 20A.',
  },
  {
    id: 'sch_diff_40a_a',
    name: 'Interrupteur Diff. 40A 30mA Type A Resi9',
    brand: 'Schneider Electric',
    series: 'Resi9',
    ref: 'R9ERC240',
    category: 'differential',
    poles: '1P+N',
    calibre: 40,
    differentialSensibility: 30,
    differentialType: 'A',
    moduleWidth: 2,
    defaultLabel: 'Différentiel Type A (Cuisine)',
    defaultPictogram: 'cooktop',
    wireGauge: '10mm²',
    desc: 'Obligatoire plaque cuisson, lave-linge, borne VE.',
  },
  {
    id: 'sch_diff_63a_ac',
    name: 'Interrupteur Diff. 63A 30mA Type AC',
    brand: 'Schneider Electric',
    series: 'Acti9',
    ref: 'A9R11263',
    category: 'differential',
    poles: '1P+N',
    calibre: 63,
    differentialSensibility: 30,
    differentialType: 'AC',
    moduleWidth: 2,
    defaultLabel: 'Différentiel Rangée Générale',
    defaultPictogram: 'house',
    wireGauge: '16mm²',
    desc: 'Tête de rangée standard pour logements > 100m².',
  },
  // Hager SanVis
  {
    id: 'hag_16a_sanvis',
    name: 'Disjoncteur 16A SanVis',
    brand: 'Hager',
    series: 'SanVis',
    ref: 'MFS716',
    category: 'breaker',
    poles: '1P+N',
    calibre: 16,
    curve: 'C',
    breakingCapacity: '4.5 kA',
    moduleWidth: 1,
    defaultLabel: 'Prises Cuisine',
    defaultPictogram: 'kitchen',
    wireGauge: '2.5mm²',
    desc: 'Raccordement rapide sans outil SanVis Hager.',
  },
  // Triphasé 400V
  {
    id: 'sch_mcb_3p_20a',
    name: 'Disjoncteur 3P 20A Courbe D (Moteurs)',
    brand: 'Schneider Electric',
    series: 'Acti9 iC60N',
    ref: 'A9F74320',
    category: 'breaker',
    poles: '3P',
    calibre: 20,
    curve: 'D',
    breakingCapacity: '6 kA',
    moduleWidth: 3,
    defaultLabel: 'Pompe à Chaleur Tri',
    defaultPictogram: 'heat_pump',
    wireGauge: '2.5mm²',
    desc: 'Courbe D pour fort courant d’appel compresseur/pompe.',
  },
  {
    id: 'sch_diff_4p_40a',
    name: 'Interrupteur Différentiel Tétrapolaire 4P 40A',
    brand: 'Schneider Electric',
    series: 'Acti9',
    ref: 'A9R11440',
    category: 'differential',
    poles: '4P',
    calibre: 40,
    differentialSensibility: 30,
    differentialType: 'A',
    moduleWidth: 4,
    defaultLabel: 'Arrivée Triphasée 400V',
    defaultPictogram: 'motor',
    wireGauge: '10mm²',
    desc: 'Protection différentielle générale 3P+N en réseau 400V.',
  },
  // Contacteur Jour/Nuit
  {
    id: 'leg_contacteur_jn',
    name: 'Contacteur Heures Creuses J/N 20A Silencieux',
    brand: 'Legrand',
    series: 'Drivia',
    ref: '412501',
    category: 'contactor',
    poles: '2P',
    calibre: 20,
    moduleWidth: 1,
    defaultLabel: 'Chauffe-eau J/N',
    defaultPictogram: 'boiler',
    wireGauge: '2.5mm²',
    desc: 'Pilotage asservi Linky C1/C2 avec forçage manuel 1-AUTO-0.',
  },
  // Parafoudre
  {
    id: 'leg_parafoudre_t2',
    name: 'Parafoudre Modulaire Type 2 Débrochable',
    brand: 'Legrand',
    series: 'Drivia',
    ref: '412224',
    category: 'surge_arrester',
    poles: '1P+N',
    calibre: 20,
    moduleWidth: 2,
    defaultLabel: 'Protection Foudre',
    defaultPictogram: 'earth',
    wireGauge: '16mm²',
    desc: 'Protection parafoudre obligatoire NF C 15-100 zone AQ2.',
  },
  // Prise de courant
  {
    id: 'leg_prise_mod',
    name: 'Prise de Courant Modulaire 2P+T 16A',
    brand: 'Legrand',
    series: 'Drivia',
    ref: '412891',
    category: 'socket',
    poles: '2P',
    calibre: 16,
    moduleWidth: 2,
    defaultLabel: 'Prise de Tableau',
    defaultPictogram: 'socket',
    wireGauge: '2.5mm²',
    desc: 'Alimentation temporaire d’outillage ou box internet.',
  },
  // Compteur d’énergie
  {
    id: 'sch_compteur_mid',
    name: 'Sous-compteur d’Énergie Certifié MID LCD',
    brand: 'Schneider Electric',
    series: 'Acti9',
    ref: 'A9MEM2050',
    category: 'meter',
    poles: '1P+N',
    calibre: 45,
    moduleWidth: 1,
    defaultLabel: 'Comptage Énergie',
    defaultPictogram: 'solar',
    wireGauge: '10mm²',
    desc: 'Mesure directe 45A avec sortie impulsionnelle et afficheur LCD.',
  },
];


/* Courbes et intensités proposées selon le type d'appareil */
const CURVES: ('A' | 'B' | 'C' | 'D' | 'K' | 'Z' | 'none')[] = ['A', 'B', 'C', 'D', 'K', 'Z', 'none'];
const MCB_INTENSITIES = [1, 2, 3, 4, 6, 8, 10, 13, 16, 20, 25, 32, 40, 50, 63];
const RCD_INTENSITIES = [25, 40, 63];

const calibreChip = (d: ElectricalDevice): string => {
  if (d.category === 'differential') {
    const sens = typeof d.differentialSensibility === 'number' ? d.differentialSensibility : 30;
    return `${d.calibre ?? '—'}A ${sens}mA`;
  }
  const curve = d.curve && d.curve !== 'none' ? d.curve : '';
  return d.calibre === undefined ? '—' : `${curve}${d.calibre}`;
};

const CalibreModal: React.FC<{
  device: ElectricalDevice;
  onClose: () => void;
  onSave: (patch: Partial<ElectricalDevice>) => void;
}> = ({ device, onClose, onSave }) => {
  const isDiffDev = device.category === 'differential';
  const intensities = isDiffDev ? RCD_INTENSITIES : MCB_INTENSITIES;
  const [curve, setCurve] = useState<NonNullable<ElectricalDevice['curve']>>(device.curve ?? 'C');
  const [cal, setCal] = useState<number | undefined>(typeof device.calibre === 'number' ? device.calibre : undefined);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-2xl shadow-2xl p-4 text-slate-900"
      >
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={onClose} className="text-[#007aff] text-sm cursor-pointer">Annuler</button>
          <span className="font-bold text-sm">Calibre</span>
          <span className="w-12" />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 w-20">
            <span className="text-xs font-bold">{device.name}</span>
            <span className="text-[10px] px-1 rounded bg-black text-white font-mono">{cal === undefined ? '—' : `${isDiffDev ? '' : curve === 'none' ? '' : curve}${cal}`}</span>
          </div>
          <div className="flex-1">
            {!isDiffDev && (
              <>
                <p className="text-xs text-slate-500 mb-1">Courbe de déclenchement</p>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {CURVES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurve(c)}
                      className={`py-1.5 rounded-md text-xs font-bold cursor-pointer ${curve === c ? 'bg-[#007aff] text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {c === 'none' ? '—' : c}
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="text-xs text-slate-500 mb-1">Intensité</p>
            <div className="max-h-44 overflow-y-auto grid grid-cols-3 gap-1.5">
              {intensities.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCal(i)}
                  className={`py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer ${cal === i ? 'bg-[#007aff] text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {i}A
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onSave({ calibre: undefined, curve: undefined })}
            className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold cursor-pointer"
          >
            Supprimer le calibre
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({
                calibre: cal,
                curve: isDiffDev ? device.curve : curve,
                wireGauge: cal !== undefined && cal >= 32 ? '6mm²' : cal !== undefined && cal >= 20 ? '2.5mm²' : '1.5mm²',
              });
              onClose();
            }}
            className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold cursor-pointer"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  device,
  allWires = [],
  onStartWire,
  onDeleteWire,
  onClose,
  onUpdateDevice,
  onDeleteDevice,
  onDuplicateDevice,
  onMoveDevice,
}) => {
  const [wireModalOpen, setWireModalOpen] = useState(false);
  const [calibreModalOpen, setCalibreModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'circuit' | 'presets'>('specs');

  if (!device) return null;

  const isBreaker = device.category === 'breaker';
  const isDiff = device.category === 'differential';
  const isRcbo = device.category === 'rcbo';
  const isContactor = device.category === 'contactor';
  const isSurge = device.category === 'surge_arrester';
  const isSocket = device.category === 'socket';
  const isMeter = device.category === 'meter';
  const isSwitchDisc = device.category === 'switch_disconnector' || device.category === 'isolator';

  const brand = device.manufacturer || (device.reference.startsWith('LEG') ? 'Legrand' : device.reference.startsWith('SCH') ? 'Schneider Electric' : device.reference.startsWith('HAG') ? 'Hager' : 'Schneider Electric');

  // Calibres adaptés selon le composant
  const breakerCalibres: BreakerCalibre[] = [2, 6, 10, 16, 20, 25, 32, 40, 50, 63];
  const diffCalibres: BreakerCalibre[] = [25, 40, 63, 80];
  const wireGauges: WireGauge[] = ['1.5mm²', '2.5mm²', '4mm²', '6mm²', '10mm²', '16mm²', '25mm²'];

  // Check NF C 15-100 cable vs calibre compliance
  const getWireWarning = () => {
    const cal = device.calibre || 16;
    const gauge = device.wireGauge || '2.5mm²';

    if (cal >= 32 && (gauge === '1.5mm²' || gauge === '2.5mm²' || gauge === '4mm²')) {
      return 'Section insuffisante ! 32A requiert obligatoirement 6 mm² mini.';
    }
    if (cal === 20 && gauge === '1.5mm²') {
      return 'Section insuffisante ! 20A requiert du 2.5 mm² pour les prises spécialisées.';
    }
    return null;
  };

  const wireWarning = getWireWarning();

  const handleApplyPreset = (preset: typeof MANUFACTURER_PRESETS[0]) => {
    onUpdateDevice({
      ...device,
      name: preset.name,
      manufacturer: preset.brand,
      modelSeries: preset.series,
      reference: preset.ref,
      category: preset.category,
      poles: preset.poles,
      calibre: preset.calibre ?? device.calibre,
      curve: preset.curve ?? device.curve,
      differentialType: preset.differentialType ?? device.differentialType,
      differentialSensibility: preset.differentialSensibility ?? device.differentialSensibility,
      breakingCapacity: preset.breakingCapacity ?? device.breakingCapacity,
      moduleWidth: preset.moduleWidth,
      circuitLabel: preset.defaultLabel,
      assignedPictogram: preset.defaultPictogram,
      wireGauge: preset.wireGauge,
    });
  };

  return (
    <>
    {calibreModalOpen && (
      <CalibreModal
        device={device}
        onClose={() => setCalibreModalOpen(false)}
        onSave={(patch) => onUpdateDevice({ ...device, ...patch })}
      />
    )}
    <aside
      aria-label="Inspecteur de modèle de composant"
      className="fixed top-14 right-0 bottom-0 w-88 sm:w-96 z-40 bg-slate-900/98 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl p-4 flex flex-col justify-between overflow-y-auto no-print text-slate-100 font-sans"
    >
      <div className="space-y-4">
        {/* ========================================================
            PANEL HEADER
           ======================================================== */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#007aff]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fiche Modèle Électrique
            </h3>
          </div>
          <div className="flex items-center gap-1">
          {(isBreaker || isRcbo || isDiff) && (
            <button
              type="button"
              onClick={() => setCalibreModalOpen(true)}
              className="px-2 py-0.5 rounded-md bg-black text-white text-[11px] font-bold font-mono hover:bg-slate-800 cursor-pointer"
              title="Modifier le calibre"
            >
              {calibreChip(device)}
            </button>
          )}
          <button
            type="button"
            onClick={() => setWireModalOpen(true)}
            className="p-1 rounded-md text-amber-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Connecter un fil"
            aria-label="Connecter un fil"
          >
            <Cable className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
          </div>
        </div>

        {/* ========================================================
            REALISTIC COMPONENT PREVIEW CARD
           ======================================================== */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Pictogram or Category Icon */}
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
                {device.assignedPictogram ? (
                  <PictogramIcon name={device.assignedPictogram} size={22} />
                ) : (
                  <Zap className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-[#007aff] uppercase tracking-wider block">
                  {brand} · {device.modelSeries || 'Gamme Certifiée'}
                </span>
                <h4 className="text-xs font-bold text-white truncate max-w-[190px]">
                  {device.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Réf: <span className="text-slate-200 font-semibold">{device.reference}</span> · {device.moduleWidth} Module{device.moduleWidth > 1 ? 's' : ''} ({device.poles})
                </p>
              </div>
            </div>

            {/* Voltage / Phase Badge */}
            <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
              {device.poles.includes('3P') || device.poles.includes('4P') ? '400V~ Tri' : '230V~ Mono'}
            </span>
          </div>

          {/* Quick Technical Specs Summary Bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Calibre</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {device.calibre ? `${device.calibre} A` : 'N/A'}
              </span>
            </div>
            <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Pouvoir Icn</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {device.breakingCapacity || '4.5 kA'}
              </span>
            </div>
            <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Section</span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {device.wireGauge || '2.5 mm²'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS (Spécifications / Circuit / Modèles Réels)
           ======================================================== */}
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" /> Spécifications
          </button>
          <button
            onClick={() => setActiveTab('circuit')}
            className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'circuit'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Repérage NF
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Modèles Constructeurs
          </button>
        </div>

        {/* ========================================================
            TAB 1: SPECIFICATIONS TECHNIQUES RÉELLES
           ======================================================== */}
        {activeTab === 'specs' && (
          <div className="space-y-3.5 text-xs">
            {/* Manufacturer Brand Choice */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Marque Fabricant Réelle
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Schneider Electric', 'Legrand', 'Hager'] as const).map((mfg) => (
                  <button
                    key={mfg}
                    type="button"
                    onClick={() => onUpdateDevice({ ...device, manufacturer: mfg })}
                    className={`py-1.5 px-1 rounded text-[11px] font-semibold transition-all cursor-pointer truncate ${
                      brand === mfg
                        ? 'bg-[#007aff] text-white ring-1 ring-blue-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {mfg.replace(' Electric', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. DISJONCTEUR (MCB / RCBO) : Calibre & Courbe */}
            {(isBreaker || isRcbo) && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">Calibre Nominal (In)</label>
                    <span className="text-[10px] text-amber-400 font-bold font-mono">
                      {device.calibre || 16}A
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {breakerCalibres.map((cal) => (
                      <button
                        key={cal}
                        type="button"
                        onClick={() =>
                          onUpdateDevice({
                            ...device,
                            calibre: cal,
                            wireGauge: cal >= 32 ? '6mm²' : cal >= 20 ? '2.5mm²' : '1.5mm²',
                          })
                        }
                        className={`py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          device.calibre === cal
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {cal}A
                      </button>
                    ))}
                  </div>
                </div>

                {/* Courbe de déclenchement (B, C, D) */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Courbe de Déclenchement Magnétique
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { c: 'B', label: 'B (Câbles longs)' },
                      { c: 'C', label: 'C (Standard)' },
                      { c: 'D', label: 'D (Moteurs)' },
                    ].map(({ c, label }) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateDevice({ ...device, curve: c as ElectricalDevice['curve'] })}
                        className={`py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          (device.curve || 'C') === c
                            ? 'bg-[#007aff] text-white shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pouvoir de coupure Icn */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Pouvoir de Coupure Icn (Norme NF EN 60898)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['4.5 kA', '6 kA', '10 kA'] as const).map((icn) => (
                      <button
                        key={icn}
                        type="button"
                        onClick={() => onUpdateDevice({ ...device, breakingCapacity: icn })}
                        className={`py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          (device.breakingCapacity || '4.5 kA') === icn
                            ? 'bg-slate-200 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {icn}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 2. INTERRUPTEUR DIFFÉRENTIEL (RCCB) */}
            {isDiff && (
              <>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Type de Différentiel (Protection Personnes)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { t: 'AC', desc: 'Standard (Prises/Écl.)' },
                      { t: 'A', desc: 'Spécialisé (Plaque/LL/VE)' },
                      { t: 'F', desc: 'Haute Immunité (PAC)' },
                    ].map(({ t, desc }) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onUpdateDevice({ ...device, differentialType: t as DifferentialType })}
                        className={`py-2 px-1 rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                          device.differentialType === t
                            ? 'bg-red-600 text-white font-bold ring-1 ring-red-400'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold font-mono">Type {t}</span>
                        <span className="text-[8.5px] opacity-80 mt-0.5 leading-tight text-center">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Calibre Nominal d’Alimentation
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {diffCalibres.map((cal) => (
                      <button
                        key={cal}
                        type="button"
                        onClick={() => onUpdateDevice({ ...device, calibre: cal })}
                        className={`py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          device.calibre === cal
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {cal}A
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Sensibilité de Déclenchement (IΔn)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[10, 30, 300].map((sens) => (
                      <button
                        key={sens}
                        type="button"
                        onClick={() => onUpdateDevice({ ...device, differentialSensibility: sens as DifferentialSensibility })}
                        className={`py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          (device.differentialSensibility || 30) === sens
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {sens} mA {sens === 30 ? '(NF C 15-100)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Test Button */}
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-200 block">Bouton de Test Mensuel (T)</span>
                    <span className="text-[10px] text-slate-400">Simuler le déclenchement de protection</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDevice({
                        ...device,
                        isOn: !device.isOn,
                      })
                    }
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded shadow-xs cursor-pointer"
                  >
                    TEST (T)
                  </button>
                </div>
              </>
            )}

            {/* 3. CONTACTEUR JOUR/NUIT */}
            {isContactor && (
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Position du Sélecteur Manuel (Façade)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { state: '1', title: '1 - Forcé', desc: 'Marche forcée temporaire' },
                    { state: 'AUTO', title: 'AUTO - J/N', desc: 'Piloté contact Linky' },
                    { state: '0', title: '0 - Arrêt', desc: 'Coupure absence/vacances' },
                  ].map(({ state, title, desc }) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => onUpdateDevice({ ...device, contactorState: state as any })}
                      className={`p-2 rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                        (device.contactorState || 'AUTO') === state
                          ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{title}</span>
                      <span className="text-[8px] opacity-75 mt-0.5 text-center">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PARAFOUDRE (SPD) */}
            {isSurge && (
              <div className="space-y-2">
                <label className="block text-slate-400 font-medium mb-1">
                  État de la Cartouche Débrochable
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateDevice({ ...device, cartridgeState: 'good' })}
                    className={`p-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      device.cartridgeState !== 'replace'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Voyant Vert (OK)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateDevice({ ...device, cartridgeState: 'replace' })}
                    className={`p-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      device.cartridgeState === 'replace'
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> Voyant Rouge (Défaut)
                  </button>
                </div>
              </div>
            )}

            {/* 5. COMPTEUR D'ÉNERGIE (MID) */}
            {isMeter && (
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Index du Sous-compteur (kWh)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={device.meterKwh !== undefined ? device.meterKwh : 482.6}
                    onChange={(e) => onUpdateDevice({ ...device, meterKwh: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-[#007aff]"
                    step="0.1"
                  />
                  <span className="text-xs font-mono text-slate-400">kWh</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: REPÉRAGE DE CIRCUIT & SECTION NORMALISÉE
           ======================================================== */}
        {activeTab === 'circuit' && (
          <div className="space-y-3.5 text-xs">
            {/* Circuit Label */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Libellé du Circuit (Étiquette plastron)
              </label>
              <input
                type="text"
                value={device.circuitLabel || ''}
                onChange={(e) => onUpdateDevice({ ...device, circuitLabel: e.target.value })}
                placeholder="Ex: Prises Cuisine, Four, Éclairage Salon..."
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:outline-none focus:border-[#007aff] transition-colors"
              />
            </div>

            {/* Wire Gauge */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Section des Conducteurs Phase / Neutre (NF C 15-100)
              </label>
              <select
                value={device.wireGauge || '2.5mm²'}
                onChange={(e) => onUpdateDevice({ ...device, wireGauge: e.target.value as WireGauge })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#007aff]"
              >
                {wireGauges.map((wg) => (
                  <option key={wg} value={wg}>
                    {wg} {wg === '1.5mm²' ? '(Éclairage 10A / Prises 16A)' : wg === '2.5mm²' ? '(Prises spécialisées 20A)' : wg === '6mm²' ? '(Plaque cuisson 32A)' : ''}
                  </option>
                ))}
              </select>

              {wireWarning && (
                <div className="mt-1.5 p-2 rounded bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{wireWarning}</span>
                </div>
              )}
            </div>

            {/* Normalized Pictogram */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Pictogramme Symbolique Normalisé
              </label>
              <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-950/70 rounded-lg border border-slate-800">
                {PICTOGRAM_LIST.map((pic) => (
                  <button
                    key={pic.key}
                    type="button"
                    onClick={() => onUpdateDevice({ ...device, assignedPictogram: pic.key })}
                    className={`p-2 rounded flex items-center justify-center transition-all cursor-pointer ${
                      device.assignedPictogram === pic.key
                        ? 'bg-[#007aff] text-white ring-2 ring-blue-400 scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={pic.label}
                  >
                    <PictogramIcon name={pic.key} size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Position on Rail DIN */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-slate-400 font-medium mb-1">
                Emplacement sur le Rail DIN (Module {device.slotIndex + 1})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onMoveDevice(device.id, 'left')}
                  disabled={device.slotIndex <= 0}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-xs text-slate-200 flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <MoveLeft className="w-3.5 h-3.5" /> Déplacer à gauche
                </button>
                <button
                  type="button"
                  onClick={() => onMoveDevice(device.id, 'right')}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 flex items-center justify-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  Déplacer à droite <MoveRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MODÈLES CONSTRUCTEURS RÉELS PRÉCONFIGURÉS
           ======================================================== */}
        {activeTab === 'presets' && (
          <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
            <p className="text-[11px] text-slate-400 mb-2">
              Cliquez sur un modèle ci-dessous pour transformer ce composant avec les références exactes, dimensions et caractéristiques officielles du fabricant :
            </p>

            {MANUFACTURER_PRESETS.map((pst) => (
              <div
                key={pst.id}
                onClick={() => handleApplyPreset(pst)}
                className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-[#007aff]/60 transition-all cursor-pointer flex flex-col gap-1 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      {pst.brand}
                    </span>
                    <span className="font-bold text-white text-xs">{pst.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {pst.ref}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {pst.desc}
                </p>
                <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500 mt-0.5">
                  <span>{pst.moduleWidth}M ({pst.poles})</span>
                  <span>Section: {pst.wireGauge}</span>
                  {pst.breakingCapacity && <span>Icn: {pst.breakingCapacity}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          FILS : liste des fils qui touchent cet appareil
         ======================================================== */}
      {(() => {
        const prefix = `dev:${device.id}:`;
        const mine = allWires.filter((w) => w.from.startsWith(prefix) || w.to.startsWith(prefix));
        if (mine.length === 0) return null;
        return (
          <div className="pt-3 mt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 mb-1">Fils branchés sur cet appareil</p>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {mine.map((w) => (
                <li key={w.id} className="flex items-center justify-between">
                  <span>
                    {w.colorName} · {w.thickness} mm² · {w.from.startsWith(prefix) ? 'depuis' : 'vers'}{' '}
                    {w.from.startsWith(prefix) ? (w.to.startsWith('bar:') ? 'bornier' : 'autre appareil') : (w.from.startsWith('bar:') ? 'bornier' : 'autre appareil')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteWire?.(w.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    retirer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {wireModalOpen && (
        <WireConnectionModal
          device={device}
          onClose={() => setWireModalOpen(false)}
          onConfirm={(draft) => {
            onStartWire?.(`dev:${device.id}:${draft.terminal}`, draft);
            setWireModalOpen(false);
          }}
        />
      )}

      {/* ========================================================
          PANEL FOOTER ACTIONS (Dupliquer, Réinitialiser, Supprimer)
         ======================================================== */}
      <div className="pt-3 border-t border-slate-800 flex items-center gap-2 mt-4">
        <button
          type="button"
          onClick={() => onDuplicateDevice(device)}
          className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-blue-400" /> Dupliquer
        </button>
        <button
          type="button"
          onClick={() => onDeleteDevice(device.id)}
          className="py-1.5 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 rounded text-xs flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Supprimer
        </button>
      </div>
    </aside>
    </>
  );
};
