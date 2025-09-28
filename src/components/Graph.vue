<!-- 组件 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import DevicePng from '../../public/device.png';
import DeviceErrorPng from '../../public/device_error.png';
import DeviceDefaultPng from '../../public/device_default.png';
import { VisualTopo, Node, Link, ArrowType } from '../../lib/visualTopo';

const svg = ref<SVGSVGElement | null>(null);
let visualTopo: VisualTopo | null = null;

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: number | null = null;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout !== null) clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(context, args), wait);
  };
};

// 定义节点数据
const nodes: Node[] = [
  {
    id: 'node1',
    name: '设备-1',
    x: 100,
    y: 100,
    w: 32,
    h: 32,
    image: DeviceDefaultPng,
    errorImage: DeviceErrorPng
  },
  {
    id: 'node2',
    name: '设备-2',
    x: 300,
    y: 400,
    w: 32,
    h: 32,
    image: DeviceDefaultPng,
    errorImage: DeviceErrorPng
  },
  {
    id: 'node3',
    name: '设备-3',
    x: 100,
    y: 400,
    w: 32,
    h: 32,
    image: DeviceDefaultPng
  }
];

// 定义连线数据
const links: Link[] = [
  {
    id: 'link1-2',
    source: 'node1',
    target: 'node2',
    stroke: '#94a3b8',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    arrowType: ArrowType.SINGLE
  },
  {
    id: 'link1-3',
    source: 'node1',
    target: 'node3',
    stroke: '#f40f40',
    strokeWidth: 2,
    arrowType: ArrowType.DOUBLE
  },
  {
    id: 'link2-3',
    source: 'node2',
    target: 'node3',
    stroke: '#94a3b8',
    strokeWidth: 2,
    arrowType: ArrowType.NONE
  }
];

onMounted(() => {
  if (!svg.value) return;

  // 创建VisualTopo实例
  visualTopo = new VisualTopo(svg.value, {
    width: 800,
    height: 600,
    backgroundColor: '#f5f5f5'
  });

  // 设置数据并渲染
  visualTopo.setNodes(nodes);
  visualTopo.setLinks(links);
  visualTopo.render();

  // 注册节点点击事件
  visualTopo.onNodeClick((node, event) => {
    console.log('节点被点击:', node);
    // 在这里处理节点点击事件
  });

  // 注册线条点击事件
  visualTopo.onLinkClick((link, event) => {
    console.log('线条被点击:', link);
    // 在这里处理线条点击事件
  });

  // 注册节点右键单击事件
  visualTopo.onNodeRightClick((node, event) => {
    console.log('节点被右键单击:', node.id);
    // 这里可以添加自定义的右键菜单逻辑
  });

  // 注册线条右键单击事件
  visualTopo.onLinkRightClick((link, event) => {
    console.log('线条被右键单击:', link.id);
    // 这里可以添加自定义的右键菜单逻辑
  });

  // 在组件中使用拖拽功能 - 添加防抖
  visualTopo.onNodeDrag(debounce((node, x, y) => {
    console.log('节点被拖动:', node.id, '新位置:', x, y);
  }, 100)); // 100毫秒防抖时间，可以根据需要调整

  // 注册节点拖拽完成事件处理器
  visualTopo.onNodeDragEnd((node, finalX, finalY) => {
    console.log(`节点 ${node.id} 拖动完成，最终位置: (${finalX}, ${finalY})`);
    // 在这里可以执行拖动完成后的操作，如保存位置、触发后端更新等
  });
});

// 重置视图的方法，可以绑定到按钮点击事件
function handleResetView() {
  if (visualTopo) {
    visualTopo.resetView()
  }
}

// 获取图数据的方法
function handleGetGraph() {
  if (visualTopo) {
    const graph = visualTopo.getGraph();
    console.log('图数据:', graph);
    // 在这里可以处理图数据，如发送到后端保存等
  }
}



// 清理资源
onUnmounted(() => {
  if (visualTopo) {
    visualTopo.clear();
    visualTopo = null;
  }
});
</script>

<template>
  <div>
    <svg ref="svg"></svg>
    <br />
    <el-button @click="handleResetView">重置视图</el-button>
    <el-button @click="handleGetGraph">获取图数据</el-button>
  </div>
</template>

<style scoped></style>
