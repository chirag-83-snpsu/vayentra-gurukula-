import React, {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,GraduationCap,LockKeyhole,ShieldCheck} from 'lucide-react';
import {Logo} from '../components/Logo';
import {useApp} from '../context/AppContext';
import '../styles/landing.css';

type Props={onBack:()=>void;onSuccess:()=>void};
export const StudentLoginPage:React.FC<Props>=({onBack,onSuccess})=>{
 const {login,currentUser,isAuthenticated,role,setActiveChildId,parent}=useApp();
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');
 const [grade,setGrade]=useState('');const [board,setBoard]=useState<'CBSE'|'STATE'>('CBSE');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const [loggedIn,setLoggedIn]=useState(false);
 const [childId,setChildId]=useState('');
 useEffect(()=>{
  if(isAuthenticated&&currentUser&&!loggedIn){setLoggedIn(true);}
 },[isAuthenticated,currentUser,loggedIn]);
 useEffect(()=>{
  if(loggedIn&&role==='parent'&&parent.children.length===1&&!childId)setChildId(parent.children[0].id);
 },[loggedIn,role,parent.children,childId]);
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();setError('');setBusy(true);
  try{const user=await login(email.trim(),password);setLoggedIn(true);
   if(user.role!=='student'&&user.role!=='parent'){setError('This sign-in is for students and parents. Use the staff portal for staff access.');}
  }catch(err){setError(err instanceof Error?err.message:'Unable to sign in.');}
  finally{setBusy(false);}
 };
 const isLearner=role==='student'||role==='parent';
 const enrolledGrade=role==='parent'?parent.children.find(c=>c.id===childId)?.grade:undefined;
 const enrolledBoard=role==='parent'?parent.children.find(c=>c.id===childId)?.board:undefined;
 const continueLearning=()=>{
  setError('');
  if(!grade){setError('Please select your class.');return;}
  if(role==='parent'&&!childId){setError('Choose the enrolled learner.');return;}
  if(enrolledGrade&&Number(grade)!==Number(enrolledGrade)){setError('The selected class does not match your registered student profile. Contact the centre to update your enrolment.');return;}
  if(enrolledBoard&&board!==enrolledBoard){setError('The selected board does not match your registered student profile. Contact the centre to update your enrolment.');return;}
  if(role==='parent'&&childId)setActiveChildId(childId);
  onSuccess();
 };
 return <div className="vg-login-page">
  <div className="vg-login-top"><button className="vg-login-back" onClick={onBack}><ArrowLeft size={17}/> Back to website</button><Logo variant="header" height={41}/></div>
  <div className="vg-login-layout">
   <aside className="vg-login-story"><span className="vg-section-label">VAYENTRA GURUKULA LEARNING PORTAL</span><h1>A place to learn.<br/><em>A path to grow.</em></h1><p>Your lessons, your practice and your progress, brought together in one focused learning space.</p>
    <div className="vg-login-story-list"><div><BookOpen size={20}/><span>Class-specific learning resources</span></div><div><GraduationCap size={20}/><span>Concepts explained clearly</span></div><div><ShieldCheck size={20}/><span>Protected student access</span></div></div>
    <div className="vg-login-quote">“Understand the concept. Build the confidence.”</div>
   </aside>
   <section className="vg-login-panel" aria-labelledby="vg-login-heading">
    <span className="vg-login-icon"><LockKeyhole size={25}/></span>
    {!loggedIn||!isAuthenticated?<><span className="vg-section-label">WELCOME BACK</span><h2 id="vg-login-heading">Sign in to your<br/>learning space</h2><p>Use the credentials provided by Vayentra Gurukula.</p>
      <form onSubmit={submit} className="vg-login-form"><label htmlFor="vg-login-email">Email address</label><input id="vg-login-email" type="email" autoComplete="username" placeholder="student@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
       <label htmlFor="vg-login-password">Password</label><input id="vg-login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required/>
       {error&&<div role="alert" className="vg-login-error">{error}</div>}
       <button className="vg-primary-cta" type="submit" disabled={busy}>{busy?'Signing in…':'Sign in securely'}<ArrowRight size={17}/></button>
      </form><div className="vg-login-footnote"><ShieldCheck size={16}/> For enrolled students and parents only. Never share your password.</div>
    </>:isLearner?<><span className="vg-section-label">PERSONALISE YOUR LEARNING</span><h2 id="vg-login-heading">Choose your class</h2><p>Select your enrolled class and board to enter your learning hub.</p>
     <div className="vg-login-form">
      {role==='parent'&&<><label htmlFor="vg-child">Student</label><select id="vg-child" value={childId} onChange={e=>{setChildId(e.target.value);setGrade('');}}><option value="">Select enrolled student</option>{parent.children.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></>}
      <label htmlFor="vg-class">Class</label><select id="vg-class" value={grade} onChange={e=>setGrade(e.target.value)}><option value="">Select your class</option>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>Class {i+1}</option>)}</select>
      <label htmlFor="vg-board">Board</label><select id="vg-board" value={board} onChange={e=>setBoard(e.target.value as 'CBSE'|'STATE')}><option value="CBSE">CBSE</option><option value="STATE">Karnataka State Board</option></select>
      {error&&<div role="alert" className="vg-login-error">{error}</div>}
      <button type="button" className="vg-primary-cta" onClick={continueLearning}>Continue to Learn Hub <ArrowRight size={17}/></button>
     </div><p className="vg-login-footnote"><CheckCircle2 size={16}/> For parents, class and board are checked against linked student records. Student self-selection is a learning preference until server-side enrolment verification is connected.</p>
    </>:<><span className="vg-section-label">STAFF ACCOUNT</span><h2 id="vg-login-heading">Staff access</h2><p>This sign-in is reserved for learners and parents. Staff should use the existing authorised portal.</p><button className="vg-primary-cta" onClick={onSuccess}>Go to authorised portal <ArrowRight size={17}/></button></>}
   </section>
  </div>
 </div>;
};