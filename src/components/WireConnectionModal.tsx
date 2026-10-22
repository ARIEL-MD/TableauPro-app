import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ElectricalDevice, WireTerminal, WireThickness } from '../types/panel';
import { terminalCount } from './ElectricalDeviceSvg';

/** Choix faits dans le dialogue, avant d'avoir la borne d'arrivée. */
export interface WireDraft {
  terminal: WireTerminal;
  color: string;
  colorName: string;
  thickness: WireThickness;
}

export const WIRE_COLORS: { name: string; hex: string }[] = [
  { name: 'Jaune', hex: '#facc15' },
  { name: 'Vert', hex: '#16a34a' },
  { name: 'Rouge', hex: '#dc2626' },
  { name: 'Bleu', hex: '#2563eb' },
  { name: 'Noir', hex: '#111827' },
  { name: 'Vert/Jaune', hex: 'linear-gradient(90deg,#16a34a 50%,#facc15 50%)' },
  { name: 'Blanc', hex: '#ffffff' },
  { name: 'Gris', hex: '#9ca3af' },
  { name: 'Marron', hex: '#78350f' },
  { name: 'Bleu clair', hex: '#0ea5e9' },
  { name: 'Vert clair', hex: '#4ade80' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Rose', hex: '#ec4899' },
  { name: 'Beige', hex: '#d6a77a' },
];

// Épaisseurs proposées : 4 traits, du plus fin au plus épais (1,5 à 10 mm²)
export const WIRE_THICKNESSES: { value: WireThickness; label: string; px: number }[] = [
  { value: 1, label: '1,5 mm²', px: 2 },
  { value: 2, label: '2,5 mm²', px: 3 },
  { value: 3, label: '6 mm²', px: 5 },
  { value: 4, label: '10 mm²', px: 7 },
];


interface WireConnectionModalProps {
  device: ElectricalDevice;
  onClose: () => void;
  onConfirm: (draft: WireDraft) => void;
}

export const WireConnectionModal: React.FC<WireConnectionModalProps> = ({
  device,
  onClose,
  onConfirm,
}) => {
  const poles = terminalCount(device);
  const TERMS: string[] = Array.from({ length: poles }).flatMap((_, k) => [`top:${k}`, `bottom:${k}`]);
  const [terminal, setTerminal] = useState<WireTerminal>('top:0');
  const poleOf = (t: string) => Number(t.split(':')[1] ?? 0);
  const [color, setColor] = useState(WIRE_COLORS[2]);
  const [thickness, setThickness] = useState<WireThickness>(3);

  const step = (dir: -1 | 1) => {
    const i = TERMS.indexOf(terminal);
    const next = (i + dir + TERMS.length) % TERMS.length;
    setTerminal(TERMS[next]);
  };

  const handleConfirm = () => {
    onConfirm({ terminal, color: color.hex, colorName: color.name, thickness });
  };

  const ring = (active: boolean) =>
    active ? 'ring-4 ring-[#007aff] ring-offset-2' : '';

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Connexion du fil"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Connexion du fil</h2>
        <ol className="mt-2 list-decimal pl-5 text-sm text-slate-700 space-y-0.5">
          <li>Sélectionnez la borne de l’appareil</li>
          <li>Sélectionnez la couleur du fil</li>
          <li>Sélectionnez l’épaisseur du fil</li>
        </ol>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Terminal selector: device drawing with the chosen terminal highlighted */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-700 mb-2">{device.name}</p>
            <p className="text-xs text-slate-500 mb-1">
              {terminal.startsWith('top') ? 'Haute' : 'Basse'} · pôle {poleOf(terminal) + 1}/{poles}
            </p>
            <div className="relative flex flex-col items-center py-2">
              <button
                type="button"
                aria-label="Borne haute"
                onClick={() => setTerminal(`top:${poleOf(terminal)}`)}
                className={`w-6 h-6 rounded-full bg-red-600 border-2 border-slate-900 ${
                  terminal.startsWith('top') ? 'ring-4 ring-red-400' : 'opacity-60'
                }`}
              />
              <div className="w-8 h-16 my-2 rounded-sm bg-slate-100 border border-slate-400 flex items-center justify-center">
                <div className="w-4 h-3 bg-slate-600 rounded-sm" />
              </div>
              <button
                type="button"
                aria-label="Borne basse"
                onClick={() => setTerminal(`bottom:${poleOf(terminal)}`)}
                className={`w-6 h-6 rounded-full bg-red-600 border-2 border-slate-900 ${
                  terminal.startsWith('bottom') ? 'ring-4 ring-red-400' : 'opacity-60'
                }`}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                aria-label="Borne précédente"
                onClick={() => step(-1)}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Borne suivante"
                onClick={() => step(1)}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Colour palette */}
          <div className="grid grid-cols-2 gap-2 justify-items-center content-start">
            {WIRE_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                title={c.name}
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full border-2 border-slate-400 ${ring(color.name === c.name)}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Thickness */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {WIRE_THICKNESSES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setThickness(t.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 py-2 ${
                thickness === t.value ? 'border-[#007aff] bg-blue-100' : 'border-blue-200'
              }`}
            >
              <span
                className="block h-10 rounded-full"
                style={{ width: `${t.px}px`, background: color.hex, border: '1px solid #111827' }}
              />
              <span className="text-[11px] text-slate-600">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-sm font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-[#1d5fa8] hover:bg-[#174d88] py-2.5 text-sm font-semibold text-white"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
