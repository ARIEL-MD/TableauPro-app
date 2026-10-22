import React from 'react';
import { Copy, Lock, Pencil, RotateCw, Table2, Trash2, Type, Unlock, Shapes } from 'lucide-react';
import { PanelAnnotation } from '../types/panel';
import { TEXT_MAX } from './TextEditorModal';

interface AnnotationTopBarProps {
  annotation: PanelAnnotation;
  onEdit: () => void;
  onDuplicate: () => void;
  onRotate: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}

const btn = 'p-2 rounded-lg text-slate-800 hover:bg-slate-100 active:bg-slate-200 cursor-pointer';

/**
 * Barre du haut affichée quand un objet libre est sélectionné :
 * icône + titre (texte et compteur « n/30 » pour un texte), puis
 * dupliquer, modifier (texte), pivoter de 90°, verrouiller, supprimer.
 */
export const AnnotationTopBar: React.FC<AnnotationTopBarProps> = ({
  annotation,
  onEdit,
  onDuplicate,
  onRotate,
  onToggleLock,
  onDelete,
}) => {
  const isText = annotation.kind === 'text';
  const title = isText ? annotation.text || 'Texte' : annotation.kind === 'table' ? 'Tableau' : 'Pictogramme';
  const Icon = isText ? Type : annotation.kind === 'table' ? Table2 : Shapes;

  return (
    <div className="absolute top-3 left-3 right-[76px] z-30 no-print" onPointerDown={(e) => e.stopPropagation()}>
      <div className="h-14 px-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-1">
        <span className="w-9 h-9 rounded-lg border-2 border-slate-800 flex items-center justify-center shrink-0 mr-1">
          <Icon className="w-5 h-5 text-slate-900" />
        </span>
        <div className="flex-1 min-w-0 leading-tight">
          <p className="font-semibold text-base text-slate-900 truncate">{title}</p>
          {isText && (
            <p className="text-xs text-slate-500">
              {(annotation.text ?? '').length}/{TEXT_MAX}
            </p>
          )}
        </div>

        <button type="button" onClick={onDuplicate} className={btn} title="Dupliquer" aria-label="Dupliquer">
          <Copy className="w-5 h-5" />
        </button>
        {isText && (
          <button type="button" onClick={onEdit} className={btn} title="Modifier le texte" aria-label="Modifier le texte">
            <Pencil className="w-5 h-5" />
          </button>
        )}
        <button type="button" onClick={onRotate} className={btn} title="Pivoter de 90°" aria-label="Pivoter">
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onToggleLock}
          className={btn}
          title={annotation.locked ? 'Déverrouiller' : 'Verrouiller'}
          aria-label={annotation.locked ? 'Déverrouiller' : 'Verrouiller'}
        >
          {annotation.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={`${btn} text-slate-800`}
          title="Supprimer"
          aria-label="Supprimer"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
