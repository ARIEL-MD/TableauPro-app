import React, { useRef, useState } from 'react';
import { DinRail, ElectricalDevice, BusbarComb } from '../types/panel';
import { ElectricalDeviceSvg, deviceHeight } from './ElectricalDeviceSvg';
import { RailDrawing, nearestRailLength, railDrawingHeight } from './DinRailCards';

/** 1 mm de rail = 2 px sur le plan (un module de 18 mm = 36 px, comme les appareils). */
export const RAIL_PX_PER_MM = 2;

/** Largeur (px) d'un rail sur le plan. */
export const railWidthPx = (rail: DinRail, modulePixelWidth = 36): number =>
  rail.lengthMm ? rail.lengthMm * RAIL_PX_PER_MM : rail.capacityModules * modulePixelWidth;

interface DinRailSvgProps {
  rail: DinRail;
  devices: ElectricalDevice[];
  busbars: BusbarComb[];
  zoom: number;
  selectedDeviceId?: string;
  isRailSelected?: boolean;
  onSelectRail?: (railId: string) => void;
  onSelectDevice?: (device: ElectricalDevice, e: React.MouseEvent) => void;
  onToggleDeviceSwitch?: (deviceId: string, e: React.MouseEvent) => void;
  onMoveRail?: (railId: string, x: number, y: number) => void;
  modulePixelWidth?: number;
}

/**
 * Rail DIN posé directement sur le plan : uniquement le dessin du rail (celui de la vignette
 * « Tous les rails »), sans carte ni barre d'en-tête. On le déplace en le faisant glisser.
 * Les appareils d'un modèle encore montés sur ce rail restent affichés dessus et le suivent.
 */
export const DinRailSvg: React.FC<DinRailSvgProps> = ({
  rail,
  devices,
  busbars,
  zoom,
  selectedDeviceId,
  isRailSelected = false,
  onSelectRail,
  onSelectDevice,
  onToggleDeviceSwitch,
  onMoveRail,
  modulePixelWidth = 36,
}) => {
  const width = railWidthPx(rail, modulePixelWidth);
  const drawLength = nearestRailLength(rail.lengthMm ?? Math.round(width / RAIL_PX_PER_MM));
  const railH = railDrawingHeight(drawLength, width);
  const tallest = Math.max(railH, ...devices.map((d) => deviceHeight(d, modulePixelWidth)));
  const railTop = (tallest - railH) / 2;
  const railBusbar = busbars.find((b) => b.railId === rail.id);

  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const x = live ? live.x : rail.x;
  const y = live ? live.y : rail.y;

  const down = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelectRail?.(rail.id);
    drag.current = { startX: e.clientX, startY: e.clientY, originX: rail.x, originY: rail.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / zoom;
    const dy = (e.clientY - d.startY) / zoom;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    d.moved = true;
    setLive({ x: Math.round(d.originX + dx), y: Math.round(d.originY + dy) });
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* déjà relâché */
    }
    if (d?.moved && live) onMoveRail?.(rail.id, live.x, live.y);
    setLive(null);
  };

  return (
    <div
      className="absolute select-none z-20"
      style={{ left: x, top: y, width, height: tallest }}
      data-rail-id={rail.id}
    >
      {/* Peigne d'alimentation posé au-dessus du rail */}
      {railBusbar && (
        <div
          className="absolute h-3.5 rounded-sm bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 border border-amber-600 flex items-center justify-between px-2 text-[8px] font-mono font-bold text-slate-950 pointer-events-none"
          style={{
            top: railTop - 18,
            left: railBusbar.startSlot * modulePixelWidth,
            width: railBusbar.moduleLength * modulePixelWidth,
          }}
          title={`Peigne d'alimentation horizontal (${(railBusbar.config || railBusbar.type || 'L, N').replace(/_/g, ' ')})`}
        >
          <span>⚡ Peigne {railBusbar.config || railBusbar.type || 'L, N'}</span>
          <span className="text-[7.5px]">{railBusbar.moduleLength}M</span>
        </div>
      )}

      {/* Le rail lui-même : même dessin que la vignette, déplaçable */}
      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="absolute left-0"
        style={{
          top: railTop,
          width,
          height: railH,
          touchAction: 'none',
          cursor: 'move',
          borderRadius: 3,
          boxShadow: isRailSelected ? '0 0 0 3px #007aff' : 'none',
        }}
      >
        <RailDrawing length={drawLength} width={width} seeThrough />
      </div>

      {/* Appareils d'un modèle encore montés sur ce rail */}
      {devices.map((device) => (
        <div
          key={device.id}
          className="absolute z-10"
          style={{
            left: device.slotIndex * modulePixelWidth,
            top: (tallest - deviceHeight(device, modulePixelWidth)) / 2,
          }}
        >
          <ElectricalDeviceSvg
            device={device}
            isSelected={selectedDeviceId === device.id}
            onClick={(d, e) => onSelectDevice?.(d, e)}
            onToggleSwitch={onToggleDeviceSwitch}
            modulePixelWidth={modulePixelWidth}
          />
        </div>
      ))}
    </div>
  );
};
