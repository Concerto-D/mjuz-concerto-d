export declare enum TimestampType {
    UPTIME = "event_uptime",
    DEPLOY = "event_deploy",
    UPDATE = "event_update"
}
export declare enum TimestampPeriod {
    START = "start",
    END = "end"
}
export declare const globalVariables: {
    execution_expe_dir: string;
    logDirTimestamp: string;
    assemblyName: string;
};
export declare const initTimeLogDir: (assemblyName: string, g5k_execution_params_dir: string, logDirTimestamp: string | null) => void;
export declare const goToSleep: (newExitCode: number) => void;
export declare const registerTimeValue: (timestampType: TimestampType, timestampPeriod: TimestampPeriod) => void;
export declare const registerEndAllTimeValues: () => void;
export declare const registerTimeValuesInFile: () => void;
export declare const computeDeployTime: (assembly_name: string, transitions_times_file: string) => number;
