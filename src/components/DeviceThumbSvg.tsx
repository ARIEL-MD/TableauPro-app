import React from 'react';
import { Meter1PSvg, Meter3PSvg } from './MeterSvg';
import { TerminalBarGraphic } from './TerminalBarGraphic';
import { ChangeoverDevice, GuardmotorDevice, IndicatorLightDevice } from './RefDevices';
import { DistributionBlockThumb } from './DistributionBlockThumb';

interface DeviceThumbSvgProps {
  type: string;
  className?: string;
  color?: string;
  /** Extra shape hint: terminal bar kind ('screw' | 'spring'), distribution block config ('2x7'), comb poles ('1'..'4'). */
  variant?: string;
  /** Number of contacts (terminal bars) or modules (combs). */
  count?: number;
  /** DIN rail length in mm. */
  length?: number;
  /** Plaquette de calibre affichée sur le boîtier (ex. « C16 », « 25A 30mA »). */
  label?: string;
}

export const STRIPE_COLORS: Record<string, string> = {
  red: '#d32f2f',
  green: '#43a047',
  blue: '#2f80ed',
  orange: '#f28c28',
  yellow: '#e8c52e',
};

type ModularKind = 'mcb' | 'rccb' | 'rcbo' | 'sd';

interface ModularDeviceProps {
  kind: ModularKind;
  modules: number;
  slim?: boolean;
  stripe: string;
  className?: string;
  label?: string;
}

/**
 * Realistic front view of a DIN-rail modular device (1 module = 18 mm).
 * Light grey body, coloured band, screw terminals top/bottom, black toggle.
 */
/* Couleur de la bande selon la courbe de déclenchement (comme sur les appareils du commerce) */
const CURVE_BAND: Record<string, string> = {
  B: '#2f6fb0',
  C: '#f08a24',
  D: '#c0392b',
  K: '#2e9e5b',
  Z: '#8e44ad',
  A: '#e6b800',
};

