---
title: "基岩版 /execute 指令详解（1.20.80+ 新版语法）"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "基岩版 1.20.80 之后 /execute 的语法已经和 Java 版差不多了。这篇完整讲解新版 execute 的各种用法。"
published: true
---

基岩版从 1.20.80 开始，`/execute` 的语法做了大改，现在和 Java 版基本一致了。老版那种 `detect` + 单条命令的写法已经过时。

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
/execute as @p at @e[type=creeper,limit=1] run summon tnt
```

在最近一只苦力怕的位置生成 TNT，但执行身份是最近的玩家。

### positioned

```
/execute positioned 100 64 100 run setblock ~ ~ ~ diamond_block
```
在 (100, 64, 100) 放一个钻石块。

相对坐标也可以：

```
/execute as @p positioned ~ ~10 ~ run say 我在玩家上方 10 格
```

### align

对齐到方块网格，消除小数坐标：

```
/execute align xyz run setblock ~ ~ ~ stone
```

会把执行位置向下取整对齐到最近的方块角上。

## 条件执行：if / unless

新版最强大的特性之一。

### if entity

```
/execute if entity @e[type=creper] run say 附近有苦力怕！
```

检测到有苦力怕时执行。

```
/execute as @a if entity @e[type=zombie,r=5] run say 附近 5 格内有僵尸！
```

每个玩家检测自己周围 5 格有没有僵尸。

### if block

```
/execute if block ~ ~-1 ~ grass run setblock ~ ~ ~ red_flower
```

脚下方块是草时在头顶放一朵花。

```
/execute as @a if block ~ ~-1 ~ stone run effect @s speed 5 1
```

站在石头上的玩家获得速度效果。

### if score

需要先设计分板：

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
/execute unless entity @p gamemode=creative run say 你不是创造模式
```

```
/execute as @a unless block ~ ~-1 ~ water run effect @s weakness 5 1
```

没站在水里的玩家获得虚弱效果。

## 链式子命令

多个子命令可以串联，执行顺序从左到右：

```
/execute as @e[type=zombie] at @s positioned ^ ^ ^1 run summon lightning_bolt ~ ~ ~
```

每只僵尸面前 1 格生成一道闪电。

```
/execute as @a at @s if block ~ ~-1 ~ grass if block ~ ~1 ~ air run setblock ~ ~1 ~ red_tulip
```

站在草地上且头顶是空气的玩家，头上放一朵红色郁金香。

## 朝向与旋转

新版 execute 支持朝向控制：

```
/execute as @p at @s facing @e[type=zombie,limit=1] run say 我正对着最近的僵尸
```

`facing` 可以让执行者面向某个实体或坐标：

```
/execute as @p at @s facing 0 64 0 run tp @s ^ ^ ^5
```

让玩家面向 (0, 64, 0)，然后向前传送 5 格。

## 与旧版对比

| 功能 | 旧版 | 新版 |
|------|------|------|
| 条件执行 | `detect` 子命令 | `if \| unless block / entity / score` |
| 身份切换 | 无 | `as <目标>` |
| 位置切换 | 只有相对坐标 | `at / positioned / align / anchored` |
| 朝向控制 | 无 | `facing / rotated` |
| 链式 | 不支持，逐条写 | 支持无限链式 |
| 坐标计算 | `^` 仅部分支持 | `^` 完整支持 |

新版基本上把 Java 版的 execute 功能都搬过来了，写起来比旧版顺手很多。

## 常用案例

```
# 所有玩家头顶生成粒子
/execute as @a at @s run particle minecraft:happy_compas ~ ~1 ~

# 杀死所有名称包含 "BOSS" 的实体
/execute as @e[name=BOSS] run kill @s

# 夜间给玩家夜视效果
/execute as @a if entity @p if block 0 0 0 daylight_detector ...

# 站在草上的僵尸变成闪电苦力怕
/execute as @e[type=zombie] at @s if block ~ ~-1 ~ grass run summon creeper ^ ^ ^-1

# 创造模式玩家附近生成苦力怕（恶搞）
/execute as @a if entity @s[m=creative] run summon creeper ~ ~ ~

# 检测红石信号
/execute if block ~ ~-1 ~ redstone_block run say 脚下有红石块
```

## 调试建议

新版 execute 报错通常会告诉你具体哪一段语法不对：

- **Unexpected expression**：子命令顺序错了
- **Unknown command**：子命令名写错了（注意新版用的是 `run` 不是 `execute`）
- **Syntax error**：漏了空格或多了不该有的符号

几个排查方向：

- 每个子命令后面必须跟它的参数，不能漏
- `run` 是最后一个子命令，后面跟要执行的指令
- `as` 和 `at` 可以分开用，但顺序要注意：先 `as` 再 `at`
- `if` 后面跟 `entity` / `block` / `score`，不能乱写
- 用 `@s` 引用当前执行者，不要弄混

---

新版 `/execute` 比以前好用太多了。跟 Java 版差不多的语法，写复杂的指令链不再需要一大堆命令方块串起来。
