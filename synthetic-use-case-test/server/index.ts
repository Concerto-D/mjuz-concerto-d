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

console.log("script parameters:");
console.log(
	config_file_path,
	timestamp_log_file,
	g5k_execution_params_dir,
	reconfiguration_name,
	nb_concerto_nodes
)
console.log("------------");

const inventory = YAML.parse(fs.readFileSync("../../inventory.yaml", "utf-8"))
console.log("inventory:")
console.log(inventory)
console.log("----------")
const start = new Date().getTime();

// setTimeout(() => process.kill(process.pid, 3), 30000)

const program = async () => {
	// const contentManager0 = new RemoteConnection('dep0', { port: 19954 });
	// const contentManager1 = new RemoteConnection('dep1', { port: 19956 });
	// const dep0InstallWish = new Wish<DepInstallResource>(contentManager0, "dep0Install");
	// const dep1InstallWish = new Wish<DepInstallResource>(contentManager1, "dep1Install")
	const remoteConns = [];
	const wishes = [];
	const depsOffers = [];
	let depNum: number;
	let remoteConn = new RemoteConnection("dep0", { port: 19954 });
	let depWish = new Wish<DepInstallResource>(remoteConn, `dep0Install`);
	let depChildWish = new Wish<DepInstallResource>(remoteConn, 'dep1Install', {
		dependsOn: depWish
	});
	
	depChildWish.id.apply(
		result => {
			console.log("ID SATISFIED FOR CHILD WISH")
			console.log(result)
		}
	)
	depChildWish.offer.apply(
		result => {
			if (result !== null)
				console.log("OFFER SATISFIED FOR CHILD WISH")
		}
	)
	// for (depNum = 0; depNum < nb_concerto_nodes; depNum++) {
	// 	const depName = `dep${depNum}`;
	// 	const depHost = inventory[depName].split(":")[0];
	// 	let remoteConn = new RemoteConnection(depName, { port: 19954 + 2*depNum, host: depHost});
	// 	let depWish = new Wish<DepInstallResource>(remoteConn, `dep${depNum}Install`);
	// 	remoteConns.push(remoteConn);
	// 	wishes.push(depWish);
	// 	depsOffers.push(depWish.offer);
	// }
	
	// const serverInstallRessource = new ServerInstallResource(
	// 	"serverInstall",
	// 	{
	// 		name: "serverInstall",
	// 		time: 21.8,
	// 		depsOffers: depsOffers
	// 	});
	// serverInstallRessource.id.apply(
	// 	result => process.kill(process.pid, 3)
	// )
	depWish.id.apply(
		result =>{  
			// console.log("DEP WISH OFFER RESULT:");
			// console.log({"result": result});
			console.log("DEP WISH ID SATISFIED");
			console.log(result);
				// process.kill(process.pid, 3)
		}
	)
	depWish.offer.apply(
		result =>{ 
			// console.log("DEP WISH OFFER RESULT:");
			// console.log({"result": result});
			if (result !== null) {
				console.log("DEP WISH OFFER SATISFIED")
				// process.kill(process.pid, 3)
			}
		}
	)
	return {
		depWishId: depWish.id,
		depWishOffer: depWish.offer,
		childWishId: depChildWish.id,
		childWishOffer: depChildWish.offer
		// serverInstallId: serverInstallRessource.id
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
