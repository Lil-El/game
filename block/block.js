export default class Block {
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
   * 是否展示坐标线
   * @type {Boolean}
   */
  showLine;

  /**
   * 辅助线偏移
   * @type {Number}
   */
  offsetLine;

  /**
   * 相邻交点之间的距离（也是: 蛇移动的最小步长 和 蛇的宽度）
   * @constant
   * @type {12}
   */
  unit = 12;

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
   * 状态 -> 0: 移动中 1: 暂停中
   * @type { 0 | 1 }
   */
  status = 1;

  /**
   * @type {import(./graph.js).default}
   */
  graphProvider;

  /**
   * 当前图形
   * @type {Array<Array<Number>>}
   */
  graph;

  /**
   * 界面所有坐标点的信息，1固定的方块
   */
  blockMap;

  drawTimer;

  /** @constructor */
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this.graphProvider = options.graphProvider;
    this.showLine = options.showLine || false;
    this.offsetLine = options.offsetLine ? 1 : 0.5;

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

    this.blockMap = new Array(this.maxX).fill(0);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.#drawLine();
    this.#drawBlock();
    this.#drawGraph();
  }

  // 设置状态
  statusTo(status) {
    this.status = status;
    if (status === 0) {
      this.start();
    } else {
      clearTimeout(this.drawTimer);
    }
  }

  operate(code) {
    if (this.status !== 0 || !this.graph) return void 0;

    if (code === 32) this.graph = this.rotateGraph(this.graph); // 空格键
    if (code === 40) this.graph = this.translateGraph(this.graph, [0, 1]); // 下
    if (code === 37) this.graph = this.translateGraph(this.graph, [-1, 0]); // 左
    if (code === 39) this.graph = this.translateGraph(this.graph, [1, 0]); // 右
  }

  start() {
    this.getGraph();

    if (this.status !== 0) return void 0;

    if (!this.isValidateGraph(this.graphProvider.translateGraph(this.graph, [0, 1]))) {
      for (let i = 0; i < 4; i++) {
        const [x, y] = this.graph[i];
        (this.blockMap[x] = this.blockMap[x] || [])[y] = 1;
      }
      this.graph = null;

      this.clearTailLine();
    } else {
      this.graph = this.translateGraph(this.graph, [0, 1]);
    }

    this.draw();

    this.drawTimer = setTimeout(() => this.start(), 700);
  }

  getGraph() {
    if (this.graph) return void 0;
    let graph = this.graphProvider.fetchGraph();

    // 将 原本graph 的相对坐标和当前的坐标叠加后进行移动
    let offsetX = Math.floor(this.maxX / 2);
    let offsetY = 0 - Math.min(0, ...graph.map(([_, y]) => y));

    graph = this.graphProvider.translateGraph(graph, [offsetX, offsetY]);
    if (this.isValidateGraph(graph)) this.graph = graph;
    else {
      this.status = 1;
      alert("you lose.");
    }
  }

  rotateGraph(graph) {
    let offset = graph[0].map((v) => -v);

    // 获取 graph 相对坐标
    let relateGraph = this.graphProvider.translateGraph(graph, offset);

    // 旋转
    let rotatedGraph = this.graphProvider.rotateGraph(relateGraph);

    // 将 graph 移动至绝对坐标位置
    let newGraph = this.graphProvider.translateGraph(
      rotatedGraph,
      offset.map((v) => -v)
    );

    if (this.isValidateGraph(newGraph)) return newGraph;
    return graph;
  }

  translateGraph(graph, offset) {
    let newGraph = this.graphProvider.translateGraph(graph, offset);

    if (this.isValidateGraph(newGraph)) return newGraph;
    return graph;
  }

  isValidateGraph(graph) {
    let minX = Math.min(...graph.map(([x, _]) => x));
    let minY = Math.min(...graph.map(([_, y]) => y));
    let maxX = Math.max(...graph.map(([x, _]) => x));
    let maxY = Math.max(...graph.map(([_, y]) => y));

    // 超出边界
    if (minX < 0) {
      return false;
    } else if (maxX > this.maxX) {
      return false;
    } else if (maxY > this.maxY) {
      return false;
    } else if (minY < 0) {
      return false;
    }

    // 与固定方块重合
    const overBlocks = graph.filter(([x, y]) => this.blockMap[x]?.[y]);
    if (overBlocks.length) return false;

    return true;
  }

  // 绘制
  #drawGraph() {
    if (!this.graph) return void 0;

    this.ctx.beginPath();
    this.ctx.lineWidth = 0.5;
    this.ctx.fillStyle = "#000";
    this.ctx.strokeStyle = "#ddd";

    let index = 0;
    while (this.graph[index]) {
      let args = [
        this.coordToPx(this.graph[index][0]) - this.unit / 2,
        this.coordToPx(this.graph[index][1]) - this.unit / 2,
        this.unit,
        this.unit,
      ];

      this.ctx.fillRect(...args);
      this.ctx.strokeRect(...args);

      index++;
    }

    this.ctx.closePath();
  }

  #drawBlock() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 0.5;
    this.ctx.fillStyle = "#000";
    this.ctx.strokeStyle = "#ddd";

    for (let i = 0; i <= this.maxX; i++) {
      for (let j = 0; j <= this.maxY; j++) {
        if (this.blockMap[i]?.[j]) {
          let args = [this.coordToPx(i) - this.unit / 2, this.coordToPx(j) - this.unit / 2, this.unit, this.unit];

          this.ctx.fillRect(...args);
          this.ctx.strokeRect(...args);
        }
      }
    }

    this.ctx.closePath();
  }

  // 绘制坐标辅助线
  #drawLine() {
    if (!this.showLine) return void 0;

    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 0.1;
    this.ctx.beginPath();

    // PS: unit/2时，每个交点就是一个方块的中心；unit时，偏移了一半，让每一个方块都位于格子中
    // 绘制垂直的线
    for (let c = this.unit * this.offsetLine; c <= this.size.w; c += this.unit) {
      this.ctx.moveTo(c, 0);
      this.ctx.lineTo(c, this.size.h);
    }
    // 绘制水平的线
    for (let r = this.unit * this.offsetLine; r <= this.size.h; r += this.unit) {
      this.ctx.moveTo(0, r);
      this.ctx.lineTo(this.size.w, r);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }

  clearTailLine() {
    if (this.blockMap.every((column) => column.length && column[this.maxY] === 1)) {
      this.blockMap.forEach((column) => {
        column.pop();
        column.unshift(0);
      });
      return this.clearTailLine();
    }
    return void 0;
  }

  // Coord 坐标数值转 Px 像素值
  coordToPx(value) {
    return this.unit / 2 + value * this.unit;
  }

  // 与 coordToPx 相反
  pxToCoord(value) {
    return Math.floor((value - this.unit / 2) / this.unit);
  }
}
