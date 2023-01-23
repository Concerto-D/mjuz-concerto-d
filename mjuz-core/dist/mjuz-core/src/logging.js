"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogLevel = exports.newLogger = void 0;
const pino_1 = __importDefault(require("pino"));
const rootLogger = pino_1.default({
    prettyPrint: {
        ignore: 'hostname',
        hideObject: true,
    },
    level: 'info',
});
const childLoggers = [];
const newLogger = (name) => {
    const logger = rootLogger.child({ c: name });
    childLoggers.push(logger);
    return logger;
};
exports.newLogger = newLogger;
const setLogLevel = (level) => {
    rootLogger.level = level;
    childLoggers.forEach((logger) => (logger.level = level));
};
exports.setLogLevel = setLogLevel;
