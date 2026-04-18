import type { RepoData } from '../types.js';

export const minimalTheme = {
  name: 'minimal',
  label: 'Minimal Dark',

  styles: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=IBM+Plex+Mono:wght@300;400&display=swap');
    body { background: #0A0A0A; font-family: 'Inter', sans-serif; }
    .scene-headline { font-family: 'Inter', sans-serif; font-size: 72px; font-weight: 700; color: #F5F5F5; letter-spacing: -3px; line-height: 1; margin-bottom: 16px; }
    .scene-sub { font-size: 20px; font-weight: 300; color: #404040; line-height: 1.6; }
    .rule { width: 48px; height: 2px; background: #3B82F6; margin-bottom: 24px; }
    .prereq-row { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 14px; padding: 14px 20px; background: #111; border-radius: 8px; opacity: 0; transform: translateY(10px); }
    .prereq-title { font-size: 18px; font-weight: 600; color: #F5F5F5; margin-bottom: 3px; }
    .prereq-val { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #404040; }
    .terminal { background: #050505; border: 1px solid #1A1A1A; border-radius: 10px; padding: 28px 32px; margin-top: 16px; }
    .term-bar { display: flex; gap: 8px; margin-bottom: 16px; }
    .term-dot { width: 12px; height: 12px; border-radius: 50%; }
    .term-line { font-family: 'IBM Plex Mono', monospace; font-size: 16px; color: #2A2A2A; line-height: 2; opacity: 0; }
    .term-line .prompt { color: #3B82F6; }
    .term-line .cmd { color: #A0A0A0; }
    .term-line .out { color: #2A2A2A; font-size: 13px; }
    .file-row { display: flex; align-items: center; gap: 14px; padding: 10px 16px; margin-bottom: 4px; border-radius: 6px; opacity: 0; transform: translateX(-12px); }
    .file-row.hl { background: #111; border-left: 2px solid #3B82F6; }
    .file-name { font-family: 'IBM Plex Mono', monospace; font-size: 15px; color: #A0A0A0; }
    .file-desc { font-size: 14px; color: #303030; margin-left: 8px; }
    .feat-item { font-size: 18px; color: #303030; margin-bottom: 10px; padding-left: 20px; position: relative; opacity: 0; }
    .feat-item::before { content: "—"; color: #3B82F6; position: absolute; left: 0; }
    @keyframes breathe { 0%,100%{opacity:0.5;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.8;transform:translate(-50%,-50%) scale(1.06)} }
  `,

  accentColor: '#3B82F6',
  bgColor: '#0A0A0A',
  controlBorder: '#3B82F633',

  scenes(data: RepoData): Array<{ id: string; duration: number; html: string }> {
    const prereqRows = [
      data.prerequisites.nodeVersion && `<div class="prereq-row" data-stagger><div style="font-size:20px">⚙️</div><div><div class="prereq-title">Node.js ${data.prerequisites.nodeVersion}</div></div></div>`,
      ...data.prerequisites.tools.slice(0, 2).map(t => `<div class="prereq-row" data-stagger><div style="font-size:20px">📦</div><div><div class="prereq-title">${t}</div></div></div>`),
      data.prerequisites.envVars.length && `<div class="prereq-row" data-stagger><div style="font-size:20px">🔑</div><div><div class="prereq-title">${data.prerequisites.envVars.length} env var${data.prerequisites.envVars.length > 1 ? 's' : ''}</div><div class="prereq-val">${data.prerequisites.envVars.slice(0, 4).map(v => v.key).join(', ')}</div></div></div>`,
    ].filter(Boolean).join('\n');

    const fileRows = data.keyFiles.slice(0, 5).map(f =>
      `<div class="file-row ${f.isHighlight ? 'hl' : ''}" data-stagger><div style="font-size:16px;flex-shrink:0">${f.isHighlight ? '●' : '○'}</div><div class="file-name">${f.path}</div><div class="file-desc">${f.description}</div></div>`
    ).join('\n');

    const techPills = data.tech.slice(0, 8).map(t =>
      `<span data-stagger style="display:inline-block;background:#111;border:1px solid #1E1E1E;border-radius:6px;padding:8px 16px;font-family:'IBM Plex Mono',monospace;font-size:15px;color:#505050;margin:4px 6px 4px 0">${t}</span>`
    ).join('');

    return [
      // 1 — Intro
      {
        id: 'intro', duration: 5,
        html: `
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,#3B82F60A 0%,transparent 60%);z-index:0"></div>
          <div class="sc" style="justify-content:center">
            <div data-entrance="fade" style="font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:4px;color:#3B82F6;text-transform:uppercase;margin-bottom:20px">Setup Guide</div>
            <div data-entrance="rise" style="font-size:140px;font-weight:700;color:#F5F5F5;letter-spacing:-6px;line-height:0.9;margin-bottom:20px">${data.name}</div>
            <div data-entrance="fade" style="font-size:22px;font-weight:300;color:#383838;max-width:900px;line-height:1.6">${data.tagline}</div>
          </div>`,
      },
      // 2 — About
      {
        id: 'about', duration: 5,
        html: `
          <div class="sc">
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="rise" style="font-size:60px;font-weight:700;color:#F5F5F5;letter-spacing:-2px;margin-bottom:24px">What it does</div>
            <div data-entrance="fade" style="font-size:24px;font-weight:300;color:#404040;max-width:1100px;line-height:1.7">${data.description}</div>
          </div>`,
      },
      // 3 — Features
      {
        id: 'features', duration: 6,
        html: `
          <div class="sc">
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="rise" style="font-size:60px;font-weight:700;color:#F5F5F5;letter-spacing:-2px;margin-bottom:24px">Features</div>
            ${data.features.slice(0, 5).map(f => `<div class="feat-item" data-stagger>${f}</div>`).join('\n')}
          </div>`,
      },
      // 4 — Tech stack
      {
        id: 'tech', duration: 5,
        html: `
          <div class="sc">
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="rise" style="font-size:60px;font-weight:700;color:#F5F5F5;letter-spacing:-2px;margin-bottom:24px">Built with</div>
            <div data-entrance="fade" style="margin-top:4px">${techPills}</div>
          </div>`,
      },
      // 5 — Key files
      {
        id: 'files', duration: 6,
        html: `
          <div class="sc">
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="rise" style="font-size:60px;font-weight:700;color:#F5F5F5;letter-spacing:-2px;margin-bottom:20px">Key files</div>
            ${fileRows}
          </div>`,
      },
      // 6 — Prerequisites
      {
        id: 'prereqs', duration: 5,
        html: `
          <div class="sc">
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="rise" style="font-size:60px;font-weight:700;color:#F5F5F5;letter-spacing:-2px;margin-bottom:24px">Requirements</div>
            ${prereqRows || '<div class="prereq-row" data-stagger><div style="font-size:20px">✓</div><div><div class="prereq-title">No special setup</div></div></div>'}
          </div>`,
      },
      // 7 — Clone & install
      {
        id: 'install', duration: 6,
        html: `
          <div class="sc">
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="rise" style="font-size:60px;font-weight:700;color:#F5F5F5;letter-spacing:-2px;margin-bottom:16px">Clone & install</div>
            <div class="terminal">
              <div class="term-bar"><div class="term-dot" style="background:#FF5F57"></div><div class="term-dot" style="background:#FFBD2E"></div><div class="term-dot" style="background:#28C840"></div></div>
              <div class="term-line" data-stagger><span class="prompt">$ </span><span class="cmd">${data.install.cloneCommand}</span></div>
              <div class="term-line" data-stagger><span class="prompt">$ </span><span class="cmd">cd ${data.name.toLowerCase().replace(/\s+/g, '-')}</span></div>
              <div class="term-line" data-stagger><span class="prompt">$ </span><span class="cmd">${data.install.installCommand}</span></div>
            </div>
          </div>`,
      },
      // 8 — Run it
      {
        id: 'done', duration: 7,
        html: `
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#3B82F60D 0%,transparent 60%);z-index:0"></div>
          <div class="sc" style="justify-content:center">
            <div class="rule" data-entrance="fade"></div>
            <div data-entrance="rise" style="font-size:100px;font-weight:700;color:#F5F5F5;letter-spacing:-5px;margin-bottom:20px">You're in.</div>
            <div data-entrance="scale" style="font-family:'IBM Plex Mono',monospace;font-size:40px;color:#3B82F6;margin-bottom:20px">${data.install.devCommand}</div>
            <div data-entrance="fade" style="font-size:20px;font-weight:300;color:#303030">${data.firstRun.expectedOutput}</div>
          </div>`,
      },
    ];
  },
};
