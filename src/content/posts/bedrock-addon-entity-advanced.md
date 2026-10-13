---
title: "基岩版 Addon：生物行为、事件与掉落物"
date: "2026-06-21"
tags: ["技术", "Minecraft", "游戏"]
description: "用暗影蜘蛛串起行为配置、状态切换、生成规则和战利品表。"
updated: "2026-10-11"
published: true
---

前两篇做了物品、方块和合成配方。这次接着做生物：先配置行为，再用事件切换状态，最后补上生成规则和掉落物。

文末用一个暗影蜘蛛整理文件结构。纹理和模型不在这一篇展开。

## 行为树

行为配置决定生物要做哪些动作，比如攻击、游荡或观察玩家。各行为是否能执行，还取决于条件和优先级。

每个行为是一个节点，写在 `minecraft:behavior.xxx` 组件里，带一个 `priority` 值。**数字越小优先级越高**，优先级最高的节点会先执行。

比较常用的行为节点：

| 节点 | 作用 |
|------|------|
| `minecraft:behavior.melee_attack` | 近战攻击目标 |
| `minecraft:behavior.ranged_attack` | 远程射击（骷髅、掠夺者） |
| `minecraft:behavior.random_stroll` | 随机走动 |
| `minecraft:behavior.look_at_player` | 看着玩家 |
| `minecraft:behavior.hurt_by_target` | 被攻击后反击 |
| `minecraft:behavior.nearest_attackable_target` | 寻找最近的可攻击目标 |
| `minecraft:behavior.flee_sun` | 躲避阳光 |
| `minecraft:behavior.avoid_mob_type` | 躲避特定生物 |
| `minecraft:behavior.panic` | 受伤后惊慌逃窜 |
| `minecraft:behavior.random_look_around` | 东张西望 |

行为节点的结构大致是这样：

```json
"minecraft:behavior.melee_attack": {
  "priority": 2,
  "speed_multiplier": 1.2,
  "track_target": true,
  "require_complete_path": false
}
```

优先级决定生物什么时候切换行为。比如你配了三个节点：

```json
"components": {
  "minecraft:behavior.hurt_by_target": {
    "priority": 1,
    "alert_same_type": true
  },
  "minecraft:behavior.melee_attack": {
    "priority": 2,
    "speed_multiplier": 1.2
  },
  "minecraft:behavior.random_stroll": {
    "priority": 5,
    "speed_multiplier": 0.8
  }
}
```

逻辑是这样的：生物先检查优先级 1——有目标在攻击范围内吗？有，就攻击。没有，往下检查优先级 2——有没有目标可以追过去打？有，就追。再没有，就执行优先级 5 的随机游荡。

一个瞄准目标的行为节点示例：

```json
"minecraft:behavior.nearest_attackable_target": {
  "priority": 1,
  "entity_types": [
    {
      "filters": {
        "test": "is_family",
        "subject": "other",
        "value": "player"
      },
      "max_dist": 16
    }
  ],
  "must_see": true,
  "reselect_target": true
}
```

这表示：寻找 16 格内的玩家作为攻击目标，寻找目标时要求视线可见（`must_see: true`）；后续目标保留还受该行为的其他参数影响。

行为树参数很多，每个节点的配置项都不一样。需要完整列表的话直接去微软文档搜对应节点名，或者看原版生物的 JSON 怎么配。

## 组件组与事件系统

组件组与事件配合使用，可以在不同条件下切换属性：

- **组件组**（`component_groups`）：一组组件的集合，赋予生物一组特定的能力
- **事件**（`events`）：触发组件组的添加或移除，让生物在不同状态间切换

举个例子，做一个"受伤后狂暴"的怪物——平常走得慢、伤害低，血量低于一半之后速度变快、伤害提高、浑身冒烟。

先在生物定义里声明两个组件组：

```json
"component_groups": {
  "my_addon:normal_state": {
    "minecraft:movement": {
      "value": 0.25
    },
    "minecraft:attack": {
      "damage": 3
    }
  },
  "my_addon:enraged_state": {
    "minecraft:movement": {
      "value": 0.45
    },
    "minecraft:attack": {
      "damage": 6
    },
    "minecraft:particle_effect": {
      "effect": "minecraft:critical_hit",
      "locators": ["body"]
    }
  }
}
```

