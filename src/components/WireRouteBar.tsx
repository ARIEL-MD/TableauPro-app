import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { WireDir, STEP_MIN, STEP_MAX, isHorizontal } from './wireRoute';

interface WireRouteBarProps {
  colorName: string;
  segment: number;
  segmentCount: number;
  isFixed: boolean;
  step: number;
  hint?: string | null;
  onSegment: (k: number) => void;
  onStep: (v: number) => void;
  onMove: (dir: WireDir) => void;
  onJog: () => void;
  onReset: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const arrowBtn =
  'w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center disabled:opacity-40';

/**
 * Panneau de tracé du fil : les flèches déplacent le segment choisi,
 * le curseur règle la distance d'un appui (0,2x à 2x).
 */
export const WireRouteBar: React.FC<WireRouteBarProps> = ({
  colorName,
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
  const horizontal = isHorizontal(segment);
  const axisLabel = isFixed
    ? 'Fixé à la borne'
    : horizontal
      ? 'Se déplace avec ↑ ↓'
      : 'Se déplace avec ← →';

  return (
    <div
      role="dialog"
      aria-label="Tracé du fil"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[160] w-[min(92vw,420px)] rounded-2xl bg-white p-4 shadow-2xl text-slate-900"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Tracé du fil {colorName}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Segment précédent"
            onClick={() => onSegment(Math.max(0, segment - 1))}
            disabled={segment <= 0}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40"
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
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{axisLabel}</p>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="grid grid-cols-3 gap-1.5 justify-items-center">
          <span />
          <button type="button" aria-label="Haut" className={arrowBtn} onClick={() => onMove('up')}>
            <ArrowUp className="w-5 h-5" />
          </button>
          <span />
          <button type="button" aria-label="Gauche" className={arrowBtn} onClick={() => onMove('left')}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span />
          <button type="button" aria-label="Droite" className={arrowBtn} onClick={() => onMove('right')}>
            <ArrowRight className="w-5 h-5" />
          </button>
          <span />
          <button type="button" aria-label="Bas" className={arrowBtn} onClick={() => onMove('down')}>
            <ArrowDown className="w-5 h-5" />
          </button>
          <span />
        </div>

        <div className="flex flex-col items-center gap-2 w-28">
          <span className="text-xs text-slate-600">Pas</span>
          <input
            type="range"
            aria-label="Taille du pas"
            min={STEP_MIN}
            max={STEP_MAX}
            step={0.1}
            value={step}
            onChange={(e) => onStep(Number(e.target.value))}
            className="w-full accent-[#1d5fa8]"
          />
          <span className="text-xs font-medium text-slate-700">{step.toFixed(1)}x</span>
          <button
            type="button"
            onClick={onJog}
            className="w-full rounded-lg bg-slate-100 hover:bg-slate-200 py-1.5 text-xs font-medium"
          >
            + Coude
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg bg-slate-100 hover:bg-slate-200 py-1.5 text-xs font-medium"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {hint && <p className="mt-2 text-xs text-amber-700">{hint}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Annuler le fil"
          className="flex-1 rounded-xl bg-red-100 hover:bg-red-200 py-2.5 text-sm font-semibold text-red-600"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={onConfirm}
          aria-label="Valider le fil"
          className="flex-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 py-2.5 text-sm font-semibold text-emerald-700"
        >
          ✓
        </button>
      </div>
    </div>
  );
};
