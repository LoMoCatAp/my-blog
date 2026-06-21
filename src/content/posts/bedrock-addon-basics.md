---
title: "基岩版 Addon 开发入门"
date: "2026-06-20"
tags: ["技术", "Minecraft", "游戏"]
description: "基岩版 Addon 没那么神秘，其实就是一堆 JSON 文件。了解基础结构之后，你也能做自己的 Addon。"
published: true
---

基岩版的 Addon（也叫行为包/资源包）本质上就是一堆 JSON 文件，Minecraft 用它们来决定游戏里的东西长什么样、有什么行为。

这跟 Java 版不一样——Java 版用 Java 写 Mod，基岩版用 JSON + 脚本，门槛低很多。

## 两个包

一个完整的 Addon 由两部分组成：

| 包 | 作用 | 后缀 |
|------|------|------|
| **行为包**（Behavior Pack） | 定义生物行为、合成配方、掉落物 | `.mcpack` 或 `.mcaddon` |
| **资源包**（Resource Pack） | 定义纹理、模型、动画、声音 | `.mcpack` |

如果两个包一起打包，后缀是 `.mcaddon`。

## 文件结构

一个最简单的行为包长这样：

```
my_addon_behavior/
  manifest.json          ← 包的身份证，必须有
  pack_icon.png          ← 包的图标（256×256）
  entities/
    my_zombie.json       ← 自定义生物
  items/
    my_sword.json        ← 自定义物品
  scripts/
    main.js              ← 脚本文件（可选，1.20+）
```

`manifest.json` 是所有包的入口。它大概长这样：

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
      "identifier": "my_addon:my_sword",
      "is_experimental": false
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
      },
      "minecraft:weapon": {}
    }
  }
}
```

物品的 identifier 必须带命名空间（`my_addon:` 前面那个），不能只用 `my_sword`，不然会和原版冲突。

## 自定义生物

最简单的方式是复制原版生物 JSON 改一改。可以在 Minecraft 安装目录的 `data/behavior_packs/vanilla/entities/` 下找到原版生物的 JSON。

比如做个发光僵尸：

```json
{
  "format_version": "1.20.80",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:glow_zombie",
      "is_spawnable": true,
      "is_summonable": true,
      "is_experimental": false
    },
    "components": {
      "minecraft:type_family": {
        "family": ["zombie", "monster"]
      },
      "minecraft:health": {
        "value": 30,
        "max": 30
      },
      "minecraft:movement": {
        "value": 0.25
      },
      "minecraft:glow": {
        "value": true
      },
      "minecraft:behavior.melee_attack": {
        "priority": 2
      }
    },
    "events": {
      "minecraft:entity_spawned": {
        "add": {
          "component_groups": ["minecraft:glow"]
        }
      }
    }
  }
}
```

然后在资源包里加纹理和模型，自定义生物的纹理放在 `textures/entity/` 下，并在 `textures/terrain_texture.json` 或 `textures/item_texture.json` 里注册。

## 脚本

从 1.20 开始 Mojang 正式支持了 GameTest Framework，可以用 JavaScript 写更复杂的逻辑。

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

脚本需要在 `manifest.json` 里声明：

```json
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

`com.mojang` 目录位置：

- Windows：`%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\`
- Android：`/storage/emulated/0/games/com.mojang/`
- iOS：`Minecraft/games/com.mojang/`

## 几个建议

- **先从改现有生物入手。** 复制原版的 JSON，改几个数值看看效果，比从头写容易
- **善用 VS Code。** 装个 JSON 高亮插件，不然会看得眼睛疼
- **留意 JSON 格式。** 少个逗号或多一个都会导致整个包不加载，基岩版报错也不明显
- **UUI 别用重复的。** 这是最常见的翻车原因，UUID 必须每次生成新的
- **官方文档其实还行。** https://learn.microsoft.com/en-us/minecraft/creator/ 上的文档虽然写得不算特别好，但够用

---

Addon 开发的内容其实还有很多——自定义方块、自定义合成、战利品表、动画控制器……一次写不完。后面可以再续。