const ModularDevice: React.FC<ModularDeviceProps> = ({ kind, modules, slim, stripe, className, label }) => {
  // La bande suit la courbe quand le libellé l'indique (ex. « C16 »), sinon la couleur choisie.
  const curveMatch = label && (kind === 'mcb' || kind === 'rcbo') ? /^([ABCDKZ])\d/.exec(label) : null;
  const bandFill = curveMatch ? CURVE_BAND[curveMatch[1]] : stripe;
  // Cotes réelles en millimètres (fiches fabricants) : module 18 mm, hauteur 90 mm.
  // Le dessin utilise 2 unités par mm.
  const K = 2;
  const MOD = 18;
  const HMM = 90;
  const P = 2 * K;
  const cols = slim ? 1 : modules;
  const WMM = cols * MOD;
  const W = WMM * K;
  const H = HMM * K;
  const isRes = kind === 'rccb' || kind === 'rcbo';
  const handleFill = kind === 'sd' ? '#c0392b' : isRes ? '#2f6fb0' : 'url(#md-handle)';
  const u = (mm: number) => mm * K;

  const screw = (x: number, y: number) => (
    <g>
      <circle cx={x} cy={y} r={u(2.9)} fill="url(#md-screw)" stroke="#6b7280" strokeWidth={0.3 * K} />
      <path
        d={`M${x - u(1.6)} ${y - u(1.6)} L${x + u(1.6)} ${y + u(1.6)} M${x + u(1.6)} ${y - u(1.6)} L${x - u(1.6)} ${y + u(1.6)}`}
        stroke="#3f4650"
        strokeWidth={0.5 * K}
        strokeLinecap="round"
      />
    </g>
  );

  const labelW = label ? u(label.length * 2.1 + 2.6) : 0;
  const labelH = u(4.8);

  return (
    <svg viewBox={`0 0 ${W + P * 2} ${H + P * 2}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="md-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e3e7ec" />
          <stop offset="0.3" stopColor="#ffffff" />
          <stop offset="0.75" stopColor="#f7f8fa" />
          <stop offset="1" stopColor="#dde2e8" />
        </linearGradient>
        <linearGradient id="md-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.2" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.9" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="md-screw" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#b7bdc6" />
          <stop offset="1" stopColor="#7d8592" />
        </radialGradient>
        <linearGradient id="md-handle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a828e" />
          <stop offset="1" stopColor="#3a4049" />
        </linearGradient>
        <filter id="md-shadow" x="-10%" y="-5%" width="130%" height="120%">
          <feDropShadow dx={0.6 * K} dy={1 * K} stdDeviation={0.8 * K} floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Boîtier */}
      <rect x={P} y={P} width={W} height={H} rx={u(2)} fill="url(#md-body)" stroke="#3a4049" strokeWidth={0.35 * K} filter="url(#md-shadow)" />
      <rect x={P + u(0.5)} y={P + u(0.5)} width={W - u(1)} height={H - u(1)} rx={u(1.6)} fill="url(#md-gloss)" />

      {/* Séparations entre pôles */}
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <line key={`sep-${i}`} x1={P + u((i + 1) * MOD)} y1={P + u(1)} x2={P + u((i + 1) * MOD)} y2={P + H - u(1)} stroke="#a8aeb7" strokeWidth={0.5 * K} />
      ))}

      {Array.from({ length: cols }).map((_, i) => {
        const cx = P + u(i * MOD + MOD / 2);
        const left = P + u(i * MOD + 2);
        const bw = u(MOD - 4);
        return (
          <g key={`pole-${i}`}>
            {/* Bornes haute et basse, vis cruciforme (une par borne en 1P, deux en 2P+ par module) */}
            <rect x={left} y={P + u(3)} width={bw} height={u(9)} rx={u(1.2)} fill="#c2c8d0" stroke="#5b626c" strokeWidth={0.4 * K} />
            <rect x={left + u(0.8)} y={P + u(4)} width={bw - u(1.6)} height={u(1.4)} rx={u(0.4)} fill="#e9ecf0" />
            <rect x={left} y={P + u(H / K - 12)} width={bw} height={u(9)} rx={u(1.2)} fill="#c2c8d0" stroke="#5b626c" strokeWidth={0.4 * K} />
            <rect x={left + u(0.8)} y={P + u(H / K - 11)} width={bw - u(1.6)} height={u(1.4)} rx={u(0.4)} fill="#e9ecf0" />
            {cols > 1 || slim ? (
              slim ? (
                <>
                  {screw(cx, P + u(7.5))}
                  {screw(cx, P + H - u(7.5))}
                </>
              ) : (
                <>
                  {screw(cx - u(4.5), P + u(7.5))}
                  {screw(cx + u(4.5), P + u(7.5))}
                  {screw(cx - u(4.5), P + H - u(7.5))}
                  {screw(cx + u(4.5), P + H - u(7.5))}
                </>
              )
            ) : (
              <>
                {screw(cx, P + u(7.5))}
                {screw(cx, P + H - u(7.5))}
              </>
            )}
            {/* Bande de couleur (repère de la gamme) */}
            <rect x={P + u(i * MOD + 0.8)} y={P + u(14.6)} width={u(MOD - 1.6)} height={u(3.4)} rx={u(0.4)} fill={bandFill} />
            {/* Repères imprimés */}
            <rect x={P + u(i * MOD + 3)} y={P + u(62)} width={u(MOD - 6)} height={u(0.9)} fill="#9aa1ab" />
            <rect x={P + u(i * MOD + 3)} y={P + u(65)} width={u(MOD - 6)} height={u(0.9)} fill="#9aa1ab" />
            {/* Voyant vert */}
            <rect x={cx - u(1.6)} y={P + u(57)} width={u(3.2)} height={u(1.6)} rx={u(0.4)} fill="#2e9e5b" />
            {/* Manette */}
            <rect x={P + u(i * MOD + 3.8)} y={P + u(32.5)} width={u(MOD - 7.6)} height={u(19)} rx={u(1.4)} fill={handleFill} stroke="#23272e" strokeWidth={0.4 * K} />
            <rect x={P + u(i * MOD + 5)} y={P + u(34)} width={u(MOD - 10)} height={u(3.4)} rx={u(0.8)} fill="#ffffff" opacity={0.28} />
          </g>
        );
      })}

      {/* Barre commune reliant les manettes des pôles multiples */}
      {cols > 1 && <rect x={P + u(4)} y={P + u(43)} width={W - u(8)} height={u(2.2)} rx={u(0.8)} fill="#23272e" />}

      {/* Plaquette de calibre */}
      {label && (
        <g>
          <rect x={P + W / 2 - labelW / 2} y={P + u(22)} width={labelW} height={labelH} rx={u(0.6)} fill="#111827" />
          <text x={P + W / 2} y={P + u(22 + 4.2 * 0.74)} fontSize={u(3.2)} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif">
            {label}
          </text>
        </g>
      )}

      {/* Bouton test (différentiels) */}
      {isRes && (
        <g>
          <ellipse cx={P + u(4.5)} cy={P + u(58)} rx={u(3.2)} ry={u(1.8)} fill="#ffffff" stroke="#8b929e" strokeWidth={0.3 * K} />
          <text x={P + u(4.5)} y={P + u(59.1)} fontSize={u(2)} fontWeight="bold" textAnchor="middle" fill="#1e7fd6" fontFamily="Arial, sans-serif">T</text>
        </g>
      )}
    </svg>
  );
};


/**
 * Disjoncteur modulaire MCB (1P, 2P, 3P, 4P, 1P+N) dessiné à l'identique de l'image de référence :
 * boîtier blanc plat à fin liseré gris, vis grises, bande rouge continue, plaquette noire « C16 »,
 * manettes noires dans leur cadre reliées par une barre, voyant vert à gauche de chaque pôle.
 * Toutes les cotes sont des fractions de la hauteur relevées sur l'image.
 */
const McbDevice: React.FC<{
  modules: number;
  slim?: boolean;
  stripe: string;
  className?: string;
  label?: string;
}> = ({ modules, slim, stripe, className, label }) => {
  const K = 2; // 2 unités par mm
  const MOD = 18;
  const HMM = 90;
  const P = 4;
  const cols = slim ? 1 : modules;
  const u = (mm: number) => mm * K;
  const modW = u(MOD);
  const W = cols * modW;
  const H = u(HMM);
  const fy = (f: number) => P + f * H;
  const band = stripe === STRIPE_COLORS.red ? '#e8141b' : stripe;

  const screw = (cx: number, cy: number, r: number, key: string) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={r} fill="url(#mcb-screw)" stroke="#5f646b" strokeWidth={0.5 * K} />
      <path
        d={`M${cx - r * 0.45} ${cy - r * 0.45} L${cx + r * 0.45} ${cy + r * 0.45} M${cx + r * 0.45} ${cy - r * 0.45} L${cx - r * 0.45} ${cy + r * 0.45}`}
        stroke="#4a4f56"
        strokeWidth={r * 0.2}
        strokeLinecap="round"
      />
    </g>
  );

  const labelFontMm = label ? Math.min(5.8, 10.6 / (label.length * 0.6)) : 0;
  const labelW = u(12.2);
  const labelY = fy(0.332);
  const labelH = fy(0.406) - labelY;

  return (
    <svg viewBox={`0 0 ${W + P * 2} ${H + P * 2}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="mcb-screw" cx="0.4" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#a1a5aa" />
          <stop offset="1" stopColor="#868a90" />
        </radialGradient>
      </defs>

      {/* Boîtier plat blanc */}
      <rect x={P} y={P} width={W} height={H} rx={u(0.8)} fill="#f5f6f7" stroke="#8e939a" strokeWidth={0.7 * K} />

      {/* Liserés de séparation entre pôles */}
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <line key={`sep-${i}`} x1={P + (i + 1) * modW} y1={P} x2={P + (i + 1) * modW} y2={P + H} stroke="#d5d8dc" strokeWidth={0.6 * K} />
      ))}

      {/* Bandes grises haute et basse */}
      <rect x={P + 0.4} y={fy(0.205)} width={W - 0.8} height={fy(0.234) - fy(0.205)} fill="#d8dbdd" />
      <rect x={P + 0.4} y={fy(0.732)} width={W - 0.8} height={fy(0.757) - fy(0.732)} fill="#eceeef" />
      <rect x={P + 0.4} y={fy(0.77)} width={W - 0.8} height={fy(0.795) - fy(0.77)} fill="#d8dbdd" />

      {/* Bande rouge continue */}
      <rect x={P + 0.4} y={fy(0.252)} width={W - 0.8} height={fy(0.288) - fy(0.252)} fill={band} />

      {/* Vis : une par pôle, ou deux petites en 1P+N, avec repère N */}
      {slim ? (
        <>
          {[0.27, 0.76].map((fx) => screw(P + fx * modW, fy(0.09), u(2.9), `st-${fx}`))}
          {[0.27, 0.76].map((fx) => screw(P + fx * modW, fy(0.912), u(2.9), `sb-${fx}`))}
          <text x={P + W - u(0.5)} y={fy(0.185)} fontSize={u(5.2)} textAnchor="end" fill="#5a5f65" fontFamily="Arial, sans-serif">N</text>
          <text x={P + W - u(0.5)} y={fy(0.855)} fontSize={u(5.2)} textAnchor="end" fill="#5a5f65" fontFamily="Arial, sans-serif">N</text>
        </>
      ) : (
        Array.from({ length: cols }).map((_, i) => {
          const cx = P + i * modW + modW / 2;
          return (
            <g key={`sc-${i}`}>
              {screw(cx, fy(0.09), u(4.15), 'top')}
              {screw(cx, fy(0.912), u(4.15), 'bot')}
            </g>
          );
        })
      )}

      {/* Plaquette de calibre */}
      {label && (
        <g>
          <rect x={P + W / 2 - labelW / 2} y={labelY} width={labelW} height={labelH} rx={u(1)} fill="#0b0b0c" />
          <text
            x={P + W / 2}
            y={labelY + labelH / 2 + u(labelFontMm) * 0.36}
            fontSize={u(labelFontMm)}
            fontWeight="bold"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {label}
          </text>
        </g>
      )}

      {/* Cadres et manettes */}
      {Array.from({ length: cols }).map((_, i) => {
        const cx = P + i * modW + modW / 2;
        const fy0 = fy(0.44);
        return (
          <g key={`hd-${i}`}>
            <rect x={cx - u(6.7)} y={fy0} width={u(13.4)} height={fy(0.55) - fy0} rx={u(0.6)} fill="#e2e4e6" stroke="#9ea3a9" strokeWidth={0.5 * K} />
            <rect x={cx - u(6.7)} y={fy0} width={u(13.4)} height={u(0.6)} rx={u(0.3)} fill="#2b2e31" />
            <rect x={cx - u(4.45)} y={fy(0.47)} width={u(8.9)} height={fy(0.552) - fy(0.47)} rx={u(0.6)} fill="#2e3236" />
            {[0.485, 0.503, 0.521].map((f) => (
              <rect key={f} x={cx - u(3.8)} y={fy(f)} width={u(7.6)} height={u(0.4)} fill="#4a4f54" />
            ))}
            {slim && <rect x={cx - u(2.6)} y={fy(0.482)} width={u(5.2)} height={u(1)} rx={u(0.3)} fill="#3fcf85" opacity={0.85} />}
          </g>
        );
      })}

      {/* Barre noire commune sous les manettes */}
      <rect x={P + u(1.5)} y={fy(0.545)} width={W - u(3)} height={fy(0.607) - fy(0.545)} rx={u(0.8)} fill="#34383c" stroke="#1d2023" strokeWidth={0.4 * K} />

      {/* Voyants verts (à gauche de chaque pôle, absents du 1P+N) */}
      {!slim &&
        Array.from({ length: cols }).map((_, i) => (
          <rect
            key={`led-${i}`}
            x={P + i * modW + u(2.2)}
            y={fy(0.646)}
            width={u(5.5)}
            height={fy(0.678) - fy(0.646)}
            rx={u(0.4)}
            fill="#0f7d3d"
            stroke="#2fb36b"
            strokeWidth={0.5 * K}
          />
        ))}
    </svg>
  );
};


/* ------------------------------------------------------------------ */
/*  Appareils « référence » : RCD (RCCB), RCBO, contacteur 1M           */
/*  Même langage graphique que McbDevice : cotes = fractions de la      */
/*  hauteur relevées sur les images de référence.                       */
/* ------------------------------------------------------------------ */

const REF_RED = '#e8141b';
const refBand = (stripe: string) => (stripe === STRIPE_COLORS.red ? REF_RED : stripe);

