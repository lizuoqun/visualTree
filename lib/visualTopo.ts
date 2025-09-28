import * as d3 from 'd3';
import { createLogger } from 'vite';

// 定义节点类型接口
export interface Node {
    id: string;
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    image: string; // 存储图片路径
    errorImage?: string; // 错误状态图片路径（可选）
    originalX?: number; // 原始X坐标（内部使用）
    originalY?: number; // 原始Y坐标（内部使用）
    originalH?: number; // 原始高度（内部使用）
}

// 定义箭头类型枚举
export enum ArrowType {
    NONE = 'none',
    SINGLE = 'single',
    DOUBLE = 'double'
}

// 定义线类型接口
export interface Link {
    id: string;
    source: string; // 源节点id
    target: string; // 目标节点id
    stroke?: string; // 线条颜色
    strokeWidth?: number; // 线条宽度
    strokeDasharray?: string; // 虚线模式，如"5,5"
    arrowType?: ArrowType; // 箭头类型，可选值为：无、单向、双向
}

// 定义配置项接口
export interface VisualTopoConfig {
    width?: number;
    height?: number;
    backgroundColor?: string;
}

// 定义事件回调类型
export type NodeClickHandler = (node: Node, event: MouseEvent) => void;
export type LinkClickHandler = (link: Link, event: MouseEvent) => void;
export type NodeDragHandler = (node: Node, x: number, y: number) => void;
export type NodeDragEndHandler = (node: Node, finalX: number, finalY: number) => void;
// 在文件开头的类型定义部分添加新的右键单击事件回调类型
export type NodeRightClickHandler = (node: Node, event: MouseEvent) => void;
export type LinkRightClickHandler = (link: Link, event: MouseEvent) => void;

let svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined>;

export class VisualTopo {
    private svgElement: SVGSVGElement;
    private width: number;
    private height: number;
    private backgroundColor: string;
    private nodes: Node[] = [];
    private links: Link[] = [];
    private nodeById: Map<string, Node>;
    private nodeClickHandlers: NodeClickHandler[] = [];
    private linkClickHandlers: LinkClickHandler[] = [];
    private nodeRightClickHandlers: NodeRightClickHandler[] = []; // 新增节点右键单击事件处理器数组
    private linkRightClickHandlers: LinkRightClickHandler[] = []; // 新增线条右键单击事件处理器数组
    private nodeDragHandlers: NodeDragHandler[] = [];
    private nodeDragEndHandlers: NodeDragEndHandler[] = [];
    private blinkTimers: Map<string, number> = new Map();
    private isDragging: boolean = false;

    constructor(svgElement: SVGSVGElement, config: VisualTopoConfig = {}) {
        this.svgElement = svgElement;
        this.width = config.width || 800;
        this.height = config.height || 600;
        this.backgroundColor = config.backgroundColor || '#f5f5f5';
        this.nodeById = new Map();

        // 初始化SVG
        this.initSVG();
    }

    // 初始化SVG
    private initSVG(): void {
        svgSelection = d3.select(this.svgElement)
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background-color', this.backgroundColor);
    }

    // 设置节点数据
    setNodes(nodes: Node[]): void {
        this.nodes = nodes;
        this.nodeById = new Map(nodes.map(node => [node.id, node]));
    }

    // 设置连线数据
    setLinks(links: Link[]): void {
        this.links = links;
    }

    // 渲染拓扑图
    // 在VisualTopo类中添加以下方法

    // 使节点图居中
    centerNodes(): void {
        if (this.nodes.length === 0) return;

        // 计算所有节点的边界框
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        this.nodes.forEach(node => {
            minX = Math.min(minX, node.x - node.h);
            minY = Math.min(minY, node.y - node.h);
            maxX = Math.max(maxX, node.x + node.h);
            maxY = Math.max(maxY, node.y + node.h);
        });

        // 计算边界框的中心点
        const nodesCenterX = (minX + maxX) / 2;
        const nodesCenterY = (minY + maxY) / 2;

        // 计算SVG的中心点
        const svgCenterX = this.width / 2;
        const svgCenterY = this.height / 2;

        // 计算偏移量
        const offsetX = svgCenterX - nodesCenterX;
        const offsetY = svgCenterY - nodesCenterY;

        // 计算边界框的尺寸
        const bboxWidth = maxX - minX;
        const bboxHeight = maxY - minY;

        // 计算缩放比例，留出10%的边距
        const scaleX = (this.width * 0.9) / bboxWidth;
        const scaleY = (this.height * 0.9) / bboxHeight;
        const scale = Math.min(scaleX, scaleY, 1); // 最大缩放比例不超过1

        // 调整所有节点的位置和大小
        this.nodes.forEach(node => {
            // 先应用偏移，再应用缩放
            const newX = (node.x + offsetX - svgCenterX) * scale + svgCenterX;
            const newY = (node.y + offsetY - svgCenterY) * scale + svgCenterY;

            // 保存原始位置（如果需要恢复）
            if (!node.originalX) {
                node.originalX = node.x;
                node.originalY = node.y;
                node.originalH = node.h;
            }

            // 更新节点位置和大小
            node.x = newX;
            node.y = newY;
            node.h = node.h * scale; // 缩放节点大小
            node.w = node.w * scale; // 缩放节点宽度
        });
    }

