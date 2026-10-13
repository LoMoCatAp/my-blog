---
title: "搭一个 Minecraft 基岩版服务器"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "下载服务端、修改配置，再处理白名单和外部连接。"
updated: "2026-10-11"
published: true
---

这篇按下载、启动、配置和外部连接的顺序，整理官方基岩版服务端的部署步骤。

先在本机或局域网测试，再处理白名单、防火墙和公网访问。

## 准备工作

你需要：

- **一台电脑/服务器**（能长时间开着就行，Windows / Ubuntu Linux）
- **官方基岩版服务端**：下载对应系统的程序。此服务端不以安装 Java 运行时为前提。
- **开放端口 19132**（UDP，这个是基岩版的默认端口）

内存和 CPU 需求取决于视距、Addon 和在线玩家数量，先用默认配置观察实际占用。

## 下载服务器核心

去 Minecraft 官网的下载页面，找到「Minecraft Bedrock Server」：

> https://www.minecraft.net/en-us/download/server/bedrock/

找到对应你的Minecraft的版本（在游戏主页面右下角显示）下载就行。

下载完解压，得到一个 `bedrock_server` 文件夹，里面有这些东西：

```
- bedrock_server.exe / bedrock_server     ← 启动文件
- server.properties                        ← 主要配置文件
- allowlist.json                            ← 白名单
- permissions.json                          ← 管理员权限
- worlds/                                   ← 世界存档放这里
```

## 启动服务器

### Windows

双击 `bedrock_server.exe`，会弹出一个命令行窗口，等它加载完。第一次启动它会生成默认的世界和配置。

```
Starting Server...
[2026-06-20 13:00:00 INFO] Server started on port 19132
```

看到这行就说明启动成功了。

### Ubuntu Linux

```bash
chmod +x bedrock_server
LD_LIBRARY_PATH=. ./bedrock_server
```

第一次启动会自动生成所有配置文件，等几秒看到 `Server started` 就行。

## 配置服务器

关掉服务器（命令行里输 `stop`），编辑 `server.properties`：

```properties
# 这行最重要——设置你的服务器名
server-name=我和朋友们的生存服

# 最大玩家数
max-players=10

# 游戏模式：survival / creative / adventure
gamemode=survival

# 难度：peaceful / easy / normal / hard
difficulty=normal

# 开启正版验证（建议开着）
online-mode=true

# 白名单模式（推荐开，后面说）
allow-list=false
```

先修改需要的配置项。不确定用途时，查服务端附带的说明，保留默认值。

## 开白名单

开启白名单后，只有列出的玩家可以连接。

把 `server.properties` 的 `allow-list` 改成 `true`。在服务端控制台添加玩家：

```
allowlist add "玩家的 Xbox Gamertag"
allowlist list
```

名字带空格时保留双引号。直接编辑 `allowlist.json` 后，运行 `allowlist reload` 重新加载；XUID 可留给服务端在匹配玩家连接时填写。

## 端口转发

这是在你自己家电脑上搭服务器的步骤。如果你用的是云服务器，跳过这一步（云服务器去控制台的安全组里开放 19132 UDP 就行）。

在路由器后台（一般是 192.168.1.1）找到「端口转发」或者「虚拟服务器」：

```
外部端口: 19132
内部端口: 19132
协议: UDP
目标 IP: 你电脑的内网 IP（比如 192.168.1.5）
```

不知道内网 IP 多少的话，Windows 打开 cmd 输 `ipconfig`，找 `IPv4 地址`。

> 注意：国内很多家庭宽带没有公网 IP，属于大内网。这种情况下端口转发是没用的，可以用内网穿透，可以接着看[frp 配置笔记](/posts/intranet-penetration)。

## 让朋友连进来

服务器开起来之后，把你服务器的**公网 IP** 发给朋友。

在 MC 基岩版里选「服务器」→「添加服务器」：

```
服务器名称: 随便写
服务器地址: 你的公网 IP 或者域名
端口: 19132
```

朋友加进来之后就能一起玩了。

服务器命令行里：

```
stop    ← 关服
```

## 备份

在控制台执行 `stop`，等服务端正常退出，再备份 `worlds/`、配置文件和使用的行为包、资源包。更新服务端前先保留一份能还原的副本。

步骤与允许列表参考：[官方服务端入门](https://learn.microsoft.com/en-us/minecraft/creator/documents/bedrockserver/getting-started)。
