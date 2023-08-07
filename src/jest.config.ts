import type {Config} from '@jest/types';

//Jest Config
const config : Config.InitialOptions = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleDirectories: ["node_modules", "src"]
};

export default config;