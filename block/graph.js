export default class Graph {
  /**
   * 画布 Context
   * @type {CanvasRenderingContext2D}
   */
  ctx;

  /**
   * 画布尺寸
   * @type {{w: Number, h: Number}}
   */
  size;

  /**
   * 相邻交点之间的距离
   */
  unit = 18;

  /**
   * 最大的 x 的坐标值
   * @constant
   * @type {Number}
   */
  maxX;
  /**
   * 最大的 y 的坐标值
   * @constant
   * @type {Number}
   */
  maxY;

  /**
   * 当前图形
   * @type {Array<Array<Number>>}
   */
  graph;

  /** @constructor */
  constructor(ctx) {
    this.ctx = ctx;

    this.init();
    this.draw();
  }

  init() {
    this.size = {
      w: this.ctx.canvas.width,
      h: this.ctx.canvas.height,
    };

    this.maxX = this.pxToCoord(this.size.w);
    this.maxY = this.pxToCoord(this.size.h);

    this.graph = this.createGraph();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.#drawGraph();
  }

  /**
   * 创建图形
   * @param {Number} graphType 7种类型
   * 1. 方形  2. 直线型  3. 左拐  4. 右拐  5. 凸形  6. 左 L  7. 右 L
   */
  createGraph(type) {
    let graphType = type || Math.floor(Math.random() * 6 + 1);
    let graph;

    // 创建基础图形
    switch (graphType) {
      case 1:
        graph = [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
        ];
        break;
      case 2:
        graph = [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ];
        break;
      case 3:
        graph = [
          [0, 0],
          [-1, 0],
          [0, 1],
          [1, 1],
        ];
        break;
      case 4:
        graph = [
          [0, 0],
          [1, 0],
          [0, -1],
          [-1, -1],
        ];
        break;
      case 5:
        graph = [
          [0, 0],
          [-1, 0],
          [1, 0],
          [0, 1],
        ];
        break;
      case 6:
        graph = [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
        ];
        break;
      case 7:
        graph = [
          [0, 0],
          [0, 1],
          [-1, 0],
          [-2, 0],
        ];
        break;
      default:
        break;
    }

    // 随机旋转
    return this.rotateGraph(graph, Math.floor(Math.random() * 4));
  }

  // 校验一个 coord 坐标是否合法
  isValidateCoord(coord) {
    const { x, y } = coord;
    if (x < 0 || y < 0 || x > this.maxX || y > this.maxY) return false;

    let flag = true;
    let current = this.head;
    while (current) {
      if (current.x === x && current.y === y) flag = false;
      current = current.next;
    }
    return flag;
  }

  // 以 graph 的中心点绘制
  #drawGraph() {
    let maxX = Math.max(...this.graph.map(([x, _]) => x));
    let maxY = Math.max(...this.graph.map(([_, y]) => y));
    let minX = Math.min(...this.graph.map(([x, _]) => x));
    let minY = Math.min(...this.graph.map(([_, y]) => y));
    let center = [(minX + maxX) / 2, (minY + maxY) / 2];

    // begin
    this.ctx.beginPath();
    this.ctx.fillStyle = "#000";
    this.ctx.strokeStyle = "#ddd";

    let index = 0;

    while (this.graph[index]) {
      let args = [
        (this.graph[index][0] - center[0]) * this.unit + this.size.w / 2 - this.unit / 2,
        (this.graph[index][1] - center[1]) * this.unit + this.size.h / 2 - this.unit / 2,
        this.unit,
        this.unit,
      ];

      this.ctx.fillRect(...args);
      this.ctx.strokeRect(...args);

      index++;
    }

    // end
    this.ctx.closePath();
  }

  // Coord 坐标数值转 Px 像素值
  coordToPx(value) {
    return this.unit / 2 + value * this.unit;
  }

  // 与 coordToPx 相反
  pxToCoord(value) {
    return Math.floor((value - this.unit / 2) / this.unit);
  }

  /**
   * 旋转图形
   * @param {Array<Array<Number>>} graph 图形坐标
   * @param {0|1|2|3} num 旋转 90deg 的次数
   */
  rotateGraph(graph, num = 1) {
    if (num === 0) return graph;

    // 进行一次 90deg 的旋转
    let rotatedOnceGraph = graph.map(([x, y]) => [y, -x]);

    return this.rotateGraph(rotatedOnceGraph, num - 1);
  }

  translateGraph(graph, offset) {
    if (offset.x < 0 || offset.y < 0) {
      return graph.map(([x, y]) => [x - offset.x, y - offset.y]);
    }
  }
}
