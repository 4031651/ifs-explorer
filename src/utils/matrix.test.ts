import { IIFSMatrix, IIFSParams } from 'fractals';
import presets from '../ifs.json';

import { decompose, compose } from './matrix';

function isEqual(a: IIFSMatrix, b: Partial<IIFSMatrix>): boolean {
  return 'abcdef'.split('').every((key) => Math.abs(a[key] - b[key]) < 0.001);
}

type TPreset = IIFSParams & {
  equation?: string;
};

type TPNames = keyof typeof presets;

let hasError = false;
// eslint-disable-next-line no-labels
tests: for (const pk of <TPNames[]>Object.keys(presets)) {
  const p = <TPreset>presets[pk];
  if (p.equation === 'radial') {
    continue;
  }
  console.log('>>>>', pk);
  for (let idx = 0; idx < p.matrices.length; idx++) {
    const m = p.matrices[idx];
    const d = decompose(m);
    const m1 = compose(d);
    const eq = isEqual(m, m1);
    console.log(idx, eq);
    // console.log('skew', d);
    if (!eq) {
      console.log(m);
      console.log(m1);
      hasError = true;
      // eslint-disable-next-line no-labels
      break tests;
    }
  }
}

console.log(hasError ? 'An error occurred' : 'Success');
