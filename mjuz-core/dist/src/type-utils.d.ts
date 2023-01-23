import { Input, Output } from '@pulumi/pulumi';
export declare type WrappedInputs<T> = {
    [P in keyof T]: Input<T[P]>;
};
export declare type WrappedOutputs<T> = {
    [P in keyof T]: Output<T[P]>;
};
export declare type Typify<T> = {
    [K in keyof T]: T[K];
};
