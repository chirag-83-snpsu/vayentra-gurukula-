import React, { useState } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Atom, BarChart3, BookOpen,
  BrainCircuit, Check, ChevronDown, CirclePlay, Compass, GraduationCap,
  Lightbulb, LockKeyhole, Menu, MoveRight, PlayCircle, ShieldCheck,
  Sparkles, Target, Users, X
} from 'lucide-react';
import { TeachingMethodShowcase } from '../components/TeachingMethodShowcase';
import { ClassDiscoveryPanel } from '../components/ClassDiscoveryPanel';
import '../styles/premium-home.css';

interface Props { onLogin: () => void; onExplore: () => void; onAdmissions: (grade?: number) => void; }
type DemoKey = 'math' | 'science' | 'english';
type BandKey = 'foundation' | 'middle' | 'board';
type SchoolBoard = 'CBSE' | 'STATE';

const lessonDemos: Record<DemoKey, {
  tag: string; title: string; question: string; options: string[]; correct: number; answer: string; insight: string; steps: readonly string[];
}> = {
  math: {
    tag: 'MATHEMATICS · REASONING',
    title: 'The order matters.',
    question: '5 + 3 × 2 = ?',
    options: ['16', '11', '13'],
    correct: 1,
    answer: '11',
    insight: 'Multiplication happens before addition. First 3 × 2 = 6, then 5 + 6 = 11. Understanding the rule makes every similar question easier.',
    steps: ['Spot the two operations: addition and multiplication.','Complete multiplication first: 3 × 2 = 6.','Add the remaining number: 5 + 6 = 11.']
  },
  science: {
    tag: 'SCIENCE · EVERYDAY WONDER',
    title: 'Look closer.',
    question: 'Why does a pencil look bent in a glass of water?',
    options: ['Refraction of light', 'Gravity', 'Magnetism'],
    correct: 0,
    answer: 'Refraction',
    insight: 'Light changes direction as it travels between water and air. Our eyes trace the light backward, making the submerged part appear displaced.',
    steps: ['Light travels from water into air.','Its direction changes at the boundary; this is refraction.','Our eyes trace the rays backward, so the pencil appears shifted.']
  },
  english: {
    tag: 'ENGLISH · LANGUAGE CLARITY',
    title: 'Build the sentence.',
    question: 'She has ___ her homework.',
    options: ['complete', 'completed', 'completing'],
    correct: 1,
    answer: 'completed',
    insight: 'The present perfect uses has or have plus a past participle. So we say, “She has completed her homework.”',
    steps: ['Find the helping verb: has.','Present perfect uses has or have followed by the past participle.','Complete becomes completed: She has completed her homework.']
  }
};

const pathways: Record<BandKey, {
  range: string; headline: string; description: string; focus: string[]; note: string;
}> = {
  foundation: {
    range: 'CLASSES 01—05', headline: 'A strong start changes everything.',
    description: 'Build curiosity, reading confidence, number sense and the habit of asking thoughtful questions.',
    focus: ['Number sense and Mathematics', 'English reading and expression', 'Observation and learning habits'],
    note: 'Foundational learning, guided by people — not screens alone.'
  },
  middle: {
    range: 'CLASSES 06—08', headline: 'From memorising to making sense.',
    description: 'Develop deeper understanding of Mathematics, Science and language with real examples, hands-on activities and focused practice.',
    focus: ['Mathematical thinking', 'Science through observation', 'Concept checks and correction'],
    note: 'Build the reasoning skills that later chapters depend on.'
  },
  board: {
    range: 'CLASSES 09—10', headline: 'Confidence for the important years.',
    description: 'Learn the concepts behind exam questions while developing revision discipline, answer structure and application skills.',
    focus: ['Mathematics and Science clarity', 'Structured revision and assessments', 'Board-oriented problem solving'],
    note: 'Understand first. Prepare with purpose.'
  }
};