const refGeom = (cols: number) => {
  const K = 2;
  const u = (mm: number) => mm * K;
  const modW = u(18);
  const W = cols * modW;
  const H = u(90);
  const P = 4;
  const fy = (f: number) => P + f * H;
  return { u, modW, W, H, P, fy, vb: `0 0 ${W + P * 2} ${H + P * 2}` };
};
type RefGeom = ReturnType<typeof refGeom>;

const REF_FONT = 'Arial, Helvetica, sans-serif';

const RefScrew: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="url(#ref-screw)" stroke="#5f646b" strokeWidth={1} />
    <path
      d={`M${cx - r * 0.45} ${cy - r * 0.45} L${cx + r * 0.45} ${cy + r * 0.45} M${cx + r * 0.45} ${cy - r * 0.45} L${cx - r * 0.45} ${cy + r * 0.45}`}
      stroke="#4a4f56"
      strokeWidth={r * 0.2}
      strokeLinecap="round"
    />
  </g>
);

const RefLed: React.FC<{ g: RefGeom; x: number; f: number; w?: number }> = ({ g, x, f, w = 5.5 }) => (
  <rect x={x} y={g.fy(f)} width={g.u(w)} height={g.fy(f + 0.032) - g.fy(f)} rx={g.u(0.4)} fill="#0f7d3d" stroke="#2fb36b" strokeWidth={1} />
);

interface RefLayout {
  mid: string;
  grayTop: [number, number];
  grayBottom: [number, number, string][];
  red: [number, number];
}
const RCD_LAYOUT: RefLayout = {
  mid: '#ebedef',
  grayTop: [0.205, 0.234],
  grayBottom: [[0.732, 0.757, '#eceeef'], [0.77, 0.795, '#d8dbdd']],
  red: [0.252, 0.288],
};

const RefShell: React.FC<{ g: RefGeom; cols: number; band: string; layout: RefLayout; children?: React.ReactNode }> = ({ g, cols, band, layout, children }) => {
  const { P, W, H, modW, fy, u } = g;
  return (
    <>
      <defs>
        <radialGradient id="ref-screw" cx="0.4" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#a1a5aa" />
          <stop offset="1" stopColor="#868a90" />
        </radialGradient>
      </defs>
      <rect x={P} y={P} width={W} height={H} rx={u(0.8)} fill="#f5f6f7" stroke="#8e939a" strokeWidth={1.4} />
      <rect x={P + 0.4} y={fy(layout.red[1])} width={W - 0.8} height={fy(0.735) - fy(layout.red[1])} fill={layout.mid} />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <g key={`sep-${i}`} stroke="#d0d3d8" strokeWidth={1.2}>
          <line x1={P + (i + 1) * modW} y1={P} x2={P + (i + 1) * modW} y2={fy(layout.red[0])} />
          <line x1={P + (i + 1) * modW} y1={fy(0.735)} x2={P + (i + 1) * modW} y2={P + H} />
        </g>
      ))}
      <rect x={P + 0.4} y={fy(layout.grayTop[0])} width={W - 0.8} height={fy(layout.grayTop[1]) - fy(layout.grayTop[0])} fill="#d8dbdd" />
      {layout.grayBottom.map(([a, b, c]) => (
        <rect key={a} x={P + 0.4} y={fy(a)} width={W - 0.8} height={fy(b) - fy(a)} fill={c} />
      ))}
      <rect x={P + 0.4} y={fy(layout.red[0])} width={W - 0.8} height={fy(layout.red[1]) - fy(layout.red[0])} fill={band} />
      {children}
    </>
  );
};

/** Découpe « A 25A 30mA » en trois lignes pour la plaquette noire. */
const parseRcdLabel = (text: string) => {
  const m = /^(\S+)\s+(\d+(?:[.,]\d+)?A)\s+(\d+)\s*mA$/i.exec(text.trim());
  return m ? { kind: m[1], cal: m[2], sens: `${m[3]} mA` } : null;
};

/** Bouton test (ovale blanc + « TEST »). */
const RefTest: React.FC<{ g: RefGeom; cx: number }> = ({ g, cx }) => {
  const { u, fy } = g;
  return (
    <g>
      <ellipse cx={cx} cy={fy(0.354)} rx={u(4.5)} ry={u(2.2)} fill="#ffffff" stroke="#8b9097" strokeWidth={1} />
      <text x={cx} y={fy(0.354) + u(0.85)} fontSize={u(2.4)} fontWeight="bold" textAnchor="middle" fill="#6b7280" fontFamily={REF_FONT}>T</text>
      <text x={cx + u(6.4)} y={fy(0.354) + u(0.85)} fontSize={u(2.3)} fontWeight="bold" fill="#5b6067" fontFamily={REF_FONT}>TEST</text>
    </g>
  );
};

/** Différentiel RCCB 2P / 4P : plaquette noire + grosse manette bleue sur le dernier module. */
const RcdDevice: React.FC<{ modules: number; stripe: string; className?: string; label?: string }> = ({ modules, stripe, className, label }) => {
  const g = refGeom(modules);
  const { u, modW, W, P, fy } = g;
  const lml = P + W - modW; // bord gauche du dernier module
  const plateL = lml - modW + u(2.3);
  const plateW = u(12.1);
  const plateCx = plateL + plateW / 2;
  const plateY = fy(0.463);
  const plateH = fy(0.639) - plateY;
  const text = label === undefined ? 'A 25A 30mA' : label;
  const parts = parseRcdLabel(text);

  return (
    <svg viewBox={g.vb} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <RefShell g={g} cols={modules} band={refBand(stripe)} layout={RCD_LAYOUT}>
        {Array.from({ length: modules }).map((_, i) => {
          const cx = P + i * modW + modW / 2;
          return (
            <g key={`s-${i}`}>
              <RefScrew cx={cx} cy={fy(0.09)} r={u(4.15)} />
              <RefScrew cx={cx} cy={fy(0.912)} r={u(4.15)} />
            </g>
          );
        })}
        {modules === 4 && (
          <>
            <text x={P + modW / 2} y={fy(0.172)} fontSize={u(2.6)} textAnchor="middle" fill="#8b9097" fontFamily={REF_FONT}>N</text>
            <text x={P + modW / 2} y={fy(0.842)} fontSize={u(2.6)} textAnchor="middle" fill="#8b9097" fontFamily={REF_FONT}>N</text>
          </>
        )}

        <RefTest g={g} cx={plateCx} />
        <RefLed g={g} x={P + W - u(2.8) - u(6)} f={0.338} w={6} />

        {/* Plaquette noire */}
        <rect x={plateL} y={plateY} width={plateW} height={plateH} rx={u(1)} fill="#0b0b0c" />
        {parts ? (
          <>
            <text x={plateL + u(1.8)} y={plateY + plateH * 0.195 + u(1)} fontSize={u(2.8)} fontWeight="bold" fill="#ffffff" fontFamily={REF_FONT}>{parts.kind}</text>
            <text x={plateCx} y={plateY + plateH * 0.53 + u(1.95)} fontSize={u(5.4)} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily={REF_FONT}>{parts.cal}</text>
            <text x={plateCx} y={plateY + plateH * 0.84 + u(1.15)} fontSize={u(3.2)} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily={REF_FONT}>{parts.sens}</text>
          </>
        ) : (
          text && (
            <text x={plateCx} y={plateY + plateH / 2 + u(1.4)} fontSize={u(Math.min(4, 10 / (text.length * 0.6)))} fontWeight="bold" textAnchor="middle" fill="#ffffff" fontFamily={REF_FONT}>{text}</text>
          )
        )}

        {/* Cadre + manette bleue */}
        <rect x={lml - u(1.7)} y={fy(0.447)} width={u(17.7)} height={fy(0.6) - fy(0.447)} rx={u(0.8)} fill="#cfd3d8" stroke="#9aa0a8" strokeWidth={1} />
        <rect x={lml + u(1.1)} y={fy(0.482)} width={u(12.2)} height={fy(0.58) - fy(0.482)} rx={u(0.8)} fill="#1c63c6" />
        <rect x={lml + u(2)} y={fy(0.49)} width={u(10.3)} height={u(0.9)} rx={u(0.4)} fill="#4d8fe3" opacity={0.8} />
        <rect x={lml - u(1.6)} y={fy(0.571)} width={u(17.5)} height={fy(0.653) - fy(0.571)} rx={u(1.2)} fill="#2b7de6" stroke="#1a56ae" strokeWidth={1} />
        <rect x={lml - u(1.2)} y={fy(0.628)} width={u(16.7)} height={fy(0.65) - fy(0.628)} rx={u(0.8)} fill="#1f66c4" />
      </RefShell>
    </svg>
  );
};

