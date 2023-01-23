"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hareactive_1 = require("@funkia/hareactive");
const io_1 = require("@funkia/io");
const ts_mockito_1 = require("ts-mockito");
const src_1 = require("../src");
describe('runtime', () => {
    const operations = (action) => (s) => {
        return io_1.IO.of(s + action.slice(0, 3));
    };
    let remainingActions;
    test('run deployment', () => {
        const nextAction = hareactive_1.Behavior.of(hareactive_1.fromFunction(() => {
            const action = remainingActions[0];
            remainingActions = remainingActions.slice(1);
            return hareactive_1.Future.of(action);
        }));
        remainingActions = ['deploy', 'deploy', 'terminate', 'deploy'];
        const loggerMock = ts_mockito_1.mock();
        ['resources service', 'deployment service', 'offers runtime', 'reaction loop'].forEach((name) => ts_mockito_1.when(loggerMock.child(ts_mockito_1.deepEqual({ c: name }))).thenReturn(ts_mockito_1.instance(loggerMock)));
        return expect(src_1.runDeployment(io_1.IO.of('I'), operations, () => nextAction, {
            logger: ts_mockito_1.instance(loggerMock),
            disableExit: true,
        })).resolves.toBe('Idepdepdepter');
    });
});
