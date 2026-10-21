import React from 'react';
import { DistributionBlock } from '../types/panel';
import { Trash2 } from 'lucide-react';

interface DistributionBlockSvgProps {
  block: DistributionBlock;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const DistributionBlockSvg: React.FC<DistributionBlockSvgProps> = ({
  block,
  isSelected = false,
  onSelect,
  onDelete,
}) => {
  const [polesCount, contactsPerPole] = block.configuration.split('x').map(Number);
  const is4P = polesCount === 4;

  const barLabels = is4P ? ['L1 (Brun)', 'L2 (Noir)', 'L3 (Gris)', 'N (Bleu)'] : ['Ph (Phase)', 'N (Neutre)'];
  const barColors = is4P
    ? ['bg-amber-900/80 border-amber-600', 'bg-slate-800 border-slate-600', 'bg-slate-600 border-slate-400', 'bg-blue-800/80 border-blue-500']
    : ['bg-red-900/80 border-red-600', 'bg-blue-800/80 border-blue-500'];

  return (
    <div
      onClick={() => onSelect?.(block.id)}
      className={`inline-flex flex-col p-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none bg-slate-900/90 shadow-md ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/30'
          : 'border-slate-700/80 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-slate-200">
            {block.name} ({block.configuration})
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded">
            {block.maxCurrentAmps}A
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(block.id);
          }}
          className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
          title="Supprimer ce répartiteur"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stepped brass tiers inside transparent casing */}
      <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5 shadow-inner">
        {barLabels.map((lbl, tierIdx) => (
          <div
            key={tierIdx}
            className={`h-6 px-2 rounded border flex items-center justify-between gap-1 shadow-inner ${barColors[tierIdx]}`}
          >
            <span className="text-[8px] font-mono font-bold text-slate-200 truncate w-14">
              {lbl}
            </span>
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {Array.from({ length: contactsPerPole }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-500 shadow-inner flex items-center justify-center shrink-0"
                  title={`${lbl} - Borne ${cIdx + 1}`}
                >
                  <div className="w-1.5 h-0.5 bg-slate-800 rotate-45" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
