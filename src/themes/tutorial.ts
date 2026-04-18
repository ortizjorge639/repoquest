import type { RepoData } from '../types.js';

// Escape HTML to safely insert user content into terminal blocks
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Convert env var list to a styled table HTML
function envTable(vars: RepoData['prerequisites']['envVars']): string {
  if (!vars.length) return '';
  const rows = vars.map(v => `
    <tr class="tut-tr" data-stagger>
      <td class="tut-td tut-key">${esc(v.key)}</td>
      <td class="tut-td tut-desc">${esc(v.description) || '—'}</td>
      <td class="tut-td tut-req ${v.required ? 'req' : 'opt'}">${v.required ? 'required' : 'optional'}</td>
    </tr>`).join('');
  return `<table class="tut-table" data-entrance="fade">
    <thead><tr>
      <th class="tut-th">Variable</th>
      <th class="tut-th">Description</th>
      <th class="tut-th">Required</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// Turn a list of strings into styled step cards
function stepCards(steps: string[], startIdx = 0): string {
  return steps.map((s, i) => `
    <div class="tut-step" data-stagger>
      <div class="tut-step-num">${startIdx + i + 1}</div>
      <div class="tut-step-text">${esc(s)}</div>
    </div>`).join('');
}

// Typing animation: wrap each char in a span for stagger-in
function typeSpans(id: string, text: string): string {
  const chars = Array.from(esc(text)).map((c, i) =>
    `<span class="tut-char" id="${id}-c${i}">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
  return `<span id="${id}" class="tut-type-wrap">${chars}</span>`;
}

