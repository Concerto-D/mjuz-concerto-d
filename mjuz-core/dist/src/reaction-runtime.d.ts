import { Behavior, Future, Stream } from '@funkia/hareactive';
import { IO } from '@funkia/io';
import { Logger } from 'pino';
declare type FinalAction = 'terminate' | 'destroy';
export declare type Action = 'deploy' | FinalAction;
/**
 * Starts sensing for next action after first moment, but resolves the action future not before the second moment. If
 * the next action was sensed before the second moment, the action future is directly resolved at the second moment.
 * Otherwise it is resolved on the first triggered action after the second moment.
 * @param stateChanges When fired at least once, deploy action shall be performed.
 * @param terminateTrigger When triggered, deployment shall be terminated. Supersedes deploy actions.
 * @param destroyTrigger When triggered, deployment shall be destroyed. Supersedes deploy and terminate actions.
 */
export declare const nextAction: <T, U, V>(stateChanges: Stream<T>, terminateTrigger: Future<U>, destroyTrigger: Future<V>) => Behavior<Behavior<Future<Action>>>;
/**
 * Reactive main loop.
 * @param initOperation State initialization operation.
 * @param operations Maps each action to a function of the current state to the action's operation.
 * @param nextAction Evaluates subsequent actions. First moment is sampled when current action is started, second moment
 * is sampled when current action completed. Future is expected to resolve after the second moment.
 * @param logger
 * @return Stream of the IO operations and future that resolves with the final state after the final operation.
 */
export declare const reactionLoop: <S>(initOperation: IO<S>, operations: (action: Action) => (state: S) => IO<S>, nextAction: Behavior<Behavior<Future<Action>>>, logger: Logger) => [Stream<IO<S>>, Future<S>];
export {};
