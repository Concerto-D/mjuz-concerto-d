"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionLoop = exports.nextAction = void 0;
const hareactive_1 = require("@funkia/hareactive");
const io_1 = require("@funkia/io");
const isFinalAction = (v) => {
    return ['terminate', 'destroy'].indexOf(v) >= 0;
};
/**
 * Starts sensing for next action after first moment, but resolves the action future not before the second moment. If
 * the next action was sensed before the second moment, the action future is directly resolved at the second moment.
 * Otherwise it is resolved on the first triggered action after the second moment.
 * @param stateChanges When fired at least once, deploy action shall be performed.
 * @param terminateTrigger When triggered, deployment shall be terminated. Supersedes deploy actions.
 * @param destroyTrigger When triggered, deployment shall be destroyed. Supersedes deploy and terminate actions.
 */
const nextAction = (stateChanges, terminateTrigger, destroyTrigger) => hareactive_1.nextOccurrenceFrom(stateChanges).map((stateChange) => {
    console.log("next action");
    const deploy = stateChange.mapTo('deploy');
    const terminate = terminateTrigger.mapTo('terminate');
    const destroy = destroyTrigger.mapTo('destroy');
    return hareactive_1.stepTo('noop', deploy)
        .flatMap((action) => hareactive_1.stepTo(action, terminate))
        .flatMap((action) => hareactive_1.stepTo(action, destroy))
        .map((action) => action !== 'noop' ? hareactive_1.Future.of(action) : destroy.combine(terminate).combine(deploy));
});
exports.nextAction = nextAction;
/**
 * Reactive main loop.
 * @param initOperation State initialization operation.
 * @param operations Maps each action to a function of the current state to the action's operation.
 * @param nextAction Evaluates subsequent actions. First moment is sampled when current action is started, second moment
 * is sampled when current action completed. Future is expected to resolve after the second moment.
 * @param logger
 * @return Stream of the IO operations and future that resolves with the final state after the final operation.
 */
const reactionLoop = (initOperation, operations, nextAction, logger) => {
    const completed = hareactive_1.sinkFuture();
    const actions = hareactive_1.producerStream((push) => {
        const recurse = (bufferingNextAction, state) => io_1.callP(() => hareactive_1.toPromise(hareactive_1.runNow(hareactive_1.sample(bufferingNextAction)))).flatMap((action) => io_1.call(() => hareactive_1.runNow(hareactive_1.sample(nextAction))).flatMap((bufferingNextAction) => io_1.call(() => logger.info(`Starting ${action}`))
            .flatMap(() => operations(action)(state))
            .flatMap((newState) => io_1.call(() => {
            logger.info(`Completed ${action}`);
            if (isFinalAction(action)) {
                actions.deactivate(true);
                completed.resolve(newState);
            }
            else {
                logger.info(`Waiting for next action`);
                push(recurse(bufferingNextAction, newState));
            }
            return newState;
        }))));
        const init = io_1.call(() => logger.info('Initializing'))
            .flatMap(() => initOperation)
            .flatMap((state) => {
            logger.info('Completed initializing');
            return recurse(hareactive_1.Behavior.of(hareactive_1.Future.of('deploy')), state);
        });
        push(init);
        return () => {
            // Intended to be empty
        };
    });
    return [actions, completed];
};
exports.reactionLoop = reactionLoop;
