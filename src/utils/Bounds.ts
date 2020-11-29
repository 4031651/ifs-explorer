import { TBounds } from 'fractals';

export class Bounds {
  readonly maxX: number;
  readonly maxY: number;
  readonly minX: number;
  readonly minY: number;

  constructor(bounds: TBounds) {
    [this.maxX, this.maxY, this.minX, this.minY] = bounds;
  }

  get width() {
    return this.maxX - this.minX;
  }

  get height() {
    return this.maxY - this.minY;
  }

  get cx() {
    return this.width / 2;
  }

  get cy() {
    return this.height / 2;
  }
}
