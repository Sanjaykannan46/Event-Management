import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  moduleNameMapper: {
    // map ESM bcrypt-ts to a local mock
    '^bcrypt-ts$': '<rootDir>/tests/mocks/bcrypt-ts.ts',
    // make "import ... from './x.js'" resolve to ts files
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { useESM: true, tsconfig: '<rootDir>/tsconfig.json' },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  verbose: true,   // show “√ TCx …” lines
  silent: true,    // hide console.log from tests and app code
};

export default config;