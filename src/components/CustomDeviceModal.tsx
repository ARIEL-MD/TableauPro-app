import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { DevicePoles } from '../types/panel';
import { CUSTOM_CATEGORIES, CUSTOM_POLES, CustomDeviceDef } from '../utils/customDevices';

interface Props {
  initial?: CustomDeviceDef | null;
  onCancel: () => void;
  onSave: (def: CustomDeviceDef) => void;
}

const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#007aff] focus:outline-none';

export const CustomDeviceModal: React.FC<Props> = ({ initial, onCancel, onSave }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [reference, setReference] = useState(initial?.reference ?? '');
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'breaker');
  const [poles, setPoles] = useState<DevicePoles>(initial?.poles ?? '1P+N');
  const [moduleWidth, setModuleWidth] = useState(initial?.moduleWidth ?? 1);
  const [calibre, setCalibre] = useState<string>(initial?.calibre ? String(initial.calibre) : '');

  const valid = name.trim().length > 0 && moduleWidth >= 1 && moduleWidth <= 12;

  const submit = () => {
    if (!valid) return;
    const cal = Number(calibre);
    onSave({
      id: initial?.id ?? `custom-${Date.now()}`,
      name: name.trim(),
      reference: reference.trim() || 'REF-PERSO',
      manufacturer: manufacturer.trim() || 'Personnalisé',
      category,
      poles,
      moduleWidth,
      calibre: cal > 0 ? cal : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {initial ? 'Modifier l’appareil' : 'Nouvel appareil personnalisé'}
          </h3>
          <button onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600">
            Nom *
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Disjoncteur chauffe-eau" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-600">
              Référence
              <input className={field} value={reference} onChange={(e) => setReference(e.target.value)} />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Fabricant
              <input className={field} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-600">
            Famille (décide du dessin)
            <select className={field} value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              {CUSTOM_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block text-xs font-semibold text-slate-600">
              Pôles
              <select className={field} value={poles} onChange={(e) => setPoles(e.target.value as DevicePoles)}>
                {CUSTOM_POLES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Modules
              <input
                type="number"
                min={1}
                max={12}
                className={field}
                value={moduleWidth}
                onChange={(e) => setModuleWidth(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Calibre (A)
              <input type="number" min={0} className={field} value={calibre} onChange={(e) => setCalibre(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="rounded-lg bg-[#007aff] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
