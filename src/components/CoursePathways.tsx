import React from 'react';
import { ArrowRight, BookOpen, Brain, GraduationCap, Sparkles } from 'lucide-react';

type Board = 'CBSE' | 'STATE';
type Pathway = {
  id: string;
  name: string;
  subtitle: string;
  gradeRange: string;
  icon: React.ComponentType<{size?:number}>;
  highlights: string[];
};

const pathwaysFor = (grade:number):Pathway[] => {
  const core:Pathway = grade<=5
    ? {id:'foundation',name:'Foundation Learning',subtitle:'Build number sense, reading and curiosity',gradeRange:'Classes 1–5',icon:BookOpen,highlights:['Mathematics & EVS','English expression','Hands-on activities']}
    : grade<=8
    ? {id:'concept',name:'Concept Mastery',subtitle:'Understand the why behind every topic',gradeRange:'Classes 6–8',icon:Brain,highlights:['Mathematics & Science','Concept checkpoints','Teacher-guided practice']}
    : {id:'board',name:'Board Preparation',subtitle:'Strengthen prerequisites and exam technique',gradeRange:'Classes 9–10',icon:GraduationCap,highlights:['Mathematics & Science','Revision and weekly checks','Step-by-step answer practice']};
  const extras:Pathway[]=grade<=5?[]:[
    {id:'diagnostic',name:'Learning Compass',subtitle:'Understand and bridge concept gaps',gradeRange:grade===7?'Class 7 Maths pilot':'Phased rollout',icon:Sparkles,highlights:['Concept diagnosis','Teacher intervention','Personalized practice']}
  ];
  return [core,...extras];
};

export const CoursePathways:React.FC<{
  grade:number;
  board:Board;
  onGradeChange:(grade:number)=>void;
  onBoardChange:(board:Board)=>void;
  onBrowse:()=>void;
}> = ({grade,board,onGradeChange,onBoardChange,onBrowse}) => {
 const pathways=pathwaysFor(grade);
 return <section className="vg-course-discovery" aria-labelledby="vg-courses-title">
  <div className="vg-course-intro">
   <div className="ribbon-banner">FIND YOUR LEARNING PATH</div>
   <h2 id="vg-courses-title">The right learning support for every class</h2>
   <p>Choose a class and board to explore age-appropriate academic coaching. Programme details are indicative; actual enrolment and availability are confirmed by our team.</p>
  </div>
  <div className="vg-course-filters" role="group" aria-label="Find class programmes">
   <label>Class
    <select value={grade} onChange={e=>onGradeChange(Number(e.target.value))} aria-label="Choose class">
     {Array.from({length:10},(_,i)=>i+1).map(n=><option key={n} value={n}>Class {n}</option>)}
    </select>
   </label>
   <label>School board
    <select value={board} onChange={e=>onBoardChange(e.target.value as Board)} aria-label="Choose school board">
     <option value="CBSE">CBSE</option>
     <option value="STATE">Karnataka State Board</option>
    </select>
   </label>
   <button type="button" className="btn btn-teal" onClick={onBrowse}>
    Explore Class {grade} syllabus <ArrowRight size={16}/>
   </button>
  </div>
  <div className="vg-course-grid">
   {pathways.map(pathway=><article className="vg-course-card" key={pathway.id}>
    <div className="vg-course-icon"><pathway.icon size={23}/></div>
    <div className="vg-course-kicker">{pathway.gradeRange} · {board==='STATE'?'Karnataka State Board':'CBSE'}</div>
    <h3>{pathway.name}</h3>
    <p>{pathway.subtitle}</p>
    <ul>{pathway.highlights.map(h=><li key={h}>{h}</li>)}</ul>
    <button type="button" className="vg-course-link" onClick={onBrowse}>
     View curriculum <ArrowRight size={16}/>
    </button>
   </article>)}
  </div>
 </section>;
};