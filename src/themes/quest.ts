import type { RepoData } from '../types.js';

export const questTheme = {
  name: 'quest',
  label: 'Medieval Quest',

  styles: `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=IM+Fell+English:ital@0;1&family=IBM+Plex+Mono:wght@300;400&display=swap');
    body { background: #0C0A06; font-family: 'IM Fell English', serif; }
    .quest-label { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 4px; color: #8B1A1A; text-transform: uppercase; margin-bottom: 20px; }
    .scene-headline { font-family: 'Cinzel', serif; font-size: 64px; font-weight: 700; color: #E8DFC8; letter-spacing: -1px; line-height: 1; margin-bottom: 16px; }
    .scene-sub { font-family: 'IM Fell English', serif; font-style: italic; font-size: 22px; color: #6A5A3E; line-height: 1.6; }
    .rule { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #C8A96E60, #C8A96E80, #C8A96E60, transparent); margin: 20px 0; }
    .vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 40%, #0C0A0688 70%, #0C0A06CC 100%); z-index: 1; pointer-events: none; }
    .bg-glow { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
    .prereq-row { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; opacity: 0; transform: translateX(-20px); }
    .prereq-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
    .prereq-title { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700; color: #E8DFC8; margin-bottom: 4px; }
    .prereq-val { font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #6A5A3E; }
    .terminal { background: #060503; border: 1px solid #2A2010; border-radius: 8px; padding: 28px 32px; margin-top: 16px; }
    .term-bar { display: flex; gap: 8px; margin-bottom: 16px; }
    .term-dot { width: 12px; height: 12px; border-radius: 50%; }
    .term-line { font-family: 'IBM Plex Mono', monospace; font-size: 18px; color: #3A2E1E; line-height: 2; opacity: 0; }
    .term-line .prompt { color: #8B1A1A; }
    .term-line .cmd { color: #C8A96E; }
    .term-line .out { color: #4A3E28; font-size: 14px; }
    .file-row { display: flex; align-items: center; gap: 14px; padding: 10px 16px; margin-bottom: 4px; border-radius: 4px; opacity: 0; transform: translateX(-16px); }
    .file-row.hl { background: #1A1408; border: 1px solid #C8A96E22; }
    .file-icon { font-size: 18px; flex-shrink: 0; }
    .file-name { font-family: 'IBM Plex Mono', monospace; font-size: 16px; color: #C8A96E; }
    .file-desc { font-family: 'IM Fell English', serif; font-style: italic; font-size: 15px; color: #3A2E1E; margin-left: 8px; }
    .feat-item { font-family: 'IM Fell English', serif; font-size: 20px; color: #4A3E28; margin-bottom: 10px; opacity: 0; }
    .feat-item::before { content: "✦ "; color: #8B1A1A; }
    @keyframes breathe { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.9;transform:translate(-50%,-50%) scale(1.08)} }
    @keyframes flicker { 0%,100%{opacity:1} 33%{opacity:0.85} 66%{opacity:0.92} }
  `,

  accentColor: '#C8A96E',
  bgColor: '#0C0A06',
  controlBorder: '#C8A96E44',

  scenes(data: RepoData): Array<{ id: string; duration: number; html: string }> {
    const prereqRows = [
      data.prerequisites.nodeVersion && `<div class="prereq-row" data-stagger><div class="prereq-icon">⚙️</div><div><div class="prereq-title">Node.js ${data.prerequisites.nodeVersion}</div></div></div>`,
      data.prerequisites.tools.includes('Docker') && `<div class="prereq-row" data-stagger><div class="prereq-icon">🐋</div><div><div class="prereq-title">Docker</div></div></div>`,
      data.prerequisites.envVars.length > 0 && `<div class="prereq-row" data-stagger><div class="prereq-icon">🔑</div><div><div class="prereq-title">${data.prerequisites.envVars.length} env var${data.prerequisites.envVars.length > 1 ? 's' : ''} required</div><div class="prereq-val">${data.prerequisites.envVars.slice(0, 4).map(v => v.key).join(', ')}${data.prerequisites.envVars.length > 4 ? ` +${data.prerequisites.envVars.length - 4} more` : ''}</div></div></div>`,
    ].filter(Boolean).join('\n');

    const fileRows = data.keyFiles.slice(0, 5).map(f =>
      `<div class="file-row ${f.isHighlight ? 'hl' : ''}" data-stagger><div class="file-icon">${fileIcon(f.path)}</div><div class="file-name">${f.path}</div><div class="file-desc">${f.description}</div></div>`
    ).join('\n');

    const termLines = [
      `<div class="term-line" data-stagger><span class="prompt">$ </span><span class="cmd">${data.install.cloneCommand}</span></div>`,
      `<div class="term-line" data-stagger><span class="out">Cloning...</span></div>`,
      `<div class="term-line" data-stagger><span class="prompt">$ </span><span class="cmd">cd ${data.name.toLowerCase().replace(/\s+/g, '-')}</span></div>`,
      `<div class="term-line" data-stagger><span class="prompt">$ </span><span class="cmd">${data.install.installCommand}</span></div>`,
    ].join('\n');

    const featureItems = data.features.slice(0, 4).map(f =>
      `<div class="feat-item" data-stagger>${f}</div>`
    ).join('\n');

    const techPills = data.tech.slice(0, 8).map(t =>
      `<span data-stagger style="display:inline-block;background:#1A1408;border:1px solid #C8A96E33;border-radius:6px;padding:8px 18px;font-family:'IBM Plex Mono',monospace;font-size:16px;color:#C8A96E;margin:6px 8px 6px 0">${t}</span>`
    ).join('');

    return [
      // 1 — Intro
      {
        id: 'realm', duration: 5,
        html: `
          <div class="bg-glow" style="width:900px;height:900px;top:50%;left:50%;background:radial-gradient(circle,#D4922A22 0%,transparent 70%);animation:breathe 5s ease-in-out infinite"></div>
          <div class="vignette"></div>
          <div class="sc" style="align-items:center;text-align:center;justify-content:center">
            <div data-entrance="fade" style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:8px;color:#8B1A1A;text-transform:uppercase;margin-bottom:24px">⚔ &nbsp; A Quest Begins &nbsp; ⚔</div>
            <div data-entrance="rise" style="font-family:'Cinzel',serif;font-size:120px;font-weight:900;color:#E8DFC8;letter-spacing:-2px;line-height:1;margin-bottom:16px;text-shadow:0 0 40px #D4922A44">${data.name}</div>
            <div data-entrance="fade" style="font-family:'IM Fell English',serif;font-style:italic;font-size:26px;color:#C8A96E;max-width:900px;line-height:1.5">${data.tagline}</div>
          </div>`,
      },
      // 2 — What it does
      {
        id: 'about', duration: 5,
        html: `
          <div class="bg-glow" style="width:600px;height:600px;bottom:-100px;right:-100px;background:radial-gradient(circle,#8B1A1A18 0%,transparent 70%)"></div>
          <div class="vignette"></div>
          <div class="sc">
            <div class="quest-label" data-entrance="fade">The Legend</div>
            <div class="scene-headline" data-entrance="rise">What Is ${data.name}?</div>
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="fade" style="font-family:'IM Fell English',serif;font-size:24px;color:#6A5A3E;line-height:1.7;max-width:1200px">${data.description}</div>
          </div>`,
      },
      // 3 — Features
      {
        id: 'powers', duration: 6,
        html: `
          <div class="bg-glow" style="width:500px;height:500px;top:-50px;right:200px;background:radial-gradient(circle,#D4922A14 0%,transparent 70%)"></div>
          <div class="vignette"></div>
          <div class="sc">
            <div class="quest-label" data-entrance="fade">The Powers</div>
            <div class="scene-headline" data-entrance="rise">Abilities Unlocked</div>
            <div class="rule" data-entrance="fade"></div>
            ${featureItems}
          </div>`,
      },
      // 4 — Tech stack
      {
        id: 'tech', duration: 5,
        html: `
          <div class="vignette"></div>
          <div class="sc">
            <div class="quest-label" data-entrance="fade">The Forge</div>
            <div class="scene-headline" data-entrance="rise">Built With</div>
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="fade" style="margin-top:8px">${techPills}</div>
          </div>`,
      },
      // 5 — Key files
      {
        id: 'map', duration: 6,
        html: `
          <div class="vignette"></div>
          <div class="sc">
            <div class="quest-label" data-entrance="fade">The Map</div>
            <div class="scene-headline" data-entrance="rise">Key Files</div>
            ${fileRows}
          </div>`,
      },
      // 6 — Prerequisites
      {
        id: 'arsenal', duration: 5,
        html: `
          <div class="bg-glow" style="width:700px;height:700px;top:-100px;right:-100px;background:radial-gradient(circle,#8B1A1A18 0%,transparent 70%)"></div>
          <div class="vignette"></div>
          <div class="sc">
            <div class="quest-label" data-entrance="fade">Before You Begin</div>
            <div class="scene-headline" data-entrance="rise">Requirements</div>
            <div class="rule" data-entrance="fade"></div>
            ${prereqRows || '<div class="prereq-row" data-stagger><div class="prereq-icon">✅</div><div><div class="prereq-title">No special requirements</div></div></div>'}
          </div>`,
      },
      // 7 — Clone + install
      {
        id: 'journey', duration: 7,
        html: `
          <div class="bg-glow" style="width:600px;height:600px;top:50%;right:-100px;background:radial-gradient(circle,#D4922A14 0%,transparent 70%)"></div>
          <div class="vignette"></div>
          <div class="sc">
            <div class="quest-label" data-entrance="fade">Begin the Journey</div>
            <div class="scene-headline" data-entrance="rise">Clone & Install</div>
            <div class="terminal">
              <div class="term-bar">
                <div class="term-dot" style="background:#8B1A1A"></div>
                <div class="term-dot" style="background:#D4922A"></div>
                <div class="term-dot" style="background:#4A7A4A"></div>
              </div>
              ${termLines}
            </div>
          </div>`,
      },
      // 8 — First run / victory
      {
        id: 'victory', duration: 7,
        html: `
          <div class="bg-glow" style="width:1200px;height:1200px;top:50%;left:50%;background:radial-gradient(circle,#D4922A28 0%,transparent 70%);animation:breathe 3s ease-in-out infinite"></div>
          <div class="vignette"></div>
          <div class="sc" style="align-items:center;text-align:center;justify-content:center">
            <div data-entrance="scale" style="font-size:72px;margin-bottom:16px;animation:flicker 3s ease-in-out infinite">👑</div>
            <div data-entrance="rise" style="font-family:'Cinzel',serif;font-size:90px;font-weight:900;color:#E8DFC8;letter-spacing:-2px;line-height:1;margin-bottom:12px">Quest Complete</div>
            <div data-entrance="fade" style="font-family:'IM Fell English',serif;font-style:italic;font-size:26px;color:#C8A96E;margin-bottom:32px">You are ready, adventurer.</div>
            <div class="rule" data-entrance="fade" style="max-width:400px"></div>
            <div data-entrance="fade" style="font-family:'IBM Plex Mono',monospace;font-size:28px;color:#C8A96E;margin-top:20px">${data.install.setupCommand || data.install.devCommand}</div>
          </div>`,
      },
    ];
  },
};

function fileIcon(path: string): string {
  if (path.endsWith('.ts') || path.endsWith('.js')) return '📜';
  if (path.endsWith('.md')) return '📖';
  if (path.endsWith('.json')) return '⚙️';
  if (path.endsWith('.yml') || path.endsWith('.yaml')) return '🔧';
  if (path.endsWith('.env') || path.includes('.env')) return '🔑';
  if (path.includes('Dockerfile')) return '🐋';
  if (path.endsWith('.sql') || path.endsWith('.prisma')) return '🗄️';
  if (path.endsWith('.py')) return '🐍';
  if (path.endsWith('.go')) return '🔵';
  if (path.endsWith('.rs')) return '🦀';
  return '📁';
}