/** Disjoncteur différentiel RCBO 2P / 1P+N : manette bleue (différentiel) + manette noire (disjoncteur). */
const RcboDevice: React.FC<{ stripe: string; className?: string }> = ({ stripe, className }) => {
  const g = refGeom(2);
  const { u, modW, W, P, fy } = g;
  const hc = [P + modW / 2 + u(0.5), P + modW + modW / 2 - u(1.1)];
  const tinyTop = ['L', 'N'];

  return (
    <svg viewBox={g.vb} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <RefShell g={g} cols={2} band={refBand(stripe)} layout={RCD_LAYOUT}>
        {hc.map((_, i) => {
          const cx = P + i * modW + modW / 2;
          return (
            <g key={`s-${i}`}>
              <RefScrew cx={cx} cy={fy(0.09)} r={u(4.15)} />
              <RefScrew cx={cx} cy={fy(0.912)} r={u(4.15)} />
              <text x={cx} y={fy(0.172)} fontSize={u(2.4)} textAnchor="middle" fill="#8b9097" fontFamily={REF_FONT}>{tinyTop[i]}</text>
              <text x={cx} y={fy(0.842)} fontSize={u(2.4)} textAnchor="middle" fill="#8b9097" fontFamily={REF_FONT}>{tinyTop[i]}</text>
            </g>
          );
        })}

        <RefTest g={g} cx={P + modW * 0.45} />

        {/* Cadres + manettes : bleue puis noire */}
        {hc.map((cx, i) => (
          <g key={`h-${i}`}>
            <rect x={cx - u(7.1)} y={fy(0.44)} width={u(14.2)} height={fy(0.55) - fy(0.44)} rx={u(0.6)} fill="#e2e4e6" stroke="#9ea3a9" strokeWidth={1} />
            <rect x={cx - u(7.1)} y={fy(0.44)} width={u(14.2)} height={u(0.6)} rx={u(0.3)} fill="#2b2e31" />
            <rect x={cx - u(5)} y={fy(0.47)} width={u(10)} height={fy(0.552) - fy(0.47)} rx={u(0.6)} fill={i === 0 ? '#1c63c6' : '#2e3236'} />
            {i === 0 ? (
              <rect x={cx - u(4.2)} y={fy(0.478)} width={u(8.4)} height={u(1)} rx={u(0.4)} fill="#4d8fe3" opacity={0.85} />
            ) : (
              [0.485, 0.503, 0.521].map((f) => <rect key={f} x={cx - u(4.2)} y={fy(f)} width={u(8.4)} height={u(0.4)} fill="#4a4f54" />)
            )}
          </g>
        ))}

        {/* Barre noire commune */}
        <rect x={P + u(2.3)} y={fy(0.545)} width={W - u(4.6)} height={fy(0.607) - fy(0.545)} rx={u(0.8)} fill="#2d3033" stroke="#1d2023" strokeWidth={0.8} />

        {/* Voyants verts sous chaque manette */}
        {hc.map((cx, i) => (
          <RefLed key={`l-${i}`} g={g} x={cx - u(3.2)} f={0.651} w={6.4} />
        ))}
      </RefShell>
    </svg>
  );
};

/** Contacteur modulaire 1 module : bornes 1/3 en haut, 2/4 en bas, bobine A1/A2, voyant vert. */
const CONTACTOR_LAYOUT: RefLayout = {
  mid: '#f3f4f5',
  grayTop: [0.223, 0.247],
  grayBottom: [[0.674, 0.694, '#eceeef'], [0.73, 0.755, '#d8dbdd']],
  red: [0.271, 0.307],
};

const Contactor1MDevice: React.FC<{ stripe: string; className?: string }> = ({ stripe, className }) => {
  const g = refGeom(1);
  const { u, modW, W, H, P, fy } = g;
  const fx = (f: number) => P + f * modW;
  const tiny = { fill: '#7a7f86', fontFamily: REF_FONT } as const;

  return (
    <svg viewBox={g.vb} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <RefShell g={g} cols={1} band={refBand(stripe)} layout={CONTACTOR_LAYOUT}>
        {/* Blocs de bornes haut et bas (2 vis chacun) */}
        {[0.053, 0.857].map((f0, k) => (
          <g key={`box-${k}`}>
            <rect x={fx(0.058)} y={fy(f0)} width={modW * 0.862} height={fy(f0 + 0.085) - fy(f0)} rx={u(1.6)} fill="#dde0e4" stroke="#b0b5bb" strokeWidth={1} />
            <RefScrew cx={fx(0.26)} cy={fy(f0 + 0.044)} r={u(3)} />
            <RefScrew cx={fx(0.726)} cy={fy(f0 + 0.044)} r={u(3)} />
          </g>
        ))}
        <text x={fx(0.26)} y={fy(0.042)} fontSize={u(2.2)} textAnchor="middle" {...tiny}>1</text>
        <text x={fx(0.726)} y={fy(0.042)} fontSize={u(2.2)} textAnchor="middle" {...tiny}>3</text>
        <text x={fx(0.26)} y={fy(0.972)} fontSize={u(2.2)} textAnchor="middle" {...tiny}>2</text>
        <text x={fx(0.726)} y={fy(0.972)} fontSize={u(2.2)} textAnchor="middle" {...tiny}>4</text>

        {/* Bobine A1 (haut) / A2 (bas) */}
        <RefScrew cx={fx(0.506)} cy={fy(0.184)} r={u(2.6)} />
        <RefScrew cx={fx(0.506)} cy={fy(0.795)} r={u(2.6)} />
        <text x={fx(0.17)} y={fy(0.19)} fontSize={u(2.6)} {...tiny}>A1</text>
        <text x={fx(0.17)} y={fy(0.801)} fontSize={u(2.6)} {...tiny}>A2</text>

        {/* Schéma de câblage imprimé */}
        <text x={fx(0.27)} y={fy(0.42)} fontSize={u(2.2)} {...tiny}>A1</text>
        <text x={fx(0.27)} y={fy(0.5)} fontSize={u(2.2)} {...tiny}>A2</text>
        <text x={fx(0.55)} y={fy(0.42)} fontSize={u(2.2)} {...tiny}>1</text>
        <text x={fx(0.55)} y={fy(0.5)} fontSize={u(2.2)} {...tiny}>2</text>
        <text x={fx(0.77)} y={fy(0.42)} fontSize={u(2.2)} {...tiny}>3</text>
        <text x={fx(0.77)} y={fy(0.5)} fontSize={u(2.2)} {...tiny}>4</text>
        <circle cx={fx(0.36)} cy={fy(0.46)} r={u(0.45)} fill="#7a7f86" />
        <circle cx={fx(0.8)} cy={fy(0.455)} r={u(0.5)} fill="#3a3f45" />

        {/* Voyant vert */}
        <RefLed g={g} x={fx(0.13)} f={0.585} w={5.5} />
      </RefShell>
    </svg>
  );
};

