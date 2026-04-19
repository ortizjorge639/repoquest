import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import type { RepoData, EnvVar, FileNode } from './types.js';

// Files that signal importance — used for highlight scoring
const HIGHLIGHT_FILES = [
  'index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js',
  'server.ts', 'server.js', 'cli.ts', 'cli.js',
  'CLAUDE.md', 'docker-compose.yml', 'Dockerfile',
  '.env.example', '.env.sample', '.env.template', '.env.local.example', '.env.defaults', 'schema.prisma', 'schema.sql',
];

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
  'coverage', '.cache', 'vendor', 'venv', '.venv',
]);

// Infer a human-readable description for a file from its name/path
function describeFile(filePath: string): string {
  const name = filePath.split('/').pop() || filePath;
  const map: Record<string, string> = {
    'index.ts': 'Main entry point',
    'index.js': 'Main entry point',
    'main.ts': 'Application bootstrap',
    'main.js': 'Application bootstrap',
    'server.ts': 'HTTP server setup',
    'server.js': 'HTTP server setup',
    'cli.ts': 'CLI entry point',
    'cli.js': 'CLI entry point',
    'app.ts': 'App configuration',
    'app.py': 'Application entry point',
    'CLAUDE.md': 'Agent memory and instructions',
    'docker-compose.yml': 'Container orchestration',
    'Dockerfile': 'Container image definition',
    '.env.example': 'Required environment variables',
    'schema.prisma': 'Database schema',
    'package.json': 'Dependencies and scripts',
    'requirements.txt': 'Python dependencies',
    'Makefile': 'Build and run commands',
    'README.md': 'Project documentation',
  };
  return map[name] || inferFromPath(filePath);
}

function inferFromPath(filePath: string): string {
  if (filePath.includes('auth')) return 'Authentication logic';
  if (filePath.includes('route') || filePath.includes('router')) return 'Route definitions';
  if (filePath.includes('model')) return 'Data models';
  if (filePath.includes('db') || filePath.includes('database')) return 'Database layer';
  if (filePath.includes('config')) return 'Configuration';
  if (filePath.includes('util') || filePath.includes('helper')) return 'Utility functions';
  if (filePath.includes('test') || filePath.includes('spec')) return 'Tests';
  if (filePath.includes('component')) return 'UI components';
  if (filePath.includes('api')) return 'API handlers';
  if (filePath.includes('store') || filePath.includes('redux')) return 'State management';
  const ext = extname(filePath);
  if (ext === '.ts' || ext === '.js') return 'Source module';
  if (ext === '.py') return 'Python module';
  if (ext === '.go') return 'Go package';
  if (ext === '.rs') return 'Rust module';
  return 'Project file';
}

function scoreFile(filePath: string): number {
  const name = filePath.split('/').pop() || '';
  const depth = filePath.split('/').length;
  let score = 0;
  if (HIGHLIGHT_FILES.includes(name)) score += 10;
  if (filePath.startsWith('src/') && depth === 2) score += 5;
  if (name.endsWith('.ts') || name.endsWith('.js')) score += 2;
  if (name.endsWith('.py') || name.endsWith('.go') || name.endsWith('.rs')) score += 2;
  score -= depth; // penalize deep nesting
  return score;
}

function walkTree(dir: string, base: string, depth = 0, max = 3): FileNode[] {
  if (depth > max) return [];
  const nodes: FileNode[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  for (const entry of entries) {
    if (entry.startsWith('.') && entry !== '.env.example') continue;
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    const rel = relative(base, full);
    if (stat.isDirectory()) {
      nodes.push(...walkTree(full, base, depth + 1, max));
    } else {
      nodes.push({
        path: rel,
        description: describeFile(rel),
        isHighlight: false,
      });
    }
  }
  return nodes;
}

function parseEnvExample(dir: string): EnvVar[] {
  const candidates = ['.env.example', '.env.sample', '.env.template', '.env.local.example', '.env.defaults'];
  const found = candidates.find(f => existsSync(join(dir, f)));
  if (!found) return [];
  const path = join(dir, found);
  const lines = readFileSync(path, 'utf8').split('\n');
  const vars: EnvVar[] = [];
  let lastComment = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      lastComment = trimmed.slice(1).trim();
    } else if (trimmed.includes('=')) {
      const [key] = trimmed.split('=');
      if (key.trim()) {
        vars.push({ key: key.trim(), description: lastComment, required: true });
        lastComment = '';
      }
    } else {
      lastComment = '';
    }
  }
  return vars;
}

