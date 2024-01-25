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
  }

  draw() {
    this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    this.#drawGraph();
  }

  // 设置状态
  statusTo(status) {
    this.status = status;
    if (status === 0) {
      if (this.fluency) this.start();
      else this.start1();
    }
  }

  // 绘制
  #drawGraph() {
    return 
    // begin
    this.ctx.beginPath();
    this.ctx.fillStyle = "#000";

    let current = this.head;
    let last = lastHead;

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

    // end
    this.ctx.closePath();
  }
}
