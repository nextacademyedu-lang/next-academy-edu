import crypto from 'crypto';

const password = 'NextAcademy2024';

// Generate salt (same as Payload: 32 random bytes -> hex)
const salt = crypto.randomBytes(32).toString('hex');

// Generate hash (same as Payload: pbkdf2 with 25000 iterations, 512 keylen, sha256)
const hashBuffer = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256');
const hash = hashBuffer.toString('hex');

console.log('=== Payload-compatible hash ===');
console.log(`Salt: ${salt}`);
console.log(`Hash: ${hash}`);
console.log(`Salt length: ${salt.length}`);
console.log(`Hash length: ${hash.length}`);

// Verify it works
const verifyBuffer = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256');
const verifyHash = verifyBuffer.toString('hex');
console.log(`\nVerification: ${hash === verifyHash ? 'PASS ✅' : 'FAIL ❌'}`);

// Output the SQL command
console.log(`\n=== SQL Command ===`);
console.log(`UPDATE users SET salt = '${salt}', hash = '${hash}' WHERE email = 'manager@nextedu.com';`);
