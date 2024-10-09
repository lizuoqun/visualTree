<template>
  <svg style="width: 100%; height: 100vh ; background-color: #000"></svg>
</template>

<script setup>
import * as d3 from 'd3';
import {onMounted, ref} from 'vue';

let simulation = ref(null);
const width = window.innerWidth;
const height = window.innerHeight;
onMounted(() => {

  //创建SVG容器
  const svg = d3.select('svg');

  // 节点和链接数据
  const nodes = [
    {id: 'Node 1'},
    {id: 'Node 2'},
    {id: 'Node 3'}
  ];

  const links = [
    {source: 'Node 1', target: 'Node 2'},
    {source: 'Node 2', target: 'Node 3'}
  ];

// 创建力布局
  simulation.value = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

// 绘制线条
  const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 2)
      .attr('stroke', 'grey');

// 绘制节点
  const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', 'blue')
      .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
// 更新图形位置
  simulation.value.on('tick', () => {
    link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
  });

});

function dragstarted(event) {
  if (!event.active) simulation.value.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event) {
  if (!event.active) simulation.value.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}
</script>

