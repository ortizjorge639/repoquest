import type { RepoData, Theme, GeneratorOptions } from './types.js';
import { questTheme } from './themes/quest.js';
import { minimalTheme } from './themes/minimal.js';
import { pitchTheme } from './themes/pitch.js';
import { tutorialTheme } from './themes/tutorial.js';

const THEMES: Record<string, typeof questTheme> = { quest: questTheme, minimal: minimalTheme, pitch: pitchTheme, tutorial: tutorialTheme };

// Build transition JS between two scenes
function buildTransition(
  fromId: string, toId: string,
  type: 'blur' | 'directional' | 'focus',
  startTime: number
): string {
  const T = startTime;
  switch (type) {
    case 'blur':
      return `
tl.to('#${fromId}',{filter:'blur(18px)',scale:1.03,opacity:0,duration:0.5,ease:'power2.inOut'},${T})
  .fromTo('#${toId}',{opacity:0,filter:'blur(18px)',scale:0.97},{opacity:1,filter:'blur(0px)',scale:1,duration:0.5,ease:'power2.out'},${T}+0.1);`;
    case 'directional':
      return `
tl.to('#${fromId}',{filter:'blur(14px)',x:-180,opacity:0,duration:0.4,ease:'power3.in'},${T})
  .fromTo('#${toId}',{opacity:0,filter:'blur(14px)',x:180},{opacity:1,filter:'blur(0px)',x:0,duration:0.4,ease:'power3.out'},${T}+0.05);`;
    case 'focus':
    default:
      return `
tl.to('#${fromId}',{filter:'blur(22px)',opacity:0,duration:0.55,ease:'power1.in'},${T})
  .fromTo('#${toId}',{opacity:0},{opacity:1,duration:0.4,ease:'power2.out'},${T}+0.45);`;
  }
}

const TRANSITION_SEQUENCE: Array<'blur' | 'directional' | 'focus'> = [
  'blur', 'directional', 'focus', 'directional', 'blur',
];

// Build entrance animations for a scene's elements
function buildEntrances(sceneId: string, startTime: number): string {
  return `
// ${sceneId} entrances
tl.to('#${sceneId} [data-entrance="fade"]',{opacity:1,duration:0.5,stagger:0.15,ease:'power2.out'},${startTime}+0.3)
  .to('#${sceneId} [data-entrance="rise"]',{opacity:1,y:0,duration:0.7,stagger:0.1,ease:'power3.out'},${startTime}+0.4)
  .to('#${sceneId} [data-entrance="scale"]',{opacity:1,scale:1,duration:0.6,ease:'back.out(1.4)'},${startTime}+0.7)
  .to('#${sceneId} [data-stagger]',{opacity:1,x:0,y:0,stagger:0.18,duration:0.4,ease:'power2.out'},${startTime}+0.6);`;
}

