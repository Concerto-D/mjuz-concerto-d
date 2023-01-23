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
exports.startOffersRuntime = exports.resendOffersOnConnect = exports.accumRemotes = void 0;
const hareactive_1 = require("@funkia/hareactive");
const io_1 = require("@funkia/io");
const grpc = __importStar(require("@grpc/grpc-js"));
const rpc = __importStar(require("@mjuz/grpc-protos"));
const struct_pb_1 = require("google-protobuf/google/protobuf/struct_pb");
const empty_pb_1 = require("google-protobuf/google/protobuf/empty_pb");
const utils_1 = require("./utils");
const constants_1 = require("@grpc/grpc-js/build/src/constants");
const accumRemotes = (upsert, remove) => hareactive_1.accumFrom(([change, remote], remotes) => {
    const update = Object.assign({}, remotes);
    if (remote.id in remotes) {
        const [oldRemote, client] = remotes[remote.id];
        if (change === 'remove' ||
            remote.host !== oldRemote.host ||
            remote.port !== oldRemote.port) {
            client.close();
            delete update[remote.id];
        }
    }
    if (change === 'upsert' && !(remote.id in update)) {
        const client = new rpc.DeploymentClient(`${remote.host}:${remote.port}`, grpc.credentials.createInsecure());
        update[remote.id] = [remote, client];
    }
    return update;
}, {}, hareactive_1.combine(remove.map((remote) => ['remove', remote]), upsert.map((remote) => ['upsert', remote])));
exports.accumRemotes = accumRemotes;
/**
 * @param remotes
 * @param trigger
 * @param logger
 * @return After each round all remotes with successful heartbeat
 */
const sendHeartbeats = (remotes, trigger, logger) => {
    const heartbeat = ([remote, client]) => new Promise((resolve) => {
        client.heartbeat(new empty_pb_1.Empty(), (err) => resolve(err ? undefined : remote.id));
    });
    const connectedRemotes = (remotes, remoteIdsConnected) => Object.entries(remotes)
        .filter(([remoteId]) => remoteIdsConnected.indexOf(remoteId) !== -1)
        .reduce((remotes, [remoteId, remote]) => {
        remotes[remoteId] = remote;
        return remotes;
    }, {});
    return hareactive_1.snapshot(remotes, trigger).map((remotes) => io_1.callP(() => {
        if (Object.keys(remotes).length > 0)
            logger.trace(`💌 Sending heartbeat to remote(s): ${Object.keys(remotes)}`);
        return Promise.all(Object.values(remotes).map(heartbeat));
    }).map((remoteIds) => {
        const remoteIdsConnected = remoteIds.filter((remoteId) => remoteId !== undefined);
        if (remoteIdsConnected.length > 0)
            logger.trace(`💚 Heartbeat successful for remote(s): ${remoteIdsConnected}`);
        const remoteIdsDisconnected = Object.keys(remotes).filter((remote) => !remoteIdsConnected.includes(remote));
        if (remoteIdsDisconnected.length > 0)
            logger.trace(`💔 Heartbeat failed for remote(s): ${remoteIdsDisconnected}`);
        return connectedRemotes(remotes, remoteIdsConnected);
    }));
};
const scanRemoteConnects = (connectedRemotes, logger) => connectedRemotes
    .scanFrom((connected, [, prevConnected]) => {
    const newConnects = Object.assign({}, connected);
    Object.keys(prevConnected).forEach((remoteId) => delete newConnects[remoteId]);
    return [newConnects, connected];
}, [{}, {}])
    .map((stream) => stream.map(([newConnects]) => io_1.call(() => {
    if (Object.keys(newConnects).length > 0)
        logger.debug(`Remotes connected: ${Object.keys(newConnects)}`);
}).flatMap(() => io_1.IO.of(newConnects))));
const accumOutboundOffers = (offerUpdate, offerWithdrawal, logger) => hareactive_1.accumFrom(([change, offer], offers) => {
    const update = Object.assign({}, offers);
    const offerId = `${offer.beneficiaryId}:${offer.name}`;
    if (change === 'upsert')
        update[offerId] = offer;
    else if (!(offerId in update))
        logger.warn(`Withdrawing unknown offer '${offer.name}' to remote '${offer.beneficiaryId}'`);
    else
        delete update[offerId];
    return update;
}, {}, hareactive_1.combine(offerUpdate.map((offer) => ['upsert', offer]), offerWithdrawal.map((offer) => ['remove', offer])));
/**
 * Protocol: Offer from remote updates the offer and resets the withdrawn flag. When a deployment reads the offer, it
 * sets the locked flag. Withdrawal from the offering deployment removes the offer, if it was not locked. If it was
 * locked, withdrawal sets the withdrawn flag. The deployment undeploys wishes to a withdrawn offer and confirms the
 * undeployment with its release. On release, the offer is removed, if the withdrawn flag is set.
 *
 * Any withdrawal should be delayed until the first deployment round completed to ensure all locked offers exist in the
 * state. Otherwise withdrawals may get confirmed (the offer released) even though the corresponding wish is still
 * deployed.
 *
 * @param offerUpdate
 * @param deployedOfferPolled
 * @param undeployedOfferPolled
 * @param offerWithdrawal
 * @param offerReleased
 * @param logger
 */
