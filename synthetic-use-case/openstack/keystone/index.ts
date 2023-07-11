import {
	emptyProgram,
	getStack, newLogger,
	nextAction,
	operations, registerTimeValue,
	runDeployment, setExitCode,
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
] = initializeReconf("keystone")

const compName = `keystone${scalingNum}`;
const timestampType = targetDeployment === "deploy" ? TimestampType.DEPLOY : TimestampType.UPDATE
let timestampRegistered = false;
const program = async () => {
	logger.info("Reconf starts");
	// Reconf starts
	if (!timestampRegistered) {
		registerTimeValue(timestampType, TimestampPeriod.START);
		timestampRegistered = true;
	}
	
	// Resolve mariadbmaster Wish
	const [mariadbHost, mariadbPort] = inventory["mariadbmaster"].split(":")
	const mariadbmasterConnection = new RemoteConnection(`mariadbmaster`, { port: Number.parseInt(mariadbPort), host: mariadbHost});
	let mariadbmasterResWish = new Wish<SleepingComponentResource>(mariadbmasterConnection, `mariadbmasterProvide`);
	
	// Create component
	const keystoneResource = new SleepingComponentResource(
		`${compName}Res${targetDeployment}`,
		{reconfState: mariadbmasterResWish.offer, timeCreate: 5.0, timeDelete: 3.0, depsOffers: [mariadbmasterResWish.offer], idProvide: mariadbmasterResWish.offer}
	)
	
	// Provide component with nova and neutron
	const [novaHost, novaPort] = inventory["nova0"].split(":")
	const [neutronHost, neutronPort] = inventory["neutron0"].split(":")
	const novaConnection = new RemoteConnection(`nova0`, { port: Number.parseInt(novaPort), host: novaHost});
	const neutronConnection = new RemoteConnection(`neutron0`, { port: Number.parseInt(neutronPort), host: neutronHost});
	new Offer(novaConnection, `keystoneProvide`, keystoneResource)
	new Offer(neutronConnection, `keystoneProvide`, keystoneResource)
	
	keystoneResource.id.apply(keystoneResourceId => {
		if (keystoneResourceId === targetDeployment) {
			// Reconf ends
			goToSleep(50);
		}
	})
	
	return {
		keystoneResourceId: keystoneResource.id
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
