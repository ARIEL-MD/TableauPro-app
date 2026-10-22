import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { PanelAnnotation } from '../types/panel';

export const TEXT_MAX = 30;
export const TEXT_BASE_PX = 12; // 1x = 12 px de plan
export const TEXT_SCALE_MIN = 0.5;
export const TEXT_SCALE_MAX = 4;
export const FIELD_WIDTH_MIN = 2;
export const FIELD_WIDTH_MAX = 20;

export const TEXT_COLORS = ['#facc15', '#16a34a', '#dc2626', '#2563eb', '#000000'];
// 'none' = fond blanc neutre (comme le premier « Text » des captures de référence)
export const BACKGROUND_COLORS = ['none', '#facc15', '#16a34a', '#dc2626', '#2563eb'];

/** Valeurs d'un texte, avec compatibilité pour les anciens projets (fontSize en px). */
export const resolveTextStyle = (a: PanelAnnotation) => ({
  scale: a.fontScale ?? (a.fontSize ? a.fontSize / TEXT_BASE_PX : 1.6),
  width: a.fieldWidth ?? 6,
  bold: !!a.bold,
  italic: !!a.italic,
  color: a.textColor ?? '#000000',
  background: a.background ?? 'none',
});

/** Couleur CSS du fond d'un texte : 'none' donne le fond blanc neutre. */
export const backgroundCss = (bg: string): string => (bg === 'none' ? '#ffffff' : bg);

interface TextEditorModalProps {
  annotation: PanelAnnotation;
  onCancel: () => void;
  onConfirm: (patch: Partial<PanelAnnotation>) => void;
}

const swatch = (selected: boolean) =>
  `w-9 h-9 rounded-full border-2 cursor-pointer ${selected ? 'border-[#007aff] ring-2 ring-[#007aff]/40' : 'border-slate-300'}`;

/**
 * Panneau d'édition d'un texte posé sur le plan : contenu (30 caractères max),
 * taille, largeur du champ, style (normal / gras / italique), couleur et arrière-plan.
 * Rien n'est appliqué au plan tant que l'on n'a pas validé avec ✓.
 */
export const TextEditorModal: React.FC<TextEditorModalProps> = ({ annotation, onCancel, onConfirm }) => {
  const initial = resolveTextStyle(annotation);
  const [text, setText] = useState(annotation.text ?? '');
  const [scale, setScale] = useState(Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, initial.scale)));
  const [width, setWidth] = useState(initial.width);
  const [bold, setBold] = useState(initial.bold);
  const [italic, setItalic] = useState(initial.italic);
  const [color, setColor] = useState(initial.color);
  const [background, setBackground] = useState(initial.background);

  // « Normal » = ni gras ni italique
  const isNormal = !bold && !italic;
  const styleBtn = (active: boolean) =>
    `text-left px-4 py-2.5 rounded-xl text-base cursor-pointer ${active ? 'bg-sky-100 text-slate-900' : 'text-slate-800 hover:bg-slate-50'}`;

  return (
    <div
      role="dialog"
      aria-label="Modifier le texte"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[170] w-[min(94vw,460px)] rounded-3xl bg-white p-4 shadow-2xl text-slate-900 no-print"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <input
        autoFocus
        type="text"
        value={text}
        maxLength={TEXT_MAX}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-2xl border border-slate-400 px-4 py-3 text-lg outline-none focus:border-[#007aff] select-text"
      />
      <p className="mt-1 ml-1 text-sm text-slate-500">
        {text.length}/{TEXT_MAX}
      </p>

      <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-x-3">
        {/* Colonne de gauche : curseurs + style */}
        <div>
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="text-scale" className="text-base text-slate-800">Taille du texte</label>
              <span className="text-sm text-slate-600">{scale.toFixed(1).replace('.', ',')}x</span>
            </div>
            <input
              id="text-scale"
              type="range"
              min={TEXT_SCALE_MIN}
              max={TEXT_SCALE_MAX}
              step={0.1}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-[#1d5fa8]"
            />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <label htmlFor="text-width" className="text-base text-slate-800">Largeur du champ</label>
              <span className="text-sm text-slate-600">{width}</span>
            </div>
            <input
              id="text-width"
              type="range"
              min={FIELD_WIDTH_MIN}
              max={FIELD_WIDTH_MAX}
              step={1}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-[#1d5fa8]"
            />
          </div>
          <div className="mt-2 flex flex-col">
            <button
              type="button"
              className={styleBtn(isNormal)}
              onClick={() => {
                setBold(false);
                setItalic(false);
              }}
            >
              Normal
            </button>
            <button type="button" className={`${styleBtn(bold)} font-bold`} onClick={() => setBold((v) => !v)}>
              Bold
            </button>
            <button type="button" className={`${styleBtn(italic)} italic`} onClick={() => setItalic((v) => !v)}>
              Italic
            </button>
          </div>
        </div>

        {/* Couleur du texte */}
        <div className="flex flex-col items-center">
          <span className="text-sm text-slate-700 mb-1">Couleur</span>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-1.5">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Couleur du texte ${c}`}
                className={swatch(color === c)}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        {/* Couleur d'arrière-plan */}
        <div className="flex flex-col items-center">
          <span className="text-sm text-slate-700 mb-1 text-center leading-tight">Couleur d’arrière-plan</span>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-1.5">
            {BACKGROUND_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c === 'none' ? 'Sans couleur' : `Arrière-plan ${c}`}
                className={`${swatch(background === c)} ${c === 'none' ? 'border-dashed bg-slate-50 text-slate-400 flex items-center justify-center' : ''}`}
                style={c === 'none' ? undefined : { backgroundColor: c }}
                onClick={() => setBackground(c)}
              >
                {c === 'none' ? '–' : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-6">
        <button
          type="button"
          aria-label="Annuler"
          onClick={onCancel}
          className="w-24 h-14 rounded-2xl bg-red-100 hover:bg-red-200 flex items-center justify-center cursor-pointer"
        >
          <X className="w-7 h-7 text-red-600" />
        </button>
        <button
          type="button"
          aria-label="Valider"
          onClick={() =>
            onConfirm({
              text,
              fontScale: scale,
              fieldWidth: width,
              bold,
              italic,
              textColor: color,
              background,
            })
          }
          className="w-24 h-14 rounded-2xl bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center cursor-pointer"
        >
          <Check className="w-7 h-7 text-emerald-600" />
        </button>
      </div>
    </div>
  );
};
