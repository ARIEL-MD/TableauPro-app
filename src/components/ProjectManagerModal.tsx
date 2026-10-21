import React from 'react';
import { Copy, Plus, QrCode, Settings, Trash2, X } from 'lucide-react';
import { ElectricalPanelProject } from '../types/panel';

interface ProjectManagerModalProps {
  projects: ElectricalPanelProject[];
  currentProjectId: string;
  onClose: () => void;
  onOpenProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onScanQr: () => void;
}

const formatUpdatedAt = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';
  const day = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '.');
  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day}, ${time}`;
};

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  projects,
  currentProjectId,
  onClose,
  onOpenProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onScanQr,
}) => {
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-x-2 top-3 bottom-3 mx-auto max-w-3xl rounded-[28px] bg-[#f4f4f6] shadow-2xl overflow-hidden flex flex-col border border-white/60">
        {/* Header matching the mobile project sheet */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <button
            type="button"
            onClick={onClose}
            className="text-[#007aff] text-sm font-semibold hover:opacity-75 transition-opacity cursor-pointer"
          >
            Fermer
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#dbeafe] px-3 py-1.5 text-xs font-semibold text-slate-800"
            title="Paramètres projets"
          >
            <Settings className="h-3.5 w-3.5 text-slate-500" />
            Paramètres
          </button>
        </div>

        <div className="px-5 pb-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Projets</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {sortedProjects.length === 0 ? (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <p className="font-bold text-slate-700">Aucun projet enregistré</p>
              <p className="mt-1 text-xs text-slate-500">Créez un nouveau projet pour commencer un tableau électrique vide.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 rounded-2xl bg-white/95 shadow-sm overflow-hidden">
              {sortedProjects.map((project) => {
                const isCurrent = project.id === currentProjectId;
                return (
                  <div
                    key={project.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isCurrent ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenProject(project.id)}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                      title="Ouvrir ce projet"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-sm font-bold text-slate-900">{project.title || 'Projet sans nom'}</h2>
                        {isCurrent && (
                          <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] font-semibold text-[#007aff]">
                            actuel
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Modifié : {formatUpdatedAt(project.dateUpdated)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateProject(project.id)}
                      className="rounded-lg p-2 text-[#007aff] hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Dupliquer le projet"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      className="rounded-full bg-red-600 p-2 text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
                      title="Supprimer le projet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 px-4 pb-5 pt-1">
          <button
            type="button"
            onClick={onCreateProject}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#cde5ff] px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-[#bcdcff] cursor-pointer"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#007aff] text-white">
              <Plus className="h-3.5 w-3.5" />
            </span>
            Créer un nouveau projet
          </button>
          <button
            type="button"
            onClick={onScanQr}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#cde5ff] px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-[#bcdcff] cursor-pointer"
          >
            <QrCode className="h-5 w-5 text-[#007aff]" />
            Scanner le code QR
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Fermer la gestion des projets"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-500 shadow-md hover:text-slate-800 md:hidden"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};