const accumInboundOffers = (offerUpdate, deployedOfferPolled, undeployedOfferPolled, offerWithdrawal, offerReleased, logger) => hareactive_1.accumFrom(([change, offer], offers) => {
    var _a, _b, _c;
    const update = Object.assign({}, offers);
    const offerId = `${offer.origin}:${offer.name}`;
    switch (change) {
        case 'upsert':
            if (offerId in update) {
                update[offerId].withdrawn = false;
                update[offerId].offer = offer;
            }
            else {
                update[offerId] = {
                    deployed: false,
                    withdrawn: false,
                    offer: offer,
                };
            }
            break;
        case 'polledDeployed':
            if (offerId in update)
                update[offerId].deployed = true;
            // Case: after restart the offer was not renewed from the offering side, but the corresponding wish is already deployed
            else
                update[offerId] = {
                    deployed: true,
                    withdrawn: false,
                };
            break;
        case 'polledUndeployed':
            // Set deployed, if it is going to be deployed after this poll
            if (offerId in update &&
                !update[offerId].withdrawn &&
                ((_a = update[offerId].offer) === null || _a === void 0 ? void 0 : _a.offer) !== undefined)
                update[offerId].deployed = true;
            break;
        case 'withdraw':
            if (offerId in update)
                update[offerId].withdrawn = true;
            else
                update[offerId] = {
                    deployed: false,
                    withdrawn: true,
                };
            break;
        case 'release':
            if (offerId in update)
                if (update[offerId].withdrawn)
                    delete update[offerId];
                else
                    logger.warn(`Released offer '${offer.name}' from remote '${offer.origin}' that is not withdrawn (anymore?)`);
            else
                logger.warn(`Released unknown offer ${offerId}`);
            break;
    }
    logger.trace(`Inbound offer '${offer.name}' from remote '${offer.origin}' after ${change}: ` +
        `deployed ${(_b = update[offerId]) === null || _b === void 0 ? void 0 : _b.deployed}, withdrawn ${(_c = update[offerId]) === null || _c === void 0 ? void 0 : _c.withdrawn}`);
    return update;
}, {}, hareactive_1.combine(offerUpdate.map((offer) => ['upsert', offer]), deployedOfferPolled.map((offer) => ['polledDeployed', offer]), undeployedOfferPolled.map((offer) => ['polledUndeployed', offer]), offerWithdrawal.map((offer) => ['withdraw', offer]), offerReleased.map((offer) => ['release', offer])));
const toRpcDeploymentOffer = (offer, deploymentName) => new rpc.DeploymentOffer()
    .setOrigin(deploymentName)
    .setName(offer.name)
    .setOffer(struct_pb_1.Value.fromJavaScript(offer.offer || null));
