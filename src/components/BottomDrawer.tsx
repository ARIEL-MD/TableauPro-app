import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PictogramKey } from '../types/panel';
import { DeviceThumbSvg } from './DeviceThumbSvg';
import { DistributionBlockThumb, DISTRIBUTION_THUMB_HEIGHT } from './DistributionBlockThumb';
import { PictogramCards } from './PictogramCards';
import { TextCards } from './TextCards';
import { Plus, Minus } from 'lucide-react';
import { WireTerminalCards } from './WireTerminalCards';
import { DinRailCards } from './DinRailCards';
import { ColorChips as ColorChipsView } from './ColorChips';
import { McbCards } from './McbCards';
import { TimerRelayCards, AfddCards } from './ProDeviceCards';
import { SpringBarCards } from './SpringBarCards';
import { INDICATOR_COLORS, INDICATOR_RIMS } from './RefDevices';
import { thumbTypeForDevice } from './ElectricalDeviceSvg';
import { CustomDeviceModal } from './CustomDeviceModal';
import type { CustomDeviceDef } from '../utils/customDevices';
import type { ElectricalDevice } from '../types/panel';
import { Pencil, Trash2 } from 'lucide-react';

/** Appareil fictif servant uniquement à choisir la vignette d'un appareil personnalisé. */
const thumbTypeForCustom = (d: CustomDeviceDef): string =>
  thumbTypeForDevice({
    id: d.id,
    railId: '',
    slotIndex: 0,
    moduleWidth: d.moduleWidth,
    category: d.category,
    name: d.name,
    reference: d.reference,
    poles: d.poles,
  } as ElectricalDevice);

export type DrawerCategory =
  | 'appareils'
  | 'rails'
  | 'borniers'
  | 'repartiteurs'
  | 'peignes'
  | 'marquage'
  | 'modeles';

interface BottomDrawerProps {
  onAddDeviceByType: (deviceType: string, options?: any) => void;
  onAddRailByLength: (lengthMm: number) => void;
  onAddTerminalBar: (type: 'screw' | 'spring' | 'simple' | 'custom', holes: number, color?: string) => void;
  onAddDistributionBlock: (config: '2x7' | '2x11' | '2x15' | '4x7' | '4x11' | '4x15') => void;
  onAddBusbarComb: (poles: 1 | 2 | 3 | 4, length: number, config: string) => void;
  onAssignPictogramToSelected: (pictogram: PictogramKey) => void;
  onAddAnnotation: (kind: 'text' | 'table' | 'pictogram', pictogram?: PictogramKey) => void;
  onLoadTemplate: (templateKey: string) => void;
  onCreateNewTemplate: () => void;
  customDevices: CustomDeviceDef[];
  onSaveCustomDevice: (def: CustomDeviceDef) => void;
  onDeleteCustomDevice: (id: string) => void;
  onAddCustomDevice: (def: CustomDeviceDef) => void;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  customDevices,
  onSaveCustomDevice,
  onDeleteCustomDevice,
  onAddCustomDevice,
  onAddDeviceByType,
  onAddRailByLength,
  onAddTerminalBar,
  onAddDistributionBlock,
  onAddBusbarComb,
  onAssignPictogramToSelected,
  onAddAnnotation,
  onLoadTemplate,
  onCreateNewTemplate,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DrawerCategory>('appareils');
  // null = fermé ; 'new' = création ; sinon l'appareil en cours de modification
  const [customEditor, setCustomEditor] = useState<CustomDeviceDef | 'new' | null>(null);

  // Configurable states for interactive cards
  const [comb1PLength, setComb1PLength] = useState(2);
  const [comb2PLength, setComb2PLength] = useState(4);
  const [comb2PConfig, setComb2PConfig] = useState<'L_N' | 'N_L' | 'L1_L2'>('L_N');

  const [comb3PLength, setComb3PLength] = useState(6);

