import { OFFICER_MULTIPLIER } from '../data/offences';
import type { Offence } from '../data/types';

export interface FineInput {
  offence: Offence;
  /** For s.194(1): tonnes over the permitted weight. */
  excessTonnes?: number;
  /** For s.194A: passengers over the permitted number. */
  excessPassengers?: number;
  /** Section 210B: the offender is an enforcing officer. */
  isOfficer?: boolean;
  /** Section 210A: state multiplier (1–10). */
  stateMultiplier?: number;
}

export interface FineResult {
  min: number;
  max: number;
  notes: string[];
}

/** Estimate the central fine range for a first offence. Not a substitute for the challan amount. */
export function estimateFine({ offence, excessTonnes = 0, excessPassengers = 0, isOfficer = false, stateMultiplier = 1 }: FineInput): FineResult {
  let min = offence.fineMin;
  let max = offence.fineMax;
  const notes: string[] = [];

  if (offence.id === 'off-194' && excessTonnes > 0) {
    const extra = Math.ceil(excessTonnes) * 2000;
    min += extra;
    max += extra;
    notes.push(`Includes ₹2,000 × ${Math.ceil(excessTonnes)} excess tonne(s).`);
  }
  if (offence.id === 'off-194a') {
    const n = Math.max(1, Math.floor(excessPassengers));
    min = 200 * n;
    max = 200 * n;
    notes.push(`₹200 × ${n} excess passenger(s).`);
  }

  const mult = Math.min(10, Math.max(1, stateMultiplier));
  if (mult !== 1) {
    min *= mult;
    max *= mult;
    notes.push(`State multiplier ×${mult} applied (Section 210A).`);
  }
  if (isOfficer) {
    min *= OFFICER_MULTIPLIER;
    max *= OFFICER_MULTIPLIER;
    notes.push('Doubled because the offender is an enforcing authority (Section 210B).');
  }
  if (offence.fineMin === 0) notes.push('The Act sets only a maximum; the court or compounding officer decides the amount.');
  if (offence.extra) notes.push(offence.extra);
  return { min, max, notes };
}

export function rupees(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}