然后定义事件——血量低于多少时切换到狂暴状态：

```json
"events": {
  "minecraft:entity_spawned": {
    "add": {
      "component_groups": ["my_addon:normal_state"]
    }
  },
  "my_addon:enter_enraged": {
    "add": {
      "component_groups": ["my_addon:enraged_state"]
    },
    "remove": {
      "component_groups": ["my_addon:normal_state"]
    }
  }
}
```

事件还需要触发条件。这里用环境感测组件检查血量：

```json
"minecraft:environment_sensor": {
  "triggers": [
    {
      "filters": {
        "test": "health",
        "subject": "self",
        "operator": "<=",
        "value": 10
      },
      "event": "my_addon:enter_enraged"
    }
  ]
}
```

这样当生物血量 ≤ 10 时，自动触发狂暴事件，切换组件组。

也可以做昼夜切换：

```json
"minecraft:environment_sensor": {
  "triggers": [
    {
      "filters": {
        "test": "is_daytime",
        "subject": "self",
        "operator": "==",
        "value": false
      },
      "event": "my_addon:night_mode"
    },
    {
      "filters": {
        "test": "is_daytime",
        "subject": "self",
        "operator": "==",
        "value": true
      },
      "event": "my_addon:day_mode"
    }
  ]
}
```

组件组负责保存不同状态的属性，事件负责添加或移除这些组件组。这样可以分别配置日夜变化或受伤后的状态。

## 生成规则

需要在行为包里单独放一个生成规则文件，路径是 `spawn_rules/` 目录下，文件名随意但建议跟生物同名。

一个生成规则示例：

```json
{
  "format_version": "1.8.0",
  "minecraft:spawn_rules": {
    "description": {
      "identifier": "my_addon:my_monster",
      "population_control": "monster"
    },
    "conditions": [
      {
        "minecraft:weight": {
          "default": 80
        },
        "minecraft:spawns_on_surface": {},
        "minecraft:brightness_filter": {
          "min": 0,
          "max": 7,
          "adjust_for_weather": false
        },
        "minecraft:herd": {
          "min_size": 1,
          "max_size": 3
        },
        "minecraft:biome_filter": {
          "test": "has_biome_tag",
          "operator": "==",
          "value": "plains"
        }
      }
    ]
  }
}
```

关键参数：

- **`weight`**：生成权重。参与同一组候选的选择，不能直接换算成全世界的生成概率。
- **`brightness_filter`**：光照条件。`min: 0, max: 7` 表示这份规则允许的亮度范围为 0 到 7
- **`herd`**：一次生成几只。`min_size: 1, max_size: 3` 就是每次 1~3 只
- **`spawns_on_surface`** / `spawns_underground` / `spawns_in_water`：生成位置
- **`biome_filter`**：生物群系过滤。可选值包括 `plains`、`forest`、`desert`、`jungle`、`swamp`、`taiga`、`mesa`、`ocean` 等

`population_control` 定义生物的种群控制类型，可选值：

| 值 | 说明 |
|------|------|
| `monster` | 怪物，夜间生成，上限受难度影响 |
| `animal` | 动物，受世界动物数量上限控制 |
| `water_animal` | 水生动物 |
| `ambient` | 环境生物（蝙蝠这类） |

## 战利品表

战利品表是另一个专门的 JSON 系统，放在行为包的 `loot_tables/entities/` 下。

一个简单的战利品表——击杀后随机掉落 1~2 个铁锭，20% 概率掉落钻石：

```json
{
  "pools": [
    {
      "rolls": {
        "min": 1,
        "max": 2
      },
      "entries": [
        {
          "type": "item",
          "name": "minecraft:iron_ingot",
          "weight": 1
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "minecraft:diamond",
          "weight": 2
        },
        {
          "type": "empty",
          "weight": 8
        }
      ]
    }
  ]
}
```