/** Contacteur 4NO (4 modules) : bornes 1-3-5-7 / 2-4-6-8, bobine A1/A2, schéma de contacts imprimé, voyant vert. */
const Contactor4NODevice: React.FC<{ stripe: string; className?: string }> = ({ stripe, className }) => {
  const g = refGeom(4);
  const { u, W, P, fy } = g;
  const fx = (f: number) => P + f * W;
  const tiny = { fill: '#7a7f86', fontFamily: REF_FONT } as const;
  const sx = [0.133, 0.33, 0.68, 0.88];
  const topNum = ['1', '3', '5', '7(13)'];
  const botNum = ['2', '4', '6', '8(14)'];
  const contactX = [0.38, 0.47, 0.56, 0.645];

  return (
    <svg viewBox={g.vb} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <RefShell g={g} cols={1} band={refBand(stripe)} layout={{ ...RCD_LAYOUT, mid: '#f1f2f3' }}>
        {sx.map((f, i) => (
          <g key={`t-${i}`}>
            <RefScrew cx={fx(f)} cy={fy(0.125)} r={u(4.15)} />
            <RefScrew cx={fx(f)} cy={fy(0.875)} r={u(4.15)} />
            <text x={fx(f)} y={fy(0.05)} fontSize={u(2.6)} textAnchor="middle" {...tiny}>{topNum[i]}</text>
            <text x={fx(f)} y={fy(0.972)} fontSize={u(2.6)} textAnchor="middle" {...tiny}>{botNum[i]}</text>
          </g>
        ))}

        {/* Bornes de bobine A1 (haut) / A2 (bas) */}
        <RefScrew cx={fx(0.505)} cy={fy(0.066)} r={u(1.7)} />
        <text x={fx(0.505)} y={fy(0.15)} fontSize={u(2.8)} textAnchor="middle" {...tiny}>A1</text>
        <text x={fx(0.505)} y={fy(0.855)} fontSize={u(2.8)} textAnchor="middle" {...tiny}>A2</text>
        <RefScrew cx={fx(0.505)} cy={fy(0.935)} r={u(1.7)} />

        {/* Schéma imprimé : bobine + 4 contacts */}
        <text x={fx(0.27)} y={fy(0.43)} fontSize={u(2.3)} textAnchor="middle" {...tiny}>A1</text>
        <text x={fx(0.27)} y={fy(0.585)} fontSize={u(2.3)} textAnchor="middle" {...tiny}>A2</text>
        <rect x={fx(0.23)} y={fy(0.455)} width={fx(0.31) - fx(0.23)} height={fy(0.51) - fy(0.455)} fill="none" stroke="#6b7076" strokeWidth={1} />
        {contactX.map((f, i) => {
          const x = fx(f);
          return (
            <g key={`c-${i}`} stroke="#6b7076" strokeWidth={1} strokeLinecap="round" fill="none">
              <path d={`M${x} ${fy(0.425)} V${fy(0.465)} L${x - u(1.6)} ${fy(0.5)} M${x} ${fy(0.525)} V${fy(0.565)}`} />
            </g>
          );
        })}
        <text x={fx(0.7)} y={fy(0.43)} fontSize={u(1.9)} {...tiny}>(13)</text>
        <text x={fx(0.7)} y={fy(0.575)} fontSize={u(1.9)} {...tiny}>(14)</text>

        {/* Voyant vert */}
        <rect x={fx(0.05)} y={fy(0.62)} width={fx(0.19) - fx(0.05)} height={fy(0.67) - fy(0.62)} rx={u(0.4)} fill="#0f7d3d" stroke="#2fb36b" strokeWidth={1} />
      </RefShell>
    </svg>
  );
};

/** AFDD + MCB (2 modules) ou AFDD + RCBO (3 modules) : voyants orange et blanc, manette(s) orange, voyants verts. */
const AFDD_ORANGE = '#e8622a';
const AfddDevice: React.FC<{ withRcbo: boolean; stripe: string; className?: string }> = ({ withRcbo, stripe, className }) => {
  const m = withRcbo ? 3 : 2;
  const g = refGeom(m);
  const { u, modW, W, P, fy } = g;
  const handleModules = withRcbo ? [1, 2] : [1];
  const screwModules = withRcbo ? [1, 2] : [0, 1];
  const hx = (k: number) => P + k * modW + modW / 2 - u(0.2);
  const firstL = hx(handleModules[0]) - u(6.8);
  const lastR = hx(handleModules[handleModules.length - 1]) + u(6.8);
  const tinyGrey = { fill: '#8b9097', fontFamily: REF_FONT } as const;

  return (
    <svg viewBox={g.vb} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="afdd-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f08a54" />
          <stop offset="1" stopColor={AFDD_ORANGE} />
        </linearGradient>
      </defs>
      <RefShell g={g} cols={withRcbo ? m : 1} band={refBand(stripe)} layout={RCD_LAYOUT}>
        {/* Bornes L / N en haut et en bas */}
        {screwModules.map((k, i) => {
          const cx = P + k * modW + modW / 2;
          const tag = i === 0 ? 'L' : 'N';
          return (
            <g key={`s-${k}`}>
              <RefScrew cx={cx} cy={fy(0.09)} r={u(4.15)} />
              <RefScrew cx={cx} cy={fy(0.912)} r={u(4.15)} />
              <text x={cx} y={fy(0.172)} fontSize={u(2.4)} textAnchor="middle" {...tinyGrey}>{tag}</text>
              <text x={cx} y={fy(0.842)} fontSize={u(2.4)} textAnchor="middle" {...tinyGrey}>{tag}</text>
            </g>
          );
        })}

        {/* Voyant orange (défaut d'arc) + voyant blanc (état) */}
        <ellipse cx={P + modW * 0.74} cy={fy(0.336)} rx={u(3.9)} ry={u(1.8)} fill={AFDD_ORANGE} stroke="#c2501b" strokeWidth={1} />
        <ellipse cx={P + modW * 0.74} cy={fy(0.336) - u(0.4)} rx={u(2.6)} ry={u(0.7)} fill="#f6a373" opacity={0.7} />
        <ellipse cx={P + modW * 1.46} cy={fy(0.336)} rx={u(3.9)} ry={u(1.8)} fill="#ffffff" stroke="#8b9097" strokeWidth={1} />
        <text x={P + modW * 1.46} y={fy(0.336) + u(0.85)} fontSize={u(2.4)} fontWeight="bold" textAnchor="middle" fill="#6b7280" fontFamily={REF_FONT}>1</text>

        {/* Pictogrammes imprimés à gauche : état et test */}
        <circle cx={P + modW * 0.48} cy={fy(0.5)} r={u(1.9)} fill="none" stroke="#9aa0a8" strokeWidth={1} />
        <circle cx={P + modW * 0.48} cy={fy(0.5)} r={u(0.7)} fill="#b5bac1" />
        <circle cx={P + modW * 0.48} cy={fy(0.58)} r={u(2.4)} fill="none" stroke="#9aa0a8" strokeWidth={1} />
        <text x={P + modW * 0.48} y={fy(0.58) + u(0.85)} fontSize={u(2.4)} fontWeight="bold" textAnchor="middle" {...tinyGrey}>T</text>

        {/* Manettes orange dans leur cadre */}
        {handleModules.map((k) => {
          const cx = hx(k);
          return (
            <g key={`h-${k}`}>
              <rect x={cx - u(6.8)} y={fy(0.435)} width={u(13.6)} height={fy(0.55) - fy(0.435)} rx={u(0.6)} fill="#e2e4e6" stroke="#9ea3a9" strokeWidth={1} />
              <rect x={cx - u(6.8)} y={fy(0.435)} width={u(13.6)} height={u(0.6)} rx={u(0.3)} fill="#2b2e31" />
              <rect x={cx - u(5)} y={fy(0.468)} width={u(10)} height={fy(0.552) - fy(0.468)} rx={u(0.6)} fill="url(#afdd-orange)" stroke="#c2501b" strokeWidth={0.8} />
              <rect x={cx - u(4)} y={fy(0.476)} width={u(8)} height={u(0.9)} rx={u(0.4)} fill="#f6a373" opacity={0.8} />
            </g>
          );
        })}

        {/* Barre orange commune sous les manettes */}
        <rect x={firstL} y={fy(0.545)} width={lastR - firstL} height={fy(0.607) - fy(0.545)} rx={u(0.8)} fill="url(#afdd-orange)" stroke="#c2501b" strokeWidth={0.8} />

        {/* Voyants verts */}
        {(withRcbo ? [1, 2] : [0, 1]).map((k) => (
          <RefLed key={`l-${k}`} g={g} x={P + k * modW + u(2.4)} f={0.646} w={5.5} />
        ))}
      </RefShell>
    </svg>
  );
};

