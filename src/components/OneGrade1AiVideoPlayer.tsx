import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Volume1,
  VolumeX, 
  Subtitles, 
  Sparkles, 
  Clapperboard, 
  Maximize2,
  Minimize2,
  CheckCircle2
} from 'lucide-react';
import '../styles/one-grade1-video.css';

export type AiVideoScene = {
  sceneNumber: number;
  title: string;
  narration: string;
  visualPrompt: string;
  keyTakeaway: string;
  animationKind: string;
};

export type AiVideoLesson = {
  videoTitle: string;
  durationSeconds: number;
  storyboardSummary: string;
  productionStatus: 'ready' | 'published';
  audioNarrationUrl?: string;
  captionVttUrl?: string;
  posterUrl?: string;
  scenes: AiVideoScene[];
};

interface Props {
  video: AiVideoLesson;
  lessonTitle: string;
}

const PEDAGOGY_STEPS = [
  { num: 1, label: '1. Welcome Hook', scene: 0 },
  { num: 2, label: '2. Story World', scene: 0 },
  { num: 3, label: '3. Phonics & Words', scene: 1 },
  { num: 4, label: '4. Observation', scene: 1 },
  { num: 5, label: '5. Formative Check', scene: 2 },
  { num: 6, label: '6. Positive Feedback', scene: 2 },
  { num: 7, label: '7. Chapter Recap', scene: 3 }
];

