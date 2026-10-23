import type { DeviceCategory, DevicePoles } from '../types/panel';

/** Appareil créé par l'utilisateur ; conservé sur l'appareil (localStorage), disponible dans tous les projets. */
export interface CustomDeviceDef {
  id: string;
  name: string;
  reference: string;
  manufacturer: string;
  category: DeviceCategory;
  poles: DevicePoles;
  moduleWidth: number;
  calibre?: number;
}

export const CUSTOM_DEVICES_KEY = 'tableaupro_custom_devices';

/** Familles proposées : elles décident du dessin utilisé sur le plan. */
export const CUSTOM_CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: 'breaker', label: 'Disjoncteur' },
  { value: 'differential', label: 'Différentiel' },
  { value: 'rcbo', label: 'Disjoncteur différentiel' },
  { value: 'switch_disconnector', label: 'Interrupteur-sectionneur' },
  { value: 'contactor', label: 'Contacteur' },
  { value: 'impulse_relay', label: 'Télérupteur' },
  { value: 'time_relay', label: 'Relais temporisé' },
  { value: 'surge_arrester', label: 'Parafoudre' },
  { value: 'meter', label: 'Compteur' },
  { value: 'socket', label: 'Prise' },
];

export const CUSTOM_POLES: DevicePoles[] = ['1P', '1P+N', '2P', '3P', '3P+N', '4P'];

export const loadCustomDevices = (): CustomDeviceDef[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_DEVICES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomDevices = (list: CustomDeviceDef[]): void => {
  try {
    localStorage.setItem(CUSTOM_DEVICES_KEY, JSON.stringify(list));
  } catch {
    /* stockage plein : la liste reste en mémoire pour la session */
  }
};
