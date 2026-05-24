import { PROBLEMS } from './problems';
import { CARD_DEF } from './cards';
import type { FamilyName } from '../types';

export const lessonGroupData = [
  {
    groupId: 1,
    title: 'The Basics',
    molecules: [
      'Methane', 'Ethane', 'Propane', 'Butane',
      'Methanol', 'Ethanol', 'Propan-1-ol',
      'Ethene', 'Propene', 'Chloroethane',
    ],
  },
  {
    groupId: 2,
    title: 'Branching & New Groups',
    molecules: [
      'Ethanoic Acid', 'Propanoic Acid', 'Ethanamine', 'Propan-1-amine',
      '2-methylpropane', 'Propan-2-ol', 'Butan-2-ol',
      '1-chloropropane', '2-chloropropane', 'But-2-ene',
    ],
  },
  {
    groupId: 3,
    title: 'Esters & Complex Chains',
    molecules: [
      'Methyl ethanoate', 'Ethyl ethanoate', 'Propyl methanoate', 'Butyl ethanoate',
      'Propanamide', 'Ethanoyl chloride', 'Ethan-1,2-diol',
      '2-chloro-2-methylpropane', '2-hydroxypropanoic acid (Lactic Acid)', 'Glycine (Amino Acid)',
    ],
  },
];

export const FAMILY_LABEL: Record<FamilyName, string> = {
  alkyl: 'ALKANE',
  alcohol: 'ALCOHOL',
  amine: 'AMINE',
  acid: 'CARBOXYLIC ACID',
  aldehyde: 'ALDEHYDE',
  ketone: 'KETONE',
  ether: 'ETHER',
  ester: 'ESTER',
  amide: 'AMIDE',
  aromatic: 'AROMATIC',
  nitro: 'NITRO',
  halide: 'HALOALKANE',
};

export const FILTER_CHIP_LABEL: Partial<Record<FamilyName, string>> = {
  alkyl: 'Alkanes',
  alcohol: 'Alcohols',
  amine: 'Amines',
  acid: 'Acids',
  aldehyde: 'Aldehydes',
  ketone: 'Ketones',
  ether: 'Ethers',
  ester: 'Esters',
  amide: 'Amides',
  aromatic: 'Aromatics',
  nitro: 'Nitro',
  halide: 'Haloalkanes',
};

export type FilterValue = 'all' | FamilyName | 'unsolved';

export function getPrimaryFamily(moleculeName: string): FamilyName {
  const problem = PROBLEMS.find(p => p.name === moleculeName);
  if (!problem) return 'alkyl';
  for (const cardId of problem.correct) {
    const card = CARD_DEF[cardId];
    if (card && card.family !== 'alkyl') return card.family as FamilyName;
  }
  return 'alkyl';
}

export function getAllLessonMolecules() {
  return lessonGroupData.flatMap(level => level.molecules);
}
