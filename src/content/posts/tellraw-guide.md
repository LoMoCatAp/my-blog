---
title: "MC 聊天栏排版指南：/tellraw 详解"
date: "2026-06-21"
tags: ["技术", "Minecraft", "游戏"]
description: "tellraw 能做的不只是发条消息。用 raw JSON 做排版、hover 预览、点击跳转——基岩版和 Java 版的语法都在这篇里。"
published: true
---

`/tellraw` 是用来发消息的，但它发的不是普通消息——是 JSON 格式的富文本消息。

跟 `/say` 和 `/msg` 的区别：`/say` 只能发纯文本，`/tellraw` 可以控制颜色、字体、加粗、斜体，还能让玩家点击文字时执行指令或悬浮时显示提示。

## 基础语法

### Java 版

```
/tellraw <目标> <raw JSON>
```

```
/tellraw @a {"text":"你好，世界！","color":"red"}
```

全服玩家看到一行红色文字。

### 基岩版

基岩版的语法多了个 `from` 参数（消息来源）：

```
/tellraw <目标> <raw JSON>
```

```
/tellraw @a {"rawtext":[{"text":"你好，世界！"}]}
```

两个版本的核心区别在于 JSON 结构——Java 版用 `text` 顶层键，基岩版用 `rawtext` 数组包起来。

## Java 版基础

### 纯文本

```
/tellraw @a "这是一段纯文本"
```

最简单的方式，直接写字符串。但不推荐，因为没法指定颜色。

### 带颜色的文本

```
/tellraw @a {"text":"红色文字","color":"red"}
/tellraw @a {"text":"蓝色加粗","color":"blue","bold":true}
```

可用的颜色：`black` `dark_blue` `dark_green` `dark_aqua` `dark_red` `dark_purple` `gold` `gray` `dark_gray` `blue` `green` `aqua` `red` `light_purple` `yellow` `white`

### 格式化

```
/tellraw @a {"text":"加粗","bold":true}
/tellraw @a {"text":"斜体","italic":true}
/tellraw @a {"text":"下划线","underlined":true}
/tellraw @a {"text":"删除线","strikethrough":true}
/tellraw @a {"text":"模糊","obfuscated":true}
```

## Java 版：extra 数组

要在一行里显示多种颜色和格式，用 `extra` 数组：

```
/tellraw @a ["",{"text":"我","color":"red"},{"text":"是","color":"yellow"},{"text":"彩","color":"green"},{"text":"虹","color":"blue"}]
```

或者用对象的 `extra` 写法：

```
/tellraw @a {"text":"","extra":[
  {"text":"红","color":"red"},
  {"text":"橙","color":"gold"},
  {"text":"黄","color":"yellow"},
  {"text":"绿","color":"green"}
]}
```

### 换行

用 `\n`：

```
/tellraw @a {"text":"第一行\n第二行"}
```

## Java 版：hover 与 click

这是 `/tellraw` 最实用的功能。

### hoverEvent（鼠标悬停显示）

```
/tellraw @a {"text":"悬停我","hoverEvent":{"action":"show_text","contents":"这是一段提示文字"}}
```

```
/tellraw @a {"text":"查看物品","hoverEvent":{"action":"show_item","contents":"{id:\"minecraft:diamond\",count:1}"}}
```

```
/tellraw @a {"text":"查看实体","hoverEvent":{"action":"show_entity","contents":{"name":"Steve","type":"minecraft:player","id":"..."}}}
```

### clickEvent（点击触发）

```
/tellraw @a {"text":"[点我执行]","clickEvent":{"action":"run_command","value":"/say 我被点了"}}
```

```
/tellraw @a {"text":"[打开链接]","color":"blue","underlined":true,"clickEvent":{"action":"open_url","value":"https://example.com"}}
```

```
/tellraw @a {"text":"[建议指令]","clickEvent":{"action":"suggest_command","value":"/give @s diamond"}}
```

`suggest_command` 不会直接执行，而是把指令填入玩家的聊天输入框，玩家自己按回车执行。

### 组合使用

hover 和 click 可以同时用：

```
/tellraw @a {
  "text":"[传送]",
  "color":"green",
  "bold":true,
  "hoverEvent":{"action":"show_text","contents":"点击传送到出生点"},
  "clickEvent":{"action":"run_command","value":"/spawn"}
}
```

## Java 版：完整示例

一个带标题和按钮的排版：

