import React,{useState} from 'react';
import {Logo} from '../components/Logo';
import {
 ArrowRight,BookOpenCheck,CheckCircle2,ChevronDown,ClipboardCheck,
 GraduationCap,HeartHandshake,Lightbulb,Menu,Microscope,
 PlayCircle,ShieldCheck,Sparkles,Target,Users,X
} from 'lucide-react';

/**
 * Dedicated visitor homepage: never mounts an administrative dashboard shell.
 * All copy is original to Vayentra and deliberately avoids fabricated claims.
 */
export const LandingPage:React.FC=()=>{
 const [menuOpen,setMenuOpen]=useState(false);
 const close=()=>setMenuOpen(false);
 const features=[
  {Icon:Lightbulb,name:'Concept-first teaching',copy:'We explain why a method works, not just which answer to remember.'},
  {Icon:Microscope,name:'Practical exploration',copy:'Simple experiments, diagrams and familiar examples bring topics to life.'},
  {Icon:Target,name:'Personal learning support',copy:'Short concept checks help teachers identify and address misunderstandings.'},
  {Icon:HeartHandshake,name:'Parents stay informed',copy:'Attendance, homework and progress updates help families support learning.'}
 ];
 const journeys=[
  {number:'01',title:'Understand',copy:'Learn the idea with everyday examples and teacher-led discussion.'},
  {number:'02',title:'Apply',copy:'Solve questions, explain your reasoning and practise with purpose.'},
  {number:'03',title:'Improve',copy:'Identify gaps, get feedback and revisit tricky concepts.'}
 ];
 return <div className="vg-landing">
  <header className="vg-site-header">
   <div className="vg-site-inner">
    <a href="/" className="vg-site-brand" aria-label="Vayentra Gurukula homepage"><Logo variant="header" height={50}/></a>
    <nav className={menuOpen?'vg-site-nav is-open':'vg-site-nav'} aria-label="Primary navigation">
     <a href="#about" onClick={close}>About us</a>
     <a href="#programmes" onClick={close}>Programmes</a>
     <a href="#approach" onClick={close}>How we teach</a>
     <a href="#learning" onClick={close}>Learning platform</a>
     <a href="/login" className="vg-site-nav-mobile" onClick={close}>Student sign in</a>
    </nav>
    <div className="vg-site-actions">
     <a href="/login" className="vg-site-signin">Student / Parent Login <ArrowRight size={17}/></a>
     <button className="vg-site-menu" type="button" aria-label={menuOpen?'Close navigation':'Open navigation'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X size={22}/>:<Menu size={22}/>}</button>
    </div>
   </div>
  </header>

  <main>
   <section className="vg-landing-hero" aria-labelledby="vg-hero-title">
    <div className="vg-hero-pattern" aria-hidden="true"/>
    <div className="vg-hero-wrap">
     <div className="vg-hero-copy">
      <div className="vg-eyebrow"><span className="vg-eyebrow-dot"/> VAYENTRA VENTURES PVT. LTD. <span className="vg-eyebrow-divider"/> CLASSES 1–10</div>
      <h1 id="vg-hero-title">A better way to <em>understand.</em> A brighter way to <em>grow.</em></h1>
      <p>Welcome to <strong>Vayentra Gurukula</strong> — concept-oriented academic tuition in Bengaluru. We help children build stronger foundations through clear explanations, practical learning, meaningful practice and individual attention.</p>
      <div className="vg-hero-buttons">
       <a className="vg-button-primary" href="#programmes">Explore our programmes <ArrowRight size={19}/></a>
       <a className="vg-button-secondary" href="/login">Already a student? Sign in</a>
      </div>
      <div className="vg-hero-trust">
       <span><CheckCircle2 size={17}/> CBSE & Karnataka State Board</span>
       <span><CheckCircle2 size={17}/> Concept-based learning</span>
       <span><CheckCircle2 size={17}/> Classes 1–10</span>
      </div>
     </div>
     <div className="vg-hero-art" aria-label="Illustration of Vayentra's concept-based learning approach">
      <div className="vg-hero-orb orb-one"/>
      <div className="vg-hero-orb orb-two"/>
      <div className="vg-hero-art-panel">
       <div className="vg-hero-art-head"><span className="vg-art-monogram"><GraduationCap size={24}/></span><span>THE VAYENTRA WAY</span><span className="vg-art-spark"><Sparkles size={20}/></span></div>
       <div className="vg-hero-lesson">
        <div className="vg-art-small">TODAY'S CONCEPT • MATHEMATICS</div>
        <div className="vg-art-equation">3x + 5 = 20</div>
        <div className="vg-art-explain">What does the equation actually mean?</div>
        <div className="vg-art-lines"><span/><span/><span/></div>
       </div>
       <div className="vg-art-process">
        <div><span><Lightbulb size={18}/></span><strong>Understand</strong><small>See the idea</small></div>
        <div className="vg-art-connector"/>
        <div><span><ClipboardCheck size={18}/></span><strong>Practise</strong><small>Try it out</small></div>
        <div className="vg-art-connector"/>
        <div><span><Target size={18}/></span><strong>Improve</strong><small>Build mastery</small></div>
       </div>
       <div className="vg-art-caption">Illustration of our teaching approach</div>
      </div>
      <div className="vg-floating-note"><span className="vg-floating-icon"><BookOpenCheck size={17}/></span><span>Every concept counts.</span></div>
     </div>
    </div>
   </section>

   <section id="about" className="vg-landing-section vg-about">
    <div className="vg-section-heading centered">
     <div className="vg-section-overline">WELCOME TO VAYENTRA GURUKULA</div>
     <h2>Not just tuition. <span>Learning that stays.</span></h2>
     <p>Marks matter, but understanding makes them meaningful. Our approach brings classroom teaching, individual feedback and consistent practice together.</p>
    </div>
    <div className="vg-feature-grid">
     {features.map(({Icon,name,copy})=><article key={name} className="vg-feature-card">
      <div className="vg-feature-icon"><Icon size={25}/></div>
      <h3>{name}</h3><p>{copy}</p>
     </article>)}
    </div>
   </section>

   <section id="programmes" className="vg-landing-section vg-programmes">
    <div className="vg-section-heading">
     <div className="vg-section-overline">ACADEMIC PROGRAMMES</div>
     <h2>The right support <span>at every stage.</span></h2>
     <p>Age-appropriate teaching built around school concepts and each child's progress.</p>
    </div>
    <div className="vg-programme-grid">
     <article className="vg-programme-card">
      <div className="vg-programme-top"><span>FOUNDATION YEARS</span><BookOpenCheck size={23}/></div>
      <h3>Classes 1–7</h3>
      <p>Build curiosity, number sense, reading confidence, and the fundamentals of Science and Mathematics through guided group learning.</p>
      <div className="vg-programme-tags"><span>Concept foundations</span><span>Active learning</span><span>Practice habits</span></div>
      <a href="/login">Student learning access <ArrowRight size={17}/></a>
     </article>
     <article className="vg-programme-card vg-programme-dark">
      <div className="vg-programme-top"><span>SECONDARY LEARNING</span><GraduationCap size={23}/></div>
      <h3>Classes 8–10</h3>
      <p>Deepen subject understanding with focused concept lessons, chapter-wise practice, diagnostic feedback and examination preparation.</p>
      <div className="vg-programme-tags"><span>CBSE / State</span><span>Science & Maths</span><span>Revision support</span></div>
      <a href="/login">Student learning access <ArrowRight size={17}/></a>
     </article>
    </div>
    <p className="vg-programme-note"><ShieldCheck size={16}/> Programme and batch availability are confirmed directly by the institute. No online purchase is required to explore the website.</p>
   </section>

   <section id="approach" className="vg-landing-section vg-learning-journey">
    <div className="vg-section-heading centered">
     <div className="vg-section-overline">OUR TEACHING APPROACH</div>
     <h2>One clear path, <span>step by step.</span></h2>
     <p>We believe genuine confidence comes from a repeatable learning process.</p>
    </div>
    <div className="vg-journey-grid">
     {journeys.map((item,i)=><article key={item.number} className="vg-journey-step">
      <span className="vg-journey-number">{item.number}</span>
      <div className="vg-journey-line" aria-hidden="true"/>
      <h3>{item.title}</h3><p>{item.copy}</p>
     </article>)}
    </div>
   </section>

   <section id="learning" className="vg-landing-section vg-platform-panel">
    <div className="vg-platform-copy">
     <div className="vg-section-overline">BEYOND THE CLASSROOM</div>
     <h2>A learning space that continues after class.</h2>
     <p>Enrolled students can sign in to access the learning tools available to their class. Teachers guide what gets assigned and reviewed.</p>
     <div className="vg-platform-list">
      <div><BookOpenCheck size={20}/><span>Lessons and study resources</span></div>
      <div><ClipboardCheck size={20}/><span>Homework and concept practice</span></div>
      <div><Target size={20}/><span>Learning Compass diagnostics</span></div>
      <div><Users size={20}/><span>Attendance and family progress</span></div>
     </div>
     <a href="/login" className="vg-button-primary">Open your learning space <ArrowRight size={18}/></a>
    </div>
    <div className="vg-platform-visual" aria-label="Illustrative learner dashboard">
     <div className="vg-dashboard-mock">
      <div className="vg-dashboard-header"><span className="vg-dashboard-dot"/><span className="vg-dashboard-dot"/><span className="vg-dashboard-dot"/><small>MY LEARNING SPACE • PREVIEW</small></div>
      <div className="vg-dashboard-title">Your next learning step</div>
      <div className="vg-dashboard-progress"><span/></div>
      <div className="vg-dashboard-item"><span><PlayCircle size={19}/></span><div><strong>Understand the concept</strong><small>Review a short explanation</small></div><ChevronDown size={16}/></div>
      <div className="vg-dashboard-item"><span><ClipboardCheck size={19}/></span><div><strong>Try three practice questions</strong><small>Check your reasoning</small></div><ChevronDown size={16}/></div>
      <div className="vg-dashboard-item"><span><HeartHandshake size={19}/></span><div><strong>Discuss with your teacher</strong><small>Get help with the tricky part</small></div><ChevronDown size={16}/></div>
      <small className="vg-dashboard-disclaimer">Illustrative preview — not actual student data</small>
     </div>
    </div>
   </section>

   <section className="vg-final-cta">
    <div><div className="vg-section-overline">YOUR NEXT CHAPTER STARTS HERE</div><h2>Make every lesson a step forward.</h2><p>Discover Vayentra Gurukula and step into a more thoughtful approach to learning.</p></div>
    <a href="/login" className="vg-button-light">Sign in to Vayentra <ArrowRight size={18}/></a>
   </section>
  </main>
  <footer className="vg-site-footer">
   <div className="vg-footer-inner">
    <div><Logo variant="header" height={42}/><p>Concept-based academic coaching for Classes 1–10 in Bengaluru.</p><small>An educational initiative of Vayentra Ventures Pvt. Ltd.</small></div>
    <div><strong>Explore</strong><a href="#about">About Vayentra</a><a href="#programmes">Programmes</a><a href="#approach">Our approach</a></div>
    <div><strong>Learning</strong><a href="/login">Student login</a><a href="/login">Parent login</a><a href="/login">Faculty login</a></div>
   </div>
   <div className="vg-footer-bottom">© {new Date().getFullYear()} Vayentra Ventures Pvt. Ltd. · English-language interface · Independent educational institution</div>
  </footer>
 </div>;
};