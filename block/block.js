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

  /** @constructor */
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this.showLine = options.showLine || false;

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

  }

  draw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.#drawLine();
    this.#drawBlock();
  }

  // 设置状态
  statusTo(status) {
    this.status = status;
    if (status === 0) {
      if (this.fluency) this.start();
      else this.start1();
    }
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

  // 绘制
  #drawBlock() {
    return 
    // begin
    this.ctx.beginPath();
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
      last = last.next;
    }

    this.ctx.fillStyle = "#fff";
    this.ctx.arc(
      this.coordToPx(this.head.x),
      this.coordToPx(this.head.y),
      this.unit / 2 / 2,
      0,
      Math.PI * 2,
      true
    );
    this.ctx.fill();

    // end
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
    for (let c = this.unit / 2; c <= this.size.w; c += this.unit) {
      this.ctx.moveTo(c, 0);
      this.ctx.lineTo(c, this.size.h);
    }
    // 绘制水平的线
    for (let r = this.unit / 2; r <= this.size.h; r += this.unit) {
      this.ctx.moveTo(0, r);
      this.ctx.lineTo(this.size.w, r);
    }
    this.ctx.stroke();
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
