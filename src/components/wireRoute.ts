/**
 * Tracé orthogonal d'un fil, guidé par les flèches.
 *
 * Un tracé complet est une liste de points en px de plan :
 *   [borne A, départ A, ...coudes..., arrivée B, borne B]
 * Les points « intérieurs » (départ → arrivée) sont découpés en segments.
 * Règle de parité : le segment k est horizontal si k est pair, vertical sinon.
 */

export type Pt = { x: number; y: number };
export type WireDir = 'up' | 'down' | 'left' | 'right';
export interface LocatedAnchor {
  p: Pt; // point de la borne, en px de plan
  dir: -1 | 1; // -1 : borne haute (le fil part vers le haut), 1 : borne basse
}

export const STUB = 22; // départ droit depuis la borne, en px de plan
export const BASE_STEP = 10; // distance d'un appui sur une flèche à pas = 1x
export const STEP_MIN = 0.2;
export const STEP_MAX = 2;
export const STEP_DEFAULT = 1;

/** Tracé automatique : départ droit, un coude, arrivée droite. */
export function defaultRoute(a: LocatedAnchor, b: LocatedAnchor): Pt[] {
  const pa = { x: a.p.x, y: a.p.y + a.dir * STUB };
  const pb = { x: b.p.x, y: b.p.y + b.dir * STUB };
  const corner = { x: pb.x, y: pa.y };
  return [a.p, pa, corner, pb, b.p];
}

/** Points intérieurs, du départ à l'arrivée (sans les bornes). */
export const innerOf = (route: Pt[]): Pt[] => route.slice(1, -1);

export const withInner = (route: Pt[], inner: Pt[]): Pt[] => [
  route[0],
  ...inner,
  route[route.length - 1],
];

export const segmentCount = (inner: Pt[]): number => inner.length - 1;

export const isHorizontal = (k: number): boolean => k % 2 === 0;

export const isLastSegment = (inner: Pt[], k: number): boolean =>
  k === inner.length - 2;

export type EditResult = { ok: true; inner: Pt[] } | { ok: false; reason: string };

/**
 * Déplace le segment k d'une distance `delta` (px de plan) dans la direction donnée.
 * Tous les segments sont libres, y compris le dernier :
 *  - dernier segment horizontal : il glisse en ↑ ↓ (la borne garde son départ droit) ;
 *  - dernier segment vertical : en ← → on ajoute un décrochage pour que le fil
 *    entre toujours droit dans la borne, sans être « collé » à elle.
 */
export function moveSegment(inner: Pt[], k: number, dir: WireDir, delta: number): EditResult {
  if (k < 0 || k >= segmentCount(inner)) {
    return { ok: false, reason: 'Segment introuvable' };
  }
  const horizontal = isHorizontal(k);
  if (horizontal && (dir === 'left' || dir === 'right')) {
    return { ok: false, reason: 'Ce segment se déplace avec ↑ et ↓' };
  }
  if (!horizontal && (dir === 'up' || dir === 'down')) {
    return { ok: false, reason: 'Ce segment se déplace avec ← et →' };
  }
  const sign = dir === 'down' || dir === 'right' ? 1 : -1;
  const next = inner.map((p) => ({ ...p }));
  if (horizontal) {
    next[k].y += sign * delta;
    next[k + 1].y += sign * delta;
    return { ok: true, inner: next };
  }
  const last = isLastSegment(inner, k);
  const entry = { ...inner[k + 1] }; // point d'entrée droit dans la borne
  next[k].x += sign * delta;
  next[k + 1].x += sign * delta;
  if (last) next.push(entry); // décrochage : le fil revient droit sur la borne
  return { ok: true, inner: next };
}

/**
 * Ajoute un décrochage (« coude ») sur le segment k. Le point d'arrivée q du
 * segment est remplacé par trois points : le décrochage fait une perpendiculaire
 * de longueur `jog`, puis revient sur l'axe. Le nombre de segments augmente de 2,
 * l'alternance horizontal/vertical est donc conservée.
 * Le segment central (k+1) devient le segment actif.
 */
export function addJog(inner: Pt[], k: number, jog: number): EditResult {
  if (k < 0 || k >= segmentCount(inner)) {
    return { ok: false, reason: 'Segment introuvable' };
  }
  if (isLastSegment(inner, k) && !isHorizontal(k)) {
    return { ok: false, reason: 'Déplacez ce segment avec ← → pour créer un décrochage' };
  }
  const p = inner[k];
  const q = inner[k + 1];
  let a: Pt, b: Pt, c: Pt;
  if (isHorizontal(k)) {
    const mx = (p.x + q.x) / 2;
    a = { x: mx, y: p.y };
    b = { x: mx, y: p.y + jog };
    c = { x: q.x, y: p.y + jog };
  } else {
    const my = (p.y + q.y) / 2;
    a = { x: p.x, y: my };
    b = { x: p.x + jog, y: my };
    c = { x: p.x + jog, y: q.y };
  }
  return { ok: true, inner: [...inner.slice(0, k + 1), a, b, c, ...inner.slice(k + 2)] };
}

/**
 * Chemin arrondi : chaque coude est remplacé par une courbe quadratique
 * de rayon `radius` (réduit si un segment est trop court).
 */
export function roundedPath(pts: Pt[], radius = 10): string {
  if (pts.length === 0) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const c = pts[i];
    const next = pts[i + 1];
    const l1 = Math.hypot(prev.x - c.x, prev.y - c.y);
    const l2 = Math.hypot(next.x - c.x, next.y - c.y);
    if (l1 < 1 || l2 < 1) {
      d += ` L ${c.x} ${c.y}`;
      continue;
    }
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const a = { x: c.x + ((prev.x - c.x) * r) / l1, y: c.y + ((prev.y - c.y) * r) / l1 };
    const b = { x: c.x + ((next.x - c.x) * r) / l2, y: c.y + ((next.y - c.y) * r) / l2 };
    d += ` L ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}
