import React from 'react';
import { ElectricalPanelProject } from '../types/panel';
import { X, ShieldCheck, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface NfcComplianceModalProps {
  project: ElectricalPanelProject;
  onClose: () => void;
}

export const NfcComplianceModal: React.FC<NfcComplianceModalProps> = ({ project, onClose }) => {
  // 1. Calcul du nombre de différentiels 30mA
  const diffs = project.devices.filter(
    (d) => d.category === 'differential' || (d.differentialSensibility && d.differentialSensibility <= 30)
  );
  const diffCount = diffs.length;
  const hasMinDiffs = diffCount >= 2;

  // 2. Calcul du nombre max de disjoncteurs par différentiel (max 8)
  const breakers = project.devices.filter((d) => d.category === 'breaker' || d.category === 'rcbo' || d.category === 'afdd');
  const maxBreakersPerDiff = diffCount > 0 ? Math.ceil(breakers.length / diffCount) : breakers.length;
  const isBreakersPerDiffOk = maxBreakersPerDiff <= 8 && diffCount > 0;

  // 3. Calcul de la réserve modulaire (> 20%)
  const totalEnclosureModules = project.enclosure.rows * project.enclosure.modulesPerRow;
  const totalOccupiedModules = project.devices.reduce((acc, d) => acc + d.moduleWidth, 0);
  const reserveModules = totalEnclosureModules - totalOccupiedModules;
  const reservePercentage = totalEnclosureModules > 0 ? (reserveModules / totalEnclosureModules) * 100 : 0;
  const isReserveOk = reservePercentage >= 20;

  // 4. Vérification Type A
  const hasTypeA = diffs.some((d) => d.differentialType === 'A' || d.differentialType === 'F' || d.differentialType === 'B');

  // 5. Section vs Calibre
  const calibreSectionMismatches: string[] = [];
  project.devices.forEach((d) => {
    if (d.calibre) {
      if ((d.wireGauge === '1.5' || d.wireGauge === '1.5mm²') && d.calibre > 16) {
        calibreSectionMismatches.push(`${d.name} (${d.calibre}A sur fil 1.5 mm² - max autorisé 16A)`);
      } else if ((d.wireGauge === '2.5' || d.wireGauge === '2.5mm²') && d.calibre > 20) {
        calibreSectionMismatches.push(`${d.name} (${d.calibre}A sur fil 2.5 mm² - max autorisé 20A)`);
      } else if ((d.wireGauge === '6.0' || d.wireGauge === '6mm²' || d.wireGauge === '6.0mm²') && d.calibre > 32) {
        calibreSectionMismatches.push(`${d.name} (${d.calibre}A sur fil 6.0 mm² - max autorisé 32A)`);
      }
    }
  });

  const allRulesPassed =
    hasMinDiffs && isBreakersPerDiffOk && isReserveOk && hasTypeA && calibreSectionMismatches.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              allRulesPassed ? 'bg-emerald-600' : 'bg-amber-500'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Diagnostic Norme NF C 15-100
              </h2>
              <p className="text-xs text-slate-500">
                Vérification automatique des règles de sécurité électrique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Global Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            allRulesPassed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {allRulesPassed ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {allRulesPassed
                  ? 'Tableau conforme aux exigences NF C 15-100'
                  : 'Points d’attention détectés sur votre tableau'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {allRulesPassed
                  ? 'Tous les critères normatifs fondamentaux sont respectés pour le Consuel.'
                  : 'Vérifiez les points ci-dessous pour assurer la pleine conformité et la sécurité.'}
              </p>
            </div>
          </div>

          {/* Detailed Rules Check */}
          <div className="space-y-3">
            {/* Rule 1: Min 2 différentiels 30mA */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              {hasMinDiffs ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">1. Nombre d’interrupteurs différentiels 30mA</span>
                  <span className={`font-mono font-bold ${hasMinDiffs ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {diffCount} / 2 min
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  La norme NF C 15-100 impose au moins 2 différentiels 30mA pour assurer la continuité de service.
                </p>
              </div>
            </div>

            {/* Rule 2: Max 8 disjoncteurs par différentiel */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              {isBreakersPerDiffOk ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">2. Règle des 8 disjoncteurs par différentiel</span>
                  <span className={`font-mono font-bold ${isBreakersPerDiffOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {maxBreakersPerDiff} max / 8
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Un interrupteur différentiel 30mA ne doit pas protéger plus de 8 circuits terminaux.
                </p>
              </div>
            </div>

            {/* Rule 3: Présence Type A */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              {hasTypeA ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">3. Différentiel Type A obligatoire</span>
                  <span className={`font-mono font-bold ${hasTypeA ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {hasTypeA ? 'Présent' : 'Absent'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Obligatoire pour les circuits plaque de cuisson, lave-linge et borne de recharge véhicule.
                </p>
              </div>
            </div>

            {/* Rule 4: Réserve 20% */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              {isReserveOk ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">4. Réserve modulaire minimale (20%)</span>
                  <span className={`font-mono font-bold ${isReserveOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {reservePercentage.toFixed(1)}% ({reserveModules} modules libres)
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  L'enveloppe doit conserver au minimum 20% de modules disponibles pour les évolutions futures.
                </p>
              </div>
            </div>

            {/* Rule 5: Cohérence Section de câble vs Calibre */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              {calibreSectionMismatches.length === 0 ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">5. Protection des sections de conducteurs</span>
                  <span className={`font-mono font-bold ${calibreSectionMismatches.length === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {calibreSectionMismatches.length === 0 ? 'Conforme' : `${calibreSectionMismatches.length} anomalie(s)`}
                  </span>
                </div>
                {calibreSectionMismatches.length > 0 ? (
                  <ul className="text-red-600 text-[11px] mt-1 space-y-0.5 list-disc list-inside">
                    {calibreSectionMismatches.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Toutes les sections de conducteurs (1.5mm², 2.5mm², 6mm²) sont protégées par un disjoncteur adapté.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Fermer le diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};
