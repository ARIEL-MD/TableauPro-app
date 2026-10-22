import React, { useState, useEffect } from 'react';
import {
  ElectricalPanelProject,
  ElectricalDevice,
  DinRail,
  TerminalBar,
  DistributionBlock,
  BusbarComb,
  CatalogItem,
  PictogramKey,
  DifferentialType,
  PanelAnnotation,
  CableWire,
} from './types/panel';
import { PRESET_TEMPLATES, ELECTRICAL_CATALOG } from './data/componentsCatalog';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { BottomDrawer } from './components/BottomDrawer';
import { AppMenuDrawer } from './components/AppMenuDrawer';
import { DeviceToolbar } from './components/DeviceToolbar';
import { BOMModal } from './components/BOMModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { FileText } from 'lucide-react';
import { WireRouteBar } from './components/WireRouteBar';
import type { WirePreview } from './components/CableOverlay';
import {
  BASE_STEP,
  STEP_DEFAULT,
  addJog,
  innerOf,
  isLastSegment,
  moveSegment,
  segmentCount,
  withInner,
} from './components/wireRoute';
import type { Pt, WireDir } from './components/wireRoute';

const STORAGE_KEY = 'tableaupro_current_project';
const PROJECTS_STORAGE_KEY = 'tableaupro_projects';

const createEmptyProject = (title = 'Project 1'): ElectricalPanelProject => {
  const now = new Date().toISOString();
  return {
    id: 'proj-' + Date.now(),
    version: '1.3.0',
    title,
    clientName: '',
    location: '',
    dateCreated: now,
    dateUpdated: now,
    standard: 'NF C 15-100',
    enclosure: {
      name: 'Coffret modulaire',
      rows: 0,
      modulesPerRow: 18,
      brand: '',
      hasDoor: false,
      ipRating: '',
      ikRating: '',
    },
    rails: [],
    devices: [],
    busbars: [],
    distributionBlocks: [],
    terminalBars: [],
    annotations: [],
  };
};

