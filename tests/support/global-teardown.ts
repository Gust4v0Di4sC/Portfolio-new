import { spawnSync } from 'node:child_process';

export default function globalTeardown() {
  const options = { cwd: process.cwd(), stdio: 'ignore' as const };
  if (process.platform === 'win32') {
    spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'pnpm astro dev stop'], options);
    return;
  }
  spawnSync('pnpm', ['astro', 'dev', 'stop'], options);
}
