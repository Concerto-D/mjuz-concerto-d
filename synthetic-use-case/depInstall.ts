import { dynamic, Output } from '@pulumi/pulumi';


export class DepInstallProvider implements dynamic.ResourceProvider {
	async check(olds: any, news: any) {
		return {
			inputs: news,
		};
	}

	async create(inputs: any) {
		console.log("----------------- CALLING DIFF ON DEP INSTALL ---------------")
		const sleep = (s: number) => new Promise(r => setTimeout(r, s * 1000));
		console.log("----------- WAITING " + inputs.time + "S -------")
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
