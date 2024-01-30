# Fishing at work

1. VsCode 打开项目目录，安装依赖。

```bash
cd ./fish
npm i pm2 -g
npm i
pm2 start index.js
```

服务端启动成功，在端口 1997

2. VsCode 使用 LiveServer 插件，打开项目目录，启动 Fish 项目。

3. 两个玩家打开浏览器，访问 http://localhost:5500?name=xxx。xxx 替换成你的名字，比如 http://localhost:5500?name=张三

4. 各自点击自己的名字，开始准备，双方都准备之后，自动分配玩家先手并开始游戏。
