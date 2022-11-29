import { dynamic, Output } from '@pulumi/pulumi';
import {DepInstallResource} from "./depInstall";


export class ServerInstallProvider implements dynamic.ResourceProvider {
	async check(olds: any, news: any) {
		// Add nameChanged value for the diff method
		news.reconfChanged = olds.reconfState !== news.reconfState;
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
			id: inputs.reconfState,
			outs: {
				reconfState: inputs.reconfState,
				time: inputs.time,
				depsOffers: inputs.depsOffers
			},
		};
	}
	
	async diff(id: any, olds: any, news: any) {
		console.log("----------------- CALLING DIFF ON SERVER INSTALL ---------------")
		const changed = news.reconfChanged;

		return {
			changes: changed,
			replaces: ["reconfState"],
			deleteBeforeReplace: true
		}
	}
	
	async update(id: any, olds: any, news: any) {
		console.log("--- update server SHOULDN'T GO HERE -----")
		return {
			id: news.reconfState,
			outs: {
				reconfState: news.reconfState,
				time: news.time,
				depsOffers: news.depOffers
			}
		}
		
	}
	
	async delete(id: any, props: any) {
		console.log("---- delete server ----");
	}
}

export class ServerInstallResource extends dynamic.Resource {
	public readonly reconfState!: Output<string>;
	public readonly time!: Output<number>;
	public readonly depsOffers!: Output<DepInstallResource>;
	
	constructor(name: string, props: any, opts?: any) {
		super(new ServerInstallProvider(), name, props, opts);
	}
}
