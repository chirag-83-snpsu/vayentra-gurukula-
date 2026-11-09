import React,{useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpenCheck,CheckCircle2,Eye,EyeOff,GraduationCap,LockKeyhole,ShieldCheck,Users} from 'lucide-react';
import {Logo} from '../components/Logo';
import {useApp} from '../context/AppContext';
type Audience='student'|'parent'|'staff';

/** The public sign-in page. Only the backend determines the real account role and enrolled class. */
export const LoginPage:React.FC=()=>{
 const {login,isAuthenticated,currentUser}=useApp();
 const [audience,setAudience]=useState<Audience>('student');
 const [grade,setGrade]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [visible,setVisible]=useState(false);
 const [submitting,setSubmitting]=useState(false);
 const [error,setError]=useState('');
 const choose=(next:Audience)=>{setAudience(next);setError('');};
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(submitting)return;
  if(audience==='student'&&!(Number(grade)>=1&&Number(grade)<=10)){
   setError('Select the class you are currently enrolled in.');return;
  }
  setSubmitting(true);setError('');
  try{
   await login(email.trim(),password,{audience,grade:audience==='student'?Number(grade):undefined});
   window.location.assign('/app');
  }catch(e){
   setError(e instanceof Error?e.message:'Could not sign in. Please try again.');
   setSubmitting(false);
  }
 }
 return <div className="vg-login-page">
  <header className="vg-login-header"><div className="vg-login-header-inner">
   <a href="/" aria-label="Return to Vayentra Gurukula homepage"><Logo variant="header" height={48}/></a>
   <a className="vg-login-back" href="/"><ArrowLeft size={16}/> Back to website</a>
  </div></header>
  <main className="vg-login-main">
   <aside className="vg-login-showcase">
    <div className="vg-login-showcase-icon"><GraduationCap size={32}/></div>
    <div className="vg-login-showcase-eyebrow">YOUR LEARNING JOURNEY CONTINUES</div>
    <h1>Every concept is a new possibility.</h1>
    <p>A dedicated learning environment for enrolled Vayentra Gurukula students, their families and the teaching team.</p>
    <div className="vg-login-benefits">
     <div><BookOpenCheck size={21}/><span>Find lessons and learning resources for your class.</span></div>
     <div><CheckCircle2 size={21}/><span>Continue your homework, practice and progress.</span></div>
     <div><ShieldCheck size={21}/><span>Access records linked to your own account.</span></div>
    </div>
    <span className="vg-login-aside-foot">VAYENTRA GURUKULA · BENGALURU</span>
   </aside>

   <section className="vg-login-form-section" aria-labelledby="vg-login-title">
    <div className="vg-login-card">
     <div className="vg-login-kicker">WELCOME BACK</div>
     <h2 id="vg-login-title">Sign in to Vayentra</h2>
     <p>Choose your account type and enter your registered details.</p>
     {isAuthenticated&&currentUser?<div className="vg-login-signed-in">
      <CheckCircle2 size={20}/><div><strong>You're signed in as {currentUser.name}</strong><p>Continue to your authorized learning space.</p></div>
      <a href="/app" className="vg-button-primary">Open dashboard <ArrowRight size={16}/></a>
     </div>:<>
      <div className="vg-login-audiences" role="group" aria-label="Account type">
       <button type="button" className={audience==='student'?'is-selected':''} aria-pressed={audience==='student'} onClick={()=>choose('student')}><GraduationCap size={18}/> Student</button>
       <button type="button" className={audience==='parent'?'is-selected':''} aria-pressed={audience==='parent'} onClick={()=>choose('parent')}><Users size={18}/> Parent</button>
       <button type="button" className={audience==='staff'?'is-selected':''} aria-pressed={audience==='staff'} onClick={()=>choose('staff')}><ShieldCheck size={18}/> Faculty / Staff</button>
      </div>
      <form onSubmit={e=>void submit(e)} className="vg-login-form">
       {audience==='student'&&<div className="vg-login-field">
        <label htmlFor="vg-student-class">Which class are you studying in?</label>
        <select id="vg-student-class" required value={grade} onChange={e=>setGrade(e.target.value)}>
         <option value="">Select your class</option>
         {Array.from({length:10},(_,i)=>i+1).map(n=><option key={n} value={n}>Class {n}</option>)}
        </select>
        <small>We check this against your enrolled student record. Changing it cannot change your account.</small>
       </div>}
       <div className="vg-login-field">
        <label htmlFor="vg-login-email">Registered email address</label>
        <input id="vg-login-email" type="email" autoComplete="username" placeholder={audience==='student'?'student@example.com':'name@example.com'} value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/>
       </div>
       <div className="vg-login-field">
        <label htmlFor="vg-login-password">Password</label>
        <div className="vg-login-password">
         <input id="vg-login-password" type={visible?'text':'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={1}/>
         <button type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Hide password':'Show password'}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button>
        </div>
       </div>
       {error&&<div className="vg-login-error" role="alert">{error}</div>}
       <button type="submit" className="vg-login-submit" disabled={submitting}>
        {submitting?'Verifying your account…':'Sign in to my account'} {!submitting&&<ArrowRight size={18}/>}
       </button>
       <div className="vg-login-footnote"><LockKeyhole size={15}/> Account access is based on verified institute enrollment and assigned permissions.</div>
      </form>
      <div className="vg-login-help"><strong>New to Vayentra Gurukula?</strong><p>Speak with the admissions team to register before requesting online access.</p></div>
     </>}
    </div>
   </section>
  </main>
  <footer className="vg-login-footer"><span>© {new Date().getFullYear()} Vayentra Ventures Pvt. Ltd.</span><a href="/">Return to Vayentra Gurukula</a></footer>
 </div>;
};