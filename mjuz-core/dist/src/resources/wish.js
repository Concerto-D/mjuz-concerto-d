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
exports.Wish = exports.WishProvider = void 0;
const pulumi_1 = require("@pulumi/pulumi");
const util_1 = require("util");
const resources_service_1 = require("../resources-service");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isWishProps = (v) => typeof v === 'object' &&
    v !== null &&
    typeof v.targetId === 'string' &&
    typeof v.offerName === 'string' &&
    typeof v.isSatisfied === 'boolean';
const toRsWish = (props) => {
    return {
        targetId: props.targetId,
        name: props.offerName,
        isDeployed: props.isSatisfied,
    };
};
class WishProvider {
    check(oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            const props = {
                targetId: newProps.targetId,
                offerName: newProps.offerName,
                isSatisfied: false,
                offer: null,
            };
            if (isWishProps(oldProps) && oldProps.isSatisfied) {
                props.isSatisfied = true;
                props.offer = oldProps.offer;
            }
            const currentOffer = yield resources_service_1.getWish(toRsWish(props));
            if (currentOffer.offer !== undefined) {
                props.isSatisfied = true;
                props.offer = currentOffer.offer;
            }
            else if (currentOffer.isWithdrawn) {
                props.isSatisfied = false;
                props.offer = null;
            }
            return { inputs: props };
        });
    }
    create(props) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                id: `${props.targetId}:${props.offerName}`,
                outs: props,
            };
        });
    }
    diff(id, oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            const replaces = ['targetId', 'offerName', 'isSatisfied'].filter((field) => oldProps[field] !== newProps[field]);
            const offerChanged = oldProps.isSatisfied &&
                newProps.isSatisfied &&
                !util_1.isDeepStrictEqual(oldProps.offer, newProps.offer);
            return {
                changes: replaces.length > 0 || offerChanged,
                replaces,
                deleteBeforeReplace: true,
            };
        });
    }
    update(id, oldProps, newProps) {
        return __awaiter(this, void 0, void 0, function* () {
            return { outs: newProps };
        });
    }
    delete(id, props) {
        return __awaiter(this, void 0, void 0, function* () {
            if (props.isSatisfied)
                yield resources_service_1.wishDeleted(toRsWish(props));
        });
    }
}
exports.WishProvider = WishProvider;
class Wish extends pulumi_1.dynamic.Resource {
    constructor(nameOrTarget, argsOrOfferName, opts) {
        const [name, targetId, offerName] = typeof nameOrTarget === 'string' && typeof argsOrOfferName !== 'string'
            ? [nameOrTarget, argsOrOfferName.target, argsOrOfferName.offerName]
            : [
                `${nameOrTarget.remoteId}:${argsOrOfferName}`,
                nameOrTarget,
                argsOrOfferName,
            ];
        const props = {
            targetId,
            offerName,
            isSatisfied: false,
            offer: null,
        };
        super(new WishProvider(), `wish$${name}`, props, opts);
    }
}
exports.Wish = Wish;