这里第二个池子的逻辑：从两个 entry 里随机选一个，钻石权重 2，空手权重 8，所以钻石掉率就是 2/(2+8) = 20%。

**条件掉落**——被玩家杀死才掉稀有物品：

```json
{
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "my_addon:rare_sword",
          "weight": 1,
          "conditions": [
            {
              "condition": "killed_by_player"
            }
          ]
        },
        {
          "type": "item",
          "name": "minecraft:bone",
          "weight": 3
        }
      ]
    }
  ]
}
```

加上附魔等级影响：

```json
"conditions": [
  {
    "condition": "killed_by_player",
    "min_level": 1
  }
],
"functions": [
  {
    "function": "minecraft:enchant_random_gear",
    "chance": 0.5
  }
]
```

然后在生物 JSON 的组件里引用战利品表：

```json
"minecraft:loot": {
  "table": "loot_tables/entities/my_monster.json"
}
```

战利品表还可以更复杂——按生物群系决定掉落、分难度调整数量、用函数给掉落物随机附魔。不过对大多数自定义怪物来说，上面的配置已经够用了。

## 示例：暗影蜘蛛

下面以蜘蛛为基础，把行为、状态切换、生成规则和掉落物放到同一套文件中。

### 行为包结构

```
my_shadow_spider_behavior/
  manifest.json
  entities/
    shadow_spider.json
  spawn_rules/
    shadow_spider.json
  loot_tables/entities/
    shadow_spider.json
```

### entity 文件

```json
{
  "format_version": "1.20.80",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:shadow_spider",
      "is_spawnable": true,
      "is_summonable": true,
      "is_experimental": false
    },
    "component_groups": {
      "my_addon:normal": {
        "minecraft:movement": {
          "value": 0.3
        },
        "minecraft:attack": {
          "damage": 4
        },
        "minecraft:health": {
          "value": 24,
          "max": 24
        }
      },
      "my_addon:enraged": {
        "minecraft:movement": {
          "value": 0.5
        },
        "minecraft:attack": {
          "damage": 7
        },
        "minecraft:health": {
          "value": 24,
          "max": 24
        },
        "minecraft:particle_effect": {
          "effect": "minecraft:spell_witch",
          "locators": ["body"]
        },
        "minecraft:damage_sensor": {
          "triggers": [
            {
              "cause": "all",
              "deals_damage": false
            }
          ],
          "on_damage": {
            "filters": {
              "test": "is_family",
              "subject": "other",
              "value": "player"
            }
          }
        }
      }
    },
    "components": {
      "minecraft:type_family": {
        "family": ["shadow_spider", "arthropod", "monster"]
      },
      "minecraft:collision_box": {
        "width": 1.4,
        "height": 0.9
      },
      "minecraft:nameable": {},
      "minecraft:despawn": {
        "despawn_from_distance": {
          "min_distance": 32,
          "max_distance": 48
        }
      },
      "minecraft:breathable": {
        "total_supply": 15,
        "suffocate_time": 0,
        "breathes_water": true
      },
      "minecraft:loot": {
        "table": "loot_tables/entities/shadow_spider.json"
      },
      "minecraft:behavior.hurt_by_target": {
        "priority": 1,
        "alert_same_type": true
      },
      "minecraft:behavior.nearest_attackable_target": {
        "priority": 2,
        "entity_types": [
          {
            "filters": {
              "test": "is_family",
              "subject": "other",
              "value": "player"
            },
            "max_dist": 20
          }
        ],
        "must_see": true
      },
      "minecraft:behavior.melee_attack": {
        "priority": 3,
        "speed_multiplier": 1.0,
        "track_target": true
      },
      "minecraft:behavior.random_stroll": {
        "priority": 5,
        "speed_multiplier": 0.8
      },
      "minecraft:behavior.look_at_player": {
        "priority": 6,
        "look_distance": 8.0
      },
      "minecraft:behavior.random_look_around": {
        "priority": 7
      },
      "minecraft:behavior.avoid_mob_type": {
        "priority": 4,
        "entity_types": [
          {
            "filters": {
              "test": "is_family",
              "subject": "other",
              "value": "skeleton"
            },
            "max_dist": 6
          }
        ]
      },
      "minecraft:environment_sensor": {
        "triggers": [
          {
            "filters": {
              "test": "health",
              "subject": "self",
              "operator": "<=",
              "value": 8
            },
            "event": "my_addon:become_enraged"
          }
        ]
      },
      "minecraft:scale": {
        "value": 1.3
      },
      "minecraft:movement.basic": {},
      "minecraft:navigation.walk": {
        "can_path_over_water": true,
        "can_walk": true
      },
      "minecraft:jump.static": {},
      "minecraft:can_climb": {
        "value": true
      },
      "minecraft:insomnia": {
        "days_until_insomnia": 0
      }
    },
    "events": {
      "minecraft:entity_spawned": {
        "add": {
          "component_groups": ["my_addon:normal"]
        }
      },
      "my_addon:become_enraged": {
        "add": {
          "component_groups": ["my_addon:enraged"]
        },
        "remove": {
          "component_groups": ["my_addon:normal"]
        }
      }
    }
  }
}
```

