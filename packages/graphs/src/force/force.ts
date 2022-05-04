import { select } from 'd3';
import { merge } from 'lodash-es';
import { DEFAULT_OPTION } from './config';
import { Controller } from './cores/controller';
import { IForceData, IOption } from './interface';
import { mergeCfg } from './utils';

export class Force {
  controller: Controller;
  constructor(selector: string | HTMLElement, config?: { data?: IForceData; option?: IOption }) {
    this.controller = new Controller(selector, merge(config?.option, DEFAULT_OPTION));
    if (config?.data) this.controller.load(mergeCfg(config?.data));
  }

  data(data: IForceData) {
    this.controller.load(mergeCfg(data));
  }

  getZoom() {
    return this.controller.transform.k;
  }

  setZoom(k: number) {
    this.controller.zoom.scaleTo(select(this.controller.canvas), k);
  }
}
