import React,{useEffect,useState} from 'react';

type Item={id:string;question:string;options:string[];correctIndex:number;explanation:string;misconceptionCode:string;position:number;status:string};
export const CbseLessonQuestionReview:React.FC<{topicId:string;token:string}> = ({topicId,token})=>{
 const [items,setItems]=useState<Item[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{
  const ctrl=new AbortController();setLoading(true);setError('');setItems([]);
  fetch('/api/v1/cbse/teacher/topics/'+encodeURIComponent(topicId)+'/practice',
   {signal:ctrl.signal,headers:{Authorization:'Bearer '+token}})
   .then(async res=>{const data=await res.json();if(!res.ok)throw new Error(data.message||data.code||'Failed to load teacher review questions.');return data;})
   .then(data=>{if(!ctrl.signal.aborted)setItems(data.questions||[]);})
   .catch(e=>{if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Unable to load questions.');})
   .finally(()=>{if(!ctrl.signal.aborted)setLoading(false);});
  return()=>ctrl.abort();
 },[topicId,token]);
 return <section className="vg-cbse-faculty-quiz">
  <h4>Teacher-only concept check and answer key</h4>
  <p className="t-muted">Check every correct response, distractor, explanation, age suitability and misconception tag before approving a video.</p>
  {loading&&<p role="status">Loading questions…</p>}
  {error&&<p role="alert" style={{color:'var(--color-error)'}}>{error}</p>}
  {!loading&&!error&&items.length===0&&<p>No questions drafted for this topic yet.</p>}
  {items.map((item,i)=><div key={item.id} className="vg-cbse-faculty-item">
   <strong>{i+1}. {item.question}</strong>
   <ol type="A">{item.options.map((opt,j)=><li key={j}>{opt}{j===item.correctIndex?' ✓ correct':''}</li>)}</ol>
   <p><strong>Why:</strong> {item.explanation}</p>
   <p className="t-tiny">Targeted learning signal: {item.misconceptionCode.replace(/_/g,' ').toLowerCase()} · Status: {item.status}</p>
  </div>)}
 </section>;
};