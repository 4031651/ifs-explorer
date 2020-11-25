import { IIFSMatrix } from 'fractals';

type TPoint = {
  x: number;
  y: number;
};

export type TTransforms = {
  angle: number;
  scale: TPoint;
  skew: number;
  translate: TPoint;
};

export function compose(transforms: TTransforms) {
  const { angle, scale, skew, translate } = transforms;
  // A11 = sx * cos θ
  const a = scale.x * Math.cos(angle);
  // A12 = sy * m * cos θ - sy * sin θ
  const b = scale.y * skew * Math.cos(angle) - scale.y * Math.sin(angle);
  // A21 = sx * sin θ
  const c = scale.x * Math.sin(angle);
  // A22 = sy * m * sin θ + sy cos θ
  const d = scale.y * skew * Math.sin(angle) + scale.y * Math.cos(angle);

  return { a, b, c, d, e: translate.x, f: translate.y };
}

export function decompose(m: IIFSMatrix): TTransforms {
  const { a, b, c, d, e, f } = m;
  let angle = 0;
  let scale = { x: 1, y: 1 };
  let skew = 0;
  const determinant = a * d - c * b;

  if (a || c) {
    const s = Math.sqrt(a * a + c * c);
    angle = c > 0 ? Math.acos(a / s) : -Math.acos(a / s);
    scale = { x: s, y: determinant / s };
    const scaleSkew = b * Math.cos(angle) + d * Math.sin(angle);
    skew = scaleSkew / scale.y;
  } else if (b || d) {
    const s = Math.sqrt(b * b + d * d);
    angle = Math.PI * 0.5 - (d > 0 ? Math.acos(-b / s) : -Math.acos(b / s));
    scale = { x: determinant / s, y: s };
    skew = Math.atan((a * b + c * d) / (s * s));
  } else {
    // a = b = c = d = 0
    scale = { x: 0, y: 0 };
  }

  return {
    angle,
    scale,
    skew,
    translate: { x: e || 0, y: f || 0 },
  };
}