export const OneGrade1AiVideoPlayer: React.FC<Props> = ({ video, lessonTitle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const duration = video.durationSeconds || 180;
  const scenes = video.scenes || [];
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  // Map currentTime to activeSceneIndex (4 scenes across duration)
  const sceneDuration = duration / Math.max(scenes.length, 1);

  // Sync Fullscreen State
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Web Speech Synthesis Fallback (when audio track is unavailable, errored, or not present)
  useEffect(() => {
    if (video.audioNarrationUrl && !audioError) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    if (isPlaying && !isMuted && currentScene) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScene.narration);
      utterance.lang = 'en-IN';
      utterance.rate = 0.88 * playbackSpeed;
      utterance.pitch = 1.05;
      synth.speak(utterance);
    } else {
      synth.cancel();
    }

    return () => {
      synth.cancel();
    };
  }, [isPlaying, isMuted, activeSceneIndex, playbackSpeed, currentScene, audioError, video.audioNarrationUrl]);

  // Main playback timer loop (handles timer-driven progress if audio track is not driving it)
  useEffect(() => {
    // If master audio is active and playing without error, audio onTimeUpdate handles progress
    if (video.audioNarrationUrl && !audioError && audioRef.current) {
      if (isPlaying) {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play().catch(() => {
          setAudioError(true);
        });
      } else {
        audioRef.current.pause();
      }
      return;
    }

    // Fallback timer when audio not available or errored
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          const calculatedScene = Math.min(
            Math.floor(next / sceneDuration),
            scenes.length - 1
          );
          if (calculatedScene !== activeSceneIndex) {
            setActiveSceneIndex(calculatedScene);
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, audioError, video.audioNarrationUrl, duration, sceneDuration, scenes.length, activeSceneIndex, playbackSpeed, isMuted, volume]);

  const togglePlay = () => {
    if (currentTime >= duration) {
      handleSeek(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    const newScene = Math.min(Math.floor(newTime / sceneDuration), scenes.length - 1);
    setActiveSceneIndex(newScene);
    if (audioRef.current && Number.isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
    }
  };

  const selectScene = (index: number) => {
    const targetTime = index * sceneDuration;
    setActiveSceneIndex(index);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
    if (nextMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  return (
    <div 
      ref={containerRef} 
      className="vg1-video-container" 
      aria-label={`AI Video Lesson for ${lessonTitle}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' && e.target === containerRef.current) {
          e.preventDefault();
          togglePlay();
        }
      }}
    >
      {/* Hidden Master Audio Element with fallback */}
      {video.audioNarrationUrl && (
        <audio
          ref={audioRef}
          src={video.audioNarrationUrl}
          preload="auto"
          playsInline
          onTimeUpdate={(e) => {
            const time = Math.floor(e.currentTarget.currentTime);
            setCurrentTime(time);
            const calculatedScene = Math.min(
              Math.floor(time / sceneDuration),
              scenes.length - 1
            );
            if (calculatedScene !== activeSceneIndex) {
              setActiveSceneIndex(calculatedScene);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(duration);
          }}
          onError={() => {
            setAudioError(true);
          }}
        />
      )}

      {/* Video Header Bar */}
      <div className="vg1-video-header">
        <div className="vg1-video-header-badge">
          <Clapperboard size={16} />
          <span>VAYENTRA AI STUDIO · CLASS 1 MRIDANG</span>
        </div>
        <div className="vg1-video-header-right">
          <span>Scene {activeSceneIndex + 1} of {scenes.length}</span>
          <span className="chip" style={{ background: '#0369a1', color: '#e0f2fe', padding: '2px 8px', fontSize: '11px', borderRadius: '4px' }}>
            HD 1080p
          </span>
          <span style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> NCERT Verified
          </span>
        </div>
      </div>

      {/* 7-Step Pedagogical Indicator Bar */}
      <div className="vg1-video-pedagogy-steps" role="navigation" aria-label="Learning Journey Stages">
        {PEDAGOGY_STEPS.map((step) => {
          const isCurrent = step.scene === activeSceneIndex;
          return (
            <button
              key={step.num}
              type="button"
              className={`vg1-video-pedagogy-step ${isCurrent ? 'current' : ''}`}
              onClick={() => selectScene(step.scene)}
              title={`Jump to ${step.label}`}
            >
              <Sparkles size={11} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Video Interactive Stage Canvas */}
      <div className="vg1-video-stage">
        <svg viewBox="0 0 960 540" className="vg1-video-canvas" role="img" aria-label={currentScene?.title || video.videoTitle}>
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="rainbow1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="17%" stopColor="#4338ca" />
              <stop offset="34%" stopColor="#0284c7" />
              <stop offset="51%" stopColor="#16a34a" />
              <stop offset="68%" stopColor="#facc15" />
              <stop offset="85%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Background Sky */}
          <rect width="960" height="540" fill="url(#skyGrad)" />

          {/* Render Scene Based on animationKind */}
          {currentScene?.animationKind === 'hands-actions' && (
            <g>
              {/* Animated Hands Scene */}
              <circle cx="480" cy="230" r="140" fill="#1e3a8a" opacity="0.3" className="anim-pulse" />
              {/* Left Hand */}
              <g transform="translate(360, 240) rotate(-10)" className="anim-sway">
                <rect x="-35" y="-50" width="70" height="90" rx="30" fill="#fbcfe8" stroke="#f472b6" strokeWidth="4" />
                <rect x="-42" y="-95" width="20" height="60" rx="10" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
                <rect x="-18" y="-115" width="20" height="75" rx="10" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
                <rect x="6" y="-105" width="20" height="70" rx="10" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
                <rect x="28" y="-85" width="18" height="55" rx="9" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
              </g>
              {/* Right Hand */}
              <g transform="translate(600, 240) scale(-1, 1) rotate(-10)" className="anim-sway">
                <rect x="-35" y="-50" width="70" height="90" rx="30" fill="#fbcfe8" stroke="#f472b6" strokeWidth="4" />
                <rect x="-42" y="-95" width="20" height="60" rx="10" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
                <rect x="-18" y="-115" width="20" height="75" rx="10" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
                <rect x="6" y="-105" width="20" height="70" rx="10" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
                <rect x="28" y="-85" width="18" height="55" rx="9" fill="#fbcfe8" stroke="#f472b6" strokeWidth="3" />
              </g>
              {/* Clapping Sound Wave Sparkles */}
              <circle cx="480" cy="200" r="18" fill="#fde047" className="anim-pulse" />
              <circle cx="440" cy="160" r="10" fill="#38bdf8" className="anim-float" />
              <circle cx="520" cy="160" r="12" fill="#38bdf8" className="anim-float" />
              <text x="480" y="380" textAnchor="middle" fill="#f8fafc" fontSize="28" fontWeight="800">
                CLAP, CLAP, CLAP! 👏
              </text>
            </g>
          )}

          {currentScene?.animationKind === 'greetings-sun' && (
            <g>
              {/* Smiling Sun Rising */}
              <g transform="translate(480, 190)" className="anim-pulse">
                <circle cx="0" cy="0" r="85" fill="url(#sunGrad)" />
                {/* Sun Rays */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <line 
                    key={i} 
                    x1="0" 
                    y1="-100" 
                    x2="0" 
                    y2="-130" 
                    stroke="#facc15" 
                    strokeWidth="7" 
                    strokeLinecap="round" 
                    transform={`rotate(${i * 30})`} 
                  />
                ))}
                {/* Sun Face */}
                <circle cx="-28" cy="-10" r="10" fill="#78350f" />
                <circle cx="28" cy="-10" r="10" fill="#78350f" />
                <path d="M-35 22 Q0 55 35 22" stroke="#78350f" strokeWidth="7" fill="none" strokeLinecap="round" />
              </g>
              {/* Green Hills in foreground */}
              <path d="M0 450 Q240 360 480 430 T960 420 L960 540 L0 540 Z" fill="#15803d" />
              <path d="M0 480 Q320 410 640 470 T960 460 L960 540 L0 540 Z" fill="#166534" />
              <text x="480" y="505" textAnchor="middle" fill="#fef08a" fontSize="26" fontWeight="800">
                "Namaste! Good Morning!" 🙏
              </text>
            </g>
          )}

          {currentScene?.animationKind === 'picture-pond' && (
            <g>
              {/* Pond & Tree Scene */}
              {/* Tree */}
              <rect x="180" y="160" width="45" height="230" rx="8" fill="#78350f" />
              <circle cx="202" cy="150" r="110" fill="#15803d" />
              <circle cx="150" cy="180" r="75" fill="#16a34a" />
              <circle cx="255" cy="170" r="80" fill="#22c55e" />

              {/* Water Pond */}
              <ellipse cx="600" cy="380" rx="280" ry="85" fill="#0284c7" opacity="0.8" />
              <ellipse cx="600" cy="380" rx="240" ry="65" fill="#0ea5e9" opacity="0.9" />

              {/* Swimming White Duck */}
              <g transform="translate(560, 350)" className="anim-float">
                <ellipse cx="0" cy="0" rx="42" ry="26" fill="#ffffff" />
                <circle cx="32" cy="-18" r="19" fill="#ffffff" />
                <polygon points="48,-18 70,-12 48,-6" fill="#f97316" />
                <circle cx="36" cy="-22" r="3.5" fill="#0f172a" />
                <path d="M-20 6 Q0 16 20 6" stroke="#e0f2fe" strokeWidth="4" fill="none" />
              </g>

              {/* Fluttering Butterfly */}
              <g transform="translate(360, 180)" className="anim-float">
                <ellipse cx="-16" cy="-12" rx="18" ry="12" fill="#facc15" transform="rotate(-30 -16 -12)" />
                <ellipse cx="16" cy="-12" rx="18" ry="12" fill="#facc15" transform="rotate(30 16 -12)" />
                <line x1="0" y1="-20" x2="0" y2="15" stroke="#713f12" strokeWidth="3" />
              </g>

              <text x="600" y="490" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="700">
                "Looking closely reveals every secret story!" 🦆
              </text>
            </g>
          )}

          {currentScene?.animationKind === 'capseller-monkeys' && (
            <g>
              {/* Grand Banyan Tree */}
              <path d="M420 540 L450 300 Q480 240 400 170 L340 120" stroke="#78350f" strokeWidth="38" fill="none" strokeLinecap="round" />
              <path d="M450 300 Q500 230 620 160" stroke="#78350f" strokeWidth="28" fill="none" strokeLinecap="round" />
              <circle cx="340" cy="120" r="110" fill="#166534" />
              <circle cx="620" cy="150" r="100" fill="#15803d" />
              <circle cx="480" cy="90" r="120" fill="#14532d" />

              {/* Mischievous Monkey with Cap */}
              <g transform="translate(360, 160)" className="anim-sway">
                <circle cx="0" cy="0" r="32" fill="#a16207" />
                <circle cx="-16" cy="-8" r="5" fill="#0f172a" />
                <circle cx="16" cy="-8" r="5" fill="#0f172a" />
                {/* Red Cap on Monkey */}
                <ellipse cx="0" cy="-28" rx="26" ry="12" fill="#dc2626" />
                <circle cx="0" cy="-38" r="7" fill="#fef08a" />
              </g>

              {/* Second Monkey with Blue Cap */}
              <g transform="translate(600, 190)" className="anim-sway">
                <circle cx="0" cy="0" r="28" fill="#a16207" />
                <circle cx="-13" cy="-7" r="4.5" fill="#0f172a" />
                <circle cx="13" cy="-7" r="4.5" fill="#0f172a" />
                {/* Blue Cap on Monkey */}
                <ellipse cx="0" cy="-24" rx="22" ry="10" fill="#0284c7" />
                <circle cx="0" cy="-32" r="6" fill="#fef08a" />
              </g>

              {/* Cap Seller Sleeping by Tree Trunk */}
              <g transform="translate(480, 440)">
                <ellipse cx="0" cy="0" rx="55" ry="32" fill="#d97706" />
                <circle cx="-35" cy="-24" r="22" fill="#fed7aa" />
                {/* Woven Basket with Remaining Caps */}
                <path d="M55 -15 L105 -15 L95 25 L65 25 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
                <ellipse cx="80" cy="-15" rx="22" ry="10" fill="#dc2626" />
              </g>

              <text x="480" y="515" textAnchor="middle" fill="#fde047" fontSize="24" fontWeight="800">
                "Copycat Monkeys & The Clever Cap Seller!" 🐒
              </text>
            </g>
          )}

          {currentScene?.animationKind === 'farm-animals' && (
            <g>
              {/* Red Barn */}
              <polygon points="120,400 120,240 220,170 320,240 320,400" fill="#b91c1c" />
              <polygon points="110,240 220,160 330,240" fill="#991b1b" />
              <rect x="180" y="290" width="80" height="110" fill="#ffffff" />
              <line x1="180" y1="290" x2="260" y2="400" stroke="#b91c1c" strokeWidth="5" />
              <line x1="260" y1="290" x2="180" y2="400" stroke="#b91c1c" strokeWidth="5" />

              {/* Gentle Cow */}
              <g transform="translate(520, 360)">
                <ellipse cx="0" cy="0" rx="90" ry="55" fill="#ffffff" stroke="#e2e8f0" strokeWidth="3" />
                {/* Black spots */}
                <circle cx="-35" cy="-12" r="22" fill="#1e293b" />
                <circle cx="30" cy="10" r="18" fill="#1e293b" />
                {/* Cow Head */}
                <circle cx="-95" cy="-35" r="35" fill="#ffffff" stroke="#e2e8f0" strokeWidth="3" />
                <ellipse cx="-115" cy="-20" rx="25" ry="16" fill="#fbcfe8" />
                <circle cx="-98" cy="-45" r="6" fill="#1e293b" />
                {/* Ears */}
                <ellipse cx="-75" cy="-65" rx="16" ry="8" fill="#fbcfe8" transform="rotate(-30 -75 -65)" />
              </g>

              {/* Mother Hen & Chicks */}
              <g transform="translate(780, 420)" className="anim-float">
                <circle cx="0" cy="0" r="26" fill="#ea580c" />
                <polygon points="24,-4 38,0 24,6" fill="#facc15" />
                <circle cx="10" cy="-8" r="4" fill="#0f172a" />
                {/* Little Chicks */}
                <circle cx="48" cy="12" r="12" fill="#facc15" />
                <circle cx="72" cy="14" r="11" fill="#facc15" />
              </g>

              <text x="480" y="505" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800">
                "Moo, Baa & Quack! Friendly Farm Animals" 🐄
              </text>
            </g>
          )}

          {currentScene?.animationKind === 'shapes-drawing' && (
            <g>
              {/* Shapes Transforming into Drawings */}
              <g transform="translate(240, 260)" className="anim-float">
                <circle cx="0" cy="-40" r="65" fill="#38bdf8" />
                <path d="M0 25 Q15 65 0 95 T0 135" stroke="#f43f5e" strokeWidth="5" fill="none" />
                <text x="0" y="-30" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="800">CIRCLE</text>
              </g>

              <g transform="translate(640, 280)">
                {/* House from Triangle & Square */}
                <rect x="-70" y="-30" width="140" height="120" rx="6" fill="#d97706" />
                <polygon points="0,-120 -90,-30 90,-30" fill="#facc15" />
                <rect x="-20" y="25" width="40" height="65" rx="4" fill="#15803d" />
                <circle cx="10" cy="58" r="4" fill="#fef08a" />
                <text x="0" y="-5" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="800">HOUSE</text>
              </g>

              <text x="480" y="495" textAnchor="middle" fill="#fde047" fontSize="24" fontWeight="800">
                "Our World is Made of Wonderful Shapes!" 🔺🟦
              </text>
            </g>
          )}

          {currentScene?.animationKind === 'healthy-plate' && (
            <g>
              {/* Gleaming Thali / Plate */}
              <circle cx="480" cy="250" r="185" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="8" />
              <circle cx="480" cy="250" r="170" fill="#f8fafc" />

              {/* Roti */}
              <circle cx="400" cy="230" r="65" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
              {/* Green Spinach Dal Bowl */}
              <circle cx="560" cy="180" r="50" fill="#16a34a" stroke="#cbd5e1" strokeWidth="4" />
              {/* Carrot Slices */}
              <ellipse cx="560" cy="290" rx="36" ry="24" fill="#ea580c" />
              {/* Curd Bowl */}
              <circle cx="480" cy="330" r="42" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />

              <text x="480" y="485" textAnchor="middle" fill="#facc15" fontSize="26" fontWeight="800">
                "Rainbow on My Plate: Nourish & Grow!" 🥕🥗
              </text>
            </g>
          )}

          {currentScene?.animationKind === 'four-seasons' && (
            <g>
              {/* Four Seasons Quadrant */}
              {/* 1. Summer */}
              <rect x="80" y="60" width="380" height="180" rx="14" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
              <circle cx="270" cy="140" r="45" fill="#f59e0b" className="anim-pulse" />
              <text x="270" y="215" textAnchor="middle" fill="#78350f" fontSize="20" fontWeight="800">SUMMER ☀️</text>

              {/* 2. Monsoon */}
              <rect x="500" y="60" width="380" height="180" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
              <path d="M690 100 Q740 85 790 100 A50 50 0 0 1 730 150 Z" fill="#0369a1" />
              <text x="690" y="215" textAnchor="middle" fill="#075985" fontSize="20" fontWeight="800">MONSOON 🌧️</text>

              {/* 3. Autumn */}
              <rect x="80" y="260" width="380" height="180" rx="14" fill="#ffedd5" stroke="#ea580c" strokeWidth="4" />
              <path d="M250 330 Q270 300 290 330 Q270 360 250 330" fill="#c2410c" className="anim-float" />
              <text x="270" y="415" textAnchor="middle" fill="#9a3412" fontSize="20" fontWeight="800">AUTUMN 🍂</text>

              {/* 4. Winter */}
              <rect x="500" y="260" width="380" height="180" rx="14" fill="#f1f5f9" stroke="#64748b" strokeWidth="4" />
              <circle cx="690" cy="330" r="35" fill="#93c5fd" />
              <text x="690" y="415" textAnchor="middle" fill="#1e293b" fontSize="20" fontWeight="800">WINTER ❄️</text>
            </g>
          )}

          {currentScene?.animationKind === 'anandi-rainbow' && (
            <g>
              {/* Huge Seven-Coloured Rainbow Arc */}
              <g className="anim-rainbow">
                <path d="M80 440 A400 400 0 0 1 880 440" stroke="#dc2626" strokeWidth="18" fill="none" />
                <path d="M98 440 A382 382 0 0 1 862 440" stroke="#ea580c" strokeWidth="18" fill="none" />
                <path d="M116 440 A364 364 0 0 1 844 440" stroke="#facc15" strokeWidth="18" fill="none" />
                <path d="M134 440 A346 346 0 0 1 826 440" stroke="#16a34a" strokeWidth="18" fill="none" />
                <path d="M152 440 A328 328 0 0 1 808 440" stroke="#0284c7" strokeWidth="18" fill="none" />
                <path d="M170 440 A310 310 0 0 1 790 440" stroke="#4338ca" strokeWidth="18" fill="none" />
                <path d="M188 440 A292 292 0 0 1 772 440" stroke="#7c3aed" strokeWidth="18" fill="none" />
              </g>

              {/* Colourful Flowers in Foreground */}
              <g transform="translate(240, 430)">
                <circle cx="0" cy="0" r="18" fill="#7c3aed" />
                <circle cx="0" cy="0" r="7" fill="#fef08a" />
              </g>
              <g transform="translate(480, 430)">
                <circle cx="0" cy="0" r="22" fill="#facc15" />
                <circle cx="0" cy="0" r="9" fill="#78350f" />
              </g>
              <g transform="translate(720, 430)">
                <circle cx="0" cy="0" r="19" fill="#dc2626" />
                <circle cx="0" cy="0" r="7" fill="#fef08a" />
              </g>

              <text x="480" y="505" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800">
                "VIBGYOR! Seven Colours of Wonder" 🌈
              </text>
            </g>
          )}

          {/* Fallback Animation Scene for other kinds */}
          {!['hands-actions', 'greetings-sun', 'picture-pond', 'capseller-monkeys', 'farm-animals', 'shapes-drawing', 'healthy-plate', 'four-seasons', 'anandi-rainbow'].includes(currentScene?.animationKind || '') && (
            <g>
              <circle cx="480" cy="220" r="120" fill="#0284c7" opacity="0.25" className="anim-pulse" />
              <circle cx="480" cy="220" r="80" fill="#38bdf8" opacity="0.3" className="anim-float" />
              <text x="480" y="230" textAnchor="middle" fill="#f8fafc" fontSize="26" fontWeight="800">
                {currentScene?.title || video.videoTitle}
              </text>
              <text x="480" y="380" textAnchor="middle" fill="#93c5fd" fontSize="20" fontWeight="600">
                {currentScene?.keyTakeaway || 'Listen, speak, and learn together!'}
              </text>
            </g>
          )}

          {/* Overlay Play Button if Paused */}
          {!isPlaying && (
            <g className="anim-pulse" style={{ pointerEvents: 'none' }}>
              <circle cx="480" cy="270" r="48" fill="rgba(2, 132, 199, 0.85)" stroke="#38bdf8" strokeWidth="3" />
              <polygon points="468,246 505,270 468,294" fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* Big Tap-to-Play Overlay */}
        {!isPlaying && (
          <button 
            type="button" 
            className="vg1-video-overlay-play" 
            onClick={togglePlay}
            aria-label="Play animated AI video lesson"
          >
            <Play size={36} fill="currentColor" />
          </button>
        )}

        {/* Live Subtitles / Captions Box */}
        {showCaptions && currentScene && (
          <div className="vg1-video-captions-box">
            <span className="vg1-video-captions-scene-tag">
              Scene {currentScene.sceneNumber}: {currentScene.title}
            </span>
            <p className="vg1-video-captions-text">
              "{currentScene.narration}"
            </p>
          </div>
        )}
      </div>

      {/* Observation Callout Bar */}
      <div className="vg1-video-takeaway-bar">
        <Sparkles size={16} color="#38bdf8" />
        <span><strong>Pedagogical Observation:</strong> {currentScene?.keyTakeaway || 'Active listening and visual observation'}</span>
      </div>

      {/* Video Control Bar */}
      <div className="vg1-video-controls">
        {/* Scrubber & Time */}
        <div className="vg1-video-progress-row">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="vg1-video-scrubber"
            aria-label="Video scrubber"
          />
          <div className="vg1-video-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Button Controls */}
        <div className="vg1-video-buttons-row">
          <div className="vg1-video-btn-group">
            <button
              type="button"
              className={`vg1-video-icon-btn ${isPlaying ? 'active' : ''}`}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} />}
              <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
            </button>

            <button
              type="button"
              className="vg1-video-icon-btn"
              onClick={() => handleSeek(0)}
              title="Restart from beginning"
              aria-label="Restart video"
            >
              <RotateCcw size={15} />
              <span>Restart</span>
            </button>

            {/* Volume Control Group with Slider */}
            <div className="vg1-video-volume-group">
              <button
                type="button"
                className="vg1-video-icon-btn"
                style={{ border: 'none', background: 'transparent', padding: '2px 4px' }}
                onClick={toggleMute}
                title={isMuted ? 'Turn narration voice on' : 'Mute narration'}
                aria-label={isMuted ? 'Turn narration voice on' : 'Mute narration'}
              >
                {getVolumeIcon()}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="vg1-video-volume-slider"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                aria-label="Volume slider"
              />
            </div>

            <button
              type="button"
              className={`vg1-video-icon-btn ${showCaptions ? 'active' : ''}`}
              onClick={() => setShowCaptions(!showCaptions)}
              title="Toggle Subtitles / Captions"
              aria-label="Toggle subtitles"
            >
              <Subtitles size={16} />
              <span>Captions</span>
            </button>
          </div>

          <div className="vg1-video-btn-group">
            <select
              value={playbackSpeed}
              onChange={(e) => {
                const sp = Number(e.target.value);
                setPlaybackSpeed(sp);
                if (audioRef.current) audioRef.current.playbackRate = sp;
              }}
              className="vg1-video-icon-btn"
              style={{ padding: '6px 8px' }}
              aria-label="Playback speed"
            >
              <option value="0.75">0.75x Slow</option>
              <option value="1.0">1.0x Normal</option>
              <option value="1.25">1.25x Fast</option>
            </select>

            <button
              type="button"
              className="vg1-video-icon-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Scene Chapters Picker */}
        <div className="vg1-video-scene-tabs">
          {scenes.map((sc, i) => (
            <button
              key={i}
              type="button"
              className={`vg1-video-scene-tab ${activeSceneIndex === i ? 'active' : ''}`}
              onClick={() => selectScene(i)}
            >
              <strong>Scene {i + 1}</strong>
              <span>{sc.title.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
