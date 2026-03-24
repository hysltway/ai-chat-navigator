import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { build } from 'vite';

const rootDir = process.cwd();
const outDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'public');
const publicManifestPath = resolve(rootDir, 'public', 'manifest.json');
const isWatchMode = process.argv.includes('--watch');
const watchEnabled = isWatchMode ? {} : null;
const devServerUrlArg = process.argv.find((arg) => arg.startsWith('--dev-server='));
const devServerUrl = devServerUrlArg ? devServerUrlArg.slice('--dev-server='.length) : '';

const sharedConfig = {
  define: {
    __JUMPNAV_DEV_SERVER__: JSON.stringify(devServerUrl)
  }
};

const sharedBuild = {
  outDir,
  minify: false,
  sourcemap: false,
  target: 'es2022',
  watch: watchEnabled
};

function buildManifest(baseManifest, { isDev }) {
  const manifest = JSON.parse(JSON.stringify(baseManifest));
  manifest.background = {
    service_worker: 'background.js',
    type: 'module'
  };
  if (isDev) {
    manifest.host_permissions = ['http://127.0.0.1:38999/*'];
  }
  return manifest;
}

async function writeManifest() {
  const rawManifest = JSON.parse(await readFile(publicManifestPath, 'utf8'));
  const manifest = buildManifest(rawManifest, { isDev: Boolean(devServerUrl) });
  await writeFile(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function ensureDist() {
  if (!isWatchMode) {
    await rm(outDir, { recursive: true, force: true });
  }
  await mkdir(outDir, { recursive: true });
}

async function copyPublicAssets() {
  await cp(publicDir, outDir, {
    recursive: true,
    force: true,
    errorOnExist: false,
    filter: (source) => source !== publicManifestPath
  });
}

await ensureDist();
await copyPublicAssets();

await build({
  ...sharedConfig,
  publicDir: false,
  build: {
    ...sharedBuild,
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      entry: resolve(rootDir, 'src/content/index.ts'),
      formats: ['iife'],
      name: 'JumpNavContent',
      fileName: () => 'content.js'
    }
  }
});

await build({
  ...sharedConfig,
  publicDir: false,
  build: {
    ...sharedBuild,
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      entry: resolve(rootDir, 'src/popup/index.ts'),
      formats: ['iife'],
      name: 'JumpNavPopup',
      fileName: () => 'popup/popup.js'
    }
  }
});

await build({
  ...sharedConfig,
  publicDir: false,
  build: {
    ...sharedBuild,
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      entry: resolve(rootDir, 'src/background/index.ts'),
      formats: ['es'],
      fileName: () => 'background.js'
    }
  }
});

await writeManifest();
