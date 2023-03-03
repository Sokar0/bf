import { pathsToModuleNameMapper } from 'ts-jest';
import * as fs from 'fs';
const tsconfigJson = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

function manageKey(key) {
    return key.includes('(.*)') ? key.slice(0, -1) + '\\.js$' : key;
}

function manageMapper(mapper) {
    const newMapper = {};
    for (const key in mapper) {
        newMapper[manageKey(key)] = mapper[key];
    }
    newMapper['^(\\.{1,2}/.*)\\.js$'] = '$1';
    return newMapper;
}

const esModules = [
    'fastify-decorators',
    '@fastify-decorators/simple-di',
    'cps-common-models'
].join('|')

const config = {
    preset: 'ts-jest/presets/default-esm',
    forceExit: true,
    detectOpenHandles: true,
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',
    verbose: true,
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true,
        }],
        '^.+\\.js?$': 'babel-jest'
      },
    moduleFileExtensions: [
        'js',
        'json',
        'ts'
    ],
    coverageProvider: 'v8',
    collectCoverage: true,
    coverageReporters: ['lcov', 'text'],
    reporters: ['default',  'jest-sonar'],
    testResultsProcessor: 'jest-sonar-reporter',
    moduleNameMapper: manageMapper(pathsToModuleNameMapper(tsconfigJson.compilerOptions.paths, { prefix: '<rootDir>/' })),
    transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esModules})`],
    rootDir: './',
    modulePaths: [
      '<rootDir>'
    ],
    setupFilesAfterEnv: [
        'jest-extended/all'
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/index.ts',
        '!src/schemas/*.ts',
        '!src/utils/*.ts',
        '!**/node_modules/**'
    ],
};

export default config;
