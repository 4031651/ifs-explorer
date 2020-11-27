import { IIFSMatrix } from 'fractals';

import { TTransforms, decompose, compose } from '../../utils/matrix';

import { BaseMarker } from './Base';

export class AffineMarker extends BaseMarker {
  decompose(): TTransforms {
    return decompose(this.matrix);
  }

  compose(): Partial<IIFSMatrix> {
    return compose(this.transforms);
  }
}
