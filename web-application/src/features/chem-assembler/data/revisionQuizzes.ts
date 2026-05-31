export type RevisionQuizQuestion = {
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type RevisionQuiz = {
  groupId: 1 | 2 | 3;
  title: string;
  questions: RevisionQuizQuestion[];
};

export const revisionQuizzes: RevisionQuiz[] = [
  {
    groupId: 1,
    title: 'The Basics revision quiz',
    questions: [
      {
        prompt: 'Which functional group makes methanol and ethanol alcohols?',
        choices: ['Hydroxyl, -OH', 'Amino, -NH2', 'Carboxyl, -COOH', 'Chloro, -Cl'],
        answer: 'Hydroxyl, -OH',
        explanation: 'Alcohols contain the hydroxyl group, -OH, attached to a carbon chain.',
      },
      {
        prompt: 'Ethene and propene are different from alkanes because they contain what feature?',
        choices: ['A carbon-carbon double bond', 'A carboxyl group', 'A nitrogen atom', 'An ester linkage'],
        answer: 'A carbon-carbon double bond',
        explanation: 'Alkenes contain a C=C double bond, while alkanes only use single carbon-carbon bonds.',
      },
      {
        prompt: 'Which set of pieces builds propane?',
        choices: ['CH3-, -CH2-, -CH3', 'CH3-, -OH', 'CH2=, =CH2', 'CH3-, -COOH'],
        answer: 'CH3-, -CH2-, -CH3',
        explanation: 'Propane is a three-carbon alkane: a methyl end, a methylene middle, and another methyl end.',
      },
      {
        prompt: 'What does the -Cl piece add to chloroethane?',
        choices: ['A halogen substituent', 'A hydroxyl group', 'A double bond', 'An amino group'],
        answer: 'A halogen substituent',
        explanation: 'Chloroethane is a haloalkane because chlorine replaces one hydrogen on the carbon chain.',
      },
    ],
  },
  {
    groupId: 2,
    title: 'Branching & New Groups revision quiz',
    questions: [
      {
        prompt: 'Which group identifies ethanoic acid and propanoic acid as carboxylic acids?',
        choices: ['-COOH', '-NH2', '-CH(OH)-', '-CH(Cl)-'],
        answer: '-COOH',
        explanation: 'Carboxylic acids contain the carboxyl group, written as -COOH.',
      },
      {
        prompt: 'What does the "2-" in propan-2-ol tell you?',
        choices: ['The hydroxyl group is on carbon 2', 'There are two separate alcohol groups', 'The chain has two carbons', 'The molecule has two double bonds'],
        answer: 'The hydroxyl group is on carbon 2',
        explanation: 'The number gives the position of the functional group or substituent on the parent chain.',
      },
      {
        prompt: 'Which piece represents a methyl branch in 2-methylpropane?',
        choices: ['-CH(CH3)-', '-COOH', '-NH2', '-CH=CH-'],
        answer: '-CH(CH3)-',
        explanation: 'The -CH(CH3)- piece keeps the main chain connected while carrying a methyl branch.',
      },
      {
        prompt: 'Ethanamine and propan-1-amine both contain which functional group?',
        choices: ['Amino, -NH2', 'Hydroxyl, -OH', 'Ester, -COO-', 'Chloro, -Cl'],
        answer: 'Amino, -NH2',
        explanation: 'Amines contain nitrogen in an amino group, shown here as -NH2.',
      },
    ],
  },
  {
    groupId: 3,
    title: 'Esters & Complex Chains revision quiz',
    questions: [
      {
        prompt: 'Which piece is the ester linkage used in methyl ethanoate and ethyl ethanoate?',
        choices: ['-COO-', '-CONH2', '-COCl', '-COOH'],
        answer: '-COO-',
        explanation: 'Esters contain the -COO- linkage between the acid-derived and alcohol-derived parts.',
      },
      {
        prompt: 'Which molecule combines an amino group and a carboxylic acid group?',
        choices: ['Glycine (Amino Acid)', 'Ethanoyl chloride', 'Butyl ethanoate', 'Ethan-1,2-diol'],
        answer: 'Glycine (Amino Acid)',
        explanation: 'Glycine is built from NH2-, -CH2-, and -COOH, so it contains both amine and acid chemistry.',
      },
      {
        prompt: 'What makes ethan-1,2-diol a diol?',
        choices: ['It has two hydroxyl groups', 'It has two ester linkages', 'It has two chlorine atoms', 'It has two amino groups'],
        answer: 'It has two hydroxyl groups',
        explanation: 'The "diol" ending means there are two alcohol groups in the molecule.',
      },
      {
        prompt: 'Which functional group is present in propanamide?',
        choices: ['Amide, -CONH2', 'Acyl chloride, -COCl', 'Ester, -COO-', 'Halide, -Cl'],
        answer: 'Amide, -CONH2',
        explanation: 'Propanamide contains the amide group, shown by the -CONH2 piece.',
      },
    ],
  },
];

export function getRevisionQuiz(groupId: number) {
  return revisionQuizzes.find(quiz => quiz.groupId === groupId);
}
