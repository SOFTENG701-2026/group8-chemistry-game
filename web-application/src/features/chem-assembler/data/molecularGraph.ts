const uid = () => Math.random().toString(36).slice(2, 9);
const STEP = 90;

type LocalAtom = { element: string; dx: number; dy: number };
type LocalBond = { from: number; to: number; order?: 1 | 2 };

type CardTemplate = {
  atoms: LocalAtom[];
  bonds: LocalBond[];
  leftIdx: number;       // atom index that bonds to prev card (-1 = none)
  rightIdx: number;      // atom index that bonds to next card (-1 = none)
  rightBondOrder: 1 | 2; // order of the bond to next card
  advance: number;       // x-shift for the next card's origin
};

export type MolAtom = { id: string; element: string; position: { x: number; y: number } };
export type MolBond = { id: string; source: string; target: string; order: 1 | 2 };
export type MolGraph = { atoms: MolAtom[]; bonds: MolBond[] };

const T: Record<string, CardTemplate> = {
  // ── Standalone ──────────────────────────────────────────────────────────────
  'CH4': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 55, dy: 0 }, { element: 'H', dx: -55, dy: 0 },
      { element: 'H', dx: 0, dy: 55 }, { element: 'H', dx: 0, dy: -55 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4 }],
    leftIdx: -1, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },

  // ── Terminal methyls ────────────────────────────────────────────────────────
  'CH3-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: -50, dy: -35 }, { element: 'H', dx: -50, dy: 35 },
      { element: 'H', dx: -65, dy: 0 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }],
    leftIdx: -1, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },
  '-CH3': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 50, dy: -35 }, { element: 'H', dx: 50, dy: 35 },
      { element: 'H', dx: 65, dy: 0 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },

  // ── Interior methylene ───────────────────────────────────────────────────────
  '-CH2-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 0, dy: -50 }, { element: 'H', dx: 0, dy: 50 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
    leftIdx: 0, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },

  // ── Branched methines ────────────────────────────────────────────────────────
  '-CH(CH3)-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 0, dy: -50 },
      { element: 'C', dx: 0, dy: 70 },
      { element: 'H', dx: -40, dy: 105 }, { element: 'H', dx: 40, dy: 105 },
      { element: 'H', dx: 0, dy: 120 },
    ],
    bonds: [
      { from: 0, to: 1 }, { from: 0, to: 2 },
      { from: 2, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 },
    ],
    leftIdx: 0, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },
  '-CH(OH)-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 0, dy: -50 },
      { element: 'O', dx: 0, dy: 65 },
      { element: 'H', dx: 0, dy: 110 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 2, to: 3 }],
    leftIdx: 0, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },
  '-CH(Cl)-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 0, dy: -50 },
      { element: 'Cl', dx: 0, dy: 65 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
    leftIdx: 0, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },

  // ── Alkenes ──────────────────────────────────────────────────────────────────
  'CH2=': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: -50, dy: -40 }, { element: 'H', dx: -50, dy: 40 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
    leftIdx: -1, rightIdx: 0, rightBondOrder: 2, advance: STEP,
  },
  '=CH2': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 50, dy: -40 }, { element: 'H', dx: 50, dy: 40 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },
  '=CH-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: 0, dy: -50 },
    ],
    bonds: [{ from: 0, to: 1 }],
    leftIdx: 0, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },
  '-CH=CH-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },   // C1
      { element: 'H', dx: 0, dy: -50 },
      { element: 'C', dx: 70, dy: 0 },  // C2
      { element: 'H', dx: 70, dy: -50 },
    ],
    bonds: [
      { from: 0, to: 2, order: 2 },
      { from: 0, to: 1 }, { from: 2, to: 3 },
    ],
    leftIdx: 0, rightIdx: 2, rightBondOrder: 1, advance: 70 + STEP,
  },

  // ── Heteroatom terminals ─────────────────────────────────────────────────────
  '-OH': {
    atoms: [
      { element: 'O', dx: 0, dy: 0 },
      { element: 'H', dx: 50, dy: 0 },
    ],
    bonds: [{ from: 0, to: 1 }],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },
  'HO-': {
    atoms: [
      { element: 'O', dx: 0, dy: 0 },
      { element: 'H', dx: -50, dy: 0 },
    ],
    bonds: [{ from: 0, to: 1 }],
    leftIdx: -1, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },
  '-NH2': {
    atoms: [
      { element: 'N', dx: 0, dy: 0 },
      { element: 'H', dx: -35, dy: 50 }, { element: 'H', dx: 35, dy: 50 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },
  'NH2-': {
    atoms: [
      { element: 'N', dx: 0, dy: 0 },
      { element: 'H', dx: -35, dy: -50 }, { element: 'H', dx: 35, dy: -50 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
    leftIdx: -1, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },
  '-Cl': {
    atoms: [{ element: 'Cl', dx: 0, dy: 0 }],
    bonds: [],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },

  // ── Carbonyl-based terminals ─────────────────────────────────────────────────
  '-COOH': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'O', dx: 0, dy: -60 },   // =O
      { element: 'O', dx: 55, dy: 0 },    // -OH oxygen
      { element: 'H', dx: 100, dy: 0 },
    ],
    bonds: [{ from: 0, to: 1, order: 2 }, { from: 0, to: 2 }, { from: 2, to: 3 }],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },
  '-COO-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'O', dx: 0, dy: -60 },   // =O
      { element: 'O', dx: 55, dy: 0 },    // ester O
    ],
    bonds: [{ from: 0, to: 1, order: 2 }, { from: 0, to: 2 }],
    leftIdx: 0, rightIdx: 2, rightBondOrder: 1, advance: 55 + STEP,
  },
  'H-COO-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'H', dx: -50, dy: 0 },
      { element: 'O', dx: 0, dy: -60 },   // =O
      { element: 'O', dx: 55, dy: 0 },    // ester O
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2, order: 2 }, { from: 0, to: 3 }],
    leftIdx: -1, rightIdx: 3, rightBondOrder: 1, advance: 55 + STEP,
  },
  '-COCl': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'O', dx: 0, dy: -60 },
      { element: 'Cl', dx: 55, dy: 0 },
    ],
    bonds: [{ from: 0, to: 1, order: 2 }, { from: 0, to: 2 }],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },
  '-CONH2': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },
      { element: 'O', dx: 0, dy: -60 },
      { element: 'N', dx: 55, dy: 0 },
      { element: 'H', dx: 85, dy: -35 }, { element: 'H', dx: 85, dy: 35 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 }, { from: 0, to: 2 },
      { from: 2, to: 3 }, { from: 2, to: 4 },
    ],
    leftIdx: 0, rightIdx: -1, rightBondOrder: 1, advance: 0,
  },

  // ── tert-Butyl ───────────────────────────────────────────────────────────────
  '(CH3)3C-': {
    atoms: [
      { element: 'C', dx: 0, dy: 0 },        // quaternary C [0]
      { element: 'C', dx: -65, dy: -50 },    // methyl1 C [1]
      { element: 'H', dx: -95, dy: -75 }, { element: 'H', dx: -35, dy: -75 }, { element: 'H', dx: -65, dy: -95 },
      { element: 'C', dx: -65, dy: 50 },     // methyl2 C [5]
      { element: 'H', dx: -95, dy: 75 }, { element: 'H', dx: -35, dy: 75 }, { element: 'H', dx: -65, dy: 95 },
      { element: 'C', dx: -85, dy: 0 },      // methyl3 C [9]
      { element: 'H', dx: -120, dy: -30 }, { element: 'H', dx: -120, dy: 30 }, { element: 'H', dx: -130, dy: 0 },
    ],
    bonds: [
      { from: 0, to: 1 }, { from: 0, to: 5 }, { from: 0, to: 9 },
      { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 },
      { from: 5, to: 6 }, { from: 5, to: 7 }, { from: 5, to: 8 },
      { from: 9, to: 10 }, { from: 9, to: 11 }, { from: 9, to: 12 },
    ],
    leftIdx: -1, rightIdx: 0, rightBondOrder: 1, advance: STEP,
  },
};

