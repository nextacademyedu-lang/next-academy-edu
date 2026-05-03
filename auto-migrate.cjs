const { spawn } = require('child_process');

const proc = spawn('pnpm', ['payload', 'migrate:create'], { 
  shell: true, 
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    DATABASE_URI: 'postgresql://nextacademy:postgres@localhost:5432/nextacademy'
  }
});

proc.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);
  if (str.includes('?')) {
    proc.stdin.write('\r\n');
  }
});

proc.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

proc.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
