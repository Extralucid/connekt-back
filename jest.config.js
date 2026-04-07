export const testEnvironment = 'node';
export const verbose = true;
export const collectCoverage = true;
export const coverageDirectory = 'coverage';
export const coveragePathIgnorePatterns = [
    '/node_modules/',
    '/tests/fixtures/',
    '/tests/mocks/',
];
export const coverageThreshold = {
    global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
    },
};
export const testMatch = [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
];
export const setupFilesAfterEnv = ['./tests/setup.js'];
export const testTimeout = 10000;
export const forceExit = true;
export const clearMocks = true;
export const resetMocks = true;
export const restoreMocks = true;