    // 添加一个方法来恢复原始尺寸和位置
    resetView(): void {
        this.nodes.forEach(node => {
            if (node.originalX !== undefined) {
                node.x = node.originalX;
                node.y = node.originalY || node.y;
                node.h = node.originalH || node.h;
                node.w = node.originalH || node.w;
                // 清除原始位置标记
                delete (node as any).originalX;
                delete (node as any).originalY;
                delete (node as any).originalH;
            }
        });
        this.render();
    }

    // 修改render方法，在渲染前调用centerNodes
    render(): void {
        // 清除现有内容
        svgSelection.selectAll('*').remove();

        // 使节点图居中
        this.centerNodes();

        // 首先绘制线（线应该在节点下方）
        this.renderLinks();

        // 然后绘制节点
        this.renderNodes();

        // 最后绘制文本标签
        this.renderLabels();
    }

    // 渲染连线
    private renderLinks(): void {
        // 清除之前可能存在的defs，避免重复创建
        svgSelection.select('defs').remove();

        // 创建箭头标记定义
        const defs = svgSelection.append('defs');

        // 定义单向箭头标记 - 不设置固定颜色
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', '8')
            .attr('refY', '5')
            .attr('markerWidth', '6')
            .attr('markerHeight', '6')
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z');
        // 移除固定颜色设置，颜色将通过CSS继承或动态设置

        // 定义反向箭头标记（用于双向箭头） - 不设置固定颜色
        defs.append('marker')
            .attr('id', 'reverseArrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', '0')
            .attr('refY', '0')
            .attr('markerWidth', '6')
            .attr('markerHeight', '6')
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z');
        // 移除固定颜色设置，颜色将通过CSS继承或动态设置

        // 使用g元素对每个链接及其箭头进行分组，确保它们使用相同的颜色
        const linkGroups = svgSelection.selectAll('g.link-group')
            .data(this.links)
            .enter()
            .append('g')
            .attr('class', 'link-group')
            .style('cursor', 'pointer');

        // 为每个链接组添加路径元素
        linkGroups.append('path')
            .attr('class', 'link')
            .attr('d', d => {
                const sourceNode = this.nodeById.get(d.source);
                const targetNode = this.nodeById.get(d.target);
                if (!sourceNode || !targetNode) return '';

                // 计算线条与源节点边界的交点
                const sourceIntersection = this.calculateIntersection(sourceNode, targetNode);
                // 计算线条与目标节点边界的交点
                const targetIntersection = this.calculateIntersection(targetNode, sourceNode);

                // 返回连接两个节点边界的路径
                return `M ${sourceIntersection.x} ${sourceIntersection.y} L ${targetIntersection.x} ${targetIntersection.y}`;
            })
            .attr('fill', 'none')
            .attr('stroke', d => d.stroke || '#94a3b8')
            .attr('stroke-width', d => d.strokeWidth || 1)
            .attr('stroke-dasharray', d => d.strokeDasharray || '')
            .attr('marker-end', d => d.arrowType === ArrowType.SINGLE || d.arrowType === ArrowType.DOUBLE ? 'url(#arrowhead)' : '')
            .attr('marker-start', d => d.arrowType === ArrowType.DOUBLE ? 'url(#reverseArrowhead)' : '');

        // 为每个链接组添加点击事件
        linkGroups.on('click', (event, d) => {
            // 触发所有注册的线条点击事件处理器
            this.linkClickHandlers.forEach(handler => handler(d, event));
            // 阻止事件冒泡到SVG或其他元素
            event.stopPropagation();
        })
            // 新增右键单击事件监听器
            .on('contextmenu', (event, d) => {
                event.preventDefault(); // 阻止默认的右键菜单
                // 触发所有注册的线条右键点击事件处理器
                this.linkRightClickHandlers.forEach(handler => handler(d, event));
                // 阻止事件冒泡到SVG或其他元素
                event.stopPropagation();
            });
        ;

        // 设置箭头颜色与线条颜色保持一致
        // 我们需要在路径元素创建后设置marker的颜色
        svgSelection.selectAll('g.link-group').each(function (this: d3.BaseType, datum: unknown) {
            const l = datum as Link;
            const color = l.stroke || '#94a3b8';
            const linkGroup = d3.select(this);

            // 获取路径元素
            const path = linkGroup.select('path.link');

            if (l.arrowType === ArrowType.SINGLE || l.arrowType === ArrowType.DOUBLE) {
                // 创建临时标记，使用当前线条的颜色
                const markerId = 'arrowhead-' + l.id;
                const reverseMarkerId = 'reverseArrowhead-' + l.id;

                // 检查是否已存在该ID的标记
                if (!defs.select('#' + markerId).empty()) {
                    defs.select('#' + markerId).remove();
                }
                if (!defs.select('#' + reverseMarkerId).empty()) {
                    defs.select('#' + reverseMarkerId).remove();
                }

                // 创建特定颜色的箭头标记
                defs.append('marker')
                    .attr('id', markerId)
                    .attr('viewBox', '0 0 10 10')
                    .attr('refX', '8')
                    .attr('refY', '5')
                    .attr('markerWidth', '6')
                    .attr('markerHeight', '6')
                    .attr('orient', 'auto')
                    .append('path')
                    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                    .attr('fill', color);

                // 设置路径的marker-end属性为新创建的标记
                path.attr('marker-end', 'url(#' + markerId + ')');

                // 如果是双向箭头，创建反向箭头标记
                if (l.arrowType === ArrowType.DOUBLE) {
                    defs.append('marker')
                        .attr('id', reverseMarkerId)
                        .attr('viewBox', '0 0 10 10')
                        .attr('refX', '2')
                        .attr('refY', '5')
                        .attr('markerWidth', '6')
                        .attr('markerHeight', '6')
                        .attr('orient', 'auto-start-reverse')
                        .append('path')
                        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                        .attr('fill', color);

                    // 设置路径的marker-start属性为新创建的反向标记
                    path.attr('marker-start', 'url(#' + reverseMarkerId + ')');
                }
            }
        });
    }

