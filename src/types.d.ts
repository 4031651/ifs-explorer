declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare namespace dat {
  export interface GUI {
    __ul: HTMLUListElement;
    unbind(): void;
  }
}
