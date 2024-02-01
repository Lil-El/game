/**
 * @typedef Chess
 * @property {0 | 1} color
 * @property {Number} type
 * @property {String} text
 * @property {Boolean} pick
 */

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

  maxX = 8;
  maxY = 9;

  /**
   * 服务端的 chess 数据
   * @private
   * @type {Chess[][]}
   */
  #chessMap = [];

  /**
   * 相对于自己的 chess 数据
   * @type {Chess[][]}
   */
  chessMap = [];

  /**
   * 拿起的棋子的坐标
   * @type {[x: Number, y: Number]}
   */
  pickedCoord;

  /**
   * 当前玩家的颜色（0：黑色：先手 | 1：红色：后手）
   * @type { 0 | 1 }
   */
  color;

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
    this.#drawPanel();
    this.#drawChess();
  }

  #drawChess() {
    this.ctx.lineWidth = 1;
    this.ctx.font = "bold 20px auto";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (let x = 0; x <= this.maxX; x++) {
      for (let y = 0; y <= this.maxY; y++) {
        const data = this.chessMap?.[x]?.[y];
        if (data) {
          this.ctx.beginPath();

          // 绘制棋子
          this.ctx.fillStyle = "white";
          this.ctx.arc(this.coordToPx(x), this.coordToPx(y), 22, 0, Math.PI * 2);
          this.ctx.shadowColor = data.pick ? "black" : "transparent";
          this.ctx.shadowBlur = data.pick ? 10 : 0;
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

  setChessMap(data) {
    this.#chessMap = data;

    if (this.getColor() === 1) {
      // 后手 - 反转棋盘  x [0, 8]  y [0, 9]
      this.chessMap = this.reverse(data);
    } else {
      // 先手即无须反转
      this.chessMap = data;
    }

    this.draw();
  }
  getChessMap() {
    return this.#chessMap;
  }
  setColor(color) {
    this.color = color;
  }
  getColor() {
    return this.color;
  }
  isPick() {
    return !!this.pickedCoord;
  }

  // 拿起
  pick(x, y) {
    let oneChess = this.chessMap[x][y];

    // 只能拿起自己颜色的棋子，设置为 true，并记录该位置
    if (oneChess?.color === this.getColor()) {
      if (this.pickedCoord) this.chessMap[this.pickedCoord[0]][this.pickedCoord[1]].pick = false;
      this.pickedCoord = [x, y];
      oneChess.pick = true;

      // 反转
      if (this.getColor() === 1) {
        this.#chessMap = this.reverse(this.chessMap);
      }

      return true;
    }
  }

  // 走 . 吃
  goto(targetX, targetY) {
    const [originX, originY] = this.pickedCoord;

    const pickChess = this.chessMap[originX][originY];

    // 是否可以抵达目标位置
    let isOK = false;

    // "车", "马", "象", "士", "将", "炮", "兵"
    switch (pickChess.type) {
      case 0:
      case 5:
        let otherChessCount = 0;
        // 车、炮，只能在一条线上走
        if (originX === targetX) {
          // 判断路上是否有其他子
          let [minY, maxY] = [Math.min(originY, targetY), Math.max(originY, targetY)];
          for (let y = minY + 1; y <= maxY - 1; y++) {
            if (this.chessMap[targetX][y] !== null) otherChessCount++;
          }

          // 判断道路是否畅通
          isOK = otherChessCount === 0;
        } else if (originY === targetY) {
          // 判断路上是否有其他子
          let [minX, maxX] = [Math.min(originX, targetX), Math.max(originX, targetX)];
          for (let x = minX + 1; x <= maxX - 1; x++) {
            if (this.chessMap[x][targetY] !== null) otherChessCount++;
          }

          // 判断道路是否畅通
          isOK = otherChessCount === 0;
        } else {
          // 不在一条直线上
        }

        // 炮吃
        if (
          pickChess.type === 5 &&
          this.chessMap[targetX][targetY] &&
          this.chessMap[targetX][targetY].color !== this.getColor()
        )
          isOK = otherChessCount === 1;

        break;
      case 1:
        if (originX !== targetX && originY !== targetY) {
          let [absX, absY] = [Math.abs(targetX - originX), Math.abs(targetY - originY)];
          // 是否走的日
          if (absX === 1 && absY === 2) {
            // 左下、右下
            if (targetY > originY) {
              if (this.chessMap[originX][originY + 1] === null) isOK = true;
            } else {
              // 左上、右上
              if (this.chessMap[originX][originY - 1] === null) isOK = true;
            }
          } else if (absX === 2 && absY === 1) {
            if (targetX > originX) {
              if (this.chessMap[originX + 1][originY] === null) isOK = true;
            } else {
              if (this.chessMap[originX - 1][originY] === null) isOK = true;
            }
          }
        }
        break;
      case 2:
        if (originX !== targetX && originY !== targetY) {
          let [absX, absY] = [Math.abs(targetX - originX), Math.abs(targetY - originY)];
          // 是否走的田
          if (absX === 2 && absY === 2) {
            if (this.chessMap[(originX + targetX) / 2][(originY + targetY) / 2] === null) isOK = true;
          }
        }
        break;
      case 3:
        if (3 <= targetX && targetX <= 5 && 7 <= targetY && targetY <= this.maxY) {
          let [absX, absY] = [Math.abs(targetX - originX), Math.abs(targetY - originY)];
          // 是否走的斜一格
          if (absX === 1 && absY === 1) isOK = true;
        }
        break;
      case 4:
        if (3 <= targetX && targetX <= 5 && 7 <= targetY && targetY <= this.maxY) {
          let [absX, absY] = [Math.abs(targetX - originX), Math.abs(targetY - originY)];
          // 是否走的横竖一格
          if ((absX === 1 && absY === 0) || (abx === 0 && absY === 1)) isOK = true;
        }
        break;
      case 6:
        // 只能向前、左右走
        if (targetY <= originY) {
          let [absX, absY] = [Math.abs(targetX - originX), Math.abs(targetY - originY)];
          // 在己方
          if (originY >= 5) {
            if (absX === 0 && absY === 1) isOK = true;
          } else {
            if (absX === 0 && absY === 1) isOK = true;
            if (absX === 1 && absY === 0) isOK = true;
          }
        }
        break;
    }

    // 设置拿起的棋子的位置
    if (isOK) {
      this.chessMap[originX][originY] = null;

      pickChess.pick = false;
      this.pickedCoord = null;

      this.chessMap[targetX][targetY] = pickChess;
    }

    // 反转
    if (this.getColor() === 1) {
      this.#chessMap = this.reverse(this.chessMap);
    }

    return isOK;
  }

  // 反转
  reverse(data) {
    let result = [];

    for (let i = 0; i <= this.maxX; i++) {
      for (let j = 0; j <= this.maxY; j++) {
        if (!result[i]) result[i] = [];

        result[i][j] = data[this.maxX - i][this.maxY - j];
      }
    }

    return result;
  }

  // Coord 坐标数值转 Px 像素值
  coordToPx(value) {
    return this.unit / 2 + value * this.unit;
  }

  // 与 coordToPx 相反
  pxToCoord(value) {
    return Math.floor(value / this.unit);
  }
}