    // 计算从一个节点到另一个节点的连线与第一个节点边界的交点
    private calculateIntersection(node: Node, targetNode: Node): { x: number; y: number } {
        // 计算两个节点中心之间的向量
        const dx = targetNode.x - node.x;
        const dy = targetNode.y - node.y;

        // 如果两个节点重合，直接返回节点中心
        if (dx === 0 && dy === 0) {
            return { x: node.x, y: node.y };
        }

        // 计算向量的长度
        const length = Math.sqrt(dx * dx + dy * dy);

        // 归一化向量
        const nx = dx / length;
        const ny = dy / length;

        // 计算交点 - 对于矩形图片，我们需要考虑矩形的宽度和高度
        // 这里假设图片是正方形的，实际应用中可能需要根据节点的宽高比调整
        const radius = Math.max(node.w, node.h);

        return {
            x: node.x + nx * radius,
            y: node.y + ny * radius
        };
    }

    // 渲染节点
    // 在renderNodes方法中添加节点右键点击事件监听器
    private renderNodes(): void {
        // 清除之前的闪烁定时器
        this.clearAllBlinkTimers();

        // 保存当前this上下文，以便在回调中使用
        const self = this;

        const images = svgSelection.selectAll('image')
            .data(this.nodes, d => (d as Node).id)
            .enter()
            .append('image')
            // 设置图片位置和大小
            .attr('x', d => d.x - d.h)
            .attr('y', d => d.y - d.h)
            .attr('width', d => d.h * 2)
            .attr('height', d => d.h * 2)
            .attr('href', d => d.image)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                // 如果正在拖动，则不触发点击事件
                if (this.isDragging) {
                    this.isDragging = false;
                    return;
                }
                // 触发所有注册的节点点击事件处理器
                this.nodeClickHandlers.forEach(handler => handler(d, event));
            })
            // 新增右键单击事件监听器
            .on('contextmenu', (event, d) => {
                event.preventDefault(); // 阻止默认的右键菜单
                // 如果正在拖动，则不触发右键点击事件
                if (this.isDragging) {
                    this.isDragging = false;
                    return;
                }
                // 触发所有注册的节点右键点击事件处理器
                this.nodeRightClickHandlers.forEach(handler => handler(d, event));
            })
            // 为每个节点绑定数据，便于后续闪烁操作
            .datum(function (d) {
                return d;
            })
            .each(function (d) {
                // 如果节点有errorImage属性，启动闪烁效果
                if (d.errorImage) {
                    const imageElement = this as SVGImageElement;
                    let isErrorImage = false;

                    // 创建闪烁定时器
                    const timerId = window.setInterval(() => {
                        isErrorImage = !isErrorImage;
                        imageElement.setAttribute('href', isErrorImage ? d.errorImage! : d.image);
                    }, 500); // 每500毫秒切换一次图片

                    // 保存定时器ID，以便后续清除
                    self.blinkTimers.set(d.id, timerId);
                }
            });

        // 添加拖拽功能
        const drag = d3.drag<SVGImageElement, Node>() // 修正类型为SVGImageElement
            .on('start', (event, d) => {
                self.isDragging = true;
                // 提升被拖动节点的z-index
                d3.select(event.currentTarget).raise();
            })
            .on('drag', (event, d) => {
                // 更新节点位置数据
                d.x = event.x;
                d.y = event.y;

                // 更新节点图标位置
                svgSelection.selectAll('image')
                    .filter((t: any) => t.id === d.id)
                    .attr('x', d.x - d.w)
                    .attr('y', d.y - d.h);

                // 更新节点标签位置
                svgSelection.selectAll('text')
                    .filter((t: any) => t.id === d.id)
                    .attr('x', d.x)
                    .attr('y', d.y + d.h + 20);

                // 更新相关连线
                self.updateLinks(d.id);

                // 触发拖拽事件处理器
                self.nodeDragHandlers.forEach(handler => handler(d, d.x, d.y));
            })
            .on('end', (event, d) => {
                self.isDragging = false;
                // 触发拖拽完成事件处理器
                self.nodeDragEndHandlers.forEach(handler => handler(d, d.x, d.y));
            });

        // 应用拖拽功能到节点
        images.call(drag); // 移除不必要的类型断言
    }

    // 更新与指定节点相关的连线
    private updateLinks(nodeId: string): void {
        const self = this; // 关键修复：在方法内定义self变量保存当前实例引用
        svgSelection.selectAll('g.link-group').each(function (this: d3.BaseType, datum: unknown) {
            const link = datum as Link;
            if (link.source === nodeId || link.target === nodeId) {
                const sourceNode = self.nodeById.get(link.source);
                const targetNode = self.nodeById.get(link.target);
                if (sourceNode && targetNode) {
                    const sourceIntersection = self.calculateIntersection(sourceNode, targetNode);
                    const targetIntersection = self.calculateIntersection(targetNode, sourceNode);

                    d3.select(this).select('path.link')
                        .attr('d', `M ${sourceIntersection.x} ${sourceIntersection.y} L ${targetIntersection.x} ${targetIntersection.y}`);
                }
            }
        });
    }

    // 渲染文本标签
    private renderLabels(): void {
        svgSelection.selectAll('text')
            .data(this.nodes, d => (d as Node).id)
            .enter()
            .append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y + d.h + 20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#333')
            .attr('font-size', d => Math.min(14, d.h / 2) + 'px')
            .text(d => d.name);
    }

    // 更新拓扑图尺寸
    updateSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        svgSelection.attr('width', width).attr('height', height);
        this.render(); // 重新渲染
    }

    // 清除所有闪烁定时器
    private clearAllBlinkTimers(): void {
        this.blinkTimers.forEach((timerId, nodeId) => {
            clearInterval(timerId);
        });
        this.blinkTimers.clear();
    }

    // 清空拓扑图
    clear(): void {
        this.nodes = [];
        this.links = [];
        this.nodeById.clear();
        this.clearAllBlinkTimers(); // 清除所有闪烁定时器
        svgSelection.selectAll('*').remove();
    }

    // 析构函数，确保定时器被清除
    destroy(): void {
        this.clearAllBlinkTimers();
        this.removeAllEventHandlers();
        this.clear();
    }

    getGraph() {
        return {
            nodes: this.nodes,
            links: this.links
        }
    }

    // 注册节点点击事件处理器
    onNodeClick(handler: NodeClickHandler): void {
        this.nodeClickHandlers.push(handler);
    }

    // 注册线条点击事件处理器
    onLinkClick(handler: LinkClickHandler): void {
        this.linkClickHandlers.push(handler);
    }

    // 注册节点拖拽事件处理器
    onNodeDrag(handler: NodeDragHandler): void {
        this.nodeDragHandlers.push(handler);
    }

    // 注册节点拖拽完成事件处理器 - 新增方法
    onNodeDragEnd(handler: NodeDragEndHandler): void {
        this.nodeDragEndHandlers.push(handler);
    }

    // 注册节点右键点击事件处理器
    onNodeRightClick(handler: NodeRightClickHandler): void {
        this.nodeRightClickHandlers.push(handler);
    }

    // 注册线条右键点击事件处理器
    onLinkRightClick(handler: LinkRightClickHandler): void {
        this.linkRightClickHandlers.push(handler);
    }

    // 修改removeAllEventHandlers方法，添加清除拖拽事件处理器
    removeAllEventHandlers(): void {
        this.nodeClickHandlers = [];
        this.linkClickHandlers = [];
        this.nodeRightClickHandlers = [];
        this.linkRightClickHandlers = [];
        this.nodeDragHandlers = [];
        this.nodeDragEndHandlers = [];
    }
}
