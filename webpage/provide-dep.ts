import { CustomResourceOptions, dynamic, ID, Input, Output } from '@pulumi/pulumi';

export interface ProvidePropsInput {
	field1: Input<string>;
	field2: Input<number>;
	field3: Input<boolean>;
}

export interface ProvidePropsProvider {
	field1: string;
	field2: number;
	field3: boolean;
}

interface ProvidePropsProviderOutput {
    field1: string;
    field2: number;
	field3: boolean;
}

export class ProvideProvider implements dynamic.ResourceProvider {
	async check(olds: ProvidePropsProvider, news: ProvidePropsProvider) {
		news.field3 = false;
		return { 
			inputs: news
		};
	}
	
    async create(inputs: ProvidePropsProvider) {
        return {
			id: inputs.field1, 
			outs: {
				field1: inputs.field1,
				field2: inputs.field2,
				field3: inputs.field3
			}
		};
    }
}

export class ProvideResource extends dynamic.Resource {
	public readonly field1!: Output<string>;
	public readonly field2!: Output<number>;
	public readonly field3!: Output<boolean>;
	
    constructor(name: string, props: ProvidePropsInput, opts?: CustomResourceOptions) {
        super(new ProvideProvider(), name, props, opts);
    }
}
