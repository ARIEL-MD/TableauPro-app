import React from 'react';
import { PictogramKey } from '../types/panel';

/**
 * Pictogrammes « tuile » — dessins au trait calés sur les captures de référence.
 * Tous sont dessinés dans un viewBox 64 × 64, trait `currentColor` (gris foncé par défaut),
 * et sont utilisés à l'identique dans le tiroir et sur le plan.
 */

const Fan: React.FC = () => (
  <g>
    <rect x={8} y={8} width={48} height={48} rx={6} />
    <circle cx={32} cy={32} r={18} />
    {[0, 90, 180, 270].map((a) => (
      <path
        key={a}
        d="M32 32 C31 22 36 17 43 20 C45 27 40 32 32 32 Z"
        fill="currentColor"
        fillOpacity={0.75}
        transform={`rotate(${a} 32 32)`}
      />
    ))}
    <circle cx={32} cy={32} r={3} fill="currentColor" />
  </g>
);

export const PICTO_ART: Partial<Record<PictogramKey, React.ReactNode>> = {
  lighting: (
    <g>
      <path d="M32 6 a16 16 0 0 0 -9.5 28.8 c2 1.6 3 3.6 3 6.2 v2 h13 v-2 c0 -2.6 1 -4.6 3 -6.2 A16 16 0 0 0 32 6 Z" />
      <path d="M27 18 l5 10 l5 -10 M32 28 V41" />
      <path d="M25.5 47 h13 M26.5 52 h11 M28.5 57 h7" />
    </g>
  ),
  socket: (
    <g>
      <circle cx={32} cy={32} r={27} />
      <circle cx={32} cy={32} r={21} />
      <rect x={28} y={5} width={8} height={8} rx={1} fill="currentColor" />
      <rect x={28} y={51} width={8} height={8} rx={1} fill="currentColor" />
      <circle cx={23} cy={32} r={4.5} fill="currentColor" />
      <circle cx={41} cy={32} r={4.5} fill="currentColor" />
    </g>
  ),
  oven: (
    <g>
      <rect x={6} y={8} width={52} height={48} rx={5} />
      {[13, 19, 25, 31, 37, 43, 49].map((x) => (
        <circle key={x} cx={x} cy={15} r={1.3} fill="currentColor" />
      ))}
      <path d="M6 21 H58" />
      <path d="M13 26 H51" />
      <rect x={12} y={29} width={40} height={21} rx={2} />
    </g>
  ),
  washing_machine: (
    <g>
      <rect x={7} y={7} width={50} height={50} rx={5} />
      {[14, 20, 26, 32].map((x) => (
        <circle key={x} cx={x} cy={14} r={1.3} fill="currentColor" />
      ))}
      <path d="M40 14 h11" />
      <path d="M7 21 H57" />
      <circle cx={32} cy={39} r={14} />
      <circle cx={32} cy={39} r={8.5} />
      <path d="M26.5 41 q5.5 6 11 0" />
    </g>
  ),
  earth: (
    <g>
      <path d="M32 6 V30" />
      <path d="M10 30 H54 M18 40 H46 M26 50 H38" />
    </g>
  ),
  boiler: (
    <g>
      <rect x={18} y={16} width={28} height={36} rx={5} />
      <path d="M26 16 V9 h-5 M38 16 V9 h5" />
      <path d="M26 52 V58 M38 52 V58" />
      <circle cx={32} cy={36} r={5.5} />
      <circle cx={32} cy={36} r={1.6} fill="currentColor" />
      <path d="M32 22 V28" />
    </g>
  ),
  air_conditioning: (
    <g>
      <rect x={6} y={8} width={52} height={24} rx={5} />
      <path d="M10 25 H54" />
      <path d="M14 15 H26" />
      <path d="M18 38 q3.5 4.5 0 9 t0 9 M32 38 q3.5 4.5 0 9 t0 9 M46 38 q3.5 4.5 0 9 t0 9" />
    </g>
  ),
  bathroom: (
    <g>
      <path d="M8 32 H56 V36 a10 10 0 0 1 -10 10 H18 a10 10 0 0 1 -10 -10 Z" />
      <path d="M16 46 l-2 6 M48 46 l2 6" />
      <path d="M14 32 V18 a6 6 0 0 1 12 0 v1" />
      <path d="M21 19 h10 l-2 5 h-6 Z" />
      <path d="M23 28 v1 M27 28 v1 M25 31 v0.5" />
    </g>
  ),
  kitchen: (
    <g>
      <rect x={8} y={32} width={48} height={22} rx={2} />
      <path d="M32 32 V54" />
      <path d="M26 42 v4 M38 42 v4" />
      <path d="M12 32 V28 H28 V32" />
      <path d="M36 32 V18 a7 7 0 0 1 14 0 v3" />
      <path d="M44 24 h12" />
    </g>
  ),
  microwave: (
    <g>
      <rect x={6} y={14} width={52} height={36} rx={3} />
      <rect x={11} y={19} width={28} height={26} rx={2} />
      <path d="M44 14 V50" />
      <circle cx={51} cy={24} r={2.6} />
      <circle cx={51} cy={38} r={2.6} />
      <path d="M17 27 q2 -3 4 0 t4 0 t4 0 M17 32 q2 -3 4 0 t4 0 t4 0 M17 37 q2 -3 4 0 t4 0 t4 0" />
      <path d="M12 50 v3 M52 50 v3" />
    </g>
  ),
  cooktop: (
    <g>
      <rect x={6} y={6} width={52} height={46} rx={5} />
      {[[21, 20], [43, 20], [21, 38], [43, 38]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={7} />
          <circle cx={cx} cy={cy} r={2.6} />
        </g>
      ))}
      {[14, 22, 30, 38, 46, 54].map((x) => (
        <circle key={x} cx={x} cy={58} r={1.4} fill="currentColor" />
      ))}
    </g>
  ),
  router: (
    <g>
      <rect x={8} y={36} width={48} height={16} rx={3} />
      <circle cx={16} cy={44} r={1.6} fill="currentColor" />
      <circle cx={23} cy={44} r={1.6} fill="currentColor" />
      <path d="M38 44 h12" />
      <path d="M14 36 V28 M50 36 V28" />
      <path d="M22 24 a14 14 0 0 1 20 0 M26 28 a8 8 0 0 1 12 0" />
      <circle cx={32} cy={31} r={1.6} fill="currentColor" />
    </g>
  ),
  dryer: (
    <g>
      <rect x={10} y={6} width={44} height={52} rx={3} />
      <path d="M10 18 H54" />
      <circle cx={18} cy={12} r={2} />
      <circle cx={25} cy={12} r={2} />
      <path d="M40 12 h8" />
      <circle cx={32} cy={38} r={14} />
      <circle cx={32} cy={38} r={10} />
      <path d="M26 36 q3 -3 6 0 t6 0 M26 41 q3 -3 6 0 t6 0" />
    </g>
  ),
  motor: (
    <g>
      <rect x={14} y={18} width={30} height={28} rx={4} />
      <path d="M19 25 H39 M19 32 H39 M19 39 H39" />
      <path d="M8 26 h6 v12 h-6 Z" />
      <path d="M44 27 h4 v10 h-4" />
      <path d="M48 30 h8 v4 h-8" />
      <path d="M16 46 v6 h26 v-6" />
    </g>
  ),
  toilet: (
    <g>
      <path d="M20 22 V8 H44 V22" />
      <path d="M29 13 h6" />
      <path d="M12 24 H52 V28 C52 40 42 46 32 46 C22 46 12 40 12 28 Z" />
      <path d="M26 46 L24 55 H40 L38 46" />
    </g>
  ),
  house: (
    <g>
      <path d="M8 32 L32 10 L56 32" />
      <path d="M14 27 V54 H50 V27" />
      <rect x={28} y={36} width={10} height={18} />
      <circle cx={35} cy={46} r={0.9} fill="currentColor" />
    </g>
  ),
  bedroom: (
    <g>
      <path d="M8 30 V54 M56 40 V54 M8 46 H56" />
      <path d="M12 46 V40 H52 V46" />
      <rect x={14} y={34} width={14} height={6} rx={3} />
      <path d="M10 22 l3 -8 h8 l3 8 Z M17 22 v6" />
      <path d="M44 10 a6 6 0 1 0 7 8 a5 5 0 0 1 -7 -8 Z" />
      <path d="M52 8 v3 M50.5 9.5 h3" />
    </g>
  ),
  hallway: (
    <g>
      <path d="M8 16 h10 l-2 8 h-6 Z M13 24 V52 M8 54 h10" />
      <rect x={28} y={8} width={22} height={15} />
      <path d="M31 20 l5 -6 l4 4 l3 -3 l4 5" />
      <path d="M24 38 V32 a4 4 0 0 1 4 -4 H50 a4 4 0 0 1 4 4 V38" />
      <rect x={22} y={36} width={34} height={12} rx={3} />
      <path d="M26 48 v5 M52 48 v5" />
    </g>
  ),
  intercom: (
    <g>
      <rect x={10} y={8} width={36} height={48} rx={4} />
      <rect x={15} y={13} width={26} height={14} rx={1} />
      {[18, 28, 38].map((x) =>
        [35, 41, 47].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="currentColor" />)
      )}
      <path d="M46 14 h4 q6 0 6 8 v14 q0 8 -6 8 h-4" />
    </g>
  ),
  tv: (
    <g>
      <rect x={6} y={10} width={52} height={34} rx={3} />
      <text x={32} y={34} fontSize={20} fontWeight={700} textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Arial, sans-serif">
        TV
      </text>
      <path d="M32 44 V50 M20 52 H44" />
    </g>
  ),
  gate: (
    <g>
      <path d="M8 10 V56 M56 10 V56" />
      <path d="M6 10 h4 M54 10 h4" />
      <path d="M10 26 Q20 12 30 24 M34 24 Q44 12 54 26" />
      <path d="M15 22 V54 M21 20 V54 M27 22 V54 M37 22 V54 M43 20 V54 M49 22 V54" />
      <path d="M10 34 H30 M34 34 H54 M10 46 H30 M34 46 H54" />
    </g>
  ),
  garage: (
    <g>
      <rect x={8} y={10} width={48} height={9} rx={1} />
      <path d="M10 19 V56 M54 19 V56" />
      <rect x={14} y={23} width={36} height={29} />
      <path d="M14 29 H50 M14 35 H50 M14 41 H50 M14 47 H50" />
    </g>
  ),
  fridge: (
    <g>
      <rect x={16} y={6} width={32} height={50} rx={3} />
      <path d="M16 24 H48" />
      <path d="M22 13 v7 M22 30 v12" />
      <path d="M20 56 v3 M44 56 v3" />
    </g>
  ),
  ventilation: <Fan />,
  floor_heating: (
    <g>
      <path d="M20 8 q3 4 0 8 t0 8 M32 8 q3 4 0 8 t0 8 M44 8 q3 4 0 8 t0 8" />
      <path d="M6 52 L14 34 H58 L50 52 Z" />
      <path d="M6 52 V56 H50 V52 M50 56 L58 38 V34" />
      <path d="M12 47 H48 M16 43 H52 M19 39 H55" />
    </g>
  ),
  computer: (
    <g>
      <rect x={6} y={10} width={36} height={28} rx={2} />
      <path d="M24 38 V46 M15 48 H33" />
      <rect x={46} y={14} width={12} height={34} rx={2} />
      <circle cx={52} cy={22} r={1.8} />
      <path d="M49 30 h6 M49 35 h6" />
    </g>
  ),
  alarm: (
    <g>
      <path d="M24 20 a8 8 0 0 1 16 0 Z" />
      <path d="M32 6 V9 M20 10 l2 2 M44 10 l-2 2 M16 18 h3 M45 18 h3" />
      <rect x={12} y={22} width={40} height={34} rx={3} />
      <rect x={18} y={27} width={28} height={8} rx={1} />
      {[20, 28, 36, 44].map((x) =>
        [41, 46, 51].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill="currentColor" />)
      )}
    </g>
  ),
  camera: (
    <g>
      <path d="M8 12 V52 M8 26 H16" />
      <g transform="rotate(12 36 32)">
        <rect x={14} y={22} width={34} height={14} rx={3} />
        <path d="M48 24 l8 -2 v18 l-8 -2" />
        <circle cx={53} cy={31} r={3} />
        <path d="M20 22 V19 h12 v3" />
      </g>
    </g>
  ),
  blank: null,
};
