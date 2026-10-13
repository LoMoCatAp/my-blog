import type { Metadata } from "next";
import GameCards from "./GameCards";
import styles from "./games.module.css";

export const metadata: Metadata = {
  title: "小游戏",
  description: "餐食抽签、品牌饮品搭配与联机麻将。",
};

export default function GamesPage() {
  return <section className={styles.page} aria-labelledby="games-heading">
    <h1 id="games-heading">小游戏</h1>
    <GameCards />
  </section>;
}