export function buildMolecularGraph(correctCards: string[]): MolGraph {
  const allAtoms: MolAtom[] = [];
  const allBonds: MolBond[] = [];

  let startX = 0;
  let prevRightId: string | null = null;
  let prevRightBondOrder: 1 | 2 = 1;

  for (const cardKey of correctCards) {
    const tmpl = T[cardKey];
    if (!tmpl) {
      console.warn(`molecularGraph: unknown card key "${cardKey}"`);
      startX += STEP;
      continue;
    }

    const localIds = tmpl.atoms.map(() => uid());

    for (let i = 0; i < tmpl.atoms.length; i++) {
      const a = tmpl.atoms[i];
      allAtoms.push({
        id: localIds[i],
        element: a.element,
        position: { x: startX + a.dx, y: a.dy },
      });
    }

    for (const b of tmpl.bonds) {
      allBonds.push({
        id: uid(),
        source: localIds[b.from],
        target: localIds[b.to],
        order: b.order ?? 1,
      });
    }

    if (prevRightId !== null && tmpl.leftIdx !== -1) {
      allBonds.push({
        id: uid(),
        source: prevRightId,
        target: localIds[tmpl.leftIdx],
        order: prevRightBondOrder,
      });
    }

    prevRightId = tmpl.rightIdx !== -1 ? localIds[tmpl.rightIdx] : null;
    prevRightBondOrder = tmpl.rightBondOrder;
    startX += tmpl.advance;
  }

  return { atoms: allAtoms, bonds: allBonds };
}
