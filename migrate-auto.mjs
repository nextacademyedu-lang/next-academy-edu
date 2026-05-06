import { spawn } from 'child_process';

const child = spawn('npx', ['payload', 'migrate:create'], { shell: true });

child.stdout.on('data', (data) => {
  process.stdout.write(`[OUT] ${data}`);
  const out = data.toString();
  if (out.includes('?')) {
    child.stdin.write('\n');
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(`[ERR] ${data}`);
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code);
});