  const [comb4PLength, setComb4PLength] = useState(8);
  const [comb4PConfig, setComb4PConfig] = useState<'L1_L2_L3_N' | 'N_L1_L2_L3' | 'L1N_L2N_L3N'>('N_L1_L2_L3');

  const [colors, setColors] = useState<Record<string, string>>({
    mcb: 'orange',
    rcd: 'red',
    rcbo: 'red',
    sd: 'red',
  });

  const [activeDistribution, setActiveDistribution] = useState<string>('2x7');
  const [indicatorCount, setIndicatorCount] = useState(1);
  const [indicatorColor, setIndicatorColor] = useState<'red' | 'teal' | 'yellow' | 'blue' | 'white'>('red');


  const categories: { id: DrawerCategory; label: string }[] = [
    { id: 'appareils', label: 'Appareils' },
    { id: 'rails', label: 'Rails DIN' },
    { id: 'borniers', label: 'Barres et bornes pour fils' },
    { id: 'repartiteurs', label: 'Blocs de distribution' },
    { id: 'peignes', label: 'Peignes de raccordement' },
    { id: 'marquage', label: 'Marquage' },
    { id: 'modeles', label: 'Modèles' },
  ];

  // Puces de couleur (reproduction de la capture) : voir ColorChips.tsx
  const ColorChips = ({ group }: { group: string }) => (
    <ColorChipsView
      value={colors[group]}
      onChange={(key) => setColors((prev) => ({ ...prev, [group]: key }))}
    />
  );

