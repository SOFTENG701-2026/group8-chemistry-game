export type FamilyName =
  | 'alkyl' | 'alcohol' | 'amine' | 'acid' | 'aldehyde'
  | 'ketone' | 'ether' | 'ester' | 'aromatic' | 'nitro' | 'halide';

export type CardDef = {
  display: string;
  name: string;
  family: FamilyName;
};

export type FamilyStyle = {
  bg: string;
  border: string;
  dot: string;
};

export type CardInstance = {
  key: string;
  instanceId: string;
};

export type Problem = {
  name: string;
  sub: string;
  formula: string;
  correct: string[];
  extras: string[];
  symmetric?: boolean;
};

export type Feedback = 'right' | 'wrong' | null;

export type DragSource = 'pool' | 'build';

export type DragData = {
  instanceId: string;
  source: DragSource;
};
