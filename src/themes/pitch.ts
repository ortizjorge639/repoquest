import { RepoData, SceneTemplate } from '../types.js';

const pitchTheme = {
  name: 'pitch',
  label: 'Pitch Deck',
  styles: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #0A0010; }
    .scene { position: absolute; inset: 0; display: none; }
    .scene.active { display: flex; flex-direction: column; }
    .scene-content {
      display: flex; flex-direction: column; justify-content: center;
      width: 100%; height: 100%; padding: 100px 140px; gap: 28px; box-sizing: border-box;
    }

    /* Pitch purple/yellow palette */
    .overline {
      font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700;
      color: #F5C842; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.9;
    }
    .headline {
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 84px; font-weight: 800;
      color: #fff; line-height: 1.0; letter-spacing: -0.02em;
    }
    .headline em { color: #F5C842; font-style: normal; }
    .subhead {
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 400;
      color: rgba(255,255,255,0.72); line-height: 1.5; max-width: 800px;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(245,200,66,0.12); border: 1px solid rgba(245,200,66,0.35);
      border-radius: 100px; padding: 8px 20px;
      font-family: 'Space Mono', monospace; font-size: 13px; color: #F5C842;
    }
    .stat-row { display: flex; gap: 48px; align-items: flex-start; margin-top: 8px; }
    .stat { display: flex; flex-direction: column; gap: 4px; }
    .stat-num {
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 52px; font-weight: 800;
      color: #fff; line-height: 1; font-variant-numeric: tabular-nums;
    }
    .stat-num em { color: #F5C842; font-style: normal; }
    .stat-label {
      font-family: 'Space Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.5);
      text-transform: uppercase; letter-spacing: 0.15em;
    }
    .feature-list { display: flex; flex-direction: column; gap: 18px; margin-top: 4px; }
    .feature-item { display: flex; align-items: center; gap: 16px; }
    .feature-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #F5C842; flex-shrink: 0;
    }
    .feature-text {
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 600;
      color: rgba(255,255,255,0.88);
    }
    .cmd-block {
      background: rgba(245,200,66,0.08); border: 1px solid rgba(245,200,66,0.2);
      border-radius: 12px; padding: 24px 32px;
      font-family: 'Space Mono', monospace; font-size: 22px; color: #F5C842;
      display: flex; align-items: center; gap: 16px; max-width: 600px;
    }
    .cmd-block .prompt { color: rgba(245,200,66,0.4); }
    .tech-pills { display: flex; gap: 12px; flex-wrap: wrap; }
    .tech-pill {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px; padding: 8px 18px;
      font-family: 'Space Mono', monospace; font-size: 14px; color: rgba(255,255,255,0.7);
    }
    .glow-accent {
      position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
      background: radial-gradient(circle, rgba(245,200,66,0.18), transparent 70%);
    }
    .scene-num {
      position: absolute; top: 36px; right: 56px;
      font-family: 'Space Mono', monospace; font-size: 13px;
      color: rgba(255,255,255,0.18); letter-spacing: 0.1em;
    }
  `,
  accentColor: '#F5C842',
  bgColor: '#0A0010',
  controlBorder: '1px solid rgba(245,200,66,0.3)',

  scenes(data: RepoData): Array<{ id: string; duration: number; html: string }> {
    const features = data.features.slice(0, 5);
    const tech = data.tech.slice(0, 8);
    const installCmd = data.install.installCommand || 'npm install';
    const runCmd = data.install.devCommand || data.install.setupCommand || 'npm start';
    const envCount = data.prerequisites.envVars.length;

    const techPills = tech.map(t =>
      `<span class="tech-pill" data-stagger>${t}</span>`
    ).join('');

    const fileRows = data.keyFiles.slice(0, 5).map(f =>
      `<div class="feature-item" data-stagger><div class="feature-dot"></div><span class="feature-text" style="font-family:'Space Mono',monospace;font-size:18px;color:rgba(255,255,255,0.7)">${f.path}</span><span style="font-size:15px;color:rgba(255,255,255,0.35);margin-left:16px">${f.description}</span></div>`
    ).join('');

    return [
      // 1 — Intro
      {
        id: 'pitch-s1-hook', duration: 5,
        html: `
          <div class="scene-content" id="pitch-s1">
            <div class="glow-accent" style="width:600px;height:600px;top:-100px;left:-100px;"></div>
            <span class="scene-num">01 / 08</span>
            <span class="overline" id="p1-over">Introducing</span>
            <h1 class="headline" id="p1-title">${data.name}<br><em>Setup Guide</em></h1>
            <p class="subhead" id="p1-sub">${data.tagline}</p>
          </div>`,
      },
      // 2 — What it does
      {
        id: 'pitch-s2-about', duration: 5,
        html: `
          <div class="scene-content" id="pitch-s2">
            <span class="scene-num">02 / 08</span>
            <span class="overline" id="p2-over">About</span>
            <h1 class="headline" id="p2-title" style="font-size:64px">${data.name}</h1>
            <p class="subhead" id="p2-sub" style="font-size:24px;max-width:1100px">${data.description}</p>
          </div>`,
      },
      // 3 — Features
      {
        id: 'pitch-s3-features', duration: 6,
        html: `
          <div class="scene-content" id="pitch-s3">
            <span class="scene-num">03 / 08</span>
            <span class="overline" id="p3-over">What It Does</span>
            <h2 class="headline" style="font-size:56px" id="p3-title">Features</h2>
            <div class="feature-list" id="p3-features">
              ${features.map((f, i) => `<div class="feature-item" id="p3-f${i}"><div class="feature-dot"></div><span class="feature-text">${f}</span></div>`).join('')}
            </div>
          </div>`,
      },
      // 4 — Tech stack
      {
        id: 'pitch-s4-tech', duration: 5,
        html: `
          <div class="scene-content" id="pitch-s4">
            <span class="scene-num">04 / 08</span>
            <span class="overline" id="p4-over">The Stack</span>
            <h2 class="headline" style="font-size:56px" id="p4-title">Built with</h2>
            <div class="tech-pills" id="p4-tech" style="margin-top:8px">${techPills}</div>
          </div>`,
      },
      // 5 — Key files
      {
        id: 'pitch-s5-files', duration: 6,
        html: `
          <div class="scene-content" id="pitch-s5">
            <span class="scene-num">05 / 08</span>
            <span class="overline" id="p5-over">Architecture</span>
            <h2 class="headline" style="font-size:56px" id="p5-title">Key files</h2>
            <div class="feature-list" id="p5-files">${fileRows}</div>
          </div>`,
      },
      // 6 — Prerequisites
      {
        id: 'pitch-s6-prereqs', duration: 5,
        html: `
          <div class="scene-content" id="pitch-s6">
            <div class="glow-accent" style="width:500px;height:500px;bottom:-100px;right:-50px;"></div>
            <span class="scene-num">06 / 08</span>
            <span class="overline" id="p6-over">Before You Start</span>
            <h2 class="headline" style="font-size:56px" id="p6-title">Requirements</h2>
            <div class="feature-list" id="p6-req">
              ${data.prerequisites.nodeVersion ? `<div class="feature-item" id="p6-r0"><div class="feature-dot"></div><span class="feature-text">Node.js ${data.prerequisites.nodeVersion}</span></div>` : ''}
              ${envCount > 0 ? `<div class="feature-item" id="p6-r1"><div class="feature-dot"></div><span class="feature-text">${envCount} env var${envCount > 1 ? 's' : ''}: ${data.prerequisites.envVars.slice(0, 3).map(v => v.key).join(', ')}${envCount > 3 ? '…' : ''}</span></div>` : '<div class="feature-item" id="p6-r0"><div class="feature-dot"></div><span class="feature-text">No special setup needed</span></div>'}
            </div>
          </div>`,
      },
      // 7 — Get started
      {
        id: 'pitch-s7-setup', duration: 6,
        html: `
          <div class="scene-content" id="pitch-s7">
            <span class="scene-num">07 / 08</span>
            <span class="overline" id="p7-over">Get Started</span>
            <h2 class="headline" style="font-size:56px" id="p7-title">3 steps</h2>
            <div class="feature-list" id="p7-steps">
              <div class="feature-item" id="p7-s1"><div class="feature-dot"></div><span class="feature-text">git clone …/${data.name.toLowerCase().replace(/\s+/g, '-')}</span></div>
              <div class="feature-item" id="p7-s2"><div class="feature-dot"></div><span class="feature-text">${installCmd}</span></div>
              <div class="feature-item" id="p7-s3"><div class="feature-dot"></div><span class="feature-text">${runCmd}${envCount > 0 ? ` (set ${envCount} env vars)` : ''}</span></div>
            </div>
          </div>`,
      },
      // 8 — CTA
      {
        id: 'pitch-s8-cta', duration: 7,
        html: `
          <div class="scene-content" id="pitch-s8">
            <div class="glow-accent" style="width:700px;height:700px;top:50%;left:50%;transform:translate(-50%,-50%);"></div>
            <span class="scene-num">08 / 08</span>
            <span class="overline" id="p8-over">Open Source</span>
            <h1 class="headline" id="p8-title">Clone. Run.<br><em>Ship faster.</em></h1>
            <div class="badge" id="p8-badge">⭐ Star on GitHub · npx repoquest</div>
          </div>`,
      },
    ];
  },
};

export default pitchTheme;
export { pitchTheme };