function extractReadmeSection(readme: string, headings: string[]): string {
  const lines = readme.split('\n');
  const pattern = new RegExp(`^#{1,3}\\s*(${headings.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'i');
  let inSection = false;
  const collected: string[] = [];
  for (const line of lines) {
    if (/^#{1,3}\s/.test(line)) {
      if (inSection) break;
      if (pattern.test(line)) { inSection = true; continue; }
    }
    if (inSection) collected.push(line);
  }
  return collected.join('\n').trim();
}

function extractBullets(text: string, max = 4): string[] {
  const bullets: string[] = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^[-*+]\s+(.+)/);
    if (m) bullets.push(m[1].replace(/\*\*/g, '').trim());
    if (bullets.length >= max) break;
  }
  return bullets;
}

function inferTech(dir: string, pkg: Record<string, unknown>): string[] {
  const tech: string[] = [];
  if (existsSync(join(dir, 'package.json'))) {
    tech.push('Node.js');
    const deps = { ...((pkg.dependencies || {}) as Record<string, string>), ...((pkg.devDependencies || {}) as Record<string, string>) };
    if (deps['typescript'] || deps['ts-node'] || deps['tsx']) tech.push('TypeScript');
    if (deps['react'] || deps['next']) tech.push('React');
    if (deps['next']) tech.push('Next.js');
    if (deps['express'] || deps['fastify'] || deps['hono']) tech.push('HTTP API');
    if (deps['prisma']) tech.push('Prisma');
    if (deps['openai'] || deps['@anthropic-ai/sdk']) tech.push('AI/LLM');
    if (deps['docker-compose'] || existsSync(join(dir, 'docker-compose.yml'))) tech.push('Docker');
  }
  if (existsSync(join(dir, 'requirements.txt'))) tech.push('Python');
  if (existsSync(join(dir, 'go.mod'))) tech.push('Go');
  if (existsSync(join(dir, 'Cargo.toml'))) tech.push('Rust');
  if (existsSync(join(dir, 'Dockerfile'))) tech.push('Docker');
  return [...new Set(tech)];
}

function inferCloneUrl(dir: string, pkg: Record<string, unknown>): string | undefined {
  // Try package.json repository field
  const repo = pkg.repository as { url?: string } | string | undefined;
  if (typeof repo === 'string') return `git clone ${repo}`;
  if (repo?.url) {
    const url = repo.url.replace(/^git\+/, '').replace(/\.git$/, '');
    return `git clone ${url}.git`;
  }
  // Try .git/config
  try {
    const cfg = readFileSync(join(dir, '.git', 'config'), 'utf8');
    const m = cfg.match(/url\s*=\s*(.+)/);
    if (m) return `git clone ${m[1].trim()}`;
  } catch {}
  return undefined;
}

export function parseRepo(dir: string): RepoData {
  // 1. Read package.json
  let pkg: Record<string, unknown> = {};
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try { pkg = JSON.parse(readFileSync(pkgPath, 'utf8')); } catch {}
  }

  // 2. Read README
  let readme = '';
  for (const name of ['README.md', 'readme.md', 'Readme.md', 'README.rst', 'README.txt']) {
    const p = join(dir, name);
    if (existsSync(p)) { try { readme = readFileSync(p, 'utf8'); } catch {} break; }
  }

  // 3. Name
  const name = (pkg.name as string) || dir.split('/').pop() || 'Unknown Project';
  const displayName = name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // 4. Description
  let description = (pkg.description as string) || '';
  if (!description && readme) {
    // Find first non-heading, non-badge paragraph
    const lines = readme.split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (t && !t.startsWith('#') && !t.startsWith('!') && !t.startsWith('<') && !t.startsWith('[') && t.length > 20) {
        description = t.replace(/\*\*/g, '').replace(/[_*]/g, '');
        break;
      }
    }
  }
  if (description.length > 200) description = description.slice(0, 197) + '...';

  // 5. Tagline — first sentence of description
  const tagline = description.split(/[.!?]/)[0].trim().slice(0, 80);

  // 6. Prerequisites
  const engines = (pkg.engines as Record<string, string>) || {};
  const nodeVersion = engines.node || engines['node-version'];
  const tools: string[] = [];
  if (readme.toLowerCase().includes('docker')) tools.push('Docker');
  if (readme.toLowerCase().includes('git clone') || readme.toLowerCase().includes('git')) tools.push('Git');
  if (existsSync(join(dir, 'Brewfile'))) tools.push('Homebrew');
  const envVars = parseEnvExample(dir);

  // 7. Install commands
  const scripts = (pkg.scripts as Record<string, string>) || {};
  const hasYarn = existsSync(join(dir, 'yarn.lock'));
  const hasPnpm = existsSync(join(dir, 'pnpm-lock.yaml'));
  const pm = hasPnpm ? 'pnpm' : hasYarn ? 'yarn' : 'npm';
  const installCommand = existsSync(join(dir, 'requirements.txt'))
    ? 'pip install -r requirements.txt'
    : existsSync(join(dir, 'go.mod'))
    ? 'go mod download'
    : `${pm} install`;
  const devCommand = scripts.dev ? `${pm} run dev`
    : scripts.start ? `${pm} start`
    : scripts.serve ? `${pm} run serve`
    : 'npm start';
  const cloneUrl = inferCloneUrl(dir, pkg) || `git clone https://github.com/owner/${name}.git`;

  // 8. Key files
  const allFiles = walkTree(dir, dir);
  const scored = allFiles
    .map(f => ({ ...f, score: scoreFile(f.path) }))
    .sort((a, b) => b.score - a.score);
  const keyFiles: FileNode[] = scored.slice(0, 6).map((f, i) => ({
    path: f.path,
    description: f.description,
    isHighlight: i < 3,
  }));

  // 9. Features from README
  const featSection = extractReadmeSection(readme, ['features', 'what it does', 'capabilities', 'what it supports', 'highlights']);
  const features = extractBullets(featSection || readme, 4);

  // 10. Tech stack
  const tech = inferTech(dir, pkg);

  return {
    name: displayName,
    description,
    tagline,
    repoUrl: cloneUrl,
    version: pkg.version as string | undefined,
    prerequisites: {
      nodeVersion,
      tools,
      envVars,
    },
    install: {
      cloneCommand: cloneUrl,
      installCommand,
      devCommand,
      setupCommand: scripts.setup ? `${pm} run setup` : undefined,
    },
    keyFiles,
    features: features.length ? features : ['Install and run with a single command', 'Open source and customizable'],
    firstRun: {
      command: devCommand,
      expectedOutput: 'Server running and ready',
    },
    tech,
  };
}
