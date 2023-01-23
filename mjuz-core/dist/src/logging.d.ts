import { Level, Logger } from 'pino';
export declare const newLogger: (name: string, logFileName?: string) => Logger;
export declare const setLogLevel: (level: Level) => void;
