<p align="center">
 <img src="assets/lomocat-blog.svg" width="128" alt="LomoCat Blog Logo">
</p>

# LomoCat 的猫窝

<p align="center">
 <img src="https://img.shields.io/badge/Next.js-15.5-000000?logo=nextdotjs&logoColor=white" alt="Next.js 15">
 <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19">
 <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
 <img src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white" alt="SQLite">
 <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
 <img src="https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white" alt="Node.js 22">
 <img src="https://img.shields.io/badge/platform-Alibaba_Cloud-FF6A00?logo=alibabacloud&logoColor=white" alt="Alibaba Cloud">
</p>

**LomoCat 的猫窝** —— 我的个人博客。

使用 Next.js 15 (App Router) + React 19 + TypeScript 构建，SQLite 存储数据，Tailwind CSS 4 设计样式，部署在阿里云上。

博客地址：[lomocat.xyz](https://lomocat.xyz)

## 功能特色

- **Markdown 写作** — 用 frontmatter + Markdown 写文章，支持代码高亮、表格、GFM 语法
- **亮暗模式** — 主题切换，CSS 变量驱动
- **音乐播放器** — 右下角浮动播放器，支持循环与随机播放
- **评论区** — 支持嵌套回复、验证码、频率限制
- **今天吃什么** — 521 道菜，15 个菜系，多维度匹配推荐，抽签动画
- **全文搜索** — 搜索文章内容
- **访问统计** — 趋势图、热门页面、来源分析

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15 (App Router, SSG/ISR) |
| UI | React 19 + Tailwind CSS 4 |
| 语言 | TypeScript 5.7 |
| 数据库 | SQLite (better-sqlite3) |
| 内容 | Markdown (gray-matter + react-markdown) |
| 部署 | Alibaba Cloud ECS |
| SSL | Let's Encrypt |

## 项目结构

```
my-blog/
├── src/
│   ├── app/                    # App Router 页面与 API 路由
│   ├── components/             # 共享组件
│   ├── lib/                    # 工具库
│   ├── content/posts/          # Markdown 文章源文件
│   └── locales/                # i18n 翻译文件
├── public/
├── data/
│   └── blog.db                 # SQLite 数据库文件
├── scripts/
├── nginx.conf
└── blog.service
```

## 快速开始

### 环境要求
- Node.js 22+
- npm

### 本地开发

```bash
git clone git@github.com:LoMoCatAp/my-blog.git
cd my-blog
npm install
echo "BLOG_ADMIN_PASSWORD=your-password" > .env.local
npm run dev
```

访问 `http://localhost:3000`。

### 构建与启动

```bash
npm run build
npm start
```

## 部署

```bash
# 重启博客服务
sudo systemctl restart blog

# 查看日志
journalctl -u blog -f
```

## 文章

在 `src/content/posts/` 下创建 `.md` 文件：

```markdown
---
title: "文章标题"
date: "2026-06-20"
tags: ["标签1", "标签2"]
description: "文章摘要"
published: true
---

正文 Markdown 内容...
```

## 当前限制

- 更新内容需重新构建

## 作者

- **洛陌（Lomo）** — [lomocat.xyz](https://lomocat.xyz)
- GitHub: [@LoMoCatAp](https://github.com/LoMoCatAp)
