/**
 * @typedef Coord 交点坐标
 * @property {Number} x
 * @property {Number} y
 */

/**
 * @typedef SnakeNode 蛇节点
 * @property {Number} x Coord.x
 * @property {Number} y Coord.y
 * @property {SnakeNode?} next
 */

export default class Snake {
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
   * snake 头部节点
   * @type {SnakeNode}
   */
  head;

  /**
   * snake 尾部节点
   * @type {SnakeNode}
   */
  tail;

  /**
   * 小球坐标
   * @type {Coord}
   */
  ball;

  /**
   * 二维数组: 映射每个交点坐标的信息; 1: Snake 2: 小球
   * @type {Array<Array>}
   */
  indexMap = [];

  /** @constructor */
  constructor(ctx, showLine = false) {
    this.ctx = ctx;
    this.showLine = showLine;

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

    this.head = {
      x: this.pxToCoord(this.size.w / 2),
      y: this.pxToCoord(this.size.h / 2),
      next: (this.tail = { x: this.pxToCoord(this.size.w / 2) - 1, y: this.pxToCoord(this.size.h / 2), next: null }),
    };

    this.initIndexMap();

    // this.ball = { x: 3, y: 3 };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.drawLine();
    this.drawSnake();
    this.drawBall();
  }

  // 设置状态
  statusTo(status) {
    this.status = status;
    if (status === 0) {
      // 开始
      this.start();
    } else if (status === 1) {
      // 暂停
      this.pause();
    }
  }

  start() {
    this.move();
  }

  pause() {}

  over() {}

  move() {
    let offsetX = this.head.x - this.head.next.x;
    let offsetY = this.head.y - this.head.next.y;
    let nextHeadX = this.head.x + offsetX;
    let nextHeadY = this.head.y + offsetY;
    if (nextHeadX > this.maxX || nextHeadY > this.maxY) return void this.over();

    let tail = setTimeout(this.move, 1500);
  }

  initIndexMap() {
    let current = this.head;
    while (current) {
      (this.indexMap[current.x] = this.indexMap[current.x] || [])[current.y] = 1;
      current = current.next;
    }
  }

  // 校验一个 coord 坐标是否合法
  isValidateCoord(coord) {
    const { x, y } = coord;
    if (x < 0 || y < 0 || x > this.maxX || y > this.maxY) return console.warn("超出合法边界"), false;
    if (this.indexMap[x]?.[y]) {
      // TODO: snake 开始移动 move(); 校验下一个 head 坐标是否合法，处理 next 是 tail 的情况
    }
    return true;
  }

  // 绘制 snake
  drawSnake() {
    // begin
    this.ctx.beginPath();

    // 绘制身体
    this.ctx.fillStyle = "#000";
    let current = this.head;
    while (current) {
      this.ctx.fillRect(
        this.coordToPx(current.x) - this.unit / 2,
        this.coordToPx(current.y) - this.unit / 2,
        this.unit,
        this.unit
      );
      current = current.next;
    }

    // 绘制头部标记
    this.ctx.fillStyle = "#fff";
    this.ctx.arc(this.coordToPx(this.head.x), this.coordToPx(this.head.y), this.unit / 2 / 2, 0, Math.PI * 2, true);
    this.ctx.fill();

    // end
    this.ctx.closePath();
  }

  // 绘制小球
  drawBall() {
    if (!this.ball) return void 0;
    this.ctx.fillStyle = "#666";
    this.ctx.beginPath();
    this.ctx.arc(this.coordToPx(this.ball.x), this.coordToPx(this.ball.y), this.unit / 2, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.closePath();
  }

  // 绘制坐标辅助线，每个交点是一个坐标
  drawLine() {
    if (!this.showLine) return void 0;
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 0.1;
    this.ctx.beginPath();
    // 绘制垂直的线
    for (let c = this.unit / 2; c <= this.size.w; c += this.unit) {
      this.ctx.moveTo(c, 0);
      this.ctx.lineTo(c, this.size.h);
    }
    // 绘制水平的线
    for (let r = this.unit / 2; r <= this.size.h; r += this.unit) {
      this.ctx.moveTo(0, r);
      this.ctx.lineTo(this.size.w, r);
    }
    this.ctx.stroke(); // stroke 放在循环内部时，会使前面的线重复绘制。除非每次循环中调用begin、close path
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
}
