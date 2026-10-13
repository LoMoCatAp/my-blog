import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { selectMeal } from "@/lib/meal-selection";
import { EMPTY_PREFERENCES, type Food, type Drink, type MealPreferences } from "@/lib/meal-types";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const prefs: MealPreferences = { ...EMPTY_PREFERENCES };
  for (const key of ["flavors", "ingredients", "methods", "cuisines"] as const) prefs[key] = (params.get(key) || "").slice(0, 250).split(",").filter(Boolean);
  for (const key of ["satiety", "mood", "avoid", "brand", "kind"] as const) prefs[key] = (params.get(key) || "").slice(0, 250);
  const db = getDb();
  const foods = db.prepare("SELECT * FROM foods").all() as Food[];
  const drinks = db.prepare("SELECT * FROM drinks WHERE active=1").all() as Drink[];
  const drinkOnly = params.get("mode") === "drink";
  const result = selectMeal(foods, drinks, prefs,
    Number(params.get("previousFood")) || 0, Number(params.get("previousDrink")) || 0, drinkOnly);
  // The final draw is selected once. Preview faces use the same preferences
  // and catalogue snapshot; animation never makes repeated draw requests.
  if (params.get("preview") === "1" && result.food) {
    const previewFoods = drinkOnly || result.foodCount < 2 ? foods : foods.filter(food => food.id !== result.food!.id);
    let previousFood = Number(params.get("previousFood")) || 0;
    let previousDrink = result.drink?.id || 0;
    result.previews = Array.from({ length: 5 }, () => {
      const preview = selectMeal(previewFoods, drinks, prefs, drinkOnly ? result.food!.id : previousFood, previousDrink, drinkOnly);
      previousFood = preview.food?.id || 0; previousDrink = preview.drink?.id || 0;
      return preview;
    });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
