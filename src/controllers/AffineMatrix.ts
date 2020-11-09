import { IIFSMatrix } from 'fractals';
import * as dat from 'dat.gui';

import { Matrix } from './Base';

// eslint-disable-next-line import/prefer-default-export
export class AffineMatrix extends Matrix {
  ['X scaleX'] = 0;
  ['X scaleY'] = 0;
  ['Y scaleX'] = 0;
  ['Y scaleY'] = 0;
  ['Translate X'] = 0;
  ['Translate Y'] = 0;

  constructor(name: string, m: IIFSMatrix) {
    super(name, m);

    this['X scaleX'] = m.a;
    this['X scaleY'] = m.b;
    this['Y scaleX'] = m.c;
    this['Y scaleY'] = m.d;
    this['Translate X'] = m.e;
    this['Translate Y'] = m.f;
  }

  toMatrix(): IIFSMatrix {
    return {
      a: this['X scaleX'],
      b: this['X scaleY'],
      c: this['Y scaleX'],
      d: this['Y scaleY'],
      e: this['Translate X'],
      f: this['Translate Y'],
      p: this.Probability,
      color: this.color,
    };
  }

  addControllers(gui: dat.GUI) {
    this.addFolder(gui);

    this.folder.add(this, 'X scaleX', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'X scaleY', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Y scaleX', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Y scaleY', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Translate X', -10, 10, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Translate Y', -10, 10, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Probability', 0, 1, 0.001).onFinishChange(this.handleChange);
  }
}
