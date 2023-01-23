import { CustomResourceOptions, dynamic, ID, Input, Output } from '@pulumi/pulumi';
import { RemoteConnection } from './remote-connection';
import { WrappedInputs, WrappedOutputs } from '../type-utils';
import { CheckResult } from '@pulumi/pulumi/dynamic';
export declare type OfferProps<O> = {
    beneficiaryId: string;
    offerName: string;
    offer: O;
};
export declare class OfferProvider<O> implements dynamic.ResourceProvider {
    check(oldProps: unknown | OfferProps<O>, newProps: OfferProps<O>): Promise<CheckResult>;
    create(props: OfferProps<O>): Promise<dynamic.CreateResult & {
        outs: OfferProps<O>;
    }>;
    diff(id: ID, oldProps: OfferProps<O>, newProps: OfferProps<O>): Promise<dynamic.DiffResult>;
    update(id: ID, oldProps: OfferProps<O>, newProps: OfferProps<O>): Promise<dynamic.UpdateResult & {
        outs: OfferProps<O>;
    }>;
    delete(id: ID, props: OfferProps<O>): Promise<void>;
}
export declare type OfferArgs<O> = WrappedInputs<Omit<OfferProps<O>, 'beneficiaryId'> & {
    beneficiary: RemoteConnection;
}>;
export declare type OfferOutputs<O> = Readonly<WrappedOutputs<OfferProps<O>>>;
export declare class Offer<O> extends dynamic.Resource implements OfferOutputs<O> {
    constructor(beneficiary: Input<RemoteConnection>, offerName: string, offer: Input<O>, opts?: CustomResourceOptions);
    constructor(name: string, props: OfferArgs<O>, opts?: CustomResourceOptions);
    readonly beneficiaryId: Output<string>;
    readonly offerName: Output<string>;
    readonly offer: Output<O>;
}
