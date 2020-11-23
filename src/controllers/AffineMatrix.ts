import { IIFSMatrix } from 'fractals';
import * as dat from 'dat.gui';

import { Matrix } from './Base';

// eslint-disable-next-line import/prefer-default-export
export class AffineMatrix extends Matrix {
  ['Xx Factor (a)'] = 0;
  ['Xy Factor (b)'] = 0;
  ['Yx Factor (c)'] = 0;
  ['Yy Factor (d)'] = 0;
  ['Translate X'] = 0;
  ['Translate Y'] = 0;

  constructor(name: string, m: IIFSMatrix) {
    super(name, m);

    this['Xx Factor (a)'] = m.a;
    this['Xy Factor (b)'] = m.b;
    this['Yx Factor (c)'] = m.c;
    this['Yy Factor (d)'] = m.d;
    this['Translate X'] = m.e;
    this['Translate Y'] = m.f;
  }

  toMatrix(): IIFSMatrix {
    return {
      a: this['Xx Factor (a)'],
      b: this['Xy Factor (b)'],
      c: this['Yx Factor (c)'],
      d: this['Yy Factor (d)'],
      e: this['Translate X'],
      f: this['Translate Y'],
      p: this.Probability,
      color: this.color,
    };
  }

  addControllers(gui: dat.GUI) {
    this.addFolder(gui);

    this.folder.add(this, 'Xx Factor (a)', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Xy Factor (b)', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Yx Factor (c)', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Yy Factor (d)', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Translate X', -10, 10, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Translate Y', -10, 10, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Probability', 0, 1, 0.001).onFinishChange(this.handleChange);
  }
}