const directOfferForward = (offerUpdated, remotes, deploymentName, logger) => hareactive_1.snapshotWith((offer, remotes) => [remotes[offer.beneficiaryId], offer], remotes, offerUpdated)
    .filter(([t]) => t !== undefined)
    .map(([[, remote], offer]) => {
    const sendOffer = (resolve, reject) => remote.offer(toRpcDeploymentOffer(offer, deploymentName), (error) => error ? reject(error) : resolve(offer));
    return io_1.callP(() => new Promise(sendOffer));
})
    .map((sendOfferOp) => sendOfferOp.map((sentOffer) => logger.debug(sentOffer, `Directly forwarded offer '${sentOffer.name}' to remote '${sentOffer.beneficiaryId}'`)))
    .map((sentOffer) => io_1.catchE((error) => io_1.IO.of(logger.debug(error, 'Directly forwarding offer failed')), sentOffer));
const resendOffersOnConnect = (offers, connects, deploymentName, logger) => hareactive_1.snapshotWith((remotes, offers) => Object.values(offers)
    .filter((offer) => offer.beneficiaryId in remotes)
    .map((offer) => io_1.call(() => {
    remotes[offer.beneficiaryId][1].offer(toRpcDeploymentOffer(offer, deploymentName), (err) => {
        if (err)
            logger.warn(err, `Failed to resend offer '${offer.name}' to remote '${offer.beneficiaryId}'`);
        else {
            console.log('FORWARING OFFER');
            console.log(offer, deploymentName);
        }
    });
}))
    .reduce((a, b) => a.flatMap(() => b), io_1.IO.of(undefined)), offers, connects);
