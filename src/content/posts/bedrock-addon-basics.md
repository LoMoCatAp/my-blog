---
title: "基岩版 Addon：从一个自定义物品开始"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "行为包、资源包和 manifest.json 的配置，以及自定义物品的创建与测试。"
updated: "2026-10-11"
published: true
---

先分清行为包和资源包各自负责什么，再配置 manifest.json。这篇从一个自定义物品开始，做完后把包导入游戏测试。

物品示例使用 1.20.80 格式，包的最低引擎版本为 1.21.0。组件和脚本 API 要与实际游戏版本匹配。

## 两个包

一个完整的 Addon 由两部分组成：

| 包 | 作用 | 后缀 |
|------|------|------|
| **行为包**（Behavior Pack） | 定义生物行为、合成配方、掉落物 | `.mcpack` 或 `.mcaddon` |
| **资源包**（Resource Pack） | 定义纹理、模型、动画、声音 | `.mcpack` |

如果两个包一起打包，后缀是 `.mcaddon`。

## 文件结构

先建一个行为包，文件结构如下：

```
my_addon_behavior/
  manifest.json          ← 包的信息，必须有
  pack_icon.png          ← 包的图标（256×256）
  entities/
    my_zombie.json       ← 自定义生物
  items/
    my_sword.json        ← 自定义物品
  scripts/
    main.js              ← 脚本文件（可选）
```

包的信息写在 `manifest.json` 中：

```json
{
  "format_version": 2,
  "header": {
    "name": "我的第一个 Addon",
    "description": "随便做来试试",
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "version": [1, 0, 0],
    "min_engine_version": [1, 21, 0]
  },
  "modules": [
    {
      "type": "data",
      "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "version": [1, 0, 0]
    }
  ]
}
```

几个关键点：

- **uuid** 必须全局唯一，不能跟任何已有的包重复。去 https://www.uuidgenerator.net 生成
- `min_engine_version` 决定了你的 Addon 在哪个版本以上生效
- `type: "data"` 是行为包，`type: "resources"` 是资源包

## 自定义物品

在 `items/` 下面创建一个 JSON 文件，比如 `my_sword.json`：

```json
{
  "format_version": "1.20.80",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:my_sword"
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:hand_equipped": true,
      "minecraft:damage": 8,
      "minecraft:durability": {
        "max_durability": 500
      },
      "minecraft:icon": {
        "texture": "my_sword"
      }
    }
  }
}
```

物品的 identifier 必须带命名空间（`my_addon:` 前面那个），不能只用 `my_sword`，不然会和原版冲突。

## 生物放到后面做

物品加载成功后，再接着做[生物行为与掉落物](/posts/bedrock-addon-entity-advanced)。生物还需要客户端实体、模型和纹理，不能只靠一份行为定义完成。

## 脚本

需要程序逻辑时，可以使用 JavaScript 脚本。脚本 API、依赖版本和实验选项要按目标游戏版本核对。

一个简单的脚本 `scripts/main.js`：

```javascript
import { world, system } from "@minecraft/server";

world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  player.sendMessage("欢迎来到我的世界！");
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (player.isSneaking) {
      player.addEffect("speed", 200, { amplifier: 2 });
    }
  }
}, 20);
```

下面是 `manifest.json` 的字段片段，合并到现有文件中；两个 `uuid` 要分别替换为新的 UUID。这里使用 `@minecraft/server` 1.12.0，升级游戏时需核对可用 API 版本：

```jsonc
"modules": [
  {
    "type": "data",
    "uuid": "...",
    "version": [1, 0, 0]
  },
  {
    "type": "script",
    "language": "javascript",
    "uuid": "...",
    "version": [1, 0, 0],
    "entry": "scripts/main.js"
  }
],
"dependencies": [
  {
    "module_name": "@minecraft/server",
    "version": "1.12.0"
  }
]
```

## 测试你的 Addon

1. 把文件夹打包成 `.mcaddon` 或 `.mcpack`
2. 双击导入 Minecraft
3. 创建一个新世界，在「行为包」和「资源包」里启用你的 Addon
4. 进游戏 `/give @s my_addon:my_sword` 试试

或者更快的测试方式：把文件夹直接丢到 `com.mojang` 目录下的 `development_behavior_packs/` 和 `development_resource_packs/` 里，这样改完文件直接重进世界就能看到效果，不用反复打包。

开发目录随平台和安装方式不同。位置可查[官方开发入门](https://learn.microsoft.com/en-us/minecraft/creator/documents/gettingstarted)。

资源包中的物品图标还需要在 `textures/item_texture.json` 注册 `my_sword`，并放入对应 PNG；物品定义本身不会生成纹理。

## 测试时检查这些地方

- **使用编辑器的格式检查。** 先排除 JSON 语法错误，再排查游戏内的配置。
- **留意 JSON 格式。** 少个逗号或多一个都会导致整个包不加载，基岩版报错也不明显
- **检查 UUID。** 不同包和模块的标识不能冲突；已有包更新时也要保持标识一致。
- **查目标版本的组件说明。** [Minecraft Creator 文档](https://learn.microsoft.com/en-us/minecraft/creator/) 可以按组件名检索。

---

下一篇接着做[自定义方块与合成配方](/posts/bedrock-addon-blocks-recipes)。
