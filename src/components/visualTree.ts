// type NodeType = []
// type EdgeType = []
//
// class VisualTree {
//   nodes: NodeType[] = [];
//   edges: EdgeType[] = [];
//   svg: Selection;
//
//   constructor(svg, nodes: NodeType[], edges: EdgeType[]) {
//     this.svg = svg;
//     this.nodes = nodes;
//     this.edges = edges;
//   }
//
//   // 绘制线条
//   link = this.svg.append('g')
//     .attr('class', 'links')
//     .selectAll('line')
//     .data(this.edges)
//     .enter().append('line')
//     .attr('stroke-width', 2)
//     .attr('stroke-opacity', 0.4)
//     .attr('stroke', 'grey');
//
//   // 绘制节点
//   node = this.svg.append('g')
//     .attr('class', 'nodes')
//     .selectAll('circle')
//     .data(this.nodes)
//     .enter().append('circle')
//     .attr('r', 12)
//     .attr('fill', '#f40');
// }
//
// export default VisualTree;