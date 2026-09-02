/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".spec.ts$",
  setupFiles: ["reflect-metadata"],
  transformIgnorePatterns: ["/node_modules/(?!.pnpm)(?!@nestjs/)"],
  transform: {
    "^.+\\.(t|j)s$": [
      require("path").join(__dirname, "jest-ts-nestjs.cjs"),
      {
        tsconfig: {
          types: ["node", "jest"],
          allowJs: true,
        },
      },
    ],
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
