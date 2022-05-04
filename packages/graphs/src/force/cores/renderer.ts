import { zoomIdentity, ZoomTransform } from 'd3-zoom';
import { ELinkShape, IPoint, IRenderData } from '../interface';
import { IRenderLink, IRenderNode, IOption, ISafeAny } from '../interface';
import { distance, getCircleCenterByPoints, getCirclePointByArc, getRectPointsByCenterPoint, rotatePoints } from '../utils/math';

export class Renderer {
  context: CanvasRenderingContext2D;
  option: IOption;
  transform = zoomIdentity;
  constructor(context: CanvasRenderingContext2D, option: IOption) {
    this.context = context;
    this.option = option;
  }
  setContext(context: CanvasRenderingContext2D) {
    this.context = context;
  }
  setOption(option: IOption) {
    this.option = option;
  }
  setTransform(transform: ZoomTransform) {
    this.transform = transform;
  }
  draw(data: IRenderData) {
    const { context, option, transform } = this;
    const { width = 0, height = 0 } = option.layout;
    context.save();
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.clearRect(0, 0, width, height);
    context.translate(transform.x, transform.y);
    context.scale(transform.k, transform.k);
    data.links.forEach((link) => {
      this.drawLink(link);
    });
    data.nodes.forEach((node) => {
      this.drawNode(node);
    });
    context.restore();
  }

  drawLink(link: IRenderLink) {
    if (link.cfg.shape === ELinkShape.Line) {
      this.drawLineLink(link);
    }
    if (link.cfg.shape === ELinkShape.Arc) {
      this.drawArcLink(link);
    }
    if(link.cfg.shape === ELinkShape.Self){
      this.drawSelfLink(link);
    }
  }

  drawArcLink(link: IRenderLink) {
    const { context } = this;
    const { cfg } = link;
    const curveOffset = link.cfg.curveOffset * link._offsetMultiple;
    const offset = 2;
    const endPointOffset = 2 + offset;
    const sourceRadiusOffset = link.source.cfg.radius + offset;
    const targetRadiusOffset = link.target.cfg.radius + endPointOffset;
    // 计算中点位置
    const midPoint = {
      x: (link.source.x + link.target.x) / 2,
      y: (link.source.y + link.target.y) / 2,
    };
    const linkAngle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
    // 通过偏移量计算出弧线上的点位置
    const arcPoint = {
      x: curveOffset * Math.cos(-Math.PI / 2 + linkAngle) + midPoint.x,
      y: curveOffset * Math.sin(-Math.PI / 2 + linkAngle) + midPoint.y,
    };
    // 通过三个点坐标求出圆心位置
    const arcCenterPoint = getCircleCenterByPoints(link.source, arcPoint, link.target);
    const arcRadius = distance(link.source.x, link.source.y, arcCenterPoint.x, arcCenterPoint.y);
    // 计算出 source 和 target 的圆心和与弧线相交边的偏移量
    let sAngel = Math.atan2(link.source.y - arcCenterPoint.y, link.source.x - arcCenterPoint.x);
    let tAngle = Math.atan2(link.target.y - arcCenterPoint.y, link.target.x - arcCenterPoint.x);
    sAngel = (sAngel + Math.PI * 2) % (Math.PI * 2);
    tAngle = (tAngle + Math.PI * 2) % (Math.PI * 2);
    if (link._offsetMultiple < 0) {
      if (sAngel < tAngle) {
        sAngel += Math.PI * 2;
      }
    }
    const startAngel = sAngel + (sourceRadiusOffset / arcRadius) * Math.sign(link._offsetMultiple);
    const endAngel = tAngle - (targetRadiusOffset / arcRadius) * Math.sign(link._offsetMultiple);
    let _startAngel = startAngel;
    let _endAngel = endAngel;
    if (link._offsetMultiple < 0 && startAngel > endAngel) {
      _startAngel = endAngel;
      _endAngel = startAngel;
    }
    context.beginPath();
    context.arc(arcCenterPoint.x, arcCenterPoint.y, arcRadius, _startAngel, _endAngel);
    context.strokeStyle = cfg.stroke;
    context.stroke();
    const endPoint = getCirclePointByArc(arcCenterPoint.x, arcCenterPoint.y, arcRadius, endAngel);
    const arrowAngle = Math.atan2(link.target.y - endPoint.y, link.target.x - endPoint.x);
    this.drawLinkLabel(arcPoint, linkAngle, link);
    this.drawLinkArrow(endPoint, arrowAngle, cfg.stroke);
  }

  drawLineLink(link: IRenderLink) {
    const { context } = this;
    const { cfg } = link;
    const offset = 2;
    const endPointOffset = 2 + offset;
    const midPoint = {
      x: (link.source.x + link.target.x) / 2,
      y: (link.source.y + link.target.y) / 2,
    };
    const linkAngle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
    const startPoint = getCirclePointByArc(link.source.x, link.source.y, link.source.cfg.radius + offset, linkAngle);
    const endPoint = getCirclePointByArc(
      link.target.x,
      link.target.y,
      link.target.cfg.radius + endPointOffset,
      linkAngle > 0 ? linkAngle - Math.PI : linkAngle + Math.PI
    );
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    context.closePath();
    context.strokeStyle = cfg.stroke;
    context.stroke();
    this.drawLinkLabel(midPoint, linkAngle, link);
    this.drawLinkArrow(endPoint, linkAngle, cfg.stroke);
  }

