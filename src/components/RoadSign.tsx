import Svg, { Circle, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import type { RoadSign as Sign } from '@/data/signs';

const RED = '#C62828';
const BLUE = '#1565C0';

/** Draws a simplified Indian road sign. Shapes and colours follow the sign category conventions. */
export function RoadSign({ sign, size = 96 }: { sign: Sign; size?: number }) {
  const s = 100;
  const glyphSize = sign.glyph.length > 3 ? 20 : sign.glyph.length > 2 ? 26 : 34;
  const glyph = (color: string, y = 50) =>
    sign.glyph ? (
      <SvgText x="50" y={y} fontSize={glyphSize} fontWeight="bold" fill={color} textAnchor="middle" alignmentBaseline="central">
        {sign.glyph}
      </SvgText>
    ) : null;
  const slash = sign.slash ? <Line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="9" /> : null;

  let body;
  switch (sign.shape) {
    case 'octagon':
      body = (
        <>
          <Polygon points="30,3 70,3 97,30 97,70 70,97 30,97 3,70 3,30" fill={RED} stroke="#fff" strokeWidth="3" />
          {glyph('#fff')}
        </>
      );
      break;
    case 'triangle-down':
      body = <Polygon points="4,8 96,8 50,94" fill="#fff" stroke={RED} strokeWidth="9" strokeLinejoin="round" />;
      break;
    case 'circle-ban':
      body = (
        <>
          <Circle cx="50" cy="50" r="46" fill={RED} />
          <Rect x="18" y="41" width="64" height="18" fill="#fff" />
        </>
      );
      break;
    case 'circle-limit':
      body = (
        <>
          <Circle cx="50" cy="50" r="42" fill="#fff" stroke={RED} strokeWidth="9" />
          {glyph('#111')}
          {slash}
        </>
      );
      break;
    case 'circle-blue':
      body = (
        <>
          <Circle cx="50" cy="50" r="42" fill={BLUE} stroke={RED} strokeWidth="9" />
          {glyph('#fff')}
          {slash}
        </>
      );
      break;
    case 'triangle':
      body = (
        <>
          <Polygon points="50,6 96,92 4,92" fill="#fff" stroke={RED} strokeWidth="8" strokeLinejoin="round" />
          {glyph('#111', 64)}
        </>
      );
      break;
    case 'square':
      body = (
        <>
          <Rect x="6" y="6" width="88" height="88" rx="8" fill={BLUE} />
          <Rect x="20" y="20" width="60" height="60" rx="4" fill="#fff" />
          {glyph(BLUE)}
        </>
      );
      break;
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${s} ${s}`} accessibilityLabel={sign.name}>
      {body}
    </Svg>
  );
}
