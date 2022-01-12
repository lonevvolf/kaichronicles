// ts-jest configuration:
/*module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
};*/

module.exports = {
    testEnvironment: 'jsdom',
    // Do not run .ts files, just .js (compiled ts)
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.js$"
};
