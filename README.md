# ⚔ RepoQuest

> **Turn any GitHub repo into a cinematic setup guide — in one command.**

Clone a repo. Run `npx repoquest`. Get a self-contained HTML tutorial that walks you through setup in under 60 seconds — production-grade, WCAG-compliant, and ready to replace your walkthrough videos.

No more stale READMEs. No more walls of text. Just play and follow along.

---

## Quick Start

```bash
# Run against any local repo
npx repoquest --dir ./my-project

# Pick a theme
npx repoquest --dir ./my-project --theme tutorial

# Open immediately after generating
npx repoquest --dir ./my-project --open
```

Output: a single `repoquest.html` file. Open it in any browser.

---

## How It Works

RepoQuest reads your repository files and generates a fully animated HTML walkthrough:

1. **Parses** `README.md`, `package.json`, `.env.example`, and your file tree
2. **Extracts** project name, description, prerequisites, install steps, features, and tech stack
3. **Infers** system design — inputs, core modules, and outputs — automatically from your code structure
4. **Generates** a 10-scene animated HTML tutorial with GSAP transitions and a sidebar progress nav
5. **Outputs** a self-contained file — no server, no build step, no dependencies

---

## Themes

| Theme | Description | Best For |
|-------|-------------|----------|
| `tutorial` | Tutorial-grade, WCAG AA, sidebar nav, 10 scenes | Any project — the flagship |
| `quest` | Medieval RPG aesthetic — Cinzel font, parchment tones | Developer tools, CLIs |
| `minimal` | Clean dark, Inter font, cool grays | Any project |
| `pitch` | Startup deck vibes — Plus Jakarta Sans, purple/yellow | SaaS, OSS launches |

```bash
npx repoquest --dir . --theme tutorial  # 📘 Tutorial (recommended)
npx repoquest --dir . --theme quest     # ⚔ Medieval quest
npx repoquest --dir . --theme minimal   # 🖤 Clean dark
npx repoquest --dir . --theme pitch     # 🟡 Pitch deck
```

---

## The Tutorial Theme

The `tutorial` theme is the flagship — designed to replace walkthrough videos.

**10 scenes (~60s total):**

| # | Scene | What it shows |
|---|-------|---------------|
| 1 | **Hero** | Project name, tagline, stat pills, Clone→Configure→Run flow, "What you'll cover" preview |
| 2 | **System Design** | Auto-inferred input→core modules→output architecture diagram |
| 3 | **Features** | Feature cards with icons |
| 4 | **Stack** | Tech cards — languages, frameworks, tools |
| 5 | **Key Files** | File tree with highlighted entry points |
| 6 | **Requirements** | Prerequisites checklist |
| 7 | **Install** | Animated terminal showing install commands |
| 8 | **Configure** | Env var table (Variable / Description / Required) |
| 9 | **Run** | Animated terminal showing start command + success callout |
| 10 | **Recap** | Bento-box overview of everything covered |

**Design:**
- WCAG AA contrast throughout (`#0F1117` bg, `#F1F5F9` headlines, `#3B82F6` accent)
- Left sidebar with step-by-step progress nav
- Bottom progress bar
- DM Sans + DM Mono typography

---

## Options

```
Usage:
  npx repoquest [options]

Options:
  --dir <path>      Repository directory to parse (default: current directory)
  --theme <name>    Visual theme: tutorial | quest | minimal | pitch (default: quest)
  --output <file>   Output HTML filename (default: repoquest.html)
  --open            Open in browser after generating
  --version         Print version
  --help            Show this help
```

---

## What Gets Parsed

RepoQuest reads these files (all optional — it degrades gracefully):

| File | What it extracts |
|------|-----------------|
| `package.json` | Name, description, scripts, engines, dependencies |
| `README.md` | Tagline, features list, prerequisites section |
| `.env.example` | Required environment variables |
| File tree | Key source files (scored by importance) |

---

## Architecture

RepoQuest is a clean 3-stage pipeline:

```
parseRepo(dir) → RepoData → generate(data, options) → HTML string
```

Each stage is independently testable:

```
src/
  parser.ts      — reads repo files, outputs RepoData
  generator.ts   — takes RepoData + theme, outputs HTML
  types.ts       — shared interfaces
  themes/
    tutorial.ts  — tutorial theme (flagship — WCAG, sidebar nav, system design)
    quest.ts     — medieval quest theme
    minimal.ts   — clean dark theme
    pitch.ts     — startup pitch theme
  cli.ts         — npx entry point
```

**Adding a new theme** = one new file in `src/themes/` that exports:
- `styles` — CSS string
- `accentColor`, `bgColor`, `controlBorder` — player control styling
- `scenes(data: RepoData)` — returns `Array<{ id, duration, html, customJs?, initJs? }>`

No changes needed elsewhere.

**`customJs` system:** Each scene can include a `customJs` string with GSAP tweens. The generator replaces `{{START}}` with the scene's actual start time in seconds, enabling precise timeline positioning without knowing the full composition duration at scene-creation time.

---

## Development

```bash
# Clone and install
git clone https://github.com/qwibitai/repoquest
cd repoquest
npm install

# Build
npm run build

# Run tests (18 tests, Node.js native runner)
npm test

# Run against yourself
node dist/cli.js --dir . --theme tutorial --open
```

---

## Philosophy

> "Takes less than an Instagram reel to learn how to get started."

Setup guides should be *watched*, not read. RepoQuest generates a self-paced animated walkthrough that plays automatically — no slides, no separate video tool, just HTML and GSAP.

The output is a single file you can:
- Commit to your repo as `SETUP.html`
- Host on GitHub Pages
- Drop in your README as a link
- Use in your CI to auto-generate on every release

---

## License

MIT — built to be open-sourced and forked freely.

---

*Built with ⚔ and [HyperFrames](https://github.com/heygen-com/hyperframes) by [@qwibitai](https://x.com/qwibitai)*

---

## Attribution

RepoQuest generates HTML compositions using the [HyperFrames](https://github.com/heygen-com/hyperframes) format — an open-source video rendering framework by [HeyGen](https://heygen.com), licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0). See [NOTICE](./NOTICE) for details.
