import React, { useState } from 'react';
import { ElectricalPanelProject, BOMItem } from '../types/panel';
import { ELECTRICAL_CATALOG } from '../data/componentsCatalog';
import { X, Printer, Download, FileSpreadsheet, Package } from 'lucide-react';

interface BOMModalProps {
  project: ElectricalPanelProject;
  onClose: () => void;
}

export const BOMModal: React.FC<BOMModalProps> = ({ project, onClose }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Compute BOM
  const itemMap = new Map<string, BOMItem>();

  // Process devices
  project.devices.forEach((dev) => {
    const catalogEntry = ELECTRICAL_CATALOG.find((c) => c.reference === dev.reference);
    const ref = dev.reference || 'REF-GEN';
    const key = `${ref}-${dev.circuitLabel || ''}`;
    const unitPrice = catalogEntry?.estimatedPrice || 12.0;

    if (itemMap.has(ref)) {
      const existing = itemMap.get(ref)!;
      existing.quantity += 1;
      existing.totalModules += dev.moduleWidth;
      existing.totalPrice += unitPrice;
    } else {
      itemMap.set(ref, {
        reference: ref,
        designation: `${dev.name} (${dev.poles} ${dev.calibre ? dev.calibre + 'A' : ''})`,
        category: dev.category === 'differential' ? 'Différentiels' : dev.category === 'breaker' ? 'Disjoncteurs' : 'Appareillage',
        quantity: 1,
        totalModules: dev.moduleWidth,
        unitPrice,
        totalPrice: unitPrice,
      });
    }
  });

  // Process rails
  project.rails.forEach((rail) => {
    const ref = `RAIL-${rail.capacityModules}M`;
    const price = rail.capacityModules === 13 ? 6.5 : rail.capacityModules === 18 ? 8.8 : 12.5;
    if (itemMap.has(ref)) {
      const existing = itemMap.get(ref)!;
      existing.quantity += 1;
      existing.totalPrice += price;
    } else {
      itemMap.set(ref, {
        reference: ref,
        designation: `Rail DIN Symétrique 35mm (${rail.capacityModules} modules)`,
        category: 'Châssis & Rails',
        quantity: 1,
        totalModules: rail.capacityModules,
        unitPrice: price,
        totalPrice: price,
      });
    }
  });

  // Process busbars
  project.busbars.forEach((b) => {
    const typeLabel = b.type || b.config || '2P_LN';
    const ref = `PEIGNE-${typeLabel}-${b.moduleLength}M`;
    const price = 15.0;
    if (itemMap.has(ref)) {
      const existing = itemMap.get(ref)!;
      existing.quantity += 1;
      existing.totalPrice += price;
    } else {
      itemMap.set(ref, {
        reference: ref,
        designation: `Peigne de raccordement ${typeLabel.replace(/_/g, ' ')} (${b.moduleLength}M)`,
        category: 'Raccordement & Peignes',
        quantity: 1,
        totalModules: b.moduleLength,
        unitPrice: price,
        totalPrice: price,
      });
    }
  });

  // Process terminal bars
  project.terminalBars.forEach((tb) => {
    const ref = `BORN-${tb.type.toUpperCase()}-${tb.holesCount}`;
    const price = 8.5;
    itemMap.set(ref, {
      reference: ref,
      designation: `Barre laiton ${tb.type === 'earth' ? 'Terre' : 'Neutre'} (${tb.holesCount} vis)`,
      category: 'Borniers & Barres',
      quantity: 1,
      totalModules: 0,
      unitPrice: price,
      totalPrice: price,
    });
  });

  // Process distribution blocks
  project.distributionBlocks.forEach((db) => {
    const ref = `DIST-${db.configuration}`;
    const price = db.configuration.startsWith('4') ? 58.0 : 32.0;
    itemMap.set(ref, {
      reference: ref,
      designation: `${db.name} (${db.configuration} contacts ${db.maxCurrentAmps}A)`,
      category: 'Distribution Étagée',
      quantity: 1,
      totalModules: 4,
      unitPrice: price,
      totalPrice: price,
    });
  });

  const bomItems = Array.from(itemMap.values());
  const filteredItems = filterCategory === 'all'
    ? bomItems
    : bomItems.filter((i) => i.category === filterCategory);

  const grandTotalHT = bomItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const totalQuantity = bomItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalOccupiedModules = project.devices.reduce((acc, d) => acc + d.moduleWidth, 0);

  const categories = ['all', ...Array.from(new Set(bomItems.map((i) => i.category)))];

  const handleExportCSV = () => {
    const headers = ['Reference,Designation,Categorie,Quantite,Modules,Prix_Unitaire_EUR,Total_HT_EUR'];
    const rows = bomItems.map(
      (i) => `"${i.reference}","${i.designation}","${i.category}",${i.quantity},${i.totalModules},${i.unitPrice.toFixed(2)},${i.totalPrice.toFixed(2)}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nomenclature_${project.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Nomenclature & Liste du Matériel (BOM)
              </h2>
              <p className="text-xs text-slate-400">
                {project.title} · Norme {project.standard}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" /> Imprimer / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 mr-2">Filtrer :</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                filterCategory === c
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c === 'all' ? 'Tous les composants' : c}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Référence</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3 text-center">Qté</th>
                <th className="py-2.5 px-3 text-right">Modules</th>
                <th className="py-2.5 px-3 text-right">P.U. Estimé</th>
                <th className="py-2.5 px-3 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredItems.map((item) => (
                <tr key={item.reference} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">
                    {item.reference}
                  </td>
                  <td className="py-2.5 px-3 text-slate-100 font-medium">
                    {item.designation}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-center font-bold text-amber-400">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-slate-400">
                    {item.totalModules ? `${item.totalModules} M` : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-slate-300">
                    {item.unitPrice.toFixed(2)} €
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-slate-100">
                    {item.totalPrice.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Summary */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>Total Éléments : <strong className="text-slate-200">{totalQuantity}</strong></span>
            <span>·</span>
            <span>Modules Occupés : <strong className="text-slate-200">{totalOccupiedModules} M</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Budget Équipement Estimé :</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {grandTotalHT.toFixed(2)} € HT
            </span>
            <span className="text-[11px] text-slate-500">
              ({(grandTotalHT * 1.2).toFixed(2)} € TTC)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