/** Prise modulaire 2P+T (2 modules) : socle rond gris, deux alvéoles noires, bandes rouges interrompues. */
const SocketDevice: React.FC<{ stripe: string; className?: string }> = ({ stripe, className }) => {
  const g = refGeom(2);
  const { u, modW, W, P, fy } = g;
  const cx = P + W / 2;
  const cy = fy(0.49);
  const R = u(16.2);
  const band = refBand(stripe);
  const y0 = fy(RCD_LAYOUT.red[0]);
  const bh = fy(RCD_LAYOUT.red[1]) - y0;

  return (
    <svg viewBox={g.vb} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <RefShell g={g} cols={1} band="none" layout={{ ...RCD_LAYOUT, mid: '#eff0f2' }}>
        {/* Bandes rouges latérales (interrompues par le socle) */}
        <rect x={P + 0.4} y={y0} width={W * 0.2} height={bh} fill={band} />
        <rect x={P + W * 0.8 - 0.4} y={y0} width={W * 0.2} height={bh} fill={band} />

        {/* Bornes : une en haut (phase/neutre), deux en bas */}
        <RefScrew cx={cx} cy={fy(0.09)} r={u(4.15)} />
        <path d={`M${cx + u(8.6)} ${fy(0.075)} h${u(2.4)} l${-u(1.2)} ${u(2.1)} z`} fill="#8b9097" />
        <RefScrew cx={P + modW / 2} cy={fy(0.912)} r={u(4.15)} />
        <RefScrew cx={P + modW * 1.5} cy={fy(0.912)} r={u(4.15)} />

        {/* Socle rond */}
        <circle cx={cx} cy={cy} r={R + u(1.2)} fill="#ffffff" stroke="#c9cdd2" strokeWidth={1.2} />
        <circle cx={cx} cy={cy} r={R} fill="#9ca1a8" stroke="#8b9097" strokeWidth={1} />
        {/* Pattes de terre latérales et plots haut / bas */}
        <rect x={cx - R + u(0.4)} y={cy - u(2.4)} width={u(3.2)} height={u(4.8)} fill="#aeb3b9" />
        <rect x={cx + R - u(3.6)} y={cy - u(2.4)} width={u(3.2)} height={u(4.8)} fill="#aeb3b9" />
        <rect x={cx - u(3.4)} y={cy - R + u(1.2)} width={u(6.8)} height={u(3.2)} rx={u(0.6)} fill="#aeb3b9" />
        <rect x={cx - u(3.4)} y={cy + R - u(4.4)} width={u(6.8)} height={u(3.2)} rx={u(0.6)} fill="#aeb3b9" />
        {/* Alvéoles de phase et neutre + contact de terre central */}
        <circle cx={cx - u(6.9)} cy={cy} r={u(2.2)} fill="#111317" />
        <circle cx={cx + u(6.9)} cy={cy} r={u(2.2)} fill="#111317" />
        <circle cx={cx} cy={cy} r={u(1.8)} fill="#c9cdd2" stroke="#7b8087" strokeWidth={0.8} />
        <rect x={cx - u(0.5)} y={cy - u(1.1)} width={u(1)} height={u(2.2)} fill="#5f646b" />
      </RefShell>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="dt-body" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#d4d9e0" />
      <stop offset="0.35" stopColor="#f6f7f9" />
      <stop offset="0.7" stopColor="#eceff3" />
      <stop offset="1" stopColor="#c9ced6" />
    </linearGradient>
    <linearGradient id="dt-gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="0.25" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="0.85" stopColor="#000000" stopOpacity="0" />
      <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
    </linearGradient>
    <radialGradient id="dt-screw" cx="0.35" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.6" stopColor="#b7bdc6" />
      <stop offset="1" stopColor="#7d8592" />
    </radialGradient>
    <filter id="dt-shadow" x="-10%" y="-5%" width="130%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="1.4" floodOpacity="0.35" />
    </filter>
    <linearGradient id="dt-dark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4b5563" />
      <stop offset="1" stopColor="#1f2937" />
    </linearGradient>
    <linearGradient id="dt-steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e5e7eb" />
      <stop offset="0.45" stopColor="#b6bcc6" />
      <stop offset="1" stopColor="#8b929e" />
    </linearGradient>
    <linearGradient id="dt-blue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7aa7d6" />
      <stop offset="1" stopColor="#4b78a8" />
    </linearGradient>
    <linearGradient id="dt-brass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f3e08a" />
      <stop offset="1" stopColor="#c9a63a" />
    </linearGradient>
    <linearGradient id="dt-lcd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5fbf8f" />
      <stop offset="1" stopColor="#2f8f66" />
    </linearGradient>
  </defs>
);

const Screw: React.FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 4.2 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="url(#dt-screw)" stroke="#6b7280" strokeWidth={0.6} />
    <path
      d={`M${cx - r * 0.55} ${cy - r * 0.55} L${cx + r * 0.55} ${cy + r * 0.55} M${cx + r * 0.55} ${cy - r * 0.55} L${cx - r * 0.55} ${cy + r * 0.55}`}
      stroke="#3f4650"
      strokeWidth={r * 0.38}
      strokeLinecap="round"
    />
  </g>
);

const MODULE = 18;
const PAD = 2.5;
const H = 90;

