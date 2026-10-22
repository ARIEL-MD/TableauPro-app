import React from 'react';

/**
 * Compteurs d'énergie dessinés d'après les images de référence :
 * - triphasé : couvercle gris, bandeau vert, afficheur LCD « 00018902 », 4 clips bleus,
 *   bornier de 8 bornes à 2 vis, pattes de fixation ;
 * - monophasé : couvercle gris, bandeau vert, totalisateur mécanique « 07061 » + 5 rouge,
 *   bornier de 4 bornes, pattes de fixation.
 */

const STEEL = '#7f8a93';
const DARK = '#3f4a51';
const DARKER = '#2f393f';
const PLATE = '#dde0e3';
const BODY = '#e6e9ec';
const COVER = '#c4cbcf';
const GREEN = '#0e9347';
const BLUE = '#1f5fa6';

const Screw: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#7b858c" stroke="#566067" strokeWidth={3} />
    <path
      d={`M${cx - r * 0.45} ${cy - r * 0.45}L${cx + r * 0.45} ${cy + r * 0.45}M${cx + r * 0.45} ${cy - r * 0.45}L${cx - r * 0.45} ${cy + r * 0.45}`}
      stroke="#3b454c"
      strokeWidth={r * 0.28}
      strokeLinecap="round"
    />
  </g>
);

