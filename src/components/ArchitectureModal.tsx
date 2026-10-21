import React, { useState } from 'react';
import { ElectricalPanelProject } from '../types/panel';
import { X, Code2, Cpu, Milestone, Copy, Check, FileJson } from 'lucide-react';

interface ArchitectureModalProps {
  currentProject: ElectricalPanelProject;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  currentProject,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'json' | 'roadmap'>('architecture');
  const [copied, setCopied] = useState(false);

  const sampleJsonModel = JSON.stringify(currentProject, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(sampleJsonModel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Spécifications Logicielles & Architecture Système
              </h2>
              <p className="text-xs text-slate-400">
                Dossier d'architecture technique TableauPro (Frontend, Backend, Modèle JSON & Roadmap MVP)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          {[
            { id: 'architecture' as const, label: '1. Architecture Recommandée', icon: Cpu },
            { id: 'json' as const, label: '2. Modèle de Données JSON', icon: FileJson },
            { id: 'roadmap' as const, label: '3. Roadmap MVP Prioritaire', icon: Milestone },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 text-xs leading-relaxed space-y-4">
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <h3 className="text-sm font-bold text-amber-400 mb-1.5">
                  1. Architecture Frontend Hybride (React + SVG/Canvas Modulaire)
                </h3>
                <p className="text-slate-300 mb-2">
                  Pour garantir une netteté vectorielle parfaite à tous les niveaux de zoom et un export PDF/impression sans perte, l'architecture recommandée sépare strictement le <strong>Moteur Géométrique</strong>, le <strong>Graphe de Connexions</strong> et l'<strong>Interface Utilisateur</strong> :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>
                    <strong className="text-slate-200">Moteur de Rendu :</strong> Découpage réactif React SVG pour les composants modulaires (1 DIN Module = 17.5 mm = échelle discrète 36px) combiné à un canvas de virtualisation avec pan/zoom matériel (GPU CSS transform).
                  </li>
                  <li>
                    <strong className="text-slate-200">Moteur d'Aimantation (Snapping Engine) :</strong> Système de coordonnées 1D discrétisé par rail (<code className="text-amber-300">slotIndex: 0..N-1</code>). Détection automatique de collision, refus des dépassements de capacité physique, et alignement magnétique automatique des peignes en peigne amont.
                  </li>
                  <li>
                    <strong className="text-slate-200">Gestion d'État Global :</strong> Store unifié (Zustand ou Redux Toolkit) avec historique immuable pour le support natif de l'Undo/Redo et la sérialisation bidirectionnelle JSON.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <h3 className="text-sm font-bold text-amber-400 mb-1.5">
                  2. Architecture Backend & Persistance Cloud
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>
                    <strong className="text-slate-200">API Gateway :</strong> Node.js / Express ou Fastify avec validation de schéma JSON Schema / Zod pour valider la topologie électrique avant enregistrement.
                  </li>
                  <li>
                    <strong className="text-slate-200">Stockage :</strong> Base de données NoSQL / Document Store (ex: Firestore ou PostgreSQL avec colonnes JSONB) pour versionner les schémas, les modèles d'utilisateurs et les nomenclatures BOM.
                  </li>
                  <li>
                    <strong className="text-slate-200">Moteur de Calcul & Conformité :</strong> Microservice de calcul d'équilibrage des phases (L1/L2/L3 en triphasé), calcul de chute de tension (NF C 15-100) et génération de PDF haute résolution côté serveur (via Puppeteer ou PDFKit).
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: JSON MODEL */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                  Modèle de données JSON normalisé représentant l'état complet du tableau en cours d'édition :
                </p>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copié !' : 'Copier le JSON'}
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-96">
                {sampleJsonModel}
              </pre>
            </div>
          )}

          {/* TAB 3: ROADMAP MVP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              {[
                {
                  phase: 'Phase 1 : Moteur de Canvas & Grille Visuelle (MVP 1.0)',
                  status: 'Complété',
                  tasks: [
                    'Canvas virtuel avec pan/zoom haute performance',
                    'Représentation physique des rails DIN (13M, 18M, 24M)',
                    'Composants modulaires avec visuel réaliste et bascule d’état ON/OFF',
                    'Tiroir inférieur avec les 7 catégories de composants',
                  ],
                },
                {
                  phase: 'Phase 2 : Aimantation, Peignes & Métier NF C 15-100 (MVP 2.0)',
                  status: 'Actif',
                  tasks: [
                    'Aimantation discrète sur les pas DIN (slotIndex 0 à N-1)',
                    'Contrôle automatique de collision et calcul de capacité restante',
                    'Superposition des peignes horizontaux de raccordement Ph+N et triphasés',
                    'Système de repérage et 32 pictogrammes normalisés',
                  ],
                },
                {
                  phase: 'Phase 3 : Exportation Professionnelle & BOM (MVP 3.0)',
                  status: 'Actif',
                  tasks: [
                    'Génération dynamique de la nomenclature chiffrée (BOM) et export CSV',
                    'Mise en page d’impression / export PDF haute résolution',
                    'Sauvegarde et rechargement de fichiers de projet (.json)',
                    'Gestion des licences et fonctionnalités PRO déverrouillables',
                  ],
                },
                {
                  phase: 'Phase 4 : Collaboration Cloud & Validation Consuel (V2.0)',
                  status: 'Futur',
                  tasks: [
                    'Partage temps réel de projets avec plusieurs techniciens',
                    'Validation automatique de conformité Consuel (respect des sections de câbles et différentiels)',
                    'Export DXF / DWG pour intégration dans AutoCAD Electrical',
                  ],
                },
              ].map((phase, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-slate-200">{phase.phase}</h4>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        phase.status === 'Complété'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : phase.status === 'Actif'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-400 text-[11px]">
                    {phase.tasks.map((task, tIdx) => (
                      <li key={tIdx}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
