/* eslint-disable no-underscore-dangle */
import * as dat from 'dat.gui';
import { IFS, IIFSParams, affine, radial } from 'fractals';

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

class Explorer {
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
      const m =
        this.Equation === 'affine'
          ? new AffineMatrix(`Matrix: ${i + 1}`, copy, document.querySelector('main'))
          : new RadialMatrix(`Matrix: ${i + 1}`, copy, document.querySelector('main'));

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

const explorer = new Explorer();
explorer.onChange((params: IIFSParams, options: Record<string, unknown>) => {
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

  const padding = 10;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.save();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(-offsetX + padding, offsetY + canvas.height - padding);
  ctx.scale(1, -1);

  const bounds = Array.from(Array(fractal.matrices.length), () => [0, 0, 0, 0]);

  for (let i = 0; i < fractal.points.length; i++) {
    const [x, y, { matrixNum }] = fractal.points[i];
    const mb = bounds[matrixNum];
    bounds[matrixNum] = [
      Math.max(mb[0], x),
      Math.max(mb[1], y),
      Math.min(mb[2], x),
      Math.min(mb[3], y),
    ];

    ctx.fillStyle = fractal.matrices[matrixNum].color;
    ctx.fillRect(x, y, 1, 1);
  }

  if (!options.showBounds) {
    const main = canvas.parentElement;
    const lOffset = (main.clientWidth - canvas.width) / 2;
    const tOffset = (main.clientHeight - canvas.height) / 2;

    ctx.setLineDash([5, 5]);
    for (let i = 0; i < fractal.matrices.length; i++) {
      ctx.strokeStyle = fractal.matrices[i].color;
      const [maxx, maxy, minx, miny] = bounds[i];
      ctx.strokeRect(minx, miny, maxx - minx, maxy - miny);

      const markerSize = 10;
      const c = maxy - (maxy - miny) / 2;
      const top = tOffset + canvas.height - c - padding - markerSize;
      const left = lOffset + maxx - (maxx - minx) / 2 - offsetX + padding - markerSize;
      explorer.showMarker(top, left, i);
    }
    ctx.setLineDash([]);
  }

  ctx.restore();
});
