import {
	emptyProgram,
	getStack,
	nextAction,
	operations, registerTimeValue,
	runDeployment,
	sigint,
	sigquit, TimestampPeriod, TimestampType
} from '@mjuz/core';
import { Wish, RemoteConnection } from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {ServerInstallResource} from "../serverInstall";
import {DepInstallResource} from "../depInstall";
import {
	goToSleep, initializeReconf
} from '../metricAnalysis'

const [
	config_file_path,
	timestamp_log_file,
	g5k_execution_params_dir,
	reconfiguration_name,
	nb_concerto_nodes,
	depNum,
	inventory,
	serverDeployTime
] = initializeReconf("server")

console.log("script parameters:");
console.log(
	config_file_path,
	timestamp_log_file,
	g5k_execution_params_dir,
	reconfiguration_name,
	nb_concerto_nodes
)
console.log("------------");

let deployTimestampRegistered = false;

const program = async () => {
	console.log("------ PROGRAM LAUNCHED -----------");
	if (!deployTimestampRegistered) {
		registerTimeValue(TimestampType.DEPLOY, TimestampPeriod.START);
		deployTimestampRegistered = true;
	}
	
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
	
	console.log("Creating server");
	
	const serverInstallRessource = new ServerInstallResource(
		"serverInstall",
		{
			name: "serverInstall",
			time: serverDeployTime,
			depsOffers: depsOffers
		});
	
	serverInstallRessource.id.apply(
		resultId => {
			console.log("Got result Id: " + resultId);
			if (resultId !== undefined) {
				goToSleep(50);
			}
		}
	)
	
	console.log("Getting ID")
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
