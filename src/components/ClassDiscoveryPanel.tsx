import React from 'react';
import {ArrowUpRight,BookOpen,GraduationCap,MessageCircle} from 'lucide-react';
import '../styles/class-discovery.css';
type Board='CBSE'|'STATE';
type Props={grade:number;board:Board;onGradeChange:(grade:number)=>void;onExplore:()=>void;onAdmissions:(grade:number)=>void};
function subjects(grade:number){
 if(grade<=2)return ['Foundational Mathematics','English & reading','Everyday observations'];
 if(grade<=5)return ['Mathematics','English & expression','Environmental learning'];
 if(grade<=8)return ['Mathematics','Science','English','Social Science'];
 return ['Mathematics','Science','English','Social Science'];
}
const focus=(grade:number)=>grade<=2
 ?'Develop counting, reading habits and early confidence through guided activities.'
 :grade<=5
 ?'Strengthen foundational concepts, reading comprehension and curiosity.'
 :grade<=8
 ?'Explore reasoning, experiments, diagrams and concept-based practice.'
 :'Build prerequisite understanding, answer-writing skills and purposeful board preparation.';
export const ClassDiscoveryPanel:React.FC<Props>=({grade,board,onGradeChange,onExplore,onAdmissions})=>{
 return <div className="vgp-class-discovery">
  <div className="vgp-class-heading">
   <div><span>EXPLORE THE RIGHT STARTING POINT</span><h3>What class are you in?</h3></div>
   <p>Choose your class to explore an example of the learning focus. Contact us to confirm available subjects and batches.</p>
  </div>
  <div className="vgp-class-buttons" role="group" aria-label="Choose school class">
   {Array.from({length:10},(_,i)=>i+1).map(n=><button key={n} type="button" aria-pressed={grade===n} className={grade===n?'active':''} onClick={()=>onGradeChange(n)}>{String(n).padStart(2,'0')}</button>)}
  </div>
  <div className="vgp-class-details">
   <div className="vgp-class-detail-intro"><div><GraduationCap size={18}/> CLASS {grade} · {board==='CBSE'?'CBSE':'KARNATAKA STATE BOARD'}</div><h4>Build understanding at your stage.</h4><p>{focus(grade)}</p></div>
   <div className="vgp-class-subjects"><span>ILLUSTRATIVE FOCUS AREAS</span><div>{subjects(grade).map(subject=><span key={subject}><BookOpen size={14}/>{subject}</span>)}</div></div>
   <div className="vgp-class-actions">
    <button className="vgp-class-explore" type="button" onClick={onExplore}>Explore available resources <ArrowUpRight size={17}/></button>
    <button className="vgp-class-enquire" type="button" onClick={()=>onAdmissions(grade)}>Enquire for Class {grade} <MessageCircle size={17}/></button>
   </div>
  </div>
  <p className="vgp-class-disclaimer">This is a learning-focus preview, not a verified live timetable, fee quotation or seat availability statement.</p>
 </div>;
};