import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const apiRoot = join(webRoot, '..', 'inrfs_financer_api', 'src', 'INRFS.Financer.API');
const apiDll = join(apiRoot, 'bin', 'Debug', 'net9.0', 'INRFS.Financer.API.dll');
const dotnet = process.platform === 'win32' ? 'dotnet.exe' : 'dotnet';
const build = spawnSync(dotnet, ['build', join(apiRoot, '..', '..', 'INRFS.Financer.slnx'), '--no-restore'], {
  cwd: apiRoot,
  stdio: 'inherit',
});
if (build.status !== 0 || !existsSync(apiDll)) {
  console.error('Unable to build the INRFS API.');
  process.exit(1);
}

const environment = {
  ...process.env,
  ASPNETCORE_ENVIRONMENT: process.env.ASPNETCORE_ENVIRONMENT || 'Development',
  ASPNETCORE_URLS: process.env.ASPNETCORE_URLS || 'http://localhost:5187',
  ConnectionStrings__DefaultConnection: process.env.INRFS_DEV_CONNECTION_STRING
    || `Data Source=${join(apiRoot, 'App_Data', 'inrfs-financer.db')}`,
  Database__Initialize: 'true',
};
const child = spawn(dotnet, [apiDll], {
  cwd: apiRoot,
  env: environment,
  stdio: 'inherit',
});
child.on('error', (error) => { console.error(`Unable to start the INRFS API: ${error.message}`); process.exit(1); });
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill());
