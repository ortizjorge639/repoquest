---
name: repoquest
description: Generate a cinematic, self-contained HTML setup guide for any GitHub repository. Use when asked to create a walkthrough video, setup guide, onboarding tutorial, or visual README for a repo. Produces a single HTML file (~60s, 10 scenes) that replaces written setup docs with a watchable, animated tutorial.
---

# RepoQuest

Turn any GitHub repository into a cinematic HTML setup guide — in one command.

## When to Use

Invoke this skill when the user asks to:
- "Generate a setup guide / walkthrough for this repo"
- "Make a tutorial video for this project"
- "Create an onboarding guide"
- "Turn the README into something visual"
- "Run repoquest on this"

## Installation

RepoQuest must be built before first use. From the repo root:

```bash
git clone https://github.com/ortizjorge639/repoquest /tmp/repoquest
cd /tmp/repoquest
npm install
npm run build
```

After building, the CLI is at `dist/cli.js`. You can run it with Node directly — no global install needed.

## Usage

```bash
# Basic — run against current working repo
node /tmp/repoquest/dist/cli.js --dir . --theme tutorial --output setup.html

# Specify a different repo directory
node /tmp/repoquest/dist/cli.js --dir /path/to/repo --theme tutorial

# Open in browser after generating
node /tmp/repoquest/dist/cli.js --dir . --theme tutorial --open

# Custom output path
node /tmp/repoquest/dist/cli.js --dir . --theme tutorial --output docs/setup.html
```

## Theme Selection

| Theme | Use when |
|-------|----------|
| `tutorial` | Default — any project, production-grade, WCAG AA |
| `pitch` | User wants a startup/launch-style deck |
| `minimal` | User wants clean, no-frills dark output |
| `quest` | Fun medieval RPG style — developer tools, CLIs |

Always default to `tutorial` unless the user specifies otherwise.

## What It Parses

RepoQuest reads these files from the target directory (all optional):

- `README.md` — project name, description, features, prerequisites
- `package.json` — name, version, scripts, dependencies, engines
- `.env.example` — required environment variables
- File tree (2 levels deep) — key source files to highlight

It degrades gracefully — even a repo with only a README.md produces a valid output.

## Output

A single self-contained HTML file (typically 50–60KB). No external dependencies at runtime. Open in any browser — it auto-plays the 10-scene setup guide (~60 seconds).

**Scenes:**
1. Hero — project name, tagline, stats, how it works at a glance
2. System Design — auto-inferred input → modules → output architecture
3. Features — key capabilities as cards
4. Stack — tech used (languages, frameworks, tools)
5. Key Files — file tree with entry points highlighted
6. Requirements — prerequisites checklist
7. Install — animated terminal showing install commands
8. Configure — env var table (Variable / Description / Required)
9. Run — animated terminal showing start command + success callout
10. Recap — bento-box overview of everything covered

## What to Do with the Output

After generating:

1. **Serve it** — if there's a local dev server, copy to its static directory
2. **Commit it** — `git add setup.html && git commit -m "Add RepoQuest setup guide"`
3. **Link it** — add to README: `[▶ Watch Setup Guide](./setup.html)`
4. **Tell the user** — share the file path or URL

## Example Agent Workflow

```
User: "Generate a setup guide for this repo"

1. Run: node /tmp/repoquest/dist/cli.js --dir . --theme tutorial --output setup.html
2. If successful: tell user the file is at ./setup.html
3. Optionally commit: git add setup.html && git commit -m "Add RepoQuest setup guide"
4. Optionally add README link
```

## Troubleshooting

**"Cannot find module"** — run `npm run build` in the repoquest directory first.

**Empty output / missing data** — the repo has no `README.md` or `package.json`. RepoQuest still generates but with minimal content. Suggest adding a README.

**Output too generic** — the README doesn't follow conventions. Most accurate output comes from repos with:
- A `## Features` section
- A `## Prerequisites` or `## Requirements` section  
- A `.env.example` file
- Named npm scripts (`dev`, `start`, `build`)

## Architecture (for contributors)

```
src/
  cli.ts        — entry point, arg parsing
  parser.ts     — reads repo → RepoData (pure, testable)
  generator.ts  — RepoData + theme → HTML (pure, testable)
  types.ts      — shared TypeScript interfaces
  themes/
    tutorial.ts — flagship theme (10 scenes, WCAG AA, sidebar nav)
    quest.ts    — medieval RPG theme
    minimal.ts  — clean dark theme
    pitch.ts    — startup pitch theme
```

**Adding a theme:** Create `src/themes/mytheme.ts` exporting `{ name, label, styles, accentColor, bgColor, controlBorder, scenes(data: RepoData) }`. Register it in `src/generator.ts` THEMES record and add to `validThemes` in `src/cli.ts`. No other changes needed.

**Pipeline:** `parseRepo(dir) → RepoData → generate(data, options) → HTML string` — each stage is independently testable.

## License

MIT © Jorge Ortiz. Uses [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache 2.0) for the HTML composition format.
