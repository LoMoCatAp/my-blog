"use client";

import {useEffect,useRef} from "react";
import {mountProjectMotion} from "@/lib/project-motion";
import CatIcon from "./icons/CatIcon";
import TypingText from "./TypingText";
import ProjectCard from "./ProjectCard";
import {useI18n} from "./I18nProvider";
import {projects,otherProjects,type Project} from "@/lib/projects";
import "./Portfolio.css";

export default function Portfolio(){
  const {lang}=useI18n();
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>root.current?mountProjectMotion(root.current):undefined,[]);
  const title=lang==='en'?"Hi, I'm Lomo.":"你好，我是洛陌。";
  const moreIcons:Project["icon"][]=['tiles','tiles','chat','desktop'];
  const panels=[...projects,...otherProjects.map((p,i)=>({...p,description:p.note,descriptionEn:p.noteEn,icon:moreIcons[i]}))];
  return <div ref={root} className="portfolio">
    <section className="portfolio-intro">
      <div className="portfolio-cat"><CatIcon size={92} className="fill-[var(--accent)]"/></div>
      <div className="portfolio-heading"><p className="portfolio-kicker">LomoCat</p><h1 aria-label={title}><TypingText text={title} speed={100}/></h1></div>
    </section>
    <h2 className="portfolio-projects-title" id="projects-title">Projects</h2>
    <section className="project-panels" aria-labelledby="projects-title">
      <div className="project-column">{panels.filter((_,i)=>i%2===0).map(p=><ProjectCard key={p.repo} project={{...p,description:lang==='en'?p.descriptionEn:p.description}} side="left" order={panels.indexOf(p)}/>)}</div>
      <div className="project-column project-column-right">{panels.filter((_,i)=>i%2===1).map(p=><ProjectCard key={p.repo} project={{...p,description:lang==='en'?p.descriptionEn:p.description}} side="right" order={panels.indexOf(p)}/>)}</div>
    </section>
    <div className="project-track photo-credit-track" data-side="center"><p className="photo-credit">{lang==='en'?"Cat photos by me and my friends.":"猫片来自博主与朋友们。"}</p></div>
  </div>;
}