export const tutorialTheme = {
  name: 'tutorial',
  label: 'Tutorial',

  styles: `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { background: #0F1117; font-family: 'DM Sans', sans-serif; color: #E2E8F0; }

    /* ── Layout ─────────────────────────────────────────────── */
    .tut-scene {
      display: flex; flex-direction: row;
      width: 100%; height: 100%;
    }
    /* Left sidebar — context strip */
    .tut-sidebar {
      width: 320px; min-width: 320px; height: 100%;
      background: #080B10; border-right: 1px solid #1E2535;
      display: flex; flex-direction: column;
      padding: 60px 36px; gap: 32px; flex-shrink: 0;
    }
    .tut-project-name {
      font-size: 20px; font-weight: 700; color: #F1F5F9; letter-spacing: -0.5px;
    }
    .tut-project-ver {
      font-family: 'DM Mono', monospace; font-size: 12px; color: #475569;
      margin-top: 4px;
    }
    .tut-nav { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    .tut-nav-item {
      font-size: 13px; font-weight: 500; color: #475569;
      padding: 8px 12px; border-radius: 6px; letter-spacing: 0.01em;
    }
    .tut-nav-item.active {
      background: #1E293B; color: #94A3B8;
      border-left: 2px solid #3B82F6;
    }
    .tut-nav-item.done { color: #22C55E; }
    .tut-nav-item.done::before { content: "✓ "; }
    .tut-tech-strip { margin-top: auto; }
    .tut-tech-label { font-size: 11px; letter-spacing: 2px; color: #334155; text-transform: uppercase; margin-bottom: 10px; }
    .tut-tech-pill {
      display: inline-block; background: #0F172A; border: 1px solid #1E293B;
      border-radius: 4px; padding: 4px 10px; margin: 3px 3px 3px 0;
      font-family: 'DM Mono', monospace; font-size: 12px; color: #64748B;
    }

    /* ── Main content ───────────────────────────────────────── */
    .tut-main {
      flex: 1; height: 100%; overflow: hidden;
      display: flex; flex-direction: column;
      padding: 56px 72px 40px 64px; gap: 28px;
    }
    .tut-breadcrumb {
      font-family: 'DM Mono', monospace; font-size: 12px; color: #3B82F6;
      letter-spacing: 0.08em; text-transform: uppercase;
    }
    .tut-h1 {
      font-size: 58px; font-weight: 700; color: #F1F5F9;
      line-height: 1.05; letter-spacing: -1.5px;
    }
    .tut-h1 em { color: #3B82F6; font-style: normal; }
    .tut-lede {
      font-size: 20px; font-weight: 400; color: #94A3B8;
      line-height: 1.6; max-width: 900px;
    }
    .tut-divider { height: 1px; background: #1E293B; width: 100%; }

    /* ── Feature cards ──────────────────────────────────────── */
    .tut-cards { display: flex; flex-wrap: wrap; gap: 16px; }
    .tut-card {
      background: #141822; border: 1px solid #1E2535;
      border-radius: 10px; padding: 20px 24px;
      min-width: 260px; flex: 1;
    }
    .tut-card-icon { font-size: 28px; margin-bottom: 10px; display: block; }
    .tut-card-title { font-size: 16px; font-weight: 600; color: #E2E8F0; margin-bottom: 6px; }
    .tut-card-body { font-size: 14px; color: #64748B; line-height: 1.5; }

    /* ── Terminal ───────────────────────────────────────────── */
    .tut-terminal {
      background: #060911; border: 1px solid #1E293B;
      border-radius: 10px; overflow: hidden; max-width: 100%;
    }
    .tut-term-header {
      display: flex; align-items: center; gap: 8px;
      background: #0C1018; padding: 12px 20px; border-bottom: 1px solid #1A2230;
    }
    .tut-term-dot { width: 11px; height: 11px; border-radius: 50%; }
    .tut-term-title {
      font-family: 'DM Mono', monospace; font-size: 12px; color: #334155;
      margin-left: 8px; letter-spacing: 0.05em;
    }
    .tut-term-body { padding: 20px 28px; }
    .tut-cmd {
      display: flex; align-items: flex-start; gap: 10px;
      margin-bottom: 6px; opacity: 0;
    }
    .tut-prompt { font-family: 'DM Mono', monospace; font-size: 16px; color: #3B82F6; flex-shrink: 0; }
    .tut-cmd-text { font-family: 'DM Mono', monospace; font-size: 16px; color: #CBD5E1; }
    .tut-out {
      font-family: 'DM Mono', monospace; font-size: 13px; color: #334155;
      padding-left: 22px; margin-bottom: 8px; opacity: 0; line-height: 1.6;
    }
    .tut-out.ok { color: #22C55E; }
    .tut-out.warn { color: #F59E0B; }

    /* ── Step list ──────────────────────────────────────────── */
    .tut-steps { display: flex; flex-direction: column; gap: 14px; }
    .tut-step {
      display: flex; align-items: flex-start; gap: 18px;
      opacity: 0; transform: translateY(12px);
    }
    .tut-step-num {
      width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
      background: #1E293B; border: 1px solid #334155;
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: #3B82F6;
    }
    .tut-step-text { font-size: 18px; color: #CBD5E1; line-height: 1.5; padding-top: 4px; }
    .tut-step-text code {
      font-family: 'DM Mono', monospace; font-size: 15px;
      background: #1E293B; border-radius: 4px; padding: 2px 7px; color: #93C5FD;
    }

    /* ── Env table ──────────────────────────────────────────── */
    .tut-table { width: 100%; border-collapse: collapse; }
    .tut-th {
      font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px;
      text-transform: uppercase; color: #475569; padding: 10px 16px;
      text-align: left; border-bottom: 1px solid #1E293B;
    }
    .tut-td { padding: 12px 16px; border-bottom: 1px solid #0F1117; vertical-align: middle; }
    .tut-key { font-family: 'DM Mono', monospace; font-size: 15px; color: #93C5FD; }
    .tut-desc { font-size: 15px; color: #64748B; }
    .tut-req { font-family: 'DM Mono', monospace; font-size: 12px; }
    .tut-req.req { color: #F87171; }
    .tut-req.opt { color: #475569; }
    .tut-tr { opacity: 0; transform: translateX(-10px); }

    /* ── File tree ──────────────────────────────────────────── */
    .tut-filetree { display: flex; flex-direction: column; gap: 6px; }
    .tut-file {
      display: flex; align-items: center; gap: 14px;
      padding: 10px 16px; border-radius: 8px;
      opacity: 0; transform: translateX(-12px);
    }
    .tut-file.hl { background: #141822; border: 1px solid #1E293B; }
    .tut-file-path { font-family: 'DM Mono', monospace; font-size: 15px; color: #94A3B8; }
    .tut-file-desc { font-size: 14px; color: #475569; margin-left: 8px; }
    .tut-file-badge {
      margin-left: auto; font-size: 11px; font-weight: 600;
      background: #1E3A5F; color: #60A5FA;
      border-radius: 4px; padding: 2px 8px; white-space: nowrap;
    }

    /* ── Progress bar ───────────────────────────────────────── */
    .tut-progress-track {
      height: 3px; background: #1E293B; border-radius: 2px;
      position: absolute; bottom: 0; left: 0; width: 100%;
    }
    .tut-progress-fill {
      height: 100%; background: #3B82F6; border-radius: 2px;
      width: 0%; transition: width 0.3s ease;
    }

    /* ── Call-out box ───────────────────────────────────────── */
    .tut-callout {
      background: #0D1F38; border-left: 3px solid #3B82F6;
      border-radius: 0 8px 8px 0; padding: 16px 20px;
      font-size: 16px; color: #93C5FD; line-height: 1.6;
    }
    .tut-callout.success { background: #052E16; border-color: #22C55E; color: #86EFAC; }
    .tut-callout.warn { background: #1C1003; border-color: #F59E0B; color: #FCD34D; }

    /* ── Architecture diagram ───────────────────────────────── */
    .arch-diagram {
      display: flex; align-items: stretch; gap: 0; flex: 1; margin-top: 8px;
    }
    .arch-col {
      display: flex; flex-direction: column; gap: 10px;
      flex: 1;
    }
    .arch-col-label {
      font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px;
      text-transform: uppercase; margin-bottom: 6px;
    }
    .arch-col-label.input  { color: #22C55E; }
    .arch-col-label.proc   { color: #3B82F6; }
    .arch-col-label.output { color: #A78BFA; }
    .arch-box {
      background: #141822; border: 1px solid #1E2535;
      border-radius: 8px; padding: 14px 18px;
      opacity: 0; transform: translateY(14px);
    }
    .arch-box.input-box  { border-left: 2px solid #22C55E; }
    .arch-box.proc-box   { border-left: 2px solid #3B82F6; }
    .arch-box.output-box { border-left: 2px solid #A78BFA; }
    .arch-box-title { font-size: 14px; font-weight: 600; color: #E2E8F0; margin-bottom: 4px; }
    .arch-box-sub   { font-size: 13px; color: #475569; font-family: 'DM Mono', monospace; }
    .arch-arrows {
      display: flex; flex-direction: column; justify-content: center;
      align-items: center; padding: 32px 12px; gap: 4px;
    }
    .arch-arrow-line { width: 40px; height: 2px; background: #1E293B; }
    .arch-arrow-head { font-size: 16px; color: #334155; }
    .arch-center-col {
      flex: 1.4; display: flex; flex-direction: column; gap: 0;
    }
    .arch-center-label {
      font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px;
      color: #3B82F6; text-transform: uppercase; margin-bottom: 6px;
    }
    .arch-center-box {
      flex: 1; background: #0D1525; border: 1px solid #1E3A5F;
      border-radius: 10px; padding: 20px 22px;
      display: flex; flex-direction: column; gap: 10px;
      opacity: 0;
    }
    .arch-module {
      display: flex; align-items: center; gap: 12px;
      background: #141E30; border: 1px solid #1E3355;
      border-radius: 6px; padding: 10px 14px;
      opacity: 0; transform: translateX(-8px);
    }
    .arch-module-icon { font-size: 16px; flex-shrink: 0; }
    .arch-module-name { font-size: 14px; font-weight: 600; color: #93C5FD; }
    .arch-module-file { font-family: 'DM Mono', monospace; font-size: 11px; color: #334155; margin-left: auto; }
    .arch-flow-note {
      font-size: 13px; color: #334155; font-style: italic; text-align: center; margin-top: auto;
    }

    /* ── Typing cursor ──────────────────────────────────────── */
    .tut-cursor {
      display: inline-block; width: 2px; height: 1em; background: #3B82F6;
      vertical-align: text-bottom; animation: blink 1s step-end infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .tut-char { opacity: 0; display: inline; }

    /* ── Type annotation badge (top right of scene) ─────────── */
    .tut-scene-badge {
      position: absolute; top: 40px; right: 56px;
      font-family: 'DM Mono', monospace; font-size: 12px; color: #1E293B;
      letter-spacing: 0.1em;
    }

    /* ── Hero scene ─────────────────────────────────────────── */
    .hero-scene {
      width: 100%; height: 100%; position: relative;
      display: flex; flex-direction: row;
      background: #0F1117;
    }
    .hero-sidebar {
      width: 6px; background: linear-gradient(180deg, #3B82F6 0%, #6366F1 60%, #A78BFA 100%);
      flex-shrink: 0;
    }
    .hero-main {
      flex: 1; height: 100%; display: flex; flex-direction: column;
      padding: 64px 80px 56px 80px; gap: 0;
      justify-content: center;
    }
    .hero-eyebrow {
      font-family: 'DM Mono', monospace; font-size: 13px; color: #3B82F6;
      letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 28px;
    }
    .hero-headline {
      font-size: 88px; font-weight: 700; color: #F1F5F9;
      line-height: 0.95; letter-spacing: -3px; margin-bottom: 32px;
    }
    .hero-headline span { color: #3B82F6; }
    .hero-tagline {
      font-size: 26px; font-weight: 400; color: #64748B;
      line-height: 1.5; max-width: 760px; margin-bottom: 44px;
    }
    .hero-tagline strong { color: #94A3B8; font-weight: 500; }
    .hero-stats {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 44px;
    }
    .hero-stat {
      background: #141822; border: 1px solid #1E2535; border-radius: 8px;
      padding: 14px 22px; display: flex; flex-direction: column; gap: 4px;
    }
    .hero-stat-val {
      font-family: 'DM Mono', monospace; font-size: 26px; font-weight: 500;
      color: #F1F5F9; line-height: 1;
    }
    .hero-stat-label { font-size: 12px; color: #475569; letter-spacing: 0.05em; }
    .hero-how {
      display: flex; align-items: center; gap: 0; max-width: 680px;
    }
    .hero-how-step {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      flex: 1; text-align: center;
    }
    .hero-how-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: #1E293B; border: 1px solid #334155;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .hero-how-label { font-size: 13px; color: #475569; font-weight: 500; }
    .hero-how-arrow { font-size: 16px; color: #1E293B; padding: 0 8px; flex-shrink: 0; margin-bottom: 28px; }
    .hero-right {
      width: 400px; flex-shrink: 0; height: 100%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 48px 48px 48px 0; gap: 20px;
    }
    .hero-badge {
      background: #0D1525; border: 1px solid #1E3A5F;
      border-radius: 12px; padding: 28px 32px; width: 100%;
    }
    .hero-badge-title {
      font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px;
      color: #3B82F6; text-transform: uppercase; margin-bottom: 16px;
    }
    .hero-badge-step {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 0; border-bottom: 1px solid #0F1A2A;
      font-size: 14px; color: #64748B;
    }
    .hero-badge-step:last-child { border-bottom: none; }
    .hero-badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #1E3A5F; flex-shrink: 0;
    }

    /* ── Bento recap ─────────────────────────────────────────── */
    .bento-scene {
      width: 100%; height: 100%; display: flex; flex-direction: row;
    }
    .bento-main {
      flex: 1; height: 100%; display: flex; flex-direction: column;
      padding: 44px 56px 36px 56px; gap: 20px;
    }
    .bento-header { flex-shrink: 0; }
    .bento-eyebrow {
      font-family: 'DM Mono', monospace; font-size: 12px; color: #3B82F6;
      letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;
    }
    .bento-headline {
      font-size: 42px; font-weight: 700; color: #F1F5F9; line-height: 1.1;
      letter-spacing: -1px;
    }
    .bento-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 14px;
      align-content: start;
    }
    .bento-cell {
      background: #141822; border: 1px solid #1E2535;
      border-radius: 12px; padding: 22px 26px;
      display: flex; flex-direction: column; gap: 10px;
      overflow: hidden;
      opacity: 0; transform: scale(0.96);
    }
    .bento-cell.span-row { grid-row: span 2; }
    .bento-cell.accent { background: #0D1F38; border-color: #1E3A5F; }
    .bento-cell.success { background: #052E16; border-color: #14532D; }
    .bento-cell-label {
      font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px;
      text-transform: uppercase; color: #334155;
    }
    .bento-cell-title { font-size: 18px; font-weight: 700; color: #F1F5F9; line-height: 1.2; }
    .bento-cell-body  { font-size: 13px; color: #64748B; line-height: 1.5; }
    .bento-cell-mono  { font-family: 'DM Mono', monospace; font-size: 13px; color: #93C5FD; }
    .bento-pills { display: flex; flex-wrap: wrap; gap: 6px; }
    .bento-pill {
      background: #0F172A; border: 1px solid #1E293B;
      border-radius: 4px; padding: 3px 9px;
      font-family: 'DM Mono', monospace; font-size: 11px; color: #64748B;
    }
    .bento-feat { font-size: 13px; color: #94A3B8; line-height: 1.7; }
    .bento-feat::before { content: "→ "; color: #3B82F6; }
    .bento-cta {
      font-size: 22px; font-weight: 700; color: #22C55E;
      margin-top: auto; line-height: 1.2;
    }
    .bento-cta-sub { font-size: 13px; color: #166534; margin-top: 4px; }
  `,

  accentColor: '#3B82F6',
  bgColor: '#0F1117',
  controlBorder: '1px solid #1E293B',

  scenes(data: RepoData): Array<{ id: string; duration: number; html: string; customJs?: string }> {
    const tech = data.tech.slice(0, 8);
    const envVars = data.prerequisites.envVars;
    const features = data.features.slice(0, 4);

    // Sidebar nav labels (10 steps now)
    const NAV = ['Overview', 'How It Works', 'Features', 'Stack', 'Files', 'Requirements', 'Install', 'Configure', 'Run', 'Recap'];
    function sidebar(active: number): string {
      const items = NAV.map((label, i) => {
        const cls = i < active ? 'done' : i === active ? 'active' : '';
        return `<div class="tut-nav-item ${cls}">${label}</div>`;
      }).join('');
      const pills = tech.map(t => `<span class="tut-tech-pill">${esc(t)}</span>`).join('');
      return `
        <div class="tut-sidebar">
          <div>
            <div class="tut-project-name">${esc(data.name)}</div>
            <div class="tut-project-ver">${data.version ? `v${data.version}` : 'setup guide'}</div>
          </div>
          <nav class="tut-nav">${items}</nav>
          <div class="tut-tech-strip">
            <div class="tut-tech-label">Stack</div>
            ${pills}
          </div>
        </div>`;
    }

    // ── Scene 1: Hero ──────────────────────────────────────────
    const howSteps = [
      { icon: '📂', label: 'Clone' },
      { icon: '⚙️', label: 'Configure' },
      { icon: '▶️', label: 'Run' },
    ];
    const howHtml = howSteps.map((s, i) => `
      <div class="hero-how-step" data-stagger>
        <div class="hero-how-icon">${s.icon}</div>
        <div class="hero-how-label">${s.label}</div>
      </div>
      ${i < howSteps.length - 1 ? '<div class="hero-how-arrow">→</div>' : ''}`).join('');

    const navPreviewSteps = NAV.slice(1, 6).map(n =>
      `<div class="hero-badge-step"><div class="hero-badge-dot"></div>${esc(n)}</div>`).join('');

    const statFeatures = data.features.length;
    const statEnv = data.prerequisites.envVars.length;
    const statFiles = data.keyFiles.length;

    const s1: { id: string; duration: number; html: string; customJs?: string } = {
      id: 'tut-overview', duration: 6,
      html: `
        <div class="hero-scene">
          <div class="hero-sidebar"></div>
          <div class="hero-main">
            <div class="hero-eyebrow" data-entrance="fade">Setup Guide · ${esc(data.tech.slice(0,3).join(' · '))}</div>
            <h1 class="hero-headline" data-entrance="rise">${esc(data.name)}</h1>
            <p class="hero-tagline" data-entrance="fade"><strong>${esc(data.tagline || data.description.slice(0, 100))}</strong></p>
            <div class="hero-stats" data-entrance="fade">
              ${statFeatures > 0 ? `<div class="hero-stat"><div class="hero-stat-val">${statFeatures}</div><div class="hero-stat-label">Features</div></div>` : ''}
              ${statEnv > 0 ? `<div class="hero-stat"><div class="hero-stat-val">${statEnv}</div><div class="hero-stat-label">Env vars</div></div>` : ''}
              <div class="hero-stat"><div class="hero-stat-val">${statFiles}</div><div class="hero-stat-label">Key files</div></div>
              <div class="hero-stat"><div class="hero-stat-val">~5m</div><div class="hero-stat-label">Time to run</div></div>
            </div>
            <div class="hero-how" data-entrance="fade">${howHtml}</div>
          </div>
          <div class="hero-right">
            <div class="hero-badge" data-entrance="scale">
              <div class="hero-badge-title">What you'll cover</div>
              ${navPreviewSteps}
              <div class="hero-badge-step" style="color:#3B82F6;border-bottom:none">+ ${NAV.length - 6} more →</div>
            </div>
          </div>
          <div class="tut-scene-badge">01 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(1/NAV.length*100)}%"></div></div>
        </div>`,
    };

    // ── Scene 2: System Design ─────────────────────────────────
    const sysDesign = inferSystemDesign(data);
    const inputBoxes = sysDesign.inputs.map(inp => `
      <div class="arch-box input-box" data-stagger>
        <div class="arch-box-title">${esc(inp.label)}</div>
        <div class="arch-box-sub">${esc(inp.detail)}</div>
      </div>`).join('');
    const outputBoxes = sysDesign.outputs.map(out => `
      <div class="arch-box output-box" data-stagger>
        <div class="arch-box-title">${esc(out.label)}</div>
        <div class="arch-box-sub">${esc(out.detail)}</div>
      </div>`).join('');
    const moduleBoxes = sysDesign.modules.map(m => `
      <div class="arch-module" data-stagger>
        <span class="arch-module-icon">${m.icon}</span>
        <span class="arch-module-name">${esc(m.name)}</span>
        <span class="arch-module-file">${esc(m.file)}</span>
      </div>`).join('');

    const s2sys: { id: string; duration: number; html: string; customJs?: string } = {
      id: 'tut-architecture', duration: 7,
      html: `
        <div class="tut-scene">
          ${sidebar(1)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">How It Works → Architecture</div>
            <h1 class="tut-h1" data-entrance="rise">System <em>design</em></h1>
            <p class="tut-lede" data-entrance="fade">${esc(sysDesign.summary)}</p>
            <div class="arch-diagram">
              <!-- INPUT -->
              <div class="arch-col">
                <div class="arch-col-label input" data-entrance="fade">Input</div>
                ${inputBoxes}
              </div>
              <!-- Arrow -->
              <div class="arch-arrows">
                <div class="arch-arrow-line" id="arr1" style="opacity:0"></div>
                <div class="arch-arrow-head" id="arr1h" style="opacity:0">→</div>
              </div>
              <!-- CORE -->
              <div class="arch-center-col">
                <div class="arch-center-label" data-entrance="fade">${esc(data.name)} core</div>
                <div class="arch-center-box" id="arch-core">
                  ${moduleBoxes}
                  <div class="arch-flow-note">data flows top → bottom</div>
                </div>
              </div>
              <!-- Arrow -->
              <div class="arch-arrows">
                <div class="arch-arrow-line" id="arr2" style="opacity:0"></div>
                <div class="arch-arrow-head" id="arr2h" style="opacity:0">→</div>
              </div>
              <!-- OUTPUT -->
              <div class="arch-col">
                <div class="arch-col-label output" data-entrance="fade">Output</div>
                ${outputBoxes}
              </div>
            </div>
          </div>
          <div class="tut-scene-badge">02 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(2/NAV.length*100)}%"></div></div>
        </div>`,
      customJs: `
// Scene 2 — architecture diagram reveal
tl.to('#scene-tut-architecture #arch-core',{opacity:1,duration:0.5,ease:'power2.out'},{{START}}+1.2)
  .to('#scene-tut-architecture .arch-module',{opacity:1,x:0,duration:0.4,stagger:0.15,ease:'power2.out'},'<+0.2')
  .to('#scene-tut-architecture #arr1,#scene-tut-architecture #arr1h,#scene-tut-architecture #arr2,#scene-tut-architecture #arr2h',{opacity:1,duration:0.3,stagger:0.08,ease:'none'},'<+0.4');`,
    };

    // ── Scene 3: Features ──────────────────────────────────────
    const featureCards = features.map((f, i) => {
      const icons = ['⚡', '🔧', '🛡️', '📡', '🎯', '🔑'];
      return `<div class="tut-card" data-stagger>
        <span class="tut-card-icon">${icons[i % icons.length]}</span>
        <div class="tut-card-title">Feature ${i + 1}</div>
        <div class="tut-card-body">${esc(f)}</div>
      </div>`;
    }).join('');

    const s2: { id: string; duration: number; html: string } = {
      id: 'tut-features', duration: 5,
      html: `
        <div class="tut-scene">
          ${sidebar(2)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">Overview → Features</div>
            <h1 class="tut-h1" data-entrance="rise">What it <em>does</em></h1>
            <div class="tut-cards">${featureCards}</div>
          </div>
          <div class="tut-scene-badge">03 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(3/NAV.length*100)}%"></div></div>
        </div>`,
    };

    // ── Scene 4: Stack ─────────────────────────────────────────
    const stackCards = tech.map(t => {
      const icons: Record<string, string> = {
        'Node.js': '🟢', TypeScript: '🔷', JavaScript: '🟡', Python: '🐍',
        Go: '🔵', Rust: '🦀', React: '⚛️', Docker: '🐋', Express: '🚂',
        PostgreSQL: '🐘', Redis: '🔴', MongoDB: '🍃',
      };
      const icon = icons[t] || '📦';
      return `<div class="tut-card" data-stagger style="max-width:220px;flex:0 1 220px">
        <span class="tut-card-icon">${icon}</span>
        <div class="tut-card-title">${esc(t)}</div>
      </div>`;
    }).join('');

    const s3: { id: string; duration: number; html: string } = {
      id: 'tut-stack', duration: 5,
      html: `
        <div class="tut-scene">
          ${sidebar(3)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">Overview → Stack</div>
            <h1 class="tut-h1" data-entrance="rise">Built with</h1>
            <p class="tut-lede" data-entrance="fade">Everything you need is already installed when you follow this guide.</p>
            <div class="tut-cards">${stackCards}</div>
          </div>
          <div class="tut-scene-badge">04 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(4/NAV.length*100)}%"></div></div>
        </div>`,
    };

    // ── Scene 5: Files ─────────────────────────────────────────
    const fileItems = data.keyFiles.map(f => `
      <div class="tut-file ${f.isHighlight ? 'hl' : ''}" data-stagger>
        <span style="font-size:18px">${fileIcon(f.path)}</span>
        <span class="tut-file-path">${esc(f.path)}</span>
        <span class="tut-file-desc">${esc(f.description)}</span>
        ${f.isHighlight ? '<span class="tut-file-badge">key file</span>' : ''}
      </div>`).join('');

    const s4: { id: string; duration: number; html: string } = {
      id: 'tut-files', duration: 5,
      html: `
        <div class="tut-scene">
          ${sidebar(4)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">Overview → Project Structure</div>
            <h1 class="tut-h1" data-entrance="rise">Key files</h1>
            <p class="tut-lede" data-entrance="fade">Familiarise yourself with these files — you'll reference them throughout setup.</p>
            <div class="tut-filetree">${fileItems}</div>
          </div>
          <div class="tut-scene-badge">05 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(5/NAV.length*100)}%"></div></div>
        </div>`,
    };

    // ── Scene 6: Requirements ──────────────────────────────────
    const reqSteps: string[] = [];
    if (data.prerequisites.nodeVersion) reqSteps.push(`Node.js ${data.prerequisites.nodeVersion} or later`);
    if (data.prerequisites.tools.includes('Docker')) reqSteps.push('Docker Desktop (for container support)');
    reqSteps.push('Git (to clone the repository)');
    if (envVars.length > 0) reqSteps.push(`${envVars.length} environment variable${envVars.length > 1 ? 's' : ''} (covered in step 8)`);

    const s5: { id: string; duration: number; html: string } = {
      id: 'tut-requirements', duration: 5,
      html: `
        <div class="tut-scene">
          ${sidebar(5)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">Setup → Requirements</div>
            <h1 class="tut-h1" data-entrance="rise">Before you <em>start</em></h1>
            <div class="tut-steps">${stepCards(reqSteps)}</div>
          </div>
          <div class="tut-scene-badge">06 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(6/NAV.length*100)}%"></div></div>
        </div>`,
    };

    // ── Scene 7: Install ───────────────────────────────────────
    const repoName = data.name.toLowerCase().replace(/\s+/g, '-');
    const cloneUrl = data.repoUrl || `https://github.com/your-org/${repoName}`;

    const s6: { id: string; duration: number; html: string; customJs?: string } = {
      id: 'tut-install', duration: 7,
      html: `
        <div class="tut-scene">
          ${sidebar(6)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">Setup → Clone & Install</div>
            <h1 class="tut-h1" data-entrance="rise">Clone &amp; install</h1>
            <div class="tut-terminal">
              <div class="tut-term-header">
                <div class="tut-term-dot" style="background:#FF5F57"></div>
                <div class="tut-term-dot" style="background:#FFBD2E"></div>
                <div class="tut-term-dot" style="background:#28C840"></div>
                <span class="tut-term-title">Terminal</span>
              </div>
              <div class="tut-term-body">
                <div class="tut-cmd" id="t6-c1"><span class="tut-prompt">$</span><span class="tut-cmd-text">git clone ${esc(cloneUrl)}</span></div>
                <div class="tut-out" id="t6-o1">Cloning into '${esc(repoName)}'...</div>
                <div class="tut-out ok" id="t6-o2">✓ Clone complete</div>
                <div class="tut-cmd" id="t6-c2"><span class="tut-prompt">$</span><span class="tut-cmd-text">cd ${esc(repoName)}</span></div>
                <div class="tut-cmd" id="t6-c3"><span class="tut-prompt">$</span><span class="tut-cmd-text">${esc(data.install.installCommand)}</span></div>
                <div class="tut-out" id="t6-o3">Installing dependencies...</div>
                <div class="tut-out ok" id="t6-o4">✓ Dependencies installed</div>
              </div>
            </div>
          </div>
          <div class="tut-scene-badge">07 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(7/NAV.length*100)}%"></div></div>
        </div>`,
      customJs: `
// Scene 7 — install terminal animation
tl.to('#scene-tut-install #t6-c1',{opacity:1,duration:0.3,ease:'none'},{{START}}+0.6)
  .to('#scene-tut-install #t6-o1',{opacity:1,duration:0.3,ease:'none'},'+=0.4')
  .to('#scene-tut-install #t6-o2',{opacity:1,duration:0.3,ease:'none'},'+=0.4')
  .to('#scene-tut-install #t6-c2',{opacity:1,duration:0.3,ease:'none'},'+=0.3')
  .to('#scene-tut-install #t6-c3',{opacity:1,duration:0.3,ease:'none'},'+=0.3')
  .to('#scene-tut-install #t6-o3',{opacity:1,duration:0.3,ease:'none'},'+=0.5')
  .to('#scene-tut-install #t6-o4',{opacity:1,duration:0.3,ease:'none'},'+=0.6');`,
    };

    // ── Scene 8: Configure (env vars) ─────────────────────────
    const hasEnv = envVars.length > 0;
    const s7: { id: string; duration: number; html: string; customJs?: string } = {
      id: 'tut-configure', duration: hasEnv ? 6 : 4,
      html: `
        <div class="tut-scene">
          ${sidebar(7)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">Setup → Configure</div>
            <h1 class="tut-h1" data-entrance="rise">Environment <em>variables</em></h1>
            ${hasEnv ? `
              <p class="tut-lede" data-entrance="fade">Copy <code style="font-family:'DM Mono',monospace;background:#1E293B;border-radius:4px;padding:2px 8px;font-size:17px;color:#93C5FD">.env.example</code> to <code style="font-family:'DM Mono',monospace;background:#1E293B;border-radius:4px;padding:2px 8px;font-size:17px;color:#93C5FD">.env</code> and fill in these values:</p>
              ${envTable(envVars)}
            ` : `
              <div class="tut-callout success" data-entrance="fade">
                ✓ No environment variables required — you can skip this step.
              </div>
            `}
          </div>
          <div class="tut-scene-badge">08 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(8/NAV.length*100)}%"></div></div>
        </div>`,
      customJs: hasEnv ? `
// Scene 8 — env table row stagger
tl.to('#scene-tut-configure .tut-tr',{opacity:1,x:0,duration:0.4,stagger:0.12,ease:'power2.out'},{{START}}+1.2);` : undefined,
    };

    // ── Scene 9: Run ───────────────────────────────────────────
    const runCmd = data.install.setupCommand || data.install.devCommand;
    const s8: { id: string; duration: number; html: string; customJs?: string } = {
      id: 'tut-run', duration: 7,
      html: `
        <div class="tut-scene">
          ${sidebar(8)}
          <div class="tut-main">
            <div class="tut-breadcrumb" data-entrance="fade">Setup → Run</div>
            <h1 class="tut-h1" data-entrance="rise">Start the app</h1>
            <div class="tut-terminal">
              <div class="tut-term-header">
                <div class="tut-term-dot" style="background:#FF5F57"></div>
                <div class="tut-term-dot" style="background:#FFBD2E"></div>
                <div class="tut-term-dot" style="background:#28C840"></div>
                <span class="tut-term-title">Terminal</span>
              </div>
              <div class="tut-term-body">
                <div class="tut-cmd" id="t8-c1"><span class="tut-prompt">$</span><span class="tut-cmd-text">${esc(runCmd)}</span></div>
                <div class="tut-out ok" id="t8-o1">✓ ${esc(data.firstRun.expectedOutput)}</div>
              </div>
            </div>
            <div class="tut-callout success" id="t8-callout" style="opacity:0">
              🎉 <strong>You're up and running!</strong> ${esc(data.name)} is live.
            </div>
          </div>
          <div class="tut-scene-badge">09 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${Math.round(9/NAV.length*100)}%"></div></div>
        </div>`,
      customJs: `
// Scene 9 — run terminal + celebration
tl.to('#scene-tut-run #t8-c1',{opacity:1,duration:0.3,ease:'none'},{{START}}+0.5)
  .to('#scene-tut-run #t8-o1',{opacity:1,duration:0.4,ease:'none'},'+=0.8')
  .to('#scene-tut-run #t8-callout',{opacity:1,y:0,duration:0.6,ease:'power3.out'},'+=0.5');`,
    };

    // ── Scene 10: Bento Recap ──────────────────────────────────
    const bentoFeats = features.slice(0, 3).map(f =>
      `<div class="bento-feat">${esc(f.length > 72 ? f.slice(0, 72) + '…' : f)}</div>`).join('');
    const bentoPills = tech.slice(0, 6).map(t =>
      `<span class="bento-pill">${esc(t)}</span>`).join('');
    const bentoInstall = data.install.installCommand || 'npm install';
    const bentoRun = data.install.setupCommand || data.install.devCommand;

    const s9: { id: string; duration: number; html: string; customJs?: string } = {
      id: 'tut-recap', duration: 7,
      html: `
        <div class="bento-scene">
          ${sidebar(9)}
          <div class="bento-main">
            <div class="bento-header">
              <div class="bento-eyebrow" data-entrance="fade">All done</div>
              <h1 class="bento-headline" data-entrance="rise">You're <em style="color:#22C55E;font-style:normal">set up</em> with ${esc(data.name)}</h1>
            </div>
            <div class="bento-grid">

              <!-- Big: project overview -->
              <div class="bento-cell span-row accent" id="b1" style="opacity:0">
                <div class="bento-cell-label">Project</div>
                <div class="bento-cell-title">${esc(data.name)}</div>
                <div class="bento-cell-body">${esc(data.description.slice(0, 160))}</div>
                <div style="margin-top:12px">
                  ${sysDesign.inputs.slice(0,2).map(i =>
                    `<div style="font-size:13px;color:#475569;padding:4px 0">→ <span style="color:#60A5FA">${esc(i.label)}</span> <span style="color:#1E3A5F">${esc(i.detail)}</span></div>`
                  ).join('')}
                  ${sysDesign.outputs.slice(0,2).map(o =>
                    `<div style="font-size:13px;color:#475569;padding:4px 0">← <span style="color:#A78BFA">${esc(o.label)}</span> <span style="color:#2D1B69">${esc(o.detail)}</span></div>`
                  ).join('')}
                </div>
              </div>

              <!-- Features -->
              <div class="bento-cell" id="b2" style="opacity:0">
                <div class="bento-cell-label">Features</div>
                ${bentoFeats}
              </div>

              <!-- Stack -->
              <div class="bento-cell" id="b3" style="opacity:0">
                <div class="bento-cell-label">Stack</div>
                <div class="bento-pills">${bentoPills}</div>
              </div>

              <!-- Install command -->
              <div class="bento-cell" id="b4" style="opacity:0">
                <div class="bento-cell-label">Install</div>
                <div class="bento-cell-mono">$ ${esc(bentoInstall)}</div>
                <div class="bento-cell-mono" style="color:#475569">$ ${esc(bentoRun)}</div>
              </div>

              <!-- You're ready -->
              <div class="bento-cell success" id="b5" style="opacity:0">
                <div class="bento-cell-label">Status</div>
                <div class="bento-cta">You're ready 🚀</div>
                <div class="bento-cta-sub">${NAV.length - 1} steps · ~5 min setup</div>
              </div>

            </div>
          </div>
          <div class="tut-scene-badge">10 / ${NAV.length}</div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:100%"></div></div>
        </div>`,
      customJs: `
// Scene 10 — bento cells stagger in, fade out at end
tl.to('#scene-tut-recap #b1',{opacity:1,scale:1,duration:0.5,ease:'power2.out'},{{START}}+0.4)
  .to('#scene-tut-recap #b2',{opacity:1,scale:1,duration:0.4,ease:'power2.out'},'<+0.15')
  .to('#scene-tut-recap #b3',{opacity:1,scale:1,duration:0.4,ease:'power2.out'},'<+0.12')
  .to('#scene-tut-recap #b4',{opacity:1,scale:1,duration:0.4,ease:'power2.out'},'<+0.12')
  .to('#scene-tut-recap #b5',{opacity:1,scale:1,duration:0.5,ease:'back.out(1.5)'},'<+0.15')
  .to('#scene-tut-recap .bento-scene',{opacity:0,duration:0.8,ease:'power2.in'},{{START}}+6.0);`,
    };

    return [s1, s2sys, s2, s3, s4, s5, s6, s7, s8, s9];
  },
};

