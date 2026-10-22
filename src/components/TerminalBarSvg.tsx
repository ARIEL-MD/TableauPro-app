import React from 'react';
import { TerminalBar } from '../types/panel';
import { Trash2 } from 'lucide-react';
import { TerminalBarGraphic } from './TerminalBarGraphic';

interface TerminalBarSvgProps {
  bar: TerminalBar;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TerminalBarSvg: React.FC<TerminalBarSvgProps> = ({
  bar,
  isSelected = false,
  onSelect,
  onDelete,
}) => {
  const isEarth = bar.type === 'earth';
  const isNeutral = bar.type === 'neutral';

  const barColor = bar.color || (isEarth ? 'green' : isNeutral ? 'blue' : 'red');

  const label = isEarth
    ? `Bornier de Terre PE (${bar.holesCount} vis)`
    : isNeutral
    ? `Bornier de Neutre N (${bar.holesCount} vis)`
    : `Bornier de Phase L (${bar.holesCount} vis)`;

  return (
    <div
      data-wire-anchor={`bar:${bar.id}`}
      onClick={() => onSelect?.(bar.id)}
      className={`inline-flex flex-col p-2 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-900/90 shadow-lg'
          : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/70 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isEarth ? 'bg-emerald-400' : isNeutral ? 'bg-sky-400' : 'bg-red-400'}`} />
          <span className="text-[11px] font-semibold text-slate-200">{label}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(bar.id);
          }}
          className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
          title="Supprimer ce bornier"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Barrette : même dessin que dans le tiroir */}
      <TerminalBarGraphic count={bar.holesCount} color={barColor} className="h-7 w-auto block" />
    </div>
  );
};
