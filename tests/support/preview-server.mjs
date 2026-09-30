import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { setInterval } from 'node:timers';

const command = [
  'pnpm',
  'astro',
  'preview',
  '--background',
  '--host',
  '127.0.0.1',
  '--port',
  '4322',
];
const result =
  process.platform === 'win32'
    ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', command.join(' ')], {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
    : spawnSync(command[0], command.slice(1), { cwd: process.cwd(), stdio: 'inherit' });

if (result.status !== 0) process.exit(result.status ?? 1);

const stop = () => {
  const stopCommand = ['pnpm', 'astro', 'preview', 'stop'];
  if (process.platform === 'win32') {
    spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', stopCommand.join(' ')], {
      cwd: process.cwd(),
      stdio: 'ignore',
    });
  } else {
    spawnSync(stopCommand[0], stopCommand.slice(1), { cwd: process.cwd(), stdio: 'ignore' });
  }
  process.exit(0);
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
setInterval(() => undefined, 60_000);
