import { dynamic, Output } from '@pulumi/pulumi';
import {ProvideResource} from "../webpage/provide-dep";

// export type ProvidePropsInput = {
// 	field1: Input<string>;
// 	field2: Input<number>;
// 	field3: Input<boolean>;
// };
//
// export type ProvidePropsProvider = {
// 	field1: string;
// 	field2: number;
// 	field3: boolean;
// };
//
// type ProvidePropsProviderOutput = {
// 	field1: string;
// 	field2: number;
// 	field3: boolean;
// };

export class DepInstallProvider implements dynamic.ResourceProvider {
	async check(olds: any, news: any) {
		return {
			inputs: news,
		};
	}

	async create(inputs: any) {
		const sleep = (s: number) => new Promise(r => setTimeout(r, s * 1000));
		await sleep(inputs.time);
		return {
			id: inputs.name,
			outs: {
				name: inputs.name,
				time: inputs.time,
			},
		};
	}
}

export class DepInstallResource extends dynamic.Resource {
	public readonly name!: Output<string>;
	public readonly time!: Output<number>;

	constructor(name: string, props: any, opts?: any) {
		super(new DepInstallProvider(), name, props, opts);
	}
}
