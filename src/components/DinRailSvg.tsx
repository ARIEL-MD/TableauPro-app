import React from 'react';
import { DinRail, ElectricalDevice, BusbarComb } from '../types/panel';
import { ElectricalDeviceSvg } from './ElectricalDeviceSvg';
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
        style={{ width: `${totalWidth + 16}px` }}
      >
        {/* DIN Omega 35mm Metallic Profile in the Background */}
        <div
          className="absolute left-2 right-2 h-7 bg-linear-to-b from-slate-300 via-slate-100 to-slate-400 rounded-xs border-y border-slate-400/80 shadow-xs flex items-center justify-between px-3 pointer-events-none opacity-90"
          style={{ top: 'calc(50% - 14px)' }}
        >
          {/* Slotted punched holes typical of DIN 35 rails */}
          {Array.from({ length: Math.floor(rail.capacityModules / 2) }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-2 rounded-full bg-slate-300/80 border border-slate-400/60 shadow-inner"
            />
          ))}
        </div>

        {/* Slot Grid Overlay & Ticks */}
        <div
          className="absolute inset-x-2 top-1 bottom-1 grid pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${rail.capacityModules}, ${modulePixelWidth}px)`,
          }}
        >
          {Array.from({ length: rail.capacityModules }).map((_, slotIdx) => (
            <div
              key={slotIdx}
              className={`border-r border-slate-300/60 flex flex-col justify-between text-[7.5px] font-mono px-0.5 ${
                slotOccupancy[slotIdx] ? 'bg-blue-500/5' : ''
              }`}
            >
              <span className="text-slate-400 font-semibold">{slotIdx + 1}</span>
              <span className="text-slate-400 font-mono text-[7px]">{slotIdx + 1}</span>
            </div>
          ))}
        </div>

        {/* Mounted Modular Electrical Devices */}
        <div className="relative w-full h-[115px] flex items-center z-10 pointer-events-auto">
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
