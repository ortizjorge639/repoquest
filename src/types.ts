// Shared types for RepoQuest

export interface EnvVar {
  key: string;
  description: string; // from comment in .env.example, or empty
  required: boolean;
}

export interface FileNode {
  path: string;        // relative path
  description: string; // inferred from name/context
  isHighlight: boolean; // true for top 5 most important
}

export interface RepoData {
  name: string;
  description: string;
  tagline: string;        // one-liner, ≤80 chars
  repoUrl?: string;       // from package.json repository or git remote
  version?: string;
  prerequisites: {
    nodeVersion?: string; // e.g. ">=18"
    tools: string[];      // e.g. ["docker", "git"]
    envVars: EnvVar[];
  };
  install: {
    cloneCommand: string; // git clone ...
    installCommand: string; // npm install / pip install / etc
    devCommand: string;   // npm run dev / etc
    setupCommand?: string; // e.g. /setup for NanoClaw
  };
  keyFiles: FileNode[];   // 3–6 files
  features: string[];     // bullet points from README, max 4
  firstRun: {
    command: string;
    expectedOutput: string;
  };
  tech: string[];          // inferred stack: ["Node.js", "TypeScript", ...]
}

export type Theme = 'quest' | 'minimal' | 'pitch' | 'tutorial';

export interface SceneTemplate {
  id: string;
  title: string;
  duration: number;
  render: (data: RepoData) => string; // returns HTML for scene inner content
}

export interface GeneratorOptions {
  theme: Theme;
  outputFile: string;
  repoDir: string;
}
