import { IFS, IIFSParams, TBounds } from 'fractals';

import { Explorer } from './Explorer';
import { Bounds } from './utils/Bounds';

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

  const bounds: TBounds[] = Array.from(Array(fractal.matrices.length), () => [0, 0, 0, 0]);

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
    const bBox = new Bounds(bounds[i]);
    const markerSize = 10 / 2;
    const yMirror = canvas.height - bBox.height - padding * 2;
    const top = tOffset + padding + yMirror + (offsetY - bBox.minY);
    const left = lOffset - offsetX + padding + bBox.minX;
    const marketTop = top + bBox.cy + markerSize;
    const markerLeft = left + bBox.cx + markerSize;

    explorer.showMarker(i, marketTop, markerLeft, bBox.height, bBox.width);
  }
  ctx.setLineDash([]);

  ctx.restore();
});
