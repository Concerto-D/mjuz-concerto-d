import { Stream } from '@funkia/hareactive';
import * as rpc from '@mjuz/grpc-protos';
import { Logger } from 'pino';
export declare type Remote = rpc.Remote.AsObject;
export declare const fromRpcRemote: (remote: rpc.Remote) => Remote;
export declare const toRpcRemote: (remote: Remote) => rpc.Remote;
export declare type Offer<O> = Omit<rpc.Offer.AsObject, 'beneficiaryid' | 'offer'> & {
    beneficiaryId: string;
    offer?: O;
};
export declare const fromRpcOffer: <O>(offer: rpc.Offer) => Offer<O>;
export declare const toRpcOffer: <O>(offer: Offer<O>) => rpc.Offer;
export declare type Wish<O> = {
    name: string;
    targetId: string;
    isDeployed: boolean;
};
export declare const fromRpcWish: <O>(wish: rpc.Wish) => Wish<O>;
export declare const toRpcWish: <O>(wish: Wish<O>) => rpc.Wish;
export declare type RemoteOffer<O> = {
    isWithdrawn: boolean;
    offer?: O;
};
export declare const fromRpcRemoteOffer: <O>(remoteOffer: rpc.RemoteOffer) => RemoteOffer<O>;
export declare const toRpcRemoteOffer: <O>(remoteOffer: RemoteOffer<O>) => rpc.RemoteOffer;
export declare const updateRemote: (remote: Remote) => Promise<void>;
export declare const refreshRemote: (remote: Remote) => Promise<void>;
export declare const deleteRemote: (remote: Remote) => Promise<void>;
export declare const updateOffer: <O>(offer: Offer<O>) => Promise<void>;
export declare const refreshOffer: <O>(offer: Offer<O>) => Promise<void>;
export declare const deleteOffer: <O>(offer: Offer<O>) => Promise<void>;
export declare const getWish: <O>(wish: Wish<O>) => Promise<RemoteOffer<O>>;
export declare const wishDeleted: <O>(wish: Wish<O>) => Promise<void>;
export declare type ResourcesService = {
    remoteUpdated: Stream<Remote>;
    remoteRefreshed: Stream<Remote>;
    remoteDeleted: Stream<Remote>;
    offerUpdated: Stream<Offer<unknown>>;
    offerRefreshed: Stream<Offer<unknown>>;
    offerWithdrawn: Stream<[Offer<unknown>, (error: Error | null) => void]>;
    wishPolled: Stream<[
        Wish<unknown>,
        (error: Error | null, remoteOffer: RemoteOffer<unknown>) => void
    ]>;
    wishDeleted: Stream<Wish<unknown>>;
    stop: () => Promise<void>;
};
export declare const startResourcesService: (host: string, port: number, logger: Logger) => Promise<ResourcesService>;