export default tutorialTheme;

// ── Inference helpers ─────────────────────────────────────────────────────────

interface SysDesign {
  summary: string;
  inputs: Array<{ label: string; detail: string }>;
  modules: Array<{ name: string; file: string; icon: string }>;
  outputs: Array<{ label: string; detail: string }>;
}

function inferSystemDesign(data: RepoData): SysDesign {
  const desc = data.description.toLowerCase();
  const tech = data.tech.map(t => t.toLowerCase());
  const features = data.features;

  // Infer inputs
  const inputs: SysDesign['inputs'] = [];
  if (desc.includes('cli') || desc.includes('command')) inputs.push({ label: 'CLI args', detail: 'flags & options' });
  if (desc.includes('api') || tech.includes('express') || tech.includes('fastify')) inputs.push({ label: 'HTTP requests', detail: 'REST / JSON' });
  if (desc.includes('webhook')) inputs.push({ label: 'Webhooks', detail: 'POST events' });
  if (desc.includes('whatsapp') || desc.includes('telegram') || desc.includes('message')) inputs.push({ label: 'Messages', detail: 'chat platform events' });
  if (desc.includes('file') || desc.includes('read') || desc.includes('parse')) inputs.push({ label: 'Files', detail: 'local filesystem' });
  if (inputs.length === 0) inputs.push({ label: 'User input', detail: 'via CLI or config' }, { label: 'Config files', detail: '.env / JSON' });
  if (data.prerequisites.envVars.length > 0) inputs.push({ label: 'Environment', detail: `${data.prerequisites.envVars.length} env vars` });

  // Infer outputs
  const outputs: SysDesign['outputs'] = [];
  if (desc.includes('html') || desc.includes('video') || desc.includes('visual')) outputs.push({ label: 'HTML output', detail: 'browser-ready file' });
  if (desc.includes('api') || desc.includes('response') || desc.includes('json')) outputs.push({ label: 'API responses', detail: 'JSON / HTTP' });
  if (desc.includes('message') || desc.includes('reply') || desc.includes('notify')) outputs.push({ label: 'Messages', detail: 'sent to user' });
  if (desc.includes('log') || desc.includes('report')) outputs.push({ label: 'Logs', detail: 'stdout / file' });
  if (desc.includes('database') || desc.includes('store') || desc.includes('save')) outputs.push({ label: 'Data stored', detail: 'database / file' });
  if (outputs.length === 0) {
    if (features.length > 0) outputs.push({ label: features[0].slice(0, 40), detail: 'primary output' });
    outputs.push({ label: 'Results', detail: 'stdout / return value' });
  }

  // Modules from key files
  const modules = data.keyFiles.slice(0, 4).map(f => ({
    name: f.description || f.path.split('/').pop()?.replace(/\.[^.]+$/, '') || f.path,
    file: f.path,
    icon: fileIcon(f.path),
  }));
  if (modules.length === 0) modules.push({ name: 'Core', file: 'src/index', icon: '⚡' });

  // Summary
  const summary = `${data.name} is a ${tech.slice(0, 2).join(' + ')} application. It takes ${inputs.slice(0, 2).map(i => i.label.toLowerCase()).join(' and ')} and produces ${outputs.slice(0, 2).map(o => o.label.toLowerCase()).join(' and ')}.`;

  return {
    summary,
    inputs: inputs.slice(0, 3),
    modules,
    outputs: outputs.slice(0, 3),
  };
}

function fileIcon(path: string): string {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return '🔷';
  if (path.endsWith('.js') || path.endsWith('.mjs')) return '🟡';
  if (path.endsWith('.py')) return '🐍';
  if (path.endsWith('.go')) return '🔵';
  if (path.endsWith('.rs')) return '🦀';
  if (path.endsWith('.md')) return '📄';
  if (path.endsWith('.json')) return '⚙️';
  if (path.endsWith('.yml') || path.endsWith('.yaml')) return '🔧';
  if (path.includes('.env')) return '🔑';
  if (path.includes('Dockerfile')) return '🐋';
  if (path.endsWith('.sql') || path.endsWith('.prisma')) return '🗄️';
  if (path.endsWith('.sh')) return '📜';
  return '📁';
}
