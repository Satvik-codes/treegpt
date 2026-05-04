import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import TreeConceptImage from '@/components/TreeConceptImage';
import SiteShell from '@/components/layout/SiteShell';

import '@/styles/treegpt-home.css';

type Feature = { num: string; title: string; desc: string };
type Step = { title: string; desc: string };
type Tech = { icon: string; name: string; desc: string };

const features: Feature[] = [
  {
    num: '01',
    title: 'Branching Conversations',
    desc: 'AI presents multiple approaches at once. Explore them side by side without losing any thread.',
  },
  {
    num: '02',
    title: 'Node-Based Thinking',
    desc: 'Each node is a full conversation thread. Go deep inside any without disturbing the others.',
  },
  {
    num: '03',
    title: 'Linear Deep Focus',
    desc: 'Found the right direction? Switch to linear mode. Normal chat, zero distraction.',
  },
  {
    num: '04',
    title: 'Collapse into Summaries',
    desc: 'Long threads compress into short titles. Your thinking stays readable and structured.',
  },
  {
    num: '05',
    title: 'Track What Failed',
    desc: "Mark paths as dead ends. Never repeat the same wrong turn twice.",
  },
  {
    num: '06',
    title: 'Instant Navigation',
    desc: 'Jump to any part of your thinking tree instantly. No infinite scroll, no lost context.',
  },
];

const steps: Step[] = [
  { title: 'Start with a problem', desc: 'Plant your root node. Define the challenge clearly.' },
  { title: 'AI suggests multiple approaches', desc: 'TreeGPT branches automatically—each approach gets its own path.' },
  { title: 'Explore independently', desc: "Dive into each branch without contaminating the others." },
  { title: 'Continue or branch further', desc: 'Go deep linearly or keep forking. The tree grows with your thinking.' },
  { title: 'Collapse completed thoughts', desc: 'Compress explored nodes into summary titles for clarity.' },
  { title: 'Navigate and refine', desc: 'Revisit any node, any path, any moment in your reasoning.' },
];

const cases: string[] = [
  'Debugging code without losing attempts',
  'Learning complex concepts step by step',
  'Comparing multiple solutions simultaneously',
  'Planning projects with branched strategies',
  'Making better technical decisions',
  'Research with parallel exploration paths',
];

const techs: Tech[] = [
  {
    icon: '⬡',
    name: 'React + Graph Viz',
    desc: 'Tree structure rendered as an interactive node graph with real-time updates.',
  },
  {
    icon: 'Σ',
    name: 'Supabase Backend',
    desc: 'Persistent context and state preserved across the entire conversation tree.',
  },
  {
    icon: '◈',
    name: 'Gemini API',
    desc: 'AI responses are context-aware per node — each branch has full memory of its path.',
  },
  {
    icon: '⌗',
    name: 'Tree State Engine',
    desc: 'Custom state management optimized for branching structures, not linear arrays.',
  },
];

