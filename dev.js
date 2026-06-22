import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [
  spawn(npm, ['run', 'dev'], { cwd: new URL('./backend/', import.meta.url), stdio: 'inherit' }),
  spawn(npm, ['run', 'dev', '--', '--host', '0.0.0.0'], { cwd: new URL('./frontend/', import.meta.url), stdio: 'inherit' })
];

const stop = () => {
  for (const child of processes) child.kill();
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of processes) child.on('exit', code => {
  if (code && code !== 0) process.exitCode = code;
});
