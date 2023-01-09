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
	current_execution_dir,
	reconfiguration_name,
	nb_concerto_nodes,
	depNum,
	inventory,
	installTime,
	runningTime,
	updateTime,
	logger
] = initializeReconf("dep")

logger.info("script parameters:")
logger.info(config_file_path)
logger.info(timestamp_log_file)
logger.info(current_execution_dir)
logger.info(reconfiguration_name)
logger.info(`${nb_concerto_nodes}`)
logger.info(`${depNum}`)
logger.info("------------")

const program = async () => {
	const serverHost = inventory["server"].split(":")[0]
	const contentManager = new RemoteConnection(`dep${depNum}`, { port: 19952, host: serverHost});
	const ofs=[];
	const deployTime = reconfiguration_name === "deploy" ? runningTime : updateTime + runningTime
	// const deployTime = 7;
	//  For update: delete and replace resource
	const depInstallRessource = new DepInstallResource(
		`dep${depNum}Install`, 
		{reconfState: "install", time: installTime}
	);

	const o = new Offer(contentManager, `dep${depNum}install`, depInstallRessource)
	ofs.push(o);
	console.log(`DEPLOY TIME: ${deployTime}`);
	const depRunningRessource = new DepInstallResource(
		`dep${depNum}Running${reconfiguration_name}`, 
		{reconfState: reconfiguration_name, time: deployTime},
		{dependsOn: depInstallRessource}
	);
	
	// For the update of the offer, need to also delete and replace the offer because the dep resource changed
	// TODO: check if this is automatically handled by Mjuz
	// NOTE: Very ad-hoc solution to prevent Mjuz from blocking because the Offer has to be deleted
	// and so it has to withdraw from Wish (which is deleted in the server side)
	const a = new Offer(contentManager, `dep${depNum}deploy`, depRunningRessource)
	ofs.push(a)
	let l = undefined;
	if(reconfiguration_name === 'update')
		l = new Offer(contentManager, `dep${depNum}update`, depRunningRessource)
	ofs.push(l)
	console.log(ofs);
	return {
		depInstallId: depInstallRessource.id
	}	
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `Dep${depNum}DeployAndUpdate2Comps`,
		stackName: `dep${depNum}2Comps`,
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: `dep${depNum}`, resourcesPort: 19953 + 2*Number.parseInt(depNum), deploymentPort: 19954 + 2*Number.parseInt(depNum)}
);
