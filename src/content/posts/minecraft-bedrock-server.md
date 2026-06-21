---
title: "手把手搭一个 Minecraft 基岩版服务器"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "从零开始搭一个基岩版服务器，叫上朋友一起玩。"
published: true
---

前阵子几个朋友说要一起玩 MC，问我能搭个服务器不。我说行吧，反正服务器闲着也是闲着。

搞完之后发现其实挺简单的，网上教程大多写得又长又啰嗦，我整理一下关键步骤。

## 准备工作

你需要：

- **一台电脑/服务器**（能长时间开着就行，Windows / Linux）
- **Java 17 或以上**（服务器是 Java 写的，就算基岩版也需要）
- **开放端口 19132**（UDP，这个是基岩版的默认端口）

配置方面。基岩版服务器其实挺轻量的，不加Addon，2核 2G的服务器大概够三四个人玩。

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

### Linux

```bash
chmod +x bedrock_server
./bedrock_server
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
white-list=false
```

看懂英文就行，不认识的关键词别乱改。

## 开白名单

白名单开启，只有你允许的人能进来，杜绝野人乱入。

把 `server.properties` 里的 `white-list` 改成 `true`，然后编辑 `allowlist.json`：

```json
[
  {
    "name": "你的游戏ID",
    "xuid": "你的XUID"
  }
]
```

XUID 怎么找：

1. 先进一次你的服务器（关掉白名单先进）
2. 然后去 https://cxkes.me/xuid 输入你的游戏 ID
3. 拿到 XUID 填进去

或者更暴力的方法——不开白名单，设个密码。基岩版虽然原生不支持密码，但可以用插件，不过那是后话了。

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

> 注意：国内很多家庭宽带没有公网 IP，属于大内网。这种情况下端口转发是没用的，可以用内网穿透，这个以后再写一篇说。

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
save    ← 强制保存
```

## 一点碎碎念

我的服务器跑了快一个月了，最头疼的不是技术问题，是朋友们的时间凑不到一起……服务器空转了快 20 天电费都浪费了😂

另外推荐几个我觉得好用的东西：

- **Chunkbase** — 在线查群系、找村庄找神殿，建家选址神器
- **Amulet Editor** — 可以编辑存档，把朋友的房子搬到你旁边
- **Geyser + Floodgate** — 如果你想搞一个 Java 版和基岩版都能连的跨平台服，但是那又是另一篇文章的故事了

---