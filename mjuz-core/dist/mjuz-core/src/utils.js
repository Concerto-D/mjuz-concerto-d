"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showDictWithoutProvider = exports.intervalStream = exports.keepAlive = exports.sigterm = exports.sigquit = exports.sigint = void 0;
const hareactive_1 = require("@funkia/hareactive");
const sigint = () => {
    const f = hareactive_1.sinkFuture();
    process.on('SIGINT', () => {
        console.log('------------ QUITTING --------------');
        return f.resolve();
    });
    return f;
};
exports.sigint = sigint;
const sigquit = () => {
    const f = hareactive_1.sinkFuture();
    process.on('SIGQUIT', () => {
        console.log('------------ TERMINATING --------------');
        return f.resolve();
    });
    return f;
};
exports.sigquit = sigquit;
const sigterm = () => {
    const f = hareactive_1.sinkFuture();
    process.on('SIGTERM', () => f.resolve());
    return f;
};
exports.sigterm = sigterm;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const keepAlive = () => setInterval(() => { }, 2147483647);
exports.keepAlive = keepAlive;
const intervalStream = (intervalMs) => hareactive_1.producerStream((push) => {
    const intervalId = setInterval(() => push(undefined), intervalMs);
    return () => clearInterval(intervalId);
});
exports.intervalStream = intervalStream;
const showDictWithoutProvider = (dict) => {
    const dictToShowOffer = {};
    for (const k in dict) {
        if (k !== '__provider') {
            dictToShowOffer[k] = dict[k];
        }
    }
    console.log(dictToShowOffer);
};
exports.showDictWithoutProvider = showDictWithoutProvider;
