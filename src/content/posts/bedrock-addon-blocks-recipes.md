---
title: "基岩版 Addon：自定义方块与合成配方"
date: "2026-06-21"
tags: ["技术", "Minecraft", "游戏"]
description: "上篇讲了 Addon 基础结构和自定义物品，这篇继续——自定义方块和合成配方。这两个加起来，已经能做出不少东西了。"
published: true
---

上篇写了 Addon 的基础结构和自定义物品。这篇接着讲方块和合成配方。

方块比物品稍微复杂一点，因为方块有放置位置、碰撞箱、破坏时间、挖掘等级这些属性。不过基岩版用 JSON 就能定义，不需要写代码。

## 自定义方块

在行为包的 `blocks/` 目录下创建 JSON 文件。一个最简单的方块：

```json
// blocks/my_block.json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:my_block"
    },
    "components": {
      "minecraft:map_color": {
        "color": "#ff6600"
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1.5
      },
      "minecraft:light_emission": {
        "light": 0
      }
    }
  }
}
```

这就定义了一个方块，放在 `my_addon:my_block`。在游戏里可以用 `/give @s my_addon:my_block` 拿到。

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
      // 在地图上的颜色
      "minecraft:map_color": { "color": "#888888" },

      // 破坏时间（秒）
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.0
      },

      // 爆炸抗性
      "minecraft:destructible_by_explosion": {
        "explosion_resistance": 15.0
      },

      // 发光亮度（0-15）
      "minecraft:light_emission": {
        "light": 0
      },

      // 是否透明（影响光线透过）
      "minecraft:light_dampening": {
        "light": 15
      },

      // 摩擦系数（0.1-0.9，0.6是普通方块）
      "minecraft:friction": 0.6
    }
  }
}
```

`menu_category` 决定了方块在创造模式物品栏里出现在哪个分类。

### 碰撞箱

方块默认是一整格的碰撞箱。可以改成任意大小：

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

### 挖掘等级

某些方块需要特定等级的镐才能挖掘掉落：

```json
"minecraft:digger": {
  "use_efficiency": true,
  "destroy_speeds": [
    {
      "block": {
        "tags": "?query.any_tag('wood_pick_diggable','stone_pick_diggable','iron_pick_diggable','diamond_pick_diggable')"
      },
      "speed": 6
    }
  ]
}
```

例：只有铁镐以上才能挖掘的方块：

```json
"minecraft:digger": {
  "use_efficiency": true,
  "destroy_speeds": [
    {
      "block": { "tags": "?query.any_tag('iron_pick_diggable','diamond_pick_diggable')" },
      "speed": 4
    }
  ]
}
```

### 掉落物

方块被破坏后默认掉落自身。可以改成掉落其它物品或者什么都不掉：

```json
"minecraft:loot": {
  "table": "loot_tables/blocks/my_block.json"
}
```

更简单的写法——直接掉指定物品：

```json
"minecraft:loot": {
  "table": "loot_tables/empty.json"
}
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
| `opaque` | 常规方块 |
| `alpha_test` | 部分透明（树叶、铁栏杆） |
| `blend` | 半透明（玻璃、冰） |
| `double_sided` | 双面渲染（草等） |

## 自定义合成配方

合成配方放在行为包的 `recipes/` 目录下。

### 有序合成（Shaped）

```json
// recipes/fancy_stone.json
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
      { "item": "minecraft:glowstone_dust", "count": 2 }
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

还可以用 `recipe_brewing_mix` 定义酿造配方、`recipe_smithing_trim` 定义锻造模板配方，不过这些用得比较少。

## 一个有光效的发光方块

把上面这些串起来，做一个完整的发光方块：

```json
// blocks/glow_stone.json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:glow_stone",
      "menu_category": {
        "category": "items"
      }
    },
    "components": {
      "minecraft:map_color": { "color": "#ffff55" },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 3.0
      },
      "minecraft:light_emission": {
        "light": 12
      },
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

合成配方（工作台，4 个萤石粉围着 1 个石头）：

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
- **JSON 错误**：基岩版加载 Addon 失败一般不会给明确报错，可以用内容日志查看器（`/contentlog`）打开调试输出
- **方块模型不对**：默认方块是一整格，如果需要特殊形状（台阶、楼梯、栅栏那种），需要写 `minecraft:geometry` 组件和模型文件，这个比物品复杂不少

---

方块 + 合成配方 + 上篇的自定义物品，已经能做出一个完整的自定义内容包了。再往后就是方块模型、实体动画、粒子效果这些更花哨的东西了。
