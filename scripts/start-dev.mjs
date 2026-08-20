import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const apiRoot = join(webRoot, '..', 'inrfs_financer_api', 'src', 'INRFS.Financer.API');
const apiDll = join(apiRoot, 'bin', 'Debug', 'net9.0', 'INRFS.Financer.API.dll');
const dotnet = process.platform === 'win32' ? 'dotnet.exe' : 'dotnet';
const childEnvironment = { ...process.env };
if (!childEnvironment.NUGET_PACKAGES && process.env.USERPROFILE) {
  childEnvironment.NUGET_PACKAGES = join(process.env.USERPROFILE, '.nuget', 'packages');
}
childEnvironment.ASPNETCORE_ENVIRONMENT ||= 'Development';
childEnvironment.ASPNETCORE_URLS ||= 'http://localhost:5187';
childEnvironment.ConnectionStrings__DefaultConnection = process.env.INRFS_DEV_CONNECTION_STRING
  || `Data Source=${join(apiRoot, 'App_Data', 'inrfs-financer.db')}`;
childEnvironment.Database__Initialize = 'true';

const build = spawnSync(dotnet, ['build', join(apiRoot, '..', '..', 'INRFS.Financer.slnx'), '--no-restore'], {
  cwd: apiRoot,
  env: childEnvironment,
  stdio: 'inherit',
});
if (build.status !== 0 || !existsSync(apiDll)) {
  console.error('Unable to build the INRFS API.');
  process.exit(1);
}

const api = spawn(dotnet, [apiDll], {
  cwd: apiRoot,
  env: childEnvironment,
  stdio: 'inherit',
});
const web = spawn(process.execPath, [join(webRoot, 'node_modules', 'vite', 'bin', 'vite.js')], {
  cwd: webRoot,
  env: process.env,
  stdio: 'inherit',
});

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of [api, web]) {
    if (child.exitCode !== null) continue;
    if (process.platform === 'win32') spawnSync('taskkill.exe', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(exitCode), 250);
}

api.on('error', (error) => {
  console.error(`Unable to start the INRFS API: ${error.message}`);
  stop(1);
});
web.on('error', (error) => {
  console.error(`Unable to start Vite: ${error.message}`);
  stop(1);
});
api.on('exit', (code) => { if (!stopping) stop(code ?? 1); });
web.on('exit', (code) => { if (!stopping) stop(code ?? 1); });
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
