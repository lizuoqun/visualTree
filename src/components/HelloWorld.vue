<template>
  <svg style="width: 100%; height: 100vh ; background-color: #f5f5f5"></svg>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import {onMounted, ref} from 'vue';
import VueSvg from '../../public/vue.svg';
import viteSvg from '../../public/vite.svg';
import {ElMessage} from 'element-plus';

let simulation = ref(null);
const SVG_WIDTH = window.innerWidth;
const SVG_HEIGHT = window.innerHeight;
const IMAGE_SIZE = Math.floor(window.innerWidth / 50);
const BLACK_COLOR = '#000';

type nodeType = {
  id: string, image: any, label: string, x: number, y: number
}

type linkType = {
  id: number, source: string, target: string, error: boolean
}

// 节点和链接数据
const nodes: nodeType[] = [];
const links: linkType[] = [];

for (let i = 0; i < 20; i++) {
  const image = i % 2 === 0 ? VueSvg : viteSvg;
  const error = i % 2 === 0;
  nodes.push({id: `Node ${i}`, image, label: `Node ${i}`, x: 0, y: 0});
  if (i < 19) {
    links.push({id: i, source: `Node ${i}`, target: `Node ${i + 1}`, error});
    if (i > 2) {
      links.push({id: i + 100, source: `Node ${i + 1}`, target: `Node ${i - 1}`, error});
    }
  }
}


onMounted(() => {
  //创建SVG容器
  const svg = d3.select('svg');
  simulation.value = d3
      .forceSimulation(nodes)
      .force(
          'link',
          d3.forceLink(links).id((d) => d.id).distance(100)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(SVG_WIDTH / 2, SVG_HEIGHT / 2));


  // 创建一个SVG标记来表示箭头
  svg.append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', IMAGE_SIZE / 2 + 5)
      .attr('refY', 0)
      .attr('markerWidth', 2)
      .attr('markerHeight', 2)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', BLACK_COLOR);

  // 绘制线条
  const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 4)
      .attr('stroke-opacity', 0.4)
      .attr('stroke', BLACK_COLOR)
      .attr('marker-end', 'url(#arrow)')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);


  let count = 0;
  setInterval(() => {
    link.attr('stroke', d => d.error && count % 2 === 0 ? 'red' : BLACK_COLOR);
    count++;
  }, 1500);

  // 绘制节点
  const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('image')
      .data(nodes)
      .enter().append('image')
      .attr('xlink:href', d => d.image) // 替换为你的图像URL或数据URI
      .attr('width', IMAGE_SIZE)
      .attr('height', IMAGE_SIZE)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .call(d3.drag()
          .on('start', onDragStarted)
          .on('drag', onDrag)
          .on('end', onDragEnd));

  node.on('click', (event, d) => {
    console.log(' =====', event);
    ElMessage.success(`点击了节点 ${d.label}`);
  });

  // 添加文字
  const text = svg
      .append('g')
      .attr('fill', BLACK_COLOR)
      .attr('font-size', `${IMAGE_SIZE / 3}px`)
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label);


  simulation.value.on('tick', () => {
    link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

    node.attr('x', (d) => d.x - IMAGE_SIZE / 2).attr('y', (d) => d.y - IMAGE_SIZE / 2);
    text.attr('x', (d) => d.x - IMAGE_SIZE / 2).attr('y', (d) => d.y + IMAGE_SIZE);
  });
});


type eventType = { subject: { fx: number | null, fy: number | null, x: number, y: number }, x: number, y: number, active: boolean }

function onDragStarted(event: eventType) {
  if (!event.active) simulation.value.alphaTarget(0.8).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function onDrag(event: eventType) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function onDragEnd(event: eventType) {
  if (!event.active) simulation.value.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

</script>

