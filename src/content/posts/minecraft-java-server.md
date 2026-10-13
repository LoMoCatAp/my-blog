---
title: "搭一个 Minecraft Java 版服务器"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "准备 Java 环境，启动服务端，配置服务器和插件，再让朋友连接。"
updated: "2026-10-11"
published: true
---

接着基岩版开服笔记，这篇整理 Java 版的步骤。

先准备与目标版本匹配的 Java 环境，再启动服务端。插件和外部连接放在后面处理。

## 你需要什么

- **一台能长时间开着的电脑**（Windows / Linux / macOS 都行）
- **Java 21**（本文以 Paper 1.21.3 为例，其他版本查对应要求）
- **端口 25565**（TCP，Java 版默认端口）

内存用量受视距、地图生成、插件和人数影响。下面脚本只是配置示例，最大堆内存要为系统留出余量。

## 装 Java

### Windows

去 https://adoptium.net 下载 **JDK 21 LTS**，安装时留意 Java 版本与环境变量设置。装完打开 cmd 验证：

```
java -version
```

如果显示 `openjdk version "21"` 之类的就对了。

### Linux

```bash
# Ubuntu / Debian
sudo apt install openjdk-21-jdk

# CentOS / Alibaba Cloud Linux
sudo yum install java-21-openjdk
```

## 下载服务端

从[官方服务端页面](https://www.minecraft.net/en-us/download/server)或 [Paper 官网](https://papermc.io/downloads/paper)下载所需版本，避免混用服务端与客户端版本。

几个主流选择：

| 服务端 | 特点 |
|--------|------|
| **Vanilla**（官方原版） | 官方服务端 |
| **Paper** | 支持插件，提供性能与配置调整选项 |
| **Spigot** | 支持 Bukkit/Spigot 插件 |
| **Fabric** | 玩模组的话选这个 |
| **Forge** | 根据模组所需的加载器和版本选择 |

如果需要插件，可以考虑 **Paper**；仅需要原版行为时，也可选择官方服务端。下载后得到一个 `.jar` 文件，比如 `paper-1.21.3.jar`。

## 启动服务器

新建一个文件夹放服务器文件，把 `.jar` 丢进去。新建一个启动脚本：

### Windows（run.bat）

```bat
java -Xms2G -Xmx4G -jar paper-1.21.3.jar nogui
pause
```

### Linux / macOS（run.sh）

```bash
#!/bin/bash
java -Xms2G -Xmx4G -jar paper-1.21.3.jar nogui
```

其中 `-Xms2G` 是最小内存，`-Xmx4G` 是最大内存。根据你的机器调整。

第一次启动会生成配置文件，然后自动退出。这是因为你需要先同意 EULA：

打开生成的 `eula.txt`，阅读文件中的协议链接，同意后把 `eula=false` 改成 `eula=true`，保存。

再启动一次，这次应该能看到：

```
[Server thread/INFO]: Done (XX.XXXs)! For help, type "help"
```

看到这行说明服务器起来了。

## 配置服务器

关掉服务器（命令行输 `stop`），编辑 `server.properties`：

```properties
# 服务器名
motd=一群人的生存服

# 最大玩家数
max-players=10

# 游戏模式 survival / creative / adventure
gamemode=survival

# 难度 peaceful / easy / normal / hard
difficulty=normal

# 正版验证
online-mode=true

# 视距，按实际负载调整
view-distance=8
```

## 装插件

Paper 和 Spigot 支持插件。去 https://hangar.papermc.io 或 https://www.spigotmc.org/resources 下载 `.jar` 文件，丢进 `plugins/` 文件夹，重启服务器。

按用途选择插件：

| 插件 | 用途 |
|------|------|
| **EssentialsX** | 基础管理命令 |
| **LuckPerms** | 权限管理 |
| **CoreProtect** | 方块回滚，查询方块操作记录 |
| **GSit** | 可以坐下/躺下/趴下 |
| **Multiverse-Core** | 多世界管理 |
| **BlueMap** | 网页端地图查看 |

先确认基础服务端能正常连接，再逐个添加插件，便于定位冲突。

## 端口转发

自家电脑搭的话需要去路由器后台做端口转发。如果用的云服务器，去控制台安全组开放 TCP 25565 就行。

路由器后台（一般是 192.168.1.1）：

```
外部端口: 25565
内部端口: 25565
协议: TCP
目标 IP: 你电脑的内网 IP
```

不知道内网 IP？Windows 打开 cmd 输 `ipconfig`，找 `IPv4 地址`。

## 让朋友连进来

把你的**公网 IP** 发给朋友，在 Minecraft Java 版里选「多人游戏」→「添加服务器」：

```
服务器地址: 你的公网 IP
```

然后就能看到了。


服务器控制台输 `stop` 关服。

## 几个小技巧

- **开服之前先确定版本。** 服务端和客户端版本要匹配。升级可能改动存档格式，升级前备份，不要直接尝试降级原存档
- **定期备份。** 停服后备份所有世界目录、配置和插件数据；有多世界插件时也要包含额外世界。定期检查备份能否恢复
- **不要给太多人 OP。** OP 能执行任何指令，应只授予需要管理权限的人
- **如果服务器越来越卡，装个 `spark` 插件**，输入 `/spark profiler` 就能看到哪出了问题

---

Java 版本对应关系参考：[Paper 安装文档](https://docs.papermc.io/paper/getting-started/)。
