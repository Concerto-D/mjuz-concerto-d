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
exports.remoteOfferArb = exports.wishArb = exports.offerArb = exports.remoteArb = void 0;
const fc = __importStar(require("fast-check"));
exports.remoteArb = fc.record({
    id: fc.string(),
    host: fc.string(),
    port: fc.nat(),
});
exports.offerArb = fc.record({
    beneficiaryId: fc.string(),
    name: fc.string(),
    offer: fc.option(fc.jsonObject(), { nil: undefined }),
});
exports.wishArb = fc.record({
    targetId: fc.string(),
    name: fc.string(),
    isDeployed: fc.boolean(),
});
exports.remoteOfferArb = fc
    .record({
    isWithdrawn: fc.boolean(),
    offer: fc.option(fc.jsonObject(), { nil: undefined }),
})
    .filter(({ isWithdrawn, offer }) => offer === undefined || !isWithdrawn);
