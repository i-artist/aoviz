# @aoviz/graphs

简洁，轻量，可配置的图渲染组件

<p align="center">
<img src="https://github.com/i-artist/aoviz/blob/main/packages/graphs/assets/force.png?raw=true" style="max-width:100%;"/>
</p>

[![](https://flat.badgen.net/npm/v/@aoviz/graphs?icon=npm)](https://www.npmjs.com/package/@aoviz/graphs)

### 快速上手

```ts
import { Force } from '@aoviz/graphs';
```

### 以 React 使用为例：

```ts
function Viz() {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const instance = new Force(wrapper.current!);
    instance.data(data);
  }, [wrapper]);
  return <div ref={wrapper} style={{ height: 500 }}></div>;
}
```

### 传入的渲染数据类型：

```ts
interface IData {
  nodes: INode[];
  links: ILink[];
}

interface INode {
  id: string;
  name: string;
}

interface ILink {
  id: string;
  source: string;
  target: string;
  name: string;
  cfg?: ILinkCfg;
}

interface INodeCfg {
  radius: number;
  label: ILabel;
  backgroundColor: string;
}

interface ILinkCfg {
  label: Omit<ILabel, 'borderRadius'>;
  curveOffset: number;
  shape: 'line' | 'arc' | 'self';
  stroke: string;
}
```

### 图组件配置数据类型：

```ts
interface IOption {
  node?: INodeCfg;
  link?: ILinkCfg;
  layout: Partial<ILayoutForceOption>;
}

interface ILayoutForceOption {
  chargeStrength: number; // 电荷力强度，为正模拟重力(吸引力)，为负模拟排斥力
  collideStrength: number; // 节点间碰撞强度，范围 [0,1]
  width: number; // 画布宽度，默认父元素宽度
  height: number; // 画布高度，默认传入父元素高度
  linkDistance: number; // 关系的间距
}
```

### 图组件默认配置：

```ts
const DEFAULT_FONT_STYLE = {
  fontSize: 12,
  fontWeight: 'normal',
  fontFamily: 'sans-serif',
};

export const DEFAULT_OPTION: IOption = {
  node: {
    label: {
      width: 120,
      color: 'rgba(255,255,255,1)',
      ...DEFAULT_FONT_STYLE,
      backgroundColor: 'rgba(0,0,0,.65)',
      borderRadius: 12,
    },
    backgroundColor: '#6EA3FD',
    radius: 28,
  },
  link: {
    label: {
      width: 150,
      color: 'rgba(0,0,0,.65)',
      ...DEFAULT_FONT_STYLE,
      backgroundColor: '#fff',
    },
    stroke: '#9c9b9b',
    shape: 'line',
    curveOffset: 22,
  },
  layout: {
    chargeStrength: -1600,
    collideStrength: 0.5,
    linkDistance: 300,
  },
};
```

### ForceInstance

| 名称         | 说明                                             | 类型                              |
| ------------ | ------------------------------------------------ | --------------------------------- |
| data()       | 设置渲染的数据，调用该方法后自动执行布局重绘操作 | `IForceData`                      |
| getZoom()    | 获取当前缩放比例                                 | `number`                          |
| setZoom()    | 设置缩放比例                                     | `number`                          |
| onNodeClick$ | 获取节点的 Click 事件                            | `Observable<IRenderNode>`         |
| onNodeHover$ | 获取节点的 Hover 事件                            | `Observable<IRenderNode \| null>` |
| onLinkClick$ | 获取关系的 Click 事件                            | `Observable<IRenderLink>`         |
| onLinkHover$ | 获取关系的 Hover 事件                            | `Observable<IRenderLink \| null>` |
| onNodeDrag$  | 获取节点的 Click 事件                            | `Observable<INodeDragEvent>`      |

<br/>

> 事件的监听使用了 Rxjs 。了解更多可以前往 [官方文档](https://rxjs.dev/)

> 拖拽事件暴露的类型如下所示：

```ts
interface INodeDragEvent {
  data: IRenderNode;
  type: 'dragstart' | 'dragging' | 'dragend';
}
```

### 在线体验

[简单渲染](https://codesandbox.io/s/sharp-matsumoto-t9wfsx?file=/src/App.js)

[事件支持](https://codesandbox.io/s/angry-wiles-wlvje6?file=/src/App.js:180-186)

### Roadmap

- [x] 图布局和渲染
- [x] 添加事件支持
- [ ] 支持主题和更多的样式配置
- [ ] 支持插件形式，可以自定义控制渲染内容实现
- [ ] 待定...

### Good Idea

如果你有好的想法欢迎提 [Issues](https://github.com/i-artist/aoviz/issues)

### 与我联系

<img src="https://github.com/i-artist/aoviz/blob/main/packages/graphs/assets/wechat.jpg?raw=true" style="width:200px;height:200px"/>
