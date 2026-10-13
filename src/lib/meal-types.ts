export interface Food {
  id: number;
  name: string;
  flavors: string;
  ingredients: string;
  methods: string;
  cuisines: string;
  satiety: string;
  mood: string;
  avoid_tags: string;
}

export const DRINK_KINDS = { "fruit-tea": "果茶", "milk-tea": "奶茶", tea: "纯茶", coffee: "咖啡" } as const;
export type DrinkKind = keyof typeof DRINK_KINDS;
export interface Drink {
  id: number;
  brand: string;
  name: string;
  kind: DrinkKind;
  ingredients: string;
  avoid_tags: string;
  source_url: string;
  active: number;
}
export interface MealPreferences {
  flavors: string[];
  ingredients: string[];
  methods: string[];
  cuisines: string[];
  satiety: string;
  mood: string;
  avoid: string;
  brand: string;
  kind: string;
}
export const EMPTY_PREFERENCES: MealPreferences = {
  flavors: [], ingredients: [], methods: [], cuisines: [], satiety: "", mood: "", avoid: "", brand: "", kind: "",
};
export interface MealResult {
  food: Food | null;
  drink: Drink | null;
  reason: string;
  message: string;
  foodCount: number;
  drinkCount: number;
  previews?: MealResult[];
}
