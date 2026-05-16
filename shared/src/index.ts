export type Atom = {
  id: string;
  element: string;
  x: number;
  y: number;
};

export type BondOrder = 1 | 2 | 3;

export type Bond = {
  from: string;
  to: string;
  order: BondOrder;
};

export type Molecule = {
  id: string;
  name: string;
  atoms: Atom[];
  bonds: Bond[];
};

export type ApiError = { error: string };
