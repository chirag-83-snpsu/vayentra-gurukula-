import React,{useEffect,useState} from 'react';
import {CheckCircle2,ClipboardCheck,RotateCcw} from 'lucide-react';

type Question={id:string;position:number;question:string;options:string[]};
type Feedback={itemId:string;isCorrect:boolean;correctIndex:number;explanation:string;focusSignal:string|null};
type QuizResponse={topicId:string;questions:Question[]};
type Result={correct:number;total:number;feedback:Feedback[];message:string};

/** A low-stakes concept check. Responses are graded by the server; no minor's data is stored. */
export const CbseLessonCheck:React.FC<{topicId:string}> = ({topicId})=>{
 const [items,setItems]=useState<Question[]>([]);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [result,setResult]=useState<Result|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  const abort=new AbortController();
  setLoading(true);setItems([]);setAnswers({});setResult(null);setError('');
  fetch('/api/v1/cbse/topics/'+encodeURIComponent(topicId)+'/practice',{signal:abort.signal})
   .then(async response=>{
    const body=await response.json();
    if(!response.ok)throw new Error(body.message||body.code||'Practice is unavailable.');
    return body as QuizResponse;
   })
   .then(data=>{if(!abort.signal.aborted)setItems(data.questions||[]);})
   .catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Unable to load questions.');})
   .finally(()=>{if(!abort.signal.aborted)setLoading(false);});
  return()=>abort.abort();
 },[topicId]);
 async function submit(){
  if(busy||items.some(q=>answers[q.id]===undefined))return;
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/v1/cbse/topics/'+encodeURIComponent(topicId)+'/practice/check',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({responses:items.map(q=>({itemId:q.id,selectedIndex:answers[q.id]}))})
   });
   const body=await response.json();
   if(!response.ok)throw new Error(body.message||body.code||'Could not check answers.');
   setResult(body as Result);
  }catch(e){setError(e instanceof Error?e.message:'Unable to check your answers.');}
  finally{setBusy(false);}
 }
 return <section className="b vg-cbse-check" aria-labelledby="vg-check-title">
  <h3 id="vg-check-title"><ClipboardCheck size={19} style={{verticalAlign:'middle',marginRight:8}}/>Check Your Understanding</h3>
  <p className="t-muted">Three short questions. Review your reasoning and ask a teacher for help where needed. This practice is not ranked or saved to your academic record.</p>
  {loading&&<p role="status">Loading concept questions…</p>}
  {error&&<p role="alert" style={{color:'var(--color-error)'}}>{error}</p>}
  {!loading&&!error&&items.length===0&&<p>Practice questions have not been approved for this lesson.</p>}
  {items.map((q,i)=>{
   const feedback=result?.feedback.find(x=>x.itemId===q.id);
   return <fieldset key={q.id} className="vg-cbse-check-question" disabled={!!result}>
    <legend><strong>{i+1}. {q.question}</strong></legend>
    {q.options.map((option,index)=><label key={index}>
     <input type="radio" name={'lesson-'+q.id} checked={answers[q.id]===index}
      onChange={()=>setAnswers(p=>({...p,[q.id]:index}))} disabled={!!result}/>
     <span>{option}</span>
    </label>)}
    {feedback&&<div className="vg-cbse-check-feedback">
     <strong>{feedback.isCorrect?'Correct':'Review this concept'}:</strong> {feedback.explanation}
     {!feedback.isCorrect&&<p className="t-tiny">Teacher follow-up signal: {feedback.focusSignal?.toLowerCase().replace(/_/g,' ')||'Review steps with teacher'}</p>}
    </div>}
   </fieldset>;
  })}
  {items.length>0&&!loading&&<div className="vg-cbse-check-actions">
   {!result?<button type="button" className="btn btn-teal" disabled={busy||items.some(q=>answers[q.id]===undefined)}
    onClick={()=>void submit()}><CheckCircle2 size={17}/> Check my answers</button>:<>
    <strong>{result.correct}/{result.total} correct</strong>
    <button type="button" className="ghost" onClick={()=>{setResult(null);setAnswers({});}}><RotateCcw size={16}/> Practise again</button>
   </>}
  </div>}
 </section>;
};
