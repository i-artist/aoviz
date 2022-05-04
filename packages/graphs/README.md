# @aoviz/graphs


### 交互视频

<div>
    <video src="./assets/force.mov" style="width:100%;">
</div>

### 快速上手

```
import { Force } from '@aoviz/graphs';
```

### 以 React 使用为例：

```
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
```
interface IData {
    nodes: INode[];
    links: ILink[];
}

interface INode {
    id: string;
    name: string;
}

export interface ILink {
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



### 在线体验
[在线体验地址](https://codesandbox.io/s/sharp-matsumoto-t9wfsx?file=/src/App.js)


### Roadmap 
- [x] 图布局和渲染
- [ ] 添加事件支持
- [ ] 支持主题和更多的样式配置
- [ ] 支持插件形式，可以自定义控制渲染内容实现
- [ ] 待定...