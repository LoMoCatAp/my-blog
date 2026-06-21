# LomoCat's Blog — 开发者使用指南

> 技术栈：Next.js 15 + SQLite (better-sqlite3) + Tailwind CSS
> 部署于阿里云，通过 systemd + nginx 托管

---

## 目录

1. [项目结构](#1-项目结构)
2. [本地开发](#2-本地开发)
3. [部署运维](#3-部署运维)
4. [内容管理](#4-内容管理)
5. [API 接口](#5-api-接口)
6. [数据库](#6-数据库)
7. [自定义功能](#7-自定义功能)
8. [国际化 (i18n)](#8-国际化-i18n)
9. [性能优化](#9-性能优化)

---

## 1. 项目结构

```
my-blog/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页（文章列表）
│   │   ├── layout.tsx          # 根布局
│   │   ├── not-found.tsx       # 404 页面
│   │   ├── posts/[slug]/       # 文章详情页
│   │   │   ├── page.tsx        # SSG 文章页
│   │   │   └── MarkdownRenderer.tsx  # Markdown 渲染（含代码复制）
│   │   ├── archive/            # 文章归档
│   │   ├── search/             # 全文搜索
│   │   ├── tags/               # 标签页
│   │   ├── links/              # 友链
│   │   ├── about/              # 关于
│   │   ├── food/               # 今天吃什么
│   │   ├── server/             # 服务器状态
│   │   ├── admin/              # 管理后台
│   │   │   ├── page.tsx        # 登录页
│   │   │   ├── posts/          # 文章管理
│   │   │   ├── food/           # 美食管理
│   │   │   ├── links/          # 友链管理
│   │   │   ├── music/          # 音乐管理
│   │   │   ├── site/           # 站点设置
│   │   │   ├── analytics/      # 访问统计
│   │   │   └── api/            # 后台 API
│   │   └── api/                # 公开 API
│   │       ├── comments/       # 评论 CRUD
│   │       ├── captcha/        # 验证码生成
│   │       ├── food/           # 美食数据
│   │       ├── music/          # 音乐数据
│   │       ├── search/         # 搜索
│   │       ├── views/          # 阅读量
│   │       ├── analytics/      # 访问统计
│   │       ├── server/         # 服务器状态
│   │       └── links/          # 友链数据
│   ├── components/
│   │   ├── Header.tsx          # 导航栏（含 i18n 切换）
│   │   ├── PostCard.tsx        # 文章卡片（含 3D 倾斜 + 滚动淡入）
│   │   ├── Comments.tsx        # 评论组件（支持回复、验证码）
│   │   ├── MusicPlayer.tsx     # 音乐播放器（含进度条/音量/模式切换）
│   │   ├── PawDecorations.tsx  # 背景猫爪装饰（含滚动视差）
│   │   ├── TableOfContents.tsx # 文章目录（桌面端左侧固定）
│   │   ├── ShareLink.tsx       # 分享链接
│   │   ├── CodeCopyButton.tsx  # 代码复制
│   │   ├── ThemeProvider.tsx   # 主题切换
│   │   └── I18nProvider.tsx    # 国际化上下文
│   ├── lib/
│   │   ├── db.ts              # SQLite 数据库
│   │   ├── posts.ts           # 文章读取
│   │   ├── i18n.ts            # 国际化函数
│   │   ├── captcha.ts         # 验证码生成/验证
│   │   ├── toc.ts             # 目录提取
│   │   ├── time.ts            # 友好时间显示
│   │   └── site-content.ts    # 站点内容
│   ├── content/posts/         # Markdown 文章
│   └── locales/               # i18n 翻译
│       ├── zh.json
│       └── en.json
├── public/
│   ├── music/                 # 音乐文件
│   ├── favicon.svg            # 图标
│   └── (其他静态资源)
├── data/
│   └── blog.db                # SQLite 数据库文件
├── scripts/
│   └── compress-music.js      # 音乐压缩工具
├── nginx.conf                 # Nginx 配置
└── blog.service               # systemd 服务配置
```

---

## 2. 本地开发

### 环境要求
- Node.js 22+
- npm

### 启动开发服务器

```bash
cd my-blog
npm install
npm run dev
```

访问 `http://localhost:3000`。开发模式下改文件即时生效，无需重启。

### 构建生产版本

```bash
npm run build        # 完整构建（含类型检查）
npx next build --no-lint  # 快速构建（跳过类型检查）
npm start            # 启动生产服务器（端口 3000）
```

---

## 3. 部署运维

### systemd 服务（服务器上）

```bash
# 状态
systemctl status blog

# 重启
sudo systemctl restart blog

# 查看日志
journalctl -u blog -f
```

### Nginx 配置

见 `nginx.conf`，HTTPS 通过 Let's Encrypt 自动续签。实际配置在 `/etc/nginx/conf.d/blog.conf`。

### 管理后台

访问 `/admin`，登录密码通过环境变量 `BLOG_ADMIN_PASSWORD` 设置（默认 `admin123`）。

### 数据库维护

数据库自动每 6 小时 checkpoint WAL + 清理 30 天前的访问记录（逻辑在 `src/lib/db.ts` 的 `getDb()` 中）。

### 服务器状态页

访问 `/server`，每 15 秒自动刷新，显示 CPU/内存/磁盘/网络/进程/服务等状态。

---

## 4. 内容管理

### 文章

在 `src/content/posts/` 下创建 `.md` 文件，格式：

```markdown
---
title: "文章标题"
date: "2026-06-20"
tags: ["标签1", "标签2"]
description: "摘要"
published: true
image: "https://..."  # 可选，自定义封面图
---

正文 Markdown 内容...
```

通过后台 `/admin/posts` → 写新文章 / 编辑 / 删除。

发布后需点击「重新构建」使改动生效（运行 `next build`）。

### 封面图

系统内置 10 张猫咪图片（来自 thecatapi.com），按 slug hash 分配。
每篇文章也可在 frontmatter 中用 `image:` 自定义。

### 音乐

- 后台 `/admin/music` 上传 MP3 文件
- 上传后运行 `npm run compress-music` 自动压缩到 128kbps
- 音乐播放器在右下角浮动，支持：进度拖拽、音量调节、列表循环/单曲循环/随机播放

### 美食数据库

后台 `/admin/food` 管理，支持：
- 添加菜（设置味型/食材/做法/菜系/饱腹感/心情/忌口标签）
- 编辑/删除
- 搜索 + 味型/菜系/食材筛选
- 分页（每页 30 条）

前端 `/food` 是「今天吃什么」抽签器，包含：
- 521 道菜，覆盖 15 个菜系
- 按味型/食材/做法/菜系/饱腹感/心情多维度匹配
- 红线过滤（绝对忌口）
- 抽奖机动画效果

### 友链

后台 `/admin/links` 管理，前端 `/links` 展示。

### 评论

- 每篇文章底部有评论区
- 支持嵌套回复（最多 4 层）
- 数学验证码 + Honeypot + 60s 频率限制
- 管理后台每篇文章编辑页底部可管理评论

### 站点设置

后台 `/admin/site`，可设置首页大标题和副标题。

### 访问统计

后台 `/admin/analytics`，显示：
- 今日访问/页面数
- 近 14 天趋势图
- 本周热门页面
- 本周来源网站

---

## 5. API 接口

### 公开 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/comments?slug=xxx` | GET | 获取评论（树形结构） |
| `/api/comments` | POST | 发表评论（需验证码） |
| `/api/comments` | DELETE | 删除评论（需 admin token） |
| `/api/captcha` | GET | 获取验证码（数学题 + token） |
| `/api/food` | GET | 美食推荐引擎 |
| `/api/food` | POST | 添加食物（需 admin token） |
| `/api/food` | PUT | 编辑食物（需 admin token） |
| `/api/food` | DELETE | 删除食物（需 admin token） |
| `/api/music` | GET | 获取音乐列表 |
| `/api/search?q=xxx` | GET | 全文搜索 |
| `/api/views` | GET | 阅读量统计 |
| `/api/links` | GET | 友链列表 |
| `/api/analytics/track` | POST | 记录访问 |
| `/api/analytics/stats` | GET | 统计数据 |
| `/api/server` | GET | 服务器状态 |

### 管理 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/admin/api/login` | POST | 登录（返回 token） |
| `/admin/api/posts` | GET/POST | 文章 CRUD |
| `/admin/api/rebuild` | POST | 触发 `next build` |
| `/admin/api/verify` | POST | 验证 token |

### Food API 参数

```
GET /api/food?flavors=麻辣,酸辣&ingredients=鱼&methods=煮&cuisines=川湘
             &satiety=汤水多&mood=放纵&avoid=香菜,内脏&count=6
```

返回排序后的推荐结果。不传参数时默认推荐酱香/家常类。

添加 `?all=true` 跳过推荐逻辑，返回全部菜品（用于管理后台）。

---

## 6. 数据库

使用 SQLite，文件位于 `data/blog.db`。

### 表结构

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `views` | 文章阅读量 | slug, count |
| `comments` | 评论 | id, slug, name, content, parent_id, created_at |
| `foods` | 美食数据库 | id, name, flavors, ingredients, methods, cuisines, satiety, mood, avoid_tags |
| `music` | 音乐 | id, title, artist, filename |
| `links` | 友链 | id, name, url, description, sort_order |
| `analytics_events` | 访问记录 | id, path, referrer, date, page_title |
| `site_content` | 站点配置 | key, value |

### 维护

- WAL 自动 checkpoint：每 6 小时
- 旧 analytics 清理：超过 30 天自动删除
- 手动维护：调用 `maintenanceDb()`

---

## 7. 自定义功能

### 主题系统

亮色/暗色模式通过 `ThemeProvider` 管理，CSS 变量定义在 `globals.css` 的 `:root` 和 `html.dark` 中。

主题切换按钮在导航栏右侧（🌙/☀️ SVG 图标）。

### 猫爪背景

`PawDecorations` 组件生成随机猫爪 SVG 背景：
- 共 192 个位置，边缘大/多，中心小/少
- `pawFloat` CSS 动画实现漂浮
- 滚动视差效果（数据通过 `data-depth` 属性存在 DOM 上，直接操作 transform）

### 音乐播放器

右下角浮动，功能：
- 播放/暂停、上一首/下一首
- 进度条（点击跳转）
- 音量滑块
- 三种模式：单曲循环 / 列表循环 / 随机
- 播放列表展开/收起
- 可拖拽移动位置
- 拖拽时自动屏蔽点击（避免误触）

### 文章卡片效果

- 滚动淡入（从侧面滑入，方向由左右列决定）
- hover 3D 跟随鼠标倾斜（`perspective(900px) rotateX/Y`）
- 标签悬停展开
- 阴影加深上浮

### 页面

| 路由 | 说明 |
|------|------|
| `/` | 首页，两列交错排列 |
| `/archive` | 归档，按年/月分组 |
| `/food` | 今天吃什么抽签 |
| `/server` | 服务器状态监控 |
| `/search` | 全文搜索 |
| `/tags` | 标签页 |
| `/links` | 友链 |
| `/about` | 关于页 |
| `/admin` | 管理后台登录 |
| `/admin/posts` | 文章管理 |
| `/admin/food` | 美食管理 |
| `/admin/music` | 音乐管理 |
| `/admin/links` | 友链管理 |
| `/admin/site` | 站点设置 |
| `/admin/analytics` | 访问统计 |

---

## 8. 国际化 (i18n)

支持中/英切换，通过 `I18nProvider` 管理。

翻译文件在 `src/locales/`：
- `zh.json` — 中文
- `en.json` — 英文

添加新翻译：
1. 在 `zh.json` 和 `en.json` 中添加 key-value
2. 在组件中使用 `const { t } = useI18n()` 和 `t("your.key")`

翻译内容覆盖：
- 导航栏（首页/搜索/归档/吃什么/标签/友链/关于/RSS）
- 评论区
- 搜索页
- 音乐播放器
- 文章目录
- 吃什么页面（含所有选项标签）

---

## 9. 性能优化

### 构建速度

- 完整构建（含 lint）：`npm run build`（~2 分钟）
- 快速构建：`npx next build --no-lint`（~1 分钟）
- 开发模式：`npm run dev`（即时生效）

### 音乐压缩

上传音乐后运行 `npm run compress-music`：
- 使用 ffmpeg 重新编码到 128kbps
- 已压缩的文件通过 `.compressed` 标记文件跳过
- 当前音乐：8.7MB（压缩前 ~20MB）

### 数据库

- WAL 模式提升并发性能
- 每 6 小时自动 checkpoint
- 30 天前的分析数据自动清理

### 图片

- 文章封面图来自外部 CDN（thecatapi.com）
- 音乐播放器只为懒加载（仅播放时设置 src）
- 3D 倾斜使用 GPU 加速的 `transform` + `perspective`

---

## 常见命令速查

```bash
# 本地开发
npm run dev

# 构建
npx next build --no-lint

# 部署重启
sudo systemctl restart blog

# 查看日志
journalctl -u blog -f --since "10 min ago"

# 压缩音乐
npm run compress-music

# 数据库维护（手动）
node -e "require('./src/lib/db').maintenanceDb()"
```
