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
const fc = __importStar(require("fast-check"));
const util_1 = require("util");
const resources_1 = require("../src/resources");
const resourcesService = __importStar(require("../src/resources-service"));
const resources_service_arbs_1 = require("./resources-service.arbs");
describe('resources', () => {
    describe('offer', () => {
        const propsArb = fc.record({
            beneficiaryId: fc.string(),
            offerName: fc.string(),
            offer: fc.jsonObject(),
        });
        describe('check', () => {
            test('deployed', () => {
                const pred = (oldProps, newProps) => __awaiter(void 0, void 0, void 0, function* () {
                    const refreshOfferSpy = jest
                        .spyOn(resourcesService, 'refreshOffer')
                        .mockImplementation((offer) => __awaiter(void 0, void 0, void 0, function* () {
                        return expect(offer).toStrictEqual({
                            beneficiaryId: oldProps.beneficiaryId.toString(),
                            name: oldProps.offerName,
                            offer: oldProps.offer,
                        });
                    }));
                    const result = yield new resources_1.OfferProvider().check(oldProps, newProps);
                    expect(result).toStrictEqual({ inputs: newProps });
                    expect(refreshOfferSpy).toHaveBeenCalledTimes(1);
                    refreshOfferSpy.mockRestore();
                });
                return fc.assert(fc.asyncProperty(propsArb, propsArb, pred));
            });
            test('not deployed', () => {
                const pred = (oldProps, newProps) => __awaiter(void 0, void 0, void 0, function* () {
                    const refreshOfferSpy = jest.spyOn(resourcesService, 'refreshOffer');
                    const result = yield new resources_1.OfferProvider().check(oldProps, newProps);
                    expect(result).toStrictEqual({ inputs: newProps });
                    expect(refreshOfferSpy).toHaveBeenCalledTimes(0);
                });
                return fc.assert(fc.asyncProperty(fc.anything(), propsArb, pred));
            });
        });
        const mockUpdateOffer = (props) => jest.spyOn(resourcesService, 'updateOffer').mockImplementation((offer) => __awaiter(void 0, void 0, void 0, function* () {
            return expect(offer).toStrictEqual({
                beneficiaryId: props.beneficiaryId.toString(),
                name: props.offerName,
                offer: props.offer,
            });
        }));
        test('create', () => {
            const pred = (props) => __awaiter(void 0, void 0, void 0, function* () {
                const updateOfferSpy = mockUpdateOffer(props);
                expect(yield new resources_1.OfferProvider().create(props)).toEqual({
                    id: props.beneficiaryId.toString() + ':' + props.offerName,
                    outs: props,
                });
                expect(updateOfferSpy).toHaveBeenCalledTimes(1);
                updateOfferSpy.mockRestore();
            });
            return fc.assert(fc.asyncProperty(propsArb, pred));
        });
        test('update', () => {
            const pred = (id, oldProps, newProps) => __awaiter(void 0, void 0, void 0, function* () {
                const updateOfferSpy = mockUpdateOffer(newProps);
                expect(yield new resources_1.OfferProvider().update(id, oldProps, newProps)).toEqual({
                    outs: newProps,
                });
                expect(updateOfferSpy).toHaveBeenCalledTimes(1);
                updateOfferSpy.mockRestore();
            });
            return fc.assert(fc.asyncProperty(fc.string(), propsArb, propsArb, pred));
        });
        describe('diff', () => {
            test('unchanged', () => {
                const pred = (id, props) => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield new resources_1.OfferProvider().diff(id, props, props);
                    expect(result).toStrictEqual({
                        changes: false,
                        replaces: [],
                        deleteBeforeReplace: true,
                    });
                });
                return fc.assert(fc.asyncProperty(fc.string(), propsArb, pred));
            });
            test('update', () => {
                const pred = (id, [oldProps, newProps]) => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield new resources_1.OfferProvider().diff(id, oldProps, newProps);
                    expect(result).toStrictEqual({
                        changes: true,
                        replaces: [],
                        deleteBeforeReplace: true,
                    });
                });
                const propsArbs = fc
                    .tuple(propsArb, fc.jsonObject())
                    .filter(([props, offer]) => !util_1.isDeepStrictEqual(props.offer, offer))
                    .map(([props, offer]) => [props, Object.assign(Object.assign({}, props), { offer })]);
                return fc.assert(fc.asyncProperty(fc.string(), propsArbs, pred));
            });
            test('replace', () => {
                const pred = (id, [oldProps, newProps]) => __awaiter(void 0, void 0, void 0, function* () {
                    const results = yield new resources_1.OfferProvider().diff(id, oldProps, newProps);
                    expect(results).toStrictEqual({
                        changes: true,
                        replaces: oldProps.beneficiaryId !== newProps.beneficiaryId
                            ? oldProps.offerName !== newProps.offerName
                                ? ['beneficiaryId', 'offerName']
                                : ['beneficiaryId']
                            : ['offerName'],
                        deleteBeforeReplace: true,
                    });
                });
                const propsArbs = fc
                    .tuple(propsArb, fc.string(), fc.string())
                    .filter(([props, beneficiaryId, offerName]) => props.beneficiaryId !== beneficiaryId || props.offerName !== offerName)
                    .map(([props, beneficiaryId, offerName]) => [
                    props,
                    Object.assign(Object.assign({}, props), { beneficiaryId, offerName }),
                ]);
                return fc.assert(fc.asyncProperty(fc.string(), propsArbs, pred));
            });
        });
        test('delete', () => {
            const pred = (id, props) => __awaiter(void 0, void 0, void 0, function* () {
                const deleteOfferSpy = jest
                    .spyOn(resourcesService, 'deleteOffer')
                    .mockImplementation((offer) => __awaiter(void 0, void 0, void 0, function* () {
                    return expect(offer).toStrictEqual({
                        beneficiaryId: props.beneficiaryId,
                        name: props.offerName,
                    });
                }));
                yield new resources_1.OfferProvider().delete(id, props);
                expect(deleteOfferSpy).toHaveBeenCalledTimes(1);
                deleteOfferSpy.mockRestore();
            });
            return fc.assert(fc.asyncProperty(fc.string(), propsArb, pred));
        });
    });
    describe('remote connection', () => {
        const propsArb = fc.record({
            remoteId: fc.string(),
            host: fc.string(),
            port: fc.nat(),
        });
        describe('check', () => {
            test('deployed', () => {
                const pred = (oldProps, newProps) => __awaiter(void 0, void 0, void 0, function* () {
                    const refreshRemoteSpy = jest
                        .spyOn(resourcesService, 'refreshRemote')
                        .mockImplementation((remote) => __awaiter(void 0, void 0, void 0, function* () {
                        return expect(remote).toStrictEqual({
                            id: oldProps.remoteId,
                            host: oldProps.host,
                            port: oldProps.port,
                        });
                    }));
                    const result = yield new resources_1.RemoteConnectionProvider().check(oldProps, newProps);
                    expect(result).toStrictEqual({ inputs: newProps });
                    expect(refreshRemoteSpy).toHaveBeenCalledTimes(1);
                    refreshRemoteSpy.mockRestore();
                });
                return fc.assert(fc.asyncProperty(propsArb, propsArb, pred));
            });
            test('not deployed', () => {
                const pred = (oldProps, newProps) => __awaiter(void 0, void 0, void 0, function* () {
                    const refreshRemoteSpy = jest.spyOn(resourcesService, 'refreshRemote');
                    const result = yield new resources_1.RemoteConnectionProvider().check(oldProps, newProps);
                    expect(result).toStrictEqual({ inputs: newProps });
                    expect(refreshRemoteSpy).toHaveBeenCalledTimes(0);
                });
                return fc.assert(fc.asyncProperty(fc.anything(), propsArb, pred));
            });
        });
        const mockUpdateRemote = (props) => jest.spyOn(resourcesService, 'updateRemote').mockImplementation((remote) => __awaiter(void 0, void 0, void 0, function* () {
            return expect(remote).toStrictEqual({
                id: props.remoteId,
                host: props.host,
                port: props.port,
            });
        }));
        test('create', () => {
            const pred = (props) => __awaiter(void 0, void 0, void 0, function* () {
                const updateRemoteSpy = mockUpdateRemote(props);
                expect(yield new resources_1.RemoteConnectionProvider().create(props)).toStrictEqual({
                    id: props.remoteId,
                    outs: props,
                });
                expect(updateRemoteSpy).toHaveBeenCalledTimes(1);
                updateRemoteSpy.mockRestore();
            });
            return fc.assert(fc.asyncProperty(propsArb, fc.boolean(), pred));
        });
        test('update', () => {
            const pred = (id, oldProps, newProps) => __awaiter(void 0, void 0, void 0, function* () {
                const updateRemoteSpy = mockUpdateRemote(newProps);
                const result = yield new resources_1.RemoteConnectionProvider().update(id, oldProps, newProps);
                expect(result).toStrictEqual({ outs: newProps });
                expect(updateRemoteSpy).toHaveBeenCalledTimes(1);
                updateRemoteSpy.mockRestore();
            });
            return fc.assert(fc.asyncProperty(fc.string(), propsArb, propsArb, fc.boolean(), pred));
        });
        describe('diff', () => {
            test('unchanged', () => {
                const pred = (id, props) => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield new resources_1.RemoteConnectionProvider().diff(id, props, props);
                    expect(result).toStrictEqual({
                        changes: false,
                        replaces: [],
                        deleteBeforeReplace: true,
                    });
                });
                return fc.assert(fc.asyncProperty(fc.string(), propsArb, pred));
            });
            test('update', () => {
                const pred = (id, [oldProps, newProps]) => __awaiter(void 0, void 0, void 0, function* () {
                    const res = yield new resources_1.RemoteConnectionProvider().diff(id, oldProps, newProps);
                    expect(res).toStrictEqual({
                        changes: true,
                        replaces: [],
                        deleteBeforeReplace: true,
                    });
                });
                const propsArbs = fc
                    .tuple(propsArb, fc.string(), fc.nat())
                    .filter(([props, host, port]) => props.host !== host || props.port !== port)
                    .map(([props, host, port]) => [props, Object.assign(Object.assign({}, props), { host, port })]);
                return fc.assert(fc.asyncProperty(fc.string(), propsArbs, pred));
            });
            test('replace', () => {
                const pred = (id, [oldProps, newProps]) => __awaiter(void 0, void 0, void 0, function* () {
                    const res = yield new resources_1.RemoteConnectionProvider().diff(id, oldProps, newProps);
                    expect(res).toStrictEqual({
                        changes: true,
                        replaces: ['remoteId'],
                        deleteBeforeReplace: true,
                    });
                });
                const propsArbs = fc
                    .tuple(propsArb, fc.string())
                    .filter(([props, remoteId]) => props.remoteId !== remoteId)
                    .map(([props, remoteId]) => [props, Object.assign(Object.assign({}, props), { remoteId })]);
                return fc.assert(fc.asyncProperty(fc.string(), propsArbs, pred));
            });
        });
        test('delete', () => {
            const pred = (id, props) => __awaiter(void 0, void 0, void 0, function* () {
                const deleteRemoteSpy = jest
                    .spyOn(resourcesService, 'deleteRemote')
                    .mockImplementation((remote) => __awaiter(void 0, void 0, void 0, function* () {
                    return expect(remote).toStrictEqual({
                        id: props.remoteId,
                        host: props.host,
                        port: props.port,
                    });
                }));
                yield new resources_1.RemoteConnectionProvider().delete(id, props);
                expect(deleteRemoteSpy).toHaveBeenCalledTimes(1);
                deleteRemoteSpy.mockRestore();
            });
            return fc.assert(fc.asyncProperty(fc.string(), propsArb, pred));
        });
    });
    describe('wish', () => {
        const propsArb = fc
            .record({
            targetId: fc.string(),
            offerName: fc.string(),
            offer: fc.option(fc.jsonObject(), { nil: undefined }),
        })
            .map((wish) => {
            return Object.assign(Object.assign({}, wish), { isSatisfied: wish.offer !== undefined });
        });
        describe('check', () => {
            const pred = ([oldProps, newProps, offer, expectedInputs]) => __awaiter(void 0, void 0, void 0, function* () {
                const getWishSpy = jest
                    .spyOn(resourcesService, 'getWish')
                    .mockImplementation((wish) => __awaiter(void 0, void 0, void 0, function* () {
                    expect(wish).toStrictEqual({
                        targetId: newProps.targetId,
                        name: newProps.offerName,
                        isDeployed: typeof oldProps === 'object' &&
                            oldProps !== null &&
                            'isSatisfied' in oldProps
                            ? oldProps.isSatisfied
                            : false,
                    });
                    return offer;
                }));
                const result = yield new resources_1.WishProvider().check(oldProps, newProps);
                expectedInputs = Object.assign(Object.assign({}, newProps), expectedInputs);
                if (expectedInputs.offer === undefined)
                    delete expectedInputs.offer;
                expect(result).toStrictEqual({ inputs: expectedInputs });
                expect(getWishSpy).toHaveBeenCalledTimes(1);
                getWishSpy.mockRestore();
            });
            test('offer state known', () => {
                const previousProps = fc.oneof(fc.anything(), propsArb);
                const knownOffer = resources_service_arbs_1.remoteOfferArb.filter(({ isWithdrawn, offer }) => isWithdrawn || offer !== undefined);
                const arbs = fc
                    .tuple(previousProps, propsArb, knownOffer)
                    .map(([oldProps, newProps, offer]) => [
                    oldProps,
                    newProps,
                    offer,
                    {
                        isSatisfied: offer.offer !== undefined,
                        offer: offer.offer === undefined ? null : offer.offer,
                    },
                ]);
                return fc.assert(fc.asyncProperty(arbs, pred));
            });
            test('offer state unknown and deployed', () => {
                const arbs = fc.tuple(propsArb, propsArb).map(([oldProps, newProps]) => [
                    oldProps,
                    newProps,
                    { isWithdrawn: false },
                    {
                        isSatisfied: oldProps.isSatisfied,
                        offer: oldProps.offer === undefined ? null : oldProps.offer,
                    },
                ]);
                return fc.assert(fc.asyncProperty(arbs, pred));
            });
            test('offer state unknown and not deployed', () => {
                const arbs = fc
                    .tuple(fc.anything(), propsArb)
                    .map(([oldProps, newProps]) => [
                    oldProps,
                    newProps,
                    { isWithdrawn: false },
                    { isSatisfied: false, offer: null },
                ]);
                return fc.assert(fc.asyncProperty(arbs, pred));
            });
        });
        test('create', () => {
            const pred = (props) => __awaiter(void 0, void 0, void 0, function* () {
                expect(yield new resources_1.WishProvider().create(props)).toStrictEqual({
                    id: props.targetId + ':' + props.offerName,
                    outs: props,
                });
            });
            return fc.assert(fc.asyncProperty(propsArb, pred));
        });
        describe('diff', () => {
            test('unchanged', () => {
                const pred = (id, props) => __awaiter(void 0, void 0, void 0, function* () {
                    const result = yield new resources_1.WishProvider().diff(id, props, props);
                    expect(result).toStrictEqual({
                        changes: false,
                        replaces: [],
                        deleteBeforeReplace: true,
                    });
                });
                return fc.assert(fc.asyncProperty(fc.string(), propsArb, pred));
            });
            test('update', () => {
                const pred = (id, [oldProps, newProps]) => __awaiter(void 0, void 0, void 0, function* () {
                    const res = yield new resources_1.WishProvider().diff(id, oldProps, newProps);
                    expect(res).toStrictEqual({
                        changes: true,
                        replaces: [],
                        deleteBeforeReplace: true,
                    });
                });
                const propsArbs = fc
                    .tuple(propsArb, fc.jsonObject())
                    .filter(([props, offer]) => props.isSatisfied && !util_1.isDeepStrictEqual(props.offer, offer))
                    .map(([props, offer]) => [props, Object.assign(Object.assign({}, props), { offer })]);
                return fc.assert(fc.asyncProperty(fc.string(), propsArbs, pred));
            });
            test('replace', () => {
                const pred = (id, [oldProps, newProps]) => __awaiter(void 0, void 0, void 0, function* () {
                    const res = yield new resources_1.WishProvider().diff(id, oldProps, newProps);
                    expect(res).toStrictEqual({
                        changes: true,
                        replaces: [
                            ...(oldProps.targetId === newProps.targetId ? [] : ['targetId']),
                            ...(oldProps.offerName === newProps.offerName ? [] : ['offerName']),
                            ...(oldProps.isSatisfied === newProps.isSatisfied
                                ? []
                                : ['isSatisfied']),
                        ],
                        deleteBeforeReplace: true,
                    });
                });
                const propsArbs = fc
                    .tuple(propsArb, fc.string(), fc.string(), fc.boolean())
                    .filter(([props, targetId, offerName, isSatisfied]) => props.targetId !== targetId ||
                    props.offerName !== offerName ||
                    props.isSatisfied !== isSatisfied)
                    .map(([props, targetId, offerName, isSatisfied]) => [
                    props,
                    Object.assign(Object.assign({}, props), { targetId, offerName, isSatisfied }),
                ]);
                return fc.assert(fc.asyncProperty(fc.string(), propsArbs, pred));
            });
        });
        test('update', () => {
            const pred = (id, oldProps, newProps) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield new resources_1.WishProvider().update(id, oldProps, newProps);
                expect(result).toStrictEqual({ outs: newProps });
            });
            return fc.assert(fc.asyncProperty(fc.string(), propsArb, propsArb, pred));
        });
        test('delete', () => {
            const pred = (id, props) => __awaiter(void 0, void 0, void 0, function* () {
                const wishDeletedSpy = jest
                    .spyOn(resourcesService, 'wishDeleted')
                    .mockImplementation((wish) => __awaiter(void 0, void 0, void 0, function* () {
                    expect(wish).toStrictEqual({
                        targetId: props.targetId,
                        name: props.offerName,
                        isDeployed: true,
                    });
                }));
                yield new resources_1.WishProvider().delete(id, props);
                expect(wishDeletedSpy).toHaveBeenCalledTimes(props.isSatisfied ? 1 : 0);
                wishDeletedSpy.mockRestore();
            });
            return fc.assert(fc.asyncProperty(fc.string(), propsArb, pred));
        });
    });
});
