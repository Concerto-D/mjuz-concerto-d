import {
	emptyProgram,
	getStack,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import { Wish, RemoteConnection } from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {ServerInstallResource} from "../serverInstall";
import {DepInstallResource} from "../depInstall";
import * as fs from "fs";
import * as YAML from "yaml";

const config_file_path = process.argv[4];
const timestamp_log_file = process.argv[5];
const g5k_execution_params_dir = process.argv[6];
const reconfiguration_name = process.argv[7];
const nb_concerto_nodes = Number.parseInt(process.argv[8]);

console.log("script parameters:")
console.log(
	config_file_path,
	timestamp_log_file,
	g5k_execution_params_dir,
	reconfiguration_name,
	nb_concerto_nodes
)
console.log("------------")

const inventory = YAML.parse(fs.readFileSync("/home/anomond/concerto-d-projects/mjuz-concerto-d/inventory.yaml", "utf-8"))
console.log("inventory:")
console.log(inventory)
console.log("----------")


const program = async () => {
	// const contentManager0 = new RemoteConnection('dep0', { port: 19954 });
	// const contentManager1 = new RemoteConnection('dep1', { port: 19956 });
	// const dep0InstallWish = new Wish<DepInstallResource>(contentManager0, "dep0Install");
	// const dep1InstallWish = new Wish<DepInstallResource>(contentManager1, "dep1Install")
	const remoteConns = [];
	const wishes = [];
	const depsOffers = [];
	let depNum: number;
	for (depNum = 0; depNum < nb_concerto_nodes; depNum++) {
		const depName = `dep${depNum}`;
		const depHost = inventory[depName].split(":")[0];
		let remoteConn = new RemoteConnection(depName, { port: 19954 + 2*depNum, host: depHost});
		let depWish = new Wish<DepInstallResource>(remoteConn, `dep${depNum}Install`);
		remoteConns.push(remoteConn);
		wishes.push(depWish);
		depsOffers.push(depWish.offer);
	}
	
	const serverInstallRessource = new ServerInstallResource(
		"serverInstall",
		{
			name: "serverInstall", 
			time: 5.3,
			depsOffers: depsOffers
		});
	
	return {
		serverInstallId: serverInstallRessource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: 'ServerDeployAndUpdate',
		stackName: 'server',
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: 'server', resourcesPort: 19951, deploymentPort: 19952 }
);
