module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  testEnvironment: 'node',
  rootDir: 'src',
  modulePathIgnorePatterns: ['<rootDir>/test/api'],
  collectCoverageFrom: ['**/*.ts', '!demo.ts'],
};
