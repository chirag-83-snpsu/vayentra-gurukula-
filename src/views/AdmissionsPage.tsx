import React,{useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,GraduationCap,LockKeyhole,ShieldCheck} from 'lucide-react';
import '../styles/admissions.css';

type Props={onBack:()=>void;onLogin:()=>void};
type Board='CBSE'|'STATE';
export const AdmissionsPage:React.FC<Props>=({onBack,onLogin})=>{
 const initialGrade=Number(new URLSearchParams(window.location.search).get('class'));
 const [grade,setGrade]=useState(Number.isInteger(initialGrade)&&initialGrade>=1&&initialGrade<=10?String(initialGrade):'');
 const [board,setBoard]=useState<Board>('CBSE');
 const [name,setName]=useState('');
 const [phone,setPhone]=useState('');
 const [email,setEmail]=useState('');
 const [message,setMessage]=useState('');
 const [consent,setConsent]=useState(false);
 const [honeypot,setHoneypot]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [reference,setReference]=useState('');
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{
   const response=await fetch('/api/v1/admissions/enquiries',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({guardianName:name,contactPhone:phone,email,grade:Number(grade),board,message,consent,honeypot})
   });
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(result.message||'We could not submit the enquiry. Please try again later.');
   if(!result.received)throw new Error('The server did not confirm that your enquiry was received.');
   setReference(result.reference||'Submitted');
  }catch(err){setError(err instanceof Error?err.message:'Enquiry submission failed.');}
  finally{setBusy(false);}
 }
 return <main className="vgpa">
  <header className="vgpa-header">
   <button type="button" onClick={onBack}><ArrowLeft size={18}/> Back to Vayentra</button>
   <span className="vgpa-brand"><span>✦</span> VAYENTRA <b>GURUKULA</b></span>
   <button type="button" onClick={onLogin}>Student login <LockKeyhole size={16}/></button>
  </header>
  <div className="vgpa-wrap">
   <section className="vgpa-intro">
    <span className="vgpa-kicker">ADMISSIONS · BENGALURU</span>
    <h1>A better learning journey starts with a conversation.</h1>
    <p>Tell us which class and board you're looking for. Our academic team can review your enquiry and discuss available tuition support.</p>
    <div className="vgpa-highlights">
     <span><GraduationCap size={19}/> Classes 1–10</span>
     <span><BookOpen size={19}/> Concept-based teaching</span>
     <span><ShieldCheck size={19}/> Parent / guardian enquiries only</span>
    </div>
    <div className="vgpa-note"><strong>What happens next?</strong><p>Your enquiry is saved in our private admissions inbox. It is not an admission confirmation, seat reservation, or promise of an immediate callback.</p></div>
   </section>
   <section className="vgpa-form-card" aria-labelledby="vgpa-title">
    {reference?<div className="vgpa-confirmation" role="status">
      <CheckCircle2 size={46}/><h2 id="vgpa-title">Your enquiry was received.</h2>
      <p>Thank you. Our team can now review your request and contact you using the information provided.</p>
      <p className="vgpa-reference">Reference: <strong>{reference}</strong></p>
      <button type="button" className="vgpa-submit" onClick={onBack}>Return to homepage <ArrowRight size={18}/></button>
     </div>:<>
      <div className="vgpa-form-heading"><span>REQUEST INFORMATION</span><h2 id="vgpa-title">Let's get to know your learning needs.</h2><p>For parents and guardians. Please don't enter the child's name or sensitive information here.</p></div>
      <form onSubmit={submit} className="vgpa-form">
       <label htmlFor="vgpa-name">Parent / guardian name *</label>
       <input id="vgpa-name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/>
       <label htmlFor="vgpa-phone">Contact number *</label>
       <input id="vgpa-phone" autoComplete="tel" type="tel" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210"/>
       <label htmlFor="vgpa-email">Email address (optional)</label>
       <input id="vgpa-email" type="email" autoComplete="email" maxLength={120} value={email} onChange={e=>setEmail(e.target.value)} placeholder="parent@example.com"/>
       <div className="vgpa-form-cols">
        <div><label htmlFor="vgpa-class">Interested class *</label><select id="vgpa-class" required value={grade} onChange={e=>setGrade(e.target.value)}><option value="">Choose class</option>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>Class {i+1}</option>)}</select></div>
        <div><label htmlFor="vgpa-board">School board *</label><select id="vgpa-board" value={board} onChange={e=>setBoard(e.target.value as Board)}><option value="CBSE">CBSE</option><option value="STATE">Karnataka State Board</option></select></div>
       </div>
       <label htmlFor="vgpa-message">What would you like to know? (optional)</label>
       <textarea id="vgpa-message" maxLength={400} rows={3} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Subjects, batch timing or teaching approach"/>
       <div className="vgpa-honeypot" aria-hidden="true"><label htmlFor="vgpa-website">Leave blank</label><input id="vgpa-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)}/></div>
       <label className="vgpa-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I am a parent or guardian, and I consent to Vayentra Gurukula storing my contact details to respond to this admissions enquiry. I understand I can request deletion of my enquiry.</span></label>
       {error&&<p className="vgpa-error" role="alert">{error}</p>}
       <button type="submit" className="vgpa-submit" disabled={busy||!consent||!grade}>{busy?'Submitting…':'Send admissions enquiry'} <ArrowRight size={18}/></button>
       <p className="vgpa-privacy"><ShieldCheck size={15}/> Your information is saved privately, not displayed on the public website. Please avoid sharing a child's personal details.</p>
      </form>
     </>}
   </section>
  </div>
 </main>;
};