exports.resendOffersOnConnect = resendOffersOnConnect;
const offerWithdrawalSend = (remotes, connects, withdrawals, deploymentName, logger) => withdrawals.map(([offer, cb]) => {
    const withdrawalSends = hareactive_1.producerStream((push) => {
        const withdrawRemote = remotes.flatMap((remotes) => {
            const waitingMsg = `Waiting for remote '${offer.beneficiaryId}' to reconnect and release withdrawn offer '${offer.name}'`;
            const logWaiting = () => push(hareactive_1.Future.of(io_1.call(() => logger.info(waitingMsg))));
            const withdraw = io_1.call(() => {
                remotes[offer.beneficiaryId][1].releaseOffer(toRpcDeploymentOffer(offer, deploymentName), (err) => {
                    if ((err === null || err === void 0 ? void 0 : err.code) === constants_1.Status.UNAVAILABLE) {
                        logWaiting();
                        push(hareactive_1.runNow(hareactive_1.sample(withdrawOnConnect)));
                    }
                    else {
                        // Stop recursion
                        withdrawalSends.deactivate();
                        cb(err);
                    }
                });
            });
            const withdrawOnConnect = hareactive_1.nextOccurrenceFrom(connects.filter((remotes) => offer.beneficiaryId in remotes)).map((f) => f.flatMap(() => hareactive_1.runNow(hareactive_1.sample(withdrawRemote))));
            if (offer.beneficiaryId in remotes)
                return hareactive_1.Behavior.of(hareactive_1.Future.of(withdraw));
            logWaiting();
            return withdrawOnConnect;
        });
        push(hareactive_1.runNow(hareactive_1.sample(withdrawRemote)));
        return () => {
            // Intended to be empty
        };
    });
    return withdrawalSends;
});
const toDeploymentOffer = (wish) => {
    return {
        origin: wish.targetId,
        name: wish.name,
    };
};
const offerRelease = (offerWithdrawals, inboundOffers, offersStateInitialized) => hareactive_1.flatFuturesFrom(offerWithdrawals.map(([offer, cb]) => {
    const offerId = `${offer.origin}:${offer.name}`;
    const offerReleased = inboundOffers.map((offers) => !(offerId in offers) || !offers[offerId].deployed);
    return offersStateInitialized
        .flatMap(() => hareactive_1.runNow(hareactive_1.when(offerReleased)))
        .map(io_1.withEffects(cb));
}));
const wishPollAnswer = (polls, offers) => hareactive_1.snapshotWith(([wish, cb], offers) => {
    var _a;
    const offerId = `${wish.targetId}:${wish.name}`;
    const offer = offerId in offers
        ? offers[offerId].withdrawn
            ? { isWithdrawn: true }
            : { isWithdrawn: false, offer: (_a = offers[offerId].offer) === null || _a === void 0 ? void 0 : _a.offer }
        : { isWithdrawn: false };
    return io_1.call(() => cb(null, offer));
}, offers, polls);
const startOffersRuntime = (deployment, resources, 
// Indicating when first deployment finished => only after this the entire deployment
// state is reconstructed and offers can be safely released
initialized, deploymentName, heartbeatInterval, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const remoteUpserts = resources.remoteUpdated.combine(resources.remoteRefreshed);
    const remotes = hareactive_1.runNow(hareactive_1.sample(exports.accumRemotes(remoteUpserts, resources.remoteDeleted)));
    const heartbeatTrigger = utils_1.intervalStream(heartbeatInterval * 1000);
    const connectedRemotes = hareactive_1.runNow(hareactive_1.performStream(sendHeartbeats(remotes, heartbeatTrigger, logger)).flatMap(hareactive_1.flatFutures));
    const remoteConnects = hareactive_1.runNow(hareactive_1.sample(scanRemoteConnects(connectedRemotes, logger))
        .flatMap(hareactive_1.performStream)
        .flatMap(hareactive_1.flatFutures));
    // console.log(remoteConnects.);
    const outboundOffers = hareactive_1.runNow(hareactive_1.sample(accumOutboundOffers(hareactive_1.combine(resources.offerUpdated, resources.offerRefreshed), resources.offerWithdrawn.map(([o]) => o), logger)));
    const inboundOffers = hareactive_1.runNow(hareactive_1.sample(accumInboundOffers(deployment.offerUpdated, resources.wishPolled
        .filter(([w]) => w.isDeployed)
        .map(([w]) => toDeploymentOffer(w)), resources.wishPolled
        .filter(([w]) => !w.isDeployed)
        .map(([w]) => toDeploymentOffer(w)), deployment.offerWithdrawn.map(([o]) => o), resources.wishDeleted.map(toDeploymentOffer), logger)));
    // Forward new and updated offers directly to beneficiary
    const offersDirectForward = hareactive_1.runNow(hareactive_1.performStream(directOfferForward(resources.offerUpdated, remotes, deploymentName, logger)));
    // When a remote (re)connects resend all offers it is the beneficiary of
    const resendOffers = hareactive_1.runNow(hareactive_1.performStream(exports.resendOffersOnConnect(outboundOffers, remoteConnects, deploymentName, logger)));
    // Directly forward offer withdrawals to the beneficiary
    const sendOfferWithdrawals = offerWithdrawalSend(remotes, remoteConnects, resources.offerWithdrawn, deploymentName, logger).map((substream) => hareactive_1.runNow(hareactive_1.performStream(hareactive_1.runNow(hareactive_1.flatFutures(substream)))));
    sendOfferWithdrawals.activate(hareactive_1.tick());
    // Directly forward offer releases to withdrawing remote
    const sendOfferRelease = hareactive_1.runNow(hareactive_1.sample(offerRelease(deployment.offerWithdrawn, inboundOffers, initialized)).flatMap(hareactive_1.performStream));
    // Handle wish polls of own deployment
    const answerWishPolls = hareactive_1.runNow(
    // performStream(delayUntilSatisfiedWishPollAnswer(resources.wishPolled, inboundOffers))
    hareactive_1.performStream(wishPollAnswer(resources.wishPolled, inboundOffers)));
    const inboundOfferUpdates = hareactive_1.combine(deployment.offerUpdated.mapTo(undefined), deployment.offerWithdrawn.mapTo(undefined));
    const stop = () => __awaiter(void 0, void 0, void 0, function* () {
        heartbeatTrigger.deactivate();
        offersDirectForward.deactivate();
        resendOffers.deactivate();
        sendOfferWithdrawals.deactivate();
        sendOfferRelease.deactivate();
        answerWishPolls.deactivate();
    });
    return { inboundOfferUpdates, stop };
});
exports.startOffersRuntime = startOffersRuntime;
