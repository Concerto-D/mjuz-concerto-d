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
const fc = __importStar(require("fast-check"));
const resources_service_arbs_1 = require("./resources-service.arbs");
const ts_mockito_1 = require("ts-mockito");
describe('resources service', () => {
    let resourcesService;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        resourcesService = yield src_1.startResourcesService('127.0.0.1', 19951, ts_mockito_1.instance(ts_mockito_1.mock()));
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield resourcesService.stop();
    }));
    test('start and stop', () => {
        // Intended to be empty
    });
    const firstEvent = (stream) => new Promise((resolve) => stream.subscribe((firstEvent) => resolve(firstEvent)));
    const testRpc = (requestFn, requestArb, stream, responseArb) => __awaiter(void 0, void 0, void 0, function* () {
        const pred = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            const asyncReceive = firstEvent(stream);
            const asyncResponse = requestFn(request);
            const received = yield asyncReceive;
            let receivedVal, receivedCb;
            if (Array.isArray(received)) {
                [receivedVal, receivedCb] = received;
                receivedCb(null, response);
            }
            else
                receivedVal = received;
            expect(receivedVal).toEqual(request);
            expect(yield asyncResponse).toStrictEqual(response);
        });
        yield fc.assert(fc.asyncProperty(requestArb, responseArb ? responseArb : fc.constant(undefined), pred));
    });
    test('update remote', () => testRpc(src_1.updateRemote, resources_service_arbs_1.remoteArb, resourcesService.remoteUpdated));
    test('refresh remote', () => testRpc(src_1.refreshRemote, resources_service_arbs_1.remoteArb, resourcesService.remoteRefreshed));
    test('delete remote', () => testRpc(src_1.deleteRemote, resources_service_arbs_1.remoteArb, resourcesService.remoteDeleted));
    test('update offer', () => testRpc(src_1.updateOffer, resources_service_arbs_1.offerArb, resourcesService.offerUpdated));
    test('refresh offer', () => testRpc(src_1.refreshOffer, resources_service_arbs_1.offerArb, resourcesService.offerRefreshed));
    test('delete offer', () => testRpc(src_1.deleteOffer, resources_service_arbs_1.offerArb, resourcesService.offerWithdrawn));
    test('get wish', () => testRpc(src_1.getWish, resources_service_arbs_1.wishArb, resourcesService.wishPolled, resources_service_arbs_1.remoteOfferArb));
    test('wish deleted', () => testRpc(src_1.wishDeleted, resources_service_arbs_1.wishArb, resourcesService.wishDeleted));
});
