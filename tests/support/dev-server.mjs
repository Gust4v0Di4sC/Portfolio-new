import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { setInterval } from 'node:timers';

const runAstro = (args) => {
  const command = ['pnpm', 'astro', 'dev', ...args];
  return process.platform === 'win32'
    ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', command.join(' ')], {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
    : spawnSync(command[0], command.slice(1), { cwd: process.cwd(), stdio: 'inherit' });
};

const start = runAstro(['--background', '--host', '127.0.0.1']);

if (start.status !== 0) {
  process.exit(start.status ?? 1);
}

const stop = () => {
  runAstro(['stop']);
  process.exit(0);
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
setInterval(() => undefined, 60_000);
