import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(webRoot);
const apiRoot = join(workspaceRoot, 'inrfs_financer_api');
const databasePath = join(apiRoot, 'src', 'INRFS.Financer.API', 'App_Data', 'e2e.db');
const deliveryPath = join(webRoot, 'test-results', 'auth-delivery.jsonl');

async function waitFor(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function killTree(child) {
  if (!child?.pid || child.exitCode !== null) return;
  spawnSync('taskkill.exe', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
}

async function stopProcess(child) {
  if (!child?.pid || child.exitCode !== null) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.kill();
  await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 3_000))]);
  if (child.exitCode === null) {
    killTree(child);
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 3_000))]);
  }
}

async function removeEventually(path) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      rmSync(path, { force: true });
      return;
    } catch (error) {
      if (error.code !== 'EBUSY' || attempt === 19) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

export default async function globalSetup() {
  rmSync(databasePath, { force: true });
  rmSync(deliveryPath, { force: true });

  const build = spawnSync('dotnet.exe', ['build', '-c', 'Release', '--no-restore'], { cwd: apiRoot, stdio: 'inherit' });
  if (build.status !== 0) throw new Error('Unable to build the INRFS API for browser tests.');

  const api = spawn('dotnet.exe', [join(apiRoot, 'src', 'INRFS.Financer.API', 'bin', 'Release', 'net9.0', 'INRFS.Financer.API.dll')], {
    cwd: apiRoot,
    stdio: 'ignore',
    env: {
      ...process.env,
      ASPNETCORE_ENVIRONMENT: 'Development',
      ASPNETCORE_URLS: 'http://127.0.0.1:5198',
      ConnectionStrings__DefaultConnection: `Data Source=${databasePath}`,
      Database__Initialize: 'true',
      SeedAdmin__Email: 'admin.e2e@inrfs.test',
      SeedAdmin__Password: 'StrongAdminE2E123!',
      Jwt__Key: 'e2e-signing-key-with-at-least-32-characters-123456',
      DataProtection__Key: 'e2e-data-protection-key-with-at-least-32-characters',
      AuthDelivery__Provider: 'Development',
      AuthDelivery__DevelopmentOutputPath: deliveryPath,
      Logging__LogLevel__Default: 'Warning',
      Logging__LogLevel__Microsoft: 'Warning',
    },
  });
  const vite = spawn(process.execPath, [join(webRoot, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', '5199', '--strictPort'], {
    cwd: webRoot,
    stdio: 'ignore',
    env: { ...process.env, VITE_DEV_API_TARGET: 'http://127.0.0.1:5198' },
  });

  try {
    await Promise.all([
      waitFor('http://127.0.0.1:5198/health/ready', 60_000),
      waitFor('http://127.0.0.1:5199', 60_000),
    ]);
  } catch (error) {
    killTree(api);
    killTree(vite);
    throw error;
  }

  return async () => {
    await Promise.all([stopProcess(vite), stopProcess(api)]);
    await removeEventually(databasePath);
    await removeEventually(deliveryPath);
  };
}
