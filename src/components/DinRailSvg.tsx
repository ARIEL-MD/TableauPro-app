import React from 'react';
import { DinRail, ElectricalDevice, BusbarComb } from '../types/panel';
import { ElectricalDeviceSvg, deviceHeight } from './ElectricalDeviceSvg';
import { Trash2, Plus } from 'lucide-react';

interface DinRailSvgProps {
  rail: DinRail;
  devices: ElectricalDevice[];
  busbars: BusbarComb[];
  selectedDeviceId?: string;
  isRailSelected?: boolean;
  onSelectRail?: (railId: string) => void;
  onSelectDevice?: (device: ElectricalDevice, e: React.MouseEvent) => void;
  onToggleDeviceSwitch?: (deviceId: string, e: React.MouseEvent) => void;
  onDropDeviceOnRail?: (railId: string, targetSlot: number) => void;
  onDeleteRail?: (railId: string) => void;
  onAddDeviceToRail?: (railId: string) => void;
  modulePixelWidth?: number;
}

export const DinRailSvg: React.FC<DinRailSvgProps> = ({
  rail,
  devices,
  busbars,
  selectedDeviceId,
  isRailSelected = false,
  onSelectRail,
  onSelectDevice,
  onToggleDeviceSwitch,
  onDropDeviceOnRail,
  onDeleteRail,
  onAddDeviceToRail,
  modulePixelWidth = 36,
}) => {
  const totalWidth = rail.capacityModules * modulePixelWidth;
  const tallest = Math.max(115, ...devices.map((d) => deviceHeight(d, modulePixelWidth)));
  const occupiedModules = devices.reduce((sum, d) => sum + d.moduleWidth, 0);
  const remainingModules = rail.capacityModules - occupiedModules;
  const isOverflow = remainingModules < 0;

  // Find busbar comb attached to this rail
  const railBusbar = busbars.find((b) => b.railId === rail.id);

  // Check which slots are occupied
  const slotOccupancy = new Array(rail.capacityModules).fill(null);
  devices.forEach((dev) => {
    for (let i = 0; i < dev.moduleWidth; i++) {
      if (dev.slotIndex + i < rail.capacityModules) {
        slotOccupancy[dev.slotIndex + i] = dev.id;
      }
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const offsetX = Math.max(0, clientX - rect.left);
    const targetSlot = Math.min(
      rail.capacityModules - 1,
      Math.floor(offsetX / modulePixelWidth)
    );
    onDropDeviceOnRail?.(rail.id, targetSlot);
  };

  return (
    <div
      onClick={() => onSelectRail?.(rail.id)}
      className={`relative my-5 p-3 rounded-xl border transition-all duration-200 select-none shadow-sm ${
        isRailSelected
          ? 'bg-white border-[#007aff] ring-2 ring-[#007aff]/20 shadow-md'
          : 'bg-white/90 border-slate-200 hover:border-slate-300'
      }`}
      style={{ minWidth: `${totalWidth + 36}px` }}
    >
      {/* Rail Header with Label, Capacity Pill & Actions */}
      <div className="flex items-center justify-between mb-2 px-1 text-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900 tracking-tight">
            {rail.label}
          </span>
          {rail.lengthMm && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {rail.lengthMm} mm
            </span>
          )}
          <span className="text-[11px] text-slate-400">·</span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
              isOverflow
                ? 'bg-red-100 text-red-700 border border-red-300'
                : remainingModules === 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {occupiedModules} / {rail.capacityModules} Modules ({remainingModules >= 0 ? `${remainingModules} libres` : `+${Math.abs(remainingModules)}M`})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddDeviceToRail?.(rail.id);
            }}
            className="p-1 rounded-md text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            title="Ajouter un appareil sur ce rail"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRail?.(rail.id);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Supprimer ce rail DIN"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Busbar Comb Over-rail overlay (if active on this rail) */}
      {railBusbar && (
        <div
          className="h-3.5 mb-1.5 rounded-sm bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 border border-amber-600 shadow-xs flex items-center justify-between px-2 text-[8px] font-mono font-bold text-slate-950"
          style={{
            marginLeft: `${railBusbar.startSlot * modulePixelWidth}px`,
            width: `${railBusbar.moduleLength * modulePixelWidth}px`,
          }}
          title={`Peigne d'alimentation horizontal (${(railBusbar.config || railBusbar.type || 'L, N').replace(/_/g, ' ')})`}
        >
          <span>⚡ Peigne {railBusbar.config || railBusbar.type || 'L, N'}</span>
          <span className="text-[7.5px]">{railBusbar.moduleLength}M</span>
        </div>
      )}

      {/* Rail Workspace & Steel Bar */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative bg-slate-50/80 rounded-lg border border-slate-200 p-2 min-h-[135px] flex items-center overflow-x-auto shadow-inner"
        style={{ width: `${totalWidth + 16}px`, minHeight: tallest + 20 }}
      >
        {/* Rail DIN 35 mm : profil acier, reflet, fentes régulières */}
        <div
          className="absolute left-1 right-1 h-[18px] pointer-events-none rounded-[3px]"
          style={{
            top: 'calc(50% - 9px)',
            background: 'linear-gradient(to bottom, #f4f6f8 0%, #d5dae0 35%, #aeb5be 70%, #8e96a1 100%)',
            border: '1px solid #6b737e',
            boxShadow: '0 2px 3px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* Fentes de fixation, espacées régulièrement */}
          {Array.from({ length: Math.max(4, Math.floor((rail.capacityModules * modulePixelWidth) / 26)) }).map((_, i) => (
            <div
              key={i}
              className="absolute top-[4px] h-[7px] w-[13px] rounded-[2px]"
              style={{
                left: `${10 + i * 26}px`,
                background: 'linear-gradient(to bottom, #5b636e, #8e96a1)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.45)',
              }}
            />
          ))}
        </div>

        {/* Mounted Modular Electrical Devices */}
        <div className="relative w-full flex items-center z-10 pointer-events-auto" style={{ height: tallest }}>
          {devices.map((device) => {
            const leftOffset = device.slotIndex * modulePixelWidth;
            return (
              <div
                key={device.id}
                className="absolute"
                style={{ left: `${leftOffset}px` }}
              >
                <ElectricalDeviceSvg
                  device={device}
                  isSelected={selectedDeviceId === device.id}
                  onClick={(d, e) => onSelectDevice?.(d, e)}
                  onToggleSwitch={onToggleDeviceSwitch}
                  modulePixelWidth={modulePixelWidth}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
