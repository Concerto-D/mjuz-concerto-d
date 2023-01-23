"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDeployment = exports.setExitCode = exports.registerTimeValuesInFile = exports.registerEndAllTimeValues = exports.registerTimeValue = exports.globalVariables = exports.TimestampPeriod = exports.TimestampType = void 0;
const hareactive_1 = require("@funkia/hareactive");
const _1 = require(".");
const yargs = __importStar(require("yargs"));
const YAML = __importStar(require("yaml"));
const fs_1 = __importDefault(require("fs"));
var TimestampType;
(function (TimestampType) {
    TimestampType["UPTIME"] = "event_uptime";
    TimestampType["DEPLOY"] = "event_deploy";
    TimestampType["UPDATE"] = "event_update";
})(TimestampType = exports.TimestampType || (exports.TimestampType = {}));
var TimestampPeriod;
(function (TimestampPeriod) {
    TimestampPeriod["START"] = "start";
    TimestampPeriod["END"] = "end";
})(TimestampPeriod = exports.TimestampPeriod || (exports.TimestampPeriod = {}));
exports.globalVariables = {
    execution_expe_dir: '',
    logDirTimestamp: '',
    assemblyName: '',
    reconfigurationName: '',
};
const allTimestampsDict = {};
const registerTimeValue = (timestampType, timestampPeriod) => {
    if (timestampPeriod === TimestampPeriod.START) {
        if (timestampType in allTimestampsDict) {
            throw new Error(`Register time value start error: ${timestampType} for ${TimestampPeriod.START} already registered`);
        }
        allTimestampsDict[timestampType] = {};
        allTimestampsDict[timestampType][TimestampPeriod.START] = new Date().getTime() / 1000;
    }
    else {
        if (!(timestampType in allTimestampsDict)) {
            throw new Error(`Register time value end error: ${timestampType} never registered`);
        }
        if (TimestampPeriod.END in allTimestampsDict[timestampType]) {
            throw new Error(`Register time value start error: ${timestampType} for ${TimestampPeriod.END} already registered`);
        }
        allTimestampsDict[timestampType][TimestampPeriod.END] = new Date().getTime() / 1000;
    }
};
exports.registerTimeValue = registerTimeValue;
const registerEndAllTimeValues = (logger) => {
    logger.info('Registing end times');
    for (const timestampName in allTimestampsDict) {
        if (!(TimestampPeriod.END in allTimestampsDict[timestampName])) {
            logger.info(`Register end time for: ${timestampName}`);
            allTimestampsDict[timestampName][TimestampPeriod.END] = new Date().getTime() / 1000;
        }
    }
    logger.info('Done');
};
exports.registerEndAllTimeValues = registerEndAllTimeValues;
const registerTimeValuesInFile = (logger) => {
    logger.info('Writing file here: ' + exports.globalVariables.logDirTimestamp);
    const reconfigurationDir = `${exports.globalVariables.execution_expe_dir}/${exports.globalVariables.reconfigurationName}`;
    const fileName = `${reconfigurationDir}/${exports.globalVariables.assemblyName}_${exports.globalVariables.logDirTimestamp}.yaml`;
    const yamlStr = YAML.stringify(allTimestampsDict);
    try {
        if (!fs_1.default.existsSync(reconfigurationDir))
            fs_1.default.mkdirSync(reconfigurationDir);
        // eslint-disable-next-line no-empty
    }
    catch (_a) { }
    fs_1.default.writeFileSync(fileName, yamlStr);
    logger.info('Done writing file');
};
exports.registerTimeValuesInFile = registerTimeValuesInFile;
const getOptions = (defaults) => yargs.options({
    deploymentName: {
        alias: 'n',
        default: defaults.deploymentName || 'deployment',
        description: 'Name of the deployment (used for identification with other deployments).',
    },
    deploymentHost: {
        alias: 'dh',
        default: defaults.deploymentHost || '0.0.0.0',
        description: 'Host of the µs deployment service.',
    },
    deploymentPort: {
        alias: 'dp',
        default: defaults.deploymentPort || 19952,
        description: 'Port of the µs deployment service.',
    },
    resourcesHost: {
        alias: 'rh',
        default: defaults.deploymentHost || '127.0.0.1',
        description: 'Host of the µs resources service.',
    },
    resourcesPort: {
        alias: 'rp',
        default: defaults.resourcesPort || 19951,
        description: 'Port of the µs resources service.',
    },
    heartbeatInterval: {
        alias: 'hi',
        default: defaults.heartbeatInterval || 5,
        description: 'Heartbeat interval on connections between deployments in seconds.',
    },
    logLevel: {
        alias: 'v',
        default: defaults.logLevel || 'info',
        description: 'Log level: "fatal", "error", "warn", "info", "debug", or "trace". Only affects default logger.',
    },
}).argv;
let exitCode = 0;
const setExitCode = (newExitCode) => {
    exitCode = newExitCode;
};
exports.setExitCode = setExitCode;
const runDeployment = (initOperation, operations, nextAction, options = {}) => {
    const opts = getOptions(options || {});
    _1.setLogLevel(opts.logLevel);
    const logger = options.logger || _1.newLogger('runtime');
    logger.info('running deployment');
    const setup = () => __awaiter(void 0, void 0, void 0, function* () {
        const [resourcesService, deploymentService] = yield Promise.all([
            _1.startResourcesService(opts.resourcesHost, opts.resourcesPort, logger.child({ c: 'resources service' })),
            _1.startDeploymentService(opts.deploymentHost, opts.deploymentPort, logger.child({ c: 'deployment service' })),
        ]);
        const initialized = hareactive_1.sinkFuture();
        const offersRuntime = yield _1.startOffersRuntime(deploymentService, resourcesService, initialized, opts.deploymentName, opts.heartbeatInterval, logger.child({ c: 'offers runtime' }));
        const [stackActions, completed] = _1.reactionLoop(initOperation, operations, nextAction(offersRuntime.inboundOfferUpdates), logger.child({ c: 'reaction loop' }));
        hareactive_1.runNow(hareactive_1.performStream(stackActions)
            .flatMap((actions) => hareactive_1.accum(() => true, false, actions))
            .flatMap(hareactive_1.when)).subscribe(() => initialized.resolve());
        const finalStack = yield hareactive_1.toPromise(completed);
        logger.info('wait everything');
        yield Promise.all([
            resourcesService.stop(),
            deploymentService.stop(),
            offersRuntime.stop(),
        ]);
        logger.info('end of run deployment');
        return finalStack;
    });
    return setup()
        .catch((err) => {
        logger.error(err, 'Deployment error');
        process.exit(1);
    })
        .finally(() => {
        exports.registerEndAllTimeValues(logger);
        exports.registerTimeValuesInFile(logger);
        logger.info('---------------------- Going to sleep --------------------------------\n');
        if (!options.disableExit)
            process.exit(exitCode);
    });
};
exports.runDeployment = runDeployment;
