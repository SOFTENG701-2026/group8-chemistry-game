export type FamilyName =
  | 'alkyl' | 'alcohol' | 'amine' | 'acid' | 'aldehyde'
  | 'ketone' | 'ether' | 'ester' | 'aromatic' | 'nitro' | 'halide' | 'amide';

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

export type Level1ErrorType =
  | 'wrong_order'
  | 'wrong_length_low'
  | 'wrong_length_high'
  | 'wrong_family'
  | 'wrong_card'
  | null;

export type Level2ErrorType =
  | 'too_few_bonds'
  | 'too_many_bonds'
  | 'wrong_bond_order'
  | 'wrong_structure'
  | null;

export type Level3ErrorType = 'wrong_formula' | null;

export type LessonErrorType = Level1ErrorType | Level2ErrorType | Level3ErrorType;

export type DragSource = 'pool' | 'build';

export type DragData = {
  instanceId: string;
  source: DragSource;
};
