import { IPoint } from '../../interface';

export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 判断两个点是否重合，点坐标的格式为 [x, y]
 */
export function isSamePoint(point1: [number, number], point2: [number, number]) {
  return point1[0] === point2[0] && point1[1] === point2[1];
}

/**
 * 点到圆的距离
 * @param {number} x 圆心 x
 * @param {number} y 圆心 y
 * @param {number} r 半径
 * @param {number} x0  指定的点 x
 * @param {number} y0  指定的点 y
 * @return {number} 距离
 */
export function pointDistance(x: number, y: number, r: number, x0: number, y0: number) {
  return Math.abs(distance(x, y, x0, y0) - r);
}

export function isInsideCircle(x: number, y: number, r: number, x0: number, y0: number) {
  return distance(x, y, x0, y0) - r <= 0;
}

export function getCircleCenterByPoints(p1: IPoint, p2: IPoint, p3: IPoint): IPoint {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;
  const c = p1.x - p3.x;
  const d = p1.y - p3.y;
  const e = (p1.x * p1.x - p2.x * p2.x - p2.y * p2.y + p1.y * p1.y) / 2;
  const f = (p1.x * p1.x - p3.x * p3.x - p3.y * p3.y + p1.y * p1.y) / 2;
  const denominator = b * c - a * d;
  return {
    x: -(d * e - b * f) / denominator,
    y: -(a * f - c * e) / denominator,
  };
}
/**
 * 通过弧度值，获取该弧度点所处的坐标
 * @param {number} x 圆心 x
 * @param {number} y 圆心 y
 * @param {number} r 半径
 * @param {number} a 弧度
 * @returns
 */
export function getCirclePointByArc(x: number, y: number, r: number, a: number) {
  return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r };
}

/**
 * Rotate a 2D vector
 * @param {IPoint} a The vec2 point to rotate
 * @param {IPoint} b The origin of the rotation
 * @param {number} radians The angle of rotation in radians
 * @returns {IPoint}
 */
export function rotate(point: IPoint, origin: IPoint, radians: number): IPoint {
  //Translate point to the origin
  const p0 = point.x - origin.x,
    p1 = point.y - origin.y,
    sinC = Math.sin(radians),
    cosC = Math.cos(radians);
  //perform rotation and translate to correct position
  const x = p0 * cosC - p1 * sinC + origin.x;
  const y = p0 * sinC + p1 * cosC + origin.y;
  return { x, y };
}

// 通过中心点获取矩形的四个点坐标 [leftTop,rightTop,rightBottom,leftBottom]
export function getRectPointsByCenterPoint(point: IPoint, width: number, height: number) {
  return [
    { x: point.x - width / 2, y: point.y - height / 2 },
    { x: point.x + width / 2, y: point.y - height / 2 },
    { x: point.x + width / 2, y: point.y + height / 2 },
    { x: point.x - width / 2, y: point.y + height / 2 },
  ];
}

// 旋转一组坐标点
export function rotatePoints(points: IPoint[], origin: IPoint, radians: number) {
  return points?.map((point) => rotate(point, origin, radians));
}
