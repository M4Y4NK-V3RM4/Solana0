export type Audience = 'citizen' | 'official' | 'both';

export type LawCategory =
  | 'licensing'
  | 'registration'
  | 'permits'
  | 'road-rules'
  | 'safety'
  | 'accidents'
  | 'insurance'
  | 'enforcement'
  | 'vehicle-standards'
  | 'criminal';

/** One provision of an Act or Rules, written in plain language. */
export interface LawEntry {
  id: string;
  /** e.g. "MV Act 1988" or "CMVR 1989" */
  source: string;
  /** e.g. "Section 129" or "Rule 50" */
  ref: string;
  title: string;
  titleHi?: string;
  category: LawCategory;
  audience: Audience;
  /** Plain-language explanation of what the law says. */
  summary: string;
  /** Practical points: what it means on the road / at the RTO. */
  keyPoints: string[];
  /** Why the rule exists and how it changed over time. */
  history?: string;
  related?: string[];
  tags: string[];
}

/** A punishable offence with its central (default) penalty. */
export interface Offence {
  id: string;
  section: string;
  title: string;
  titleHi?: string;
  /** Central penalty for a first offence, as text. */
  first: string;
  /** Central penalty for a repeat offence, if different. */
  subsequent?: string;
  /** Minimum fine in rupees for a first offence, for the calculator. 0 if none fixed. */
  fineMin: number;
  /** Maximum fine in rupees for a first offence, for the calculator. */
  fineMax: number;
  /** Extra consequences: licence disqualification, impounding, etc. */
  extra?: string;
  /** Whether a licence can be seized under Section 206(4). */
  licenceSeizable?: boolean;
  tags: string[];
}

export interface HistoryEvent {
  year: string;
  title: string;
  detail: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionHi?: string;
  options: string[];
  answer: number;
  explanation: string;
  /** Optional road sign id to show with the question. */
  signId?: string;
}

export interface Checklist {
  id: string;
  title: string;
  for: string;
  basis: string;
  sections: { heading: string; items: string[] }[];
}