export default function TreeGPTHome() {
  const prefersReducedMotion = useReducedMotion();

  // Register plugins once.
  useMemo(() => {
    gsap.registerPlugin(ScrollTrigger);
    return null;
  }, []);

  const heroRef = useRef<HTMLElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);
  const treeVizRef = useRef<HTMLDivElement | null>(null);

  const heroIn = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      } as const;
    }
    return {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    } as const;
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (heroContentRef.current) {
        gsap.fromTo(
          heroContentRef.current,
          { filter: 'blur(6px)', opacity: 0.001 },
          {
            filter: 'blur(0px)',
            opacity: 1,
            duration: 1.0,
            ease: 'power2.out',
          }
        );
      }

      if (treeVizRef.current) {
        gsap.fromTo(
          treeVizRef.current,
          { opacity: 0, x: 24, rotate: -0.6 },
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            duration: 1.1,
            ease: 'power3.out',
            delay: 0.15,
          }
        );

        // Slow ambient float.
        gsap.to(treeVizRef.current, {
          y: -10,
          duration: 4.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.1,
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const animateSection = (selector: string, itemsSelector: string, opts?: { y?: number; stagger?: number }) => {
        const section = document.querySelector<HTMLElement>(selector);
        if (!section) return;

        const y = opts?.y ?? 28;
        const stagger = opts?.stagger ?? 0.06;
        const items = Array.from(section.querySelectorAll<HTMLElement>(itemsSelector));

        // Section base.
        gsap.fromTo(
          section,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Inner stagger.
        if (items.length) {
          gsap.fromTo(
            items,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: 'power2.out',
              stagger,
              scrollTrigger: {
                trigger: section,
                start: 'top 74%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      };

      // Per-section “real” animations (distinct selectors so it’s not just generic fade).
      animateSection('.problem-section', '.section-label, .section-title, .problem-item', { stagger: 0.05 });
      animateSection('.solution-section', '.section-label, .section-title, .vs-card, .vs-divider', { stagger: 0.10 });
      animateSection('.features-section', '.section-label, .section-title, .feature-card', { stagger: 0.06 });
      animateSection('.how-section', '.section-label, .section-title, .step', { stagger: 0.07 });
      animateSection('.usecases-section', '.section-label, .section-title, .case-tag', { stagger: 0.03 });
      animateSection('.why-section', '.section-label, .section-title, .why-item, .why-card, .stat', { stagger: 0.05 });
      animateSection('.tech-section', '.section-label, .section-title, .tech-card', { stagger: 0.06 });
      animateSection('footer', '.footer-inner > *', { stagger: 0.05, y: 22 });

      // Highlight the tree lines slightly as you scroll past the hero.
      const treeLines = gsap.utils.toArray<SVGElement>('.tree-line');
      if (treeLines.length) {
        gsap.fromTo(
          treeLines,
          { strokeDasharray: 220, strokeDashoffset: 220 },
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: 'power2.out',
            stagger: 0.03,
            scrollTrigger: {
              trigger: '.problem-section',
              start: 'top 95%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

  // Ensure triggers align after fonts/images load.
  ScrollTrigger.refresh();
    }, heroRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const scrollToHow = useCallback(() => {
    const el = document.getElementById('how');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <SiteShell variant="marketing">
      {/* NAV */}
      <nav className="nav">
        <div className="logo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="14" r="2" fill="#c8913a" />
            <circle cx="8" cy="8" r="1.5" fill="#c8913a" opacity="0.7" />
            <circle cx="4" cy="4" r="1.5" fill="#c8913a" opacity="0.5" />
            <circle cx="12" cy="4" r="1.5" fill="#c8913a" opacity="0.5" />
            <line x1="8" y1="12" x2="8" y2="9.5" stroke="#c8913a" strokeWidth="1" />
            <line x1="8" y1="8" x2="4" y2="5.5" stroke="#c8913a" strokeWidth="0.75" opacity="0.6" />
            <line x1="8" y1="8" x2="12" y2="5.5" stroke="#c8913a" strokeWidth="0.75" opacity="0.6" />
          </svg>
          TreeGPT
        </div>

        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#how">How it works</a>
          </li>
          <li>
            <a href="#tech">Tech</a>
          </li>
        </ul>

        <Link to="/login" className="cta-nav" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Try TreeGPT →
        </Link>
      </nav>

      {/* HERO */}
  <section className="hero" ref={heroRef}>

        <motion.div
          className="hero-content"
          ref={heroContentRef}
          
          initial={heroIn.initial}
          animate={heroIn.animate}
          transition={heroIn.transition}
        >
          <motion.p
            className="eyebrow anim-1"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.05, ease: 'easeOut' }}
          >
            A new way to think with AI
          </motion.p>
          <motion.h1
            className="hero-headline anim-2"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            Think in
            <br />
            <em>Branches,</em>
            <br />
            Not Lines.
          </motion.h1>
          <motion.p
            className="hero-sub anim-3"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.65, delay: 0.22, ease: 'easeOut' }}
          >
            TreeGPT transforms AI conversations into structured thinking systems. Explore multiple ideas, track what works, and
            never lose context again.
          </motion.p>
          <motion.div
            className="hero-actions anim-4"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.32, ease: 'easeOut' }}
          >
            <Link
              to="/login"
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Start Thinking →
            </Link>
            <button type="button" className="btn-ghost" onClick={scrollToHow}>
              See how it works
            </button>
          </motion.div>
        </motion.div>

  <div className="tree-viz" ref={treeVizRef}>
          <TreeConceptImage />
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem-section">
        <p className="section-label">The Problem</p>
        <h2 className="section-title">AI Conversations Break Down When Thinking Gets Complex</h2>
        <div className="problem-grid">
          {(
            [
              [
                'LINEAR ≠ THINKING',
                "Conversations are linear, but real thinking is not. Your mind branches—your tools shouldn't hold you back.",
              ],
              ['LOST ALTERNATIVES', 'You try one solution and lose track of the others. Failed attempts get tangled with useful ones.'],
              ['BURIED IDEAS', 'Important insights get buried under hundreds of messages in infinite, unstructured scroll.'],
              ['NO STRUCTURE', 'You keep repeating context because current AI has no memory of your decision-making process.'],
              [
                'CHAOTIC HISTORY',
                "There's no way to mark what worked and what didn't. You repeat the same mistakes in new threads.",
              ],
              ['BROKEN CONTEXT', "Every new attempt means starting over. Your reasoning doesn't carry forward."],
            ] as const
          ).map(([icon, text], i) => (
            <div className="problem-item" key={i}>
              <div className="problem-icon">{icon}</div>
              <p className="problem-text">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section className="solution-section">
        <p className="section-label">The Solution</p>
        <h2 className="section-title">A Better Way to Think with AI</h2>
        <div className="vs-display">
          <div className="vs-card old">
            <p className="vs-label">Before — ChatGPT</p>
            <ul className="vs-items">
              {[
                'One linear thread',
                'Context gets lost',
                'No branching',
                'Ideas buried in scroll',
                'No failure tracking',
                'Repeat yourself constantly',
              ].map((t, i) => (
                <li key={i}>
                  <span className="dot" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="vs-divider">
            <span className="vs-arrow">→</span>
          </div>
          <div className="vs-card new">
            <p className="vs-label">After — TreeGPT</p>
            <ul className="vs-items">
              {[
                'Structured tree of ideas',
                'Context preserved per node',
                'Infinite branching paths',
                'Navigate any thought instantly',
                'Mark failures clearly',
                'Think the way your brain works',
              ].map((t, i) => (
                <li key={i}>
                  <span className="dot" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <p className="section-label">Core Features</p>
        <h2 className="section-title">Everything Your Thinking Needs</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.num}>
              <p className="feature-num">{f.num}</p>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <p className="section-label">How It Works</p>
        <h2 className="section-title">From Chaos to Clarity in Six Steps</h2>
        <div className="steps-flow">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-num">0{i + 1}</div>
              <div className="step-body">
                <p className="step-title">{s.title}</p>
                <p className="step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="usecases-section">
        <p className="section-label">Use Cases</p>
        <h2 className="section-title">Built for Complex Thinkers</h2>
        <div className="cases-grid">
          {cases.map((c, i) => (
            <div className="case-tag" key={i}>
              <span className="case-dot" />
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="why-section">
        <div className="why-inner">
          <p className="section-label" style={{ justifyContent: 'center' }}>
            Why It Exists
          </p>
          <div className="quote-block">
            I kept running into the same problem. One solution, then another, then another — and quickly losing track of what
            worked and what didn't. Thinking isn't linear. So I built a tool that isn't either.
          </div>
          <p className="quote-attr">— Satvik Sharma, Builder of TreeGPT</p>
        </div>
      </section>

      {/* TECH */}
      <section className="tech-section" id="tech">
        <p className="section-label">Technical Architecture</p>
        <h2 className="section-title">Built as a System, Not Just an Interface</h2>
        <div className="tech-grid">
          {techs.map((t, i) => (
            <div className="tech-item" key={i}>
              <div className="tech-icon">{t.icon}</div>
              <div>
                <p className="tech-name">{t.name}</p>
                <p className="tech-desc">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="cta-headline">
          Stop thinking
          <br />
          in <em>straight lines.</em>
        </h2>
        <p className="cta-sub">Start exploring ideas the way they actually work. Your thinking deserves better tools.</p>
        <div className="cta-actions">
          <Link
            to="/login"
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Launch TreeGPT →
          </Link>
          <a
            href="https://github.com/satvik-codes"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span className="footer-logo">TreeGPT</span>
        <span
          className="footer-by"
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: '0.75rem',
            color: 'var(--cream-dim)',
          }}
        >
          Built for people who think beyond linear conversations.
        </span>
        <a href="https://github.com/satvik-codes" target="_blank" rel="noreferrer" className="footer-link">
          github.com/satvik-codes →
        </a>
      </footer>
    </SiteShell>
  );
}
