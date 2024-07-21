/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};
