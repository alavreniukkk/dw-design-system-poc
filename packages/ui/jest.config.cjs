module.exports = {
  testEnvironment: "jsdom",
  clearMocks: true,
  testMatch: ["**/*.{spec,test}.{ts,tsx}"],
  transform: {
    "^.+\\.svg$": "<rootDir>/jest-svg.cjs",
    "^.+\\.tsx?$": "<rootDir>/jest-esbuild.cjs",
  },
  collectCoverageFrom: ["src/components/atoms/button/Button.tsx"],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
    },
  },
};
