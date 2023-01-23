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
const grpc = __importStar(require("@grpc/grpc-js"));
const rpc = __importStar(require("@mjuz/grpc-protos"));
const src_1 = require("../src");
const empty_pb_1 = require("google-protobuf/google/protobuf/empty_pb");
const ts_mockito_1 = require("ts-mockito");
describe('deployment service', () => {
    let deploymentService;
    let deploymentClient;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        deploymentService = yield src_1.startDeploymentService('127.0.0.1', 19952, ts_mockito_1.instance(ts_mockito_1.mock()));
        deploymentClient = new rpc.DeploymentClient('127.0.0.1:19952', grpc.credentials.createInsecure());
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield deploymentClient.close();
        yield deploymentService.stop();
    }));
    test('start and stop', () => {
        // Intended to be empty
    });
    test('offer', () => __awaiter(void 0, void 0, void 0, function* () {
        const offer = new rpc.DeploymentOffer();
        const received = new Promise((resolve) => deploymentService.offerUpdated.subscribe((receivedOffer) => resolve(expect(receivedOffer).toEqual(offer.toObject()))));
        const response = new Promise((resolve, reject) => deploymentClient.offer(offer, (error, response) => error ? reject(error) : resolve(response)));
        yield expect(response).resolves.toEqual(new empty_pb_1.Empty());
        yield received;
    }));
    test('release offer', () => __awaiter(void 0, void 0, void 0, function* () {
        const offer = new rpc.DeploymentOffer();
        const received = new Promise((resolve) => deploymentService.offerWithdrawn.subscribe((t) => {
            const [receivedOffer, cb] = t;
            resolve(expect(receivedOffer).toEqual(offer.toObject()));
            cb();
        }));
        const response = new Promise((resolve, reject) => deploymentClient.releaseOffer(offer, (error, response) => error ? reject(error) : resolve(response)));
        yield expect(response).resolves.toEqual(new empty_pb_1.Empty());
        yield received;
    }));
});
