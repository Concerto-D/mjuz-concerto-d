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
exports.RemoteConnection = exports.RemoteConnectionProvider = void 0;
const pulumi_1 = require("@pulumi/pulumi");
const resources_service_1 = require("../resources-service");
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 19952;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRemoteConnectionProps = (v) => typeof v === 'object' &&
    v !== null &&
    typeof v.remoteId === 'string' &&
    typeof v.host === 'string' &&
    typeof v.port === 'number';
const toRemote = (props) => {
    return {
        id: props.remoteId,
        host: props.host,
        port: props.port,
    };
};
class RemoteConnectionProvider {
    check(oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isRemoteConnectionProps(oldProps))
                yield resources_service_1.refreshRemote(toRemote(oldProps));
            return { inputs: newProps };
        });
    }
    create(props) {
        return __awaiter(this, void 0, void 0, function* () {
            yield resources_service_1.updateRemote(toRemote(props));
            return { id: props.remoteId, outs: props };
        });
    }
    diff(id, oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                changes: ['remoteId', 'host', 'port'].filter((field) => oldProps[field] !== newProps[field]).length > 0,
                replaces: oldProps.remoteId !== newProps.remoteId ? ['remoteId'] : [],
                deleteBeforeReplace: true,
            };
        });
    }
    update(id, oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            yield resources_service_1.updateRemote(toRemote(newProps));
            return { outs: newProps };
        });
    }
    delete(id, props) {
        return __awaiter(this, void 0, void 0, function* () {
            yield resources_service_1.deleteRemote(toRemote(props));
        });
    }
}
exports.RemoteConnectionProvider = RemoteConnectionProvider;
class RemoteConnection extends pulumi_1.dynamic.Resource {
    constructor(name, args, opts) {
        const props = {
            remoteId: args.remoteId || name,
            host: args.host || DEFAULT_HOST,
            port: args.port || DEFAULT_PORT,
        };
        super(new RemoteConnectionProvider(), `remote-connection$${name}`, props, opts);
        this.remoteId = args.remoteId || name;
    }
}
exports.RemoteConnection = RemoteConnection;
