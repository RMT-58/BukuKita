export default {
  transform: {},
  testEnvironment: "node",

  collectCoverage: true,
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testTimeout: 10000,
};
