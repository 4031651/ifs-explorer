import { IIFSMatrix } from 'fractals';
import * as dat from 'dat.gui';

import { Matrix } from './Base';

// eslint-disable-next-line import/prefer-default-export
export class RadialMatrix extends Matrix {
  ['Scale X'] = 0;
  ['Scale Y'] = 0;
  Theta = 0;
  ['Translate X'] = 0;
  ['Translate Y'] = 0;
  Probability = 0;

  constructor(name: string, m: IIFSMatrix) {
    super(name, m);

    this['Scale X'] = m.a;
    this['Scale Y'] = m.b;
    this.Theta = m.t;
    this['Translate X'] = m.e;
    this['Translate Y'] = m.f;
    this.Probability = m.p;
  }

  toMatrix(): IIFSMatrix {
    return {
      a: this['Scale X'],
      b: this['Scale Y'],
      t: this.Theta,
      e: this['Translate X'],
      f: this['Translate Y'],
      p: this.Probability,
      color: this.color,
    };
  }

  addControllers(gui: dat.GUI) {
    this.addFolder(gui);

    this.folder.add(this, 'Scale X', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Scale Y', -1, 1, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Theta', 0, Math.PI * 2, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Translate X', -10, 10, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Translate Y', -10, 10, 0.001).onFinishChange(this.handleChange);
    this.folder.add(this, 'Probability', 0, 1, 0.001).onFinishChange(this.handleChange);
  }
}
