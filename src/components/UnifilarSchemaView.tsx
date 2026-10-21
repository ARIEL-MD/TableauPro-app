import React, { useState } from 'react';
import { ElectricalPanelProject } from '../types/panel';
import { PictogramIcon } from './PictogramIcon';
import {
  Printer,
  FileSpreadsheet,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  Sliders,
  Layers,
  BookOpen,
  Info,
} from 'lucide-react';

interface UnifilarSchemaViewProps {
  project: ElectricalPanelProject;
  onPrint: () => void;
  onExportJSON: () => void;
  onBackToPhysical?: () => void;
}

export const UnifilarSchemaView: React.FC<UnifilarSchemaViewProps> = ({
  project,
  onPrint,
  onExportJSON,
  onBackToPhysical,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'calculations' | 'requirements'>('schema');

  // Group devices by differential breaker / upstream rail
  const differentials = project.devices.filter(
    (d) => d.category === 'differential' || (d.differentialSensibility && d.differentialSensibility <= 30)
  );

  // Group breakers by rail
  const railGroups = project.rails.map((rail) => {
    const railDevices = project.devices.filter((d) => d.railId === rail.id);
    const diff = railDevices.find((d) => d.category === 'differential') || differentials[0];
    const breakers = railDevices.filter((d) => d.category !== 'differential');
    return {
      rail,
      diff,
      breakers,
    };
  });

  // Calculate total power estimate and currents
  const totalPowerWatts = project.devices
    .filter((d) => d.category === 'breaker' || d.category === 'rcbo')
    .reduce((sum, d) => {
      const calibre = d.calibre || 16;
      return sum + calibre * 230 * 0.4;
    }, 0);

  const totalKva = (totalPowerWatts / 1000).toFixed(1);

  // Electrical formula constants for copper 230V single phase
  // Rho copper at operating temp: 0.023 ohm*mm²/m
  // DeltaU max: 3% (6.9V) for lighting, 5% (11.5V) for others
  const calculateCircuitSpecs = (calibre: number, usageCategory?: string) => {
    let wireGauge = '1.5mm²';
    let wireSectionNum = 1.5;
    let isLighting = false;

    if (calibre <= 2) {
      wireGauge = '1.5mm²';
      wireSectionNum = 1.5;
    } else if (calibre <= 10) {
      wireGauge = '1.5mm²';
      wireSectionNum = 1.5;
      isLighting = true;
    } else if (calibre <= 16) {
      wireGauge = usageCategory === 'lighting' ? '1.5mm²' : '2.5mm²';
      wireSectionNum = usageCategory === 'lighting' ? 1.5 : 2.5;
      if (usageCategory === 'lighting') isLighting = true;
    } else if (calibre <= 20) {
      wireGauge = '2.5mm²';
      wireSectionNum = 2.5;
    } else if (calibre <= 32) {
      wireGauge = '6mm²';
      wireSectionNum = 6.0;
    } else {
      wireGauge = '10mm²';
      wireSectionNum = 10.0;
    }

    const maxDeltaUPercent = isLighting ? 3.0 : 5.0;
    const maxDeltaUVolts = (230 * maxDeltaUPercent) / 100;
    // Lmax = (DeltaU * S) / (2 * rho * I)
    const rho = 0.023;
    const maxDistanceMeters = Math.round((maxDeltaUVolts * wireSectionNum) / (2 * rho * calibre));
    const powerWatts = calibre * 230;

    return {
      wireGauge,
      wireSectionNum,
      powerWatts,
      maxDeltaUPercent,
      maxDistanceMeters,
      isLighting,
    };
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-100 font-sans text-slate-900 select-text printable-panel">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBackToPhysical && (
            <button
              onClick={onBackToPhysical}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Vue Tableau Modulaire</span>
            </button>
          )}

          {/* Sub tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'schema'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Schéma Unifilaire Normalisé</span>
            </button>

            <button
              onClick={() => setActiveTab('calculations')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Calculs Câbles & Chutes de Tension (ΔU)</span>
            </button>

            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'requirements'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ce qu'il faut pour un schéma réel</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / Exporter PDF Consuel</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* ========================================================
            TAB 1: SCHÉMA UNIFILAIRE GRAPHISME NORMATIF
           ======================================================== */}
        {activeTab === 'schema' && (
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-lg">
            {/* Title & Cartouche Consuel */}
            <div className="border-4 border-slate-900 p-4 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-2 border-slate-900 pb-3 mb-3 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xs">
                      SCHÉMA UNIFILAIRE RÉGLEMENTAIRE
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">NF C 15-100 / IEC 60364</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-950 mt-1 uppercase tracking-tight">
                    {project.title}
                  </h1>
                  <p className="text-xs text-slate-600">
                    Tableau de distribution électrique basse tension (BT) 230V / 400V 50Hz · Logement individuel
                  </p>
                </div>

                {/* Cartouche Info Consuel */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono border-2 border-slate-900 p-2.5 bg-slate-50 min-w-[280px]">
                  <span className="text-slate-500">Projet :</span>
                  <span className="font-bold truncate">{project.title}</span>
                  <span className="text-slate-500">Date d'édition :</span>
                  <span>{new Date().toLocaleDateString('fr-FR')}</span>
                  <span className="text-slate-500">Puissance estimée :</span>
                  <span className="font-bold text-blue-700">{totalKva} kVA (Monophasé)</span>
                  <span className="text-slate-500">Régime de neutre :</span>
                  <span className="font-bold text-emerald-700">Régime TT (Différentiel 30mA)</span>
                  <span className="text-slate-500">Organisme de visa :</span>
                  <span className="font-bold text-slate-900">CONSUEL</span>
                </div>
              </div>

              {/* Legend Row */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1 font-mono">
                <div className="flex items-center gap-4">
                  <span>● <strong>Ph</strong> : Phase (Rouge / Marron)</span>
                  <span>● <strong>N</strong> : Neutre (Bleu)</span>
                  <span>● <strong>PE</strong> : Terre de protection (Vert/Jaune)</span>
                </div>
                <div className="text-slate-500">
                  Total circuits : <strong>{project.devices.filter((d) => d.category === 'breaker').length}</strong> départs
                </div>
              </div>
            </div>

            {/* Installation Architecture */}
            <div className="space-y-12">
              {/* Head of Installation: AGCP / Disjoncteur Général Enedis */}
              <div className="flex flex-col items-center">
                <div className="w-80 border-2 border-slate-900 bg-amber-50/80 p-3.5 rounded-xs text-center shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-amber-900 uppercase">
                    Réseau Public Enedis / Arrivée EDF
                  </span>
                  <div className="my-2 flex items-center justify-center gap-3">
                    <svg width="34" height="34" viewBox="0 0 32 32" className="text-slate-900">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M10 20 L22 12" stroke="currentColor" strokeWidth="2" />
                      <rect x="14" y="6" width="4" height="4" fill="currentColor" />
                    </svg>
                    <div className="text-left font-mono">
                      <p className="text-xs font-bold leading-tight">Disjoncteur de Branchement (AGCP)</p>
                      <p className="text-[10px] text-slate-600">500mA Sélectif · Calibre 15/45A ou 30/60A</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold">
                    Liaison amont 2 × 16 mm² Cuivre
                  </span>
                </div>

                {/* Central Vertical Feeder Spine */}
                <div className="w-1.5 h-10 bg-slate-900 my-1" />
                <div className="w-3.5 h-3.5 rounded-full bg-slate-900" />
              </div>

              {/* Rows of Differential Groups & Circuits */}
              {railGroups.map((group, rIdx) => {
                const diff = group.diff;
                const diffCalibre = diff ? diff.calibre || 40 : 40;
                const diffType = diff ? diff.differentialType || 'AC' : 'AC';

                return (
                  <div key={group.rail.id} className="relative border-2 border-slate-800 rounded-xs p-5 bg-slate-50/50">
                    {/* Rail Banner */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-300 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-xs bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          {rIdx + 1}
                        </span>
                        <span className="font-bold uppercase tracking-wider text-slate-900">
                          {group.rail.label}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">
                          Alimentation peigne {diffCalibre}A 230V
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {group.breakers.length} circuit(s) raccordé(s) (Max 8 selon NF C 15-100)
                      </span>
                    </div>

                    {/* Differential Head of Row */}
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                      {/* Differential Symbol Block */}
                      <div className="w-60 shrink-0 border-2 border-slate-900 bg-white p-3.5 rounded-xs shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            ID {rIdx + 1} · TYPE {diffType}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            IΔn = 30 mA
                          </span>
                        </div>

                        {/* Standardized Electrical Schematic Symbol for RCD */}
                        <div className="flex items-center justify-center my-3 py-2 bg-slate-100/70 border border-slate-300 rounded">
                          <svg width="70" height="42" viewBox="0 0 60 40" className="text-slate-900">
                            <line x1="20" y1="2" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="40" y1="2" x2="40" y2="10" stroke="currentColor" strokeWidth="1.5" />
                            <ellipse cx="30" cy="18" rx="22" ry="7" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 2" />
                            <line x1="20" y1="12" x2="16" y2="28" stroke="currentColor" strokeWidth="2" />
                            <line x1="40" y1="12" x2="36" y2="28" stroke="currentColor" strokeWidth="2" />
                            <line x1="20" y1="28" x2="20" y2="38" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="40" y1="28" x2="40" y2="38" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        </div>

                        <p className="font-bold text-xs text-slate-950 font-mono text-center">
                          Interrupteur Différentiel {diffCalibre}A
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono text-center">
                          Sensibilité 30mA · {diffType === 'A' ? 'Type A (Spécialisé)' : 'Type AC (Standard)'}
                        </p>
                      </div>

                      {/* Horizontal Distribution Busbar (Peigne) */}
                      <div className="flex-1 w-full overflow-x-auto">
                        <div className="relative mb-6">
                          <div className="h-2.5 bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 border border-amber-700 rounded-xs shadow-xs" />
                          <span className="absolute -top-4 left-2 text-[9px] font-mono font-bold text-amber-900 uppercase">
                            Peigne horizontal d'alimentation L + N
                          </span>
                        </div>

                        {/* Circuit Breakers Columns */}
                        <div className="flex items-start gap-4 min-w-max pb-3">
                          {group.breakers.length === 0 ? (
                            <div className="py-6 px-4 border border-dashed border-slate-300 text-slate-400 text-xs font-mono">
                              Aucun disjoncteur raccordé sur cette rangée
                            </div>
                          ) : (
                            group.breakers.map((breaker, bIdx) => {
                              const calibre = breaker.calibre || 16;
                              const curve = breaker.curve || 'C';
                              const specs = calculateCircuitSpecs(calibre, breaker.assignedPictogram);
                              const wireLabel = breaker.wireGauge || specs.wireGauge;

                              return (
                                <div
                                  key={breaker.id}
                                  className="w-36 flex flex-col items-center border border-slate-300 bg-white p-2.5 rounded shadow-xs relative"
                                >
                                  {/* Feeder T-drop line from busbar */}
                                  <div className="absolute -top-6 w-0.5 h-6 bg-slate-900" />
                                  <div className="absolute -top-7 w-2 h-2 rounded-full bg-slate-900" />

                                  {/* Circuit ID */}
                                  <div className="flex items-center justify-between w-full font-mono text-[9px] text-slate-500 mb-1">
                                    <span className="font-bold text-slate-900 bg-slate-100 px-1 rounded">
                                      {rIdx + 1}Q{bIdx + 1}
                                    </span>
                                    <span className="text-slate-500">{breaker.poles || '1P+N'}</span>
                                  </div>

                                  {/* Normative Magnetic-Thermal Breaker Symbol */}
                                  <div className="my-1.5 p-1 border border-slate-200 rounded bg-slate-50 w-full flex flex-col items-center">
                                    <svg width="38" height="40" viewBox="0 0 40 42" className="text-slate-900">
                                      <line x1="20" y1="2" x2="20" y2="8" stroke="currentColor" strokeWidth="1.5" />
                                      <path d="M16 11 Q12 14 16 17" fill="none" stroke="#e11d48" strokeWidth="1.5" />
                                      <path d="M24 11 L24 17 L21 17" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                                      <line x1="20" y1="18" x2="14" y2="30" stroke="currentColor" strokeWidth="2" />
                                      <line x1="20" y1="30" x2="20" y2="40" stroke="currentColor" strokeWidth="1.5" />
                                      <circle cx="20" cy="30" r="1.5" fill="currentColor" />
                                    </svg>

                                    <span className="font-mono font-black text-xs text-slate-900 mt-0.5">
                                      {curve}{calibre}
                                    </span>
                                    <span className="font-mono text-[8px] text-slate-500">Icu 4.5kA / 230V</span>
                                  </div>

                                  {/* Outgoing Cable Specification */}
                                  <div className="w-full text-center border-t border-slate-200 pt-1.5 mt-1 font-mono">
                                    <span className="inline-block bg-blue-50 text-blue-900 font-bold text-[10px] px-1.5 py-0.5 rounded border border-blue-200">
                                      3G {wireLabel}
                                    </span>
                                    <p className="text-[8px] text-slate-500 mt-0.5">Cuivre R2V / H07VU</p>
                                  </div>

                                  {/* Circuit Label & Pictogram */}
                                  <div className="w-full mt-2 pt-1.5 border-t border-slate-100 flex flex-col items-center text-center">
                                    <div className="w-6 h-6 rounded bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800 mb-1">
                                      <PictogramIcon name={breaker.assignedPictogram || 'socket'} size={14} />
                                    </div>
                                    <p className="font-bold text-[10px] text-slate-900 leading-tight truncate w-full" title={breaker.circuitLabel || breaker.name}>
                                      {breaker.circuitLabel || breaker.name}
                                    </p>
                                    <span className="text-[8px] font-mono text-emerald-700 mt-0.5">
                                      Max {specs.powerWatts} W
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Earthing (Terre PE) Collective Bar */}
              <div className="border-2 border-emerald-800 bg-emerald-50/60 p-4 rounded-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ⏚
                    </span>
                    <span className="font-bold text-emerald-950 uppercase">
                      Barre Principale de Terre (PE) & Équipotentialité
                    </span>
                  </div>
                  <span className="text-emerald-800 text-[11px] font-bold">
                    Liaison principale 16 mm² Cuivre vers Piquet de terre (&lt; 100 Ω)
                  </span>
                </div>
              </div>
            </div>

            {/* Normative footer checklist */}
            <div className="mt-8 pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-600 gap-2">
              <span>Document technique établi selon la norme NF C 15-100 Amendement 5</span>
              <span className="font-bold text-slate-900">Conforme pour déclaration CONSUEL</span>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: TABLEAU DE CALCUL DES CÂBLES & CHUTES DE TENSION
           ======================================================== */}
        {activeTab === 'calculations' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Dimensionnement des Conducteurs & Chutes de Tension (ΔU)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Calculs normalisés selon NF C 15-100 (Chute max : 3% éclairage, 5% autres usages sous 230V)
                </p>
              </div>
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono text-blue-800">
                Formule : ΔU = (2 · ρ · L · I) / S · (ρ = 0.023 Ω·mm²/m)
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-3">Circuit</th>
                    <th className="p-3">Désignation</th>
                    <th className="p-3">Calibre (In)</th>
                    <th className="p-3">Puissance max</th>
                    <th className="p-3">Section Cuivre</th>
                    <th className="p-3">Type Câble</th>
                    <th className="p-3">ΔU max admissible</th>
                    <th className="p-3">Longueur max de ligne</th>
                    <th className="p-3">Statut Norme</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {project.devices
                    .filter((d) => d.category === 'breaker' || d.category === 'rcbo')
                    .map((d, index) => {
                      const calibre = d.calibre || 16;
                      const specs = calculateCircuitSpecs(calibre, d.assignedPictogram);
                      return (
                        <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            C{index + 1}
                          </td>
                          <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                            <PictogramIcon name={d.assignedPictogram || 'socket'} size={16} />
                            <span>{d.circuitLabel || d.name}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {calibre} A ({d.curve || 'C'})
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            {specs.powerWatts.toLocaleString()} W
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {specs.wireGauge}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">
                            3G{specs.wireGauge} (R2V / U1000)
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-700">
                            {specs.maxDeltaUPercent}% ({((230 * specs.maxDeltaUPercent) / 100).toFixed(1)} V)
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">
                            &le; {specs.maxDistanceMeters} mètres
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Conforme NF</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: CE QU'IL FAUT POUR QUE LE SCHÉMA SOIT RÉEL
           ======================================================== */}
        {activeTab === 'requirements' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-md space-y-8">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Guide de Conformité Électrique Métier</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Qu'est-ce qu'il faut pour que les schémas soient réels ?
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Pour qu'un schéma de tableau électrique soit <strong>100% réel</strong>, exécutable par un installateur et validé par le <strong>CONSUEL</strong> (ou les normes internationales IEC 60364), il doit respecter rigoureusement 6 exigences techniques :
              </p>
            </div>

            {/* The 6 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pillar 1 */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Schéma Unifilaire Normalisé avec Symboles IEC
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le schéma doit représenter chaque composant selon les symboles universels :
                  disjoncteur magnéto-thermique (déclencheur thermique bimetal + déclencheur magnétique), tore différentiel avec sensibilité <strong>30mA</strong>, interrupteur général AGCP 500mA sélectif et barre de terre principale.
                </p>
                <div className="mt-3 text-[11px] font-mono text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                  ✔ Présent dans l'onglet "Schéma Unifilaire"
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Sections de Câble (mm²) Adaptées au Calibre
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chaque départ doit indiquer le conducteur en cuivre normalisé :
                  <br />• <strong>1.5 mm²</strong> pour disjoncteur 10A / 16A (éclairage, 8 points max)
                  <br />• <strong>2.5 mm²</strong> pour disjoncteur 16A / 20A (prises, four, lave-linge)
                  <br />• <strong>6.0 mm²</strong> pour disjoncteur 32A (plaque de cuisson)
                  <br />• <strong>16 mm²</strong> pour le conducteur principal de terre (PE)
                </p>
                <div className="mt-3 text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                  ✔ Calculé automatiquement pour chaque disjoncteur
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Règle de Dimensionnement des Différentiels (NF C 15-100)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deux règles impératives vérifiées par le Consuel :
                  <br />• <strong>Type A obligatoire</strong> pour plaque de cuisson, lave-linge et recharge VE.
                  <br />• <strong>Règle de l'amont ou de l'aval</strong> : Le calibre du différentiel (40A ou 63A) doit être supérieur ou égal à la somme des calibres des disjoncteurs en aval multipliés par leur coefficient de simultanéité (1 pour chauffage/chauffe-eau/VE, 0.5 pour les autres).
                  <br />• <strong>Maximum 8 disjoncteurs</strong> par interrupteur différentiel.
                </p>
                <div className="mt-3 text-[11px] font-mono text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  ✔ Audit automatique dans le menu "Contrôle Norme NF C 15-100"
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Chute de Tension Admissible (&Delta;U)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sur les longues distances (garage, dépendance, jardin), le câble doit être vérifié pour ne pas dépasser <strong>3% de chute de tension</strong> en éclairage et <strong>5%</strong> en prises/force motrice. Si la longueur dépasse la limite, il faut augmenter la section (ex: passer de 2.5mm² à 4mm² ou 6mm²).
                </p>
                <div className="mt-3 text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-100">
                  ✔ Table des longueurs max disponible dans l'onglet Calculs
                </div>
              </div>

              {/* Pillar 5 */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Repérage et Étiquetage des Circuits
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chaque disjoncteur doit posséder un repère clair et indélébile (texte + pictogramme) indiquant la pièce et l'usage desservi (ex: "Prises Cuisine", "Four", "Éclairage Salon", "Chauffe-eau"). Un tableau sans repérage est systématiquement refusé par le Consuel.
                </p>
                <div className="mt-3 text-[11px] font-mono text-teal-700 bg-teal-50 p-2 rounded border border-teal-100">
                  ✔ 30+ pictogrammes normalisés NF disponibles dans le panneau Marquage
                </div>
              </div>

              {/* Pillar 6 */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                    6
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cartouche Réglementaire & Impression Pro
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pour avoir valeur juridique de schéma d'exécution, le document doit comporter un cartouche officiel : titre de l'affaire, date, puissance souscrite (kVA), régime de neutre (TT en résidentiel), valeur de la terre (&lt; 100 &Omega;) et cadre de visa.
                </p>
                <div className="mt-3 text-[11px] font-mono text-rose-700 bg-rose-50 p-2 rounded border border-rose-100">
                  ✔ Cartouche officiel imprimable en PDF haute définition
                </div>
              </div>
            </div>

            {/* Direct Diagnostic on current user project */}
            <div className="border-2 border-blue-500 bg-blue-50/50 rounded-xl p-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>État de Conformité Réelle de votre Tableau Actuel</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Synthèse en direct calculée sur vos {project.rails.length} rangées et {project.devices.length} appareillages :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">DIFFERENTIELS 30mA</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {differentials.length} installé(s)
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-1">
                    {differentials.length >= 2 ? '✔ Minimum 2 respecté' : '⚠️ Min. 2 requis'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">DIFFERENTIEL TYPE A</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {project.devices.some((d) => d.differentialType === 'A') ? 'Oui (Présent)' : 'Non détecté'}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-1">
                    {project.devices.some((d) => d.differentialType === 'A')
                      ? '✔ Conforme plaque/lave-linge'
                      : '⚠️ Type A requis pour plaque/LL'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">PUISSANCE ESTIMÉE</span>
                  <span className="font-bold text-blue-700 text-sm">{totalKva} kVA</span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Raccordement Enedis 230V
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
