import * as dat from 'dat.gui';
import { IIFSMatrix } from 'fractals';

// eslint-disable-next-line import/prefer-default-export
export abstract class Matrix {
  folder: dat.GUI;
  remover: HTMLAnchorElement;
  Probability = 0;
  color: string;

  private changeFn: () => unknown;
  private removeFn: () => unknown;

  protected constructor(protected readonly name: string, m: IIFSMatrix) {
    this.Probability = m.p;
    this.color = m.color;
  }
  abstract toMatrix(): IIFSMatrix;
  abstract addControllers(gui: dat.GUI): void;

  private removeHandler = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    this.removeFn?.();
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
    this.folder.__ul.firstElementChild.appendChild(this.remover);
    this.folder.__ul.firstElementChild.style.color = this.color;
    this.folder.unbind = () => {
      this.remover.removeEventListener('click', this.removeHandler);
    };

    this.remover.addEventListener('click', this.removeHandler);
  }
}
