import React, { useState, useRef } from 'react';
import {
  Menu,
  Save,
  Printer,
  Download,
  Upload,
  RotateCcw,
  RotateCw,
  Sparkles,
  Package,
  Cpu,
  Layers,
  Grid,
  Zap,
  FolderOpen,
  Trash2,
  Check,
} from 'lucide-react';

interface TopHeaderProps {
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  onSaveProject: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showWiringMode: boolean;
  onToggleWiringMode: () => void;
  isProUser: boolean;
  onOpenProModal: () => void;
  onOpenBOMModal: () => void;
  onOpenArchitectureModal: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onPrint: () => void;
  onResetProject: () => void;
  onLoadTemplate: (templateKey: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  projectTitle,
  onUpdateTitle,
  onSaveProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
  showWiringMode,
  onToggleWiringMode,
  isProUser,
  onOpenProModal,
  onOpenBOMModal,
  onOpenArchitectureModal,
  onExportJSON,
  onImportJSON,
  onPrint,
  onResetProject,
  onLoadTemplate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSave = () => {
    onSaveProject();
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
  };

  return (
    <header className="h-12 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between gap-4 z-40 select-none relative no-print">
      {/* Brand & Project Name Zone */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            title="Menu Fichier & Outils"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Hamburger Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute left-0 top-10 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Fichier & Exportations
              </div>

              <button
                onClick={onPrint}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Exporter en PDF / Imprimer</span>
              </button>

              <button
                onClick={onOpenBOMModal}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4 text-blue-400" />
                <span>Nomenclature du Matériel (BOM)</span>
              </button>

              <button
                onClick={onExportJSON}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Télécharger Projet (.tableaupro)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Ouvrir / Importer un Projet JSON</span>
              </button>

              <div className="px-3 py-1.5 border-t border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">
                Documentation Technique
              </div>

              <button
                onClick={onOpenArchitectureModal}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Architecture & Modèle JSON</span>
              </button>

              <div className="px-3 py-1.5 border-t border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">
                Réinitialisation
              </div>

              <button
                onClick={() => {
                  if (confirm('Voulez-vous vraiment effacer tous les composants de ce tableau ?')) {
                    onResetProject();
                  }
                }}
                className="w-full px-3 py-2 text-left hover:bg-red-950/40 text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Nouveau tableau vierge</span>
              </button>
            </div>
          )}
        </div>

        {/* Brand Lockup */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
            V
          </div>
          <span className="font-extrabold text-sm text-slate-100 tracking-tight hidden sm:inline">
            TableauPro
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline">|</span>

        {/* Editable Project Title */}
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent hover:border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs focus:outline-none transition-colors"
          title="Cliquez pour renommer le projet"
        />

        {/* Auto-save / Manual save button */}
        <button
          onClick={handleManualSave}
          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          title="Enregistrer les modifications"
        >
          {isSavedRecently ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" /> Enregistré
            </span>
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Hidden File Input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.tableaupro,.voltschema"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Middle & Right Workspace Actions */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Annuler (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Rétablir (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
            showGrid
              ? 'bg-slate-800 text-amber-400 border-amber-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Afficher / Masquer la grille quadrillée"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Grille</span>
        </button>

        {/* Wiring Mode Toggle */}
        <button
          onClick={onToggleWiringMode}
          className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
            showWiringMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Mode Schéma de Câblage (Lignes Phase, Neutre, Terre)"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Câblage</span>
        </button>

        {/* Nomenclature BOM Button */}
        <button
          onClick={onOpenBOMModal}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Consulter la nomenclature chiffrée"
        >
          <Package className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Nomenclature BOM</span>
        </button>
      </div>
    </header>
  );
};
