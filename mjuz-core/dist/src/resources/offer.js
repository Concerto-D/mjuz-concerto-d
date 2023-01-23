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
exports.Offer = exports.OfferProvider = void 0;
const pulumi_1 = require("@pulumi/pulumi");
const resources_service_1 = require("../resources-service");
const util_1 = require("util");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isOfferProps = (v) => typeof v === 'object' &&
    v !== null &&
    typeof v.beneficiaryId === 'string' &&
    typeof v.offerName === 'string' &&
    'offer' in v;
const toRsOffer = (props) => {
    return {
        beneficiaryId: props.beneficiaryId,
        name: props.offerName,
        offer: props.offer,
    };
};
class OfferProvider {
    check(oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isOfferProps(oldProps))
                yield resources_service_1.refreshOffer(toRsOffer(oldProps));
            return { inputs: newProps };
        });
    }
    create(props) {
        return __awaiter(this, void 0, void 0, function* () {
            yield resources_service_1.updateOffer(toRsOffer(props));
            return { id: `${props.beneficiaryId}:${props.offerName}`, outs: props };
        });
    }
    diff(id, oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            const replaces = ['beneficiaryId', 'offerName'].filter((field) => oldProps[field] !== newProps[field]);
            const offerChanged = !util_1.isDeepStrictEqual(oldProps.offer, newProps.offer);
            return {
                changes: replaces.length > 0 || offerChanged,
                replaces: replaces,
                deleteBeforeReplace: true,
            };
        });
    }
    update(id, oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            yield resources_service_1.updateOffer(toRsOffer(newProps));
            return { outs: newProps };
        });
    }
    delete(id, props) {
        return __awaiter(this, void 0, void 0, function* () {
            yield resources_service_1.deleteOffer({ beneficiaryId: props.beneficiaryId, name: props.offerName });
        });
    }
}
exports.OfferProvider = OfferProvider;
class Offer extends pulumi_1.dynamic.Resource {
    constructor(nameOrBeneficiary, argsOrOfferName, optsOrOffer, opts) {
        const [name, props, opt] = typeof nameOrBeneficiary === 'string' && typeof argsOrOfferName !== 'string'
            ? [nameOrBeneficiary, argsOrOfferName, optsOrOffer]
            : [
                `${nameOrBeneficiary.remoteId}:${argsOrOfferName}`,
                {
                    beneficiary: nameOrBeneficiary,
                    offerName: argsOrOfferName,
                    offer: optsOrOffer,
                },
                opts,
            ];
        props.beneficiaryId = props.beneficiary;
        delete props.beneficiary;
        super(new OfferProvider(), `offer$${name}`, props, opt);
    }
}
exports.Offer = Offer;
