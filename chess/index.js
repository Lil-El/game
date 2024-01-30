const ws = require("nodejs-websocket");

let server;
let points = [];
let players = new Map();

const createPlayer = (conn) => {
  players.set(conn.key, {
    key: conn.key,
    ready: 0, // 0: unready | 1: ready
    name: null,
    color: null,
    conn,
  });
  return 1;
};

/**
 * 通过 index 获取棋子的行和列的下标
 */
const getSequence = (index) => {
  let row = Math.floor(index / 15);
  let column = index % 15;
  return [row, column];
};

/**
 * 获取一个方向上相同棋子的数量
 */
const getDirectionSameCount = (row, column, rowOffset, columnOffset, samePoints = []) => {
  if (points?.[row]?.[column] === points?.[row + rowOffset]?.[column + columnOffset]) {
    return getDirectionSameCount(row + rowOffset, column + columnOffset, rowOffset, columnOffset, [
      ...samePoints,
      [row + rowOffset, column + columnOffset],
    ]);
  }
  return {
    count: samePoints.length,
    points: samePoints,
  };
};

/**
 * 判断目标棋子是否5颗在一行
 * @param {Number} row 棋子的行 0-14
 * @param {Number} column 棋子的列 0-14
 * @description
 *    points[row][column]: 棋子的颜色 0 black | 1 white
 */
const validateFiveInLine = (row, column) => {
  let lt = getDirectionSameCount(row, column, -1, -1);
  let rb = getDirectionSameCount(row, column, 1, 1);
  if (lt.count + rb.count + 1 >= 5) return [[row, column], ...lt.points, ...rb.points];

  let lb = getDirectionSameCount(row, column, -1, 1);
  let rt = getDirectionSameCount(row, column, 1, -1);
  if (lb.count + rt.count + 1 >= 5) return [[row, column], ...lb.points, ...rt.points];

  let l = getDirectionSameCount(row, column, 0, -1);
  let r = getDirectionSameCount(row, column, 0, 1);
  if (l.count + r.count + 1 >= 5) return [[row, column], ...l.points, ...r.points];

  let t = getDirectionSameCount(row, column, -1, 0);
  let b = getDirectionSameCount(row, column, 1, 0);
  if (t.count + b.count + 1 >= 5) return [[row, column], ...t.points, ...b.points];
};

const unicast = (connection, data) => {
  const msg = typeof data === "object" ? JSON.stringify(data) : data;
  connection.sendText(msg);
};

/**
 * @typedef MSG
 * @property {String} ev 事件名
 * @property {*} data 传递的数据
 */

/**
 * @param {MSG | (Connection) => MSG} data
 */
const broadcast = (data) => {
  server.connections.forEach(function (connection) {
    const msg = typeof data === "function" ? data(connection) : data;
    const msgStr = typeof msg === "object" ? JSON.stringify(msg) : msg;
    connection.sendText(msgStr);
  });
};

const updatePlayerStatus = () => {
  if (players.size === 2) {
    const [p1, p2] = players.values();
    p1 && unicast(p1.conn, { ev: "ANOTHER", data: { name: p2.name, ready: p2.ready } });
    p2 && unicast(p2.conn, { ev: "ANOTHER", data: { name: p1.name, ready: p1.ready } });
  } else {
    players.forEach((player) => {
      unicast(player.conn, { ev: "ANOTHER", data: {} });
    });
  }
};

server = ws.createServer(function (conn) {
  // 创建 player
  createPlayer(conn);

  // 监听消息
  conn.on("text", function (msg) {
    const { ev, data } = JSON.parse(msg);
    const player = players.get(conn.key);
    switch (ev) {
      case "ENTER":
        player.name = data;
        updatePlayerStatus();
        break;
      case "READY":
        player.ready = data;
        broadcast((c) => ({
          ev: c === conn ? "ONESELF" : "ANOTHER",
          data: { name: player.name, ready: player.ready },
        }));
        if (players.size === 2) {
          const [p1, p2] = players.values();
          if (p1.ready && p2.ready) {
            p1.color = Date.now() & 1;
            p2.color = p1.color ^ 1;
            broadcast((c) => ({
              ev: "ONESELF",
              data: { name: players.get(c.key).name, ready: 1, color: players.get(c.key).color },
            }));
            broadcast({ ev: "START" });
            return void 0;
          }
        }
        break;
      case "DROP":
        let [row, column] = getSequence(data);
        if (points[row]?.[column]) return void 0;
        (points[row] = points[row] || [])[column] = player.color;
        broadcast({ ev, data: { index: data, color: player.color } });

        let result = validateFiveInLine(row, column);
        if (result?.length) {
          broadcast({ ev: "WIN", data: { name: player.name, points: result.map(([r, c]) => r * 15 + c) } });
        }
        break;
    }
  });

  // 监听关闭事件
  conn.on("close", () => {
    players.delete(conn.key);
    updatePlayerStatus();
  });

  // 监听错误事件，防止程序崩溃
  conn.on("error", () => {
    console.log("error");
  });
});

server.listen(1997);
