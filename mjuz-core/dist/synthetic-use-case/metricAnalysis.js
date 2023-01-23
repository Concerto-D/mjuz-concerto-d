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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDeployTime = exports.registerTimeValuesInFile = exports.registerEndAllTimeValues = exports.registerTimeValue = exports.goToSleep = exports.initTimeLogDir = exports.globalVariables = exports.TimestampPeriod = exports.TimestampType = void 0;
const core_1 = require("@mjuz/core");
const fs = __importStar(require("fs"));
const YAML = __importStar(require("yaml"));
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
    assemblyName: ''
};
const allTimestampsDict = {};
const initTimeLogDir = (assemblyName, g5k_execution_params_dir, logDirTimestamp) => {
    fs.mkdirSync(g5k_execution_params_dir);
    exports.globalVariables.assemblyName = assemblyName;
    if (logDirTimestamp !== null) {
        exports.globalVariables.logDirTimestamp = logDirTimestamp;
    }
    else {
        const dateNow = new Date();
        let year = dateNow.getFullYear();
        let month = ("0" + (dateNow.getMonth() + 1)).slice(-2);
        let day = ("0" + dateNow.getDate()).slice(-2);
        let hour = ("0" + dateNow.getHours()).slice(-2);
        let minute = ("0" + dateNow.getMinutes()).slice(-2);
        let seconds = ("0" + dateNow.getSeconds()).slice(-2);
        exports.globalVariables.logDirTimestamp = `${year}-${month}-${day}_${hour}-${minute}-${seconds}`;
    }
};
exports.initTimeLogDir = initTimeLogDir;
const goToSleep = (newExitCode) => {
    core_1.setExitCode(newExitCode);
    process.kill(process.pid, 3);
};
exports.goToSleep = goToSleep;
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
const registerEndAllTimeValues = () => {
    console.log("GOT HERE");
    for (const timestampName in allTimestampsDict) {
        if (!(TimestampPeriod.END in allTimestampsDict[timestampName])) {
            allTimestampsDict[timestampName][TimestampPeriod.END] = new Date().getTime() / 1000;
        }
    }
};
exports.registerEndAllTimeValues = registerEndAllTimeValues;
const registerTimeValuesInFile = () => {
    console.log("Writing file here: " + exports.globalVariables.logDirTimestamp);
    const fileName = `${exports.globalVariables.execution_expe_dir}/${exports.globalVariables.assemblyName}_${exports.globalVariables.logDirTimestamp}.yaml`;
    const yamlStr = YAML.stringify(allTimestampsDict);
    fs.writeFileSync(fileName, yamlStr);
    console.log("Done writing file");
};
exports.registerTimeValuesInFile = registerTimeValuesInFile;
const computeDeployTime = (assembly_name, transitions_times_file) => {
    const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
    const transitions_times_assembly = transitions_times["transitions_times"][assembly_name];
    return transitions_times_assembly["t_sa"]
        + transitions_times_assembly["t_sc"].reduce((x, y) => x + y, 0) // Sum of the list
        + transitions_times_assembly["t_sr"];
};
exports.computeDeployTime = computeDeployTime;
