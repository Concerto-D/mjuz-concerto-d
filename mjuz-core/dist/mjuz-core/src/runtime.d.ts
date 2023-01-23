import { IO } from '@funkia/io';
import { Behavior, Future, Stream } from '@funkia/hareactive';
import { Action } from '.';
import { Level, Logger } from 'pino';
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
