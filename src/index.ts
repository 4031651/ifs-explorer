import { IFS, IIFSParams } from 'fractals';

import { Explorer } from './Explorer';

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

  const main = canvas.parentElement;
  const lOffset = (main.clientWidth - canvas.width) / 2;
  const tOffset = (main.clientHeight - canvas.height) / 2;

  ctx.setLineDash([5, 5]);
  for (let i = 0; i < fractal.matrices.length; i++) {
    ctx.strokeStyle = fractal.matrices[i].color;
    const [maxx, maxy, minx, miny] = bounds[i];
    ctx.strokeRect(minx, miny, maxx - minx, maxy - miny);

    const markerSize = 10 / 2;
    const yMirror = canvas.height - (maxy - miny) - padding * 2;
    const top = tOffset + padding + yMirror + (offsetY - miny);
    const left = lOffset - offsetX + padding + minx;
    const cx = (maxx - minx) / 2;
    const cy = (maxy - miny) / 2;
    explorer.showMarker(top + cy + markerSize, left + cx + markerSize, i);
  }
  ctx.setLineDash([]);

  ctx.restore();
});
