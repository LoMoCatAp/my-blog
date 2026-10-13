"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { mountProjectHover } from "@/lib/project-hover";
import styles from "./games.module.css";

const games = [
  { title: "今天吃什么", tag: "FOOD", href: "/games/food", stack: "Next.js / SQLite", features: "餐食抽签、品牌饮品搭配", type: "food" },
  { title: "联机麻将", tag: "MAHJONG", href: "/games/mahjong", stack: "Spring Boot / WebSocket", features: "多人房间、山东推倒胡", type: "mahjong" },
] as const;

function GameCard({ game }: { game: typeof games[number] }) {
  const track = useRef<HTMLDivElement>(null), card = useRef<HTMLAnchorElement>(null);
  useEffect(() => track.current && card.current ? mountProjectHover(track.current, card.current) : undefined, []);
  return <div ref={track} className={styles.track}>
    <Link ref={card} href={game.href} className={`${styles.card} ${game.type === "food" ? styles.food : styles.mahjong}`}>
      <div className={styles.surface}>
        <div className={styles.art} aria-hidden="true">
          {game.type === "food" ? <img src="/food-art-v7/bowl.png" width="256" height="256" alt="" draggable={false} /> : <div className={styles.tiles}><span>白</span><span>發</span><span>中</span></div>}
        </div>
        <div className={styles.copy}>
          <span className={styles.kicker}>{game.tag}</span>
          <div className={styles.title}><h2>{game.title}</h2><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg></div>
          <p className={styles.stack}>{game.stack}</p><p>{game.features}</p>
        </div>
        <span className={styles.glow} aria-hidden="true" />
      </div>
    </Link>
  </div>;
}

export default function GameCards() {
  return <div className={styles.grid}>{games.map(game => <GameCard key={game.href} game={game} />)}</div>;
}
