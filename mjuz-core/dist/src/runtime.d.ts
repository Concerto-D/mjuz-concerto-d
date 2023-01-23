import { IO } from '@funkia/io';
import { Behavior, Future, Stream } from '@funkia/hareactive';
import { Action } from '.';
import { Level, Logger } from 'pino';
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
    reconfigurationName: string;
};
export declare const registerTimeValue: (timestampType: TimestampType, timestampPeriod: TimestampPeriod) => void;
export declare const registerEndAllTimeValues: (logger: Logger) => void;
export declare const registerTimeValuesInFile: (logger: Logger) => void;
declare type RuntimeOptions = {
    deploymentName: string;
    deploymentHost: string;
    deploymentPort: number;
    heartbeatInterval: number;
    resourcesHost: string;
    resourcesPort: number;
    logLevel: Level;
};
export declare const setExitCode: (newExitCode: number) => void;
export declare const runDeployment: <S>(initOperation: IO<S>, operations: (action: Action) => (state: S) => IO<S>, nextAction: (offerUpdates: Stream<void>) => Behavior<Behavior<Future<Action>>>, options?: Partial<RuntimeOptions> & {
    logger?: Logger;
    disableExit?: true;
}) => Promise<S>;
export {};
