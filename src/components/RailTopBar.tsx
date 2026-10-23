import React from 'react';
import { Trash2 } from 'lucide-react';
import { DinRail } from '../types/panel';

interface RailTopBarProps {
  rail: DinRail;
  onDelete: () => void;
}

/** Barre du haut affichée quand un rail est sélectionné : titre + corbeille. */
export const RailTopBar: React.FC<RailTopBarProps> = ({ rail, onDelete }) => (
  <div className="absolute top-3 left-3 right-[76px] z-30 no-print" onPointerDown={(e) => e.stopPropagation()}>
    <div className="h-14 px-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-1">
      <div className="flex-1 min-w-0 leading-tight">
        <div className="text-[15px] font-semibold text-slate-900 truncate">
          Rail DIN{rail.lengthMm ? ` ${rail.lengthMm} mm` : ''}
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 rounded-lg text-slate-800 hover:bg-slate-100 active:bg-slate-200 cursor-pointer"
        title="Supprimer ce rail"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
);
