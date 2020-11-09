/* eslint-disable no-underscore-dangle */
import * as dat from 'dat.gui';
import { IFS, IIFSParams, affine, radial } from 'fractals';

import { Matrix, AffineMatrix, RadialMatrix } from './controllers';

import presets from './ifs.json';

type TPNames = keyof typeof presets;
type TPreset = Omit<IIFSParams, 'equation'> & { equation?: string };
type TOnChangeCB = (p: IIFSParams) => unknown;

const EQUATIONS = ['affine', 'radial'];
const PRESET_NAMES = Object.keys(presets);
const DEFAULTS = {
  density: 50,
  iterations: 100000,
  equation: EQUATIONS[0],
};

class Explorer {
  private gui: dat.GUI;
  private matrices: Matrix[];
  private changeFn: TOnChangeCB;
  private Preset = '';
  private Density = 50;
  private Iterations = 100000;
  private Equation = EQUATIONS[0];

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

    this.gui.add(this, 'Preset', PRESET_NAMES).onChange(this.load);

    this.addSeparator();

    this.gui.add(this, 'Density', 1, 1000).onFinishChange(this.update);
    this.gui.add(this, 'Iterations', 10000, 1000000, 1000).onFinishChange(this.update);
    this.gui.add(this, 'Equation', EQUATIONS).onFinishChange(this.update);

    this.addSeparator();

    sidebar.appendChild(this.gui.domElement);
  }

  addSeparator() {
    const li = document.createElement('li');
    li.appendChild(document.createElement('hr'));
    li.classList.add('separator');

    this.gui.__ul.appendChild(li);

    this.gui.onResize();
  }

  addMatrices(config: TPreset) {
    this.matrices = [];
    const hChunk = 255 / config.matrices.length - 1;

    for (let i = 0; i < config.matrices.length; i++) {
      const color = `hsl(${hChunk * i}, 100%, 50%)`;

      const copy = { ...config.matrices[i], color };
      const m =
        this.Equation === 'affine'
          ? new AffineMatrix(`Matrix: ${i + 1}`, copy)
          : new RadialMatrix(`Matrix: ${i + 1}`, copy);

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

    this.changeFn({
      density: this.Density,
      iterations: this.Iterations,
      equation: this.Equation === 'radial' ? radial : affine,
      matrices,
    });
  };

  onChange(fn: TOnChangeCB) {
    this.changeFn = fn;
  }
}

new Explorer().onChange((params: IIFSParams) => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.warn('canvas is null');
    return;
  }

  const fractal = new IFS(params);
  fractal.run();

  const offsetX = fractal.bounds[2];
  const offsetY = fractal.bounds[3];
  canvas.height = fractal.bounds[1] + Math.abs(fractal.bounds[3]) + 20;
  canvas.width = fractal.bounds[0] + Math.abs(fractal.bounds[2]) + 20;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.save();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(-offsetX + 10, offsetY + canvas.height - 10);
  ctx.scale(1, -1);

  for (let i = 0; i < fractal.points.length; i++) {
    const [x, y, { matrixNum }] = fractal.points[i];
    ctx.fillStyle = fractal.matrices[matrixNum].color;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
});
