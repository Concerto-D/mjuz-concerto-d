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
exports.startDeploymentService = exports.toDeploymentOffer = void 0;
const hareactive_1 = require("@funkia/hareactive");
const empty_pb_1 = require("google-protobuf/google/protobuf/empty_pb");
const rpc = __importStar(require("@mjuz/grpc-protos"));
const service_utils_1 = require("./service-utils");
const toDeploymentOffer = (offer) => {
    var _a;
    return {
        origin: offer.getOrigin(),
        name: offer.getName(),
        offer: (_a = offer.getOffer()) === null || _a === void 0 ? void 0 : _a.toJavaScript(),
    };
};
exports.toDeploymentOffer = toDeploymentOffer;
const deploymentService = (logger) => {
    class DeploymentServer {
        offer(call, cb) {
            const offer = call.request;
            logger.info(offer, `Received offer '${offer.getName()}' from remote '${offer.getOrigin()}`);
            cb(null, new empty_pb_1.Empty());
            offers.push(exports.toDeploymentOffer(offer));
        }
        releaseOffer(call, cb) {
            const offer = call.request;
            logger.info(offer, `Releasing offer '${offer.getName()}' from remote '${offer.getOrigin()}'`);
            releaseOffers.push([
                exports.toDeploymentOffer(offer),
                () => {
                    logger.info(offer, `Released offer '${offer.getName()}' from remote '${offer.getOrigin()}'`);
                    cb(null, new empty_pb_1.Empty());
                },
            ]);
        }
        heartbeat(call, cb) {
            cb(null, new empty_pb_1.Empty());
        }
    }
    const offers = hareactive_1.sinkStream();
    const releaseOffers = hareactive_1.sinkStream();
    return {
        server: new DeploymentServer(),
        offerUpdated: offers,
        offerWithdrawn: releaseOffers,
    };
};
const startDeploymentService = (host, port, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const service = deploymentService(logger);
    const stopService = yield service_utils_1.startService('deployment', rpc.DeploymentService, service.server, host, port, logger);
    return Object.assign(Object.assign({}, service), { stop: stopService });
});
exports.startDeploymentService = startDeploymentService;
