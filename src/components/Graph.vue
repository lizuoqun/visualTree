<!-- 组件 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import DevicePng from '../../public/device.png';
import DeviceErrorPng from '../../public/device_error.png';
import DeviceDefaultPng from '../../public/device_default.png';
import { VisualTopo, Node, Link, ArrowType } from './visualTopo';

const svg = ref<SVGSVGElement | null>(null);
let visualTopo: VisualTopo | null = null;


// 定义节点数据
const nodes: Node[] = [
  {
    id: 'node1',
    name: '设备-1',
    x: 300,
    y: 200,
    w: 32,
    h: 32,
    image: DeviceDefaultPng,
    errorImage: DeviceErrorPng
  },
  {
    id: 'node2',
    name: '设备-2',
    x: 600,
    y: 300,
    w: 32,
    h: 32,
    image: DeviceDefaultPng,
    errorImage: DeviceErrorPng
  },
  {
    id: 'node3',
    name: '设备-3',
    x: 1000,
    y: 100,
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

});

// 重置视图的方法，可以绑定到按钮点击事件
function handleResetView() {
  if (visualTopo) {
    visualTopo.resetView()
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
    <el-button @click="handleResetView">重置视图</el-button>
  </div>
</template>

<style scoped></style>
