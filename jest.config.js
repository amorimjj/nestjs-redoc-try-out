module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  testMatch: [
    "**/*.spec.ts",
  ],
  coverageReporters: ['lcov', 'text']
};
