"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pulumi_1 = require("../src/pulumi");
const io_1 = require("@funkia/io");
const automation_1 = require("@pulumi/pulumi/automation");
const ts_mockito_1 = require("ts-mockito");
describe('pulumi', () => {
    const logger = ts_mockito_1.instance(ts_mockito_1.mock());
    const getStackC = pulumi_1.getStack({
        stackName: 'testStack',
        projectName: 'testProject',
        program: pulumi_1.emptyProgram,
    }, {}, {}, logger);
    afterEach(() => {
        return automation_1.LocalWorkspace.create({}).then((workspace) => workspace.removeStack('testStack'));
    });
    describe('get stack', () => {
        test('Create stack', () => {
            return expect(io_1.runIO(getStackC).then((stack) => {
                return {
                    name: stack.stack.name,
                    isDeployed: stack.isDeployed,
                    isDestroyed: stack.isDestroyed,
                };
            })).resolves.toEqual({ name: 'testStack', isDeployed: false, isDestroyed: false });
        });
    });
    describe('destroy', () => {
        let stack = undefined;
        beforeEach(() => {
            return io_1.runIO(getStackC).then((s) => {
                stack = s;
                return s.stack.up({ program: pulumi_1.emptyProgram });
            });
        });
        test('Destroy stack', () => {
            return expect(io_1.runIO(pulumi_1.destroy(stack, logger)).then((stack) => {
                return {
                    name: stack.stack.name,
                    isDeployed: stack.isDeployed,
                    isDestroyed: stack.isDestroyed,
                };
            })).resolves.toEqual({ name: 'testStack', isDeployed: false, isDestroyed: true });
        });
    });
    describe('deploy', () => {
        let stack = undefined;
        beforeEach(() => {
            return io_1.runIO(getStackC).then((s) => (stack = s));
        });
        afterEach(() => {
            return stack.stack.destroy();
        });
        test('Deploy stack', () => {
            return expect(io_1.runIO(pulumi_1.deploy(stack, pulumi_1.emptyProgram, logger)).then((stack) => {
                return {
                    name: stack.stack.name,
                    isDeployed: stack.isDeployed,
                    isDestroyed: stack.isDestroyed,
                };
            })).resolves.toEqual({ name: 'testStack', isDeployed: true, isDestroyed: false });
        });
    });
});
