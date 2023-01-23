import { CustomResourceOptions, dynamic, ID, Input, Output } from '@pulumi/pulumi';
import { WrappedInputs, WrappedOutputs } from '../type-utils';
import { RemoteConnection } from './remote-connection';
export declare type WishProps<O> = {
    targetId: string;
    offerName: string;
    isSatisfied: boolean;
    offer: O | null;
};
export declare class WishProvider<O> implements dynamic.ResourceProvider {
    check(oldProps: unknown | WishProps<O>, newProps: WishProps<O>): Promise<dynamic.CheckResult & {
        inputs: WishProps<O>;
    }>;
    create(props: WishProps<O>): Promise<dynamic.CreateResult & {
        outs: WishProps<O>;
    }>;
    diff(id: ID, oldProps: WishProps<O>, newProps: WishProps<O>): Promise<dynamic.DiffResult>;
    update(id: ID, oldProps: WishProps<O>, newProps: WishProps<O>): Promise<dynamic.UpdateResult & {
        outs: WishProps<O>;
    }>;
    delete(id: ID, props: WishProps<O>): Promise<void>;
}
export declare type WishArgs = WrappedInputs<{
    target: RemoteConnection;
    offerName: string;
}>;
export declare type WishOutputs<O> = Readonly<WrappedOutputs<WishProps<O>>>;
export declare class Wish<O> extends dynamic.Resource implements WishOutputs<O> {
    constructor(target: Input<RemoteConnection>, offerName: string, opts?: CustomResourceOptions);
    constructor(name: string, props: WishArgs, opts?: CustomResourceOptions);
    readonly targetId: Output<string>;
    readonly offerName: Output<string>;
    readonly isSatisfied: Output<boolean>;
    readonly offer: Output<O>;
}
