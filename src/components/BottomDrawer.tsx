import React, { useState } from 'react';
import { PictogramKey } from '../types/panel';
import { DeviceThumbSvg } from './DeviceThumbSvg';
import { PICTOGRAM_LIST, PictogramIcon } from './PictogramIcon';
import { Plus, Minus } from 'lucide-react';

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
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
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

  // Configurable states for interactive cards
  const [comb1PLength, setComb1PLength] = useState(2);
  const [comb2PLength, setComb2PLength] = useState(4);
  const [comb2PConfig, setComb2PConfig] = useState<'L_N' | 'N_L' | 'L1_L2'>('L_N');

  const [comb3PLength, setComb3PLength] = useState(6);

  const [comb4PLength, setComb4PLength] = useState(8);
  const [comb4PConfig, setComb4PConfig] = useState<'L1_L2_L3_N' | 'N_L1_L2_L3' | 'L1N_L2N_L3N'>('N_L1_L2_L3');

  const [colors, setColors] = useState<Record<string, string>>({
    mcb: 'red',
    rcd: 'red',
    rcbo: 'red',
    sd: 'red',
  });

  const [indicatorCount, setIndicatorCount] = useState(1);
  const [indicatorColor, setIndicatorColor] = useState<'red' | 'teal' | 'yellow' | 'blue' | 'white'>('red');

  const [customTerminalContacts, setCustomTerminalContacts] = useState(8);
  const [customTerminalColor, setCustomTerminalColor] = useState('blue');

  const categories: { id: DrawerCategory; label: string }[] = [
    { id: 'appareils', label: 'Appareils' },
    { id: 'rails', label: 'Rails DIN' },
    { id: 'borniers', label: 'Barres et bornes pour fils' },
    { id: 'repartiteurs', label: 'Blocs de distribution' },
    { id: 'peignes', label: 'Peignes de raccordement' },
    { id: 'marquage', label: 'Marquage' },
    { id: 'modeles', label: 'Modèles' },
  ];

  // Color chips: pick the band colour used on the device thumbnails of a section
  const CHIP_LIST: { key: string; hex: string }[] = [
    { key: 'red', hex: '#d32f2f' },
    { key: 'green', hex: '#43a047' },
    { key: 'blue', hex: '#2f80ed' },
    { key: 'orange', hex: '#f28c28' },
    { key: 'yellow', hex: '#e8c52e' },
  ];
  const ColorChips = ({ group }: { group: string }) => (
    <div className="flex items-center gap-1.5 mb-2.5">
      {CHIP_LIST.map((c) => (
        <button
          key={c.key}
          type="button"
          aria-label={`Couleur ${c.key}`}
          onClick={() => setColors((prev) => ({ ...prev, [group]: c.key }))}
          style={{ backgroundColor: c.hex }}
          className={`w-8 h-3.5 rounded-sm cursor-pointer hover:opacity-85 shadow-xs ${
            colors[group] === c.key ? 'ring-2 ring-slate-900 ring-offset-1' : ''
          }`}
        />
      ))}
    </div>
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
              {/* SECTION: Disjoncteurs */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Disjoncteurs</h3>
                <ColorChips group="mcb" />
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {[
                    { label: 'MCB 1P', type: 'MCB 1P' },
                    { label: 'MCB 2P', type: 'MCB 2P' },
                    { label: 'MCB 3P', type: 'MCB 3P' },
                    { label: 'MCB 4P', type: 'MCB 4P' },
                    { label: 'MCB 1P + N', type: 'MCB 1P + N' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onAddDeviceByType(item.type, { color: colors.mcb })}
                      className="group relative w-20 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={item.type} color={colors.mcb} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}

                  {/* + Ajouter Card */}
                  <div
                    onClick={() => onAddDeviceByType('MCB 1P', { color: colors.mcb })}
                    className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
                  >
                    <Plus className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-medium mt-1">Ajouter</span>
                  </div>
                </div>
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
                      className="group relative w-20 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={item.type} color={colors.rcd} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}

                  <div
                    onClick={() => onAddDeviceByType('RCCB 2P', { color: colors.rcd })}
                    className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
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
                      className="group relative w-20 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={item.type} color={colors.rcbo} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('RCBO 2P', { color: colors.rcbo })}
                    className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
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
                      className="group relative w-20 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} color={colors.sd} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('SD 2P', { color: colors.sd })}
                    className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
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
                        <DeviceThumbSvg type={item.label} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('VoltageRelay')}
                    className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
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
                        <DeviceThumbSvg type={lbl} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => onAddDeviceByType('Contacteur')}
                    className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition-all cursor-pointer flex flex-col items-center justify-center p-2 shrink-0"
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
                        <DeviceThumbSvg type={lbl} className="h-16 w-auto max-w-full" />
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
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {[
                    'Relais temporisé (électromécanique)',
                    'Relais temporisé (numérique)',
                  ].map((lbl) => (
                    <div
                      key={lbl}
                      onClick={() => onAddDeviceByType(lbl)}
                      className="group relative w-40 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Dispositif de détection d'arc électrique (AFDD) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Dispositif de détection d’arc électrique</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {['AFDD + MCB', 'AFDD + RCBO'].map((lbl) => (
                    <div
                      key={lbl}
                      onClick={() => onAddDeviceByType(lbl)}
                      className="group relative w-24 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Parafoudre (SPD) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Parafoudre (SPD)</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {['SPD 1P', 'SPD 1P + N', 'SPD 3P', 'SPD 3P + N'].map((lbl) => (
                    <div
                      key={lbl}
                      onClick={() => onAddDeviceByType(lbl)}
                      className="group relative w-20 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={lbl} className="h-16 w-auto max-w-full" />
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
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Voyants</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  <div className="relative w-56 h-28 rounded-xl bg-[#525862] p-2.5 flex flex-col justify-between shadow-sm shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DeviceThumbSvg type="IndicatorLight" color={indicatorColor} className="h-14 w-auto" />
                        <span className="text-xs font-semibold text-white">Voyant</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['red', 'teal', 'yellow', 'blue', 'white'] as const).map((c) => (
                          <button
                            key={c}
                            onClick={() => setIndicatorColor(c)}
                            className={`w-4 h-4 rounded-full border-2 transition-transform ${
                              indicatorColor === c ? 'scale-110 border-white' : 'border-transparent'
                            } ${
                              c === 'red'
                                ? 'bg-red-500'
                                : c === 'teal'
                                ? 'bg-teal-400'
                                : c === 'yellow'
                                ? 'bg-yellow-400'
                                : c === 'blue'
                                ? 'bg-blue-500'
                                : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-600/50">
                      <div className="flex items-center gap-1.5 bg-slate-700/60 rounded px-1.5 py-0.5">
                        <button
                          onClick={() => setIndicatorCount(Math.max(1, indicatorCount - 1))}
                          className="text-white hover:text-amber-400 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {indicatorCount}
                        </span>
                        <button
                          onClick={() => setIndicatorCount(Math.min(3, indicatorCount + 1))}
                          className="text-white hover:text-amber-400 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] text-slate-300 ml-1">Lampes</span>
                      </div>
                      <button
                        onClick={() =>
                          onAddDeviceByType('Voyant', { count: indicatorCount, color: indicatorColor })
                        }
                        className="px-2.5 py-1 bg-[#007aff] hover:bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Poser
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Plus */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">Plus</h3>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {[
                    { label: 'Prise', type: 'Socket' },
                    { label: 'Compteur monophasé', type: 'Meter' },
                    { label: 'Compteur triphasé', type: 'Meter' },
                    { label: 'Guardmotor', type: 'Contactor' },
                    { label: 'Interrupteur-sectionneur inverseur', type: 'MCB 4P' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onAddDeviceByType(item.label)}
                      className="group relative min-w-[90px] h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <DeviceThumbSvg type={item.label} className="h-16 w-auto max-w-full" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full px-1">
                        {item.label}
                      </span>
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
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {[100, 200, 250, 300, 400, 500, 600].map((mm) => (
                  <div
                    key={mm}
                    onClick={() => onAddRailByLength(mm)}
                    className="group relative w-24 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2.5 shadow-sm shrink-0"
                  >
                    <div className="flex-1 flex items-center justify-center w-full px-1">
                      <DeviceThumbSvg type="DIN Rail" length={mm} className="w-20 h-6" />
                    </div>
                    <span className="text-xs text-white font-semibold">{mm} mm</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: BARRES ET BORNES POUR FILS
             ======================================================== */}
          {activeCategory === 'borniers' && (
            <div className="space-y-4">
              {/* Group 1: Barres et bornes pour fils (Configurable Card) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Barres et bornes pour fils</h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  <div className="relative w-56 h-28 rounded-xl bg-[#525862] p-2.5 flex flex-col justify-between shadow-sm shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DeviceThumbSvg type="TerminalBar" variant="screw" count={customTerminalContacts} color={customTerminalColor} className="w-24 h-8" />
                      </div>
                      <div className="flex items-center gap-1">
                        {['blue', 'orange', '#334155', 'yellow', 'green', 'black'].map((clr) => (
                          <button
                            key={clr}
                            onClick={() => setCustomTerminalColor(clr)}
                            className={`w-3.5 h-3.5 rounded-full border ${
                              customTerminalColor === clr ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: clr }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-600/50">
                      <div className="flex items-center gap-1.5 bg-slate-700/60 rounded px-1.5 py-0.5">
                        <button
                          onClick={() => setCustomTerminalContacts(Math.max(4, customTerminalContacts - 1))}
                          className="text-white hover:text-amber-400 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {customTerminalContacts}
                        </span>
                        <button
                          onClick={() => setCustomTerminalContacts(Math.min(30, customTerminalContacts + 1))}
                          className="text-white hover:text-amber-400 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] text-slate-300 ml-1">contacts</span>
                      </div>
                      <button
                        onClick={() =>
                          onAddTerminalBar('custom', customTerminalContacts, customTerminalColor)
                        }
                        className="px-2.5 py-1 bg-[#007aff] hover:bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Poser
                      </button>
                    </div>
                  </div>

                  {/* Simple card */}
                  <div
                    onClick={() => onAddTerminalBar('simple', 1, 'blue')}
                    className="relative w-36 h-28 rounded-xl bg-[#525862] hover:bg-[#454a54] p-2.5 flex flex-col justify-between shadow-sm cursor-pointer shrink-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-4 h-12 bg-sky-500 rounded border border-sky-400 flex flex-col items-center justify-between py-1">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#3b9cf5] ring-1 ring-white" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#f5a033]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#e5484d]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#f2dc5b]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#5cc26a]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#2b2f36]" />
                      </div>
                    </div>
                    <span className="text-xs text-white font-semibold">Simple</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Barres auto-serrantes */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Barres auto-serrantes</h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {[
                    '5 + 1 contacts',
                    '8 + 2 contacts',
                    '11 + 3 contacts',
                    '14 + 4 contacts',
                    '17 + 5 contacts',
                    '20 + 6 contacts',
                  ].map((lbl, idx) => (
                    <div
                      key={lbl}
                      onClick={() => onAddTerminalBar('spring', [6, 10, 14, 18, 22, 26][idx])}
                      className="group relative w-32 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex items-center justify-between w-full px-1">
                        <DeviceThumbSvg type="TerminalBar" variant="spring" count={Math.min(14, idx * 3 + 6)} className="w-16 h-6" />
                        <div className="flex flex-col gap-0.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full">
                        {lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3: Barres à vis */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Barres à vis</h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {([6, 11, 16, 21, 26] as const).map((cnt) => (
                    <div
                      key={cnt}
                      onClick={() => onAddTerminalBar('screw', cnt)}
                      className="group relative w-32 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                    >
                      <div className="flex items-center justify-between w-full px-1">
                        <DeviceThumbSvg type="TerminalBar" variant="screw" count={Math.min(14, cnt)} className="w-16 h-6" />
                        <div className="flex flex-col gap-0.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      <span className="text-[10px] text-white font-medium text-center">
                        {cnt} contacts
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
              <h3 className="text-xs font-bold text-slate-900 mb-2.5">Blocs de distribution</h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
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
                    onClick={() => onAddDistributionBlock(b.config)}
                    className="group relative w-28 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] transition-all cursor-pointer flex flex-col items-center justify-between p-2 shadow-sm shrink-0"
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <DeviceThumbSvg type="DistributionBlock" variant={b.config} className="h-14 w-auto max-w-[96px]" />
                    </div>
                    <span className="text-[11px] text-white font-medium text-center">
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
                <h3 className="text-xs font-bold text-slate-900 mb-2">Texte & Tableaux</h3>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => onAddAnnotation('text')}
                    className="relative w-24 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] p-2 flex flex-col items-center justify-between shadow-sm cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center text-white font-serif text-lg font-bold">
                      T=
                    </div>
                    <span className="text-xs text-white font-medium">Texte</span>
                  </div>

                  <div
                    onClick={() => onAddAnnotation('table')}
                    className="relative w-24 h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] p-2 flex flex-col items-center justify-between shadow-sm cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/40 grid grid-cols-2 grid-rows-2 p-1 gap-1">
                      <div className="bg-white/40 rounded-xs" />
                      <div className="bg-white/40 rounded-xs" />
                      <div className="bg-white/40 rounded-xs" />
                      <div className="bg-white/40 rounded-xs" />
                    </div>
                    <span className="text-xs text-white font-medium">Tableau</span>
                  </div>
                </div>
              </div>

              {/* Group: Objets (Pictogrammes) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-0.5">Objets & Symboles</h3>
                <p className="text-[10px] text-slate-500 mb-2">
                  Appareil sélectionné : le pictogramme lui est assigné. Sinon, il est posé librement sur le plan.
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                  {PICTOGRAM_LIST.filter((p) => p.key !== 'ev_charger' && p.key !== 'roller_shutter').map((p) => (
                    <div
                      key={p.key}
                      onClick={() => onAssignPictogramToSelected(p.key)}
                      className="group relative w-full h-24 rounded-xl bg-[#525862] hover:bg-[#454a54] p-2 flex flex-col items-center justify-between shadow-sm cursor-pointer transition-all"
                    >
                      <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                        <PictogramIcon name={p.key} size={22} />
                      </div>
                      <span className="text-[10px] text-white font-medium text-center truncate w-full px-0.5">
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
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
    </aside>
  );
};
