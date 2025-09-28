# VisualTopo

一个基于 D3.js 的拓扑图可视化库，提供灵活的节点和连线渲染、交互和动画效果。

## 功能特性

- 支持自定义节点图片、大小和位置
- 支持节点错误状态闪烁效果
- 支持连线样式（颜色、宽度、虚线）和箭头（无、单向、双向）
- 支持节点和连线点击事件监听
- 自动居中节点并适应画布大小
- 支持视图重置功能
- 支持节点文本标签显示
- 提供完整的 TypeScript 类型支持

## 安装

```bash
npm install visual-topo
```

## 基本用法

### 在 Vue 3 中使用

```vue
<template>
  <div>
    <svg ref="svgRef" width="800" height="600"></svg>
    <button @click="handleResetView">重置视图</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { VisualTopo, Node, Link, ArrowType } from 'visual-topo';

const svgRef = ref<SVGSVGElement | null>(null);
let visualTopo: VisualTopo | null = null;

onMounted(() => {
  if (svgRef.value) {
    // 创建 VisualTopo 实例
    visualTopo = new VisualTopo(svgRef.value, {
      width: 800,
      height: 600,
      backgroundColor: '#f5f5f5'
    });

    // 定义节点数据
    const nodes: Node[] = [
      {
        id: 'node1',
        name: '设备1',
        x: 100,
        y: 100,
        w: 50,
        h: 50,
        image: '/device.png',
        errorImage: '/device_error.png' // 可选，错误状态图片
      },
      {
        id: 'node2',
        name: '设备2',
        x: 200,
        y: 200,
        w: 50,
        h: 50,
        image: '/device.png'
      }
    ];

    // 定义连线数据
    const links: Link[] = [
      {
        id: 'link1',
        source: 'node1',
        target: 'node2',
        stroke: '#94a3b8',
        strokeWidth: 2,
        strokeDasharray: '5,5', // 虚线
        arrowType: ArrowType.SINGLE // 单向箭头
      }
    ];

    // 设置数据
    visualTopo.setNodes(nodes);
    visualTopo.setLinks(links);

    // 注册事件处理器
    visualTopo.onNodeClick((node, event) => {
      console.log('节点被点击:', node);
    });

    visualTopo.onLinkClick((link, event) => {
      console.log('连线被点击:', link);
    });

    // 渲染拓扑图
    visualTopo.render();
  }
});

// 重置视图
const handleResetView = () => {
  visualTopo?.resetView();
};

// 组件卸载时清理资源
onUnmounted(() => {
  visualTopo?.destroy();
});
</script>
```

## API 参考

### 类：VisualTopo

#### 构造函数

```typescript
new VisualTopo(svgElement: SVGSVGElement, config?: VisualTopoConfig)
```
- `svgElement`: SVG 元素实例
- `config`: 配置选项（可选）
  - `width`: 画布宽度，默认 800
  - `height`: 画布高度，默认 600
  - `backgroundColor`: 背景颜色，默认 '#f5f5f5'

#### 方法

##### 设置数据

```typescript
setNodes(nodes: Node[]): void
setLinks(links: Link[]): void
```
- 设置节点和连线数据

##### 渲染

```typescript
render(): void
```
- 渲染拓扑图，包括自动居中节点

##### 视图控制

```typescript
resetView(): void
updateSize(width: number, height: number): void
```
- `resetView`: 重置视图到原始状态
- `updateSize`: 更新画布大小并重新渲染

##### 事件处理

```typescript
onNodeClick(handler: NodeClickHandler): void
onLinkClick(handler: LinkClickHandler): void
removeAllEventHandlers(): void
```
- `onNodeClick`: 注册节点点击事件处理器
- `onLinkClick`: 注册连线点击事件处理器
- `removeAllEventHandlers`: 移除所有事件处理器

##### 清理资源

```typescript
clear(): void
destroy(): void
```
- `clear`: 清空拓扑图内容
- `destroy`: 销毁实例并清理所有资源

### 接口定义

#### Node 接口

```typescript
interface Node {
  id: string;         // 节点唯一ID
  name: string;       // 节点名称（显示的文本）
  x: number;          // 节点X坐标
  y: number;          // 节点Y坐标
  w: number;          // 节点宽度
  h: number;          // 节点高度
  image: string;      // 节点图片路径
  errorImage?: string; // 错误状态图片路径（可选）
}
```

#### Link 接口

```typescript
interface Link {
  id: string;           // 连线唯一ID
  source: string;       // 源节点ID
  target: string;       // 目标节点ID
  stroke?: string;      // 线条颜色，默认 '#94a3b8'
  strokeWidth?: number; // 线条宽度，默认 1
  strokeDasharray?: string; // 虚线模式，如 '5,5'
  arrowType?: ArrowType; // 箭头类型
}
```

#### ArrowType 枚举

```typescript
enum ArrowType {
  NONE = 'none',   // 无箭头
  SINGLE = 'single', // 单向箭头
  DOUBLE = 'double' // 双向箭头
}
```

#### 事件回调类型

```typescript
type NodeClickHandler = (node: Node, event: MouseEvent) => void;
type LinkClickHandler = (link: Link, event: MouseEvent) => void;
```

## 高级特性

### 节点闪烁效果

当节点定义了 `errorImage` 属性时，节点会自动在正常图片和错误图片之间闪烁，闪烁间隔为 500ms。

### 自动居中缩放

库会自动计算所有节点的边界，然后将它们居中显示在画布上，并根据需要进行缩放以确保所有节点都可见且留有适当边距。最大缩放比例为 1，不会放大节点。

### 连线与节点边界连接

连线不是连接到节点中心，而是连接到节点边界，使拓扑图更加美观和专业。

## 浏览器兼容性

支持所有现代浏览器，包括 Chrome、Firefox、Safari 和 Edge。对于 IE11 可能需要额外的 polyfill。

## 依赖

- D3.js (v7 或更高版本)

## License

MIT
        