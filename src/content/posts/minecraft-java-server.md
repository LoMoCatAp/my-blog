---
title: "从零搭一个 Minecraft Java 版服务器"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "Java 版开服完整指南，从下载到配置到让朋友连进来，没有废话。"
published: true
---

上次写了基岩版的开服教程，这次补上 Java 版的。

Java 版服务器比基岩版成熟得多，插件生态丰富，性能优化空间也大。但也比基岩版麻烦一点——你得装 Java。

## 你需要什么

- **一台能长时间开着的电脑**（Windows / Linux / macOS 都行）
- **Java 21 或以上**（推荐用 **JDK 21 LTS**，不要用 Java 8）
- **端口 25565**（TCP，Java 版默认端口）

配置方面，Java 版比基岩版吃资源一些。对于原版，2 人玩 2G 内存就够了，5-8 人建议 4G。如果是模组服务器，要视模组的数量和人数来定。

## 装 Java

### Windows

去 https://adoptium.net 下载 **JDK 21 LTS**，安装包一路下一步就行。装完打开 cmd 验证：

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

去 https://mcversions.net 找到你要的版本。

几个主流选择：

| 服务端 | 特点 |
|--------|------|
| **Vanilla**（官方原版） | Mojang 官方，最纯净 |
| **Paper** | 性能最好，插件兼容性高，**最推荐** |
| **Spigot** | Paper 的前身，插件多但性能不如 Paper |
| **Fabric** | 玩模组的话选这个 |
| **Forge** | 老牌模组加载器，模组最多但性能一般 |

如果是纯生存服，直接下 **Paper** 就行。下载后得到一个 `.jar` 文件，比如 `paper-1.21.3.jar`。

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

打开生成的 `eula.txt`，把 `eula=false` 改成 `eula=true`，保存。

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

# 正版验证（建议开着，防熊孩子）
online-mode=true

# 视距（别超过 8，会卡）
view-distance=8
```

## 装插件

Paper 和 Spigot 支持插件。去 https://hangar.papermc.io 或 https://www.spigotmc.org/resources 下载 `.jar` 文件，丢进 `plugins/` 文件夹，重启服务器。

推荐几个插件：

| 插件 | 用途 |
|------|------|
| **EssentialsX** | 基础管理命令 |
| **LuckPerms** | 权限管理 |
| **CoreProtect** | 方块回滚，查谁偷了东西 |
| **GSit** | 可以坐下/躺下/趴下 |
| **Multiverse-Core** | 多世界管理 |
| **BlueMap** | 网页端地图查看 |

不用一次装太多，先跑起来再说。

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

- **开服之前先确定版本。** 1.20.x 和 1.21.x 的存档不互通，朋友们的客户端版本也得一致
- **定期备份。** 备份 `world/` 文件夹就行。设置个定时任务每天压缩打包一次
- **不要给太多人 OP。** OP 能执行任何指令，给错人一晚就能拆光你的服务器
- **开服第一次进游戏会卡一下。** 那是地图生成，等几秒就好
- **如果服务器越来越卡，装个 `spark` 插件**，输入 `/spark profiler` 就能看到哪出了问题

---
