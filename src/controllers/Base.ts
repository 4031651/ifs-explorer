import * as dat from 'dat.gui';
import { IIFSMatrix } from 'fractals';
import { AffineMarker } from './markers/Affine';

// eslint-disable-next-line import/prefer-default-export
export abstract class Matrix {
  folder: dat.GUI;
  remover: HTMLAnchorElement;
  Probability = 0;
  color: string;
  marker: AffineMarker;

  private changeFn: () => unknown;
  private removeFn: () => unknown;

  protected constructor(
    protected readonly name: string,
    public matrix: IIFSMatrix,
    markerRoot: HTMLElement,
  ) {
    this.Probability = matrix.p;
    this.color = String(matrix.color);
    this.createMarker();
    this.marker.onChange((m) => this.set(m));
    markerRoot.appendChild(this.marker.element);
  }

  abstract toMatrix(): IIFSMatrix;
  abstract addControllers(gui: dat.GUI): void;
  abstract createMarker(): void;
  abstract set(m: IIFSMatrix): void;

  private removeHandler = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    this.removeFn?.();
    this.marker.destroy();
  };

  handleChange = () => {
    this.changeFn?.();
  };

  onChange(fn: () => unknown) {
    this.changeFn = fn;
  }

  onRemove(fn: () => unknown) {
    this.removeFn = fn;
  }

  addFolder(gui: dat.GUI) {
    this.folder = gui.addFolder(this.name);

    this.remover = <HTMLAnchorElement>document.createElement('A');
    this.remover.href = '#';
    this.remover.innerText = '🗑';
    this.remover.classList.add('rm-matrix');
    // eslint-disable-next-line no-underscore-dangle
    this.folder.__ul.firstElementChild.appendChild(this.remover);
    // eslint-disable-next-line no-underscore-dangle
    (<HTMLLIElement>this.folder.__ul.firstElementChild).style.color = this.color;
    this.folder.unbind = () => {
      this.remover.removeEventListener('click', this.removeHandler);
    };

    this.remover.addEventListener('click', this.removeHandler);
  }

  showMarker(top: number, left: number) {
    this.marker.show(top, left, this.toMatrix());
  }
}
