const ws = require("nodejs-websocket");

let server;
let players = {};
let currentColor = 0;

const createPlayer = (conn) => {
  const count = Object.keys(players).length;

  players[conn.key] = {
    key: conn.key,
    name: null,
    color: count,
    conn,
  };
  return 1;
};

const createChessMap = () => {
  let source = [];

  for (let i = 0; i < 9; i++) {
    source[i] = [];
    for (let j = 0; j < 10; j++) {
      source[i][j] = null;
    }
  }
  // "车", "马", "象", "士", "将", "炮", "兵"
  const chess = ["车", "马", "象", "士", "将"];
  chess.forEach((text, index) => {
    source[index][0] = { color: 1, type: index, text };
    source[8 - index][0] = { color: 1, type: index, text };
    source[index][9] = { color: 0, type: index, text };
    source[8 - index][9] = { color: 0, type: index, text };
  });

  source[1][2] = { color: 1, type: 5, text: "炮" };
  source[7][2] = { color: 1, type: 5, text: "炮" };
  source[1][7] = { color: 0, type: 5, text: "炮" };
  source[7][7] = { color: 0, type: 5, text: "炮" };

  for (let i = 0; i < 9; i += 2) {
    source[i][3] = { color: 1, type: 6, text: "兵" };
    source[i][6] = { color: 0, type: 6, text: "兵" };
  }

  return source;
};

const isOver = (data) => {
  let bossCount = 0;
  let winner = null;

  data.forEach((item) => {
    const boss = item.filter((p) => p?.type === 4);
    bossCount += boss?.length || 0;
    winner = winner || boss[0];
  });

  return bossCount === 2 ? false : winner;
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
  broadcast({ ev: "PLAYER", data: Object.values(players).map(({ name, color }) => ({ name, color })) });
};


server = ws.createServer(function (conn) {
  // 创建 player
  createPlayer(conn);

  // 监听消息
  conn.on("text", function (msg) {
    const { ev, data } = JSON.parse(msg);
    const player = players[conn.key];
    switch (ev) {
      case "ENTER":
        player.name = data;
        updatePlayerStatus();
        if (Object.keys(players).length === 2) {
          broadcast({
            ev: "TURN",
            data: currentColor,
          });
          broadcast({
            ev: "CHESS",
            data: createChessMap()
          });
        }
        break;
      case "PICK":
        broadcast({ ev: "CHESS", data });
        break;
      case "CHESS":
        let winner = null;
        if ((winner = isOver(data))) {
          broadcast({
            ev: "OVER",
            data: winner.color,
          });
        } else {
          broadcast({
            ev: "TURN",
            data: (currentColor = currentColor ^ 1),
          });
          broadcast(msg);
        }
        break;
      case "RESTART":
        if (Object.keys(players).length === 2) {
          updatePlayerStatus();
          Object.values(players).forEach((p) => (p.color = p.color ^ 1));
          currentColor = 0;
          broadcast({
            ev: "TURN",
            data: currentColor,
          });
        }
        broadcast({
          ev: "CHESS",
          data: createChessMap()
        });
        break;
    }
  });

  // 监听关闭事件
  conn.on("close", () => {
    delete players[conn.key];
    updatePlayerStatus();
  });

  // 监听错误事件，防止程序崩溃
  conn.on("error", () => {
    console.log("error");
  });
});

server.listen(1997);