  drawSelfLink(link: IRenderLink) {
    const { context } = this;
    const { cfg } = link;
    const offset = 2;
    const angle = Math.atan(8 / link.source.cfg.radius);
    const hypot = link.source.cfg.radius / Math.cos(angle);
    const point1 = getCirclePointByArc(link.source.x, link.source.y, hypot, angle);
    const point2 = getCirclePointByArc(link.source.x, link.source.y, hypot + offset, -angle);
    const controlPoint = getCirclePointByArc(link.source.x, link.source.y, link.source.cfg.radius + 80, 0);
    const labelPoint = getCirclePointByArc(link.source.x, link.source.y, link.source.cfg.radius + 50, 0);
    const arrowAngle = Math.atan2(point2.y - controlPoint.y, point2.x - controlPoint.x);
    context.beginPath();
    context.moveTo(point1.x, point1.y);
    context.quadraticCurveTo(controlPoint.x, controlPoint.y, point2.x, point2.y);
    context.strokeStyle = cfg.stroke;
    context.stroke();
    this.drawLinkArrow(point2, arrowAngle, cfg.stroke);
    this.drawLinkLabel(labelPoint, Math.PI / 2, link);
  }

  drawLinkArrow(point: IPoint, angle: number, color: string) {
    const triangle = (width = 8, length = 12, d = 0) => {
      const begin = d * 2;
      const path = `M ${begin + 2},0 L -${begin + length},-${width / 2} L -${begin + length},${width / 2} Z`;
      return path;
    };
    const { context } = this;
    context.save();
    context.translate(point.x, point.y);
    context.rotate(angle);
    const path = new Path2D(triangle());
    context.fillStyle = color;
    context.fill(path);
    context.restore();
  }

  // 通过坐标变换绘制
  drawLinkLabel(point: IPoint, angle: number, link: IRenderLink) {
    const { context } = this;
    const { cfg } = link;
    context.font = `${cfg.label.fontSize}px ${cfg.label.fontWeight} ${cfg.label.fontFamily}`;
    const text = this.dealText(context, link.name, cfg.label.width);
    const textWidth = context.measureText(text).width + 4;
    this.drawLinkLabelBg(point, textWidth, cfg.label.fontSize, angle);
    context.fillStyle = cfg.label.backgroundColor;
    context.fill();
    // 避免出现字体反转后是反着的情况
    const rotateAngle = angle > -Math.PI / 2 && angle < Math.PI / 2 ? angle : angle > 0 ? angle - Math.PI : angle + Math.PI;
    context.save();
    context.translate(point.x, point.y);
    context.rotate(rotateAngle);
    context.fillStyle = cfg.label.color;
    context.fillText(text, 0, 0, cfg.label.width);
    context.restore();
  }

  drawNode(node: IRenderNode) {
    const { context } = this;
    const { cfg } = node;
    const offset = 10;
    context.beginPath();
    context.arc(node?.x || 0, node?.y || 0, cfg.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = cfg.backgroundColor;
    context.fill();
    context.fillStyle = cfg.label.color;
    this.drawNodeLabel({ x: node.x || 0, y: (node.y || 0) + cfg.radius + offset }, node);
  }

  drawNodeLabel(point: IPoint, node: IRenderNode) {
    const { context } = this;
    const { cfg } = node;
    context.font = `${cfg.label.fontSize}px ${cfg.label.fontWeight} ${cfg.label.fontFamily}`;
    const text = this.dealText(context, node.name, cfg.label.width);
    const textWidth = context.measureText(text).width + 2;
    const bgHight = cfg.label.fontSize + 2;
    const bgWidth = textWidth + bgHight;
    const points = getRectPointsByCenterPoint(point, bgWidth, bgHight);
    this.roundRect(context, points[0].x, points[0].y, bgWidth, bgHight, cfg.label.borderRadius);
    context.fillStyle = cfg.label.backgroundColor;
    context.fill();
    context.fillStyle = cfg.label.color;
    context.fillText(text, point.x, point.y, textWidth);
  }

  /**
   * 绘制关系标签背景
   * @param point 关系中心点坐标
   * @param width 需要绘制的背景宽度
   * @param height 需要绘制的背景高度
   * @param radians
   */
  drawLinkLabelBg(point: IPoint, width: number, height: number, radians: number) {
    const { context } = this;
    const points = getRectPointsByCenterPoint(point, width, height);
    const realPoints = rotatePoints(points, point, radians);
    context.beginPath();
    context.moveTo(realPoints[0].x, realPoints[0].y);
    context.lineTo(realPoints[1].x, realPoints[1].y);
    context.lineTo(realPoints[2].x, realPoints[2].y);
    context.lineTo(realPoints[3].x, realPoints[3].y);
    context.closePath();
  }

  // 文本超出超度显示省略号计算，使用二分法
  dealText(context: CanvasRenderingContext2D, text: string, width: number) {
    if (context.measureText(text).width <= width) return text;
    let left = 0,
      right = text.length;
    while (left <= right) {
      const middle = left + ((right - left) >> 1);
      if (context.measureText(text.slice(0, middle + 1)).width > width) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    }
    return text.slice(0, right + 1) + '...';
  }

  // 绘制带圆角的矩形
  roundRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const min_size = Math.min(w, h);
    let _r = 0;
    if (r > min_size / 2) _r = min_size / 2;
    // 开始绘制
    context.beginPath();
    context.moveTo(x + _r, y);
    context.arcTo(x + w, y, x + w, y + h, _r);
    context.arcTo(x + w, y + h, x, y + h, _r);
    context.arcTo(x, y + h, x, y, _r);
    context.arcTo(x, y, x + w, y, _r);
    context.closePath();
  }
}
