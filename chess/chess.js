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
   * 相邻交点之间的距离
   * @constant
   * @type {50}
   */
  unit = 50;

  /**
   * 状态 -> 0: 移动中 1: 暂停中
   * @type { 0 | 1 }
   */
  status = 1;

  /**
   * 界面所有坐标点的信息，1固定的方块
   */
  chessMap;

  drawTimer;

  /** @constructor */
  constructor(ctx, data = []) {
    this.ctx = ctx;
    this.chessMap = data;

    this.init();
    this.draw();
  }

  init() {
    this.size = {
      w: this.ctx.canvas.width,
      h: this.ctx.canvas.height,
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.#drawPanel();
    this.#drawChess();
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

  start() {
    if (this.status !== 0) return void 0;

    // todo

    this.draw();

    this.drawTimer = setTimeout(() => this.start(), 700);
  }

  #drawChess() {
    this.ctx.lineWidth = 1;
    this.ctx.font = "bold 20px auto";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (let x = 0; x < this.chessMap.length; x++) {
      for (let y = 0; y < 8; y++) {
        const data = this.chessMap?.[x]?.[y];
        if (data) {
          this.ctx.beginPath();

          // 绘制棋子
          this.ctx.fillStyle = "white";
          this.ctx.arc(this.coordToPx(x), this.coordToPx(y), 22, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.fill();

          // 绘制棋子的字
          this.ctx.fillStyle = data.color === 0 ? "black" : "red";
          this.ctx.fillText(data.text, this.coordToPx(x), this.coordToPx(y), 40);
        }
      }
    }
    this.ctx.closePath();
  }

  // 绘制棋盘
  #drawPanel() {
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();

    // 绘制垂直的线
    for (let c = this.unit / 2; c <= this.size.w; c += this.unit) {
      this.ctx.moveTo(c, this.unit / 2);
      this.ctx.lineTo(c, this.size.h - this.unit / 2);
    }
    // 绘制水平的线
    for (let r = this.unit / 2; r <= this.size.h; r += this.unit) {
      this.ctx.moveTo(this.unit / 2, r);
      this.ctx.lineTo(this.size.w - this.unit / 2, r);
    }
    this.ctx.stroke();
    this.ctx.closePath();

    // 清除中间
    this.ctx.clearRect(this.unit / 2 + 1, this.coordToPx(4), this.size.w - this.unit - 2, this.unit);
    this.ctx.font = "40px auto";
    this.ctx.strokeText("By Mino.", 120, this.coordToPx(5) - 14);

    // 绘制斜线
    this.ctx.beginPath();
    this.ctx.moveTo(this.coordToPx(3), this.unit / 2);
    this.ctx.lineTo(this.coordToPx(5), this.coordToPx(2));
    this.ctx.moveTo(this.coordToPx(5), this.unit / 2);
    this.ctx.lineTo(this.coordToPx(3), this.coordToPx(2));
    this.ctx.moveTo(this.coordToPx(3), this.coordToPx(7));
    this.ctx.lineTo(this.coordToPx(5), this.coordToPx(9));
    this.ctx.moveTo(this.coordToPx(5), this.coordToPx(7));
    this.ctx.lineTo(this.coordToPx(3), this.coordToPx(9));
    this.ctx.stroke();
    this.ctx.closePath();

    // 绘制点
    const points = [1, 2, 7, 2, 0, 3, 2, 3, 4, 3, 6, 3, 8, 3, 0, 6, 2, 6, 4, 6, 6, 6, 8, 6, 1, 7, 7, 7];
    for (let i = 0; i < points.length; i += 2) {
      this.ctx.beginPath();
      this.ctx.arc(this.coordToPx(points[i]), this.coordToPx(points[i + 1]), 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
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
