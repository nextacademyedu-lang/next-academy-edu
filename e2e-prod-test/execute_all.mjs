import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['playwright', 'test'];

console.log('[execute_all] Running Playwright production e2e suite...');

const child = spawn(command, args, {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  const status = typeof code === 'number' ? code : 1;
  console.log(`[execute_all] Finished with exit code ${status}`);
  process.exit(status);
});

child.on('error', (error) => {
  console.error('[execute_all] Failed to start Playwright:', error);
  process.exit(1);
});
