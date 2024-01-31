const ws = require("nodejs-websocket");

let server;
let chessMap = [];
let players = {};

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
            data:
              Object.values(players)[0].color === 0 ? Object.values(players)[0].name : Object.values(players)[1].name,
          });
          broadcast({
            ev: "CHESS",
            data: chessMap,
          });
        }
        break;
        ``;
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
