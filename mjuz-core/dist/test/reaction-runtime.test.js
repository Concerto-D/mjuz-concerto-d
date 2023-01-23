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
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const hareactive_1 = require("@funkia/hareactive");
const io_1 = require("@funkia/io");
const testing_1 = require("@funkia/hareactive/testing");
const fc = __importStar(require("fast-check"));
const ts_mockito_1 = require("ts-mockito");
const hareactive_arbs_1 = require("./hareactive.arbs");
describe('reaction runtime', () => {
    describe('next action', () => {
        const arbs = (constraints) => fc.tuple(fc.integer(), fc.nat()).chain(([t1, deltaT2]) => {
            const t2 = t1 + deltaT2 + 0.1;
            const [changesConstraints, terminateTriggerConstraints, destroyTriggerConstraints] = constraints(t1, t2);
            return fc.tuple(fc.constant(t1), // t1
            fc.constant(t2), // t2
            hareactive_arbs_1.streamArb(fc.anything(), changesConstraints), // changes
            hareactive_arbs_1.futureArb(fc.anything(), terminateTriggerConstraints), // terminate trigger
            hareactive_arbs_1.futureArb(fc.anything(), destroyTriggerConstraints) // destroy trigger
            );
        });
        test('no next action, if at most state changes before/at 1st moment', () => {
            const as = arbs((t1) => [{ maxTime: t1 }, {}, {}]);
            const pred = ([t1, t2, changes]) => {
                const na = src_1.nextAction(changes, hareactive_1.never, hareactive_1.never);
                testing_1.assertFutureEqual(testing_1.testAt(t2, testing_1.testAt(t1, na)), hareactive_1.never);
            };
            fc.assert(fc.property(as, pred));
        });
        test('deploy if change between 1st and 2nd moment and no terminate/destroy at/before t2', () => {
            const as = arbs((t1, t2) => [
                { minTime: t1 + 0.1, maxTime: t2, minEvents: 1 },
                { minTime: t2 + 0.1 },
                { minTime: t2 + 0.1 },
            ]);
            const pred = ([t1, t2, changes, terminate, destroy]) => {
                const na = src_1.nextAction(changes, terminate, destroy);
                testing_1.assertFutureEqual(testing_1.testAt(t2, testing_1.testAt(t1, na)), hareactive_1.Future.of('deploy'));
            };
            fc.assert(fc.property(as, pred));
        });
        test('terminate if terminate trigger before/at t2 and no destroy before/at t2', () => {
            const as = arbs((_, t2) => [{}, { maxTime: t2, freq: false }, { minTime: t2 + 0.1 }]);
            const pred = ([t1, t2, changes, terminate, destroy]) => {
                const na = src_1.nextAction(changes, terminate, destroy);
                testing_1.assertFutureEqual(testing_1.testAt(t2, testing_1.testAt(t1, na)), hareactive_1.Future.of('terminate'));
            };
            fc.assert(fc.property(as, pred));
        });
        test('destroy if destroy trigger before/at t2', () => {
            const as = arbs((_, t2) => [{}, {}, { maxTime: t2, freq: false }]);
            const pred = ([t1, t2, changes, terminate, destroy]) => {
                const na = src_1.nextAction(changes, terminate, destroy);
                testing_1.assertFutureEqual(testing_1.testAt(t2, testing_1.testAt(t1, na)), hareactive_1.Future.of('destroy'));
            };
            fc.assert(fc.property(as, pred));
        });
        test('first trigger after t2 wins', () => {
            const as = arbs((_, t2) => [
                { minTime: t2 + 0.1 },
                { minTime: t2 + 0.1, freq: false },
                { minTime: t2 + 0.1, freq: false },
            ]);
            const pred = ([t1, t2, changes, terminate, destroy]) => {
                const na = src_1.nextAction(changes, terminate, destroy);
                const triggersChrono = [
                    [destroy.model().time, 'destroy'],
                    [terminate.model().time, 'terminate'],
                    ...Object.values(changes.model()).map((e) => [Number(e.time), 'deploy']),
                ].sort((a, b) => a[0] - b[0]);
                testing_1.assertFutureEqual(testing_1.testAt(t2, testing_1.testAt(t1, na)), testing_1.testFuture(...triggersChrono[0]));
            };
            fc.assert(fc.property(as, pred));
        });
    });
    describe('reaction loop', () => {
        test('init, deploy n times and complete after first destroy or terminate', () => {
            const deployActionArb = fc.constant('deploy');
            const finalActionArb = fc.oneof(fc.constant('terminate'), fc.constant('destroy'));
            const pred = (nextActions) => __awaiter(void 0, void 0, void 0, function* () {
                const actions = [
                    'deploy',
                    ...nextActions.slice(0, nextActions.findIndex((a) => a !== 'deploy') + 1),
                ];
                let lastOpTime = -Infinity;
                const expectedOperations = actions.slice().reverse();
                const operations = (action) => (s) => {
                    lastOpTime = hareactive_1.getTime();
                    expect(action).toBe(expectedOperations.pop());
                    return io_1.IO.of(s + action);
                };
                const expectedNextActions = nextActions.slice().reverse();
                const nextAction = hareactive_1.fromFunction((t1) => hareactive_1.fromFunction((t2) => {
                    expect(t1).toEqual(lastOpTime);
                    expect(t2).toBeGreaterThan(t1);
                    const action = expectedNextActions.pop();
                    if (!action)
                        throw new Error('Unexpected invocation of nextAction');
                    else
                        return hareactive_1.Future.of(action);
                }));
                const logger = ts_mockito_1.instance(ts_mockito_1.mock());
                const [ops, completed] = src_1.reactionLoop(io_1.IO.of('I'), operations, nextAction, logger);
                const exec = hareactive_1.runNow(hareactive_1.performStream(ops).flatMap((s) => hareactive_1.stepper(hareactive_1.never, s)));
                yield hareactive_1.toPromise(completed);
                const finalState = yield hareactive_1.toPromise(hareactive_1.runNow(hareactive_1.sample(exec)));
                expect(finalState).toBe(`I${actions.join('')}`);
            });
            return fc.assert(fc.asyncProperty(fc.array(fc.frequency({ arbitrary: deployActionArb, weight: 10 }, { arbitrary: finalActionArb, weight: 1 }), { maxLength: 100 }), finalActionArb, (actions, lastAction) => __awaiter(void 0, void 0, void 0, function* () { return pred([...actions, lastAction]); })));
        });
    });
});
