"use client";

import {useEffect,useRef,type CSSProperties} from "react";
import {mountProjectHover} from "@/lib/project-hover";
import type {Project} from "@/lib/projects";
import {PROJECT_PHOTOS} from "@/lib/project-photos";

export function ProjectIcon({type}:{type:Project["icon"]}) {
  const paths={
    desktop:<><rect x="3" y="4" width="26" height="19" rx="4"/><path d="M11 29h10m-5-6v6"/><path d="m16 8 1.6 3.3 3.7.5-2.7 2.6.6 3.7-3.2-1.8-3.2 1.8.6-3.7-2.7-2.6 3.7-.5Z"/></>,
    book:<><path d="M16 8c-4-4-9-4-13-3v22c4-1 9-1 13 3 4-4 9-4 13-3V5c-4-1-9-1-13 3Z"/><path d="M16 8v22M7 11h4m-4 5h4m10-5h4m-4 5h4"/></>,
    chat:<><path d="M5 4h22a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H13l-7 5v-5H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M9 11h14M9 17h9"/></>,
    lock:<><rect x="6" y="13" width="20" height="17" rx="4"/><path d="M10 13V8a6 6 0 0 1 12 0v5m-6 6v5"/></>,
    tiles:<><rect x="4" y="2" width="24" height="28" rx="4"/><circle cx="16" cy="10" r="2"/><circle cx="11" cy="21" r="2"/><circle cx="21" cy="21" r="2"/></>,
  };
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export default function ProjectCard({project,side,order}:{project:{name:string;repo:string;stack:string;description:string;icon:Project["icon"]};side:"left"|"right";order:number}) {
  const ref=useRef<HTMLDivElement>(null);
  const cardRef=useRef<HTMLAnchorElement>(null);
  useEffect(()=>ref.current&&cardRef.current?mountProjectHover(ref.current,cardRef.current):undefined,[]);
  const photo=PROJECT_PHOTOS[order%PROJECT_PHOTOS.length];
  const upright='orientation' in photo&&photo.orientation==='upright';
  const fullFrame=!upright;
  const portrait='frame' in photo&&photo.frame==='portrait';
  const photoFolder='folder' in photo?photo.folder:'project-cats-v9';
  return <div ref={ref} className="project-track" data-side={side} style={{order}}>
    <a ref={cardRef} className="project-panel" href={`https://github.com/LoMoCatAp/${project.repo}`} target="_blank" rel="noopener noreferrer" draggable={false}>
      <div className="project-surface">
      <div className="project-cover" data-upright={upright||undefined} data-full-frame={fullFrame||undefined} data-portrait={portrait||undefined}><img src={`/${photoFolder}/${photo.file}.webp`} alt={photo.alt} width="800" height="600" loading={order<2?'eager':'lazy'} decoding="async" draggable={false} style={{objectPosition:photo.position,'--photo-angle':`${photo.angle}deg`} as CSSProperties}/></div>
      <div className="project-panel-body">
        <div className="project-panel-title"><h2>{project.name}</h2><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></div>
        <p className="project-stack">{project.stack}</p><p>{project.description}</p>
      </div>
      <span className="project-prism" aria-hidden="true"/>
      </div>
    </a>
  </div>;
}
