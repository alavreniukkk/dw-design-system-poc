module.exports = {
  testEnvironment: "jsdom",
  clearMocks: true,
  testMatch: ["**/*.{spec,test}.{ts,tsx}"],
  transform: {
    "^.+\\.svg$": "<rootDir>/jest-svg.cjs",
    "^.+\\.tsx?$": "<rootDir>/jest-esbuild.cjs",
  },
  collectCoverageFrom: [
    "src/components/atoms/Button/Button.tsx",
    "src/components/atoms/ButtonDanger/ButtonDanger.tsx",
    "src/components/atoms/IconButton/IconButton.tsx",
    "src/components/molecules/ButtonGroup/ButtonGroup.tsx",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
    },
  },
};
