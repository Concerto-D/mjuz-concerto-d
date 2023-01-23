"use strict";
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
exports.operations = exports.destroy = exports.pulumiDestroy = exports.deploy = exports.pulumiUp = exports.getStack = exports.pulumiSetStackConfig = exports.pulumiCreateOrSelectStack = exports.emptyProgram = void 0;
const hareactive_1 = require("@funkia/hareactive");
const io_1 = require("@funkia/io");
const automation_1 = require("@pulumi/pulumi/automation");
const _1 = require(".");
const emptyProgram = () => __awaiter(void 0, void 0, void 0, function* () {
    // Empty program
});
exports.emptyProgram = emptyProgram;
exports.pulumiCreateOrSelectStack = io_1.withEffectsP((args, workspaceOptions) => automation_1.LocalWorkspace.createOrSelectStack(args, workspaceOptions));
exports.pulumiSetStackConfig = io_1.withEffectsP((stack, config) => stack.setAllConfig(config));
const getStack = (args, workspaceOptions, config, logger = _1.newLogger('pulumi')) => io_1.call(() => logger.debug(`Getting stack ${args.stackName}`))
    .flatMap(() => exports.pulumiCreateOrSelectStack(args, workspaceOptions))
    .flatMap((stack) => config ? exports.pulumiSetStackConfig(stack, config).map(() => stack) : io_1.IO.of(stack))
    .map((stack) => {
    logger.debug(`Completed getting stack ${stack.name}`);
    return { stack: stack, isDeployed: false, isDestroyed: false };
});
exports.getStack = getStack;
exports.pulumiUp = io_1.withEffectsP((stack, program, logger) => stack.up({
    program: program,
    onOutput: (m) => logger.trace(m.replace(/[\n\r]\s*$/g, '')),
}));
const deploy = (stack, targetState, logger) => io_1.call(() => logger.debug('Deploying stack'))
    .flatMap(() => exports.pulumiUp(stack.stack, targetState, logger))
    .map((res) => {
    logger.debug('Completed deploying stack', {
        summary: res.summary,
        outputs: res.outputs,
    });
    return {
        stack: stack.stack,
        isDeployed: true,
        isDestroyed: false,
    };
});
exports.deploy = deploy;
exports.pulumiDestroy = io_1.withEffectsP((stack, logger) => stack.destroy({ onOutput: (m) => logger.trace(m.replace(/[\n\r]\s*$/g, '')) }));
const destroy = (stack, logger) => stack.isDestroyed
    ? io_1.throwE('Stack terminated already')
    : io_1.call(() => logger.debug('Destroying stack'))
        .flatMap(() => exports.pulumiDestroy(stack.stack, logger))
        .map((res) => {
        logger.debug('Completed destroying stack', {
            summary: res.summary,
        });
        return {
            stack: stack.stack,
            isDeployed: false,
            isDestroyed: true,
        };
    });
exports.destroy = destroy;
const operations = (program, logger = _1.newLogger('pulumi')) => (action) => {
    const actionLogger = logger.child({
        action: action,
        id: Math.floor(Math.random() * 10000),
    });
    switch (action) {
        case 'deploy':
            return (stack) => exports.deploy(stack, hareactive_1.runNow(hareactive_1.sample(program)), actionLogger);
        case 'terminate':
            return (stack) => io_1.IO.of(stack);
        case 'destroy':
            return (stack) => exports.destroy(stack, actionLogger);
    }
};
exports.operations = operations;
