import test from 'tape';

export * from './amman';
export * from './initialize';
export * from './log';

export const killStuckProcess = () => {
    test.onFinish(() => process.exit(0));
}

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}