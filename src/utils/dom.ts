/* eslint-disable import/prefer-default-export */
type TElemProps = {
  style?: Partial<CSSStyleDeclaration>;
  [k: string]: unknown;
};

type TElemChild = HTMLElement | Text;

export function elem(tagName: string, props: TElemProps = {}, ...children: TElemChild[]) {
  const e = document.createElement(tagName);

  for (const [a, v] of Object.entries(props)) {
    if (a === 'style') {
      Object.assign(e.style, v);
      continue;
    }
    if (a.startsWith('on-') && typeof v === 'function') {
      const name = a.substring(3);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.addEventListener(name, v);
      continue;
    }

    e.setAttribute(a, <string>v);
  }

  for (const c of children) {
    e.appendChild(c);
  }

  return e;
}
