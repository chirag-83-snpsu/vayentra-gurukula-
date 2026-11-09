import React,{useState} from 'react';
import {ArrowRight,Check,Eye,Lightbulb,Target} from 'lucide-react';
import '../styles/teaching-method.css';

const steps=[
 {label:'Observe',icon:Eye,title:'What do you notice?',summary:'A shadow is long when the Sun is low in the sky, and shorter when the Sun is high.',prompt:'Try it outdoors on a sunny day. Compare the same object at different times.'},
 {label:'Explain',icon:Lightbulb,title:'Understand the reason.',summary:'When light strikes an upright object at a lower angle, its shadow extends farther. A higher angle makes the shadow shorter.',prompt:'The important idea is the angle of light, not the size of the person or object.'},
 {label:'Apply',icon:Target,title:'Now predict a new situation.',summary:'When the Sun moves higher in the sky, what should happen to a tree’s shadow?',prompt:'It generally becomes shorter around midday. Test that idea by observing and recording.'}
] as const;
export const TeachingMethodShowcase:React.FC=()=>{
 const [step,setStep]=useState(0);
 const active=steps[step];
 return <section className="vgp-method" id="learning-in-action" aria-labelledby="vgp-method-title">
  <div className="vgp-container vgp-method-grid">
   <div className="vgp-method-intro">
    <div className="vgp-kicker">03 — LEARNING IN ACTION</div>
    <h2 id="vgp-method-title">Less memorising.<br/><em>More discoveries.</em></h2>
    <p>Here's a tiny example of how a concept can become an observation, a clear explanation, and a practical question.</p>
    <div className="vgp-method-steps" role="group" aria-label="Explore our teaching approach">
     {steps.map((item,i)=>{
      const Icon=item.icon;
      return <button key={item.label} type="button" className={'vgp-method-step'+(step===i?' active':'')} aria-pressed={step===i} onClick={()=>setStep(i)}>
       <span className="vgp-method-step-icon"><Icon size={19}/></span><span><strong>{String(i+1).padStart(2,'0')} · {item.label}</strong><small>{i===0?'Begin with curiosity':i===1?'Build a mental model':'Test what you learned'}</small></span><ArrowRight size={17}/>
      </button>;
     })}
    </div>
   </div>
   <article className="vgp-method-lab">
    <div className="vgp-method-lab-head"><span><span className="vgp-method-dot"/> THE CONCEPT LAB</span><span>SCIENCE / ORIGINAL ILLUSTRATION</span></div>
    <div className="vgp-method-lab-body">
     <div className="vgp-method-lab-kicker">LIGHT & SHADOWS · STEP {step+1} OF 3</div>
     <h3>{active.title}</h3>
     <div className="vgp-method-illustration">
      <svg role="img" aria-label="Comparison of a long shadow with a low Sun and a short shadow with a high Sun" viewBox="0 0 520 252" width="100%" height="100%">
       <rect x="0" y="0" width="250" height="252" rx="14" fill="#f4f7fc"/>
       <rect x="270" y="0" width="250" height="252" rx="14" fill="#f0f4fc"/>
       <text x="125" y="27" fill="#5c709a" textAnchor="middle" fontSize="13" fontWeight="800">LOW SUN</text>
       <text x="395" y="27" fill="#5c709a" textAnchor="middle" fontSize="13" fontWeight="800">HIGH SUN</text>
       <line x1="18" y1="207" x2="234" y2="207" stroke="#92a4c2" strokeWidth="2"/>
       <line x1="287" y1="207" x2="504" y2="207" stroke="#92a4c2" strokeWidth="2"/>
       <circle cx="38" cy="124" r="22" fill="#efbd6a"/>
       <circle cx="390" cy="72" r="22" fill="#efbd6a"/>
       <line x1="58" y1="129" x2="146" y2="175" stroke="#d6a553" strokeWidth="3" strokeDasharray="7 6"/>
       <line x1="388" y1="94" x2="398" y2="173" stroke="#d6a553" strokeWidth="3" strokeDasharray="7 6"/>
       <rect x="136" y="147" width="12" height="60" rx="5" fill="#1e417d"/>
       <circle cx="142" cy="134" r="14" fill="#1e417d"/>
       <rect x="393" y="147" width="12" height="60" rx="5" fill="#1e417d"/>
       <circle cx="399" cy="134" r="14" fill="#1e417d"/>
       <polygon points="147,202 226,199 231,206 147,209" fill="#7d90b7" opacity=".8"/>
       <polygon points="406,204 436,201 440,205 406,209" fill="#7d90b7" opacity=".8"/>
       <text x="181" y="238" fill="#526789" textAnchor="middle" fontSize="12" fontWeight="700">Long shadow</text>
       <text x="424" y="238" fill="#526789" textAnchor="middle" fontSize="12" fontWeight="700">Short shadow</text>
      </svg>
     </div>
     <p className="vgp-method-summary">{active.summary}</p>
     <div className="vgp-method-prompt"><Check size={17}/><span>{active.prompt}</span></div>
     <div className="vgp-method-bottom"><span>Teacher-led experiment example · not a recorded class</span><button type="button" onClick={()=>setStep((step+1)%3)}>{step===2?'Start again':'Next step'} <ArrowRight size={17}/></button></div>
    </div>
   </article>
  </div>
 </section>;
};