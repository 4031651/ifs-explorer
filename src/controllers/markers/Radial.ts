import { IIFSMatrix } from 'fractals';

import { TTransforms, decompose, compose } from '../../utils/matrix';

import { BaseMarker } from './Base';

export class RadialMarker extends BaseMarker {
  decompose(): TTransforms {
    const { a, b, t } = this.matrix;

    const M11 = a * Math.cos(t);
    const M12 = -b * Math.sin(t);
    const M21 = a * Math.sin(t);
    const M22 = b * Math.cos(t);

    const m = { ...this.matrix, a: M11, b: M12, c: M21, d: M22 };

    return decompose(m);
  }

  compose(): Partial<IIFSMatrix> {
    const m = compose(this.transforms);
    const cos = Math.cos(this.transforms.angle);

    const a = m.a / cos;
    const b = m.d / cos;

    return {
      ...this.matrix,
      a,
      b,
      t: this.transforms.angle,
      e: m.e,
      f: m.f,
    };
  }
}
