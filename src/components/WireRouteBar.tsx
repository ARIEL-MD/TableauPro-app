import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { WireDir, STEP_MIN, STEP_MAX, isHorizontal } from './wireRoute';
import { WIRE_COLORS, WIRE_THICKNESSES } from './WireConnectionModal';
import { WireThickness } from '../types/panel';

interface WireRouteBarProps {
  colorName: string;
  color: string;
  thickness: WireThickness;
  segment: number;
  segmentCount: number;
  isFixed: boolean;
  step: number;
  hint?: string | null;
  onColor: (c: { name: string; hex: string }) => void;
  onThickness: (v: WireThickness) => void;
  onSegment: (k: number) => void;
  onStep: (v: number) => void;
  onMove: (dir: WireDir) => void;
  onJog: () => void;
  onReset: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const arrowBtn =
  'w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center disabled:opacity-40 cursor-pointer';

/**
 * Panneau de tracé du fil : couleur et épaisseur modifiables pendant le tracé,
 * croix de flèches pour déplacer le segment choisi. Les réglages fins
 * (segment actif, pas, coude, réinitialisation) sont dans « Réglages avancés ».
 */
export const WireRouteBar: React.FC<WireRouteBarProps> = ({
  colorName,
  color,
  thickness,
  onColor,
  onThickness,
  segment,
  segmentCount,
  isFixed,
  step,
  hint,
  onSegment,
  onStep,
  onMove,
  onJog,
  onReset,
  onCancel,
  onConfirm,
}) => {
  const [advanced, setAdvanced] = useState(false);
  const horizontal = isHorizontal(segment);
  const axisLabel = isFixed
    ? 'Fixé à la borne'
    : horizontal
      ? 'Se déplace avec ↑ ↓'
      : 'Se déplace avec ← →';

  return (
    <div
      role="dialog"
      aria-label={`Tracé du fil ${colorName}`}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[160] w-[min(94vw,480px)] rounded-3xl bg-white p-4 shadow-2xl text-slate-900 no-print"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 items-start">
        {/* Couleur */}
        <div className="flex flex-col items-center">
          <span className="text-sm text-slate-700 mb-1">Couleur</span>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-1.5 max-h-[250px] overflow-y-auto">
            {WIRE_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                title={c.name}
                onClick={() => onColor(c)}
                className={`w-11 h-11 shrink-0 rounded-full border-2 cursor-pointer ${
                  color === c.hex ? 'border-[#007aff] ring-2 ring-[#007aff]/40' : 'border-slate-300'
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Épaisseur */}
        <div className="flex flex-col items-center">
          <span className="text-sm text-slate-700 mb-1">Épaisseur du fil</span>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-1.5">
            {WIRE_THICKNESSES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-label={`Épaisseur ${t.label}`}
                title={t.label}
                onClick={() => onThickness(t.value)}
                className={`w-20 h-14 rounded-xl border-2 flex items-center justify-center cursor-pointer ${
                  thickness === t.value ? 'bg-sky-300/70 border-sky-400' : 'bg-white border-sky-300'
                }`}
              >
                <span
                  className="h-10 rounded-sm border border-black/70"
                  style={{ width: t.px + 2, background: color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Flèches */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-slate-700 text-center leading-tight mb-2">Appuyez sur les flèches pour tracer le câble</p>
          <div className="grid grid-cols-3 gap-1 justify-items-center">
            <span />
            <button type="button" aria-label="Haut" className={arrowBtn} onClick={() => onMove('up')}>
              <ArrowUp className="w-6 h-6" />
            </button>
            <span />
            <button type="button" aria-label="Gauche" className={arrowBtn} onClick={() => onMove('left')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span />
            <button type="button" aria-label="Droite" className={arrowBtn} onClick={() => onMove('right')}>
              <ArrowRight className="w-6 h-6" />
            </button>
            <span />
            <button type="button" aria-label="Bas" className={arrowBtn} onClick={() => onMove('down')}>
              <ArrowDown className="w-6 h-6" />
            </button>
            <span />
          </div>
        </div>
      </div>

      {hint && <p className="mt-2 text-xs text-amber-700">{hint}</p>}

      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs text-slate-600 cursor-pointer"
        aria-expanded={advanced}
      >
        {advanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Réglages avancés
      </button>

      {advanced && (
        <div className="mt-2 rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-700">{axisLabel}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Segment précédent"
                onClick={() => onSegment(Math.max(0, segment - 1))}
                disabled={segment <= 0}
                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="min-w-[88px] text-center text-xs text-slate-700">
                Segment {segment + 1} / {segmentCount}
              </span>
              <button
                type="button"
                aria-label="Segment suivant"
                onClick={() => onSegment(Math.min(segmentCount - 1, segment + 1))}
                disabled={segment >= segmentCount - 1}
                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-600">Pas</span>
            <input
              type="range"
              aria-label="Taille du pas"
              min={STEP_MIN}
              max={STEP_MAX}
              step={0.1}
              value={step}
              onChange={(e) => onStep(Number(e.target.value))}
              className="flex-1 accent-[#1d5fa8]"
            />
            <span className="text-xs font-medium text-slate-700 w-8 text-right">{step.toFixed(1)}x</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onJog} className="flex-1 rounded-lg bg-white hover:bg-slate-100 py-1.5 text-xs font-medium cursor-pointer">
              + Coude
            </button>
            <button type="button" onClick={onReset} className="flex-1 rounded-lg bg-white hover:bg-slate-100 py-1.5 text-xs font-medium cursor-pointer">
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-center gap-6">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Annuler le fil"
          className="w-24 h-14 rounded-2xl bg-red-100 hover:bg-red-200 text-xl font-semibold text-red-600 cursor-pointer"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={onConfirm}
          aria-label="Valider le fil"
          className="w-24 h-14 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-xl font-semibold text-emerald-700 cursor-pointer"
        >
          ✓
        </button>
      </div>
    </div>
  );
};
