import { toCanvas } from 'html-to-image';

/**
 * Exporte le plan en PNG : la surface est rendue sans zoom ni déplacement,
 * puis recadrée autour des éléments posés (marge de 40 px).
 */
export const exportPlanToPng = async (surface: HTMLElement, fileName: string): Promise<void> => {
  const surfaceRect = surface.getBoundingClientRect();
  const scale = surfaceRect.width / surface.offsetWidth || 1;

  // Zone occupée par le contenu (on ignore les calques qui couvrent toute la surface)
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  Array.from(surface.children).forEach((child) => {
    const el = child as HTMLElement;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.width >= surfaceRect.width * 0.9 && r.height >= surfaceRect.height * 0.9) {
      // Calque pleine surface (fils, conteneur) : on descend d'un niveau
      Array.from(el.children).forEach((sub) => {
        const sr = (sub as HTMLElement).getBoundingClientRect();
        if (sr.width === 0 || sr.height === 0) return;
        minX = Math.min(minX, sr.left);
        minY = Math.min(minY, sr.top);
        maxX = Math.max(maxX, sr.right);
        maxY = Math.max(maxY, sr.bottom);
      });
      return;
    }
    minX = Math.min(minX, r.left);
    minY = Math.min(minY, r.top);
    maxX = Math.max(maxX, r.right);
    maxY = Math.max(maxY, r.bottom);
  });
  if (!isFinite(minX)) throw new Error('empty');

  const margin = 40;
  const x = Math.max(0, (minX - surfaceRect.left) / scale - margin);
  const y = Math.max(0, (minY - surfaceRect.top) / scale - margin);
  const w = Math.min(surface.offsetWidth - x, (maxX - minX) / scale + margin * 2);
  const h = Math.min(surface.offsetHeight - y, (maxY - minY) / scale + margin * 2);

  const pixelRatio = 2;
  const full = await toCanvas(surface, {
    pixelRatio,
    backgroundColor: '#ffffff',
    width: surface.offsetWidth,
    height: surface.offsetHeight,
    style: { transform: 'none', left: '0px', top: '0px', transition: 'none' },
    filter: (node) => !(node instanceof HTMLElement && node.classList.contains('canvas-grid-skip')),
  });

  const out = document.createElement('canvas');
  out.width = Math.round(w * pixelRatio);
  out.height = Math.round(h * pixelRatio);
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(full, x * pixelRatio, y * pixelRatio, w * pixelRatio, h * pixelRatio, 0, 0, out.width, out.height);

  const blob: Blob | null = await new Promise((res) => out.toBlob(res, 'image/png'));
  if (!blob) throw new Error('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
