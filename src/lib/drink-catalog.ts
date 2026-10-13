import type { Drink, DrinkKind } from "./meal-types";

// A small, maintainable catalogue of named products, not a live regional menu.
// These links verify product names; pairing rules are our own taste suggestions.
const sources = {
  mixue: "https://www.mxbc.com/product_strength.html",
  luckin: "https://investor.luckincoffee.com/static-files/0de49c0b-dd16-4052-82ed-a7fbcfeee48a",
  cotti: "https://www.cotticoffee.com/static/2-1-coffee.jpg",
  guming: "https://www.hkexnews.hk/listedco/listconews/sehk/2025/0204/2025020400011.pdf",
  chabaidao: "https://www.chabaidao.com/m/product/index/id/2.html",
  chagee: "https://chagee.com.hk/product/fresh-milk-tea-series",
  hsay: "https://www1.hkexnews.hk/listedco/listconews/sehk/2025/0428/2025042800056_c.pdf",
  heytea: "https://static.foodtalks.cn/file/post/3ea94e6ee4efeabe39eac13c43bf6c299996/%E5%96%9C%E8%8C%B6%E5%8D%81%E5%91%A8%E5%B9%B4%E6%8A%A5%E5%91%8A.pdf",
  naixue: "https://ir.naixue.com/media/4lbnfdlc/%E5%A5%88%E9%9B%AA%E7%9A%84%E8%8C%B62021%E5%B9%B4%E5%B9%B4%E5%BA%A6%E4%B8%9A%E7%BB%A9%E5%8F%91%E5%B8%83%E4%BC%9A-v16.pdf",
  starbucks: "https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/",
};
type Seed = Omit<Drink, "id">;
const item = (brand: string, name: string, kind: DrinkKind, ingredients: string, source_url: string): Seed =>
  ({ brand, name, kind, ingredients, avoid_tags: ingredients, source_url, active: 1 });
export const DRINK_CATALOG: Seed[] = [
  item("蜜雪冰城", "冰鲜柠檬水", "fruit-tea", "柠檬", sources.mixue),
  item("蜜雪冰城", "茉莉奶绿", "milk-tea", "茉莉,绿茶,牛乳,奶", sources.mixue),
  item("蜜雪冰城", "草莓摇摇奶昔", "milk-tea", "草莓,茶,冰淇淋,奶", sources.mixue),
  item("蜜雪冰城", "雪王雪顶咖啡", "coffee", "咖啡,冰淇淋,奶", sources.mixue),
  item("瑞幸", "生椰拿铁", "coffee", "咖啡,椰乳,椰子", sources.luckin),
  item("瑞幸", "鲜萃轻轻茉莉", "milk-tea", "茉莉,茶,牛乳,奶", sources.luckin),
  item("瑞幸", "鲜萃轻轻龙井", "milk-tea", "龙井,茶,牛乳,奶", sources.luckin),
  item("库迪", "生椰拿铁", "coffee", "咖啡,椰乳,椰子", sources.cotti),
  item("库迪", "经典拿铁", "coffee", "咖啡,牛乳,奶", sources.cotti),
  item("库迪", "青提柠檬美式", "coffee", "咖啡,青提,葡萄,柠檬", sources.cotti),
  item("库迪", "香柠美式", "coffee", "咖啡,柠檬", sources.cotti),
  item("古茗", "云岭茉莉白", "milk-tea", "茉莉,茶,牛乳,奶", sources.guming),
  item("茶百道", "杨枝甘露", "fruit-tea", "芒果,西柚,椰乳,奶", sources.chabaidao),
  item("茶百道", "青提茉莉", "fruit-tea", "青提,葡萄,茉莉,茶", sources.chabaidao),
  item("茶百道", "西瓜啵啵", "fruit-tea", "西瓜,茶", sources.chabaidao),
  item("霸王茶姬", "伯牙绝弦", "milk-tea", "茉莉,绿茶,牛乳,奶", sources.chagee),
  item("霸王茶姬", "桂馥兰香", "milk-tea", "桂花,乌龙茶,牛乳,奶", sources.chagee),
  item("霸王茶姬", "万里木兰", "milk-tea", "红茶,牛乳,奶", sources.chagee),
  item("沪上阿姨", "杨枝甘露", "fruit-tea", "芒果,西柚,椰乳,奶", sources.hsay),
  item("沪上阿姨", "厚芋泥波波奶茶", "milk-tea", "芋泥,芋头,珍珠,茶,奶", sources.hsay),
  item("沪上阿姨", "桃桃蜜柚", "fruit-tea", "桃,蜜柚,茶", sources.hsay),
  item("沪上阿姨", "浅浅清茉", "milk-tea", "茉莉,茶,牛乳,奶", sources.hsay),
  item("喜茶", "多肉葡萄", "fruit-tea", "葡萄,茶", sources.heytea),
  item("喜茶", "芝芝莓莓", "fruit-tea", "草莓,茶,芝士,奶", sources.heytea),
  item("奈雪的茶", "霸气玉油柑", "fruit-tea", "油柑,茶", sources.naixue),
  item("奈雪的茶", "鸭屎香宝藏茶", "milk-tea", "乌龙茶,牛乳,奶", sources.naixue),
  item("星巴克", "拿铁", "coffee", "咖啡,牛乳,奶", sources.starbucks),
  item("星巴克", "美式咖啡", "coffee", "咖啡", "https://www.starbucks.com.cn/menu/beverages/espresso/caffe-americano/"),
  item("星巴克", "卡布奇诺", "coffee", "咖啡,牛乳,奶", sources.starbucks),
  item("星巴克", "馥芮白", "coffee", "咖啡,牛乳,奶", sources.starbucks),
];
