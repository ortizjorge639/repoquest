import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseRepo } from '../dist/parser.js';
import { generate } from '../dist/generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_SIMPLE = join(__dirname, 'fixtures/simple-node');
const FIXTURE_MINIMAL = join(__dirname, 'fixtures/no-package');

// ── Parser tests ──────────────────────────────────────────────────────────────

describe('parseRepo', () => {
  it('extracts name from package.json', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.equal(data.name, 'My Api');
  });

  it('extracts description', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.ok(data.description.length > 10, 'description should be non-empty');
  });

  it('extracts tagline (≤80 chars)', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.ok(data.tagline.length <= 80, `tagline too long: ${data.tagline.length}`);
    assert.ok(data.tagline.length > 0, 'tagline should not be empty');
  });

  it('extracts nodeVersion from engines', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.equal(data.prerequisites.nodeVersion, '>=18');
  });

  it('extracts env vars from .env.example', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.ok(data.prerequisites.envVars.length >= 2);
    const keys = data.prerequisites.envVars.map(v => v.key);
    assert.ok(keys.includes('DATABASE_URL'));
    assert.ok(keys.includes('JWT_SECRET'));
  });

  it('builds correct clone command', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.ok(data.install.cloneCommand.includes('git clone'));
    assert.ok(data.install.cloneCommand.includes('my-api'));
  });

  it('detects TypeScript in tech stack', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.ok(data.tech.includes('TypeScript'), `tech was: ${data.tech}`);
  });

  it('produces key files', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.ok(data.keyFiles.length > 0, 'should have at least 1 key file');
    assert.ok(data.keyFiles.length <= 6, 'should have at most 6 key files');
  });

  it('extracts features from README', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    assert.ok(data.features.length > 0, 'should extract features');
  });

  it('handles missing package.json gracefully', () => {
    const data = parseRepo(FIXTURE_MINIMAL);
    assert.ok(data.name.length > 0, 'should have a name');
    assert.ok(data.description.length > 0, 'should have a description from README');
  });
});

// ── Generator tests ───────────────────────────────────────────────────────────

describe('generate', () => {
  it('produces valid HTML', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    const html = generate(data, { theme: 'quest', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'should start with doctype');
    assert.ok(html.includes('<html'), 'should have html tag');
    assert.ok(html.includes('</html>'), 'should close html tag');
    assert.ok(html.includes('gsap'), 'should include GSAP');
  });

  it('includes project name in output', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    const html = generate(data, { theme: 'quest', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    assert.ok(html.includes('My Api') || html.includes('my-api'), 'should include project name');
  });

  it('quest theme includes medieval language', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    const html = generate(data, { theme: 'quest', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    assert.ok(html.includes('Quest') || html.includes('quest'), 'quest theme should have quest language');
  });

  it('minimal theme produces different output than quest', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    const questHtml = generate(data, { theme: 'quest', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    const minimalHtml = generate(data, { theme: 'minimal', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    assert.notEqual(questHtml, minimalHtml, 'themes should produce different output');
  });

  it('output is self-contained (no local file references)', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    const html = generate(data, { theme: 'quest', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    assert.ok(!html.includes('src="./'), 'should not have local src references');
    assert.ok(!html.includes('href="./'), 'should not have local href references');
  });

  it('output size is reasonable (<200KB)', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    const html = generate(data, { theme: 'quest', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    const sizeKb = Buffer.byteLength(html, 'utf8') / 1024;
    assert.ok(sizeKb < 200, `output too large: ${sizeKb.toFixed(1)}KB`);
  });

  it('includes GSAP timeline registration', () => {
    const data = parseRepo(FIXTURE_SIMPLE);
    const html = generate(data, { theme: 'quest', outputFile: 'test.html', repoDir: FIXTURE_SIMPLE });
    assert.ok(html.includes('window.__timelines'), 'should register timeline');
    assert.ok(html.includes("data-composition-id"), 'should have composition id');
  });

  it('works on no-package fixture', () => {
    const data = parseRepo(FIXTURE_MINIMAL);
    assert.doesNotThrow(() => {
      generate(data, { theme: 'minimal', outputFile: 'test.html', repoDir: FIXTURE_MINIMAL });
    });
  });
});

console.log('Tests complete.');
