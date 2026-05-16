import type { CardDef, FamilyName, FamilyStyle } from '../types';

export const CARD_DEF: Record<string, CardDef> = {
  'CH3-':  { display: 'CH₃—',  name: 'methyl',        family: 'alkyl'    },
  '-CH2-': { display: '—CH₂—', name: 'methylene',     family: 'alkyl'    },
  '-CH3':  { display: '—CH₃',  name: 'methyl',        family: 'alkyl'    },
  '-OH':   { display: '—OH',   name: 'hydroxyl',      family: 'alcohol'  },
  '-NH2':  { display: '—NH₂',  name: 'amino',         family: 'amine'    },
  '-COOH': { display: '—COOH', name: 'carboxyl',      family: 'acid'     },
  '-CHO':  { display: '—CHO',  name: 'aldehyde',      family: 'aldehyde' },
  '-CO-':  { display: '—CO—',  name: 'carbonyl',      family: 'ketone'   },
  '-O-':   { display: '—O—',   name: 'ether bridge',  family: 'ether'    },
  '-COO-': { display: '—COO—', name: 'ester linkage', family: 'ester'    },
  'C6H5-': { display: 'C₆H₅—', name: 'phenyl',        family: 'aromatic' },
  '-NO2':  { display: '—NO₂',  name: 'nitro',         family: 'nitro'    },
  '-Cl':   { display: '—Cl',   name: 'chloro',        family: 'halide'   },
};

export const FAMILY: Record<FamilyName, FamilyStyle> = {
  alkyl:    { bg: '#EFE6D2', border: '#C9B98F', dot: '#8C7A4A' },
  alcohol:  { bg: '#D9E9EF', border: '#82B0BE', dot: '#3C7A8C' },
  amine:    { bg: '#E2D6EE', border: '#A38AC3', dot: '#6A4C9A' },
  acid:     { bg: '#EFCEC7', border: '#C57B6E', dot: '#A03E2E' },
  aldehyde: { bg: '#EFDCBE', border: '#C39456', dot: '#8A5A1F' },
  ketone:   { bg: '#EFE0AE', border: '#C0A042', dot: '#7E6614' },
  ether:    { bg: '#C9E5E0', border: '#6FAFA3', dot: '#2F756A' },
  ester:    { bg: '#EFCFDD', border: '#C57B98', dot: '#933A60' },
  aromatic: { bg: '#CDE3C5', border: '#7BAE6C', dot: '#3C7530' },
  nitro:    { bg: '#EEE49B', border: '#BAA834', dot: '#7A6B0E' },
  halide:   { bg: '#C5D6D5', border: '#6F8E8C', dot: '#3A5755' },
};
