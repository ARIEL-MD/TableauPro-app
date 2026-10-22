import React, { useState } from 'react';
import { Cable, Copy, Trash2, X } from 'lucide-react';
import { ElectricalDevice } from '../types/panel';
import { WireConnectionModal, WireDraft } from './WireConnectionModal';

/* Courbes et intensités proposées selon le type d'appareil */
const CURVES: ('A' | 'B' | 'C' | 'D' | 'K' | 'Z' | 'none')[] = ['A', 'B', 'C', 'D', 'K', 'Z', 'none'];
const MCB_INTENSITIES = [1, 2, 3, 4, 6, 8, 10, 13, 16, 20, 25, 32, 40, 50, 63];
const RCD_INTENSITIES = [25, 40, 63];

export const calibreChip = (d: ElectricalDevice): string => {
  if (d.category === 'differential') {
    const sens = typeof d.differentialSensibility === 'number' ? d.differentialSensibility : 30;
    return `${d.calibre ?? '—'}A ${sens}mA`;
  }
  const curve = d.curve && d.curve !== 'none' ? d.curve : '';
  return d.calibre === undefined ? '—' : `${curve}${d.calibre}`;
};

export const CalibreModal: React.FC<{
  device: ElectricalDevice;
  onClose: () => void;
  onSave: (patch: Partial<ElectricalDevice>) => void;
}> = ({ device, onClose, onSave }) => {
  const isDiffDev = device.category === 'differential';
  const intensities = isDiffDev ? RCD_INTENSITIES : MCB_INTENSITIES;
  const [curve, setCurve] = useState<NonNullable<ElectricalDevice['curve']>>(device.curve ?? 'C');
  const [cal, setCal] = useState<number | undefined>(typeof device.calibre === 'number' ? device.calibre : undefined);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-2xl shadow-2xl p-4 text-slate-900"
      >
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={onClose} className="text-[#007aff] text-sm cursor-pointer">Annuler</button>
          <span className="font-bold text-sm">Calibre</span>
          <span className="w-12" />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 w-20">
            <span className="text-xs font-bold">{device.name}</span>
            <span className="text-[10px] px-1 rounded bg-black text-white font-mono">{cal === undefined ? '—' : `${isDiffDev ? '' : curve === 'none' ? '' : curve}${cal}`}</span>
          </div>
          <div className="flex-1">
            {!isDiffDev && (
              <>
                <p className="text-xs text-slate-500 mb-1">Courbe de déclenchement</p>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {CURVES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurve(c)}
                      className={`py-1.5 rounded-md text-xs font-bold cursor-pointer ${curve === c ? 'bg-[#007aff] text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {c === 'none' ? '—' : c}
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="text-xs text-slate-500 mb-1">Intensité</p>
            <div className="max-h-44 overflow-y-auto grid grid-cols-3 gap-1.5">
              {intensities.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCal(i)}
                  className={`py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer ${cal === i ? 'bg-[#007aff] text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {i}A
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onSave({ calibre: undefined, curve: undefined })}
            className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold cursor-pointer"
          >
            Supprimer le calibre
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({
                calibre: cal,
                curve: isDiffDev ? device.curve : curve,
                wireGauge: cal !== undefined && cal >= 32 ? '6mm²' : cal !== undefined && cal >= 20 ? '2.5mm²' : '1.5mm²',
              });
              onClose();
            }}
            className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold cursor-pointer"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};


/* Barre du haut affichée quand un appareil est sélectionné :
   nom, calibre (ouvre l'éditeur), fils, dupliquer, supprimer, fermer. */
interface DeviceToolbarProps {
  device: ElectricalDevice;
  onClose: () => void;
  onStartWire: (fromAnchor: string, draft: WireDraft) => void;
  onUpdateDevice: (device: ElectricalDevice) => void;
  onDuplicateDevice: (device: ElectricalDevice) => void;
  onDeleteDevice: (deviceId: string) => void;
}

export const DeviceToolbar: React.FC<DeviceToolbarProps> = ({
  device,
  onClose,
  onStartWire,
  onUpdateDevice,
  onDuplicateDevice,
  onDeleteDevice,
}) => {
  const [calibreOpen, setCalibreOpen] = useState(false);
  const [wireOpen, setWireOpen] = useState(false);
  const hasCalibre = device.category === 'breaker' || device.category === 'rcbo' || device.category === 'differential';

  return (
    <>
      <div className="absolute top-3 left-3 right-[76px] z-30 no-print">
        <div className="h-12 px-3 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 truncate flex-1">{device.name}</span>

          {hasCalibre && (
            <button
              type="button"
              onClick={() => setCalibreOpen(true)}
              className="px-2 py-1 rounded-md bg-black text-white text-[11px] font-bold font-mono hover:bg-slate-800 cursor-pointer"
              title="Modifier le calibre et la courbe"
            >
              {calibreChip(device)}
            </button>
          )}

          <button
            type="button"
            onClick={() => setWireOpen(true)}
            className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Faire un fil"
          >
            <Cable className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicateDevice(device)}
            className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteDevice(device.id)}
            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {calibreOpen && (
        <CalibreModal
          device={device}
          onClose={() => setCalibreOpen(false)}
          onSave={(patch) => onUpdateDevice({ ...device, ...patch })}
        />
      )}

      {wireOpen && (
        <WireConnectionModal
          device={device}
          onClose={() => setWireOpen(false)}
          onConfirm={(draft) => {
            onStartWire(`dev:${device.id}:${draft.terminal}`, draft);
            setWireOpen(false);
          }}
        />
      )}
    </>
  );
};
