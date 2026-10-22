import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { CableWire, ElectricalPanelProject, WireThickness } from '../types/panel';
import { WIRE_THICKNESSES } from './WireConnectionModal';
import {
  LocatedAnchor,
  Pt,
  defaultRoute,
  roundedPath,
} from './wireRoute';

/** Fil en cours de tracé (pas encore enregistré). */
export interface WirePreview {
  from: string;
  to: string;
  color: string;
  thickness: WireThickness;
  route: Pt[];
}

interface Drawn {
  id: string;
  wireId?: string;
  pts?: Pt[];
  d: string;
  color: string;
  px: number;
  tips: [[Pt, Pt], [Pt, Pt]];
}

const COPPER = '#c8875a';
const OUTLINE = '#111827';

/** Lit la position réelle d'une borne dans le DOM, en px de plan. */
export function locateAnchor(
  surface: HTMLElement,
  anchor: string,
  zoom: number
): LocatedAnchor | null {
  const el = surface.querySelector<HTMLElement>(`[data-wire-anchor="${anchor}"]`);
  if (!el) return null;
  const sRect = surface.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const isBottom = anchor.includes(':bottom');
  return {
    p: {
      x: (r.left + r.width / 2 - sRect.left) / zoom,
      y: ((isBottom ? r.bottom : r.top) - sRect.top) / zoom,
    },
    dir: isBottom ? 1 : -1,
  };
}

/**
 * Tracé enregistré. Les deux extrémités sont indépendantes :
 *  - les coudes restent à leur place sur le plan, ils ne sont collés à aucun appareil ;
 *  - déplacer un appareil ne modifie que le départ droit (stub) de SON extrémité
 *    et le segment qui le prolonge, l'autre appareil et l'autre bout du fil
 *    ne bougent pas ;
 *  - les angles droits sont conservés sans ajouter de coin.
 */
export function pointsFromRoute(route: Pt[], a: LocatedAnchor, b: LocatedAnchor): Pt[] {
  const n = route.length;
  if (n < 5) return defaultRoute(a, b);
  const dAy = a.p.y - route[0].y;
  const dBy = b.p.y - route[n - 1].y;
  const pts = route.map((p) => ({ ...p }));

  // Extrémité d'arrivée : départ droit vertical, puis segment qui le prolonge.
  pts[n - 1] = { ...b.p };
  pts[n - 2] = { x: b.p.x, y: route[n - 2].y + dBy };
  const lastInnerHorizontal = (n - 4) % 2 === 0; // index du dernier segment intérieur
  if (lastInnerHorizontal) pts[n - 3].y = pts[n - 2].y;
  else pts[n - 3].x = pts[n - 2].x;

  // Extrémité de départ : idem, indépendamment de l'arrivée.
  pts[0] = { ...a.p };
  pts[1] = { x: a.p.x, y: route[1].y + dAy };
  pts[2].y = pts[1].y; // le 1er segment intérieur est horizontal

  return pts;
}

const tipFor = (end: Pt, toward: Pt): [Pt, Pt] => {
  const len = Math.hypot(end.x - toward.x, end.y - toward.y) || 1;
  const k = 8 / len;
  return [end, { x: end.x + (end.x - toward.x) * k, y: end.y + (end.y - toward.y) * k }];
};

const solidColor = (c: string) => (c.startsWith('linear') ? '#16a34a' : c);

const buildDrawn = (
  id: string,
  pts: Pt[],
  color: string,
  thickness: WireThickness
): Drawn => ({
  id,
  d: roundedPath(pts, 10),
  color: solidColor(color),
  px: WIRE_THICKNESSES.find((t) => t.value === thickness)?.px ?? 3,
  tips: [
    tipFor(pts[0], pts[1]),
    tipFor(pts[pts.length - 1], pts[pts.length - 2]),
  ],
});

interface CableOverlayProps {
  project: ElectricalPanelProject;
  surfaceRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  preview?: WirePreview | null;
  selectedWireId?: string | null;
  onSelectWire?: (id: string | null) => void;
  onMoveWire?: (wireId: string, pts: Pt[]) => void;
}

