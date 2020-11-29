import { IIFSMatrix } from 'fractals';
import * as dat from 'dat.gui';

import { Matrix } from './Base';
import { RadialMarker } from './markers/Radial';

export class RadialMatrix extends Matrix {
  static create(): IIFSMatrix {
    return { a: 1, b: 1, t: 0, e: 0, f: 0, p: 0.1 };
  }

  ['Scale X'] = 0;
  ['Scale Y'] = 0;
  Theta = 0;
  ['Translate X'] = 0;
  ['Translate Y'] = 0;
  Probability = 0;

  constructor(name: string, m: IIFSMatrix, density: number, markerRoot: HTMLElement) {
    super(name, m, density, markerRoot);

    this.set(m);
  }

  createMarker() {
    this.marker = new RadialMarker(this.toMatrix(), this.density);
  }

  set(m: IIFSMatrix) {
    this.matrix = m;

    this['Scale X'] = m.a;
    this['Scale Y'] = m.b;
    this.Theta = m.t;
    this['Translate X'] = m.e;
    this['Translate Y'] = m.f;
    this.Probability = m.p;
    this.Color = m.color;

    this.handleChange();
  }

  toMatrix(): IIFSMatrix {
    return {
      a: this['Scale X'],
      b: this['Scale Y'],
      t: this.Theta,
      e: this['Translate X'],
      f: this['Translate Y'],
      p: this.Probability,
      color: this.Color,
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
    this.folder.add(this, 'Show Marker').onFinishChange(this.handleChangeMarkerVisibility);
    this.folder.addColor(this, 'Color').onFinishChange(this.handleChangeColor);
  }
}
