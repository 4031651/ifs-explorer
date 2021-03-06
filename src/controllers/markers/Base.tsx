import { IIFSMatrix, TBounds } from 'fractals';

import { elem } from '../../utils/dom';
import { TTransforms } from '../../utils/matrix';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeSkewAngle(a: number) {
  const n = a % 360;

  if (n < -180) {
    return n + 360;
  }

  return n > 180 ? 360 - n : n;
}

function normalizeAngle(a: number) {
  const n = a % 360;

  return n < 0 ? n + 360 : n;
}

type TOnChangeCB = (p: IIFSMatrix) => unknown;

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

export abstract class BaseMarker {
  element: HTMLElement;
  private $skew: HTMLElement;
  protected transforms: TTransforms;
  private changeFn: TOnChangeCB;
  private angle = 0;
  private skew = 0;
  private top: number;
  private left: number;
  private tx = 0;
  private ty = 0;
  private markerImg: HTMLImageElement;

  constructor(protected matrix: IIFSMatrix, private readonly density: number) {
    this.transforms = this.decompose();
    this.render();
  }

  destroy() {
    const skew = this.$skew.firstElementChild;
    skew.removeEventListener('dragstart', this.handleDragStart);
    skew.removeEventListener('drag', this.handleSkewDrag);
    skew.removeEventListener('dragend', this.handleDragEnd);

    const rotate = this.$('.r');
    rotate.removeEventListener('dragstart', this.handleDragStart);
    rotate.removeEventListener('drag', this.handleRotationDrag);
    rotate.removeEventListener('dragend', this.handleDragEnd);

    const scaleX = this.$('.scale-x');
    scaleX.removeEventListener('input', this.handleScaleXInput);
    scaleX.removeEventListener('change', this.handleScaleXChange);

    const scaleY = this.$('.scale-y');
    scaleY.removeEventListener('input', this.handleScaleYInput);
    scaleY.removeEventListener('change', this.handleScaleYChange);

    const trans = this.$('.trans');
    trans.removeEventListener('dragstart', this.handleDragTranslateStart);
    trans.removeEventListener('drag', this.handleDragTranslate);
    trans.removeEventListener('dragend', this.handleDragEnd);

    this.element.remove();
  }

  abstract decompose(): TTransforms;
  abstract compose(): Partial<IIFSMatrix>;

  $<T extends HTMLElement = HTMLElement>(selector: string): T {
    return this.element.querySelector(selector);
  }

  show(top: number, left: number, height: number, width: number, matrix: IIFSMatrix) {
    this.matrix = matrix;
    this.transforms = this.decompose();
    this.angle = this.transforms.angle;
    this.skew = this.transforms.skew;
    this.top = top;
    this.left = left;

    const { scale, angle, skew, translate } = this.transforms;

    this.$<HTMLInputElement>('.scale-x').value = String(scale.x);
    this.$<HTMLInputElement>('.scale-y').value = String(scale.y);

    const rotation = angle * RAD_TO_DEG;
    this.element.style.setProperty('--color', this.matrix.color);
    this.element.style.setProperty('--angle', `${rotation}deg`);
    this.element.style.setProperty('--angle-txt', `"${rotation.toFixed(2)}°"`);
    this.element.style.setProperty('--scale-x', `"${scale.x.toFixed(2)}"`);
    this.element.style.setProperty('--scale-y', `"${scale.y.toFixed(2)}"`);
    this.element.style.setProperty('--b-width', `${width}px`);
    this.element.style.setProperty('--b-height', `${height}px`);

    const shear = skew * RAD_TO_DEG;
    this.$skew.style.setProperty('--skew-angle', `${shear}deg`);
    this.$skew.style.setProperty('--skew-angle-txt', `"${shear.toFixed(2)}°"`);

    this.element.style.left = `${this.left}px`;
    this.element.style.top = `${this.top}px`;
    this.element.style.display = 'block';

    this.element.style.setProperty(
      '--trans-text',
      `"(${translate.x.toFixed(2)}, ${translate.y.toFixed(2)})"`,
    );

    if (!this.markerImg) {
      const size =
        parseInt(getComputedStyle(this.element).getPropertyValue('--marker-size'), 10) * 2;

      const canv = document.createElement('canvas');
      canv.width = size;
      canv.height = size;
      const ctx = canv.getContext('2d');
      ctx.fillStyle = matrix.color;
      ctx.fillRect(0, 0, size, size);
      this.markerImg = document.createElement('img');
      this.markerImg.src = canv.toDataURL();
    }
  }

  setVisibility(visible: boolean) {
    if (!visible) {
      this.element.style.display = 'none';
    } else if (this.top && this.left) {
      this.element.style.display = 'block';
    }
  }

  onChange(fn: TOnChangeCB) {
    this.changeFn = fn;
  }

  update() {
    this.changeFn({
      ...this.matrix,
      ...this.compose(),
    });
  }

  handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setDragImage(elem('span'), 0, 0);
  };

  handleDragEnd = () => {
    this.transforms.angle = this.angle;
    this.transforms.skew = this.skew;
    this.transforms.translate.x += this.tx;
    this.transforms.translate.y += this.ty;
    this.update();
  };

  handleRotationDrag = (e: DragEvent) => {
    if (e.pageX + e.pageY === 0) {
      return;
    }
    const a = this.element.getBoundingClientRect();
    let c = Math.atan2(a.y - e.pageY, a.x - e.pageX) * RAD_TO_DEG - 135;
    c = normalizeAngle(c);
    this.angle = c * DEG_TO_RAD;
    this.element.style.setProperty('--angle', `${c}deg`);
    this.element.style.setProperty('--angle-txt', `"${c.toFixed(2)}°"`);
  };

  handleSkewDrag = (e: DragEvent) => {
    if (e.pageX + e.pageY === 0) {
      return;
    }
    const mc = this.element.style.getPropertyValue('--angle');
    const a = this.$skew.getBoundingClientRect();
    let c = Math.atan2(a.bottom - e.pageY, a.left - e.pageX) * RAD_TO_DEG - 100 - parseFloat(mc);
    c = normalizeSkewAngle(c);
    c = clamp(c, -90, 90);

    this.skew = c * DEG_TO_RAD;

    this.$skew.style.setProperty('--skew-angle', `${c}deg`);
    this.$skew.style.setProperty('--skew-angle-txt', `"${c.toFixed(2)}°"`);
  };

  handleDragTranslateStart = (e: DragEvent) => {
    const halfSize = this.markerImg.width / 2;
    e.dataTransfer.setDragImage(this.markerImg, halfSize, halfSize);
  };

  handleDragTranslate = (e: DragEvent) => {
    if (e.pageX + e.pageY === 0) {
      return;
    }

    const a = this.element.getBoundingClientRect();
    const cy = a.top + a.height / 2;
    const cx = a.left + a.width / 2;
    let dx = e.pageX - cx;
    let dy = e.pageY - cy;
    if (e.ctrlKey) {
      if (Math.abs(dx) > Math.abs(dy)) {
        dy = 0;
      } else {
        dx = 0;
      }
    }
    this.tx = dx / this.density;
    this.ty = dy / this.density;

    const { translate } = this.transforms;
    const tx = translate.x + this.tx;
    const ty = translate.y + this.ty;

    this.element.style.setProperty('--trans-text', `"(${tx.toFixed(2)}, ${ty.toFixed(2)})"`);
  };

  handleScaleXInput = (e: InputEvent) => {
    this.element.style.setProperty('--scale-x', `"${(e.target as HTMLInputElement).value}"`);
  };

  handleScaleXChange = (e: InputEvent) => {
    this.transforms.scale.x = +(e.target as HTMLInputElement).value;
    this.update();
  };

  handleScaleYInput = (e: InputEvent) => {
    this.element.style.setProperty('--scale-y', `"${(e.target as HTMLInputElement).value}"`);
  };

  handleScaleYChange = (e: InputEvent) => {
    this.transforms.scale.y = +(e.target as HTMLInputElement).value;
    this.update();
  };

  render() {
    const { scale, angle, skew } = this.transforms;

    this.$skew = (
      <div class="s">
        <div
          draggable
          on-dragstart={this.handleDragStart}
          on-drag={this.handleSkewDrag}
          on-dragend={this.handleDragEnd}
        />
      </div>
    );
    this.element = (
      <div
        class="marker"
        style={{
          display: 'none',
          left: `${this.left}px`,
          top: `${this.top}px`,
        }}
      >
        <div class="bounds" />
        <div class="box">
          <div
            class="r"
            draggable
            on-dragstart={this.handleDragStart}
            on-drag={this.handleRotationDrag}
            on-dragend={this.handleDragEnd}
          />
          {this.$skew}
          <input
            class="scale-x"
            type="range"
            min="-1"
            max="1"
            value={scale.x}
            step="0.01"
            on-input={this.handleScaleXInput}
            on-change={this.handleScaleXChange}
          />
          <input
            class="scale-y"
            type="range"
            min="-1"
            max="1"
            value={scale.y}
            step="0.01"
            on-input={this.handleScaleYInput}
            on-change={this.handleScaleYChange}
          />
          <div
            draggable
            class="trans"
            on-dragstart={this.handleDragTranslateStart}
            on-drag={this.handleDragTranslate}
            on-dragend={this.handleDragEnd}
          />
        </div>
      </div>
    );

    const rotation = angle * RAD_TO_DEG;
    this.element.style.setProperty('--color', this.matrix.color);
    this.element.style.setProperty('--angle', `${rotation}deg`);
    this.element.style.setProperty('--angle-txt', `"${rotation.toFixed(2)}°"`);
    this.element.style.setProperty('--scale-x', `"${scale.x.toFixed(2)}"`);
    this.element.style.setProperty('--scale-y', `"${scale.y.toFixed(2)}"`);
    this.element.style.setProperty('--b-width', '0');
    this.element.style.setProperty('--b-height', '0');

    const shear = skew * RAD_TO_DEG;
    this.$skew.style.setProperty('--skew-angle', `${shear}deg`);
    this.$skew.style.setProperty('--skew-angle-txt', `"${shear.toFixed(2)}°"`);
  }
}
