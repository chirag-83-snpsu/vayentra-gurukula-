import React, { useState } from 'react';
import { ArrowRight, BookOpen, BrainCircuit, CalendarCheck, CheckCircle2, ChevronDown, ClipboardCheck, GraduationCap, Menu, PlayCircle, ShieldCheck, Sparkles, Target, Users, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import '../styles/landing.css';

interface Props { onLogin: () => void; onExplore: () => void; }

const features = [
  { icon: BrainCircuit, title: 'Concept-first teaching', detail: 'We explain the why behind every answer using examples, experiments and guided discussion.' },
  { icon: Target, title: 'Personalised learning support', detail: 'Short diagnostic checks help teachers identify misconceptions and plan focused practice.' },
  { icon: CalendarCheck, title: 'Attendance & progress', detail: 'Enrolled families can follow attendance, homework and assessments through their secure portal.' },
  { icon: BookOpen, title: 'Structured board preparation', detail: 'Curriculum-oriented support and revision for CBSE and Karnataka State Board learners.' },
];

export const LandingPage: React.FC<Props> = ({ onLogin, onExplore }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const jump = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); };
  return <div className="vg-landing">
    <header className="vg-site-header">
      <div className="vg-site-header-inner">
        <button type="button" className="vg-brand-button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Vayentra Gurukula, back to top"><Logo variant="header" height={43}/></button>
        <nav className={menuOpen?'vg-site-nav open':'vg-site-nav'} aria-label="Main navigation">
          <button onClick={()=>jump('approach')}>Our approach</button><button onClick={()=>jump('programmes')}>Programmes</button><button onClick={()=>jump('journey')}>How it works</button><button onClick={()=>jump('questions')}>FAQs</button>
        </nav>
        <div className="vg-site-actions"><button className="vg-nav-login" onClick={onLogin}>Student login <ArrowRight size={16}/></button>
          <button className="vg-menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen}>{menuOpen?<X size={23}/>:<Menu size={23}/>}</button></div>
      </div>
    </header>
    <main>
      <section className="vg-hero">
        <div className="vg-hero-grid">
          <div className="vg-hero-copy">
            <span className="vg-eyebrow"><span className="vg-sparkle">✦</span> VAYENTRA GURUKULA · BENGALURU</span>
            <h1>Learning that builds <em>understanding.</em><br/>Confidence that lasts.</h1>
            <p>Beyond memorising answers. We help students in Classes 1–10 understand concepts, ask better questions and grow through guided, individual attention.</p>
            <div className="vg-hero-buttons"><button className="vg-primary-cta" onClick={()=>jump('programmes')}>Explore our programmes <ArrowRight size={18}/></button><button className="vg-secondary-cta" onClick={onLogin}><GraduationCap size={19}/> I'm a student</button></div>
            <div className="vg-hero-proof"><span><CheckCircle2 size={16}/> Classes 1–10</span><span><CheckCircle2 size={16}/> CBSE & State Board</span><span><CheckCircle2 size={16}/> English interface</span></div>
          </div>
          <div className="vg-hero-visual" aria-label="Illustration of a personalised learning pathway">
            <div className="vg-orbit vg-orbit-one"/><div className="vg-orbit vg-orbit-two"/>
            <div className="vg-visual-kicker">THE VAYENTRA WAY</div>
            <div className="vg-visual-heading">Every learner.<br/><strong>A clearer path.</strong></div>
            <div className="vg-path-card vg-path-one"><span className="vg-path-icon"><BrainCircuit size={21}/></span><span><b>Discover</b><small>Find the learning gap</small></span><CheckCircle2 size={19}/></div>
            <div className="vg-path-connector"/>
            <div className="vg-path-card vg-path-two"><span className="vg-path-icon"><BookOpen size={21}/></span><span><b>Understand</b><small>Learn with real examples</small></span><CheckCircle2 size={19}/></div>
            <div className="vg-path-connector"/>
            <div className="vg-path-card vg-path-three"><span className="vg-path-icon"><Target size={21}/></span><span><b>Grow</b><small>Practise and improve</small></span><Sparkles size={19}/></div>
            <div className="vg-visual-bottom"><span>CONCEPTS</span><span>•</span><span>CONFIDENCE</span><span>•</span><span>PROGRESS</span></div>
          </div>
        </div>
      </section>
      <div className="vg-strip"><div>AN EDUCATIONAL EXPERIENCE BUILT AROUND <strong>CLARITY</strong><span>✦</span><strong>CURIOSITY</strong><span>✦</span><strong>CONSISTENT PRACTICE</strong></div></div>
      <section id="approach" className="vg-section vg-section-approach">
        <div className="vg-section-intro"><span className="vg-section-label">OUR PHILOSOPHY</span><h2>Not just better marks.<br/><em>Better understanding.</em></h2><p>Tuition should be more than repeating the textbook. Our teaching approach combines human mentorship with thoughtfully designed learning tools.</p></div>
        <div className="vg-feature-grid">{features.map(({icon:Icon,title,detail},i)=><article className="vg-feature-card" key={title}><span className="vg-feature-index">0{i+1}</span><span className="vg-feature-icon"><Icon size={25}/></span><h3>{title}</h3><p>{detail}</p></article>)}</div>
      </section>
      <section id="programmes" className="vg-section vg-programmes"><div className="vg-section-intro"><span className="vg-section-label">ACADEMIC PROGRAMMES</span><h2>Support for every<br/><em>stage of learning.</em></h2><p>Purposeful guidance, adapted to the learner's age and academic needs.</p></div>
        <div className="vg-programme-grid">
          <article className="vg-programme-card"><div className="vg-programme-top"><span>FOUNDATION</span><BookOpen size={23}/></div><h3>Classes 1–5</h3><p>Build strong foundations in reading, mathematics, observation and learning habits.</p><ul><li>Foundational concepts</li><li>Interactive explanations</li><li>Confidence and communication</li></ul></article>
          <article className="vg-programme-card vg-programme-featured"><div className="vg-programme-top"><span>CONCEPT DEVELOPMENT</span><BrainCircuit size={23}/></div><h3>Classes 6–8</h3><p>Strengthen reasoning and problem-solving with examples, guided practice and concept checks.</p><ul><li>Mathematics and science reasoning</li><li>Diagnostic practice</li><li>Clear learning pathways</li></ul></article>
          <article className="vg-programme-card"><div className="vg-programme-top"><span>BOARD READINESS</span><GraduationCap size={23}/></div><h3>Classes 9–10</h3><p>Build conceptual clarity alongside systematic revision and examination preparation.</p><ul><li>Board-aligned learning</li><li>Worked examples and assessments</li><li>Revision and exam strategy</li></ul></article>
        </div><div className="vg-programme-footer"><span><ShieldCheck size={17}/> CBSE and Karnataka State Board support</span><button onClick={onExplore}>Explore learning resources <ArrowRight size={16}/></button></div>
      </section>
      <section id="journey" className="vg-section vg-journey"><div className="vg-journey-left"><span className="vg-section-label">HOW LEARNING WORKS</span><h2>A thoughtful path from<br/><em>confusion to clarity.</em></h2><p>Our goal is to understand what a learner needs, teach it clearly and make improvement visible.</p><button className="vg-primary-cta" onClick={onLogin}>Enter student portal <ArrowRight size={17}/></button></div><div className="vg-journey-steps">
        <div><span>01</span><div><h3>Identify the gap</h3><p>A teacher or short diagnostic helps identify what the student finds difficult.</p></div></div>
        <div><span>02</span><div><h3>Learn the concept</h3><p>Guided explanations, illustrations and examples make ideas easier to understand.</p></div></div>
        <div><span>03</span><div><h3>Practise with purpose</h3><p>Focused assignments and feedback help address common mistakes.</p></div></div>
        <div><span>04</span><div><h3>Review progress</h3><p>Students and families can revisit learning and track available academic records.</p></div></div>
      </div></section>
      <section className="vg-section vg-digital"><div className="vg-digital-text"><span className="vg-section-label">THE STUDENT EXPERIENCE</span><h2>Your classroom.<br/><em>Beyond the classroom.</em></h2><p>Once enrolled, students can sign in to their learning space. Class-specific content, attendance, homework and progress features are brought together in one place, subject to their account permissions.</p><div className="vg-digital-points"><span><ClipboardCheck size={18}/> Attendance & homework</span><span><PlayCircle size={18}/> Learning videos</span><span><Users size={18}/> Family communication</span></div><button className="vg-primary-cta" onClick={onLogin}>Go to student login <ArrowRight size={17}/></button></div><div className="vg-digital-visual"><div className="vg-screen"><div className="vg-screen-top"><span>VAYENTRA / LEARN HUB</span><span>● ● ●</span></div><div className="vg-screen-welcome">Welcome to your learning space<span>Choose your class after signing in</span></div><div className="vg-screen-row"><span><BookOpen size={20}/></span><div><b>Concept lessons</b><small>Learn one step at a time</small></div><ChevronDown size={16}/></div><div className="vg-screen-row"><span><ClipboardCheck size={20}/></span><div><b>Practice & feedback</b><small>Find what to improve</small></div><ChevronDown size={16}/></div><div className="vg-screen-row"><span><Target size={20}/></span><div><b>My learning progress</b><small>Keep growing</small></div><ChevronDown size={16}/></div></div></div></section>
      <section id="questions" className="vg-section vg-faq"><div className="vg-section-intro"><span className="vg-section-label">FREQUENTLY ASKED QUESTIONS</span><h2>Questions, <em>answered.</em></h2></div><div className="vg-faq-list">{[
        ['Which classes does Vayentra Gurukula support?','We provide academic support for Classes 1–10, with age-appropriate teaching and learning pathways.'],
        ['Which boards do you support?','Our programmes include CBSE and Karnataka State Board support. Contact the centre to confirm the subjects and batch availability for your class.'],
        ['Do students need an account?','Visitors can explore our website without logging in. Enrolled students use their assigned credentials to access their private learning portal.'],
        ['Can students choose their class after login?','Yes. Students choose their class and board after signing in. The selection is checked against their registered profile; it cannot change their official enrolment.']
      ].map(([q,a],i)=><div className="vg-faq-item" key={q}><button aria-expanded={faqOpen===i} onClick={()=>setFaqOpen(faqOpen===i?null:i)}>{q}<ChevronDown size={19}/></button>{faqOpen===i&&<p>{a}</p>}</div>)}</div></section>
      <section className="vg-final-cta"><div><span>THE NEXT STEP STARTS HERE</span><h2>Make every lesson<br/><em>mean something.</em></h2><p>Discover a more thoughtful approach to tuition and academic progress.</p><div><button className="vg-primary-cta" onClick={onLogin}>Student sign in <ArrowRight size={17}/></button><button className="vg-final-outline" onClick={onExplore}>Explore resources</button></div></div></section>
    </main>
    <footer className="vg-footer"><div><Logo variant="header" height={39}/><p>Concept-based academic coaching for Classes 1–10 in Bengaluru.</p></div><div><span>Vayentra Gurukula</span><small>An initiative of Vayentra Ventures Pvt. Ltd.</small><small>© {new Date().getFullYear()} Vayentra Gurukula. All rights reserved.</small></div></footer>
  </div>;
};