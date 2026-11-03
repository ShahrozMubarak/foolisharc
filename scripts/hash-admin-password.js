import bcrypt from 'bcryptjs';

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('Run this command in an interactive terminal so the password is not echoed.');
  process.exit(1);
}

const stdin = process.stdin;
const stdout = process.stdout;
let password = '';

stdout.write('Create owner password (minimum 12 characters): ');
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', async character => {
  if (character === '\u0003') {
    stdout.write('\nCancelled.\n');
    process.exit(1);
  }
  if (character === '\r' || character === '\n') {
    stdin.setRawMode(false);
    stdin.pause();
    stdout.write('\n');
    if (password.length < 12 || password.length > 128) {
      console.error('Password must be between 12 and 128 characters.');
      process.exit(1);
    }
    const hash = await bcrypt.hash(password, 12);
    password = '';
    console.log('Add this value to the server environment as ADMIN_PASSWORD_HASH:');
    console.log(hash);
    process.exit(0);
  }
  if (character === '\u007f' || character === '\b') {
    password = password.slice(0, -1);
    return;
  }
  if (character >= ' ') password += character;
});