const questions = [
  {q:'What makes Vayentra Gurukula different?', a:'We prioritise conceptual clarity, real examples and individual teacher attention. Diagnostics and practice are there to help teachers recognise what a learner needs, rather than replace teaching.'},
  {q:'Which classes and boards are supported?', a:'Our academic programmes cover Classes 1–10 with CBSE and Karnataka State Board support. Subject and batch availability should be confirmed with the institute before admission.'},
  {q:'Is the learning platform open to everyone?', a:'Visitors can explore the public website and its available resources. Students use the separate login with their enrolled credentials to access private learning records.'},
  {q:'What happens after students sign in?', a:'Students select their class and board, then enter the appropriate authorised learning space. Access to private student records is controlled by the registered account, not by the class selected on screen.'}
];

export const LandingPage: React.FC<Props> = ({onLogin, onExplore, onAdmissions}) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [demoKey, setDemoKey] = useState<DemoKey>('math');
  const [selection, setSelection] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [explainStep,setExplainStep]=useState(0);
  const [grade,setGrade]=useState(7);
  const [band, setBand] = useState<BandKey>('middle');
  const [board, setBoard] = useState<SchoolBoard>('CBSE');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const lesson = lessonDemos[demoKey];
  const path = pathways[band];
  const jumpTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  const changeDemo = (next: DemoKey) => {setDemoKey(next);setRevealed(false);setSelection(null);setExplainStep(0);};
  const nextExplanation = () => {
    if(!revealed){setRevealed(true);setExplainStep(0);return;}
    if(explainStep < lesson.steps.length-1){setExplainStep(x=>x+1);return;}
    const keys:DemoKey[]=['math','science','english'];
    changeDemo(keys[(keys.indexOf(demoKey)+1)%keys.length]);
  };
  const selectBand = (next:BandKey) => {setBand(next);setGrade(next==='foundation'?3:next==='middle'?7:10);};
  const selectGrade=(next:number)=>{setGrade(next);setBand(next<=5?'foundation':next<=8?'middle':'board');};

  return <div className="vgp">
    <header className="vgp-header">
      <div className="vgp-header-inner">
        <button type="button" className="vgp-brand" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Vayentra Gurukula, back to top">
          <span className="vgp-logo-frame"><img src="/vayentra_logo.png" alt="" width="48" height="48"/></span>
          <span className="vgp-brand-type"><strong>VAYENTRA</strong><small>GURUKULA <span>✦</span></small></span>
        </button>
        <nav className={'vgp-nav'+(mobileMenu?' vgp-nav-open':'')} aria-label="Primary navigation">
          <button onClick={()=>jumpTo('why-vayentra')}>Our difference</button>
          <button onClick={()=>jumpTo('our-programmes')}>Programmes</button>
          <button onClick={()=>jumpTo('the-experience')}>Student experience</button>
          <button onClick={()=>jumpTo('common-questions')}>FAQs</button>
          <button onClick={()=>onAdmissions()}>Admissions</button>
        </nav>
        <div className="vgp-header-actions">
          <button type="button" className="vgp-header-login" onClick={onLogin}>Student login <ArrowUpRight size={18}/></button>
          <button type="button" className="vgp-menu-btn" aria-label={mobileMenu?'Close navigation':'Open navigation'} aria-expanded={mobileMenu} onClick={()=>setMobileMenu(!mobileMenu)}>{mobileMenu?<X size={23}/>:<Menu size={23}/>}</button>
        </div>
      </div>
    </header>

    <main>
      <section className="vgp-hero">
        <div className="vgp-hero-grid" aria-hidden="true"/>
        <div className="vgp-hero-glow" aria-hidden="true"/>
        <div className="vgp-container vgp-hero-inner">
          <div className="vgp-hero-copy">
            <div className="vgp-hero-eyebrow"><span className="vgp-eyebrow-bar"/> THE ART OF UNDERSTANDING <span className="vgp-eyebrow-stars">✧</span></div>
            <h1>Don't just<br/>learn it.<br/><span>Understand it.</span></h1>
            <p className="vgp-hero-lead">A new perspective on tuition. Thoughtful teaching, real understanding and the confidence to solve what's next.</p>
            <p className="vgp-hero-sub">Vayentra Gurukula · Concept-based learning for Classes 1–10 in Bengaluru.</p>
            <div className="vgp-hero-ctas">
              <button className="vgp-cta vgp-cta-gold" onClick={()=>jumpTo('our-programmes')}>Explore learning <ArrowUpRight size={20}/></button>
              <button className="vgp-cta vgp-cta-ghost" onClick={onLogin}><LockKeyhole size={17}/> Enter student portal</button>
            </div>
            <div className="vgp-hero-micro"><span><Check size={15}/> CBSE & Karnataka State Board</span><span><Check size={15}/> Classes 01—10</span></div>
          </div>
          <div className="vgp-hero-stage">
            <div className="vgp-stage-tag"><Sparkles size={15}/> A SMALL MOMENT OF UNDERSTANDING</div>
            <div className="vgp-sample-stack" aria-hidden="true"><div/><div/></div>
            <article className="vgp-sample-card" aria-label="Interactive learning illustration">
              <div className="vgp-sample-header"><span className="vgp-sample-dot"/><span>TRY A CONCEPT</span><span className="vgp-sample-num">0{(['math','science','english'] as const).indexOf(demoKey)+1} / 03</span></div>
              <div className="vgp-sample-tabs" role="group" aria-label="Select a practice subject">
                {(['math','science','english'] as const).map(key=><button key={key} type="button" className={demoKey===key?'active':''} onClick={()=>changeDemo(key)}>{key==='math'?'Maths':key==='science'?'Science':'English'}</button>)}
              </div>
              <div className="vgp-sample-body">
                <div className="vgp-sample-category">{lesson.tag}</div>
                <h2>{lesson.title}</h2>
                <div className={'vgp-sample-question'+(demoKey==='math'?' vgp-sample-math':'')}>{lesson.question}</div>
                <div className="vgp-sample-options">
                  {lesson.options.map((option,index)=><button key={option} type="button" className={'vgp-sample-option'+(selection===index?' selected':'')+(revealed&&index===lesson.correct?' correct':'')+(revealed&&selection===index&&index!==lesson.correct?' incorrect':'')} onClick={()=>{setSelection(index);setRevealed(false);setExplainStep(0)}} aria-pressed={selection===index}>
                    <span>{String.fromCharCode(65+index)}</span>{option}{revealed&&index===lesson.correct&&<Check size={16}/>}
                  </button>)}
                </div>
                {revealed?<div className="vgp-sample-insight" role="status" aria-live="polite">
  <div><Lightbulb size={18}/><strong>{selection===lesson.correct?'Correct! Now understand why.':'Not quite. Here is the reasoning.'}</strong></div>
  <div className="vgp-sample-step-indicator">EXPLANATION {explainStep+1} OF {lesson.steps.length}</div>
  <p>{lesson.steps[explainStep]}</p>
  {explainStep===lesson.steps.length-1&&<p className="vgp-sample-summary">{lesson.insight}</p>}
 </div>:<div className="vgp-sample-help">Choose an answer, then discover the reasoning.</div>}
              </div>
              <div className="vgp-sample-footer"><span><span className="vgp-indicator"/> Original interactive concept preview</span>
 <button type="button" onClick={nextExplanation} disabled={selection===null}>{!revealed?'Explain the answer':explainStep<lesson.steps.length-1?'Next step':'Try another concept'} <ArrowRight size={16}/></button></div>
            </article>
            <div className="vgp-floating-note"><span><BrainCircuit size={17}/></span><div><strong>The 'why' changes everything.</strong><small>Explore. Question. Understand.</small></div></div>
          </div>
        </div>
        <div className="vgp-hero-bottom"><div className="vgp-container"><span>01 / WELCOME TO VAYENTRA</span><button onClick={()=>jumpTo('why-vayentra')}>SCROLL TO DISCOVER <ArrowDownRight size={18}/></button></div></div>
      </section>

      <section className="vgp-manifesto" id="why-vayentra">
        <div className="vgp-container">
          <div className="vgp-section-heading"><div className="vgp-kicker">01 — THE VAYENTRA DIFFERENCE</div><h2>Every student can remember.<br/><em>We want them to understand.</em></h2><p>Our goal is not another hour of repetition. It's the moment an unfamiliar idea becomes clear — and a student can explain it with confidence.</p></div>
          <div className="vgp-ideas-grid">
            <article className="vgp-idea-main">
              <div className="vgp-idea-number">01 / THE METHOD</div>
              <div className="vgp-idea-main-visual" aria-hidden="true">
                <span className="vgp-idea-scribble vgp-scribble-1">?</span>
                <span className="vgp-idea-scribble vgp-scribble-2">→</span>
                <span className="vgp-idea-scribble vgp-scribble-3">!</span>
                <svg viewBox="0 0 450 180" role="img" aria-label="A visual curve representing understanding becoming clearer"><path d="M15 145 C100 145 80 80 165 100 S275 22 435 30" fill="none" stroke="#e7b867" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 9"/><circle cx="15" cy="145" r="8" fill="#e7b867"/><circle cx="435" cy="30" r="8" fill="#e7b867"/></svg>
              </div>
              <h3>We don't teach answers.<br/>We teach thinking.</h3>
              <p>From number lines to experiments and real-world examples, we make abstract concepts something students can actually make sense of.</p>
            </article>
            <article className="vgp-idea-small vgp-idea-warm"><span className="vgp-idea-num">02</span><span className="vgp-idea-icon"><Target size={25}/></span><h3>See the gap.<br/>Not just the marks.</h3><p>Short concept checks help educators plan practice around misconceptions, not only scores.</p></article>
            <article className="vgp-idea-small vgp-idea-ice"><span className="vgp-idea-num">03</span><span className="vgp-idea-icon"><Users size={25}/></span><h3>Teachers first.<br/>Technology with purpose.</h3><p>Digital tools support explanation and feedback. Human mentorship stays at the centre.</p></article>
          </div>
        </div>
      </section>

      <section className="vgp-programmes" id="our-programmes">
        <div className="vgp-container">
          <div className="vgp-programmes-top"><div><div className="vgp-kicker">02 — FIND YOUR PATH</div><h2>Built for the way<br/><em>you grow.</em></h2></div><p>A learner in Class 3 has different needs from someone preparing for Class 10. Explore how the experience evolves with each stage.</p></div>
          <div className="vgp-path-switch" role="group" aria-label="Select academic stage">
            {(['foundation','middle','board'] as const).map(key=><button key={key} type="button" className={band===key?'active':''} aria-pressed={band===key} onClick={()=>selectBand(key)}>{pathways[key].range}</button>)}
          </div>
          <div className="vgp-path-display">
            <div className="vgp-path-copy"><div className="vgp-path-eyebrow"><GraduationCap size={18}/> {path.range}</div><h3>{path.headline}</h3><p>{path.description}</p><ul>{path.focus.map(focus=><li key={focus}><Check size={17}/>{focus}</li>)}</ul><button className="vgp-text-link" onClick={onExplore}>Explore curriculum resources <ArrowUpRight size={19}/></button></div>
            <div className="vgp-path-art">
              <div className="vgp-path-art-top"><span>VAYENTRA / LEARNING PATHWAY</span><span>✦</span></div>
              <div className="vgp-path-big-digit">{band==='foundation'?'01':band==='middle'?'06':'09'}<span>—</span>{band==='foundation'?'05':band==='middle'?'08':'10'}</div>
              <div className="vgp-path-art-line"/>
              <div className="vgp-path-art-bottom"><span>{path.note}</span><div className="vgp-path-art-icon"><BookOpen size={26}/></div></div>
            </div>
          </div>
          <div className="vgp-board-line"><span>ACADEMIC BOARDS</span><div role="group" aria-label="Preview supported boards"><button className={board==='CBSE'?'active':''} onClick={()=>setBoard('CBSE')} aria-pressed={board==='CBSE'}>CBSE</button><button className={board==='STATE'?'active':''} onClick={()=>setBoard('STATE')} aria-pressed={board==='STATE'}>Karnataka State Board</button></div><p>Exploring: {board==='CBSE'?'CBSE':'Karnataka State Board'} · Confirm current subjects and batch availability with our team.</p></div>
          <ClassDiscoveryPanel grade={grade} board={board} onGradeChange={selectGrade} onExplore={onExplore} onAdmissions={onAdmissions}/>
        </div>
      </section>

      <TeachingMethodShowcase />

      <section className="vgp-experience" id="the-experience">
        <div className="vgp-container vgp-experience-inner">
          <div className="vgp-experience-copy"><div className="vgp-kicker">04 — THE STUDENT EXPERIENCE</div><h2>One learning space.<br/><em>Made for progress.</em></h2><p>The journey continues beyond class. Students can sign in to access available learning materials, assessments and academic records through the Vayentra platform.</p><div className="vgp-experience-features"><span><PlayCircle size={18}/> Lesson resources</span><span><BookOpen size={18}/> Homework & practice</span><span><BarChart3 size={18}/> Attendance & progress</span><span><ShieldCheck size={18}/> Protected access</span></div><button className="vgp-cta vgp-cta-gold" onClick={onLogin}>Enter the student portal <ArrowUpRight size={19}/></button></div>
          <div className="vgp-product-display">
            <div className="vgp-product-glow" aria-hidden="true"/>
            <div className="vgp-product-window" aria-label="Illustrative student learning dashboard preview">
              <div className="vgp-product-window-top"><div className="vgp-product-lights"><span/><span/><span/></div><span>VAYENTRA / LEARN HUB</span><span className="vgp-product-preview-label">DESIGN PREVIEW</span></div>
              <div className="vgp-product-window-body"><div className="vgp-product-greeting"><span>YOUR LEARNING SPACE</span><h3>Make today count<span>.</span></h3><p>Choose what you want to understand next.</p></div>
                <div className="vgp-product-item vgp-product-item-featured"><span className="vgp-product-item-icon"><BrainCircuit size={21}/></span><div><strong>Concept Learning</strong><small>Understand the idea behind the answer</small></div><ArrowUpRight size={18}/></div>
                <div className="vgp-product-item"><span className="vgp-product-item-icon"><BookOpen size={21}/></span><div><strong>Homework & Assessments</strong><small>Practise with clear feedback</small></div><ArrowUpRight size={18}/></div>
                <div className="vgp-product-item"><span className="vgp-product-item-icon"><BarChart3 size={21}/></span><div><strong>My Progress</strong><small>Review attendance and learning</small></div><ArrowUpRight size={18}/></div>
              </div>
            </div>
            <span className="vgp-product-disclaimer">Illustrative platform preview · Features depend on enrolled account access</span>
          </div>
        </div>
      </section>

      <section className="vgp-faq" id="common-questions">
        <div className="vgp-container vgp-faq-inner"><div><div className="vgp-kicker">05 — GOOD TO KNOW</div><h2>Curiosity is<br/><em>always welcome.</em></h2><p>A few things families often ask before joining.</p></div>
          <div className="vgp-faq-list">{questions.map(({q,a},index)=><div className="vgp-faq-entry" key={q}><button type="button" aria-expanded={openFaq===index} onClick={()=>setOpenFaq(openFaq===index?null:index)}><span>{q}</span><ChevronDown size={20}/></button>{openFaq===index&&<p>{a}</p>}</div>)}</div>
        </div>
      </section>

      <section className="vgp-closing"><div className="vgp-container vgp-closing-inner"><div className="vgp-closing-mark">✦</div><div className="vgp-kicker">A DIFFERENT KIND OF LEARNING JOURNEY</div><h2>Here's to the moment<br/><em>it all makes sense.</em></h2><p>Discover Vayentra Gurukula, where understanding comes first.</p><div className="vgp-closing-actions"><button className="vgp-cta vgp-cta-gold" onClick={onLogin}>Student login <ArrowUpRight size={18}/></button><button className="vgp-cta vgp-cta-outline" onClick={()=>onAdmissions()}>Enquire about admissions <MoveRight size={18}/></button></div></div></section>
    </main>
    <footer className="vgp-footer"><div className="vgp-container vgp-footer-inner"><div><div className="vgp-footer-brand"><span>✦</span> VAYENTRA <b>GURUKULA</b></div><p>Concept-based academic coaching for Classes 1–10, Bengaluru.</p></div><div className="vgp-footer-right"><span>An initiative of Vayentra Ventures Pvt. Ltd.</span><span>© {new Date().getFullYear()} Vayentra Gurukula</span></div></div></footer>
  </div>;
};
