---
title: "内网穿透指南：没有公网 IP 也能开服"
date: "2026-06-20"
tags: ["技术", "Minecraft", "运维"]
description: "家庭宽带的典型场景，用 frp 把内网服务暴露到公网，开服、建站、远程访问都能用。"
published: true
---

前两篇写了 MC 开服教程，有个问题没来得及说——很多人家里的宽带**没有公网 IP**。

运营商分配的是大局域网 IP（100.x.x.x 或 10.x.x.x），端口转发做了也没用，外面连不进来。这种情况就需要内网穿透。

常见的方案有这么几种：

| 方案 | 速度 | 费用 | 难度 |
|------|------|------|------|
| **frp** | ⭐⭐⭐⭐ | 需要一台云服务器 | ⭐⭐ |
| **Tailscale** | ⭐⭐⭐ | 免费 | ⭐ |
| **Ngrok** | ⭐⭐ | 免费版有限制 | ⭐ |
| **SakuraFrp** | ⭐⭐⭐ | 免费有流量限制 | ⭐ |

最推荐的是 **frp**——稳定、快、自己掌控。前提是你有一台云服务器。没有的话可以去搞个最便宜的乞丐版，1 核 1G 就够跑了。

本文以 frp 为例。

## frp 是什么

frp 由两个部分组成：

- **服务端 frps** — 放在你的云服务器上
- **客户端 frpc** — 放在你家电脑上（搭 MC 服务器的那台）

你家电脑连上云服务器后，别人访问云服务器的某个端口，流量会自动转发到你家电脑上。

## 下载 frp

去 GitHub releases 页面下载：https://github.com/fatedier/frp/releases

注意系统架构：

| 你的设备 | 下载哪个 |
|----------|---------|
| 云服务器（Linux x64） | `frp_X.X.X_linux_amd64.tar.gz` |
| 家电脑（Windows） | `frp_X.X.X_windows_amd64.zip` |
| 树莓派 | `frp_X.X.X_linux_arm64.tar.gz` |

两边版本要一致。

## 配置服务端（云服务器）

上传到云服务器并解压：

```bash
tar -xzf frp_0.61.0_linux_amd64.tar.gz
cd frp_0.61.0_linux_amd64
```

编辑 `frps.toml`：

```toml
bindPort = 7000
```

就一行。`bindPort` 是 frp 的控制端口，你家电脑通过这个端口连上来。

然后启动：

```bash
./frps -c frps.toml
```

看到 `service started` 就成功了。

如果你想长期运行，建议配成 systemd 服务：

```bash
sudo vim /etc/systemd/system/frps.service
```

```ini
[Unit]
Description=frp server
After=network.target

[Service]
Type=simple
ExecStart=/root/frp_0.61.0_linux_amd64/frps -c /root/frp_0.61.0_linux_amd64/frps.toml
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now frps
```

云服务器的安全组也需要放开两个端口：
- **7000/tcp** — frp 控制端口
- **你后面要映射的端口**（比如 MC 的 25565）

## 配置客户端（家电脑）

解压 frp，编辑 `frpc.toml`：

```toml
serverAddr = "你的云服务器公网IP"
serverPort = 7000

[[proxies]]
name = "mc-server"
type = "tcp"
localIP = "127.0.0.1"
localPort = 25565
remotePort = 25565
```

解释一下：

- `serverAddr` — 你家电脑要连的云服务器 IP
- `localPort` — 你家电脑上 MC 服务器的端口
- `remotePort` — 外面访问云服务器的哪个端口

启动：

```bash
# Linux
./frpc -c frpc.toml

# Windows 双击 frpc.exe（或者 cmd 里运行）
frpc.exe -c frpc.toml
```

看到 `login to server success` 就说明连上了。

## 让朋友连进来

现在你的朋友不需要连你家 IP 了，直接连你的**云服务器 IP**：

```
服务器地址: 你的云服务器公网IP
端口: 25565
```

流量路径：朋友 → 云服务器:25565 → frp 隧道 → 你家电脑:25565 → MC 服务器

## 映射多个服务

frp 支持同时映射多个端口。比如你又要开 MC 又要开网站：

```toml
serverAddr = "你的云服务器公网IP"
serverPort = 7000

[[proxies]]
name = "mc-server"
type = "tcp"
localIP = "127.0.0.1"
localPort = 25565
remotePort = 25565

[[proxies]]
name = "web-site"
type = "tcp"
localIP = "127.0.0.1"
localPort = 3000
remotePort = 8080
```

这样外面访问 `云服务器IP:8080` 就到了你家电脑的 3000 端口。

## 几个常用场景的端口

| 场景 | 默认端口 |
|------|---------|
| Minecraft Java 版 | 25565 |
| Minecraft 基岩版 | 19132（UDP） |
| HTTP 网站 | 80 |
| HTTPS 网站 | 443 |
| SSH 远程连接 | 22 |
| RDP 远程桌面 | 3389 |

注意基岩版是 **UDP 协议**，frp 配置里要把 `type = "tcp"` 改成 `type = "udp"`。

## frp 的一些注意点

- **免费云服务器可能没有公网 IP。** 买的时候看清是不是「弹性公网 IP」，阿里云/腾讯云最便宜的轻量服务器一般都有
- **流量走云服务器。** 你云服务器的带宽决定了所有人的体验。1Mbps 带宽只够 1-2 人玩 MC，3-4 人的话建议 5Mbps 以上
- **frp 本身几乎不占资源。** 1 核 512M 的服务器跑 frps 带几个人完全没问题
- **Windows 上建议把 frpc 注册成服务。** 用 `nssm` 工具，这样开机自启、后台运行，不用一直开着 cmd 窗口
- **frp 支持加密和压缩。** 在 `frpc.toml` 的 `[[proxies]]` 里加两行：
  ```toml
  transport.useEncryption = true
  transport.useCompression = true
  ```
  会消耗一点 CPU，但能省带宽。

---

其他方案简单说两句：

- **Tailscale** 最适合**几个人自己玩**。装了就完事，不需要云服务器。缺点是朋友也得装 Tailscale，不是直接连 IP
- **SakuraFrp** 国内有免费节点，注册即用，适合不想折腾服务器的。但免费版速度和稳定性看运气
- **Ngrok** 国外服务，国内延迟高，不太推荐

有什么问题评论区问。
