<template>
  <svg style="width: 100%; height: 100vh ; background-color: #f5f5f5"></svg>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import {onMounted, ref} from 'vue';
import DevicePng from '../../public/device.png';
import DeviceErrorPng from '../../public/device_error.png';
import DeviceDefaultPng from '../../public/device_default.png';
import {ElMessage} from 'element-plus';

let simulation = ref<d3.Simulation<nodeType, linkType>>();
const SVG_WIDTH = window.innerWidth;
const SVG_HEIGHT = window.innerHeight;
const IMAGE_SIZE = Math.floor(window.innerWidth / 50);
const BLACK_COLOR = '#000';
const RED_COLOR = '#f00';

type nodeType = {
  id: string, image: any, label: string, x: number, y: number, error: boolean
}

type linkType = {
  id: number, source: nodeType | string, target: nodeType | string, error: boolean
}

// 节点和链接数据
const nodes: nodeType[] = [];
const links: linkType[] = [];

for (let i = 0; i < 20; i++) {
  const image = i % 2 === 0 ? DevicePng : DeviceDefaultPng;
  const error = i % 2 === 0;
  nodes.push({id: `Node ${i}`, image, label: `Node ${i}`, x: 0, y: 0, error});
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
      .attr('id', 'black_arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', IMAGE_SIZE)
      .attr('refY', 0)
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', BLACK_COLOR);

  svg.append('defs')
      .append('marker')
      .attr('id', 'red_arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', IMAGE_SIZE)
      .attr('refY', 0)
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', RED_COLOR);

  // 绘制线条
  const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 1)
      .attr('stroke-dasharray', d => d.error ? '5,5' : '0,0')
      .attr('stroke', BLACK_COLOR)
      .attr('marker-end', 'url(#black_arrow)')
      // .attr('x1', d => d.source.x)
      // .attr('y1', d => d.source.y)
      // .attr('x2', d => d.target.x)
      // .attr('y2', d => d.target.y)
      .on('mouseover', function (d) {
        d3.select(this).style('cursor', 'pointer');
      })
      .on('mouseout', function (d) {
        d3.select(this).style('cursor', 'default');
      })
      .on('click', (event, d) => {
        console.log(' =====', event);
        ElMessage.success(`点击了线条 ${d.id}`);
      });

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
          .on('end', onDragEnd))
      .on('mouseover', function (d) {
        d3.select(this).style('cursor', 'pointer');
      })
      .on('mouseout', function (d) {
        d3.select(this).style('cursor', 'default');
      })
      .on('click', (event, d) => {
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


  let count = 0;
  setInterval(() => {
    link.attr('stroke', d => d.error && count % 2 === 0 ? RED_COLOR : BLACK_COLOR)
        .attr('marker-end', d => d.error && count % 2 === 0 ? 'url(#red_arrow)' : 'url(#black_arrow)');
    text.attr('fill', d => d.error && count % 2 === 0 ? RED_COLOR : BLACK_COLOR);
    node.attr('xlink:href', d => d.error && count % 2 === 0 ? DeviceErrorPng : d.image);
    count++;
  }, 1500);

  simulation.value.on('tick', () => {
    link
        .attr('x1', (d) => {
          const r = d.source as nodeType;
          return r.x;
        })
        .attr('y1', (d) => {
          const r = d.source as nodeType;
          return r.y;
        })
        .attr('x2', (d) => {
          const r = d.target as nodeType;
          return r.x;
        })
        .attr('y2', (d) => {
          const r = d.target as nodeType;
          return r.y;
        });

    node.attr('x', (d) => d.x - IMAGE_SIZE / 2).attr('y', (d) => d.y - IMAGE_SIZE / 2);
    text.attr('x', (d) => d.x - IMAGE_SIZE / 2).attr('y', (d) => d.y + IMAGE_SIZE);
  });
});


type eventType = {
  subject: { fx: number | null, fy: number | null, x: number, y: number },
  x: number,
  y: number,
  active: boolean
}

function onDragStarted(event: eventType) {
  if (!event.active) simulation.value?.alphaTarget(0.8).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function onDrag(event: eventType) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function onDragEnd(event: eventType) {
  if (!event.active) simulation.value?.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

</script>

