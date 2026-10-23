import React, { useRef } from 'react';
import {
  X,
  FilePlus,
  Save,
  FolderOpen,
  Printer,
  FileSpreadsheet,
  Zap,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  RotateCw,
  Grid,
  FileCode,
  Download,
  Info,
  FileText,
  Image as ImageIcon,
  Link2,
} from 'lucide-react';

interface AppMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProjects: () => void;
  onNewProject: () => void;
  onSaveJSON: () => void;
  onImportJSON: (file: File) => void;
  onPrint: () => void;
  onExportPNG: () => void;
  onCopyLink: () => void;
  onImportLink: () => void;
  onOpenBOM: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showWiringMode: boolean;
  onToggleWiringMode: () => void;
}

export const AppMenuDrawer: React.FC<AppMenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenProjects,
  onNewProject,
  onSaveJSON,
  onImportJSON,
  onPrint,
  onExportPNG,
  onCopyLink,
  onImportLink,
  onOpenBOM,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
  showWiringMode,
  onToggleWiringMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Background click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Menu Card */}
      <div className="w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 text-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-none">Options du Projet</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">TableauPro CAD Designer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Action List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Undo / Redo bar */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                onUndo();
              }}
              disabled={!canUndo}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Annuler</span>
            </button>
            <button
              onClick={() => {
                onRedo();
              }}
              disabled={!canRedo}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rétablir</span>
            </button>
          </div>

          {/* Section: Fichiers & Export */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
              Fichier & Sauvegarde
            </span>
            <div className="mt-1 space-y-1">
              <button
                onClick={() => {
                  onOpenProjects();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-[#007aff]" />
                <span>Projets enregistrés</span>
              </button>

              <button
                onClick={() => {
                  onNewProject();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <FilePlus className="w-4 h-4 text-slate-500" />
                <span>Nouveau tableau vide</span>
              </button>

              <button
                onClick={() => {
                  onSaveJSON();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-blue-600" />
                <span>Sauvegarder le projet (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-amber-600" />
                <span>Ouvrir un projet (.json)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.tableaupro,.voltschema"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={() => {
                  onPrint();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>Imprimer / Exporter en PDF</span>
              </button>

              <button
                onClick={() => {
                  onExportPNG();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-violet-600" />
                <span>Exporter le schéma en PNG</span>
              </button>

              <button
                onClick={() => {
                  onCopyLink();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <Link2 className="w-4 h-4 text-sky-600" />
                <span>Copier le lien du projet</span>
              </button>

              <button
                onClick={() => {
                  onImportLink();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <Link2 className="w-4 h-4 text-slate-500" />
                <span>Ouvrir depuis un lien</span>
              </button>
            </div>
          </div>

          {/* Section: Outils Métier & Électricité */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
              Outils & Rapports
            </span>
            <div className="mt-1 space-y-1">
              <button
                onClick={() => {
                  onOpenBOM();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span className="flex-1 text-left">Nomenclature chiffrée (BOM)</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
                  Devis
                </span>
              </button>


              <button
                onClick={() => {
                  onToggleWiringMode();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  showWiringMode ? 'bg-amber-50 text-amber-900' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className={`w-4 h-4 ${showWiringMode ? 'text-amber-600' : 'text-slate-500'}`} />
                  <span className="font-medium">Schéma de câblage (L/N/PE)</span>
                </div>
                <span
                  className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${
                    showWiringMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
                </span>
              </button>

              <button
                onClick={() => {
                  onToggleGrid();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  showGrid ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Grid className={`w-4 h-4 ${showGrid ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="font-medium">Grille quadrillée dynamique</span>
                </div>
                <span
                  className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${
                    showGrid ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
                </span>
              </button>
            </div>
          </div>

          {/* Section: Documentation Technique */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
              Documentation & Schéma
            </span>
            <div className="mt-1 space-y-1">


            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>TableauPro v1.3</span>
          <span>NF C 15-100 Ready</span>
        </div>
      </div>
    </div>
  );
};
