import React from 'react';
import { Meter1PSvg, Meter3PSvg } from './MeterSvg';

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
      return <ModularDevice kind="mcb" modules={1} stripe={stripe} className={className} label={label} />;
    case 'MCB 2P':
      return <ModularDevice kind="mcb" modules={2} stripe={stripe} className={className} label={label} />;
    case 'MCB 3P':
      return <ModularDevice kind="mcb" modules={3} stripe={stripe} className={className} label={label} />;
    case 'MCB 4P':
      return <ModularDevice kind="mcb" modules={4} stripe={stripe} className={className} label={label} />;
    case 'MCB 1P + N':
      return <ModularDevice kind="mcb" modules={1} slim stripe={stripe} className={className} label={label} />;
    case 'RCCB 2P':
      return <ModularDevice kind="rccb" modules={2} stripe={stripe} className={className} label={label} />;
    case 'RCCB 4P':
      return <ModularDevice kind="rccb" modules={4} stripe={stripe} className={className} label={label} />;
    case 'RCBO 2P':
    case 'RCBO 1P + N':
      return <ModularDevice kind="rcbo" modules={2} stripe={stripe} className={className} label={label} />;
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
      return (
        <Body modules={1} className={className}>
          <TextLines x={PAD + 4} y={PAD + 28} w={10} n={4} />
          <rect x={PAD + 5} y={PAD + 48} width={8} height={9} rx={1} fill="#e5e7eb" stroke="#9aa0a8" strokeWidth={0.5} />
          <rect x={PAD + 6.5} y={PAD + 63} width={5} height={1.8} rx={0.6} fill="#2e9e5b" />
        </Body>
      );
    case 'Contactor 4NO':
      return (
        <Body modules={3} h={85} stripe="" screws={false} className={className}>
          {/* Fenêtre frontale : symbole de bobine + voyants de contacts */}
          <rect x={PAD + 4} y={PAD + 22} width={46} height={30} rx={2} fill="#e9edf2" stroke="#9aa1ab" strokeWidth={0.5} />
          <path d={`M${PAD + 12} ${PAD + 36} h4 q1.5 -4 3 0 q1.5 4 3 0 q1.5 -4 3 0 q1.5 4 3 0 h4`} fill="none" stroke="#3f4650" strokeWidth={0.9} strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={PAD + 9 + i * 8} y={PAD + 28} width={5} height={3} rx={0.6} fill={i < 2 ? '#2e9e5b' : '#c9d0d8'} stroke="#8b929e" strokeWidth={0.3} />
          ))}
          {/* Bornes haute (1 3 5 7) et basse (2 4 6 8), numérotées */}
          {[0, 1, 2, 3].map((i) => (
            <g key={`t${i}`}>
              <rect x={PAD + 1.5 + i * 13} y={PAD + 4} width={11} height={9} rx={1} fill="#c2c8d0" stroke="#5b626c" strokeWidth={0.5} />
              <text x={PAD + 7 + i * 13} y={PAD + 2.6} fontSize={3.4} textAnchor="middle" fill="#334155" fontFamily="Arial, sans-serif">{[1, 3, 5, 7][i]}</text>
              <rect x={PAD + 1.5 + i * 13} y={PAD + 72} width={11} height={9} rx={1} fill="#c2c8d0" stroke="#5b626c" strokeWidth={0.5} />
              <text x={PAD + 7 + i * 13} y={PAD + 85.5} fontSize={3.4} textAnchor="middle" fill="#334155" fontFamily="Arial, sans-serif">{[2, 4, 6, 8][i]}</text>
            </g>
          ))}
          {/* Bornes de bobine A1 / A2 */}
          <rect x={PAD + 4} y={PAD + 58} width={12} height={6} rx={0.8} fill="#c2c8d0" stroke="#5b626c" strokeWidth={0.4} />
          <rect x={PAD + 38} y={PAD + 58} width={12} height={6} rx={0.8} fill="#c2c8d0" stroke="#5b626c" strokeWidth={0.4} />
          <text x={PAD + 10} y={PAD + 62.5} fontSize={3} textAnchor="middle" fill="#334155" fontFamily="Arial, sans-serif">A1</text>
          <text x={PAD + 44} y={PAD + 62.5} fontSize={3} textAnchor="middle" fill="#334155" fontFamily="Arial, sans-serif">A2</text>
          {/* Repère LED */}
          <rect x={PAD + 22} y={PAD + 60} width={10} height={3} rx={1} fill="#2e9e5b" />
        </Body>
      );
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
      return (
        <Body modules={3} className={className}>
          <circle cx={PAD + 27} cy={PAD + 43} r={19} fill="#f8fafc" stroke="#8b929c" strokeWidth={1} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={PAD + 27 + Math.sin(a) * 15.5}
                y1={PAD + 43 - Math.cos(a) * 15.5}
                x2={PAD + 27 + Math.sin(a) * 18}
                y2={PAD + 43 - Math.cos(a) * 18}
                stroke="#334155"
                strokeWidth={0.9}
              />
            );
          })}
          <line x1={PAD + 27} y1={PAD + 43} x2={PAD + 27} y2={PAD + 31} stroke="#111827" strokeWidth={1.4} strokeLinecap="round" />
          <line x1={PAD + 27} y1={PAD + 43} x2={PAD + 35} y2={PAD + 46} stroke="#d32f2f" strokeWidth={1.2} strokeLinecap="round" />
          <circle cx={PAD + 27} cy={PAD + 43} r={1.8} fill="#334155" />
          <rect x={PAD + 8} y={PAD + 66} width={38} height={4} rx={1} fill="#cbd5e1" />
        </Body>
      );
    case 'Timer digital':
      return (
        <Body modules={2} className={className}>
          <rect x={PAD + 5} y={PAD + 27} width={26} height={17} rx={2} fill="url(#dt-lcd)" stroke="#1f6f4f" strokeWidth={0.6} />
          <rect x={PAD + 8} y={PAD + 31} width={20} height={4} rx={0.8} fill="#1b5e43" opacity={0.7} />
          <rect x={PAD + 8} y={PAD + 37} width={12} height={2.5} rx={0.8} fill="#1b5e43" opacity={0.5} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={PAD + 6 + i * 6.5} y={PAD + 52} width={5} height={4} rx={0.8} fill="#4b5563" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={PAD + 6 + i * 6.5} y={PAD + 59} width={5} height={4} rx={0.8} fill="#4b5563" />
          ))}
        </Body>
      );

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
    case 'AFDD + RCBO': {
      const m = type === 'AFDD + RCBO' ? 3 : 2;
      const W = m * MODULE;
      return (
        <Body modules={m} stripe="#e8c52e" className={className}>
          <rect x={PAD + 4} y={PAD + 26} width={W - 8} height={12} rx={1.5} fill="#111827" />
          <text x={PAD + W / 2} y={PAD + 35} fontSize={7} fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle" fill="#fbbf24">AFDD</text>
          <polyline
            points={`${PAD + 6},${PAD + 52} ${PAD + 10},${PAD + 44} ${PAD + 13},${PAD + 55} ${PAD + 17},${PAD + 46} ${PAD + 20},${PAD + 52}`}
            stroke="#f59e0b"
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <rect x={PAD + W - 14} y={PAD + 44} width={8} height={18} rx={1.5} fill="#2b2f36" />
          <circle cx={PAD + 9} cy={PAD + 64} r={2} fill="#2e9e5b" />
        </Body>
      );
    }

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
    case 'IndicatorLight': {
      const lens =
        color === 'red' ? '#e53935' : color === 'teal' ? '#26c6da' : color === 'yellow' ? '#f2d64b' : color === 'blue' ? '#2f9be0' : '#f8fafc';
      return (
        <Body modules={1} stripe="#9aa0a8" className={className}>
          <rect x={PAD + 3} y={PAD + 30} width={12} height={28} rx={5} fill={lens} stroke="#6b7280" strokeWidth={0.8} />
          <ellipse cx={PAD + 7.5} cy={PAD + 38} rx={2} ry={3.5} fill="#ffffff" opacity={0.45} />
        </Body>
      );
    }

    /* ---------- Socket (DIN-rail euro socket) ---------- */
    case 'Socket':
      return (
        <Body modules={2} className={className}>
          <circle cx={PAD + 18} cy={PAD + 45} r={14} fill="#f1f5f9" stroke="#9aa0a8" strokeWidth={1} />
          <circle cx={PAD + 18} cy={PAD + 45} r={10.5} fill="#e5e7eb" />
          <circle cx={PAD + 13} cy={PAD + 45} r={1.8} fill="#111827" />
          <circle cx={PAD + 23} cy={PAD + 45} r={1.8} fill="#111827" />
          <rect x={PAD + 16} y={PAD + 30.5} width={4} height={2.5} rx={0.8} fill="#9aa0a8" />
          <rect x={PAD + 16} y={PAD + 57} width={4} height={2.5} rx={0.8} fill="#9aa0a8" />
        </Body>
      );

    /* ---------- Guardmotor ---------- */
    case 'Guardmotor':
      return (
        <Body modules={2} className={className}>
          <rect x={PAD + 4} y={PAD + 28} width={12} height={22} rx={2} fill="#d32f2f" />
          <text x={PAD + 10} y={PAD + 41} fontSize={5.5} fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="Arial, sans-serif">O</text>
          <rect x={PAD + 20} y={PAD + 28} width={12} height={22} rx={2} fill="#2e9e5b" />
          <text x={PAD + 26} y={PAD + 41} fontSize={5.5} fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="Arial, sans-serif">I</text>
          <rect x={PAD + 4} y={PAD + 56} width={28} height={3} rx={1} fill="#3b82f6" />
        </Body>
      );

    /* ---------- Energy meters ---------- */
    case 'Meter 1P':
      return <Meter1PSvg className={className} />;
    case 'Meter 3P':
      return <Meter3PSvg className={className} />;

    /* ---------- Changeover switch-disconnector ---------- */
    case 'SD Changeover':
      return (
        <svg viewBox="0 0 104 64" className={className} fill="none" preserveAspectRatio="xMidYMid meet">
          <Defs />
          <rect x={1.5} y={1.5} width={101} height={61} rx={3} fill="url(#dt-dark)" stroke="#111827" strokeWidth={0.8} />
          {Array.from({ length: 6 }).map((_, i) => (
            <React.Fragment key={i}>
              <Screw cx={11 + i * 16.5} cy={9} r={3.6} />
              <Screw cx={11 + i * 16.5} cy={55} r={3.6} />
            </React.Fragment>
          ))}
          <rect x={1.5} y={18} width={101} height={14} fill="#c24a4a" />
          <rect x={1.5} y={18} width={101} height={2} fill="#e07a7a" />
          <circle cx={52} cy={32} r={10} fill="#111827" stroke="#374151" strokeWidth={1} />
          <rect x={49} y={24} width={6} height={16} rx={2} fill="#4b5563" />
          <rect x={14} y={36} width={20} height={4} rx={1} fill="#6b7280" opacity={0.6} />
          <rect x={70} y={36} width={20} height={4} rx={1} fill="#6b7280" opacity={0.6} />
        </svg>
      );

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
    case 'DistributionBlock': {
      const [r, c] = (variant || '2x7').split('x').map(Number);
      const rowH = 13;
      const cw = 6.4;
      const W = 18 + c * cw;
      const Hh = 10 + r * rowH;
      return (
        <svg viewBox={`0 0 ${W + 4} ${Hh + 4}`} className={className} fill="none" preserveAspectRatio="xMidYMid meet">
          <Defs />
          <rect x={2} y={2} width={W} height={Hh} rx={2} fill="#6e8aa3" stroke="#475569" strokeWidth={0.8} />
          <rect x={2} y={2} width={7} height={Hh} rx={2} fill="url(#dt-body)" stroke="#9ca3af" strokeWidth={0.6} />
          <rect x={W - 5} y={2} width={7} height={Hh} rx={2} fill="url(#dt-body)" stroke="#9ca3af" strokeWidth={0.6} />
          {Array.from({ length: r }).map((_, ri) => (
            <g key={ri}>
              <rect x={11} y={7 + ri * rowH} width={W - 22} height={5} rx={1} fill="url(#dt-brass)" stroke="#8a7020" strokeWidth={0.4} />
              {Array.from({ length: c }).map((_, ci) => (
                <circle key={ci} cx={11 + (ci + 0.5) * ((W - 22) / c)} cy={9.5 + ri * rowH} r={1.3} fill="#5b4a12" />
              ))}
            </g>
          ))}
        </svg>
      );
    }

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