/** Poignée d'un coude : on la glisse pour déplacer le fil. */
const WireHandle: React.FC<{ at: Pt; zoom: number; onDrop: (p: Pt) => void }> = ({ at, zoom, onDrop }) => {
  const [live, setLive] = useState<Pt | null>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const shown = live ?? at;
  return (
    <circle
      cx={shown.x}
      cy={shown.y}
      r={6}
      fill="#ffffff"
      stroke="#007aff"
      strokeWidth={2}
      style={{ pointerEvents: 'auto', cursor: 'move' }}
      onPointerDown={(e) => {
        e.stopPropagation();
        drag.current = { sx: e.clientX, sy: e.clientY, ox: at.x, oy: at.y };
        (e.currentTarget as unknown as Element).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        setLive({ x: d.ox + (e.clientX - d.sx) / zoom, y: d.oy + (e.clientY - d.sy) / zoom });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        try {
          (e.currentTarget as unknown as Element).releasePointerCapture(e.pointerId);
        } catch {
          /* déjà relâché */
        }
        if (d && live) onDrop(live);
        setLive(null);
      }}
    />
  );
};

/**
 * Calque des fils : il lit la position réelle des bornes dans le DOM
 * (attribut data-wire-anchor) et trace le tracé enregistré du fil.
 * Il est placé dans la surface transformée (zoom/déplacement), donc les
 * coordonnées sont converties en px de plan.
 */
export const CableOverlay: React.FC<CableOverlayProps> = ({
  project,
  surfaceRef,
  zoom,
  preview,
  selectedWireId,
  onSelectWire,
  onMoveWire,
}) => {
  const [drawn, setDrawn] = useState<Drawn[]>([]);
  const [tick, setTick] = useState(0);

  // Recalcul après la fin de la transition de zoom et au redimensionnement.
  useEffect(() => {
    const t = window.setTimeout(() => setTick((n) => n + 1), 120);
    const onResize = () => setTick((n) => n + 1);
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [project, zoom]);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) {
      setDrawn([]);
      return;
    }
    const wires: CableWire[] = project.wires ?? [];
    const out: Drawn[] = [];

    const make = (
      id: string,
      from: string,
      to: string,
      route: Pt[] | undefined,
      color: string,
      thickness: WireThickness
    ) => {
      const a = locateAnchor(surface, from, zoom);
      const b = locateAnchor(surface, to, zoom);
      if (!a || !b) return; // appareil ou bornier supprimé
      const pts = route ? pointsFromRoute(route, a, b) : defaultRoute(a, b);
      out.push({ ...buildDrawn(id, pts, color, thickness), wireId: id === 'preview' ? undefined : id, pts });
    };

    for (const w of wires) {
      make(w.id, w.from, w.to, w.route, w.color, w.thickness);
    }
    if (preview) {
      make('preview', preview.from, preview.to, preview.route, preview.color, preview.thickness);
    }
    setDrawn(out);
  }, [project, zoom, tick, surfaceRef, preview]);

  return (
    <svg
      className="absolute left-0 top-0 pointer-events-none"
      width={1}
      height={1}
      style={{ overflow: 'visible', zIndex: 45 }}
    >
      {drawn.map((d) => (
        <g key={d.id}>
          {/* Zone de clic élargie : sélectionne le fil */}
          {d.wireId && (
            <path
              d={d.d}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(14, d.px + 12)}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelectWire?.(d.wireId === selectedWireId ? null : d.wireId!);
              }}
            />
          )}
          {/* Liseré noir, puis âme de couleur : le fil ressort sur le plan */}
          <path
            d={d.d}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={d.px + 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={d.d}
            fill="none"
            stroke={d.color}
            strokeWidth={d.px}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {d.tips.map((t, i) => (
            <line
              key={i}
              x1={t[0].x}
              y1={t[0].y}
              x2={t[1].x}
              y2={t[1].y}
              stroke={COPPER}
              strokeWidth={d.px}
              strokeLinecap="round"
            />
          ))}
          {/* Poignées des coudes, visibles quand le fil est sélectionné */}
          {d.wireId && d.wireId === selectedWireId &&
            (d.pts ?? []).slice(1, -1).map((p, i) => (
              <WireHandle
                key={`h-${i}`}
                at={p}
                zoom={zoom}
                onDrop={(np) =>
                  onMoveWire?.(
                    d.wireId!,
                    (d.pts ?? []).map((q, k) => (k === i + 1 ? np : q))
                  )
                }
              />
            ))}
        </g>
      ))}
    </svg>
  );
};
