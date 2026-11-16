import React,{useCallback,useEffect,useState} from 'react';
import { ArrowRight, BookOpenCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { FlashcardItem } from '../types';

export const PracticeArena: React.FC = () => {
 const {authToken}=useApp();
 const token=authToken||'';
 const [cards,setCards]=useState<FlashcardItem[]>([]);
 const [index,setIndex]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const [subject,setSubject]=useState('All');
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');

 const load=useCallback(async(signal?:AbortSignal)=>{
  setLoading(true);setError('');setNotice('');
  if(!token){setError('Please sign in with a student account to practise.');setLoading(false);return;}
  try{
   const result=await fetch('/api/v1/school/practice/flashcards',{signal,headers:{Authorization:'Bearer '+token}});
   if(!result.ok)throw new Error('Unable to load your practice cards ('+result.status+').');
   const data:unknown=await result.json();
   if(!Array.isArray(data))throw new Error('The practice response was not valid.');
   if(!signal?.aborted){setCards(data as FlashcardItem[]);setIndex(0);setRevealed(false);}
  }catch(e){
   if(!signal?.aborted&&(!(e instanceof Error)||e.name!=='AbortError'))
    setError(e instanceof Error?e.message:'Practice could not be loaded.');
  }finally{if(!signal?.aborted)setLoading(false);}
 },[token]);
 useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[load]);
 const filtered=subject==='All'?cards:cards.filter(c=>c.subject===subject);
 const current=filtered[index%Math.max(filtered.length,1)];
 const subjects=['All',...new Set(cards.map(c=>c.subject))];
 async function review(correct:boolean){
  if(!current||saving)return;
  setSaving(true);setError('');setNotice('');
  try{
   const response=await fetch('/api/v1/school/practice/flashcards/'+encodeURIComponent(current.id)+'/review',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
    body:JSON.stringify({isCorrect:correct})
   });
   const body=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(body.message||'Your practice result could not be saved.');
   if(!Number.isInteger(body.newBoxLevel))throw new Error('The server did not confirm the new review level.');
   setCards(prev=>prev.map(c=>c.id===current.id?{...c,boxLevel:body.newBoxLevel}:c));
   setRevealed(false);
   setIndex(prev=>filtered.length>0?(prev+1)%filtered.length:0);
   setNotice('Review recorded. Your next practice card is ready.');
  }catch(e){setError(e instanceof Error?e.message:'Could not record this answer. Please retry.');}
  finally{setSaving(false);}
 }
 return <section className="vg-practice">
  <div className="b" style={{background:'var(--color-navy-light)',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
   <div><h2 className="h2"><BookOpenCheck size={21} style={{verticalAlign:'middle',marginRight:8}}/>Daily Practice</h2><p className="t-muted">Review one concept at a time. Mark whether you recalled it correctly to build a reliable practice habit.</p></div>
   <span className="chip chip-navy">5-box spaced revision</span>
  </div>
  {loading&&<div className="b" role="status">Loading practice cards…</div>}
  {error&&<div className="b" role="alert" style={{borderColor:'var(--color-error)'}}>{error} <button className="ghost" type="button" onClick={()=>void load()}>Try again</button></div>}
  {notice&&<div className="b" role="status">{notice}</div>}
  {!loading&&!error&&cards.length===0&&<div className="b">No practice cards have been assigned to your account yet. Ask your teacher to add targeted practice.</div>}
  {cards.length>0&&!loading&&<div className="vg-practice-filter" role="group" aria-label="Filter practice cards">
   {subjects.map(name=><button key={name} type="button" className={subject===name?'btn btn-teal':'ghost'} onClick={()=>{setSubject(name);setIndex(0);setRevealed(false);}}>{name}</button>)}
  </div>}
  {cards.length>0&&!loading&&<div className="vg-practice-levels" aria-label="Cards in each practice level">
   {[1,2,3,4,5].map(level=><div key={level} className="b"><strong>{cards.filter(c=>c.boxLevel===level).length}</strong><span>Level {level}</span></div>)}
  </div>}
  {current&&!loading&&<>
   <div className="vg-practice-card">
    <div className="vg-practice-top"><span className="chip chip-navy">{current.subject} · {current.conceptName}</span><span className="chip">Review level {current.boxLevel}</span></div>
    <p className="vg-practice-kicker">{revealed?'ANSWER & EXPLANATION':'THINK BEFORE REVEALING'}</p>
    <h3>{revealed?current.backAnswer:current.frontPrompt}</h3>
    {revealed&&<p>{current.explanation}</p>}
    <div className="vg-practice-actions">
     {!revealed?<button type="button" className="btn btn-teal" onClick={()=>setRevealed(true)}>Reveal explanation <ArrowRight size={17}/></button>:<>
      <button type="button" className="ghost" disabled={saving} onClick={()=>void review(false)}><RotateCcw size={16}/> Need more practice</button>
      <button type="button" className="btn btn-teal" disabled={saving} onClick={()=>void review(true)}><CheckCircle2 size={16}/> I recalled it correctly</button>
     </>}
    </div>
   </div>
   <p className="t-muted" style={{textAlign:'center'}}>Card {(index%filtered.length)+1} of {filtered.length} · Practice is private and linked to your student account</p>
  </>}
 </section>;
};