"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogLevel = exports.newLogger = void 0;
const pino_1 = __importDefault(require("pino"));
let rootLogger;
const childLoggers = [];
const newLogger = (name, logFileName = '') => {
    if (rootLogger === undefined) {
        rootLogger = pino_1.default({
            prettyPrint: {
                ignore: 'hostname',
                hideObject: true,
                translateTime: true,
            },
            level: 'info',
        }, pino_1.default.destination(logFileName));
    }
    const logger = rootLogger.child({ c: name });
    process.on('uncaughtException', (err) => {
        logger.error(err);
        process.exit(1);
    });
    process.on('unhandledRejection', (err) => {
        logger.error(err);
        process.exit(1);
    });
    process.on('UnhandledPromiseRejectionWarning', (err) => {
        logger.error(err);
        process.exit(1);
    });
    childLoggers.push(logger);
    return logger;
};
exports.newLogger = newLogger;
const setLogLevel = (level) => {
    rootLogger.level = level;
    childLoggers.forEach((logger) => (logger.level = level));
};
exports.setLogLevel = setLogLevel;
