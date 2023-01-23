import { CustomResourceOptions, dynamic, ID, Output } from '@pulumi/pulumi';
import { WrappedInputs, WrappedOutputs } from '../type-utils';
import { CheckResult } from '@pulumi/pulumi/dynamic';
export declare type RemoteConnectionProps = {
    remoteId: string;
    host: string;
    port: number;
};
export declare class RemoteConnectionProvider implements dynamic.ResourceProvider {
    check(oldProps: unknown | RemoteConnectionProps, newProps: RemoteConnectionProps): Promise<CheckResult & {
        inputs: RemoteConnectionProps;
    }>;
    create(props: RemoteConnectionProps): Promise<dynamic.CreateResult & {
        outs: RemoteConnectionProps;
    }>;
    diff(id: ID, oldProps: RemoteConnectionProps, newProps: RemoteConnectionProps): Promise<dynamic.DiffResult>;
    update(id: ID, oldProps: RemoteConnectionProps, newProps: RemoteConnectionProps): Promise<dynamic.UpdateResult & {
        outs: RemoteConnectionProps;
    }>;
    delete(id: ID, props: RemoteConnectionProps): Promise<void>;
}
export declare type RemoteConnectionArgs = Partial<WrappedInputs<Omit<RemoteConnectionProps, 'remoteId'>> & {
    remoteId: string;
}>;
export declare type RemoteConnectionOutputs = Readonly<WrappedOutputs<Omit<RemoteConnectionProps, 'remoteId'>> & {
    remoteId: string;
}>;
export declare class RemoteConnection extends dynamic.Resource implements RemoteConnectionOutputs {
    constructor(name: string, args: RemoteConnectionArgs, opts?: CustomResourceOptions);
    readonly remoteId: string;
    readonly host: Output<string>;
    readonly port: Output<number>;
}
