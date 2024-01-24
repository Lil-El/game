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
   * 食物坐标
   * @type {Coord}
   */
  food;

  /**
   * 移动的偏移量 offset
   * @type {{x: -1|0|1, y: -1|0|1}}
   */
  offset;

  /** 定时器 */
  drawTimer;

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
      next: { x: this.pxToCoord(this.size.w / 2) - 1, y: this.pxToCoord(this.size.h / 2), next: null },
    };

    this.offset = { x: this.head.x - this.head.next.x, y: this.head.y - this.head.next.y };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.#drawLine();
    this.#drawSnake();
    this.#drawFood();
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

  // 方向
  directionTo(code) {
    let offset;
    if (code === 38) offset = { x: 0, y: -1 }; // 上
    if (code === 40) offset = { x: 0, y: 1 }; // 下
    if (code === 37) offset = { x: -1, y: 0 }; // 左
    if (code === 39) offset = { x: 1, y: 0 }; // 右
    if (offset.x + this.offset.x === 0) return void 0;
    this.offset = offset;
  }

  pause() {
    clearTimeout(this.drawTimer);
  }

  over() {
    alert("You lose!");
  }

  start() {
    this.setFood();
    
    let newHeadCoord = { x: this.head.x + this.offset.x, y: this.head.y + this.offset.y };
    // 如果吃到食物，只需要更新 head
    if (newHeadCoord.x === this.food.x && newHeadCoord.y === this.food.y) {
      this.food = null;
      this.head = { ...newHeadCoord, next: this.head };
    } else {
      // 更新尾部节点
      this.cutTail(this.head);

      // 判断新的 head 节点是否合法，否则结束
      if (this.isValidateCoord(newHeadCoord)) {
        this.head = { ...newHeadCoord, next: this.head };
      } else {
        return this.over();
      }
    }

    this.draw();

    this.drawTimer = setTimeout(() => this.start(), 500);
  }

  // 设置食物
  setFood() {
    if (this.food) return void 0;
    let foodCoord = { x: Math.round(Math.random() * this.maxX), y: Math.round(Math.random() * this.maxY) };
    if (this.isValidateCoord(foodCoord)) {
      this.food = foodCoord;
    } else {
      this.setFood();
    }
  }

  cutTail(node) {
    if (node.next && !node.next.next) return void (node.next = null);
    return this.cutTail(node.next);
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

  // 绘制 snake
  #drawSnake() {
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

  // 绘制食物
  #drawFood() {
    if (!this.food) return void 0;
    this.ctx.fillStyle = "#666";
    this.ctx.beginPath();
    this.ctx.arc(this.coordToPx(this.food.x), this.coordToPx(this.food.y), this.unit / 2, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.closePath();
  }

  // 绘制坐标辅助线，每个交点是一个坐标
  #drawLine() {
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
