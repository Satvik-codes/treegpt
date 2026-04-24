
import { useState, useEffect, useRef } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

  :root {
    --forest: #0a0e08;
    --bark: #111a0d;
    --moss: #1a2714;
    --leaf: #2d4a1e;
    --amber: #c8913a;
    --amber-bright: #e8a84a;
    --amber-dim: #7a5520;
    --sage: #6b8f5a;
    --sage-bright: #8db57a;
    --cream: #f0ead8;
    --cream-dim: #b8b09a;
    --glow: rgba(200,145,58,0.15);
    --glow-strong: rgba(200,145,58,0.35);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--forest);
    color: var(--cream);
    font-family: 'Instrument Sans', sans-serif;
    overflow-x: hidden;
  }

  .serif { font-family: 'DM Serif Display', serif; }
  .mono { font-family: 'IBM Plex Mono', monospace; }

  .grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    padding: 1.2rem 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(10,14,8,0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(200,145,58,0.08);
  }

  .logo {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--amber);
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
  }

  .nav-links a {
    font-size: 0.85rem;
    color: var(--cream-dim);
    text-decoration: none;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .nav-links a:hover { color: var(--cream); }

  .cta-nav {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    padding: 0.5rem 1.2rem;
    background: var(--amber);
    color: var(--forest);
    border: none;
    cursor: pointer;
    letter-spacing: 0.04em;
    font-weight: 500;
    transition: background 0.2s, transform 0.1s;
  }

  .cta-nav:hover { background: var(--amber-bright); transform: translateY(-1px); }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    padding: 8rem 3rem 4rem;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 680px;
  }

  .eyebrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    color: var(--amber);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .eyebrow::before {
    content: '';
    display: block;
    width: 2rem;
    height: 1px;
    background: var(--amber);
    opacity: 0.6;
  }

  .hero-headline {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(3.5rem, 7vw, 6rem);
    line-height: 1.0;
    color: var(--cream);
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
  }

  .hero-headline em {
    font-style: italic;
    color: var(--amber);
  }

  .hero-sub {
    font-size: 1.1rem;
    color: var(--cream-dim);
    line-height: 1.7;
    margin-bottom: 2.5rem;
    max-width: 520px;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .btn-primary {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.85rem;
    padding: 0.9rem 2rem;
    background: var(--amber);
    color: var(--forest);
    border: none;
    cursor: pointer;
    letter-spacing: 0.04em;
    font-weight: 500;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.1);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,145,58,0.3); }

  .btn-ghost {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.85rem;
    padding: 0.9rem 2rem;
    background: transparent;
    color: var(--cream-dim);
    border: 1px solid rgba(200,145,58,0.25);
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: all 0.2s;
  }

  .btn-ghost:hover { border-color: var(--amber); color: var(--amber); }

  /* Tree Visualization */
  .tree-viz {
    position: absolute;
    right: -2rem;
    top: 50%;
    transform: translateY(-50%);
    width: 55%;
    height: 80vh;
    pointer-events: none;
  }

  /* SECTION COMMONS */
  section {
    padding: 7rem 3rem;
    position: relative;
  }

  .section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    color: var(--amber);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .section-label::before {
    content: '';
    display: block;
    width: 1.5rem;
    height: 1px;
    background: var(--amber);
    opacity: 0.6;
  }

  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.2rem, 4vw, 3.5rem);
    line-height: 1.1;
    color: var(--cream);
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
    max-width: 700px;
  }

  /* PROBLEM */
  .problem-section {
    background: var(--bark);
    border-top: 1px solid rgba(200,145,58,0.06);
    border-bottom: 1px solid rgba(200,145,58,0.06);
  }

  .problem-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    margin-top: 3rem;
    background: rgba(200,145,58,0.08);
    border: 1px solid rgba(200,145,58,0.08);
  }

  .problem-item {
    background: var(--bark);
    padding: 2rem;
    position: relative;
  }

  .problem-item::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: transparent;
    transition: background 0.3s;
  }

  .problem-item:hover::before { background: var(--amber); }

  .problem-icon {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    color: var(--amber-dim);
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
  }

  .problem-text {
    font-size: 0.95rem;
    color: var(--cream-dim);
    line-height: 1.65;
  }

  /* SOLUTION */
  .solution-section { background: var(--forest); }

  .vs-display {
    display: flex;
    gap: 3rem;
    align-items: stretch;
    margin-top: 3.5rem;
  }

  .vs-card {
    flex: 1;
    padding: 2.5rem;
    border: 1px solid rgba(200,145,58,0.12);
    position: relative;
    overflow: hidden;
  }

  .vs-card.old {
    opacity: 0.7;
  }

  .vs-card.new {
    border-color: rgba(200,145,58,0.35);
    background: rgba(200,145,58,0.04);
  }

  .vs-card.new::after {
    content: '';
    position: absolute;
    top: -1px; left: -1px; right: -1px;
    height: 2px;
    background: var(--amber);
  }

  .vs-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    color: var(--cream-dim);
  }

  .vs-card.new .vs-label { color: var(--amber); }

  .vs-items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .vs-items li {
    font-size: 0.9rem;
    color: var(--cream-dim);
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    line-height: 1.5;
  }

  .vs-items li .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--amber-dim);
    margin-top: 0.45rem;
    flex-shrink: 0;
  }

  .vs-card.new .vs-items li { color: var(--cream); }
  .vs-card.new .vs-items li .dot { background: var(--amber); }

  .vs-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .vs-arrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.5rem;
    color: var(--amber);
    opacity: 0.5;
  }

  /* FEATURES */
  .features-section {
    background: var(--bark);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    margin-top: 3.5rem;
    background: rgba(200,145,58,0.07);
    border: 1px solid rgba(200,145,58,0.07);
  }

  .feature-card {
    background: var(--bark);
    padding: 2.5rem 2rem;
    transition: background 0.25s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }

  .feature-card:hover { background: var(--moss); }

  .feature-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 2rem; right: 2rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,145,58,0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .feature-card:hover::after { opacity: 1; }

  .feature-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.65rem;
    color: var(--amber-dim);
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
  }

  .feature-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.3rem;
    color: var(--cream);
    margin-bottom: 1rem;
    line-height: 1.25;
  }

  .feature-desc {
    font-size: 0.88rem;
    color: var(--cream-dim);
    line-height: 1.7;
  }

  /* HOW IT WORKS */
  .how-section { background: var(--forest); }

  .steps-flow {
    margin-top: 3.5rem;
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    max-width: 700px;
  }

  .steps-flow::before {
    content: '';
    position: absolute;
    left: 1.5rem;
    top: 2rem;
    bottom: 2rem;
    width: 1px;
    background: linear-gradient(to bottom, transparent, var(--amber-dim), var(--amber-dim), transparent);
    opacity: 0.4;
  }

  .step {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    padding: 1.5rem 0;
    position: relative;
  }

  .step-num {
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    color: var(--amber);
    border: 1px solid rgba(200,145,58,0.3);
    background: var(--forest);
    position: relative;
    z-index: 1;
  }

  .step-body { padding-top: 0.5rem; }

  .step-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 0.4rem;
  }

  .step-desc {
    font-size: 0.88rem;
    color: var(--cream-dim);
    line-height: 1.65;
  }

  /* USE CASES */
  .usecases-section { background: var(--bark); }

  .cases-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 3rem;
  }

  .case-tag {
    padding: 1rem 1.5rem;
    border: 1px solid rgba(200,145,58,0.12);
    font-size: 0.875rem;
    color: var(--cream-dim);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s;
    cursor: default;
  }

  .case-tag:hover {
    border-color: rgba(200,145,58,0.4);
    color: var(--cream);
    background: rgba(200,145,58,0.04);
  }

  .case-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--amber);
    flex-shrink: 0;
  }

  /* WHY */
  .why-section {
    background: var(--forest);
    padding: 8rem 3rem;
  }

  .why-inner {
    max-width: 640px;
    margin: 0 auto;
    text-align: center;
  }

  .quote-block {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.3rem, 2.5vw, 1.9rem);
    line-height: 1.55;
    color: var(--cream);
    font-style: italic;
    padding: 3rem 0;
    position: relative;
  }

  .quote-block::before {
    content: '"';
    position: absolute;
    top: 0.5rem; left: -1.5rem;
    font-size: 6rem;
    color: var(--amber);
    opacity: 0.15;
    line-height: 1;
    font-style: normal;
  }

  .quote-attr {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.78rem;
    color: var(--amber);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 1.5rem;
  }

  /* TECH */
  .tech-section { background: var(--bark); }

  .tech-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 3rem;
  }

  .tech-item {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    padding: 1.5rem;
    border: 1px solid rgba(200,145,58,0.08);
  }

  .tech-icon {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.65rem;
    color: var(--amber);
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(200,145,58,0.25);
    flex-shrink: 0;
  }

  .tech-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 0.35rem;
  }

  .tech-desc {
    font-size: 0.82rem;
    color: var(--cream-dim);
    line-height: 1.6;
  }

  /* CTA FINAL */
  .cta-section {
    background: var(--bark);
    border-top: 1px solid rgba(200,145,58,0.1);
    padding: 10rem 3rem 8rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .cta-glow {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(ellipse at center, rgba(200,145,58,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .cta-headline {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    color: var(--cream);
    line-height: 1.1;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
    position: relative;
    z-index: 1;
  }

  .cta-headline em {
    font-style: italic;
    color: var(--amber);
  }

  .cta-sub {
    font-size: 1rem;
    color: var(--cream-dim);
    max-width: 480px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;
    position: relative;
    z-index: 1;
  }

  .cta-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  /* FOOTER */
  footer {
    padding: 2.5rem 3rem;
    background: var(--forest);
    border-top: 1px solid rgba(200,145,58,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-logo {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    color: var(--amber);
  }

  .footer-by {
    font-size: 0.8rem;
    color: var(--cream-dim);
  }

  .footer-link {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    color: var(--amber-dim);
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: color 0.2s;
  }

  .footer-link:hover { color: var(--amber); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes drawLine {
    from { stroke-dashoffset: 800; }
    to { stroke-dashoffset: 0; }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; r: 5; }
    50% { opacity: 1; r: 7; }
  }

  .anim-1 { animation: fadeUp 0.8s ease both 0.1s; }
  .anim-2 { animation: fadeUp 0.8s ease both 0.3s; }
  .anim-3 { animation: fadeUp 0.8s ease both 0.5s; }
  .anim-4 { animation: fadeUp 0.8s ease both 0.7s; }

  .tree-line {
    stroke-dasharray: 800;
    stroke-dashoffset: 800;
    animation: drawLine 2.5s ease-out forwards;
  }

  .tree-line-2 { animation-delay: 0.4s; }
  .tree-line-3 { animation-delay: 0.7s; }
  .tree-line-4 { animation-delay: 0.9s; }
  .tree-line-5 { animation-delay: 1.1s; }

  .node-pulse { animation: pulse-glow 2.5s ease-in-out infinite; }
  .node-pulse-2 { animation: pulse-glow 2.5s ease-in-out infinite 0.8s; }
  .node-pulse-3 { animation: pulse-glow 2.5s ease-in-out infinite 1.4s; }

  @media (max-width: 900px) {
    .features-grid, .tech-grid { grid-template-columns: 1fr 1fr; }
    .problem-grid { grid-template-columns: 1fr; }
    .cases-grid { grid-template-columns: 1fr 1fr; }
    .vs-display { flex-direction: column; }
    .vs-divider { transform: rotate(90deg); }
    .tree-viz { display: none; }
    .hero-content { max-width: 100%; }
    .nav { padding: 1rem 1.5rem; }
    section { padding: 5rem 1.5rem; }
  }

  @media (max-width: 600px) {
    .features-grid, .tech-grid, .cases-grid { grid-template-columns: 1fr; }
    nav .nav-links { display: none; }
  }
`;

const TreeSVG = () => (
  <svg viewBox="0 0 560 700" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Root */}
    <line x1="280" y1="620" x2="280" y2="520" stroke="#c8913a" strokeWidth="1.5" strokeOpacity="0.35" className="tree-line"/>

    {/* Level 1 branches */}
    <line x1="280" y1="520" x2="160" y2="420" stroke="#c8913a" strokeWidth="1.5" strokeOpacity="0.3" className="tree-line tree-line-2"/>
    <line x1="280" y1="520" x2="400" y2="420" stroke="#c8913a" strokeWidth="1.5" strokeOpacity="0.3" className="tree-line tree-line-2"/>

    {/* Level 2 branches L */}
    <line x1="160" y1="420" x2="90" y2="300" stroke="#c8913a" strokeWidth="1" strokeOpacity="0.22" className="tree-line tree-line-3"/>
    <line x1="160" y1="420" x2="210" y2="310" stroke="#c8913a" strokeWidth="1" strokeOpacity="0.22" className="tree-line tree-line-3"/>

    {/* Level 2 branches R */}
    <line x1="400" y1="420" x2="340" y2="310" stroke="#c8913a" strokeWidth="1" strokeOpacity="0.22" className="tree-line tree-line-3"/>
    <line x1="400" y1="420" x2="470" y2="300" stroke="#c8913a" strokeWidth="1" strokeOpacity="0.22" className="tree-line tree-line-3"/>

    {/* Level 3 */}
    <line x1="90" y1="300" x2="55" y2="190" stroke="#c8913a" strokeWidth="0.75" strokeOpacity="0.16" className="tree-line tree-line-4"/>
    <line x1="90" y1="300" x2="120" y2="195" stroke="#c8913a" strokeWidth="0.75" strokeOpacity="0.16" className="tree-line tree-line-4"/>
    <line x1="210" y1="310" x2="180" y2="195" stroke="#c8913a" strokeWidth="0.75" strokeOpacity="0.16" className="tree-line tree-line-4"/>
    <line x1="340" y1="310" x2="310" y2="195" stroke="#c8913a" strokeWidth="0.75" strokeOpacity="0.16" className="tree-line tree-line-4"/>
    <line x1="470" y1="300" x2="440" y2="190" stroke="#c8913a" strokeWidth="0.75" strokeOpacity="0.16" className="tree-line tree-line-4"/>
    <line x1="470" y1="300" x2="500" y2="195" stroke="#c8913a" strokeWidth="0.75" strokeOpacity="0.16" className="tree-line tree-line-5"/>

    {/* Level 4 tiny */}
    <line x1="55" y1="190" x2="40" y2="115" stroke="#c8913a" strokeWidth="0.5" strokeOpacity="0.1" className="tree-line tree-line-5"/>
    <line x1="120" y1="195" x2="140" y2="115" stroke="#c8913a" strokeWidth="0.5" strokeOpacity="0.1" className="tree-line tree-line-5"/>
    <line x1="500" y1="195" x2="520" y2="115" stroke="#c8913a" strokeWidth="0.5" strokeOpacity="0.1" className="tree-line tree-line-5"/>

    {/* Nodes - main */}
    <circle cx="280" cy="620" r="8" fill="#c8913a" opacity="0.9" filter="url(#glow)" className="node-pulse"/>
    <circle cx="280" cy="520" r="6" fill="#c8913a" opacity="0.8" filter="url(#glow)"/>
    <circle cx="160" cy="420" r="5" fill="#c8913a" opacity="0.65" className="node-pulse-2"/>
    <circle cx="400" cy="420" r="5" fill="#c8913a" opacity="0.65" className="node-pulse-3"/>
    <circle cx="90" cy="300" r="4" fill="#c8913a" opacity="0.5"/>
    <circle cx="210" cy="310" r="4" fill="#c8913a" opacity="0.5"/>
    <circle cx="340" cy="310" r="4" fill="#c8913a" opacity="0.5"/>
    <circle cx="470" cy="300" r="4" fill="#c8913a" opacity="0.5"/>
    <circle cx="55" cy="190" r="3" fill="#c8913a" opacity="0.38"/>
    <circle cx="120" cy="195" r="3" fill="#c8913a" opacity="0.38"/>
    <circle cx="180" cy="195" r="3" fill="#c8913a" opacity="0.38"/>
    <circle cx="310" cy="195" r="3" fill="#c8913a" opacity="0.38"/>
    <circle cx="440" cy="190" r="3" fill="#c8913a" opacity="0.38"/>
    <circle cx="500" cy="195" r="3" fill="#c8913a" opacity="0.38"/>
    <circle cx="40" cy="115" r="2.5" fill="#c8913a" opacity="0.22"/>
    <circle cx="140" cy="115" r="2.5" fill="#c8913a" opacity="0.22"/>
    <circle cx="520" cy="115" r="2.5" fill="#c8913a" opacity="0.22"/>

    {/* Node labels */}
    <rect x="235" y="605" width="90" height="28" rx="2" fill="rgba(10,14,8,0.85)" stroke="rgba(200,145,58,0.35)" strokeWidth="0.75"/>
    <text x="280" y="623" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="9" fill="#c8913a" letterSpacing="0.05em">PROBLEM</text>

    <rect x="228" y="506" width="104" height="26" rx="2" fill="rgba(10,14,8,0.85)" stroke="rgba(200,145,58,0.25)" strokeWidth="0.75"/>
    <text x="280" y="523" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="9" fill="#c8913a" letterSpacing="0.05em">EXPLORE</text>

    <rect x="108" y="407" width="104" height="24" rx="2" fill="rgba(10,14,8,0.85)" stroke="rgba(200,145,58,0.2)" strokeWidth="0.75"/>
    <text x="160" y="424" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="8" fill="#e0d4bc" letterSpacing="0.04em">APPROACH A</text>

    <rect x="348" y="407" width="104" height="24" rx="2" fill="rgba(10,14,8,0.85)" stroke="rgba(200,145,58,0.2)" strokeWidth="0.75"/>
    <text x="400" y="424" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="8" fill="#e0d4bc" letterSpacing="0.04em">APPROACH B</text>

    <rect x="37" y="288" width="106" height="22" rx="2" fill="rgba(10,14,8,0.8)" stroke="rgba(200,145,58,0.12)" strokeWidth="0.75"/>
    <text x="90" y="303" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="7.5" fill="#b8b09a" letterSpacing="0.04em">SOLUTION 1</text>

    <rect x="158" y="298" width="106" height="22" rx="2" fill="rgba(10,14,8,0.8)" stroke="rgba(200,145,58,0.12)" strokeWidth="0.75"/>
    <text x="211" y="313" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="7.5" fill="#b8b09a" letterSpacing="0.04em">SOLUTION 2</text>

    {/* Failed marker */}
    <line x1="36" y1="286" x2="94" y2="294" stroke="#7a3a2a" strokeWidth="1.5" strokeOpacity="0.7"/>
    <line x1="94" y1="286" x2="36" y2="294" stroke="#7a3a2a" strokeWidth="1.5" strokeOpacity="0.7"/>

    <rect x="288" y="298" width="106" height="22" rx="2" fill="rgba(10,14,8,0.8)" stroke="rgba(107,143,90,0.3)" strokeWidth="0.75"/>
    <text x="341" y="313" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="7.5" fill="#8db57a" letterSpacing="0.04em">✓ SOLUTION</text>

    <rect x="418" y="288" width="106" height="22" rx="2" fill="rgba(10,14,8,0.8)" stroke="rgba(200,145,58,0.12)" strokeWidth="0.75"/>
    <text x="471" y="303" textAnchor="middle" fontFamily="'IBM Plex Mono'" fontSize="7.5" fill="#b8b09a" letterSpacing="0.04em">DEEP FOCUS</text>
  </svg>
);

const features = [
  { num: "01", title: "Branching Conversations", desc: "AI presents multiple approaches at once. Explore them side by side without losing any thread." },
  { num: "02", title: "Node-Based Thinking", desc: "Each node is a full conversation thread. Go deep inside any without disturbing the others." },
  { num: "03", title: "Linear Deep Focus", desc: "Found the right direction? Switch to linear mode. Normal chat, zero distraction." },
  { num: "04", title: "Collapse into Summaries", desc: "Long threads compress into short titles. Your thinking stays readable and structured." },
  { num: "05", title: "Track What Failed", desc: "Mark paths as dead ends. Never repeat the same wrong turn twice." },
  { num: "06", title: "Instant Navigation", desc: "Jump to any part of your thinking tree instantly. No infinite scroll, no lost context." },
];

const steps = [
  { title: "Start with a problem", desc: "Plant your root node. Define the challenge clearly." },
  { title: "AI suggests multiple approaches", desc: "TreeGPT branches automatically—each approach gets its own path." },
  { title: "Explore independently", desc: "Dive into each branch without contaminating the others." },
  { title: "Continue or branch further", desc: "Go deep linearly or keep forking. The tree grows with your thinking." },
  { title: "Collapse completed thoughts", desc: "Compress explored nodes into summary titles for clarity." },
  { title: "Navigate and refine", desc: "Revisit any node, any path, any moment in your reasoning." },
];

const cases = [
  "Debugging code without losing attempts",
  "Learning complex concepts step by step",
  "Comparing multiple solutions simultaneously",
  "Planning projects with branched strategies",
  "Making better technical decisions",
  "Research with parallel exploration paths",
];

const techs = [
  { icon: "⬡", name: "React + Graph Viz", desc: "Tree structure rendered as an interactive node graph with real-time updates." },
  { icon: "Σ", name: "Supabase Backend", desc: "Persistent context and state preserved across the entire conversation tree." },
  { icon: "◈", name: "Gemini API", desc: "AI responses are context-aware per node — each branch has full memory of its path." },
  { icon: "⌗", name: "Tree State Engine", desc: "Custom state management optimized for branching structures, not linear arrays." },
];

export default function TreeGPTLanding() {
  return (
    <>
      <style>{style}</style>
      <div className="grain" />

      {/* NAV */}
      <nav className="nav">
        <div className="logo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="14" r="2" fill="#c8913a"/>
            <circle cx="8" cy="8" r="1.5" fill="#c8913a" opacity="0.7"/>
            <circle cx="4" cy="4" r="1.5" fill="#c8913a" opacity="0.5"/>
            <circle cx="12" cy="4" r="1.5" fill="#c8913a" opacity="0.5"/>
            <line x1="8" y1="12" x2="8" y2="9.5" stroke="#c8913a" strokeWidth="1"/>
            <line x1="8" y1="8" x2="4" y2="5.5" stroke="#c8913a" strokeWidth="0.75" opacity="0.6"/>
            <line x1="8" y1="8" x2="12" y2="5.5" stroke="#c8913a" strokeWidth="0.75" opacity="0.6"/>
          </svg>
          TreeGPT
        </div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#tech">Tech</a></li>
        </ul>
        <button className="cta-nav">Try TreeGPT →</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <svg width="100%" height="100%" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
            <radialGradient id="heroGrad" cx="70%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#c8913a" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="#c8913a" stopOpacity="0"/>
            </radialGradient>
            <rect width="1400" height="900" fill="url(#heroGrad)"/>
          </svg>
        </div>

        <div className="hero-content">
          <p className="eyebrow anim-1">A new way to think with AI</p>
          <h1 className="hero-headline anim-2">
            Think in<br/><em>Branches,</em><br/>Not Lines.
          </h1>
          <p className="hero-sub anim-3">
            TreeGPT transforms AI conversations into structured thinking systems. Explore multiple ideas, track what works, and never lose context again.
          </p>
          <div className="hero-actions anim-4">
            <button className="btn-primary">Start Thinking →</button>
            <button className="btn-ghost">See how it works</button>
          </div>
        </div>

        <div className="tree-viz">
          <TreeSVG />
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem-section">
        <p className="section-label">The Problem</p>
        <h2 className="section-title">AI Conversations Break Down When Thinking Gets Complex</h2>
        <div className="problem-grid">
          {[
            ["LINEAR ≠ THINKING", "Conversations are linear, but real thinking is not. Your mind branches—your tools shouldn't hold you back."],
            ["LOST ALTERNATIVES", "You try one solution and lose track of the others. Failed attempts get tangled with useful ones."],
            ["BURIED IDEAS", "Important insights get buried under hundreds of messages in infinite, unstructured scroll."],
            ["NO STRUCTURE", "You keep repeating context because current AI has no memory of your decision-making process."],
            ["CHAOTIC HISTORY", "There's no way to mark what worked and what didn't. You repeat the same mistakes in new threads."],
            ["BROKEN CONTEXT", "Every new attempt means starting over. Your reasoning doesn't carry forward."],
          ].map(([icon, text], i) => (
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
              {["One linear thread", "Context gets lost", "No branching", "Ideas buried in scroll", "No failure tracking", "Repeat yourself constantly"].map((t, i) => (
                <li key={i}><span className="dot"/>{t}</li>
              ))}
            </ul>
          </div>
          <div className="vs-divider"><span className="vs-arrow">→</span></div>
          <div className="vs-card new">
            <p className="vs-label">After — TreeGPT</p>
            <ul className="vs-items">
              {["Structured tree of ideas", "Context preserved per node", "Infinite branching paths", "Navigate any thought instantly", "Mark failures clearly", "Think the way your brain works"].map((t, i) => (
                <li key={i}><span className="dot"/>{t}</li>
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
              <span className="case-dot"/>
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="why-section">
        <div className="why-inner">
          <p className="section-label" style={{justifyContent:'center'}}>Why It Exists</p>
          <div className="quote-block">
            I kept running into the same problem. One solution, then another, then another — and quickly losing track of what worked and what didn't. Thinking isn't linear. So I built a tool that isn't either.
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
        <div className="cta-glow"/>
        <h2 className="cta-headline">
          Stop thinking<br/>in <em>straight lines.</em>
        </h2>
        <p className="cta-sub">
          Start exploring ideas the way they actually work. Your thinking deserves better tools.
        </p>
        <div className="cta-actions">
          <button className="btn-primary">Launch TreeGPT →</button>
          <a href="https://github.com/satvik-codes" target="_blank" rel="noreferrer" className="btn-ghost" style={{textDecoration:'none',display:'inline-flex',alignItems:'center'}}>View on GitHub</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span className="footer-logo">TreeGPT</span>
        <span className="footer-by" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.75rem',color:'var(--cream-dim)'}}>Built for people who think beyond linear conversations.</span>
        <a href="https://github.com/satvik-codes" target="_blank" rel="noreferrer" className="footer-link">github.com/satvik-codes →</a>
      </footer>
    </>
  );
}
