# Fishing at work

> 中国象棋

1. VsCode 打开项目目录，安装依赖。

```bash
cd ./chess
npm i pm2 -g
npm i
pm2 start index.js --name chess --watch
```

服务端启动成功，在端口 1997

> 其他 pm2 常用命令
>
> ```bash
> pm2 list
> pm2 stop [name]
> pm2 restart [name] [--watch]
> pm2 delete [name]
> pm2 logs
> ```

1. VsCode 使用 LiveServer 插件，打开项目目录，启动 Chess 项目。

2. 两个玩家打开浏览器，访问 http://localhost:5500?name=xxx。xxx 替换成你的名字，比如 http://localhost:5500?name=张三

3. 各自点击自己的名字，开始准备，双方都准备之后，自动分配玩家先手并开始游戏。
