"use client";

import {useEffect,useRef,type CSSProperties} from "react";
import {useI18n} from "@/components/I18nProvider";
import {mountProjectHover} from "@/lib/project-hover";
import {mountProjectMotion} from "@/lib/project-motion";
import styles from "./friends.module.css";

export interface FriendLink {id:number;name:string;url:string;description:string}

function siteName(url:string){
  try{return new URL(url).hostname.replace(/^www\./,"");}catch{return url;}
}
function siteColor(url:string){
  const tones=["223,163,107","145,177,184","174,158,198","180,178,125"];
  let hash=0;for(const char of url)hash=(hash*31+char.charCodeAt(0))|0;
  return tones[(hash>>>0)%tones.length];
}

export default function FriendLinks({links}:{links:FriendLink[]}){
  const root=useRef<HTMLElement>(null);
  const {lang}=useI18n();
  useEffect(()=>{
    const element=root.current;if(!element)return;
    const cleanupMotion=mountProjectMotion(element);
    const cleanups=[...element.querySelectorAll<HTMLElement>('[data-friend-track]')].map(track=>{
      const card=track.querySelector<HTMLAnchorElement>('[data-friend-card]');
      return card?mountProjectHover(track,card):()=>{};
    });
    return()=>{cleanupMotion();cleanups.forEach(cleanup=>cleanup());};
  },[links]);

  return <section ref={root} className={styles.page} aria-labelledby="friends-title">
    <header className={styles.header}>
      <h1 id="friends-title">{lang==='en'?'Friends':'友链'}</h1>
      <span className={styles.count} title={lang==='en'?`${links.length} sites`:`${links.length} 个站点`}>{String(links.length).padStart(2,'0')}</span>
    </header>
    {links.length?<div className={`${styles.grid} ${links.length===1?styles.single:''}`}>
      {links.map((link,index)=><div key={link.id} className={`project-track ${styles.track}`} data-friend-track data-side={index%2?'right':'left'}>
        <a data-friend-card className={styles.card} href={link.url} target="_blank" rel="noopener noreferrer" draggable={false} style={{'--friend-rgb':siteColor(link.url)} as CSSProperties}>
          <div className={styles.surface}>
            <div className={styles.orbit} aria-hidden="true"/>
            <div className={styles.identity}>
              <h2>{link.name}</h2>
              <span className={styles.arrow} aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg></span>
            </div>
            {link.description&&<p className={styles.description}>{link.description}</p>}
            <div className={styles.address}><span className={styles.dot} aria-hidden="true"/>{siteName(link.url)}<span className={styles.line} aria-hidden="true"/></div>
          </div>
        </a>
      </div>)}
    </div>:<div className={styles.empty}><span className={styles.emptyMark} aria-hidden="true">↗</span><p>{lang==='en'?'No links yet.':'暂时还没有友链。'}</p></div>}
  </section>;
}