export default function App() {
  // Initial project state: restore the current project, otherwise open a blank electrical board.
  // Les captures de référence montrent un canevas vide au premier lancement : aucun rail,
  // aucun appareil et aucune borne ne sont pré-remplis.
  const [project, setProject] = useState<ElectricalPanelProject>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved project', e);
      }
    }
    return createEmptyProject();
  });

  // Multi-project library used by the "Projets" sheet shown in the reference captures.
  const [projects, setProjects] = useState<ElectricalPanelProject[]>(() => {
    const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse project library', e);
      return [];
    }
  });
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

  // Undo / Redo history
  const [history, setHistory] = useState<ElectricalPanelProject[]>([]);
  const [redoStack, setRedoStack] = useState<ElectricalPanelProject[]>([]);

  // Selection & UI State
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  // Fil en cours : source choisie dans le dialogue, en attente de la borne d'arrivée.
  // Puis, une fois la borne d'arrivée touchée : tracé en cours, réglé aux flèches.
  const [pendingWire, setPendingWire] = useState<{
    from: string;
    color: string;
    colorName: string;
    thickness: CableWire['thickness'];
    to?: string;
    route?: Pt[];
    defaultRoute?: Pt[];
    segment: number;
    step: number;
    hint?: string | null;
  } | null>(null);
  const [selectedRailId, setSelectedRailId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 30, y: 60 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showWiringMode, setShowWiringMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modals
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);

  // Toast notification state (in-place of alerts)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Auto-save current project to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  // Keep the local multi-project library synchronized with the project currently edited.
  useEffect(() => {
    setProjects((previousProjects) => {
      const existingIndex = previousProjects.findIndex((p) => p.id === project.id);
      if (existingIndex >= 0) {
        const next = [...previousProjects];
        next[existingIndex] = project;
        return next;
      }
      return [...previousProjects, project];
    });
  }, [project]);

  useEffect(() => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Update project with undo history recording
  const updateProjectWithHistory = (updater: (prev: ElectricalPanelProject) => ElectricalPanelProject) => {
    setProject((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      setHistory((h) => [...h.slice(-20), prev]);
      setRedoStack([]);
      return { ...next, dateUpdated: new Date().toISOString() };
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((r) => [project, ...r]);
    setHistory((h) => h.slice(0, -1));
    setProject(previous);
    showToast('Action annulée');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [...h, project]);
    setProject(next);
    showToast('Action rétablie');
  };

  // Currently selected device
  const selectedDevice = project.devices.find((d) => d.id === selectedDeviceId) || null;

  // Add DIN rail
  const handleAddRailByLength = (lengthMm: number) => {
    // 1 DIN module = ~18mm
    const capacityModules = Math.max(4, Math.floor(lengthMm / 18));
    updateProjectWithHistory((prev) => {
      const newOrder = prev.rails.length + 1;
      const newRail: DinRail = {
        id: `rail-${Date.now()}`,
        order: newOrder,
        label: `Rangée ${newOrder}`,
        capacityModules,
        lengthMm,
        x: 60,
        y: 120 + (newOrder - 1) * 150,
      };
      showToast(`Rail DIN ${lengthMm} mm (${capacityModules}M) ajouté`);
      return {
        ...prev,
        enclosure: {
          ...prev.enclosure,
          rows: prev.rails.length + 1,
          modulesPerRow: Math.max(prev.enclosure.modulesPerRow, capacityModules),
        },
        rails: [...prev.rails, newRail],
      };
    });
  };

  // Add Device by generic type from BottomDrawer
  const handleAddDeviceByType = (deviceType: string, options?: any) => {
    updateProjectWithHistory((prev) => {
      let rails = [...prev.rails];

      // Auto-create initial rail if none exists
      if (rails.length === 0) {
        const initialRail: DinRail = {
          id: `rail-${Date.now()}`,
          order: 1,
          label: 'Rangée 1',
          capacityModules: 18,
          lengthMm: 300,
          x: 60,
          y: 120,
        };
        rails.push(initialRail);
      }

      // Determine width & characteristics
      // Determine width & authentic characteristics based on real devices
      let moduleWidth = 1;
      let category: ElectricalDevice['category'] = 'breaker';
      let poles: ElectricalDevice['poles'] = '1P+N';
      let calibre: ElectricalDevice['calibre'] = 16;
      let curve: ElectricalDevice['curve'] = 'C';
      let manufacturer = 'Schneider Electric';
      let modelSeries = 'Resi9';
      let reference = 'R9FS616';
      let name = `Disjoncteur ${deviceType}`;
      let circuitLabel = 'Circuit Prises';
      let differentialSensibility: number | undefined = undefined;
      let differentialType: DifferentialType | undefined = undefined;
      let assignedPictogram: PictogramKey = 'socket';
      let contactorState: 'AUTO' | '1' | '0' | undefined = undefined;
      let cartridgeState: 'good' | 'replace' | undefined = undefined;
      let breakingCapacity: '4.5 kA' | '6 kA' | '10 kA' = '4.5 kA';
      let ratedVoltage: '230V' | '400V' = '230V';
      let meterKwh: number | undefined = undefined;
      let indicatorColor: ElectricalDevice['indicatorColor'] = undefined;
      let indicatorCount: number | undefined = undefined;
      // Couleur du liseré choisie dans le tiroir (disjoncteurs, différentiels, RCBO, sectionneurs)
      const colorTag: ElectricalDevice['colorTag'] = ['red', 'green', 'blue', 'orange', 'yellow'].includes(options?.color)
        ? options.color
        : undefined;

      if (deviceType === 'MCB 1P' || deviceType === 'MCB 1P + N') {
        moduleWidth = 1;
        poles = '1P+N';
        name = 'Disjoncteur 16A Courbe C';
        manufacturer = 'Legrand';
        modelSeries = 'Drivia';
        reference = '406774';
        calibre = 16;
        curve = 'C';
        circuitLabel = 'Prises Séjour';
        assignedPictogram = 'socket';
      } else if (deviceType === 'MCB 2P') {
        moduleWidth = 2;
        poles = '2P';
        name = 'Disjoncteur Bipolaire 2P 16A';
        manufacturer = 'Schneider Electric';
        modelSeries = 'Acti9';
        reference = 'A9F74216';
        calibre = 16;
        circuitLabel = 'Chauffage / Convecteur';
        assignedPictogram = 'ventilation';
      } else if (deviceType === 'MCB 3P') {
        moduleWidth = 3;
        poles = '3P';
        name = 'Disjoncteur Triphasé 3P 20A';
        manufacturer = 'Schneider Electric';
        modelSeries = 'Acti9';
        reference = 'A9F74320';
        calibre = 20;
        curve = 'D';
        breakingCapacity = '6 kA';
        ratedVoltage = '400V';
        circuitLabel = 'Moteur / Pompe Tri';
        assignedPictogram = 'motor';
      } else if (deviceType === 'MCB 4P') {
        moduleWidth = 4;
        poles = '4P';
        name = 'Disjoncteur Tétrapolaire 4P 32A';
        manufacturer = 'Schneider Electric';
        modelSeries = 'Acti9';
        reference = 'A9F74432';
        calibre = 32;
        curve = 'C';
        breakingCapacity = '6 kA';
        ratedVoltage = '400V';
        circuitLabel = 'Arrivée Triphasé 400V';
        assignedPictogram = 'house';
      } else if (deviceType.startsWith('RCCB')) {
        category = 'differential';
        if (deviceType.includes('4P')) {
          moduleWidth = 4;
          poles = '4P';
          name = 'Inter Différentiel Tétrapolaire 40A 30mA';
          manufacturer = 'Schneider Electric';
          modelSeries = 'Acti9';
          reference = 'A9R11440';
          calibre = 40;
          differentialSensibility = 30;
          differentialType = 'A';
          ratedVoltage = '400V';
          circuitLabel = 'Tête Triphasée 400V';
          assignedPictogram = 'motor';
        } else {
          moduleWidth = 2;
          poles = '1P+N';
          name = 'Inter Différentiel 40A 30mA Type A';
          manufacturer = 'Legrand';
          modelSeries = 'Drivia';
          reference = '411631';
          calibre = 40;
          differentialSensibility = 30;
          differentialType = 'A';
          circuitLabel = 'Différentiel Type A (Cuisine)';
          assignedPictogram = 'cooktop';
        }
      } else if (deviceType.startsWith('RCBO')) {
        category = 'rcbo';
        if (deviceType.includes('4P')) {
          moduleWidth = 4;
          poles = '4P';
          name = 'Disjoncteur Diff. 4P 20A 30mA';
          manufacturer = 'Schneider Electric';
          reference = 'A9D31720';
          calibre = 20;
          ratedVoltage = '400V';
        } else {
          const oneN = deviceType.includes('1P');
          moduleWidth = oneN ? 1 : 2;
          poles = oneN ? '1P+N' : '2P';
          name = 'Disjoncteur Différentiel 16A 30mA';
          manufacturer = 'Legrand';
          modelSeries = 'Drivia';
          reference = '410754';
          calibre = 16;
        }
        differentialSensibility = 30;
        differentialType = 'A';
        circuitLabel = 'Borne VE / Prise Ext.';
        assignedPictogram = 'ev_charger';
      } else if (deviceType.startsWith('SD') || deviceType.includes('Sectionneur')) {
        category = 'switch_disconnector';
        const p = deviceType.includes('4P') ? '4P' : deviceType.includes('3P') ? '3P' : '2P';
        moduleWidth = p === '4P' ? 4 : p === '3P' ? 3 : 2;
        poles = p as ElectricalDevice['poles'];
        name = `Sectionneur Général ${p} 63A`;
        manufacturer = 'Legrand';
        reference = '406437';
        calibre = 63;
        circuitLabel = 'Coupure Générale';
        assignedPictogram = 'house';
      } else if (deviceType.includes('Contacteur')) {
        category = 'contactor';
        if (deviceType.includes('4NO')) {
          // Contacteur 4 contacts NO : 4 modules, dessiné comme dans le tiroir
          name = 'Contacteur 4NO 40A';
          manufacturer = 'Générique';
          modelSeries = '';
          reference = 'REF-CONT-4NO';
          moduleWidth = 4;
          poles = '4P';
          calibre = 40;
          contactorState = 'AUTO';
          circuitLabel = 'Contacteur 4 pôles';
          assignedPictogram = 'boiler';
        } else {
          name = 'Contacteur Heures Creuses J/N 20A';
          manufacturer = 'Legrand';
          modelSeries = 'Drivia';
          reference = '412501';
          moduleWidth = 1;
          poles = '2P';
          calibre = 20;
          contactorState = 'AUTO';
          circuitLabel = 'Chauffe-eau J/N';
          assignedPictogram = 'boiler';
        }
      } else if (deviceType.includes('Télérupteur')) {
        category = 'impulse_relay';
        name = 'Télérupteur Silencieux 16A';
        manufacturer = 'Legrand';
        modelSeries = 'Drivia';
        reference = '412408';
        moduleWidth = 1;
        poles = '1P';
        calibre = 16;
        circuitLabel = 'Éclairage Poussoirs';
        assignedPictogram = 'lighting';
      } else if (deviceType.includes('SPD') || deviceType.includes('Parafoudre')) {
        category = 'surge_arrester';
        name = 'Parafoudre Type 2 Débrochable';
        manufacturer = 'Legrand';
        modelSeries = 'Drivia';
        reference = '412224';
        moduleWidth = 2;
        poles = '1P+N';
        calibre = 20;
        cartridgeState = 'good';
        circuitLabel = 'Protection Foudre';
        assignedPictogram = 'earth';
      } else if (deviceType.includes('Prise') || deviceType === 'Socket') {
        category = 'socket';
        name = 'Prise Modulaire 2P+T 16A';
        manufacturer = 'Legrand';
        modelSeries = 'Drivia';
        reference = '412891';
        moduleWidth = 2;
        poles = '2P';
        calibre = 16;
        circuitLabel = 'Prise de Tableau';
        assignedPictogram = 'socket';
      } else if (deviceType.includes('triphas')) {
        category = 'meter';
        name = 'Compteur d’énergie triphasé';
        manufacturer = 'Générique';
        modelSeries = '';
        reference = 'REF-CPT-3P';
        moduleWidth = 7;
        poles = '3P+N';
        calibre = 63;
        ratedVoltage = '400V';
        meterKwh = 0;
        circuitLabel = 'Comptage Triphasé';
        assignedPictogram = 'solar';
      } else if (deviceType.includes('Compteur') || deviceType === 'Meter') {
        category = 'meter';
        name = 'Compteur d’énergie monophasé';
        manufacturer = 'Générique';
        modelSeries = '';
        reference = 'REF-CPT-1P';
        moduleWidth = 5;
        poles = '1P+N';
        calibre = 45;
        meterKwh = 482.6;
        circuitLabel = 'Comptage Énergie';
        assignedPictogram = 'solar';
      } else if (deviceType.startsWith('Relais de tension') || deviceType === 'VoltageRelay') {
        // Les références ci-dessous sont génériques : à remplacer par la référence réelle dans l'inspecteur.
        const three = deviceType.includes('3');
        category = 'voltage_relay';
        name = three ? 'Relais de tension triphasé' : 'Relais de tension monophasé';
        manufacturer = 'Générique';
        modelSeries = '';
        reference = three ? 'REF-RT-3P' : 'REF-RT-1P';
        moduleWidth = three ? 4 : 2;
        poles = three ? '3P+N' : '1P+N';
        calibre = undefined;
        ratedVoltage = three ? '400V' : '230V';
        circuitLabel = 'Contrôle de tension';
        assignedPictogram = 'alarm';
      } else if (deviceType.startsWith('Relais temporisé') || deviceType === 'Timer') {
        const digital = deviceType.includes('numérique');
        category = 'time_relay';
        name = digital ? 'Relais temporisé numérique' : 'Relais temporisé électromécanique';
        manufacturer = 'Générique';
        modelSeries = '';
        reference = digital ? 'REF-RTEMP-NUM' : 'REF-RTEMP-EM';
        moduleWidth = digital ? 2 : 3;
        poles = '1P+N';
        calibre = 16;
        circuitLabel = 'Temporisation';
        assignedPictogram = 'ventilation';
      } else if (deviceType.startsWith('AFDD')) {
        const withRcbo = deviceType.includes('RCBO');
        category = 'afdd';
        name = withRcbo ? 'AFDD + disjoncteur différentiel 16A 30mA' : 'AFDD + disjoncteur 16A';
        manufacturer = 'Générique';
        modelSeries = '';
        reference = withRcbo ? 'REF-AFDD-RCBO' : 'REF-AFDD-MCB';
        moduleWidth = withRcbo ? 3 : 2;
        poles = '1P+N';
        calibre = 16;
        curve = 'C';
        if (withRcbo) {
          differentialSensibility = 30;
          differentialType = 'A';
        }
        circuitLabel = 'Protection arc électrique';
        assignedPictogram = 'bedroom';
      } else if (deviceType === 'Guardmotor') {
        category = 'motor_starter';
        name = 'Disjoncteur-moteur Guardmotor 3P';
        manufacturer = 'Générique';
        modelSeries = '';
        reference = 'REF-GM-3P';
        moduleWidth = 2;
        poles = '3P';
        calibre = 10;
        ratedVoltage = '400V';
        circuitLabel = 'Départ moteur';
        assignedPictogram = 'motor';
      } else if (deviceType.startsWith('Interrupteur-sectionneur inverseur')) {
        category = 'changeover';
        name = 'Interrupteur-sectionneur inverseur 63A';
        manufacturer = 'Générique';
        modelSeries = '';
        reference = 'REF-INV-63';
        moduleWidth = 4;
        poles = '4P';
        calibre = 63;
        ratedVoltage = '400V';
        circuitLabel = 'Inverseur Réseau / Groupe';
        assignedPictogram = 'house';
      } else if (deviceType.includes('Voyant')) {
        category = 'indicator';
        name = 'Voyant Modulaire LED';
        manufacturer = 'Legrand';
        reference = '412901';
        moduleWidth = 1;
        poles = '1P+N';
        calibre = 2;
        circuitLabel = 'Présence Tension';
        assignedPictogram = 'lighting';
        if (options?.color) indicatorColor = options.color;
        if (options?.count) {
          indicatorCount = options.count;
          moduleWidth = options.count; // une lampe par module
        }
      }

      // Target selected rail or find first with available space
      let targetRail = rails.find((r) => r.id === selectedRailId);
      if (!targetRail) {
        targetRail = rails[0];
      }

      let railDevices = prev.devices.filter((d) => d.railId === targetRail!.id);
      let slot = 0;
      let foundSlot = false;

      while (slot + moduleWidth <= targetRail.capacityModules) {
        const isCollision = railDevices.some((d) => {
          return !(slot + moduleWidth <= d.slotIndex || slot >= d.slotIndex + d.moduleWidth);
        });
        if (!isCollision) {
          foundSlot = true;
          break;
        }
        slot++;
      }

      // If full on current rail, try other rails
      if (!foundSlot) {
        for (const otherRail of rails) {
          const otherDevices = prev.devices.filter((d) => d.railId === otherRail.id);
          let candidateSlot = 0;
          while (candidateSlot + moduleWidth <= otherRail.capacityModules) {
            const isCollision = otherDevices.some((d) => {
              return !(candidateSlot + moduleWidth <= d.slotIndex || candidateSlot >= d.slotIndex + d.moduleWidth);
            });
            if (!isCollision) {
              targetRail = otherRail;
              railDevices = otherDevices;
              slot = candidateSlot;
              foundSlot = true;
              break;
            }
            candidateSlot++;
          }
          if (foundSlot) break;
        }
      }

      // If all existing rails full, create a new rail automatically
      if (!foundSlot) {
        const newOrder = rails.length + 1;
        const newAutoRail: DinRail = {
          id: `rail-${Date.now()}`,
          order: newOrder,
          label: `Rangée ${newOrder}`,
          capacityModules: 18,
          lengthMm: 300,
          x: 60,
          y: 120 + (newOrder - 1) * 150,
        };
        rails.push(newAutoRail);
        targetRail = newAutoRail;
        slot = 0;
      }

      const newDevice: ElectricalDevice = {
        id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        railId: targetRail.id,
        slotIndex: slot,
        moduleWidth,
        category,
        name,
        reference,
        manufacturer,
        modelSeries,
        poles,
        calibre,
        curve,
        breakingCapacity,
        ratedVoltage,
        differentialSensibility,
        differentialType,
        circuitLabel,
        assignedPictogram,
        contactorState,
        cartridgeState,
        meterKwh,
        wireGauge: (calibre ?? 0) >= 32 ? '6mm²' : (calibre ?? 0) >= 20 ? '2.5mm²' : '1.5mm²',
        indicatorColor,
        indicatorCount,
        colorTag: category === 'breaker' || category === 'differential' || category === 'rcbo' || category === 'switch_disconnector' ? colorTag : undefined,
        isOn: true,
        free: true,
        x: 120 + (prev.devices.filter((d) => d.free).length % 6) * 200,
        y: 160 + Math.floor(prev.devices.filter((d) => d.free).length / 6) * 170,
      };

      showToast(`${name} ajouté sur le plan`);

      return {
        ...prev,
        devices: [...prev.devices, newDevice],
      };
    });
  };

  // Déplacer un appareil libre sur le plan
  const handleMoveFreeDevice = (id: string, x: number, y: number) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => (d.id === id ? { ...d, x, y } : d)),
    }));
  };

  // Add terminal bar
  const handleAddTerminalBar = (type: 'screw' | 'spring' | 'simple' | 'custom', holes: number, color?: string) => {
    updateProjectWithHistory((prev) => {
      const barType = color === 'green' ? 'earth' : color === 'blue' ? 'neutral' : 'phase';
      const newBar: TerminalBar = {
        id: `term-${Date.now()}`,
        type: barType,
        holesCount: (holes as any) || 8,
        subType: type === 'custom' ? 'custom_contacts' : type,
        color,
        x: 60 + prev.terminalBars.length * 150,
        y: 40,
      };
      showToast(`Bornier ${barType === 'earth' ? 'Terre' : barType === 'neutral' ? 'Neutre' : 'Phase'} (${holes} contacts) ajouté`);
      return {
        ...prev,
        terminalBars: [...prev.terminalBars, newBar],
      };
    });
  };

  // Add distribution block
  const handleAddDistributionBlock = (config: '2x7' | '2x11' | '2x15' | '4x7' | '4x11' | '4x15') => {
    updateProjectWithHistory((prev) => {
      const is4P = config.startsWith('4');
      const newBlock: DistributionBlock = {
        id: `distrib-${Date.now()}`,
        name: is4P ? `Répartiteur Étagé 4P (${config})` : `Répartiteur Étagé 2P (${config})`,
        configuration: config,
        poles: is4P ? '4P' : '2P',
        maxCurrentAmps: config === '4x15' ? 160 : 125,
        x: 420,
        y: 40,
      };
      showToast(`Bloc de distribution ${config} ajouté`);
      return {
        ...prev,
        distributionBlocks: [...prev.distributionBlocks, newBlock],
      };
    });
  };

  // Add Busbar Comb
  const handleAddBusbarComb = (poles: 1 | 2 | 3 | 4, length: number, config: string) => {
    updateProjectWithHistory((prev) => {
      const targetRail = prev.rails.find((r) => r.id === selectedRailId) || prev.rails[0];
      if (!targetRail) {
        showToast('Ajoutez d’abord un rail DIN pour y fixer le peigne');
        return prev;
      }

      const existingCombIdx = prev.busbars.findIndex((b) => b.railId === targetRail.id);
      const combType =
        poles === 1
          ? '1P_Phase'
          : poles === 2
          ? '2P_LN'
          : poles === 3
          ? '3P_L1L2L3'
          : '4P_3PN';

      const newComb: BusbarComb = {
        id: `bus-${Date.now()}`,
        railId: targetRail.id,
        type: combType,
        config: config || 'L, N',
        startSlot: 0,
        moduleLength: Math.min(length, targetRail.capacityModules),
      };

      const newBusbars = [...prev.busbars];
      if (existingCombIdx >= 0) {
        newBusbars[existingCombIdx] = newComb;
      } else {
        newBusbars.push(newComb);
      }

      showToast(`Peigne de raccordement (${config}) posé sur ${targetRail.label}`);
      return {
        ...prev,
        busbars: newBusbars,
      };
    });
  };

  // Assign pictogram to selected device
  const handleAssignPictogramToSelected = (pic: PictogramKey) => {
    // Un appareil est sélectionné : on lui assigne le pictogramme.
    if (selectedDeviceId) {
      updateProjectWithHistory((prev) => ({
        ...prev,
        devices: prev.devices.map((d) =>
          d.id === selectedDeviceId ? { ...d, assignedPictogram: pic } : d
        ),
      }));
      showToast('Pictogramme appliqué à l’appareil sélectionné');
      return;
    }
    // Sinon : on le pose librement sur le plan.
    handleAddAnnotation('pictogram', pic);
  };

  // ---- Objets libres du plan : texte, tableau, pictogramme ----
  const handleAddAnnotation = (kind: PanelAnnotation['kind'], pictogram?: PictogramKey) => {
    updateProjectWithHistory((prev) => {
      const list = prev.annotations ?? [];
      // Placé au centre de la zone visible, légèrement décalé pour ne pas empiler les objets
      const offset = (list.length % 6) * 24;
      const x = Math.round((window.innerWidth / 2 - pan.x) / zoom - 80 + offset);
      const y = Math.round((window.innerHeight * 0.3 - pan.y) / zoom + offset);
      const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      let item: PanelAnnotation;
      if (kind === 'text') {
        item = { id, kind, x, y, text: 'Texte', fontScale: 1.6, fieldWidth: 6, textColor: '#000000', background: 'none' };
      } else if (kind === 'table') {
        item = { id, kind, x, y, cells: [['', ''], ['', ''], ['', '']] };
      } else {
        item = { id, kind, x, y, pictogram: pictogram || 'lighting', size: 48 };
      }
      showToast(kind === 'text' ? 'Texte ajouté — touchez le crayon pour le modifier' : kind === 'table' ? 'Tableau ajouté' : 'Pictogramme posé sur le plan');
      return { ...prev, annotations: [...list, item] };
    });
  };

  const handleUpdateAnnotation = (id: string, patch: Partial<PanelAnnotation>) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      annotations: (prev.annotations ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  };

  const handleDuplicateAnnotation = (id: string) => {
    updateProjectWithHistory((prev) => {
      const list = prev.annotations ?? [];
      const src = list.find((a) => a.id === id);
      if (!src) return prev;
      const copy: PanelAnnotation = {
        ...src,
        id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: src.x + 24,
        y: src.y + 24,
        locked: false,
        cells: src.cells?.map((row) => [...row]),
      };
      return { ...prev, annotations: [...list, copy] };
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      annotations: (prev.annotations ?? []).filter((a) => a.id !== id),
    }));
    showToast('Objet supprimé');
  };

  // Toggle device switch ON/OFF
  const handleToggleDeviceSwitch = (deviceId: string) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      devices: prev.devices.map((d) =>
        d.id === deviceId ? { ...d, isOn: d.isOn === false ? true : false } : d
      ),
    }));
  };

  // Update device properties
  const handleUpdateDevice = (updated: ElectricalDevice) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => (d.id === updated.id ? updated : d)),
    }));
    showToast(`Paramètres de "${updated.name}" mis à jour`);
  };

  // Delete device
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const handleStartWire = (fromAnchor: string, draft: { color: string; colorName: string; thickness: CableWire['thickness'] }) => {
    setPendingWire({ from: fromAnchor, ...draft, segment: 0, step: STEP_DEFAULT });
    setSelectedDeviceId(null);
  };

  // Borne d'arrivée touchée : on ouvre le réglage du tracé aux flèches.
  const handleSelectWireTarget = (toAnchor: string, route: Pt[]) => {
    if (!pendingWire) return;
    if (toAnchor === pendingWire.from) {
      showToast("Choisissez une autre borne pour l'arrivée");
      return;
    }
    setPendingWire({
      ...pendingWire,
      to: toAnchor,
      route,
      defaultRoute: route,
      segment: 0,
      step: STEP_DEFAULT,
      hint: null,
    });
  };

  const handleMoveWire = (wireId: string, pts: Pt[]) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      wires: (prev.wires ?? []).map((w) => (w.id === wireId ? { ...w, route: pts } : w)),
    }));
  };

  const handleConfirmWire = () => {
    if (!pendingWire?.to || !pendingWire.route) return;
    const wire: CableWire = {
      id: `wire-${Date.now()}`,
      from: pendingWire.from,
      to: pendingWire.to,
      color: pendingWire.color,
      colorName: pendingWire.colorName,
      thickness: pendingWire.thickness,
      route: pendingWire.route,
    };
    updateProjectWithHistory((prev) => ({ ...prev, wires: [...(prev.wires ?? []), wire] }));
    setPendingWire(null);
    showToast(`Fil ${wire.colorName} connecté`);
  };

  // Réglage du tracé aux flèches
  const moveWireSegment = (dir: WireDir) => {
    if (!pendingWire?.route) return;
    const res = moveSegment(innerOf(pendingWire.route), pendingWire.segment, dir, BASE_STEP * pendingWire.step);
    if (!res.ok) {
      setPendingWire({ ...pendingWire, hint: res.reason });
      return;
    }
    setPendingWire({ ...pendingWire, route: withInner(pendingWire.route, res.inner), hint: null });
  };

  const jogWireSegment = () => {
    if (!pendingWire?.route) return;
    const res = addJog(innerOf(pendingWire.route), pendingWire.segment, BASE_STEP * pendingWire.step);
    if (!res.ok) {
      setPendingWire({ ...pendingWire, hint: res.reason });
      return;
    }
    setPendingWire({
      ...pendingWire,
      route: withInner(pendingWire.route, res.inner),
      segment: pendingWire.segment + 1, // le coude ajouté devient le segment actif
      hint: null,
    });
  };

  const resetWireRoute = () => {
    if (!pendingWire?.defaultRoute) return;
    setPendingWire({ ...pendingWire, route: pendingWire.defaultRoute, segment: 0, hint: null });
  };

  const wirePreview: WirePreview | null =
    pendingWire?.to && pendingWire.route
      ? {
          from: pendingWire.from,
          to: pendingWire.to,
          color: pendingWire.color,
          thickness: pendingWire.thickness,
          route: pendingWire.route,
        }
      : null;

  const handleDeleteWire = (wireId: string) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      wires: (prev.wires ?? []).filter((w) => w.id !== wireId),
    }));
  };

  const handleDeleteDevice = (deviceId: string) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      devices: prev.devices.filter((d) => d.id !== deviceId),
      wires: (prev.wires ?? []).filter(
        (w) => !w.from.startsWith(`dev:${deviceId}:`) && !w.to.startsWith(`dev:${deviceId}:`)
      ),
    }));
    if (selectedDeviceId === deviceId) {
      setSelectedDeviceId(null);
    }
    showToast('Appareil supprimé du tableau');
  };

  // Duplicate device
  const handleDuplicateDevice = (source: ElectricalDevice) => {
    updateProjectWithHistory((prev) => {
      const rail = prev.rails.find((r) => r.id === source.railId);
      if (!rail) return prev;

      const railDevices = prev.devices.filter((d) => d.railId === rail.id);
      let targetSlot = source.slotIndex + source.moduleWidth;

      while (targetSlot + source.moduleWidth <= rail.capacityModules) {
        const isCollision = railDevices.some((d) => {
          return !(targetSlot + source.moduleWidth <= d.slotIndex || targetSlot >= d.slotIndex + d.moduleWidth);
        });
        if (!isCollision) break;
        targetSlot++;
      }

      if (targetSlot + source.moduleWidth > rail.capacityModules) {
        showToast('Espace insuffisant sur ce rail pour dupliquer');
        return prev;
      }

      const dup: ElectricalDevice = {
        ...source,
        id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        slotIndex: targetSlot,
        circuitLabel: `${source.circuitLabel || source.name} (Copie)`,
      };

      setSelectedDeviceId(dup.id);
      showToast(`Appareil dupliqué sur le slot ${targetSlot + 1}`);
      return {
        ...prev,
        devices: [...prev.devices, dup],
      };
    });
  };

  // Move device left or right on rail
  const handleMoveDevice = (deviceId: string, direction: 'left' | 'right') => {
    updateProjectWithHistory((prev) => {
      const dev = prev.devices.find((d) => d.id === deviceId);
      if (!dev) return prev;
      const rail = prev.rails.find((r) => r.id === dev.railId);
      if (!rail) return prev;

      const newSlot = direction === 'left' ? Math.max(0, dev.slotIndex - 1) : Math.min(rail.capacityModules - dev.moduleWidth, dev.slotIndex + 1);
      if (newSlot === dev.slotIndex) return prev;

      return {
        ...prev,
        devices: prev.devices.map((d) => (d.id === deviceId ? { ...d, slotIndex: newSlot } : d)),
      };
    });
  };

  // Delete rail
  const handleDeleteRail = (railId: string) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      rails: prev.rails.filter((r) => r.id !== railId),
      devices: prev.devices.filter((d) => d.railId !== railId),
      busbars: prev.busbars.filter((b) => b.railId !== railId),
      enclosure: {
        ...prev.enclosure,
        rows: Math.max(0, prev.rails.length - 1),
      },
    }));
    if (selectedRailId === railId) setSelectedRailId(null);
    showToast('Rail DIN supprimé');
  };

  // Delete terminal bar
  const handleDeleteTerminalBar = (id: string) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      terminalBars: prev.terminalBars.filter((t) => t.id !== id),
    }));
    showToast('Bornier supprimé');
  };

  // Delete distribution block
  const handleDeleteDistributionBlock = (id: string) => {
    updateProjectWithHistory((prev) => ({
      ...prev,
      distributionBlocks: prev.distributionBlocks.filter((d) => d.id !== id),
    }));
    showToast('Bloc de distribution supprimé');
  };

  // Load preset template
  const handleLoadTemplate = (templateKey: string) => {
    const template = PRESET_TEMPLATES[templateKey];
    if (!template) return;

    updateProjectWithHistory((prev) => ({
      ...prev,
      title: template.title || prev.title,
      standard: template.standard || prev.standard,
      enclosure: template.enclosure || prev.enclosure,
      rails: (template.rails as DinRail[]) || [],
      devices: (template.devices as ElectricalDevice[]) || [],
      busbars: (template.busbars as BusbarComb[]) || [],
      distributionBlocks: (template.distributionBlocks as DistributionBlock[]) || [],
      terminalBars: (template.terminalBars as TerminalBar[]) || [],
      annotations: [],
      dateUpdated: new Date().toISOString(),
    }));
    setSelectedDeviceId(null);
    setSelectedRailId(null);
    showToast(`Modèle "${template.title}" chargé avec succès`);
  };

  // Create new template from scratch
  const handleCreateNewTemplate = () => {
    handleResetProject();
    showToast('Nouveau gabarit prêt à être personnalisé');
  };

  // Export JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.replace(/\s+/g, '_')}.tableaupro.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Fichier projet téléchargé (.json)');
  };

  // Import JSON file
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.rails && parsed.devices) {
          updateProjectWithHistory(() => ({ ...parsed, annotations: parsed.annotations ?? [] }));
          showToast('Projet importé avec succès !');
        } else {
          showToast('Format JSON invalide');
        }
      } catch (err) {
        showToast('Erreur de lecture du fichier JSON');
      }
    };
    reader.readAsText(file);
  };

  // Reset to a genuinely empty board: the user builds the electrical project from scratch.
  const handleResetProject = () => {
    updateProjectWithHistory(() => createEmptyProject('Nouveau projet'));
    setSelectedDeviceId(null);
    setSelectedRailId(null);
    showToast('Nouveau projet vide prêt');
  };

  const clearWorkspaceSelectionAndHistory = () => {
    setSelectedDeviceId(null);
    setSelectedRailId(null);
    setHistory([]);
    setRedoStack([]);
  };

  const handleOpenSavedProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    setProject(target);
    clearWorkspaceSelectionAndHistory();
    setIsProjectManagerOpen(false);
    showToast(`Projet "${target.title}" ouvert`);
  };

  const handleCreateSavedProject = () => {
    const nextProject = createEmptyProject(`Project ${projects.length + 1}`);
    setProject(nextProject);
    clearWorkspaceSelectionAndHistory();
    setIsProjectManagerOpen(false);
    showToast('Nouveau projet vide créé');
  };

  const handleDuplicateSavedProject = (projectId: string) => {
    const source = projects.find((p) => p.id === projectId);
    if (!source) return;
    const now = new Date().toISOString();
    const duplicate: ElectricalPanelProject = {
      ...source,
      id: `proj-${Date.now()}-copy`,
      title: `${source.title} copie`,
      dateCreated: now,
      dateUpdated: now,
    };
    setProjects((prev) => [...prev, duplicate]);
    showToast(`Projet "${source.title}" dupliqué`);
  };

  const handleDeleteSavedProject = (projectId: string) => {
    const remainingProjects = projects.filter((p) => p.id !== projectId);
    setProjects(remainingProjects);

    if (project.id === projectId) {
      const nextProject = remainingProjects[0] ?? createEmptyProject('Project 1');
      setProject(nextProject);
      clearWorkspaceSelectionAndHistory();
    }
    showToast('Projet supprimé');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f6f6f4] font-sans text-slate-800 select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl border border-slate-700/80 backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main CAD Interactive Canvas Area */}
      <main className="w-full h-full relative overflow-hidden">
        <CanvasWorkspace
          project={project}
          onMoveFreeDevice={handleMoveFreeDevice}
          selectedWireId={selectedWireId}
          onSelectWire={setSelectedWireId}
          onMoveWire={handleMoveWire}
          selectedDeviceId={selectedDeviceId || undefined}
          selectedRailId={selectedRailId || undefined}
          showWiringMode={showWiringMode}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          zoom={zoom}
          pan={pan}
          onZoomChange={setZoom}
          onPanChange={setPan}
          onSelectDevice={(device) => {
            setSelectedDeviceId(device ? device.id : null);
            if (device) setSelectedRailId(device.railId);
          }}
          onSelectRail={(railId) => setSelectedRailId(railId)}
          onToggleDeviceSwitch={handleToggleDeviceSwitch}
          pendingWireFrom={pendingWire?.from ?? null}
          pendingWireLabel={pendingWire ? `Fil ${pendingWire.colorName} : touchez la borne d'arrivée` : undefined}
          pendingWireTo={!!pendingWire?.to}
          pendingWirePreview={wirePreview}
          onSelectWireTarget={handleSelectWireTarget}
          onCancelWire={() => setPendingWire(null)}
          onDropCatalogItemOnRail={() => {}}
          onDeleteRail={handleDeleteRail}
          onDeleteTerminalBar={handleDeleteTerminalBar}
          onDeleteDistributionBlock={handleDeleteDistributionBlock}
          onAddDeviceToRailQuick={(railId) => {
            setSelectedRailId(railId);
            handleAddDeviceByType('MCB 1P');
          }}
          onUpdateTitle={(title) => updateProjectWithHistory((p) => ({ ...p, title }))}
          onUpdateAnnotation={handleUpdateAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          onDuplicateAnnotation={handleDuplicateAnnotation}
          onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
        />

        {/* Side Property Inspector (Slides out when a device is selected) */}
        {selectedDevice && (
          <DeviceToolbar
            device={selectedDevice}
            onStartWire={handleStartWire}
            onClose={() => setSelectedDeviceId(null)}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
            onDuplicateDevice={handleDuplicateDevice}
          />
        )}
      </main>

      {/* Sliding Collapsible Bottom Component Library */}
      <BottomDrawer
        onAddDeviceByType={handleAddDeviceByType}
        onAddRailByLength={handleAddRailByLength}
        onAddTerminalBar={handleAddTerminalBar}
        onAddDistributionBlock={handleAddDistributionBlock}
        onAddBusbarComb={handleAddBusbarComb}
        onAssignPictogramToSelected={handleAssignPictogramToSelected}
        onAddAnnotation={handleAddAnnotation}
        onLoadTemplate={handleLoadTemplate}
        onCreateNewTemplate={handleCreateNewTemplate}
      />

      {/* Project library modal */}
      {isProjectManagerOpen && (
        <ProjectManagerModal
          projects={projects}
          currentProjectId={project.id}
          onClose={() => setIsProjectManagerOpen(false)}
          onOpenProject={handleOpenSavedProject}
          onCreateProject={handleCreateSavedProject}
          onDuplicateProject={handleDuplicateSavedProject}
          onDeleteProject={handleDeleteSavedProject}
          onScanQr={() => showToast('Le scan QR sera connecté dans une prochaine itération')}
        />
      )}

      {/* Hamburger Options Menu Drawer */}
      <AppMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenProjects={() => setIsProjectManagerOpen(true)}
        onNewProject={handleResetProject}
        onSaveJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onPrint={() => window.print()}
        onOpenBOM={() => setIsBOMModalOpen(true)}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showWiringMode={showWiringMode}
        onToggleWiringMode={() => setShowWiringMode(!showWiringMode)}
      />

      {/* Nomenclature (BOM) Modal */}
      {isBOMModalOpen && (
        <BOMModal
          project={project}
          onClose={() => setIsBOMModalOpen(false)}
        />
      )}


      {/* NF C 15-100 Compliance Diagnostic Modal */}

      {/* Réglage du tracé du fil aux flèches (après le choix de la borne d'arrivée) */}
      {pendingWire?.to && pendingWire.route && (
        <WireRouteBar
          colorName={pendingWire.colorName}
          color={pendingWire.color}
          thickness={pendingWire.thickness}
          onColor={(c) => setPendingWire({ ...pendingWire, color: c.hex, colorName: c.name })}
          onThickness={(v) => setPendingWire({ ...pendingWire, thickness: v })}
          segment={pendingWire.segment}
          segmentCount={segmentCount(innerOf(pendingWire.route))}
          isFixed={false}
          step={pendingWire.step}
          hint={pendingWire.hint}
          onSegment={(k) => setPendingWire({ ...pendingWire, segment: k, hint: null })}
          onStep={(v) => setPendingWire({ ...pendingWire, step: v })}
          onMove={moveWireSegment}
          onJog={jogWireSegment}
          onReset={resetWireRoute}
          onCancel={() => setPendingWire(null)}
          onConfirm={handleConfirmWire}
        />
      )}
    </div>
  );
}
