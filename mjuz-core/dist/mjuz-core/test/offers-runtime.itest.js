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
const hareactive_1 = require("@funkia/hareactive");
const ts_mockito_1 = require("ts-mockito");
const src_1 = require("../src");
describe('offers runtime', () => {
    let deploymentService;
    let resourcesService;
    let offersRuntime;
    let remoteDeploymentService;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        deploymentService = {
            offerUpdated: hareactive_1.sinkStream(),
            offerWithdrawn: hareactive_1.sinkStream(),
            stop: () => __awaiter(void 0, void 0, void 0, function* () {
                // Intended to be empty
            }),
        };
        resourcesService = {
            remoteUpdated: hareactive_1.sinkStream(),
            remoteRefreshed: hareactive_1.sinkStream(),
            remoteDeleted: hareactive_1.sinkStream(),
            offerRefreshed: hareactive_1.sinkStream(),
            offerUpdated: hareactive_1.sinkStream(),
            offerWithdrawn: hareactive_1.sinkStream(),
            wishPolled: hareactive_1.sinkStream(),
            wishDeleted: hareactive_1.sinkStream(),
            stop: () => __awaiter(void 0, void 0, void 0, function* () {
                // Intended to be empty
            }),
        };
        offersRuntime = yield src_1.startOffersRuntime(deploymentService, resourcesService, hareactive_1.Future.of(undefined), 'test-deployment', 1, ts_mockito_1.instance(ts_mockito_1.mock()));
        remoteDeploymentService = yield src_1.startDeploymentService('127.0.0.1', 19953, ts_mockito_1.instance(ts_mockito_1.mock()));
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield offersRuntime.stop();
        yield remoteDeploymentService.stop();
    }));
    test('remote create, delete and directly forward offer', () => __awaiter(void 0, void 0, void 0, function* () {
        const receivedOffer = new Promise((resolve) => remoteDeploymentService.offerUpdated.subscribe((receivedOffer) => resolve(expect(receivedOffer).toEqual({
            origin: 'test-deployment',
            name: 'test',
            offer: { a: ['b', 'c'] },
        }))));
        resourcesService.remoteUpdated.push({ id: 'remote', host: '127.0.0.1', port: 19953 });
        resourcesService.offerUpdated.push({
            beneficiaryId: 'no-remote',
            name: 'test',
            offer: { a: ['b', 'c'] },
        });
        resourcesService.offerUpdated.push({
            beneficiaryId: 'remote',
            name: 'test',
            offer: { a: ['b', 'c'] },
        });
        yield receivedOffer;
        // Cleanup
        const deletedRemote = new Promise((resolve) => resourcesService.remoteDeleted.subscribe(() => resolve()));
        resourcesService.remoteDeleted.push({ id: 'remote', host: '127.0.0.1', port: 19953 });
        yield deletedRemote;
    }));
    test('resend offers on connect', () => __awaiter(void 0, void 0, void 0, function* () {
        yield remoteDeploymentService.stop();
        resourcesService.remoteUpdated.push({ id: 'remote', host: '127.0.0.1', port: 19953 });
        resourcesService.offerUpdated.push({
            beneficiaryId: 'remote',
            name: 'test',
            offer: { a: ['b', 'c'] },
        });
        remoteDeploymentService = yield src_1.startDeploymentService('127.0.0.1', 19953, ts_mockito_1.instance(ts_mockito_1.mock()));
        const receivedOffer = new Promise((resolve) => remoteDeploymentService.offerUpdated.subscribe((receivedOffer) => resolve(expect(receivedOffer).toEqual({
            origin: 'test-deployment',
            name: 'test',
            offer: { a: ['b', 'c'] },
        }))));
        yield receivedOffer;
    }));
    test('inbound offer updates', () => __awaiter(void 0, void 0, void 0, function* () {
        const threeUpdates = new Promise((resolve) => {
            let updates = 0;
            offersRuntime.inboundOfferUpdates.subscribe(() => {
                updates++;
                if (updates === 3)
                    resolve();
            });
        });
        deploymentService.offerUpdated.push({ origin: 'a', name: 'b', offer: 'c' });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        deploymentService.offerWithdrawn.push([{ origin: 'a', name: 'b', offer: 'c' }, () => { }]);
        deploymentService.offerUpdated.push({ origin: 'a', name: 'b', offer: 'c' });
        yield threeUpdates;
    }));
    const testWish = { targetId: 'remote', name: 'test', isDeployed: false };
    const testDeploymentOffer = { origin: 'remote', name: 'test' };
    const noCb = () => {
        // Intended to be empty
    };
    test('poll satisfied wish', () => __awaiter(void 0, void 0, void 0, function* () {
        deploymentService.offerUpdated.push(Object.assign(Object.assign({}, testDeploymentOffer), { offer: { fancy: ['array', 'val', 3] } }));
        yield new Promise((resolve) => resourcesService.wishPolled.push([
            testWish,
            (err, remoteOffer) => {
                expect(remoteOffer).toStrictEqual({
                    isWithdrawn: false,
                    offer: { fancy: ['array', 'val', 3] },
                });
                resolve();
            },
        ]));
    }));
    test('poll unsatisfied wish', () => __awaiter(void 0, void 0, void 0, function* () {
        yield new Promise((resolve) => resourcesService.wishPolled.push([
            testWish,
            (err, remoteOffer) => {
                expect(remoteOffer).toStrictEqual({
                    isWithdrawn: false,
                });
                resolve();
            },
        ]));
    }));
    test('poll withdrawn wish', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create and lock offer
        resourcesService.wishPolled.push([testWish, noCb]);
        // Withdrawal
        deploymentService.offerWithdrawn.push([testDeploymentOffer, noCb]);
        yield new Promise((resolve) => resourcesService.wishPolled.push([
            testWish,
            (err, remoteOffer) => {
                expect(remoteOffer).toStrictEqual({
                    isWithdrawn: true,
                });
                resolve();
            },
        ]));
    }));
    test('poll wish of released offer', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create and lock offer
        resourcesService.wishPolled.push([testWish, noCb]);
        // Withdrawal
        deploymentService.offerWithdrawn.push([testDeploymentOffer, noCb]);
        // Release
        resourcesService.wishDeleted.push(testWish);
        yield new Promise((resolve) => resourcesService.wishPolled.push([
            testWish,
            (err, remoteOffer) => {
                expect(remoteOffer).toStrictEqual({
                    isWithdrawn: false,
                });
                resolve();
            },
        ]));
    }));
    test('release not registered offer', () => __awaiter(void 0, void 0, void 0, function* () {
        yield new Promise((resolve) => deploymentService.offerWithdrawn.push([testDeploymentOffer, resolve]));
    }));
    test('release not locked offer', () => __awaiter(void 0, void 0, void 0, function* () {
        deploymentService.offerUpdated.push(testDeploymentOffer);
        yield new Promise((resolve) => deploymentService.offerWithdrawn.push([testDeploymentOffer, resolve]));
    }));
    test('release deployed offer', () => __awaiter(void 0, void 0, void 0, function* () {
        deploymentService.offerUpdated.push(Object.assign(Object.assign({}, testDeploymentOffer), { offer: 'val' }));
        yield new Promise((resolve) => resourcesService.wishPolled.push([
            testWish,
            (err, wish) => resolve(expect(wish === null || wish === void 0 ? void 0 : wish.isWithdrawn).toBe(false)),
        ]));
        const offerReleased = new Promise((resolve) => deploymentService.offerWithdrawn.push([testDeploymentOffer, resolve]));
        // Only work with correct semantics, not with delayed wish poll answer
        yield new Promise((resolve) => resourcesService.wishPolled.push([
            testWish,
            (err, wish) => resolve(expect(wish === null || wish === void 0 ? void 0 : wish.isWithdrawn).toBe(true)),
        ]));
        resourcesService.wishDeleted.push(testWish);
        yield offerReleased;
    }));
});
