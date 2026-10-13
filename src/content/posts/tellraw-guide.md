---
title: "用 /tellraw 排版聊天消息"
date: "2026-06-21"
tags: ["技术", "Minecraft", "游戏"]
description: "分别整理 Java 版文本组件和基岩版 rawtext 的写法。"
updated: "2026-10-11"
published: true
---

`/tellraw` 用文本组件发送消息。Java 版与基岩版的结构不同，下面分开写，避免把一个版本的语法直接复制到另一个版本。

Java 版示例按 1.21.4 的 JSON 文本组件格式书写。1.21.5 起改为 SNBT，并调整了交互事件字段，使用新版时请看[官方变更说明](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-5)。基岩版部分使用 `rawtext`。

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

基岩版在目标后直接接 `rawtext` JSON：

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

仅发送文字时可使用字符串；需要颜色或格式时使用对应版本的文本组件。

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

以下交互事件用于 Java 版文本组件。

### hoverEvent（鼠标悬停显示）

```
/tellraw @a {"text":"悬停我","hoverEvent":{"action":"show_text","contents":"这是一段提示文字"}}
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
  "text":"[在线玩家]",
  "color":"green",
  "bold":true,
  "hoverEvent":{"action":"show_text","contents":"查看在线玩家"},
  "clickEvent":{"action":"run_command","value":"/list"}
}
```

## 基岩版：rawtext 数组

基岩版的 JSON 结构跟 Java 版不一样。所有内容包在 `rawtext` 数组里：

```
/tellraw @a {"rawtext":[{"text":"§c红色 §a绿色 §b蓝色"}]}
```

基岩版可以在文本中使用 `§` 颜色和格式代码：

| 代码 | 颜色 |
|------|------|
| `§0` | 黑色 |
| `§1` | 深蓝 |
| `§a` | 亮绿 |
| `§b` | 亮蓝 |
| `§c` | 亮红 |
| `§e` | 黄色 |
| `§l` | 加粗 |

```
/tellraw @a {"rawtext":[{"text":"§l§6服务器公告\n"},{"text":"§7欢迎来到 §b生存世界 §7！\n"},{"text":"§a祝你玩得开心！"}]}
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

## 版本对比

| 功能 | Java 版 | 基岩版 |
|------|---------|--------|
| JSON 结构 | `{"text":"..."}` | `{"rawtext":[{"text":"..."}]}` |
| extra 数组 | ✅ | ❌（用 rawtext 代替） |
| 颜色设置 | `color` 字段 | 文本内的 `§` 代码 |
| `selector` | ✅ | ✅ |
| `score` | ✅ | ✅ |
| `hoverEvent` | ✅ | ❌ |
| 点击事件 | ✅ | ❌ |
| `open_url` | ✅ | ❌ |
| `suggest_command` | ✅ | ❌ |

基岩版 `rawtext` 不支持 Java 文本组件里的点击和悬停事件。

## 写长消息时

先检查结构，再把示例整理成一条命令。JSON 字符串里面的双引号需要转义，结构本身的引号不用全部加反斜杠。放进 `.mcfunction` 时，一条指令占一行，并去掉开头的 `/`。

消息较长时分条发送，逐条测试颜色、选择器和分数。
---

需要在屏幕标题中显示文本时，再核对对应版本的 `/title` 或 `/titleraw` 格式。

基岩版结构参考：[官方 Raw Message JSON 文档](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/rawmessagejson)。
