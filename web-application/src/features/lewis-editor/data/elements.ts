export type ElementInfo = {
  symbol: string;
  name: string;
  atomicNumber: number;
  valence: number;
  bg: string;
  border: string;
};

export const ELEMENTS: Record<string, ElementInfo> = {
  H:  { symbol: 'H',  name: 'Hydrogen',  atomicNumber: 1,  valence: 1, bg: '#EFF3F6', border: '#A8BEC9' },
  C:  { symbol: 'C',  name: 'Carbon',    atomicNumber: 6,  valence: 4, bg: '#EFE6D2', border: '#C9B98F' },
  N:  { symbol: 'N',  name: 'Nitrogen',  atomicNumber: 7,  valence: 3, bg: '#E2D6EE', border: '#A38AC3' },
  O:  { symbol: 'O',  name: 'Oxygen',    atomicNumber: 8,  valence: 2, bg: '#D9E9EF', border: '#82B0BE' },
  F:  { symbol: 'F',  name: 'Fluorine',  atomicNumber: 9,  valence: 1, bg: '#C9E5E0', border: '#6FAFA3' },
  S:  { symbol: 'S',  name: 'Sulfur',    atomicNumber: 16, valence: 2, bg: '#EFE0AE', border: '#C0A042' },
  P:  { symbol: 'P',  name: 'Phosphorus',atomicNumber: 15, valence: 5, bg: '#EFCFDD', border: '#C57B98' },
  Cl: { symbol: 'Cl', name: 'Chlorine',  atomicNumber: 17, valence: 1, bg: '#C5D6D5', border: '#6F8E8C' },
  Br: { symbol: 'Br', name: 'Bromine',   atomicNumber: 35, valence: 1, bg: '#EFCEC7', border: '#C57B6E' },
  I:  { symbol: 'I',  name: 'Iodine',    atomicNumber: 53, valence: 1, bg: '#E8E0F4', border: '#9B7FCA' },
};

export const PALETTE_ELEMENTS = ['H', 'C', 'N', 'O', 'F', 'S', 'P', 'Cl', 'Br', 'I'] as const;

// Hill-notation formula → molecule name (covers all PROBLEMS molecules + common extras)
export const FORMULA_TO_NAME: Record<string, string> = {
  'CH4':      'Methane',
  'C2H6':     'Ethane',
  'C3H8':     'Propane',
  'C4H10':    'Butane',
  'C5H12':    'Pentane',
  'CH4O':     'Methanol',
  'C2H6O':    'Ethanol',       // Note: same as dimethyl ether — formula only, not structural
  'C3H8O':    'Propan-1-ol',
  'C2H4':     'Ethene',
  'C3H6':     'Propene',
  'C2H5Cl':   'Chloroethane',
  'C4H8':     'Butene',
  'C4H8O2':   'Ethyl acetate',
  'C2H7N':    'Ethylamine',
  'C2H4O2':   'Acetic acid',
  'CH2O':     'Formaldehyde',
  'C3H6O':    'Acetone',
  'C2H4O':    'Acetaldehyde',
  'C2H5NO2':  'Glycine',
  'C6H6':     'Benzene',
  'H2O':      'Water',
  'NH3':      'Ammonia',
  'CO2':      'Carbon dioxide',
  'HCl':      'Hydrogen chloride',
  'H2':       'Hydrogen gas',
  'O2':       'Oxygen gas',
  'N2':       'Nitrogen gas',
};
