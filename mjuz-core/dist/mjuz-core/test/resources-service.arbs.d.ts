import { Arbitrary } from 'fast-check';
import { Offer, Remote, RemoteOffer, Wish } from '../src';
export declare const remoteArb: Arbitrary<Remote>;
export declare const offerArb: Arbitrary<Offer<unknown>>;
export declare const wishArb: Arbitrary<Wish<unknown>>;
export declare const remoteOfferArb: Arbitrary<RemoteOffer<unknown>>;
