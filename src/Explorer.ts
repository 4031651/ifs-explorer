/* eslint-disable no-underscore-dangle */
import * as dat from 'dat.gui';
import { IIFSParams, affine, radial } from 'fractals';

import { Matrix, AffineMatrix, RadialMatrix } from './controllers';
import { elem } from './utils/dom';

import presets from './ifs.json';

(() => {
  const θ = (60 * Math.PI) / 180;
  const r = 0.6;
  const { sin, cos } = Math;

  presets['P Tree 2'] = {
    matrices: [
      { a: r * cos(θ), b: -r * sin(θ), c: r * sin(θ), d: r * cos(θ), e: 0, f: 1, p: 1 },
      { a: r * cos(θ), b: r * sin(θ), c: -r * sin(θ), d: r * cos(θ), e: 0, f: 1, p: 1 },
    ],
    density: 200,
  };
})();

type TPNames = keyof typeof presets;
type TPreset = Omit<IIFSParams, 'equation'> & { equation?: string };
type TOnChangeCB = (p: IIFSParams, o: Record<string, unknown>) => unknown;

const EQUATIONS = ['affine', 'radial'];
const PRESET_NAMES = Object.keys(presets);
const DEFAULTS = {
  density: 50,
  iterations: 100000,
  equation: EQUATIONS[0],
};

export class Explorer {
  private gui: dat.GUI;
  private matrices: Matrix[] = [];
  private changeFn: TOnChangeCB;

  // data
  private Preset = '';
  private Density = 50;
  private Iterations = 100000;
  private Equation = EQUATIONS[0];
  private ['Show Bounds'] = false;

  constructor() {
    const sidebar = document.getElementById('giu');

    this.gui = new dat.GUI({
      autoPlace: false,
      width: sidebar.clientWidth,
      hideable: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      scrollable: true,
    });

    this.gui.add(this, 'Show Bounds').onFinishChange(this.update);
    this.gui.add(this, 'Preset', PRESET_NAMES).onChange(this.load);

    this.addSeparator();

    this.gui.add(this, 'Density', 1, 1000).onFinishChange(this.update);
    this.gui.add(this, 'Iterations', 10000, 1000000, 1000).onFinishChange(this.update);
    this.gui.add(this, 'Equation', EQUATIONS).onFinishChange(this.update);

    this.addSeparator();

    sidebar.appendChild(this.gui.domElement);
  }

  addSeparator() {
    const li = elem('li', { className: 'separator' }, elem('hr'));

    this.gui.__ul.appendChild(li);

    this.gui.onResize();
  }

  addMatrices(config: TPreset) {
    this.matrices.forEach((m) => m.marker.destroy());
    this.matrices = [];
    const hChunk = 255 / config.matrices.length - 1;

    for (let i = 0; i < config.matrices.length; i++) {
      const color = `hsl(${hChunk * i}, 100%, 50%)`;

      const copy = { ...config.matrices[i], color };
      const mainElem = document.querySelector('main');
      const m =
        this.Equation === 'affine'
          ? new AffineMatrix(`Matrix: ${i + 1}`, copy, this.Density, mainElem)
          : new RadialMatrix(`Matrix: ${i + 1}`, copy, this.Density, mainElem);

      m.addControllers(this.gui);
      m.onChange(this.update);
      m.onRemove(() => {
        const [removed] = this.matrices.splice(this.matrices.indexOf(m), 1);
        this.gui.removeFolder(removed.folder);
        this.update();
      });
      this.matrices.push(m);
    }
  }

  load = (e: TPNames) => {
    const p: TPreset = presets[e];
    this.Density = p.density ?? DEFAULTS.density;
    this.Iterations = p.iterations ?? DEFAULTS.iterations;
    this.Equation = p.equation ?? DEFAULTS.equation;

    for (const f of Object.values(this.gui.__folders)) {
      f.unbind();
      this.gui.removeFolder(f);
    }

    this.gui.updateDisplay();

    this.addMatrices(p);

    this.update();
  };

  update = () => {
    const matrices = this.matrices.map((m) => m.toMatrix());

    this.changeFn(
      {
        density: this.Density,
        iterations: this.Iterations,
        equation: this.Equation === 'radial' ? radial : affine,
        matrices,
      },
      {
        showBounds: this['Show Bounds'],
      },
    );
  };

  onChange(fn: TOnChangeCB) {
    this.changeFn = fn;
  }

  showMarker(top: number, left: number, i: number) {
    this.matrices[i].showMarker(top, left);
  }
}
