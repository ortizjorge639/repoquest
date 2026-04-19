#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { resolve, join, isAbsolute } from 'path';
import { execSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { parseRepo } from './parser.js';
import { generate } from './generator.js';
import type { Theme } from './types.js';

function isGitHubUrl(arg: string): boolean {
  return /^https?:\/\/github\.com\//.test(arg) || /^github\.com\//.test(arg);
}

function cloneRepo(url: string): { dir: string; cleanup: () => void } {
  const cloneUrl = url.startsWith('http') ? url : `https://${url}`;
  const dir = mkdtempSync(join(tmpdir(), 'repoquest-'));
  console.log(`📥 Cloning ${cloneUrl}...`);
  execSync(`git clone --depth 1 ${cloneUrl} ${dir}`, { stdio: 'pipe' });
  return {
    dir,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

const VERSION = '0.1.0';

const HELP = `
repoquest v${VERSION}
Turn any GitHub repo into a cinematic setup guide.

Usage:
  npx repoquest [github-url] [options]
  npx repoquest [options]

Options:
  --dir <path>        Target repo directory (default: current directory)
  --theme <name>      Visual theme: quest (default) | minimal | pitch | tutorial
  --output <file>     Output filename (default: repoquest.html)
  --open              Open in browser after generation
  --version           Show version
  --help              Show this help

Examples:
  npx repoquest https://github.com/vercel/next.js
  npx repoquest https://github.com/vercel/next.js --theme tutorial
  npx repoquest --theme minimal --output guide.html
  npx repoquest --dir ~/projects/my-app --open
`;

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { args.help = true; }
    else if (arg === '--version' || arg === '-v') { args.version = true; }
    else if (arg === '--open') { args.open = true; }
    else if (arg.startsWith('--') && i + 1 < argv.length && !argv[i+1].startsWith('--')) {
      args[arg.slice(2)] = argv[++i];
    } else if (!arg.startsWith('--') && (isGitHubUrl(arg))) {
      args.url = arg;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) { console.log(HELP); process.exit(0); }
  if (args.version) { console.log(`repoquest v${VERSION}`); process.exit(0); }

  const theme = ((args.theme as string) || 'quest') as Theme;
  const outputFile = (args.output as string) || 'repoquest.html';

  const validThemes: Theme[] = ['quest', 'minimal', 'pitch', 'tutorial'];
  if (!validThemes.includes(theme)) {
    console.error(`❌ Unknown theme "${theme}". Available: ${validThemes.join(', ')}`);
    process.exit(1);
  }

  let repoDir: string;
  let cleanup: (() => void) | null = null;

  if (args.url) {
    const cloned = cloneRepo(args.url as string);
    repoDir = cloned.dir;
    cleanup = cloned.cleanup;
  } else {
    repoDir = resolve((args.dir as string) || process.cwd());
    if (!existsSync(repoDir)) {
      console.error(`❌ Directory not found: ${repoDir}`);
      process.exit(1);
    }
  }

  const outputPath = isAbsolute(outputFile) ? outputFile : join(args.url ? process.cwd() : repoDir, outputFile);

  console.log(`\n⚔  RepoQuest v${VERSION}\n`);
  console.log(`📂 Parsing repository: ${repoDir}`);

  let data;
  try {
    data = parseRepo(repoDir);
  } catch (err) {
    console.error(`❌ Failed to parse repository: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log(`✓  Project: ${data.name}`);
  console.log(`✓  Tech: ${data.tech.join(', ') || 'detected'}`);
  console.log(`✓  Key files: ${data.keyFiles.length}`);
  console.log(`✓  Features: ${data.features.length}`);
  console.log(`\n🎨 Generating with theme: ${theme}`);

  let html;
  try {
    html = generate(data, { theme, outputFile, repoDir });
  } catch (err) {
    console.error(`❌ Generation failed: ${(err as Error).message}`);
    process.exit(1);
  }

  writeFileSync(outputPath, html, 'utf8');
  const sizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);

  if (cleanup) cleanup();

  console.log(`\n✅ Generated: ${outputFile} (${sizeKb}KB)`);
  console.log(`\n   Open in browser to watch your setup guide play.\n`);

  if (args.open) {
    const { exec } = await import('child_process');
    const opener = process.platform === 'darwin' ? 'open'
      : process.platform === 'win32' ? 'start'
      : 'xdg-open';
    exec(`${opener} "${outputPath}"`);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