/** Patte de fixation (gauche ou droite) avec son œillet et sa fente. */
const Foot: React.FC<{ x: number; y: number; w: number; h: number; slotX: number; slotY: number; slotW: number; slotH: number; ringX: number; ringY: number; ringR: number }> = ({
  x, y, w, h, slotX, slotY, slotW, slotH, ringX, ringY, ringR,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={STEEL} />
    <rect x={x} y={y + h * 0.78} width={w} height={h * 0.22} fill="#59646c" />
    <rect x={slotX} y={slotY} width={slotW} height={slotH} fill="#f1f3f4" />
    <circle cx={ringX} cy={ringY} r={ringR} fill="#8a939b" stroke="#5b6770" strokeWidth={3} />
  </g>
);

/* ------------------------------------------------------------------ */
/*  Compteur triphasé                                                   */
/* ------------------------------------------------------------------ */
export const Meter3PSvg: React.FC<{ className?: string }> = ({ className }) => {
  const plateX = [95, 183, 275, 367, 459, 551, 643, 735];
  return (
    <svg viewBox="24 24 870 714" className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      {/* Couvercle transparent gris */}
      <rect x={32} y={30} width={854} height={226} rx={9} fill={COVER} stroke="#4b5563" strokeWidth={4} />
      <rect x={45} y={45} width={827} height={205} fill="#c6cdd1" />
      <rect x={45} y={45} width={30} height={205} fill="#b2bbc0" />
      <rect x={845} y={45} width={27} height={205} fill="#b2bbc0" />
      <rect x={695} y={148} width={115} height={77} fill="#8a939b" />
      <rect x={725} y={68} width={27} height={67} fill="#b0b8bd" />
      <rect x={775} y={52} width={25} height={48} fill="#b0b8bd" />

      {/* Bandeau : étiquette verte + afficheur */}
      <rect x={32} y={245} width={854} height={150} fill={BODY} stroke="#9aa5ab" strokeWidth={2} />
      <rect x={58} y={255} width={262} height={130} rx={10} fill="#e9ecef" stroke="#ccd3d7" strokeWidth={3} />
      <rect x={66} y={262} width={246} height={60} fill={GREEN} />
      <rect x={342} y={255} width={513} height={127} fill="#3d464c" />
      <rect x={368} y={265} width={460} height={107} fill="#1d2124" />
      <text
        x={386}
        y={352}
        textLength={424}
        lengthAdjust="spacingAndGlyphs"
        fontFamily="ui-monospace, Menlo, Consolas, 'Courier New', monospace"
        fontWeight={700}
        fontSize={92}
        fill="#f4f6f7"
      >
        00018902
      </text>

      {/* Bande basse + clips bleus */}
      <rect x={32} y={395} width={854} height={22} fill="#b9c2c6" />
      <rect x={32} y={417} width={854} height={50} fill="#e3e6e9" />
      {[95, 275, 458, 733].map((x) => (
        <rect key={x} x={x} y={423} width={45} height={35} fill={BLUE} />
      ))}

      {/* Bornier */}
      <rect x={32} y={465} width={854} height={188} fill={DARK} />
      <rect x={92} y={468} width={735} height={20} fill={DARKER} />
      <rect x={92} y={625} width={735} height={26} fill={DARKER} />
      {plateX.map((x, i) => (
        <g key={x}>
          <rect x={x} y={500} width={42} height={122} fill={PLATE} stroke="#bcc3c8" strokeWidth={2} />
          <Screw cx={x + 21} cy={540} r={17} />
          <Screw cx={x + 21} cy={583} r={17} />
          {/* séparateur entre deux bornes */}
          {i < plateX.length - 1 && (
            <g>
              <rect x={x + 49} y={470} width={36} height={180} fill="#4c575e" />
              <rect x={x + 49} y={537} width={36} height={8} fill="#2f393f" />
            </g>
          )}
        </g>
      ))}
      <circle cx={252} cy={628} r={8} fill="#fff" />
      <circle cx={620} cy={628} r={8} fill="#fff" />
      {/* Petites broches sous le bornier */}
      {[140, 178, 692, 731].map((x) => (
        <rect key={x} x={x - 2} y={650} width={5} height={38} fill="#1f272c" />
      ))}

      {/* Pattes de fixation */}
      <Foot x={32} y={465} w={60} h={265} slotX={48} slotY={683} slotW={18} slotH={22} ringX={62} ringY={635} ringR={14} />
      <Foot x={825} y={465} w={61} h={265} slotX={850} slotY={683} slotW={18} slotH={22} ringX={850} ringY={635} ringR={14} />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Compteur monophasé                                                  */
/* ------------------------------------------------------------------ */
export const Meter1PSvg: React.FC<{ className?: string }> = ({ className }) => {
  const plateX = [122, 293, 462, 630];
  const barX = [212, 380, 548, 716];
  const digits = ['0', '7', '0', '6', '1'];
  return (
    <svg viewBox="30 42 868 886" className={className} fill="none" preserveAspectRatio="xMidYMid meet">
      {/* Couvercle gris */}
      <rect x={38} y={50} width={852} height={118} rx={9} fill={COVER} stroke="#7a858c" strokeWidth={4} />
      <rect x={52} y={64} width={824} height={92} fill="#c6cdd1" />
      <rect x={860} y={64} width={16} height={92} fill="#aab3b8" />
      <rect x={105} y={100} width={145} height={55} fill="#8a939b" />

      {/* Face avant */}
      <rect x={38} y={158} width={852} height={345} fill={BODY} stroke="#c4cbd0" strokeWidth={2} />
      <rect x={38} y={196} width={852} height={7} fill="#c1cacd" />
      <rect x={38} y={452} width={852} height={9} fill="#c1cacd" />
      <rect x={611} y={158} width={3} height={345} fill="#b9c3c6" />
      <rect x={125} y={185} width={463} height={73} fill={GREEN} />

      {/* Totalisateur mécanique */}
      <rect x={125} y={290} width={463} height={130} fill="#2a2f33" />
      <rect x={140} y={302} width={365} height={106} fill="#14171a" />
      {[217, 287, 357, 427].map((x) => (
        <rect key={x} x={x - 1} y={302} width={3} height={106} fill="#2d3338" />
      ))}
      {digits.map((d, i) => (
        <text
          key={i}
          x={182 + i * 70}
          y={387}
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={700}
          fontSize={74}
          fill="#f4f6f7"
        >
          {d}
        </text>
      ))}
      <rect x={505} y={302} width={75} height={106} fill="#c0392b" />
      <text x={536} y={387} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight={700} fontSize={74} fill="#fff">
        5
      </text>

      {/* Fenêtre de droite */}
      <rect x={636} y={232} width={232} height={196} rx={14} fill="#e9ecee" stroke="#d0d6da" strokeWidth={3} />

      {/* Bande basse + clip bleu */}
      <rect x={38} y={500} width={852} height={76} fill="#e3e6e9" stroke="#c4cbd0" strokeWidth={2} />
      <rect x={758} y={516} width={97} height={46} fill={BLUE} />

      {/* Bornier */}
      <rect x={112} y={580} width={703} height={240} fill={DARK} />
      <rect x={112} y={580} width={703} height={50} fill={DARKER} />
      <rect x={112} y={790} width={703} height={30} fill={DARKER} />
      {plateX.map((x) => (
        <g key={x}>
          <rect x={x} y={635} width={86} height={155} fill={PLATE} stroke="#bcc3c8" strokeWidth={2} />
          <Screw cx={x + 45} cy={712} r={31} />
        </g>
      ))}
      {barX.map((x) => (
        <g key={x}>
          <rect x={x} y={580} width={78} height={258} fill="#4c575e" />
          <rect x={x} y={698} width={78} height={22} fill="#2f393f" />
        </g>
      ))}
      {/* Œillet de plombage et broches */}
      <circle cx={418} cy={868} r={26} fill="#fff" stroke="#1f272c" strokeWidth={8} />
      <rect x={559} y={842} width={7} height={48} fill="#1f272c" />
      <rect x={600} y={842} width={7} height={48} fill="#1f272c" />

      {/* Pattes de fixation */}
      <Foot x={38} y={580} w={74} h={340} slotX={55} slotY={848} slotW={24} slotH={40} ringX={72} ringY={803} ringR={18} />
      <Foot x={815} y={580} w={75} h={340} slotX={848} slotY={848} slotW={24} slotH={40} ringX={848} ringY={803} ringR={18} />
    </svg>
  );
};
