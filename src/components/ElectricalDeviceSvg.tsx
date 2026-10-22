import React from 'react';
import { ElectricalDevice } from '../types/panel';
import { DeviceThumbSvg } from './DeviceThumbSvg';

interface ElectricalDeviceSvgProps {
  device: ElectricalDevice;
  isSelected?: boolean;
  isDragging?: boolean;
  onToggleSwitch?: (id: string, e: React.MouseEvent) => void;
  onClick?: (device: ElectricalDevice, e: React.MouseEvent) => void;
  modulePixelWidth?: number; // default 36px per module
}

/**
 * Associe un appareil du projet au MÊME dessin que dans le tiroir (DeviceThumbSvg),
 * pour que l'appareil posé sur le plan soit identique à son aperçu.
 */
export const thumbTypeForDevice = (d: ElectricalDevice): string => {
  const poles = d.poles;
  const four = poles === '4P' || poles === '3P+N';
  const name = d.name || '';
  switch (d.category) {
    case 'breaker':
      if (poles === '1P+N') return 'MCB 1P + N';
      if (four) return 'MCB 4P';
      if (poles === '3P') return 'MCB 3P';
      if (poles === '2P') return 'MCB 2P';
      return 'MCB 1P';
    case 'differential':
      return four ? 'RCCB 4P' : 'RCCB 2P';
    case 'rcbo':
      return four ? 'RCBO 4P' : poles === '1P+N' ? 'RCBO 1P + N' : 'RCBO 2P';
    case 'switch_disconnector':
    case 'isolator':
      return four ? 'SD 4P' : poles === '3P' ? 'SD 3P' : poles === '2P' || poles === '1P+N' ? 'SD 2P' : 'SD 1P';
    case 'changeover':
      return 'SD Changeover';
    case 'contactor':
      return d.moduleWidth >= 4 || four ? 'Contactor 4NO' : 'Contactor 1M';
    case 'impulse_relay':
    case 'relay':
      return 'Telerupteur';
    case 'timer':
    case 'time_relay':
      return /num[eé]rique|digital/i.test(name) ? 'Timer digital' : 'Timer mech';
    case 'voltage_relay':
      return poles === '3P' || four ? 'VoltageRelay 3P' : 'VoltageRelay 1P';
    case 'afdd':
      return /rcbo/i.test(name) ? 'AFDD + RCBO' : 'AFDD + MCB';
    case 'surge_arrester':
      return poles === '1P' ? 'SPD 1P' : poles === '1P+N' || poles === '2P' ? 'SPD 1P + N' : poles === '3P' ? 'SPD 3P' : 'SPD 3P + N';
    case 'indicator':
    case 'indicator_light':
      return 'IndicatorLight';
    case 'socket':
      return 'Socket';
    case 'meter':
      return poles === '3P' || four ? 'Meter 3P' : 'Meter 1P';
    case 'motor_starter':
      return 'Guardmotor';
    default:
      return 'MCB 1P';
  }
};


/** Plaquette affichée sur le boîtier : « C16 » pour un disjoncteur, « 25A 30mA » pour un différentiel. */
const deviceLabel = (d: ElectricalDevice, type: string): string | undefined => {
  const cal = typeof d.calibre === 'number' ? d.calibre : undefined;
  if (type === 'RCCB 2P' || type === 'RCCB 4P' || type === 'RCBO 2P' || type === 'RCBO 4P' || type === 'RCBO 1P + N') {
    if (type.startsWith('RCCB') && cal === undefined) return undefined;
    const sens = typeof d.differentialSensibility === 'number' ? d.differentialSensibility : 30;
    const kind = d.differentialType ?? 'A';
    return `${kind} ${cal ?? 25}A ${sens}mA`;
  }
  if (type.startsWith('MCB')) {
    if (cal === undefined) return undefined;
    const curve = d.curve && d.curve !== 'none' ? d.curve : '';
    return `${curve}${cal}`;
  }
  return undefined;
};

export const ElectricalDeviceSvg: React.FC<ElectricalDeviceSvgProps> = ({
  device,
  isSelected = false,
  isDragging = false,
  onClick,
  modulePixelWidth = 36,
}) => {
  const width = device.moduleWidth * modulePixelWidth;
  const height = 118; // hauteur d'un appareil modulaire sur le rail
  const type = thumbTypeForDevice(device);
  const color =
    type === 'IndicatorLight' ? device.indicatorColor : device.colorTag || undefined;
  const poles = type === 'MCB 1P + N' ? 1 : Math.max(1, device.moduleWidth);

  return (
    <div
      onClick={(e) => onClick?.(device, e)}
      className={`relative select-none transition-all duration-150 cursor-pointer ${
        isDragging ? 'opacity-70 z-40' : 'z-20'
      }`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {isSelected && (
        <div className="absolute -inset-1 rounded-lg border-2 border-[#007aff] bg-[#007aff]/15 pointer-events-none z-30 ring-2 ring-[#007aff]/30 shadow-md" />
      )}

      {/* Même dessin que l'aperçu du tiroir */}
      <DeviceThumbSvg type={type} color={color} label={deviceLabel(device, type)} className="w-full h-full block" />

      {/* Ancres par pôle : chaque vis reçoit son fil */}
      {Array.from({ length: poles }).map((_, k) => (
        <React.Fragment key={`pole-${k}`}>
          <div
            data-wire-anchor={`dev:${device.id}:top:${k}`}
            className="absolute top-0 h-3 w-4 pointer-events-none z-20"
            style={{ left: `calc(${((k + 0.5) / poles) * 100}% - 8px)` }}
          />
          <div
            data-wire-anchor={`dev:${device.id}:bottom:${k}`}
            className="absolute bottom-0 h-3 w-4 pointer-events-none z-20"
            style={{ left: `calc(${((k + 0.5) / poles) * 100}% - 8px)` }}
          />
        </React.Fragment>
      ))}

      {/* Ancres de câblage (bornes amont / aval) */}
      <div
        data-wire-anchor={`dev:${device.id}:top`}
        className="absolute left-0 right-0 top-0 h-6 pointer-events-none z-20"
      />
      <div
        data-wire-anchor={`dev:${device.id}:bottom`}
        className="absolute left-0 right-0 bottom-0 h-6 pointer-events-none z-20"
      />
    </div>
  );
};
