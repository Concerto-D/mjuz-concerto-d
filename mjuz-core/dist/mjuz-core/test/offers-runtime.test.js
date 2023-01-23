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
Object.defineProperty(exports, "__esModule", { value: true });
const hareactive_1 = require("@funkia/hareactive");
const testing_1 = require("@funkia/hareactive/testing");
const grpc = __importStar(require("@grpc/grpc-js"));
const fc = __importStar(require("fast-check"));
const ts_mockito_1 = require("ts-mockito");
const src_1 = require("../src");
const hareactive_arbs_1 = require("./hareactive.arbs");
const resources_service_arbs_1 = require("./resources-service.arbs");
jest.mock('@mjuz/grpc-protos', () => (Object.assign({}, jest.requireActual('@mjuz/grpc-protos'))));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mjuzProtos = require('@mjuz/grpc-protos');
// Fixes error in hareactive testing
hareactive_1.Behavior.of('');
describe('offers runtime', () => {
    describe('accumulate remotes', () => {
        it('has no remote upserted before t1, after t2, or also removed between t1 and t2', () => {
            const arbs = fc
                .tuple(fc.integer(), fc.nat())
                .chain(([t1, deltaT2]) => {
                const t2 = t1 + deltaT2 + 0.1;
                return fc.tuple(fc.constant([t1, t2]), fc.float(), hareactive_arbs_1.streamArb(resources_service_arbs_1.remoteArb), hareactive_arbs_1.streamArb(resources_service_arbs_1.remoteArb));
            })
                .chain(([[t1, t2], removeShift, upsert, remove]) => {
                const shiftedUpsert = upsert
                    .model()
                    .filter(({ time }) => time >= t1 && time < t2)
                    .map(({ time, value }) => [time + removeShift * (t2 - time), value]);
                const removeUpsert = testing_1.testStreamFromArray(shiftedUpsert);
                return fc.constant([t1, t2, upsert, remove.combine(removeUpsert)]);
            });
            const pred = ([t1, t2, upsert, remove]) => expect(testing_1.testAt(t2, testing_1.testAt(t1, src_1.accumRemotes(upsert, remove)))).toStrictEqual({});
            fc.assert(fc.property(arbs, pred));
        });
        it('has all upserted remotes', () => {
            const arbs = fc
                .tuple(fc.integer(), fc.nat())
                .chain(([t1, deltaT2]) => {
                const t2 = t1 + deltaT2 + 0.1;
                return fc.tuple(fc.constant([t1, t2]), hareactive_arbs_1.streamArb(resources_service_arbs_1.remoteArb, { minTime: t1, maxTime: t2 - 0.05 }));
            })
                .chain(([[t1, t2], upsert]) => fc.tuple(fc.constant(t1), fc.constant(t2), fc.constant(upsert), hareactive_arbs_1.streamArb(resources_service_arbs_1.remoteArb, {
                filterEvents: ([tRemove, removeRemote]) => upsert
                    .model()
                    .filter(({ time: tUpsert, value: upsertRemote }) => upsertRemote.id === removeRemote.id &&
                    tUpsert <= tRemove &&
                    tRemove <= t2).length === 0,
            })));
            const deploymentClientMock = ts_mockito_1.mock();
            const deploymentClientSpy = jest
                .spyOn(mjuzProtos, 'DeploymentClient')
                .mockReturnValue(ts_mockito_1.instance(deploymentClientMock));
            const pred = ([t1, t2, upsert, remove]) => {
                deploymentClientSpy.mockClear();
                ts_mockito_1.resetCalls(deploymentClientMock);
                const remotes = testing_1.testAt(t2, testing_1.testAt(t1, src_1.accumRemotes(upsert, remove)));
                const noRepetitionUpsert = upsert
                    .model()
                    .map(({ value }) => value)
                    .filter((upsert, i, model) => {
                    const prevUpsert = model
                        .slice(0, i)
                        .reverse()
                        .find((prevUpsert) => upsert.id === prevUpsert.id);
                    return (prevUpsert === undefined ||
                        prevUpsert.host !== upsert.host ||
                        prevUpsert.port !== upsert.port);
                });
                const latestUpsert = noRepetitionUpsert.filter((upsert, i, upserts) => upserts.slice(i + 1).find((laterUpsert) => laterUpsert.id === upsert.id) ===
                    undefined);
                // List of remotes correct
                expect(Object.keys(remotes).sort()).toEqual(latestUpsert.map((remote) => remote.id).sort());
                // Each remote with has latest configuration
                Object.entries(remotes).forEach(([remoteId, [remote]]) => expect(remote).toBe(latestUpsert.find((upsert) => upsert.id === remoteId)));
                // Deployment client setup for each non-repeated upsert
                expect(deploymentClientSpy).toBeCalledTimes(noRepetitionUpsert.length);
                noRepetitionUpsert.forEach((remote, i) => expect(deploymentClientSpy).nthCalledWith(i + 1, `${remote.host}:${remote.port}`, grpc.credentials.createInsecure()));
                // Close all unregistered clients
                const closedClients = noRepetitionUpsert.length - latestUpsert.length;
                ts_mockito_1.verify(deploymentClientMock.close()).times(closedClients);
            };
            fc.assert(fc.property(arbs, pred));
            deploymentClientSpy.mockRestore();
        });
    });
});
