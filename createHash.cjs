const bcrypt = require('bcrypt');

async function createHash(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

process.argv[2] ? createHash(process.argv[2]).then(hash => console.log(hash)) : console.log('Please provide a password as an argument');
