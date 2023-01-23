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
exports.startResourcesService = exports.wishDeleted = exports.getWish = exports.deleteOffer = exports.refreshOffer = exports.updateOffer = exports.deleteRemote = exports.refreshRemote = exports.updateRemote = exports.toRpcRemoteOffer = exports.fromRpcRemoteOffer = exports.toRpcWish = exports.fromRpcWish = exports.toRpcOffer = exports.fromRpcOffer = exports.toRpcRemote = exports.fromRpcRemote = void 0;
const hareactive_1 = require("@funkia/hareactive");
const grpc = __importStar(require("@grpc/grpc-js"));
const empty_pb_1 = require("google-protobuf/google/protobuf/empty_pb");
const rpc = __importStar(require("@mjuz/grpc-protos"));
const service_utils_1 = require("./service-utils");
const struct_pb_1 = require("google-protobuf/google/protobuf/struct_pb");
const fromRpcRemote = (remote) => remote.toObject();
exports.fromRpcRemote = fromRpcRemote;
const toRpcRemote = (remote) => new rpc.Remote().setId(remote.id).setHost(remote.host).setPort(remote.port);
exports.toRpcRemote = toRpcRemote;
const fromRpcOffer = (offer) => {
    var _a;
    return {
        name: offer.getName(),
        beneficiaryId: offer.getBeneficiaryid(),
        offer: (_a = offer.getOffer()) === null || _a === void 0 ? void 0 : _a.toJavaScript(),
    };
};
exports.fromRpcOffer = fromRpcOffer;
const toRpcOffer = (offer) => {
    const o = new rpc.Offer().setName(offer.name).setBeneficiaryid(offer.beneficiaryId);
    if (offer.offer !== undefined)
        o.setOffer(struct_pb_1.Value.fromJavaScript(offer.offer));
    return o;
};
exports.toRpcOffer = toRpcOffer;
const fromRpcWish = (wish) => {
    return {
        targetId: wish.getTargetid(),
        name: wish.getName(),
        isDeployed: wish.getIsdeployed(),
    };
};
exports.fromRpcWish = fromRpcWish;
const toRpcWish = (wish) => new rpc.Wish().setTargetid(wish.targetId).setName(wish.name).setIsdeployed(wish.isDeployed);
exports.toRpcWish = toRpcWish;
const fromRpcRemoteOffer = (remoteOffer) => {
    var _a;
    return {
        isWithdrawn: remoteOffer.getIswithdrawn(),
        offer: (_a = remoteOffer.getOffer()) === null || _a === void 0 ? void 0 : _a.toJavaScript(),
    };
};
exports.fromRpcRemoteOffer = fromRpcRemoteOffer;
const toRpcRemoteOffer = (remoteOffer) => {
    const ro = new rpc.RemoteOffer().setIswithdrawn(remoteOffer.isWithdrawn);
    if (remoteOffer.offer !== undefined)
        ro.setOffer(struct_pb_1.Value.fromJavaScript(remoteOffer.offer));
    return ro;
};
exports.toRpcRemoteOffer = toRpcRemoteOffer;
let resourcesClientHost;
let resourcesClientPort;
const resourcesClientRpc = (callFunction) => new Promise((resolve, reject) => {
    const client = new rpc.ResourcesClient(`${resourcesClientHost}:${resourcesClientPort}`, grpc.credentials.createInsecure());
    callFunction(client, (error, res) => {
        client.close();
        error ? reject(error) : resolve(res);
    });
});
const updateRemote = (remote) => resourcesClientRpc((client, cb) => client.updateRemote(exports.toRpcRemote(remote), (err) => cb(err)));
exports.updateRemote = updateRemote;
const refreshRemote = (remote) => resourcesClientRpc((client, cb) => client.refreshRemote(exports.toRpcRemote(remote), (err) => cb(err)));
exports.refreshRemote = refreshRemote;
const deleteRemote = (remote) => resourcesClientRpc((client, cb) => client.deleteRemote(exports.toRpcRemote(remote), (err) => cb(err)));
exports.deleteRemote = deleteRemote;
const updateOffer = (offer) => resourcesClientRpc((client, cb) => client.updateOffer(exports.toRpcOffer(offer), (err) => cb(err)));
exports.updateOffer = updateOffer;
const refreshOffer = (offer) => resourcesClientRpc((client, cb) => client.refreshOffer(exports.toRpcOffer(offer), (err) => cb(err)));
exports.refreshOffer = refreshOffer;
const deleteOffer = (offer) => resourcesClientRpc((client, cb) => client.deleteOffer(exports.toRpcOffer(offer), (err) => cb(err)));
exports.deleteOffer = deleteOffer;
const getWish = (wish) => resourcesClientRpc((client, cb) => client.getWish(exports.toRpcWish(wish), (err, ro) => cb(err, exports.fromRpcRemoteOffer(ro))));
exports.getWish = getWish;
const wishDeleted = (wish) => resourcesClientRpc((client, cb) => client.wishDeleted(exports.toRpcWish(wish), (err) => cb(err)));
exports.wishDeleted = wishDeleted;
const resourceService = (logger) => {
    class ResourcesServer {
        updateRemote(call, cb) {
            const remote = call.request;
            logger.info(remote, `Remote '${remote.getId()}' created`);
            remoteUpdated.push(exports.fromRpcRemote(remote));
            cb(null, new empty_pb_1.Empty());
        }
        refreshRemote(call, cb) {
            const remote = call.request;
            logger.info(remote, `Remote '${remote.getId()}' refreshed`);
            remoteRefreshed.push(exports.fromRpcRemote(remote));
            cb(null, new empty_pb_1.Empty());
        }
        deleteRemote(call, cb) {
            const remote = call.request;
            logger.info(remote, `Remote '${remote.getId()}' deleted`);
            remoteDeleted.push(exports.fromRpcRemote(remote));
            cb(null, new empty_pb_1.Empty());
        }
        updateOffer(call, cb) {
            const offer = call.request;
            logger.info(offer, `Offer '${offer.getName()}' to remote '${offer.getBeneficiaryid()}' updated`);
            offerUpdated.push(exports.fromRpcOffer(offer));
            cb(null, new empty_pb_1.Empty());
        }
        refreshOffer(call, cb) {
            const offer = call.request;
            logger.info(offer, `Offer '${offer.getName()}' to remote '${offer.getBeneficiaryid()}' refreshed`);
            offerRefreshed.push(exports.fromRpcOffer(offer));
            cb(null, new empty_pb_1.Empty());
        }
        deleteOffer(call, cb) {
            const offer = call.request;
            logger.info(offer, `Withdrawing offer '${offer.getName()}' to remote '${offer.getBeneficiaryid()}'`);
            offerWithdrawn.push([exports.fromRpcOffer(offer), (error) => cb(error, new empty_pb_1.Empty())]);
        }
        getWish(call, cb) {
            const wish = call.request;
            logger.info(wish, `Polling wish for offer '${wish.getName()}' from remote '${wish.getTargetid()}'`);
            wishPolled.push([exports.fromRpcWish(wish), (err, ro) => cb(err, exports.toRpcRemoteOffer(ro))]);
        }
        wishDeleted(call, cb) {
            const wish = call.request;
            logger.info(wish, `Wish  for offer '${wish.getName()}' from remote '${wish.getTargetid()}' deleted`);
            wishDeleted.push(exports.fromRpcWish(wish));
            cb(null, new empty_pb_1.Empty());
        }
    }
    const remoteUpdated = hareactive_1.sinkStream();
    const remoteRefreshed = hareactive_1.sinkStream();
    const remoteDeleted = hareactive_1.sinkStream();
    const offerUpdated = hareactive_1.sinkStream();
    const offerRefreshed = hareactive_1.sinkStream();
    const offerWithdrawn = hareactive_1.sinkStream();
    const wishPolled = hareactive_1.sinkStream();
    const wishDeleted = hareactive_1.sinkStream();
    return {
        server: new ResourcesServer(),
        remoteUpdated,
        remoteRefreshed,
        remoteDeleted,
        offerUpdated,
        offerRefreshed,
        offerWithdrawn,
        wishPolled,
        wishDeleted,
    };
};
const startResourcesService = (host, port, logger) => __awaiter(void 0, void 0, void 0, function* () {
    resourcesClientHost = host;
    resourcesClientPort = port;
    const service = resourceService(logger);
    const stopService = yield service_utils_1.startService('resources', rpc.ResourcesService, service.server, host, port, logger);
    return Object.assign(Object.assign({}, service), { stop: stopService });
});
exports.startResourcesService = startResourcesService;