### 生成规则文件

```json
{
  "format_version": "1.8.0",
  "minecraft:spawn_rules": {
    "description": {
      "identifier": "my_addon:shadow_spider",
      "population_control": "monster"
    },
    "conditions": [
      {
        "minecraft:weight": {
          "default": 40
        },
        "minecraft:spawns_on_surface": {},
        "minecraft:brightness_filter": {
          "min": 0,
          "max": 7,
          "adjust_for_weather": false
        },
        "minecraft:herd": {
          "min_size": 1,
          "max_size": 2
        },
        "minecraft:biome_filter": {
          "test": "has_biome_tag",
          "operator": "==",
          "value": "forest"
        }
      },
      {
        "minecraft:weight": {
          "default": 20
        },
        "minecraft:spawns_on_surface": {},
        "minecraft:brightness_filter": {
          "min": 0,
          "max": 7,
          "adjust_for_weather": false
        },
        "minecraft:herd": {
          "min_size": 1,
          "max_size": 3
        },
        "minecraft:biome_filter": {
          "test": "has_biome_tag",
          "operator": "==",
          "value": "swamp"
        }
      }
    ]
  }
}
```

### 战利品表文件

```json
{
  "pools": [
    {
      "rolls": {
        "min": 0,
        "max": 2
      },
      "entries": [
        {
          "type": "item",
          "name": "minecraft:string",
          "weight": 5
        },
        {
          "type": "item",
          "name": "minecraft:spider_eye",
          "weight": 2
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "minecraft:ender_pearl",
          "weight": 1,
          "conditions": [
            {
              "condition": "killed_by_player"
            }
          ]
        },
        {
          "type": "empty",
          "weight": 4
        }
      ]
    }
  ]
}
```

这个暗影蜘蛛的设计思路：

- 生成规则限制在森林和沼泽的暗处，权重设为 40
- 体型 1.3 倍，24 血，近战攻击力 4
- 受伤后血量 ≤ 8 进入狂暴——变快、伤害提升到 7、生成女巫粒子特效
- 会躲骷髅（设定上它怕骷髅）
- 线和蜘蛛眼由第一组条目选择；玩家击杀条件满足时，末影珍珠参与第二组掉落选择
- 会爬墙、不怕水

这里仅列出行为包部分。资源包中的客户端实体、纹理与模型引用，需要另外补齐。

## 配置检查表

这篇主要讲了四块内容：

| 内容 | 要点 |
|------|------|
| **行为树** | 用 priority 控制生物行为优先级，不同节点负责不同动作 |
| **组件组/事件** | 组件组定义状态，事件触发切换，`environment_sensor` 当监听器 |
| **生成规则** | 控制生物在什么条件下自然生成，权重参与生成选择 |
| **战利品表** | 池子+条目+权重+条件，实现各种掉落逻辑 |

相关笔记：[物品入门](/posts/bedrock-addon-basics) · [方块与配方](/posts/bedrock-addon-blocks-recipes)。