```
/tellraw @a {"text":"\n"}
/tellraw @a {"text":" ╔══════════════════╗","color":"dark_gray"}
/tellraw @a {"text":" ║ ","color":"dark_gray","extra":[
  {"text":"服务器菜单","color":"gold","bold":true},
  {"text":"                ║","color":"dark_gray"}
]}
/tellraw @a {"text":" ╠══════════════════╣","color":"dark_gray"}
/tellraw @a {"text":" ║ ","color":"dark_gray","extra":[
  {"text":"[🎮 传送大厅]","color":"aqua","hoverEvent":{"action":"show_text","contents":"点击传送到大厅"},"clickEvent":{"action":"run_command","value":"/warp大厅"}},
  {"text":"      ║","color":"dark_gray"}
]}
/tellraw @a {"text":" ║ ","color":"dark_gray","extra":[
  {"text":"[⚔️ 小游戏]","color":"green","hoverEvent":{"action":"show_text","contents":"点击查看小游戏列表"},"clickEvent":{"action":"run_command","value":"/games"}},
  {"text":"        ║","color":"dark_gray"}
]}
/tellraw @a {"text":" ║ ","color":"dark_gray","extra":[
  {"text":"[📦 领取奖励]","color":"gold","hoverEvent":{"action":"show_text","contents":"每日奖励"},"clickEvent":{"action":"run_command","value":"/reward"}},
  {"text":"      ║","color":"dark_gray"}
]}
/tellraw @a {"text":" ╚══════════════════╝","color":"dark_gray"}
```

## 基岩版：rawtext 数组

基岩版的 JSON 结构跟 Java 版不一样。所有内容包在 `rawtext` 数组里：

```
/tellraw @a {"rawtext":[{"text":"§c红色 §a绿色 §b蓝色"}]}
```

基岩版可以用 `§` 颜色代码（Java 版也可以，但 JSON 形式更推荐）：

| 代码 | 颜色 |
|------|------|
| `§0` | 黑色 |
| `§1` | 深蓝 |
| `§a` | 亮绿 |
| `§b` | 亮蓝 |
| `§c` | 亮红 |
| `§e` | 黄色 |
| `§l` | 加粗 |
| `§n` | 下划线 |

```
/tellraw @a {"rawtext":[{"text":"§l§6服务器公告\n"},{"text":"§7欢迎来到 §b生存世界 §7！\n"},{"text":"§a[点击进入]","clickEvent":{"action":"run_command","value":"/warp生存"}}]}
```

### 基岩版：selector 和 score

```
/tellraw @a {"rawtext":[
  {"text":"欢迎 "},
  {"selector":"@p"},
  {"text":" 加入游戏！"}
]}
```

`selector` 会自动替换为玩家的名字。

```
/tellraw @a {"rawtext":[
  {"text":"你的分数： "},
  {"score":{"name":"@p","objective":"kills"}}
]}
```

显示玩家的 kills 计分板分数。

### 基岩版：clickEvent

基岩版同样支持 `clickEvent`：

```
/tellraw @a {"rawtext":[
  {"text":"[传送] ","color":"green"},
  {"text":"[商店]","color":"gold","clickEvent":{"action":"run_command","value":"/shop"}}
]}
```

## 版本对比

| 功能 | Java 版 | 基岩版 |
|------|---------|--------|
| JSON 结构 | `{"text":"..."}` | `{"rawtext":[{"text":"..."}]}` |
| extra 数组 | ✅ | ❌（用 rawtext 代替） |
| 颜色代码 `§` | ✅ | ✅ |
| `selector` | ✅ | ✅ |
| `score` | ✅ | ✅ |
| `hoverEvent` | ✅ | ❌ |
| `clickEvent` | ✅ | ✅ |
| `open_url` | ✅ | ❌ |
| `suggest_command` | ✅ | ❌ |

主要区别：基岩版不支持 `hoverEvent`，不支持 `open_url` 和 `suggest_command`，但基础的 `run_command` 和颜色代码是通用的。

## 一些技巧

- **太长分多条发。** `/tellraw` 没有长度限制，但聊天框一次显示太长会被截断，可以拆成多个 `/tellraw`
- **记住转义引号。** 在命令方块或函数文件里写 JSON 时，内部引号要用 `\"` 转义
- **基岩版用 `§` 更省事。** 写 `rawtext` 数组比 Java 版的嵌套结构简单很多，能用 `§` 解决的就不用写一大堆 JSON
- **函数文件里更好维护。** 长的 tellraw 放在 `.mcfunction` 文件里写，比在游戏里手打方便
- **先写 JSON 再转成一行。** 用在线 JSON 格式化器写好结构，压缩成一行再塞进指令
- **Java 版的 `tellraw` 生成器网上有很多。** 搜索 Minecraft tellraw generator，可以可视化编辑

---

最后补一句：`/tellraw` 和 `/title` 用同一套 JSON 格式。学会了 tellraw，title 也就自然会了。