/** Plain DIN body: `modules` wide, with dividers, screws and a band. */
const Body: React.FC<{
  modules: number;
  stripe?: string;
  screws?: boolean;
  children?: React.ReactNode;
  className?: string;
  h?: number;
}> = ({ modules, stripe = '#d32f2f', screws = true, children, className, h = H }) => {
  const W = modules * MODULE;
  return (
    <svg viewBox={`0 0 ${W + PAD * 2} ${h + PAD * 2}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      <Defs />
      <rect x={PAD} y={PAD} width={W} height={h} rx={2} fill="url(#dt-body)" stroke="#2b3038" strokeWidth={0.9} filter="url(#dt-shadow)" />
      <rect x={PAD + 0.5} y={PAD + 0.5} width={W - 1} height={h - 1} rx={1.6} fill="url(#dt-gloss)" />
      {Array.from({ length: Math.max(0, modules - 1) }).map((_, i) => (
        <line key={i} x1={PAD + (i + 1) * MODULE} y1={PAD + 1} x2={PAD + (i + 1) * MODULE} y2={PAD + h - 1} stroke="#b8bcc4" strokeWidth={0.7} />
      ))}
      {screws &&
        Array.from({ length: modules }).map((_, i) => (
          <React.Fragment key={i}>
            <Screw cx={PAD + i * MODULE + MODULE / 2} cy={PAD + 9} />
            <Screw cx={PAD + i * MODULE + MODULE / 2} cy={PAD + h - 9} />
          </React.Fragment>
        ))}
      {stripe && <rect x={PAD} y={PAD + 19} width={W} height={3.2} fill={stripe} />}
      {children}
    </svg>
  );
};

/** Tiny "printed text" lines to suggest a label. */
const TextLines: React.FC<{ x: number; y: number; w: number; n?: number }> = ({ x, y, w, n = 3 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <rect key={i} x={x} y={y + i * 3.4} width={i % 2 ? w * 0.65 : w} height={1.3} rx={0.6} fill="#9aa0a8" />
    ))}
  </g>
);

/* ------------------------------------------------------------------ */
/*  Relais temporisés — dessins calés sur la capture de référence       */
/* ------------------------------------------------------------------ */

const TIMER_BODY = '#dcdcde';
const TIMER_EDGE = '#c3c3c7';
const TIMER_GREY = '#8d9097';
const TIMER_RED = '#c8353a';

/** Relais temporisé électromécanique : cadran à anneau gris, 5 bornes en bas. */
const TimerMechDevice: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 188" className={className} fill="none" preserveAspectRatio="xMidYMid meet">
    <rect x={2} y={2} width={96} height={184} rx={2} fill={TIMER_BODY} stroke={TIMER_EDGE} strokeWidth={0.8} />
    {/* crans en haut + repères ◂ ▸ */}
    {[14, 33, 52, 71, 90].map((x) => (
      <rect key={x} x={x - 3} y={2} width={6} height={2.5} fill="#a9abb0" />
    ))}
    <path d="M46 12 L42.5 16 L46 20 Z" fill="#6f7176" />
    <path d="M90 12 L93.5 16 L90 20 Z" fill="#6f7176" />
    <line x1={4} y1={30} x2={96} y2={30} stroke={TIMER_EDGE} strokeWidth={0.7} />
    {/* bandeau rouge */}
    <rect x={0} y={44} width={100} height={8} rx={1} fill={TIMER_RED} />
    <rect x={0} y={44} width={100} height={2.5} rx={1} fill="#e0575a" opacity={0.6} />
    {/* cadran : l'anneau touche le bandeau rouge */}
    <circle cx={50} cy={95} r={37.5} stroke={TIMER_GREY} strokeWidth={9} />
    <circle cx={50} cy={95} r={33} fill="#e7e7e9" />
    {Array.from({ length: 48 }).map((_, i) => {
      const a = (i * Math.PI) / 24;
      const long = i % 4 === 0;
      const r1 = long ? 24 : 27;
      return (
        <line
          key={i}
          x1={50 + Math.sin(a) * r1}
          y1={95 - Math.cos(a) * r1}
          x2={50 + Math.sin(a) * 30}
          y2={95 - Math.cos(a) * 30}
          stroke="#9a9ca1"
          strokeWidth={long ? 1 : 0.6}
        />
      );
    })}
    <line x1={50} y1={95} x2={40} y2={78} stroke="#6f7176" strokeWidth={2.4} strokeLinecap="round" />
    <line x1={50} y1={95} x2={65} y2={109} stroke="#6f7176" strokeWidth={2.6} strokeLinecap="round" />
    <circle cx={50} cy={95} r={2} fill="#6f7176" />
    {/* petit levier à gauche sous le cadran */}
    <path d="M9 124 l5 6 M13 122 l4 7" stroke="#a5a7ab" strokeWidth={1.2} strokeLinecap="round" />
    {/* schéma de contacts */}
    <path d="M14 152 h12 M38 158 v-12 h14 v12 M72 148 h8 v10 h10" stroke="#a5a7ab" strokeWidth={0.8} />
    {/* 5 bornes, collées au bord bas */}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={5 + i * 18} y={162} width={15} height={24} rx={1.5} fill="#c9cacf" stroke="#aeb0b5" strokeWidth={0.6} />
        <circle cx={12.5 + i * 18} cy={171} r={4.6} fill={TIMER_GREY} />
        <line x1={9.8 + i * 18} y1={171} x2={15.2 + i * 18} y2={171} stroke="#6f7176" strokeWidth={0.9} />
        <rect x={8.5 + i * 18} y={179} width={8} height={4.5} rx={0.8} fill="#a3a5aa" />
      </g>
    ))}
  </svg>
);

/** Relais temporisé numérique : 4 bornes en haut/bas, écran vert, 4 boutons. */
const TimerDigitalDevice: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 84 200" className={className} fill="none" preserveAspectRatio="xMidYMid meet">
    <rect x={2} y={2} width={80} height={196} rx={2.5} fill={TIMER_BODY} stroke={TIMER_EDGE} strokeWidth={0.8} />
    {/* bornes du haut */}
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <circle cx={12 + i * 20} cy={18} r={6.6} fill={TIMER_GREY} />
        <circle cx={12 + i * 20} cy={18} r={3.6} fill="#7a7c82" />
        <text x={12 + i * 20} y={36} fontSize={5} textAnchor="middle" fill="#8a8c91" fontFamily="Arial, sans-serif">
          {i + 1}
        </text>
      </g>
    ))}
    {/* bandeau rouge */}
    <rect x={0} y={55} width={84} height={8} rx={1} fill={TIMER_RED} />
    <rect x={0} y={55} width={84} height={2.5} rx={1} fill="#e0575a" opacity={0.6} />
    {/* écran */}
    <rect x={11} y={66} width={62} height={52} fill="#3f8a68" />
    <circle cx={14} cy={125} r={2} fill="#6f7176" />
    {/* boutons */}
    {[10, 24].map((x) => (
      <rect key={x} x={x} y={139} width={12} height={11} rx={2} fill="#4a4a50" />
    ))}
    <circle cx={42} cy={144.5} r={1.4} fill="#4a4a50" />
    {[52, 66].map((x) => (
      <rect key={x} x={x} y={139} width={12} height={11} rx={2} fill="#4a4a50" />
    ))}
    {/* bornes du bas */}
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <text x={12 + i * 20} y={166} fontSize={5} textAnchor="middle" fill="#8a8c91" fontFamily="Arial, sans-serif">
          {i + 5}
        </text>
        <circle cx={12 + i * 20} cy={181} r={6.6} fill={TIMER_GREY} />
        <circle cx={12 + i * 20} cy={181} r={3.6} fill="#7a7c82" />
      </g>
    ))}
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Label → thumbnail type resolver (the drawer passes human labels)    */
/* ------------------------------------------------------------------ */

const resolveType = (raw: string): string => {
  if (raw.startsWith('Contacteur') || raw === 'Contactor') {
    if (raw.includes('4NO')) return 'Contactor 4NO';
    return 'Contactor 1M';
  }
  if (raw.startsWith('Télérupteur')) return 'Telerupteur';
  if (raw.startsWith('Relais temporisé') || raw === 'Timer') {
    return raw.includes('numérique') ? 'Timer digital' : 'Timer mech';
  }
  if (raw.startsWith('Relais de tension') || raw === 'VoltageRelay') {
    return raw.includes('3') ? 'VoltageRelay 3P' : 'VoltageRelay 1P';
  }
  if (raw.startsWith('SPD') || raw === 'SPD') return raw === 'SPD' ? 'SPD 1P' : raw;
  if (raw === 'Prise') return 'Socket';
  if (raw === 'Compteur monophasé' || raw === 'Meter') return 'Meter 1P';
  if (raw === 'Compteur triphasé') return 'Meter 3P';
  if (raw === 'Guardmotor') return 'Guardmotor';
  if (raw.startsWith('Interrupteur-sectionneur inverseur')) return 'SD Changeover';
  return raw;
};

/* ------------------------------------------------------------------ */
/*  Public component                                                    */
/* ------------------------------------------------------------------ */

export const DeviceThumbSvg: React.FC<DeviceThumbSvgProps> = ({
  type: rawType,
  className = 'h-16 w-auto max-w-full',
  color,
  variant,
  count,
  length,
  label,
}) => {
  const type = resolveType(rawType);
  const stripe = STRIPE_COLORS[color || 'red'] || STRIPE_COLORS.red;

  switch (type) {
    /* ---------- Breakers / RCD / RCBO / switch-disconnectors ---------- */
    case 'MCB 1P':
      return <McbDevice modules={1} stripe={stripe} className={className} label={label} />;
    case 'MCB 2P':
      return <McbDevice modules={2} stripe={stripe} className={className} label={label} />;
    case 'MCB 3P':
      return <McbDevice modules={3} stripe={stripe} className={className} label={label} />;
    case 'MCB 4P':
      return <McbDevice modules={4} stripe={stripe} className={className} label={label} />;
    case 'MCB 1P + N':
      return <McbDevice modules={1} slim stripe={stripe} className={className} label={label} />;
    case 'RCCB 2P':
      return <RcdDevice modules={2} stripe={stripe} className={className} label={label} />;
    case 'RCCB 4P':
      return <RcdDevice modules={4} stripe={stripe} className={className} label={label} />;
    case 'RCBO 2P':
    case 'RCBO 1P + N':
      return <RcboDevice stripe={stripe} className={className} />;
    case 'RCBO 4P':
      return <ModularDevice kind="rcbo" modules={4} stripe={stripe} className={className} label={label} />;
    case 'SD 1P':
      return <ModularDevice kind="sd" modules={1} stripe={stripe} className={className} label={label} />;
    case 'SD 2P':
      return <ModularDevice kind="sd" modules={2} stripe={stripe} className={className} label={label} />;
    case 'SD 3P':
      return <ModularDevice kind="sd" modules={3} stripe={stripe} className={className} label={label} />;
    case 'SD 4P':
      return <ModularDevice kind="sd" modules={4} stripe={stripe} className={className} label={label} />;

    /* ---------- Contactors / impulse relays ---------- */
    case 'Contactor 1M':
      return <Contactor1MDevice stripe={stripe} className={className} />;
    case 'Contactor 4NO':
      return <Contactor4NODevice stripe={stripe} className={className} />;
        case 'Telerupteur':
      return (
        <Body modules={1} className={className}>
          <TextLines x={PAD + 4} y={PAD + 28} w={10} n={3} />
          <rect x={PAD + 4.5} y={PAD + 44} width={9} height={18} rx={1.5} fill="#3a3f47" />
          <rect x={PAD + 6} y={PAD + 47} width={6} height={7} rx={1} fill="#2b2f36" />
          <rect x={PAD + 6.5} y={PAD + 66} width={5} height={1.8} rx={0.6} fill="#2e9e5b" />
        </Body>
      );

    /* ---------- Timers ---------- */
    case 'Timer mech':
      return <TimerMechDevice className={className} />;
    case 'Timer digital':
      return <TimerDigitalDevice className={className} />;

    /* ---------- Voltage relays ---------- */
    case 'VoltageRelay 1P':
      return (
        <Body modules={1} stripe="" screws={false} className={className}>
          <rect x={PAD + 2} y={PAD + 26} width={14} height={14} rx={1.5} fill="#111827" />
          <text x={PAD + 9} y={PAD + 36} fontSize={6} fontFamily="monospace" fontWeight="bold" textAnchor="middle" fill="#ef4444">230</text>
          <circle cx={PAD + 5} cy={PAD + 46} r={1.4} fill="#2e9e5b" />
          <circle cx={PAD + 13} cy={PAD + 46} r={1.4} fill="#f59e0b" />
        </Body>
      );
        case 'VoltageRelay 3P':
      return (
        <Body modules={4} stripe="" screws={false} className={className}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={PAD + 4 + i * 22} y={PAD + 24} width={18} height={14} rx={1.5} fill="#111827" />
              <text x={PAD + 13 + i * 22} y={PAD + 34.5} fontSize={7} fontFamily="monospace" fontWeight="bold" textAnchor="middle" fill="#ef4444">230</text>
              <circle cx={PAD + 9 + i * 22} cy={PAD + 45} r={1.3} fill={['#2e9e5b', '#f59e0b', '#2e9e5b'][i]} />
            </g>
          ))}
          <rect x={PAD + 4} y={PAD + 52} width={64} height={3} rx={1} fill="#c2c8d0" />
        </Body>
      );
    
    /* ---------- Arc fault detection (AFDD) ---------- */
    case 'AFDD + MCB':
    case 'AFDD + RCBO':
      return <AfddDevice withRcbo={type === 'AFDD + RCBO'} stripe={stripe} className={className} />;

    /* ---------- Surge protection ---------- */
    case 'SPD 1P':
    case 'SPD 1P + N':
    case 'SPD 3P':
    case 'SPD 3P + N': {
      const m = type === 'SPD 1P' ? 1 : type === 'SPD 1P + N' ? 2 : type === 'SPD 3P' ? 3 : 4;
      return (
        <Body modules={m} className={className}>
          {Array.from({ length: m }).map((_, i) => (
            <g key={i}>
              <rect x={PAD + i * MODULE + 3} y={PAD + 28} width={12} height={30} rx={1.5} fill="#e5e7eb" stroke="#b8bcc4" strokeWidth={0.6} />
              <rect x={PAD + i * MODULE + 6} y={PAD + 31} width={6} height={3} rx={0.8} fill="#2e9e5b" />
              <rect x={PAD + i * MODULE + 6} y={PAD + 37} width={6} height={1.3} rx={0.6} fill="#9aa0a8" />
              <path
                d={`M${PAD + i * MODULE + 9} ${PAD + 42} l-2.5 4 h4 l-2 4`}
                stroke="#d32f2f"
                strokeWidth={1.1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
        </Body>
      );
    }

    /* ---------- Indicator light ---------- */
    case 'IndicatorLight':
      return <IndicatorLightDevice color={color} count={count} className={className} />;

    /* ---------- Socket (DIN-rail euro socket) ---------- */
    case 'Socket':
      return <SocketDevice stripe={stripe} className={className} />;

    /* ---------- Guardmotor ---------- */
    case 'Guardmotor':
      return <GuardmotorDevice className={className} />;

    /* ---------- Energy meters ---------- */
    case 'Meter 1P':
      return <Meter1PSvg className={className} />;
    case 'Meter 3P':
      return <Meter3PSvg className={className} />;

    /* ---------- Changeover switch-disconnector ---------- */
    case 'SD Changeover':
      return <ChangeoverDevice className={className} />;

    /* ---------- DIN rail ---------- */
    case 'DIN Rail': {
      const mm = length || 200;
      const slots = Math.max(3, Math.round(mm / 25));
      const sw = Math.min(10, (84 / slots) * 0.62);
      return (
        <svg viewBox="0 0 100 24" className={className === 'h-16 w-auto max-w-full' ? 'w-20 h-6' : className} fill="none" preserveAspectRatio="xMidYMid meet">
          <Defs />
          <rect x={2} y={4} width={96} height={16} rx={1.5} fill="url(#dt-steel)" stroke="#6b7280" strokeWidth={0.8} />
          <line x1={2} y1={8} x2={98} y2={8} stroke="#f3f4f6" strokeWidth={0.8} />
          <line x1={2} y1={16} x2={98} y2={16} stroke="#6b7280" strokeWidth={0.8} />
          {Array.from({ length: slots }).map((_, i) => (
            <rect key={i} x={8 + (i + 0.5) * (84 / slots) - sw / 2} y={10} width={sw} height={4} rx={2} fill="#1f2937" />
          ))}
        </svg>
      );
    }

    /* ---------- Terminal bars ---------- */
    case 'TerminalBar': {
      const n = Math.min(count || 8, 14);
      if (variant !== 'spring') return <TerminalBarGraphic count={n} color={color} className={className} />;
      const colors: Record<string, string> = { blue: '#4b86c6', orange: '#e58a1f', yellow: '#e6c53a', green: '#3f9d5a', black: '#2d3139', red: '#d94a4a' };
      const body = colors[color || 'blue'] || (color && color.startsWith('#') ? color : '#4b86c6');
      const spring = variant === 'spring';
      const step = 92 / n;
      return (
        <svg viewBox="0 0 100 30" className={className} fill="none" preserveAspectRatio="xMidYMid meet">
          <Defs />
          <rect x={2} y={4} width={96} height={22} rx={2} fill={body} stroke="rgba(0,0,0,0.35)" strokeWidth={0.8} />
          <rect x={2} y={4} width={96} height={6} rx={2} fill="rgba(255,255,255,0.28)" />
          {spring ? (
            <>
              <rect x={2} y={4} width={96} height={9} rx={2} fill="url(#dt-body)" stroke="#9ca3af" strokeWidth={0.6} />
              {Array.from({ length: n }).map((_, i) => (
                <rect key={i} x={4 + i * step + step * 0.2} y={6} width={step * 0.6} height={4} rx={1} fill="#6b7280" />
              ))}
              {Array.from({ length: n }).map((_, i) => (
                <rect key={i} x={4 + i * step + step * 0.25} y={17} width={step * 0.5} height={7} rx={0.8} fill="rgba(0,0,0,0.25)" />
              ))}
            </>
          ) : (
            Array.from({ length: n }).map((_, i) => (
              <g key={i}>
                <circle cx={4 + i * step + step / 2} cy={11} r={Math.min(3.4, step * 0.34)} fill="#cfd3da" stroke="#4b5563" strokeWidth={0.6} />
                <line x1={4 + i * step + step / 2 - 1.6} y1={11} x2={4 + i * step + step / 2 + 1.6} y2={11} stroke="#4b5563" strokeWidth={0.7} />
                <rect x={4 + i * step + step * 0.2} y={18} width={step * 0.6} height={6} rx={1} fill="rgba(0,0,0,0.3)" />
              </g>
            ))
          )}
        </svg>
      );
    }

    /* ---------- Distribution blocks (rows x cols) ---------- */
    case 'DistributionBlock':
      return <DistributionBlockThumb variant={variant || '2x7'} className={className} />;

    /* ---------- Busbar combs ---------- */
    case 'Comb': {
      const n = Math.max(2, count || 2);
      const poles = Number(variant) || 1;
      const W = 14 + n * 9;
      return (
        <svg viewBox={`0 0 ${W + 4} 34`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
          <Defs />
          <rect x={2} y={3} width={W} height={8} rx={1} fill="url(#dt-body)" stroke="#8b929c" strokeWidth={0.8} />
          <line x1={W / 2 + 2} y1={3} x2={W / 2 + 2} y2={11} stroke="#8b929c" strokeWidth={0.6} />
          <text x={W - 2} y={9.5} fontSize={5.5} fontWeight="bold" fill="#4b5563" textAnchor="end" fontFamily="Arial, sans-serif">{poles}P</text>
          {Array.from({ length: n }).map((_, i) => (
            <rect key={i} x={2 + 5 + i * 9} y={11} width={3.2} height={16} rx={0.8} fill="#e1b48a" stroke="#b98957" strokeWidth={0.4} />
          ))}
        </svg>
      );
    }

    default:
      return (
        <Body modules={1} stripe="#9aa0a8" className={className}>
          <circle cx={PAD + 9} cy={PAD + 45} r={4} fill="#64748b" />
        </Body>
      );
  }
};
