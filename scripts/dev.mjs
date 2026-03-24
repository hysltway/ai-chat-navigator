import { watch } from 'node:fs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'public');
const publicManifestPath = resolve(rootDir, 'public', 'manifest.json');
const distManifestPath = resolve(rootDir, 'dist', 'manifest.json');
const devPort = 38999;
const devUrl = `http://127.0.0.1:${devPort}`;

let version = Date.now();
let bumpTimer = null;
let publicSyncTimer = null;

async function syncDevManifest() {
  const baseManifest = JSON.parse(await readFile(publicManifestPath, 'utf8'));
  baseManifest.background = {
    service_worker: 'background.js',
    type: 'module'
  };
  baseManifest.host_permissions = ['http://127.0.0.1:38999/*'];
  await writeFile(distManifestPath, `${JSON.stringify(baseManifest, null, 2)}\n`, 'utf8');
}

async function syncPublicAssets() {
  await cp(publicDir, distDir, {
    recursive: true,
    force: true,
    errorOnExist: false,
    filter: (source) => source !== publicManifestPath
  });
  await syncDevManifest();
}

function scheduleVersionBump() {
  if (bumpTimer) {
    clearTimeout(bumpTimer);
  }
  bumpTimer = setTimeout(() => {
    version = Date.now();
    console.log(`[jumpnav-dev] updated version ${version}`);
    bumpTimer = null;
  }, 200);
}

function schedulePublicSync() {
  if (publicSyncTimer) {
    clearTimeout(publicSyncTimer);
  }
  publicSyncTimer = setTimeout(() => {
    void syncPublicAssets().catch((error) => {
      console.error('[jumpnav-dev] failed to sync public assets');
      console.error(error);
    });
    publicSyncTimer = null;
  }, 100);
}

await mkdir(distDir, { recursive: true });

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.url === '/version') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ version }));
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(devPort, '127.0.0.1', () => {
  console.log(`[jumpnav-dev] reload server listening on ${devUrl}`);
});

watch(distDir, { recursive: true }, () => {
  scheduleVersionBump();
});

watch(publicDir, { recursive: true }, () => {
  schedulePublicSync();
});

const buildProcess = spawn(
  process.execPath,
  [resolve(rootDir, 'scripts', 'build.mjs'), '--watch', `--dev-server=${devUrl}`],
  {
    cwd: rootDir,
    stdio: 'inherit'
  }
);

const cleanup = () => {
  server.close();
  if (!buildProcess.killed) {
    buildProcess.kill('SIGINT');
  }
};

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

buildProcess.on('exit', (code) => {
  server.close();
  process.exit(code ?? 0);
});

void syncPublicAssets().catch((error) => {
  console.error('[jumpnav-dev] failed to sync initial public assets');
  console.error(error);
});
