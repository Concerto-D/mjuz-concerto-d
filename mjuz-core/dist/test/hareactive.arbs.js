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
exports.streamArb = exports.futureArb = exports.occurringFutureArb = void 0;
const hareactive_1 = require("@funkia/hareactive");
const testing_1 = require("@funkia/hareactive/testing");
const fc = __importStar(require("fast-check"));
const occurringFutureArb = (valueArb, constraints = {}) => {
    const time = fc.double({
        next: true,
        min: constraints.minTime,
        max: constraints.maxTime,
        noNaN: true,
    });
    return fc.tuple(time, valueArb).map((t) => testing_1.testFuture(...t));
};
exports.occurringFutureArb = occurringFutureArb;
const futureArb = (value, constraints = {}) => constraints.freq === false
    ? exports.occurringFutureArb(value, constraints)
    : fc.option(exports.occurringFutureArb(value, constraints), {
        freq: constraints.freq,
        nil: hareactive_1.never,
    });
exports.futureArb = futureArb;
const streamArb = (valueArb, constraints = {}) => {
    const eventArb = fc
        .tuple(fc.double({
        next: true,
        min: constraints.minTime,
        max: constraints.maxTime,
        noNaN: true,
    }), valueArb)
        .filter(constraints.filterEvents || (() => true));
    return fc
        .array(eventArb, {
        minLength: constraints.minEvents,
        maxLength: constraints.maxEvents,
    }) // Stream array must be sorted for correct semantics
        .map((s) => s.sort((a, b) => a[0] - b[0]))
        .map(testing_1.testStreamFromArray);
};
exports.streamArb = streamArb;
