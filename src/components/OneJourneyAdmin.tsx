import React,{useState} from 'react';
import {GraduationCap,ShieldCheck,RefreshCcw} from 'lucide-react';
import {useApp} from '../context/AppContext';

type Year={id:string;year:string;grade:number;status:string};
type Profile={student:{id:string;name:string;grade:number;board:string;enrollmentNumber:string};
 membership:null|{status:string;initialGrade:number;initialYear:string;entitlement:string};academicYears:Year[]};
export const OneJourneyAdmin:React.FC=()=>{
 const {authToken}=useApp();
 const [studentId,setStudentId]=useState('');
 const [profile,setProfile]=useState<Profile|null>(null);
 const [academicYear,setAcademicYear]=useState('2026-27');
 const [nextAcademicYear,setNextAcademicYear]=useState('2027-28');
 const [method,setMethod]=useState('verified_in_person');
 const [noticeVersion,setNoticeVersion]=useState('vayentra-one-parent-consent-v1');
 const [reference,setReference]=useState('');
 const [attested,setAttested]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 async function request(path:string,method:'GET'|'POST'='GET',body?:unknown){
  if(!authToken)throw new Error('Administrator login required.');
  const res=await fetch('/api/v1/journey'+path,{method,
   headers:{Authorization:'Bearer '+authToken,'Content-Type':'application/json'},
   body:body?JSON.stringify(body):undefined});
  const result=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(result.message||result.code||'Journey administration failed.');
  return result;
 }
 const studentPath=()=>'/students/'+encodeURIComponent(studentId.trim());
 async function run(op:'fetch'|'enrol'|'record-consent-review'|'activate'|'advance-year'){
  if(!studentId.trim()||busy)return;
  setBusy(true);setError('');setNotice('');
  try{
   if(op==='record-consent-review'&&!attested)throw new Error('Complete actual verification before recording a review.');
   if(op==='fetch'){setProfile(await request(studentPath()));return;}
   const payload=op==='enrol'?{academicYear}:op==='record-consent-review'?{
    verificationMethod:method,noticeVersion,evidenceReference:reference
   }:op==='advance-year'?{nextAcademicYear}:{};
   const result=await request('/admin'+studentPath()+'/'+op,'POST',payload);
   setNotice(result.message||'Action recorded.');
   setProfile(await request(studentPath()));
   if(op==='record-consent-review')setAttested(false);
  }catch(e){setError(e instanceof Error?e.message:'Request failed.');}
  finally{setBusy(false);}
 }
 const membership=profile?.membership;
 return <section className="b" style={{display:'flex',flexDirection:'column',gap:15}}>
  <div><h2 className="h2"><GraduationCap size={23}/> Vayentra ONE — Academic Lifecycle</h2>
   <p className="t-muted">One permanent student identity through Class 10. No automatic payments or document uploads.</p></div>
  <div className="b" style={{display:'flex',gap:10,alignItems:'end',flexWrap:'wrap'}}>
   <div style={{flex:'1 1 200px'}}><label htmlFor="one-student">Existing student ID</label><input id="one-student" value={studentId} onChange={e=>{setStudentId(e.target.value);setProfile(null)}} placeholder="Student ID from the roster"/></div>
   <button className="btn btn-teal" type="button" disabled={!studentId||busy} onClick={()=>void run('fetch')}><RefreshCcw size={16}/> Find student</button>
  </div>
  {error&&<p role="alert" style={{color:'var(--color-error)'}}>{error}</p>}
  {notice&&<p role="status">{notice}</p>}
  {profile&&<>
   <div className="b" style={{background:'var(--color-paper-subtle)'}}>
    <strong>{profile.student.name}</strong><p className="t-muted">Class {profile.student.grade} · {profile.student.board} · {profile.student.enrollmentNumber}</p>
    <span className="chip chip-navy">{membership?.status||'Not yet enrolled in ONE'}</span>
   </div>
   {!membership&&<div className="b" style={{display:'grid',gap:9}}>
    <h3 className="h3">Step 1 — Reserve permanent student identity</h3>
    <label htmlFor="one-year">Academic year</label><input id="one-year" value={academicYear} onChange={e=>setAcademicYear(e.target.value)} placeholder="2026-27"/>
    <button type="button" className="btn btn-teal" disabled={busy} onClick={()=>void run('enrol')}>Reserve pending membership</button>
    <p className="t-tiny">Reservation does not collect payment, verify parental consent, or grant learning access.</p>
   </div>}
   {membership?.status==='pending_consent'&&<div className="b" style={{display:'grid',gap:10}}>
    <h3 className="h3"><ShieldCheck size={20}/> Step 2 — Verify parent and review consent</h3>
    <p className="t-muted">Perform genuine identity/consent checks before attesting. Do not enter Aadhaar, student IDs or sensitive records as a reference.</p>
    <label htmlFor="one-method">Verified method</label>
    <select id="one-method" value={method} onChange={e=>setMethod(e.target.value)}>
     <option value="verified_in_person">Verified in person</option><option value="verified_parent_records">Verified through existing parent records</option><option value="verified_digilocker">Authorised identity verification workflow</option>
    </select>
    <label htmlFor="one-notice">Approved consent notice version</label>
    <input id="one-notice" value={noticeVersion} onChange={e=>setNoticeVersion(e.target.value)}/>
    <label htmlFor="one-reference">Internal verification reference (not an identity number)</label>
    <input id="one-reference" value={reference} maxLength={100} onChange={e=>setReference(e.target.value)} placeholder="VG-CONSENT-REVIEW-..."/>
    <label style={{display:'flex',gap:9,alignItems:'start',lineHeight:1.6}}>
     <input type="checkbox" checked={attested} onChange={e=>setAttested(e.target.checked)}/>
     I confirm the real parent/guardian verification and notice-based consent took place.
    </label>
    <button type="button" className="btn btn-teal" disabled={busy||!attested||reference.length<4} onClick={()=>void run('record-consent-review')}>Record guardian verification</button>
    <button type="button" className="ghost" disabled={busy} onClick={()=>void run('activate')}>Activate after verified review</button>
   </div>}
   {membership?.status==='active'&&<div className="b" style={{display:'grid',gap:10}}>
    <h3 className="h3">Class-by-class history</h3>
    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{profile.academicYears.map(y=><span className="chip chip-navy" key={y.id}>Class {y.grade} · {y.year} · {y.status}</span>)}</div>
    <p className="t-muted">Advance one class after independently confirming the promotion; last year's marks are preserved.</p>
    <label htmlFor="one-next">Next academic year</label>
    <input id="one-next" value={nextAcademicYear} onChange={e=>setNextAcademicYear(e.target.value)}/>
    <button type="button" className="btn btn-teal" disabled={busy||profile.student.grade>=10} onClick={()=>void run('advance-year')}>Advance by one class</button>
    {profile.student.grade>=10&&<p className="t-muted">Class 10 requires verified board results and a separate graduation review.</p>}
   </div>}
  </>}
  <p className="t-tiny">Private membership pricing, secure mark-card upload and billing are separate launch gates.</p>
 </section>;
};