  return (
    <aside
      aria-label="Panneau de composants"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl transition-all duration-300 rounded-t-3xl ${
        isOpen ? 'h-80 sm:h-96' : 'h-14'
      }`}
    >
      {/* Drawer Handle & Header */}
      <div className="pt-2 px-4 flex flex-col items-center">
        {/* Drag handle line */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-1 bg-slate-300 hover:bg-slate-400 rounded-full cursor-pointer transition-colors mb-2"
          title={isOpen ? 'Réduire' : 'Agrandir'}
        />

        {/* Horizontal Category Pill Tabs matching exact screenshot styling */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (!isOpen) setIsOpen(true);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id && isOpen
                  ? 'bg-[#007aff] text-white shadow-xs'
                  : 'bg-[#374151] hover:bg-[#4b5563] text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Drawer Scroll Area */}
      {isOpen && (
        <div className="h-[calc(100%-60px)] px-4 pb-4 overflow-y-auto space-y-5 text-slate-800">
          {/* ========================================================
              TAB 1: APPAREILS
             ======================================================== */}
          {activeCategory === 'appareils' && (
            <div className="space-y-4 pt-1">
              {/* SECTION: Appareils personnalisés */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Appareils personnalisés</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  <div
                    onClick={() => setCustomEditor('new')}
                    className="relative w-24 h-28 rounded-xl border-2 border-dashed border-[#007aff]/60 bg-blue-50/60 hover:bg-blue-100/60 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
                  >
                    <Plus className="w-5 h-5 text-[#007aff]" />
                    <span className="text-[10px] text-[#007aff] font-semibold mt-1 text-center">Créer</span>
                  </div>
                  {customDevices.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => onAddCustomDevice(d)}
                      className="group relative w-28 h-28 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="absolute right-1 top-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setCustomEditor(d)}
                          className="rounded-md bg-slate-700/80 p-1 text-white hover:bg-slate-600"
                          aria-label="Modifier"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDeleteCustomDevice(d.id)}
                          className="rounded-md bg-slate-700/80 p-1 text-white hover:bg-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex-1 flex items-center justify-center pt-3">
                        <DeviceThumbSvg type={thumbTypeForCustom(d)} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Disjoncteurs */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Disjoncteurs</h3>
                <ColorChips group="mcb" />
                <McbCards color={colors.mcb} onAdd={(type) => onAddDeviceByType(type, { color: colors.mcb })} />
              </div>

              {/* SECTION: Dispositif différentiel résiduel */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">
                  Dispositif différentiel résiduel
                </h3>
                <ColorChips group="rcd" />
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {[
                    { label: 'RCD 2P', type: 'RCCB 2P' },
                    { label: 'RCD 4P', type: 'RCCB 4P' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onAddDeviceByType(item.type, { color: colors.rcd })}
                      className="group relative w-24 h-28 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={item.type} color={colors.rcd} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}

                  <div
                    onClick={() => onAddDeviceByType('RCCB 2P', { color: colors.rcd })}
                    className="relative w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
                  >
                    <Plus className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-medium mt-1">Ajouter</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Disjoncteur différentiel avec protection contre les surintensités (RCBO) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">
                  Disjoncteur différentiel avec protection contre les surintensités
                </h3>
                <ColorChips group="rcbo" />
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {[
                    { label: 'RCBO 2P', type: 'RCBO 2P' },
                    { label: 'RCBO 4P', type: 'RCBO 4P' },
                    { label: 'RCBO 1P + N', type: 'RCBO 1P + N' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onAddDeviceByType(item.type, { color: colors.rcbo })}
                      className="group relative w-24 h-28 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={item.type} color={colors.rcbo} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('RCBO 2P', { color: colors.rcbo })}
                    className="relative w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
                  >
                    <Plus className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-medium mt-1">Ajouter</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Interrupteur-sectionneur */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Interrupteur-sectionneur</h3>
                <ColorChips group="sd" />
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {['SD 1P', 'SD 2P', 'SD 3P', 'SD 4P'].map((lbl) => (
                    <div
                      key={lbl}
                      onClick={() => onAddDeviceByType(lbl, { color: colors.sd })}
                      className="group relative w-24 h-28 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} color={colors.sd} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('SD 2P', { color: colors.sd })}
                    className="relative w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium mt-1">Ajouter</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Relais de tension */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Relais de tension</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {[
                    { label: 'Relais de tension (1 phase)', type: 'VoltageRelay' },
                    { label: 'Relais de tension (3 phases)', type: 'VoltageRelay' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onAddDeviceByType(item.label)}
                      className="group relative w-36 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={item.label} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('VoltageRelay')}
                    className="relative w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium mt-1">Ajouter</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Contacteurs */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Contacteurs</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {[
                    'Contacteur (1NO + 1NC)',
                    'Contacteur (2NO)',
                    'Contacteur (4NO)',
                  ].map((lbl) => (
                    <div
                      key={lbl}
                      onClick={() => onAddDeviceByType(lbl)}
                      className="group relative w-32 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('Contacteur')}
                    className="relative w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
                  >
                    <Plus className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium mt-1">Ajouter</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Télérupteurs */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Télérupteurs</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {['Télérupteur (1NO)', 'Télérupteur (2NO)', 'Télérupteur (1NO + 1NC)'].map((lbl) => (
                    <div
                      key={lbl}
                      onClick={() => onAddDeviceByType(lbl)}
                      className="group relative w-32 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Relais temporisés */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Relais temporisés</h3>
                <TimerRelayCards onAdd={(type) => onAddDeviceByType(type)} />
              </div>

              {/* SECTION: Dispositif de détection d'arc électrique (AFDD) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Dispositif de détection d’arc électrique</h3>
                <AfddCards onAdd={(type) => onAddDeviceByType(type)} />
              </div>

              {/* SECTION: Parafoudre (SPD) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Parafoudre (SPD)</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {['SPD 1P', 'SPD 1P + N', 'SPD 3P', 'SPD 3P + N'].map((lbl) => (
                    <div
                      key={lbl}
                      onClick={() => onAddDeviceByType(lbl)}
                      className="group relative w-24 h-28 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} className="h-14 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Voyants */}
              <div>
                <h3 className="text-[22px] leading-7 font-bold text-[#202020] mb-2">Voyants</h3>
                {/* Carte identique à la capture de référence (sans badge PRO) : toucher la carte pose le voyant. */}
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  <div
                    onClick={() => onAddDeviceByType('Voyant', { count: indicatorCount, color: indicatorColor })}
                    className="relative flex shrink-0 cursor-pointer items-center"
                    style={{ width: 477, height: 247, borderRadius: 16, backgroundColor: '#6f6f6f' }}
                    aria-label="Poser un voyant"
                  >
                    {/* Colonne de gauche : appareil, nom, nombre de lampes */}
                    <div className="flex flex-col items-center" style={{ width: 196 }}>
                      <DeviceThumbSvg
                        type="IndicatorLight"
                        color={indicatorColor}
                        count={indicatorCount}
                        className="h-[85px] w-auto"
                      />
                      <span className="mt-[14px] text-[20px] leading-6 text-white">Voyant</span>
                      <div className="mt-[12px] flex items-center gap-[19px]" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setIndicatorCount(Math.max(1, indicatorCount - 1))}
                          className="flex h-[41px] w-[41px] items-center justify-center rounded-full bg-[#838383] text-white"
                          aria-label="Moins de lampes"
                        >
                          <Minus className="h-5 w-5" strokeWidth={2.6} />
                        </button>
                        <span className="w-6 text-center text-[26px] font-bold leading-[30px] text-white">
                          {indicatorCount}
                        </span>
                        <button
                          onClick={() => setIndicatorCount(Math.min(3, indicatorCount + 1))}
                          className="flex h-[41px] w-[41px] items-center justify-center rounded-full bg-[#838383] text-white"
                          aria-label="Plus de lampes"
                        >
                          <Plus className="h-5 w-5" strokeWidth={2.6} />
                        </button>
                      </div>
                      <span className="mt-[10px] text-[18px] leading-[22px] text-[#d3d3d3]">Lampes</span>
                    </div>

                    {/* Colonne de droite : cinq pastilles de couleur */}
                    <div className="ml-[14px] flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {(['red', 'teal', 'yellow', 'blue', 'white'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => setIndicatorColor(c)}
                          aria-label={`Voyant ${c}`}
                          style={{
                            width: 39,
                            height: 61,
                            borderRadius: 14,
                            backgroundColor: INDICATOR_COLORS[c],
                            border: `3px solid ${indicatorColor === c ? '#ffffff' : INDICATOR_RIMS[c]}`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Plus */}
              <div>
                <h3 className="text-[22px] leading-7 font-bold text-[#202020] mb-2">Plus</h3>
                {/* Cartes identiques à la capture de référence (sans badge PRO) : 146 px de haut, fond gris, libellé 20 px. */}
                <div className="flex flex-wrap items-start gap-3 pb-1">
                  {[
                    { label: 'Prise', thumbH: 70 },
                    { label: 'Compteur monophasé', thumbH: 70 },
                    { label: 'Compteur triphasé', thumbH: 68 },
                    { label: 'Guardmotor', thumbH: 73 },
                    { label: 'Interrupteur-sectionneur inverseur', thumbH: 75 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onAddDeviceByType(item.label)}
                      className="group relative flex shrink-0 cursor-pointer flex-col items-center justify-between transition-colors hover:brightness-110"
                      style={{
                        minWidth: 120,
                        height: 146,
                        borderRadius: 16,
                        backgroundColor: '#6f6f6f',
                        padding: '18px 18px 14px',
                      }}
                    >
                      <div className="flex flex-1 items-start justify-center">
                        <div style={{ height: item.thumbH }}>
                          <DeviceThumbSvg type={item.label} className="h-full w-auto" />
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-[20px] leading-6 text-white">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: RAILS DIN
             ======================================================== */}
          {activeCategory === 'rails' && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2.5">Tous les rails</h3>
              <DinRailCards onAddRailByLength={onAddRailByLength} />
            </div>
          )}

          {/* ========================================================
              TAB 3: BARRES ET BORNES POUR FILS
             ======================================================== */}
          {activeCategory === 'borniers' && (
            <div className="space-y-4">
              {/* Group 1: Barres et bornes pour fils (identique à la capture de référence, sans badge PRO) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Barres et bornes pour fils</h3>
                <WireTerminalCards onAddTerminalBar={onAddTerminalBar} />
              </div>

              {/* Group 2: Barres auto-serrantes */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Barres auto-serrantes</h3>
                <SpringBarCards onAddTerminalBar={onAddTerminalBar} />
              </div>

              {/* Group 3: Barres à vis — dimensions et disposition calquées sur la capture de référence, sans badge PRO */}
              <div>
                <h3 className="text-[22px] leading-7 font-bold text-[#202020] mb-2">Barres à vis</h3>
                <div className="flex flex-wrap items-start gap-3 pb-1">
                  {([
                    // Miniatures = pixels exacts de la capture (public/assets/vis/*.png), placées à leur position mesurée.
                    { count: 6, width: 225, thumb: { x: 30, y: 36, w: 86, h: 37 } },
                    { count: 11, width: 238, thumb: { x: 36, y: 43, w: 89, h: 22 } },
                    { count: 16, width: 238, thumb: { x: 36, y: 43, w: 86, h: 20 } },
                    { count: 21, width: 238, thumb: { x: 36, y: 47, w: 86, h: 14 } },
                    { count: 26, width: 238, thumb: { x: 36, y: 49, w: 86, h: 11 } },
                  ] as const).map(({ count, width, thumb }) => (
                    <div
                      key={count}
                      onClick={() => onAddTerminalBar('screw', count)}
                      className="group relative shrink-0 cursor-pointer transition-colors"
                      style={{
                        width,
                        height: 146,
                        borderRadius: 16,
                        backgroundColor: '#6f6f6f',
                      }}
                      aria-label={`Barre à vis ${count} contacts`}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}assets/vis/${count}.png`}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className="absolute block select-none"
                        style={{ left: thumb.x, top: thumb.y, width: thumb.w, height: thumb.h }}
                      />
                      <div
                        className="absolute flex items-center justify-center rounded-full"
                        style={{
                          right: 25,
                          top: 25,
                          width: 42,
                          height: 42,
                          backgroundColor: '#4ba9f3',
                          border: '4px solid #ffffff',
                          boxSizing: 'border-box',
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="absolute rounded-full"
                        style={{
                          right: 25,
                          top: 81,
                          width: 42,
                          height: 42,
                          backgroundColor: '#6ebc71',
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="absolute whitespace-nowrap font-normal text-white"
                        style={{ left: 19, top: 102, fontSize: 22, lineHeight: 1 }}
                      >
                        {count} contacts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: BLOCS DE DISTRIBUTION
             ======================================================== */}
          {activeCategory === 'repartiteurs' && (
            <div>
              <h3 className="text-[22px] leading-7 font-bold text-[#202020] mb-2">Blocs de distribution</h3>
              {/* Cartes identiques à la capture de référence (sans badge PRO) : 146 px de haut, fond gris, libellé 20 px. */}
              <div className="flex flex-wrap items-start gap-3 pb-1">
                {[
                  { config: '2x7' as const, label: '2×7 contacts' },
                  { config: '2x11' as const, label: '2×11 contacts' },
                  { config: '2x15' as const, label: '2×15 contacts' },
                  { config: '4x7' as const, label: '4×7 contacts' },
                  { config: '4x11' as const, label: '4×11 contacts' },
                  { config: '4x15' as const, label: '4×15 contacts' },
                ].map((b) => (
                  <div
                    key={b.config}
                    onClick={() => {
                      setActiveDistribution(b.config);
                      onAddDistributionBlock(b.config);
                    }}
                    className="relative flex shrink-0 cursor-pointer flex-col items-center transition-colors"
                    style={{
                      height: 146,
                      borderRadius: 16,
                      backgroundColor: activeDistribution === b.config ? '#4e4e4e' : '#6f6f6f',
                      padding: '18px 18px 0',
                    }}
                  >
                    <div className="flex items-center justify-center" style={{ height: 72 }}>
                      <DistributionBlockThumb
                        variant={b.config}
                        style={{ height: DISTRIBUTION_THUMB_HEIGHT[b.config], width: 'auto' }}
                      />
                    </div>
                    <span className="mt-auto whitespace-nowrap text-[20px] leading-6 text-white" style={{ marginBottom: 20 }}>
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: PEIGNES DE RACCORDEMENT
             ======================================================== */}
          {activeCategory === 'peignes' && (
            <div className="space-y-4">
              {/* Peignes 1 pôle */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Peignes pour disjoncteurs (1 pôle)</h3>
                <div className="relative w-56 h-28 rounded-xl bg-[#525862] p-2.5 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <DeviceThumbSvg type="Comb" variant="1" count={comb1PLength} className="h-10 w-auto max-w-[180px]" />
                    <span className="text-xs font-medium text-white">{comb1PLength} modules (1 pôle)</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-600/50">
                    <div className="flex items-center gap-1.5 bg-slate-700/60 rounded px-1.5 py-0.5">
                      <button
                        onClick={() => setComb1PLength(Math.max(2, comb1PLength - 1))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1">{comb1PLength}</span>
                      <button
                        onClick={() => setComb1PLength(Math.min(18, comb1PLength + 1))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => onAddBusbarComb(1, comb1PLength, '1P')}
                      className="px-2.5 py-1 bg-[#007aff] hover:bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Poser
                    </button>
                  </div>
                </div>
              </div>

              {/* Peignes 2 pôles (Radio: L, N / N, L / L1, L2) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Peignes pour disjoncteurs (2 pôles)</h3>
                <div className="relative w-80 h-32 rounded-xl bg-[#525862] p-2.5 flex flex-col justify-between shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <DeviceThumbSvg type="Comb" variant="2" count={comb2PLength} className="h-10 w-auto max-w-[180px]" />
                      <p className="text-xs font-medium text-white mt-1">{comb2PLength} modules (2 pôles)</p>
                    </div>
                    {/* Radio list */}
                    <div className="flex flex-col gap-1 text-xs text-white">
                      {[
                        { id: 'L_N' as const, label: 'L, N' },
                        { id: 'N_L' as const, label: 'N, L' },
                        { id: 'L1_L2' as const, label: 'L1, L2' },
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="comb2p"
                            checked={comb2PConfig === opt.id}
                            onChange={() => setComb2PConfig(opt.id)}
                            className="text-[#007aff]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-600/50">
                    <div className="flex items-center gap-1.5 bg-slate-700/60 rounded px-1.5 py-0.5">
                      <button
                        onClick={() => setComb2PLength(Math.max(2, comb2PLength - 2))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1">{comb2PLength}</span>
                      <button
                        onClick={() => setComb2PLength(Math.min(18, comb2PLength + 2))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => onAddBusbarComb(2, comb2PLength, comb2PConfig)}
                      className="px-2.5 py-1 bg-[#007aff] hover:bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Poser
                    </button>
                  </div>
                </div>
              </div>

              {/* Peignes 4 pôles (Radio: L1, L2, L3, N / N, L1, L2, L3 / L1 N, L2 N, L3 N) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Peignes pour disjoncteurs (3 pôles)</h3>
                <div className="relative w-80 h-32 rounded-xl bg-[#525862] p-2.5 flex flex-col justify-between shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <DeviceThumbSvg type="Comb" variant="3" count={comb3PLength} className="h-10 w-auto max-w-[180px]" />
                      <p className="text-xs font-medium text-white mt-1">{comb3PLength} modules (3 pôles)</p>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-white">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="comb3p" checked readOnly className="text-[#007aff]" />
                        <span>L1, L2, L3</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-600/50">
                    <div className="flex items-center gap-1.5 bg-slate-700/60 rounded px-1.5 py-0.5">
                      <button
                        onClick={() => setComb3PLength(Math.max(3, comb3PLength - 3))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1">{comb3PLength}</span>
                      <button
                        onClick={() => setComb3PLength(Math.min(24, comb3PLength + 3))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => onAddBusbarComb(3, comb3PLength, 'L1_L2_L3')}
                      className="px-2.5 py-1 bg-[#007aff] hover:bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Poser
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Peignes pour disjoncteurs (4 pôles)</h3>
                <div className="relative w-80 h-32 rounded-xl bg-[#525862] p-2.5 flex flex-col justify-between shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <DeviceThumbSvg type="Comb" variant="4" count={comb4PLength} className="h-10 w-auto max-w-[180px]" />
                      <p className="text-xs font-medium text-white mt-1">{comb4PLength} modules (4 pôles)</p>
                    </div>
                    {/* Radio list */}
                    <div className="flex flex-col gap-1 text-xs text-white">
                      {[
                        { id: 'L1_L2_L3_N' as const, label: 'L1, L2, L3, N' },
                        { id: 'N_L1_L2_L3' as const, label: 'N, L1, L2, L3' },
                        { id: 'L1N_L2N_L3N' as const, label: 'L1 N, L2 N, L3 N' },
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="comb4p"
                            checked={comb4PConfig === opt.id}
                            onChange={() => setComb4PConfig(opt.id)}
                            className="text-[#007aff]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-600/50">
                    <div className="flex items-center gap-1.5 bg-slate-700/60 rounded px-1.5 py-0.5">
                      <button
                        onClick={() => setComb4PLength(Math.max(4, comb4PLength - 4))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1">{comb4PLength}</span>
                      <button
                        onClick={() => setComb4PLength(Math.min(24, comb4PLength + 4))}
                        className="text-white hover:text-amber-400 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => onAddBusbarComb(4, comb4PLength, comb4PConfig)}
                      className="px-2.5 py-1 bg-[#007aff] hover:bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Poser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: MARQUAGE (Texte & Objets)
             ======================================================== */}
          {activeCategory === 'marquage' && (
            <div className="space-y-4">
              {/* Group: Texte */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Texte</h3>
                <TextCards onAddText={() => onAddAnnotation('text')} onAddTable={() => onAddAnnotation('table')} />
              </div>

              {/* Group: Objets (Pictogrammes) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Objets</h3>
                <PictogramCards onAdd={onAssignPictogramToSelected} />
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: MODÈLES
             ======================================================== */}
          {activeCategory === 'modeles' && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2.5">Modèles</h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {/* + Créer un modèle Card */}
                <div
                  onClick={onCreateNewTemplate}
                  className="relative w-28 h-24 rounded-xl border-2 border-dashed border-[#007aff]/60 bg-blue-50/60 hover:bg-blue-100/60 transition-all cursor-pointer flex flex-col items-center justify-center p-2.5 shrink-0"
                >
                  <Plus className="w-6 h-6 text-[#007aff]" />
                  <span className="text-xs font-semibold text-[#007aff] mt-1 text-center">
                    Créer un modèle
                  </span>
                </div>

                {/* Preconfigured templates */}
                {[
                  { id: 'studio_t1', label: 'Studio T1', desc: '1 Rangée 13M NF C 15-100' },
                  { id: 'logement_t3_t4', label: 'Logement T3 / T4', desc: '3 Rangées 39M' },
                  { id: 'villa_triphase_pro', label: 'Villa Triphasée', desc: '4 Rangées + Répartiteur 4P' },
                ].map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => onLoadTemplate(tpl.id)}
                    className="relative w-44 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] p-2.5 flex flex-col justify-between shadow-sm cursor-pointer shrink-0"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{tpl.label}</h4>
                      <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2">{tpl.desc}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-300">
                      Charger ce modèle &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portail : le flou d'arrière-plan du tiroir piégerait sinon le panneau « fixed » dans le tiroir */}
      {customEditor &&
        createPortal(
          <CustomDeviceModal
            initial={customEditor === 'new' ? null : customEditor}
            onCancel={() => setCustomEditor(null)}
            onSave={(def) => {
              onSaveCustomDevice(def);
              setCustomEditor(null);
            }}
          />,
          document.body
        )}
    </aside>
  );
};
