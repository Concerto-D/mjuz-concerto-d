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
const automation_1 = require("@pulumi/pulumi/automation");
const resources_1 = require("../src/resources");
const src_1 = require("../src");
const ts_mockito_1 = require("ts-mockito");
describe('resources', () => {
    let stack;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        return (stack = yield automation_1.LocalWorkspace.createOrSelectStack({
            stackName: 'testStack',
            projectName: 'testProject',
            program: src_1.emptyProgram,
        }, {
            // Important to make dynamic resources work properly in Automation API as of Pulumi 2.20.0
            // https://github.com/pulumi/pulumi/issues/5578
            workDir: '.',
        }));
    }));
    afterAll(() => stack.workspace.removeStack('testStack'));
    let resourcesService;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        return (resourcesService = yield src_1.startResourcesService('127.0.0.1', 19951, ts_mockito_1.instance(ts_mockito_1.mock())));
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield stack.destroy();
        yield resourcesService.stop();
    }));
    const expectOutput = (program, expectedOutput) => __awaiter(void 0, void 0, void 0, function* () {
        const { outputs } = yield stack.up({ program });
        expect(JSON.stringify(outputs)).toBe(expectedOutput);
    });
    describe('remote connection', () => {
        test('deploy, replace, update, unchanged', () => __awaiter(void 0, void 0, void 0, function* () {
            const remoteUpdatedCb = jest.fn();
            resourcesService.remoteUpdated.subscribe(remoteUpdatedCb);
            const remoteRefreshedCb = jest.fn();
            resourcesService.remoteRefreshed.subscribe(remoteRefreshedCb);
            const remoteDeletedCb = jest.fn();
            resourcesService.remoteDeleted.subscribe(remoteDeletedCb);
            const expectActions = (updated, refreshed, deleted) => {
                expect(remoteUpdatedCb.mock.calls.length).toBe(updated);
                expect(remoteRefreshedCb.mock.calls.length).toBe(refreshed);
                expect(remoteDeletedCb.mock.calls.length).toBe(deleted);
            };
            // deploy
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('testRemote', {});
                return { r };
            }), '{"r":{"value":{"host":"127.0.0.1","id":"testRemote","port":19952,"remoteId":"testRemote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::remote-connection$testRemote"},"secret":false}}');
            expectActions(1, 0, 0);
            // replace
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('testRemote', { remoteId: 'testRemote2' });
                return { r };
            }), '{"r":{"value":{"host":"127.0.0.1","id":"testRemote2","port":19952,"remoteId":"testRemote2","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::remote-connection$testRemote"},"secret":false}}');
            expectActions(2, 1, 1);
            // update
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('testRemote', {
                    remoteId: 'testRemote2',
                    port: 123,
                });
                return { r };
            }), '{"r":{"value":{"host":"127.0.0.1","id":"testRemote2","port":123,"remoteId":"testRemote2","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::remote-connection$testRemote"},"secret":false}}');
            expectActions(3, 2, 1);
            // no update
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('testRemote', {
                    remoteId: 'testRemote2',
                    port: 123,
                });
                return { r };
            }), '{"r":{"value":{"host":"127.0.0.1","id":"testRemote2","port":123,"remoteId":"testRemote2","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::remote-connection$testRemote"},"secret":false}}');
            expectActions(3, 3, 1);
        }));
    });
    describe('offer', () => {
        test('deploy, replace, unchanged, update', () => __awaiter(void 0, void 0, void 0, function* () {
            const offerUpdatedCb = jest.fn();
            resourcesService.offerUpdated.subscribe(offerUpdatedCb);
            const offerRefreshedCb = jest.fn();
            resourcesService.offerRefreshed.subscribe(offerRefreshedCb);
            const offerDeletedCb = jest.fn().mockImplementation(([, cb]) => __awaiter(void 0, void 0, void 0, function* () { return cb(null); }));
            resourcesService.offerWithdrawn.subscribe(offerDeletedCb);
            const expectActions = (updated, refreshed, deleted) => {
                expect(offerUpdatedCb.mock.calls.length).toBe(updated);
                expect(offerRefreshedCb.mock.calls.length).toBe(refreshed);
                expect(offerDeletedCb.mock.calls.length).toBe(deleted);
            };
            // deploy
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('1stRemote', {});
                const o = new resources_1.Offer('2ndRemote:testOffer', {
                    beneficiary: r,
                    offerName: 'testOffer',
                    offer: { a: 1 },
                });
                return { o };
            }), '{"o":{"value":{"beneficiaryId":"1stRemote","id":"1stRemote:testOffer","offer":{"a":1},"offerName":"testOffer","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::offer$2ndRemote:testOffer"},"secret":false}}');
            expectActions(1, 0, 0);
            // replace
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('2ndRemote', {});
                const o = new resources_1.Offer('2ndRemote:testOffer', {
                    beneficiary: r,
                    offerName: 'testOffer',
                    offer: { a: 1 },
                });
                return { o };
            }), '{"o":{"value":{"beneficiaryId":"2ndRemote","id":"2ndRemote:testOffer","offer":{"a":1},"offerName":"testOffer","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::offer$2ndRemote:testOffer"},"secret":false}}');
            expectActions(2, 1, 1);
            // no update with alternative constructor
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('2ndRemote', {});
                const o = new resources_1.Offer(r, 'testOffer', { a: 1 });
                return { o };
            }), '{"o":{"value":{"beneficiaryId":"2ndRemote","id":"2ndRemote:testOffer","offer":{"a":1},"offerName":"testOffer","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::offer$2ndRemote:testOffer"},"secret":false}}');
            expectActions(2, 2, 1);
            // update
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('2ndRemote', {});
                const o = new resources_1.Offer(r, 'testOffer', { a: [true, 'b'] });
                return { o };
            }), '{"o":{"value":{"beneficiaryId":"2ndRemote","id":"2ndRemote:testOffer","offer":{"a":[true,"b"]},"offerName":"testOffer","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::offer$2ndRemote:testOffer"},"secret":false}}');
            expectActions(3, 3, 1);
        }));
    });
    describe('wish', () => {
        const wishPolledCb = jest.fn();
        const wishDeletedCb = jest.fn();
        const expectActions = (polled, deleted) => {
            expect(wishPolledCb.mock.calls.length).toBe(polled);
            expect(wishDeletedCb.mock.calls.length).toBe(deleted);
        };
        beforeEach(() => {
            wishPolledCb.mockClear();
            resourcesService.wishPolled.subscribe(wishPolledCb);
            wishDeletedCb.mockClear();
            resourcesService.wishDeleted.subscribe(wishDeletedCb);
        });
        test('deploy satisfied wish, replace, unchanged, update', () => __awaiter(void 0, void 0, void 0, function* () {
            let offerValue = { a: 1 };
            wishPolledCb.mockImplementation(([, cb]) => __awaiter(void 0, void 0, void 0, function* () { return cb(null, { isWithdrawn: false, offer: offerValue }); }));
            // deploy
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('1stRemote', {});
                const w = new resources_1.Wish('2ndRemote:testWish', {
                    target: r,
                    offerName: 'testWish',
                });
                return { w };
            }), '{"w":{"value":{"id":"1stRemote:testWish","isSatisfied":true,"offer":{"a":1},"offerName":"testWish","targetId":"1stRemote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$2ndRemote:testWish"},"secret":false}}');
            expectActions(1, 0);
            // replace
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('2ndRemote', {});
                const w = new resources_1.Wish('2ndRemote:testWish', {
                    target: r,
                    offerName: 'testWish',
                });
                return { w };
            }), '{"w":{"value":{"id":"2ndRemote:testWish","isSatisfied":true,"offer":{"a":1},"offerName":"testWish","targetId":"2ndRemote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$2ndRemote:testWish"},"secret":false}}');
            expectActions(3, 1);
            // no update with alternative constructor
            offerValue = undefined;
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('2ndRemote', {});
                const w = new resources_1.Wish(r, 'testWish');
                return { w };
            }), '{"w":{"value":{"id":"2ndRemote:testWish","isSatisfied":true,"offer":{"a":1},"offerName":"testWish","targetId":"2ndRemote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$2ndRemote:testWish"},"secret":false}}');
            expectActions(4, 1);
            // update
            offerValue = { a: [true, 'b'] };
            yield expectOutput(() => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('2ndRemote', {});
                const w = new resources_1.Wish(r, 'testWish');
                return { w };
            }), '{"w":{"value":{"id":"2ndRemote:testWish","isSatisfied":true,"offer":{"a":[true,"b"]},"offerName":"testWish","targetId":"2ndRemote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$2ndRemote:testWish"},"secret":false}}');
            expectActions(5, 1);
        }));
        test('unsatisfied wish, unchanged, satisfied, unsatisfied', () => __awaiter(void 0, void 0, void 0, function* () {
            const offer = { isWithdrawn: false };
            wishPolledCb.mockImplementation(([, cb]) => __awaiter(void 0, void 0, void 0, function* () { return cb(null, offer); }));
            const program = () => __awaiter(void 0, void 0, void 0, function* () {
                const r = new resources_1.RemoteConnection('remote', {});
                const w = new resources_1.Wish(r, 'testWish');
                return { w };
            });
            // unsatisfied
            yield expectOutput(program, '{"w":{"value":{"id":"remote:testWish","isSatisfied":false,"offer":null,"offerName":"testWish","targetId":"remote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$remote:testWish"},"secret":false}}');
            expectActions(1, 0);
            // unchanged
            offer.isWithdrawn = true;
            yield expectOutput(program, '{"w":{"value":{"id":"remote:testWish","isSatisfied":false,"offer":null,"offerName":"testWish","targetId":"remote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$remote:testWish"},"secret":false}}');
            expectActions(2, 0);
            // satisfied
            offer.offer = { a: 1 };
            yield expectOutput(program, '{"w":{"value":{"id":"remote:testWish","isSatisfied":true,"offer":{"a":1},"offerName":"testWish","targetId":"remote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$remote:testWish"},"secret":false}}');
            expectActions(4, 0);
            // unsatisfied
            delete offer.offer;
            yield expectOutput(program, '{"w":{"value":{"id":"remote:testWish","isSatisfied":false,"offer":null,"offerName":"testWish","targetId":"remote","urn":"urn:pulumi:testStack::testProject::pulumi-nodejs:dynamic:Resource::wish$remote:testWish"},"secret":false}}');
            expectActions(6, 1);
        }));
    });
});