export function generate(data: RepoData, options: GeneratorOptions): string {
  const theme = THEMES[options.theme] || THEMES.quest;
  const scenes = theme.scenes(data);

  // Calculate cumulative start times
  const sceneTimes: number[] = [];
  let cursor = 0;
  for (const scene of scenes) {
    sceneTimes.push(cursor);
    cursor += scene.duration;
  }
  const totalDuration = cursor;

  // Build scene HTML
  const sceneHtml = scenes.map((scene: { id: string; duration: number; html: string; customJs?: string }, i: number) => {
    return `  <!-- Scene ${i + 1}: ${scene.id} -->
  <div id="scene-${scene.id}" class="scene" style="z-index:${i + 1};${i > 0 ? 'opacity:0' : ''}">
    ${scene.html}
  </div>`;
  }).join('\n\n');

  // Build timeline JS
  const timelineJs = scenes.map((scene: { id: string; duration: number; html: string; customJs?: string }, i: number) => {
    const sceneStart = i === 0 ? 0 : sceneTimes[i] + 0.5;
    const entrances = buildEntrances(`scene-${scene.id}`, sceneStart);
    const custom = scene.customJs
      ? `\n${scene.customJs.replace(/\{\{START\}\}/g, String(sceneStart))}`
      : '';

    if (i === scenes.length - 1) {
      const fadeStart = sceneTimes[i] + scene.duration - 1.5;
      return `${entrances}${custom}
// Final scene fade
tl.to('#scene-${scene.id}',{opacity:0,duration:1.2,ease:'power1.in'},${fadeStart});`;
    }

    const transitionType = TRANSITION_SEQUENCE[i % TRANSITION_SEQUENCE.length];
    const transitionStart = sceneTimes[i] + scene.duration - 0.5;
    const transition = buildTransition(
      `scene-${scene.id}`,
      `scene-${scenes[i + 1].id}`,
      transitionType,
      transitionStart
    );

    return `${entrances}${custom}\n${transition}`;
  }).join('\n');

  // Build GSAP initial states (items that need opacity:0 + transform set)
  // Collect custom init JS from themes (e.g. char splitting for typing animations)
  const customInits = scenes
    .map((s: { id: string; duration: number; html: string; customJs?: string; initJs?: string }) => s.initJs || '')
    .filter(Boolean).join('\n');

  const gsapInits = `
gsap.set('[data-entrance="fade"]',{opacity:0});
gsap.set('[data-entrance="rise"]',{opacity:0,y:30});
gsap.set('[data-entrance="scale"]',{opacity:0,scale:0.9});
gsap.set('[data-stagger]',{opacity:0,x:-16,y:10});
${customInits}`;

  // Standalone player controls CSS
  const playerCss = `
#rq-controls{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;background:${theme.bgColor}EE;border:${theme.controlBorder};border-radius:40px;padding:10px 24px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#E8E8E8;z-index:9999;backdrop-filter:blur(12px)}
#rq-controls button{background:none;border:none;color:${theme.accentColor};cursor:pointer;font-size:18px;padding:2px 6px}
#rq-progress{width:200px;height:2px;background:#1A1A1A;border-radius:1px;cursor:pointer}
#rq-fill{height:100%;background:${theme.accentColor};border-radius:1px;width:0%;transition:width .1s linear}
#rq-time{color:#888;min-width:44px;text-align:right;font-variant-numeric:tabular-nums}
#rq-theme-label{font-size:10px;letter-spacing:2px;color:#555;text-transform:uppercase}`;

  const playerHtml = `<div id="rq-controls">
  <span id="rq-theme-label">${theme.label}</span>
  <button id="rq-btn-play">▶</button>
  <div id="rq-progress"><div id="rq-fill"></div></div>
  <span id="rq-time">0:00</span>
  <button id="rq-btn-restart">↺</button>
</div>`;

  const playerJs = `
if (!window.__hyperframes) {
  const D = ${totalDuration};
  let playing = false;
  const fmt = s => \`\${Math.floor(s/60)}:\${String(Math.floor(s%60)).padStart(2,'0')}\`;
  function tick() {
    const t = tl.time();
    document.getElementById('rq-fill').style.width = (t/D*100)+'%';
    document.getElementById('rq-time').textContent = fmt(t);
    if (t < D && playing) requestAnimationFrame(tick);
    else if (t >= D) { playing = false; document.getElementById('rq-btn-play').textContent = '▶'; }
  }
  document.getElementById('rq-btn-play').onclick = () => {
    playing = !playing;
    document.getElementById('rq-btn-play').textContent = playing ? '⏸' : '▶';
    if (playing) { tl.play(); tick(); } else tl.pause();
  };
  document.getElementById('rq-btn-restart').onclick = () => {
    tl.seek(0); playing = false;
    document.getElementById('rq-btn-play').textContent = '▶';
    document.getElementById('rq-fill').style.width = '0%';
    document.getElementById('rq-time').textContent = '0:00';
    ${gsapInits}
  };
  document.getElementById('rq-progress').onclick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    tl.seek((e.clientX - r.left) / r.width * D);
    if (!playing) tick();
  };
  document.fonts.ready.then(() => setTimeout(() => {
    playing = true;
    document.getElementById('rq-btn-play').textContent = '⏸';
    tl.play(); tick();
  }, 500));
}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<!-- Generated by RepoQuest v0.1.0 — https://github.com/qwibitai/repoquest -->
<!-- Project: ${data.name} | Theme: ${theme.label} | Generated: ${new Date().toISOString()} -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
${theme.styles}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; }
.scene { position: absolute; top: 0; left: 0; width: 1920px; height: 1080px; overflow: hidden; }
.sc { display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; padding: 120px 160px; box-sizing: border-box; position: relative; z-index: 2; }

${playerCss}
</style>
</head>
<body>

<div id="root"
  data-composition-id="main"
  data-width="1920"
  data-height="1080"
  data-start="0"
  data-duration="${totalDuration}">

${sceneHtml}

</div>

${playerHtml}

<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });

${gsapInits}

${timelineJs}

window.__timelines['main'] = tl;

${playerJs}
</script>
</body>
</html>`;
}
