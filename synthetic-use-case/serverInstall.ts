import { dynamic, Output } from '@pulumi/pulumi';
import {DepInstallResource} from "./depInstall";

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

export class ServerInstallProvider implements dynamic.ResourceProvider {
	async check(olds: any, news: any) {
		return {
			inputs: news,
		};
	}

	async create(inputs: any) {
		const sleep = (s: number) => new Promise(r => setTimeout(r, s*1000));
		console.log("----------- WAITING " + inputs.time + "S -------")
		await sleep(inputs.time);
		console.log("--- DONE ----")
		return {
			id: inputs.name,
			outs: {
				name: inputs.name,
				time: inputs.time,
				depsOffers: inputs.depsOffers
			},
		};
	}
}

export class ServerInstallResource extends dynamic.Resource {
	public readonly name!: Output<string>;
	public readonly time!: Output<number>;
	public readonly depsOffers!: Output<DepInstallResource>;
	
	constructor(name: string, props: any, opts?: any) {
		super(new ServerInstallProvider(), name, props, opts);
	}
}
