export type SignShape = 'octagon' | 'triangle-down' | 'circle-ban' | 'circle-limit' | 'circle-blue' | 'triangle' | 'square';

export interface RoadSign {
  id: string;
  name: string;
  nameHi: string;
  kind: 'mandatory' | 'cautionary' | 'informatory';
  shape: SignShape;
  /** Short text or symbol drawn in the middle of the sign. */
  glyph: string;
  /** Draw a red diagonal bar across the sign (prohibition). */
  slash?: boolean;
  meaning: string;
}

export const SIGN_KINDS = {
  mandatory: {
    label: 'Mandatory / regulatory',
    labelHi: 'अनिवार्य संकेत',
    note: 'Mostly circular. You must obey them — disobeying is an offence.',
  },
  cautionary: {
    label: 'Cautionary / warning',
    labelHi: 'चेतावनी संकेत',
    note: 'Red-bordered triangles. They warn of a hazard ahead so you can slow down.',
  },
  informatory: {
    label: 'Informatory',
    labelHi: 'सूचनात्मक संकेत',
    note: 'Rectangular, usually blue or green. They give information such as facilities and directions.',
  },
} as const;

export const SIGNS: RoadSign[] = [
  { id: 'stop', name: 'Stop', nameHi: 'रुकें', kind: 'mandatory', shape: 'octagon', glyph: 'STOP', meaning: 'Come to a complete stop at the line, then proceed only when safe.' },
  { id: 'give-way', name: 'Give way', nameHi: 'रास्ता दें', kind: 'mandatory', shape: 'triangle-down', glyph: '', meaning: 'Slow down and give way to traffic on the main road.' },
  { id: 'no-entry', name: 'No entry', nameHi: 'प्रवेश निषेध', kind: 'mandatory', shape: 'circle-ban', glyph: '—', meaning: 'Vehicles must not enter this road from this side.' },
  { id: 'speed-50', name: 'Speed limit 50', nameHi: 'गति सीमा 50', kind: 'mandatory', shape: 'circle-limit', glyph: '50', meaning: 'Do not exceed 50 km/h.' },
  { id: 'no-horn', name: 'Horn prohibited', nameHi: 'हॉर्न बजाना मना है', kind: 'mandatory', shape: 'circle-limit', glyph: '📯', slash: true, meaning: 'Do not sound the horn. Often near hospitals and schools.' },
  { id: 'no-parking', name: 'No parking', nameHi: 'पार्किंग निषेध', kind: 'mandatory', shape: 'circle-blue', glyph: '', slash: true, meaning: 'Do not park here. Stopping briefly may be allowed.' },
  { id: 'no-overtaking', name: 'Overtaking prohibited', nameHi: 'ओवरटेक करना मना है', kind: 'mandatory', shape: 'circle-limit', glyph: '🚗🚗', slash: true, meaning: 'Do not overtake other vehicles on this stretch.' },
  { id: 'no-u-turn', name: 'U-turn prohibited', nameHi: 'यू-टर्न निषेध', kind: 'mandatory', shape: 'circle-limit', glyph: '⤺', slash: true, meaning: 'Do not make a U-turn here.' },
  { id: 'school', name: 'School ahead', nameHi: 'आगे स्कूल है', kind: 'cautionary', shape: 'triangle', glyph: '🚸', meaning: 'Children may cross. Slow down and be ready to stop.' },
  { id: 'ped-crossing', name: 'Pedestrian crossing', nameHi: 'पैदल यात्री क्रॉसिंग', kind: 'cautionary', shape: 'triangle', glyph: '🚶', meaning: 'A zebra crossing is ahead. Give way to pedestrians.' },
  { id: 'narrow-bridge', name: 'Narrow bridge', nameHi: 'संकरा पुल', kind: 'cautionary', shape: 'triangle', glyph: ')(', meaning: 'The bridge ahead is narrower than the road.' },
  { id: 'slippery', name: 'Slippery road', nameHi: 'फिसलन भरी सड़क', kind: 'cautionary', shape: 'triangle', glyph: '〰', meaning: 'The road may be slippery. Avoid sudden braking.' },
  { id: 'sharp-right', name: 'Right hand curve', nameHi: 'दाहिना मोड़', kind: 'cautionary', shape: 'triangle', glyph: '↱', meaning: 'The road bends to the right ahead.' },
  { id: 'hospital', name: 'Hospital', nameHi: 'अस्पताल', kind: 'informatory', shape: 'square', glyph: 'H', meaning: 'A hospital is nearby. Avoid using the horn.' },
  { id: 'parking', name: 'Parking', nameHi: 'पार्किंग', kind: 'informatory', shape: 'square', glyph: 'P', meaning: 'Parking is permitted here.' },
  { id: 'fuel', name: 'Fuel station', nameHi: 'पेट्रोल पंप', kind: 'informatory', shape: 'square', glyph: '⛽', meaning: 'A fuel station is ahead.' },
];
