import type { Food, Drink, MealPreferences, MealResult } from "./meal-types";

const words = (text: string) => text.split(/[,，、;；\s]+/).map(x => x.trim().toLowerCase()).filter(Boolean);
const contains = (text: string, term: string) => text.toLowerCase().includes(term.toLowerCase());
export function excludes(text: string, avoid: string): boolean {
  return words(avoid).some(term => {
    if (["牛奶", "乳制品", "奶制品"].includes(term)) return /奶|乳|芝士/.test(text);
    if (term === "海鲜") return /鱼|虾|蟹|贝|蛤|鱿|章鱼/.test(text);
    return contains(text, term);
  });
}
function matches(text: string, terms: string[], category = ""): boolean {
  return !terms.length || terms.some(term => {
    if (category === "flavors" && term === "香辣") return /辣/.test(text);
    if (category === "methods" && term === "蒸煮") return /蒸|煮/.test(text);
    if (category === "methods" && term === "炖焖煲") return /炖|焖|煲/.test(text);
    if (category === "methods" && term === "煎炸烤") return /煎|炸|烤/.test(text);
    return contains(text, term);
  });
}
export function eligibleFoods(foods: Food[], prefs: MealPreferences): Food[] {
  return foods.filter(food => !excludes([food.name, food.ingredients, food.avoid_tags].join(","), prefs.avoid)
    && (["flavors", "ingredients", "methods", "cuisines"] as const).every(key => matches(food[key] || "", prefs[key], key))
    && (!prefs.satiety || contains(food.satiety || "", prefs.satiety))
    && (!prefs.mood || contains(food.mood || "", prefs.mood)));
}
export function eligibleDrinks(drinks: Drink[], prefs: MealPreferences): Drink[] {
  return drinks.filter(drink => drink.active === 1 && (!prefs.brand || drink.brand === prefs.brand)
    && (!prefs.kind || drink.kind === prefs.kind || (prefs.kind === "tea-drinks" && drink.kind !== "coffee"))
    && !excludes([drink.name, drink.ingredients, drink.avoid_tags].join(","), prefs.avoid));
}
function pairScore(food: Food, drink: Drink): { score: number; reason: string } {
  const flavors = food.flavors || "";
  if (/辣/.test(flavors) && drink.kind === "fruit-tea") return { score: 5, reason: "这一餐偏辣，搭一杯果香。" };
  if (/煎|炸|烤/.test(food.methods) && ["tea", "fruit-tea"].includes(drink.kind)) return { score: 4, reason: "煎烤之后，换一点清爽茶香。" };
  if (/西餐/.test(food.cuisines) && drink.kind === "coffee") return { score: 5, reason: "西式餐食，搭一杯咖啡。" };
  if (/清淡/.test(flavors) && ["tea", "milk-tea"].includes(drink.kind)) return { score: 4, reason: "口味清淡，搭一点茶香。" };
  if (/酱香|蒜香|咖喱/.test(flavors) && ["tea", "fruit-tea"].includes(drink.kind)) return { score: 4, reason: "餐食味道浓，饮品换个轻快的口味。" };
  return { score: 1, reason: "这一餐，再搭一杯。" };
}
function pick<T>(items: T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}
export function selectMeal(foods: Food[], drinks: Drink[], prefs: MealPreferences, previousFood = 0, previousDrink = 0, drinkOnly = false, random = Math.random): MealResult {
  const foodPool = eligibleFoods(foods, prefs);
  // A drink-only request keeps the stored meal even after the meal preferences change.
  const food = drinkOnly ? foods.find(x => x.id === previousFood) : pick(foodPool.filter(x => x.id !== previousFood).length > 0 ? foodPool.filter(x => x.id !== previousFood) : foodPool, random);
  if (!food) return { food: null, drink: null, reason: "", message: drinkOnly ? "这道菜已不在菜单里，请重新抽一餐。" : "没有符合这些偏好的餐食，试着少选一项。", foodCount: foodPool.length, drinkCount: 0 };
  const drinkPool = eligibleDrinks(drinks, prefs);
  if (!drinkPool.length) return { food, drink: null, reason: "", message: "餐食已选好，暂时没有符合偏好的饮品。可以换品牌或饮品类型。", foodCount: foodPool.length, drinkCount: 0 };
  const alternatives = drinkPool.filter(x => x.id !== previousDrink);
  const scored = (alternatives.length ? alternatives : drinkPool).map(drink => ({ drink, ...pairScore(food, drink) }));
  const top = Math.max(...scored.map(x => x.score));
  const tier = scored.filter(x => x.score === top);
  // Choose a brand first so larger brand menus do not dominate the draw.
  const brand = pick([...new Set(tier.map(x => x.drink.brand))], random);
  const selected = pick(tier.filter(x => x.drink.brand === brand), random);
  return { food, drink: selected.drink, reason: selected.reason, message: drinkOnly && drinkPool.length === 1 ? "当前偏好下只有这一杯。" : "", foodCount: foodPool.length, drinkCount: drinkPool.length };
}
