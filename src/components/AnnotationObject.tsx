import React, { useRef, useState } from 'react';
import { PanelAnnotation } from '../types/panel';
import { PictogramTile } from './PictogramIcon';
import { Plus, Minus } from 'lucide-react';
import { TEXT_BASE_PX, backgroundCss, resolveTextStyle } from './TextEditorModal';

interface AnnotationObjectProps {
  annotation: PanelAnnotation;
  zoom: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PanelAnnotation>) => void;
  onDelete: (id: string) => void;
  /** Ouvre le panneau d'édition d'un texte (double-clic). */
  onRequestEdit?: (id: string) => void;
}

const MIN_ICON = 24;
const MAX_ICON = 160;
const MAX_TABLE = 12;

/**
 * Objet libre posé sur le plan (onglet Marquage) : texte, tableau ou pictogramme.
 * - glisser pour déplacer (une seule entrée dans l'historique annuler/rétablir par déplacement)
 * - clic pour sélectionner et afficher la barre d'outils
 * - double-clic sur un texte pour ouvrir son panneau d'édition ; les cellules d'un tableau sont directement éditables
 * - la barre du haut (AnnotationTopBar) gère dupliquer / modifier / pivoter / verrouiller / supprimer
 */
export const AnnotationObject: React.FC<AnnotationObjectProps> = ({
  annotation,
  zoom,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onRequestEdit,
}) => {
  const [livePos, setLivePos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);

  const x = livePos ? livePos.x : annotation.x;
  const y = livePos ? livePos.y : annotation.y;

  // ---- Déplacement ----
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(annotation.id);
    if (annotation.locked) return; // verrouillé : sélectionnable mais pas déplaçable
    drag.current = { startX: e.clientX, startY: e.clientY, originX: annotation.x, originY: annotation.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / zoom;
    const dy = (e.clientY - d.startY) / zoom;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    d.moved = true;
    setLivePos({ x: Math.round(d.originX + dx), y: Math.round(d.originY + dy) });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* déjà relâché */
    }
    if (d?.moved && livePos) {
      onUpdate(annotation.id, { x: livePos.x, y: livePos.y });
    }
    setLivePos(null);
  };

  // ---- Barre d'outils (non imprimée) ----
  const ToolButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode; danger?: boolean }> = ({
    onClick,
    title,
    children,
    danger,
  }) => (
    <button
      type="button"
      title={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`h-6 min-w-6 px-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-0.5 cursor-pointer ${
        danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
      }`}
    >
      {children}
    </button>
  );

  const toolbar = isSelected && annotation.kind !== 'text' && (
    <div
      className="no-print absolute -top-8 left-0 flex items-center gap-1 bg-slate-900/95 rounded-lg px-1.5 py-1 shadow-lg z-50 whitespace-nowrap"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {annotation.kind === 'table' && (
        <>
          <ToolButton
            title="Ajouter une ligne"
            onClick={() => {
              const cells = annotation.cells || [];
              if (cells.length >= MAX_TABLE) return;
              const cols = cells[0]?.length || 2;
              onUpdate(annotation.id, { cells: [...cells, Array(cols).fill('')] });
            }}
          >
            <Plus className="w-3 h-3" /> Ligne
          </ToolButton>
          <ToolButton
            title="Supprimer la dernière ligne"
            onClick={() => {
              const cells = annotation.cells || [];
              if (cells.length <= 1) return;
              onUpdate(annotation.id, { cells: cells.slice(0, -1) });
            }}
          >
            <Minus className="w-3 h-3" /> Ligne
          </ToolButton>
          <ToolButton
            title="Ajouter une colonne"
            onClick={() => {
              const cells = annotation.cells || [];
              if ((cells[0]?.length || 0) >= MAX_TABLE) return;
              onUpdate(annotation.id, { cells: cells.map((r) => [...r, '']) });
            }}
          >
            <Plus className="w-3 h-3" /> Col.
          </ToolButton>
          <ToolButton
            title="Supprimer la dernière colonne"
            onClick={() => {
              const cells = annotation.cells || [];
              if ((cells[0]?.length || 0) <= 1) return;
              onUpdate(annotation.id, { cells: cells.map((r) => r.slice(0, -1)) });
            }}
          >
            <Minus className="w-3 h-3" /> Col.
          </ToolButton>
        </>
      )}
      {annotation.kind === 'pictogram' && (
        <>
          <ToolButton title="Réduire" onClick={() => onUpdate(annotation.id, { size: Math.max(MIN_ICON, (annotation.size || 48) - 8) })}>
            <Minus className="w-3 h-3" />
          </ToolButton>
          <ToolButton title="Agrandir" onClick={() => onUpdate(annotation.id, { size: Math.min(MAX_ICON, (annotation.size || 48) + 8) })}>
            <Plus className="w-3 h-3" />
          </ToolButton>
          {['#1f2937', '#2563eb', '#dc2626', '#16a34a', '#f59e0b'].map((clr) => (
            <button
              key={clr}
              title="Couleur"
              onClick={() => onUpdate(annotation.id, { color: clr })}
              className={`w-4 h-4 rounded-full border-2 ${(annotation.color || '#1f2937') === clr ? 'border-white ring-1 ring-slate-800' : 'border-transparent'}`}
              style={{ backgroundColor: clr }}
            />
          ))}
        </>
      )}
    </div>
  );

  // ---- Contenu selon le type ----
  let content: React.ReactNode = null;

  if (annotation.kind === 'text') {
    const st = resolveTextStyle(annotation);
    content = (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          onRequestEdit?.(annotation.id);
        }}
        style={{
          fontSize: st.scale * TEXT_BASE_PX,
          minWidth: `${st.width}ch`,
          color: st.color,
          backgroundColor: backgroundCss(st.background),
          fontWeight: st.bold ? 700 : 400,
          fontStyle: st.italic ? 'italic' : 'normal',
        }}
        className={`px-1.5 py-0.5 rounded text-center whitespace-pre leading-tight ${annotation.locked ? 'cursor-default' : 'cursor-move'}`}
        title="Double-clic pour modifier"
      >
        {annotation.text || 'Texte'}
      </div>
    );
  } else if (annotation.kind === 'table') {
    const cells = annotation.cells || [['', ''], ['', '']];
    content = (
      <table className="border-collapse bg-white/95 shadow-sm cursor-move">
        <tbody>
          {cells.map((row, r) => (
            <tr key={r}>
              {row.map((value, c) => (
                <td key={c} className="border border-slate-700 p-0">
                  <input
                    defaultValue={value}
                    key={`${r}-${c}-${value}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onFocus={() => onSelect(annotation.id)}
                    onBlur={(e) => {
                      if (e.target.value === value) return;
                      const next = cells.map((rr) => [...rr]);
                      next[r][c] = e.target.value;
                      onUpdate(annotation.id, { cells: next });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    className="select-text w-[84px] px-1.5 py-1 text-[12px] text-slate-900 bg-transparent outline-none focus:bg-blue-50"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    const size = annotation.size || 48;
    content = (
      <div className="cursor-move">
        <PictogramTile name={annotation.pictogram} size={size + 12} color={annotation.color || '#4b4b4b'} />
      </div>
    );
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ position: 'absolute', left: x, top: y, touchAction: 'none' }}
      className={`z-30 ${isSelected ? 'outline outline-2 outline-[#007aff] outline-offset-2 rounded' : ''}`}
    >
      {toolbar}
      <div style={{ transform: `rotate(${annotation.rotation ?? 0}deg)`, transformOrigin: 'center' }}>{content}</div>
    </div>
  );
};
