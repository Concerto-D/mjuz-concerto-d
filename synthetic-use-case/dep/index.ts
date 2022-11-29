import {
	emptyProgram,
	getStack,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import { Offer, RemoteConnection } from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {DepInstallResource} from "../depInstall";
import { initializeReconf } from "../metricAnalysis";


const [
	config_file_path,
	timestamp_log_file,
	g5k_execution_params_dir,
	reconfiguration_name,
	nb_concerto_nodes,
	depNum,
	inventory,
	depDeployTime
] = initializeReconf("dep")

console.log("script parameters:")
console.log(
	config_file_path,
	timestamp_log_file,
	g5k_execution_params_dir,
	reconfiguration_name,
	nb_concerto_nodes,
	depNum
)
console.log("------------")

const program = async () => {
	const serverHost = inventory["server"].split(":")[0]
	const contentManager = new RemoteConnection(`dep${depNum}`, { port: 19952, host: serverHost});
	
	// For update: delete and replace resource
	const depInstallRessource = new DepInstallResource(
		`dep${depNum}${reconfiguration_name}`, 
		{reconfState: reconfiguration_name, time: depDeployTime}
	);
	
	// For the update of the offer, need to also delete and replace the offer because the dep resource changed
	// TODO: check if this is automatically handled by Mjuz
	new Offer(contentManager, `dep${depNum}${reconfiguration_name}`, depInstallRessource)
	
	return {
		depInstallId: depInstallRessource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `Dep${depNum}DeployAndUpdate`,
		stackName: `dep${depNum}`,
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: `dep${depNum}`, resourcesPort: 19953 + 2*Number.parseInt(depNum), deploymentPort: 19954 + 2*Number.parseInt(depNum)}
);
