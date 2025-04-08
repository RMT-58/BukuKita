export default {
  transform: {},
  testEnvironment: "node",
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 90,
    },
  },
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testTimeout: 100000,
  setupFilesAfterEnv: ["./jest.setup.js"],
};
