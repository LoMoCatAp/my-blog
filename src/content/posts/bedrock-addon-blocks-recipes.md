---
title: "基岩版 Addon：方块与合成配方"
date: "2026-06-21"
tags: ["技术", "Minecraft", "游戏"]
description: "创建自定义方块，配置纹理和合成配方，最后做一个发光方块。"
updated: "2026-10-11"
published: true
---

上篇做了自定义物品，这次接着做方块和合成配方。

先配置方块的属性与纹理，再写配方。最后把这些配置放在一起，做一个发光方块。

## 自定义方块

在行为包的 `blocks/` 目录下创建 JSON 文件。先看一个方块定义：

```json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:my_block"
    },
    "components": {
      "minecraft:map_color": "#ff6600",
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1.5
      },
      "minecraft:light_emission": 0
    }
  }
}
```

这里定义的方块标识是 `my_addon:my_block`。在游戏里可以用 `/give @s my_addon:my_block` 拿到。

## 方块组件详解

### 基本属性

```json
{
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:fancy_stone",
      "menu_category": {
        "category": "construction",
        "group": "itemGroup.name.stone"
      }
    },
    "components": {
      "minecraft:map_color": "#888888",
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.0
      },
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 15.0
      },
      "minecraft:light_emission": 0,
      "minecraft:light_dampening": 15,
      "minecraft:friction": 0.6
    }
  }
}
```

`menu_category` 决定了方块在创造模式物品栏里出现在哪个分类。

### 碰撞箱

方块默认是一整格的碰撞箱。可以在组件允许的范围内调整：

```json
"minecraft:collision_box": {
  "origin": [-8, 0, -8],
  "size": [16, 8, 16]
}
```

`origin` 是方块的左下前角坐标（以像素为单位，一格 16 像素），`size` 是长宽高。

设置为 `false` 可以去掉碰撞箱——玩家能穿过方块：

```json
"minecraft:collision_box": false
```

### 工具与挖掘速度

`minecraft:digger` 属于物品组件，不能直接放进方块组件。先确认基础方块能正常放置和破坏，再分别配置工具速度与掉落条件。

### 掉落物

方块被破坏后默认掉落自身。可以改成掉落其它物品或者什么都不掉：

```json
"minecraft:loot": "loot_tables/blocks/my_block.json"
```

不需要掉落物时，指向一个内容为 `{"pools":[]}` 的战利品表：

```json
"minecraft:loot": "loot_tables/empty.json"
```

如果把 loot 指向一个空的战利品表，方块就不掉任何东西了。

## 方块纹理

方块需要纹理。在资源包的 `textures/blocks/` 下放一张 PNG 图片，然后在 `textures/terrain_texture.json` 里注册：

```json
{
  "resource_pack_name": "my_addon",
  "texture_name": "atlas.terrain",
  "padding": 8,
  "num_mip_levels": 4,
  "texture_data": {
    "my_addon:fancy_stone": {
      "textures": "textures/blocks/fancy_stone"
    }
  }
}
```

然后方块定义里加一行：

```json
"minecraft:material_instances": {
  "*": {
    "texture": "my_addon:fancy_stone",
    "render_method": "opaque"
  }
}
```

`render_method` 可选值：

| 值 | 适用场景 |
|------|---------|
| `opaque` | 不透明方块（石头、泥土） |
| `alpha_test` | 部分透明（树叶、铁栏杆） |
| `blend` | 半透明（玻璃、冰） |
| `double_sided` | 双面渲染（草等） |

## 自定义合成配方

合成配方放在行为包的 `recipes/` 目录下。

### 有序合成（Shaped）

```json
{
  "format_version": "1.20.80",
  "minecraft:recipe_shaped": {
    "description": {
      "identifier": "my_addon:fancy_stone_recipe"
    },
    "tags": ["crafting_table"],
    "pattern": [
      "SSS",
      "SDS",
      "SSS"
    ],
    "key": {
      "S": {
        "item": "minecraft:stone"
      },
      "D": {
        "item": "minecraft:diamond"
      }
    },
    "result": {
      "item": "my_addon:fancy_stone",
      "count": 8
    }
  }
}
```

`tags` 指定在哪种工作台上可以合成，常用值：
- `crafting_table` — 工作台
- `furnace` — 熔炉
- `brewing_stand` — 酿造台
- `campfire` — 营火

### 无序合成（Shapeless）

材料顺序不重要时用这个：

```json
{
  "format_version": "1.20.80",
  "minecraft:recipe_shapeless": {
    "description": {
      "identifier": "my_addon:glow_stone_recipe"
    },
    "tags": ["crafting_table"],
    "ingredients": [
      { "item": "minecraft:stone" },
      { "item": "minecraft:glowstone_dust" },
      { "item": "minecraft:glowstone_dust" }
    ],
    "result": {
      "item": "my_addon:glow_stone",
      "count": 1
    }
  }
}
```

### 熔炉配方

```json
{
  "format_version": "1.20.80",
  "minecraft:recipe_furnace": {
    "description": {
      "identifier": "my_addon:cooked_iron"
    },
    "tags": ["furnace"],
    "input": "my_addon:raw_iron_chunk",
    "output": "minecraft:iron_ingot"
  }
}
```

### 特殊合成

还可以用 `recipe_brewing_mix` 定义酿造配方、`recipe_smithing_trim` 定义锻造模板配方，这里先不展开。

## 示例：发光方块

下面把方块配置与配方放在一起：

```json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:glow_stone",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:map_color": "#ffff55",
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 3.0
      },
      "minecraft:light_emission": 12,
      "minecraft:collision_box": {
        "origin": [-6, 0, -6],
        "size": [12, 12, 12]
      },
      "minecraft:material_instances": {
        "*": {
          "texture": "my_addon:glow_stone",
          "render_method": "blend"
        }
      }
    }
  }
}
```

合成配方（工作台，8 个萤石粉围着 1 个石头，产出 4 个方块）：

```json
{
  "format_version": "1.20.80",
  "minecraft:recipe_shaped": {
    "description": {
      "identifier": "my_addon:glow_stone_recipe"
    },
    "tags": ["crafting_table"],
    "pattern": [
      "GGG",
      "GSG",
      "GGG"
    ],
    "key": {
      "S": { "item": "minecraft:stone" },
      "G": { "item": "minecraft:glowstone_dust" }
    },
    "result": {
      "item": "my_addon:glow_stone",
      "count": 4
    }
  }
}
```

## 测试提示

- **方块没纹理**：检查 `terrain_texture.json` 里的 key 是否和 `material_instances` 里的 `texture` 值一致
- **合成配方不生效**：检查 recipe 的 identifier 有没有重复，以及 `tags` 是否正确
- **方块拿不到**：确认 `menu_category` 和创造模式物品栏分类正确
- **JSON 错误**：在游戏的创作者设置中开启内容日志，查看文件名和错误位置
- **方块模型不对**：默认方块是一整格，如果需要特殊形状（台阶、楼梯、栅栏那种），需要写 `minecraft:geometry` 组件和模型文件，这个比物品复杂不少

---

下一篇做[自定义生物的行为、事件与掉落物](/posts/bedrock-addon-entity-advanced)。

组件字段参考：[发光亮度](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_light_emission)、[地图颜色](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_map_color)、[方块掉落物](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_loot)。
