import {
	emptyProgram,
	getStack, newLogger,
	nextAction,
	operations, registerTimeValue,
	runDeployment,
	sigint,
	sigquit, TimestampPeriod, TimestampType,
} from '@mjuz/core';
import {Offer, RemoteConnection, Wish} from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {SleepingComponentResource} from "../../sleepingComponent";
import {goToSleep, initializeReconf} from "../../metricAnalysis";

const [
	targetDeployment,
	nbScalingNodes,
	scalingNum,
	inventory,
	installTime,
	runningTime,
	updateTime,
	logger
] = initializeReconf("nova")

const compName = `nova${scalingNum}`
const timestampType = targetDeployment === "deploy" ? TimestampType.DEPLOY : TimestampType.UPDATE
let timestampRegistered = false;
const program = async () => {
	logger.info("Reconf starts");
	// Reconf starts
	if (!timestampRegistered) {
		registerTimeValue(timestampType, TimestampPeriod.START);
		timestampRegistered = true;
	}
	
	// Resolve keystone wish
	const [workerHost, workerPort] = inventory["worker0"].split(":")
	const workerConnection = new RemoteConnection(`worker0`, { port: Number.parseInt(workerPort), host: workerHost});
	let keystoneResWish = new Wish<SleepingComponentResource>(workerConnection, `keystoneProvide`);
	
	// Create comp
	const novaResource = new SleepingComponentResource(
		`${compName}Res${targetDeployment}`,
		{reconfState: keystoneResWish.offer, timeCreate: 1.0, timeDelete: 3.0, depsOffers: [keystoneResWish.offer]}
	)
	
	novaResource.id.apply(novaResourceId => {
		if (novaResourceId === targetDeployment) {
			// Reconf ends
			goToSleep(50);
		}
	})
	
	return {
		novaResourceId: novaResource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `${compName}Project`,
		stackName: `${compName}Stack`,
	},
	{ workDir: '.' }
);

const deploymentPort = Number.parseInt(inventory[compName].split(":")[1])
runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: compName, resourcesPort: deploymentPort-1, deploymentPort: deploymentPort }
);
