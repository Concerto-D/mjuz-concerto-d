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
const io_1 = require("@funkia/io");
const hareactive_1 = require("@funkia/hareactive");
const pulumi = __importStar(require("@pulumi/pulumi/automation"));
const fc = __importStar(require("fast-check"));
const ts_mockito_1 = require("ts-mockito");
const src_1 = require("../src");
describe('pulumi', () => {
    const optionalArb = (arb, freq) => fc.option(arb, { nil: undefined, freq });
    const inlineProgramArgsArb = () => fc.record({
        stackName: fc.string(),
        projectName: fc.string(),
        program: fc.constant(src_1.emptyProgram),
    });
    const localWorkspaceOptionsArb = () => fc.constant({});
    const configMapArb = () => fc.dictionary(fc.string(), fc.record({
        value: fc.string(),
        secret: fc.oneof(fc.boolean(), fc.constant(undefined)),
    }));
    const stackArb = (stack) => fc.record({
        stack: fc.constant(stack),
        isDeployed: fc.boolean(),
        isDestroyed: fc.boolean(),
    });
    const stack = ts_mockito_1.instance(ts_mockito_1.mock(pulumi.Stack));
    const logger = ts_mockito_1.instance(ts_mockito_1.mock());
    test('getStack', () => {
        const pred = (progArgs, workspaceOptions, configMap) => {
            const mocks = [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                [io_1.call(() => { }), undefined],
                [src_1.pulumiCreateOrSelectStack(progArgs, workspaceOptions), stack],
            ];
            if (configMap)
                mocks.push([src_1.pulumiSetStackConfig(stack, configMap), stack]);
            io_1.testIO(src_1.getStack(progArgs, workspaceOptions, configMap, logger), mocks, {
                stack: stack,
                isDeployed: false,
                isDestroyed: false,
            });
        };
        fc.assert(fc.property(inlineProgramArgsArb(), optionalArb(localWorkspaceOptionsArb()), optionalArb(configMapArb()), pred));
    });
    test('deploy', () => {
        const pred = (stack) => {
            io_1.testIO(src_1.deploy(stack, src_1.emptyProgram, logger), [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                [io_1.call(() => { }), undefined],
                [src_1.pulumiUp(stack.stack, src_1.emptyProgram, logger), {}],
            ], {
                stack: stack.stack,
                isDeployed: true,
                isDestroyed: false,
            });
        };
        fc.assert(fc.property(stackArb(stack), pred));
    });
    test('destroy', () => {
        const pred = (stack) => {
            if (stack.isDestroyed)
                expect(() => io_1.testIO(src_1.destroy(stack, logger), [], undefined)).toThrow('Stack terminated already');
            else
                io_1.testIO(src_1.destroy(stack, logger), [
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    [io_1.call(() => { }), undefined],
                    [src_1.pulumiDestroy(stack.stack, logger), {}],
                ], {
                    stack: stack.stack,
                    isDeployed: false,
                    isDestroyed: true,
                });
        };
        fc.assert(fc.property(stackArb(stack), pred));
    });
    describe('operations', () => {
        const actions = src_1.operations(hareactive_1.Behavior.of(src_1.emptyProgram), logger);
        test('deploy', () => {
            const pred = (stack) => expect(JSON.stringify(actions('deploy')(stack))).toEqual(JSON.stringify(src_1.deploy(stack, src_1.emptyProgram, logger)));
            fc.assert(fc.property(stackArb(stack), pred));
        });
        test('terminate', () => {
            const pred = (stack) => expect(actions('terminate')(stack)).toEqual(io_1.IO.of(stack));
            fc.assert(fc.property(stackArb(stack), pred));
        });
        test('destroy', () => {
            const pred = (stack) => expect(JSON.stringify(actions('destroy')(stack))).toEqual(JSON.stringify(src_1.destroy(stack, logger)));
            fc.assert(fc.property(stackArb(stack), pred));
        });
    });
});
