const dotenv = require('dotenv');
dotenv.config({ path: '.env.development' });

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: '.',
});

module.exports = createJestConfig({
  moduleDirectories: ['node_modules', '<rootDir>'],
  testTimeout: 60000,
});
