module.exports = {
    preset: "ts-jest",
    testEnvironment: 'jsdom',
    // Do not run .ts files, just .js (compiled ts)
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts$",
    globalSetup: "./src/ts/tests/setup.ts",
    globalTeardown: "./src/ts/tests/teardown.ts",
};
