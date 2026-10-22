import React, { useEffect, useRef, useState } from 'react';
import {
  PanelAnnotation,
  ElectricalPanelProject,
  ElectricalDevice,
  DinRail,
  TerminalBar,
  DistributionBlock,
  BusbarComb,
  CatalogItem,
} from '../types/panel';
import { DinRailSvg } from './DinRailSvg';
import { ElectricalDeviceSvg } from './ElectricalDeviceSvg';
import { CableOverlay, locateAnchor, WirePreview } from './CableOverlay';
import { defaultRoute, Pt } from './wireRoute';
import { TerminalBarSvg } from './TerminalBarSvg';
import { DistributionBlockSvg } from './DistributionBlockSvg';
import { AnnotationObject } from './AnnotationObject';
import { Menu, Plus, Minus, Maximize2, Zap } from 'lucide-react';

interface CanvasWorkspaceProps {
  project: ElectricalPanelProject;
  pendingWireFrom?: string | null;
  pendingWireLabel?: string;
  /** Vrai une fois la borne d'arrivée choisie : le tracé se règle alors avec les flèches. */
  pendingWireTo?: boolean;
  pendingWirePreview?: WirePreview | null;
  onSelectWireTarget?: (anchor: string, route: Pt[]) => void;
  onCancelWire?: () => void;
  selectedDeviceId?: string;
  selectedRailId?: string;
  showWiringMode: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  pan: { x: number; y: number };
  onZoomChange: (newZoom: number) => void;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onSelectDevice: (device: ElectricalDevice | null) => void;
  onSelectRail: (railId: string | null) => void;
  onToggleDeviceSwitch: (deviceId: string) => void;
  onDropCatalogItemOnRail: (railId: string, slotIndex: number, item: CatalogItem) => void;
  onDeleteRail: (railId: string) => void;
  onDeleteTerminalBar: (id: string) => void;
  onDeleteDistributionBlock: (id: string) => void;
  onAddDeviceToRailQuick: (railId: string) => void;
  onMoveFreeDevice?: (id: string, x: number, y: number) => void;
  selectedWireId?: string | null;
  onSelectWire?: (id: string | null) => void;
  onMoveWire?: (wireId: string, pts: { x: number; y: number }[]) => void;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateAnnotation: (id: string, patch: Partial<PanelAnnotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  project,
  pendingWireFrom,
  pendingWireLabel,
  pendingWireTo,
  pendingWirePreview,
  onSelectWireTarget,
  onCancelWire,
  selectedDeviceId,
  selectedRailId,
  showWiringMode,
  showGrid,
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  onSelectDevice,
  onSelectRail,
  onToggleDeviceSwitch,
  onDropCatalogItemOnRail,
  onDeleteRail,
  onDeleteTerminalBar,
  onDeleteDistributionBlock,
  onAddDeviceToRailQuick,
  onMoveFreeDevice,
  selectedWireId,
  onSelectWire,
  onMoveWire,
  onUpdateTitle,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onToggleMenu,
  isMenuOpen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const annotationCount = (project.annotations ?? []).length;
  const previousAnnotationCount = useRef(annotationCount);

  // Un objet qu'on vient d'ajouter est sélectionné d'office (barre d'outils visible)
  useEffect(() => {
    if (annotationCount > previousAnnotationCount.current) {
      const list = project.annotations ?? [];
      setSelectedAnnotationId(list[list.length - 1].id);
    }
    previousAnnotationCount.current = annotationCount;
  }, [annotationCount]);

  // Handle pan with mouse / touch
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background or middle button
    if (e.button === 1 || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectDevice(null);
      onSelectRail(null);
      setSelectedAnnotationId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    onPanChange({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Déplacement de la surface au doigt (téléphone / tablette)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    if (!(e.target as HTMLElement).classList.contains('canvas-background')) return;
    const t = e.touches[0];
    setIsPanning(true);
    setStartPan({ x: t.clientX - pan.x, y: t.clientY - pan.y });
    onSelectDevice(null);
    onSelectRail(null);
    setSelectedAnnotationId(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const t = e.touches[0];
    onPanChange({ x: t.clientX - startPan.x, y: t.clientY - startPan.y });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    const newZoom = Math.min(2.0, Math.max(0.4, zoom + zoomDelta));
    onZoomChange(Number(newZoom.toFixed(2)));
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(2.0, Number((zoom + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.4, Number((zoom - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    onZoomChange(1.0);
    onPanChange({ x: 40, y: 70 });
  };

  const surfaceRef = useRef<HTMLDivElement>(null);

  // Pendant le choix de la borne d'arrivée, seul un clic sur une borne compte.
  // Le tracé initial est calculé ici, où l'on connaît la position réelle des bornes.
  const handleCanvasClickCapture = (e: React.MouseEvent) => {
    if (!pendingWireFrom || pendingWireTo) return;
    const anchorEl = (e.target as HTMLElement).closest<HTMLElement>('[data-wire-anchor]');
    if (!anchorEl) return;
    e.stopPropagation();
    e.preventDefault();
    const anchor = anchorEl.dataset.wireAnchor!;
    const surface = surfaceRef.current;
    if (!surface) return;
    const from = locateAnchor(surface, pendingWireFrom, zoom);
    const to = locateAnchor(surface, anchor, zoom);
    if (!from || !to) return;
    onSelectWireTarget?.(anchor, defaultRoute(from, to));
  };

  return (
    <div
      ref={containerRef}
      onClickCapture={handleCanvasClickCapture}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
      className={`relative w-full h-screen overflow-hidden select-none bg-[#f6f6f4] ${
        isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      {pendingWireFrom && !pendingWireTo && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-slate-900/95 px-4 py-2.5 text-xs text-white shadow-xl">
          <span>{pendingWireLabel || "Touchez la borne d'arrivée"}</span>
          <button
            type="button"
            onClick={() => onCancelWire?.()}
            className="rounded-md bg-slate-700 px-2.5 py-1 font-medium hover:bg-slate-600"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Background CAD Millimeter Grid matching screenshots */}
      {showGrid && (
        <div
          className="canvas-background absolute inset-0 pointer-events-auto"
          style={{
            backgroundColor: '#f6f6f4',
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
              linear-gradient(to right, rgba(0, 0, 0, 0.10) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.10) 1px, transparent 1px)
            `,
            backgroundSize: `
              ${10 * zoom}px ${10 * zoom}px,
              ${10 * zoom}px ${10 * zoom}px,
              ${50 * zoom}px ${50 * zoom}px,
              ${50 * zoom}px ${50 * zoom}px
            `,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />
      )}

      {/* ========================================================
          TOP PROJECT NAME CARD — style mobile des captures
         ======================================================== */}
      <div className="absolute top-3 left-3 right-[76px] z-30 no-print">
        <div className="h-12 px-4 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md flex items-center">
          <input
            type="text"
            value={project.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="w-full border-b border-slate-200 text-base font-medium text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none focus:border-[#007aff] pb-1"
            placeholder="Nom du projet"
            title="Cliquez pour renommer le projet"
          />
        </div>
      </div>

      {/* ========================================================
          TOP-RIGHT FLOATING CONTROLS: [ ☰ ] and [ + ] [ - ]
         ======================================================== */}
      <div className="absolute top-3 right-4 z-30 flex flex-col items-end gap-3 no-print">
        {/* Hamburger Menu Button */}
        <button
          onClick={onToggleMenu}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md border ${
            isMenuOpen
              ? 'bg-[#007aff] text-white border-blue-600'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
          title="Menu Options & Outils"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Vertical Stack of Dark Zoom Buttons matching screenshots */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-xl bg-[#22262d] hover:bg-[#15171b] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
            title="Zoom avant (+)"
          >
            <Plus className="w-5 h-5 stroke-[2.4]" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-xl bg-[#22262d] hover:bg-[#15171b] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
            title="Zoom arrière (-)"
          >
            <Minus className="w-5 h-5 stroke-[2.4]" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-700 border border-slate-200 flex items-center justify-center shadow-md transition-all cursor-pointer"
            title="Recentrer le plan"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          MAIN VIRTUAL CANVAS SURFACE (Pan & Zoom Transform)
         ======================================================== */}
      <div
        ref={surfaceRef}
        className="canvas-background absolute origin-top-left transition-transform duration-75 ease-out min-w-[2400px] min-h-[2400px] p-10 pt-16"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Fils tracés entre bornes */}
        <CableOverlay
          project={project}
          surfaceRef={surfaceRef}
          zoom={zoom}
          preview={pendingWirePreview ?? null}
          selectedWireId={selectedWireId}
          onSelectWire={onSelectWire}
          onMoveWire={onMoveWire}
        />

        {/* Surface de travail libre : pas de cadre d'armoire, les modèles sont posés directement */}
        <div className="inline-block min-w-[760px] relative">
          {/* Bornes (Terre PE & Neutre N) et blocs de répartition */}
          {(project.terminalBars.length > 0 || project.distributionBlocks.length > 0) && (
            <div className="mb-5 flex flex-wrap gap-4 items-start">
              {project.terminalBars.map((bar) => (
                <TerminalBarSvg key={bar.id} bar={bar} onDelete={onDeleteTerminalBar} />
              ))}
              {project.distributionBlocks.map((block) => (
                <DistributionBlockSvg key={block.id} block={block} onDelete={onDeleteDistributionBlock} />
              ))}
            </div>
          )}

          {/* Wiring Mode Overlay */}
          {showWiringMode && (
            <div className="mb-4 p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-600" /> Schéma de Câblage Actif :
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <span className="w-2.5 h-1 bg-red-600 rounded" /> Phase (L)
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                  <span className="w-2.5 h-1 bg-blue-600 rounded" /> Neutre (N)
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="w-2.5 h-1 bg-emerald-500 rounded" /> Terre (PE)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Peignes horizontaux & liaisons disjoncteurs
              </span>
            </div>
          )}

          {/* DIN Rails Stack */}
          <div className="space-y-4">
            {[...project.rails]
              .sort((a, b) => a.order - b.order)
              .map((rail) => {
                const railDevices = project.devices.filter((d) => d.railId === rail.id && !d.free);
                return (
                  <DinRailSvg
                    key={rail.id}
                    rail={rail}
                    devices={railDevices}
                    busbars={project.busbars}
                    selectedDeviceId={selectedDeviceId}
                    isRailSelected={selectedRailId === rail.id}
                    onSelectRail={onSelectRail}
                    onSelectDevice={(device, e) => {
                      e.stopPropagation();
                      onSelectDevice(device);
                    }}
                    onToggleDeviceSwitch={onToggleDeviceSwitch}
                    onDeleteRail={onDeleteRail}
                    onAddDeviceToRail={onAddDeviceToRailQuick}
                    onDropDeviceOnRail={(railId, targetSlot) => {
                      // Handled via drag & drop
                    }}
                  />
                );
              })}
          </div>
        </div>

        {/* Appareils libres posés sur le plan (déplaçables un par un) */}
        {project.devices
          .filter((d) => d.free)
          .map((d) => (
            <FreeDevice
              key={d.id}
              device={d}
              zoom={zoom}
              isSelected={selectedDeviceId === d.id}
              onSelect={() => onSelectDevice(d)}
              onMove={(x, y) => onMoveFreeDevice?.(d.id, x, y)}
            />
          ))}

        {/* Objets libres du plan : textes, tableaux, pictogrammes */}
        {(project.annotations ?? []).map((a) => (
          <AnnotationObject
            key={a.id}
            annotation={a}
            zoom={zoom}
            isSelected={selectedAnnotationId === a.id}
            onSelect={(id) => {
              setSelectedAnnotationId(id);
              onSelectDevice(null);
            }}
            onUpdate={onUpdateAnnotation}
            onDelete={(id) => {
              setSelectedAnnotationId(null);
              onDeleteAnnotation(id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* Appareil libre : glisser pour le déplacer (même logique que les objets libres) */
const FreeDevice: React.FC<{
  device: ElectricalDevice;
  zoom: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}> = ({ device, zoom, isSelected, onSelect, onMove }) => {
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const x = live ? live.x : device.x ?? 0;
  const y = live ? live.y : device.y ?? 0;

  const down = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    drag.current = { startX: e.clientX, startY: e.clientY, originX: device.x ?? 0, originY: device.y ?? 0, moved: false };
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
    if (d?.moved && live) onMove(live.x, live.y);
    setLive(null);
  };

  return (
    <div
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{ position: 'absolute', left: x, top: y, touchAction: 'none', cursor: 'move' }}
      className="z-30"
    >
      <ElectricalDeviceSvg device={device} isSelected={isSelected} />
    </div>
  );
};
