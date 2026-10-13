---
title: "基岩版 /execute：身份、位置与条件执行"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "区分 as 和 at，再用 if、unless 和 run 组合指令。"
updated: "2026-10-11"
published: true
---

同一条指令，换一个执行者或执行位置，结果就会不同。`/execute` 用来调整这些条件，再通过 `run` 执行后面的指令。

先区分 `as` 和 `at`，再看条件判断与指令组合。下文使用基岩版 1.19.50 起的新语法；旧版指令不能直接照抄。

## 新版语法基础

新版 `execute` 的核心是**子命令链**。你可以把多个子命令串在一起，最后用 `run` 执行实际指令：

```
/execute <子命令1> <子命令2> ... run <指令>
```

最常用的几个子命令：

| 子命令 | 作用 |
|--------|------|
| `as <目标>` | 以指定实体的身份执行 |
| `at <目标>` | 在指定实体的位置执行 |
| `positioned <坐标>` | 在指定坐标执行 |
| `align <坐标轴>` | 对齐到方块网格 |
| `anchored <锚点>` | 使用实体的眼睛/脚部位置 |
| `facing <目标>` | 朝向指定目标 |
| `if \| unless` | 条件判断 |
| `rotated` | 指定旋转角度 |

## 基本用法

### as + at

```
/execute as @p at @s run say 你好
```

以最近的玩家的身份，在玩家的位置执行 `say` 命令。效果等价于玩家自己说了「你好」。

`as` 指定「谁」执行，`at` 指定「在哪」执行。可以分开用：

```
/execute as @e[type=zombie] at @s run summon lightning_bolt
```

每只僵尸的位置生成一道闪电。

```
/execute as @p at @e[type=creeper,c=1] run summon tnt
```

在最近一只苦力怕的位置生成 TNT，但执行身份是最近的玩家。

### positioned

```
/execute positioned 100 64 100 run setblock ~ ~ ~ diamond_block
```
在 (100, 64, 100) 放一个钻石块。

相对坐标也可以：

```
/execute as @p at @s positioned ~ ~10 ~ run say 我在玩家上方 10 格
```

### align

对齐到方块网格，消除小数坐标：

```
/execute align xyz run setblock ~ ~ ~ stone
```

会把执行位置向下取整对齐到最近的方块角上。

## 条件执行：if / unless

只有条件满足时，才执行后面的指令。

### if entity

```
/execute if entity @e[type=creeper] run say 附近有苦力怕！
```

检测到有苦力怕时执行。

```
/execute as @a at @s if entity @e[type=zombie,r=5] run say 附近 5 格内有僵尸！
```

每个玩家检测自己周围 5 格有没有僵尸。

### if block

```
/execute if block ~ ~-1 ~ stone run say 脚下是石头
```

检查执行位置下方的方块，符合条件时发送消息。

```
/execute as @a at @s if block ~ ~-1 ~ stone run effect @s speed 5 1
```

站在石头上的玩家获得速度效果。

### if score

先建立计分板目标：

```
/scoreboard objectives add kills dummy
/scoreboard players set @p kills 10
```

```
/execute as @p if score @s kills matches 10.. run say 杀了至少 10 个！
```

`matches` 语法：

| 写法 | 含义 |
|------|------|
| `matches 5` | 等于 5 |
| `matches 5..` | 大于等于 5 |
| `matches ..5` | 小于等于 5 |
| `matches 1..10` | 1 到 10 之间 |

### unless

`unless` 是 `if` 的反面——条件不满足时才执行。

```
/execute as @a unless entity @s[m=creative] run say 你不是创造模式
```

```
/execute as @a at @s unless block ~ ~-1 ~ water run effect @s weakness 5 1
```

没站在水里的玩家获得虚弱效果。

## 链式子命令

多个子命令可以串联，执行顺序从左到右：

```
/execute as @e[type=zombie] at @s positioned ^ ^ ^1 run summon lightning_bolt ~ ~ ~
```

每只僵尸面前 1 格生成一道闪电。

```
/execute as @a at @s if block ~ ~-1 ~ stone if block ~ ~1 ~ air run say 脚下是石头，头顶是空气
```

对每位玩家同时检查脚下和头顶两个条件。

## 朝向与旋转

新版 execute 支持朝向控制：

```
/execute as @p at @s facing entity @e[type=zombie,c=1] eyes run say 我正对着最近的僵尸
```

`facing` 改变后续指令使用的执行朝向，不会单独转动玩家视角。下面按朝向 (0, 64, 0) 的方向计算局部坐标：

```
/execute as @p at @s facing 0 64 0 run tp @s ^ ^ ^5
```

按该执行朝向，把玩家传送到前方 5 格。

## 再组合两个例子

```
/execute as @a at @s if block ~ ~-1 ~ stone run say 脚下是石头
/execute as @a at @s if entity @s[m=creative] run say 当前是创造模式
```

第一条检查位置，第二条检查执行者的游戏模式。

## 调试建议

新版 execute 报错通常会告诉你具体哪一段语法不对：

先从下面几个位置检查：

- 每个子命令后面必须跟它的参数，不能漏
- `run` 是最后一个子命令，后面跟要执行的指令
- `as` 和 `at` 可以分开用，但顺序要注意：先 `as` 再 `at`
- `if` 后面跟 `entity` / `block` / `score`，不能乱写
- 用 `@s` 引用当前执行者，不要弄混

---

排查长指令时，可以先单独测试每一段，再逐步组合。特别注意执行身份和执行位置是否符合预期。

语法参考：[Minecraft 官方指令文档](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commands/execute)。
