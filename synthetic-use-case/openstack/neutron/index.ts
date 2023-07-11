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
] = initializeReconf("neutron")

const compName = `neutron${scalingNum}`
const timestampType = targetDeployment === "deploy" ? TimestampType.DEPLOY : TimestampType.UPDATE
let timestampRegistered = false;
const program = async () => {
	// Reconf starts
	if (!timestampRegistered) {
		registerTimeValue(timestampType, TimestampPeriod.START);
		timestampRegistered = true;
	}
	
	// Resolve keystone wish
	const [keystoneHost, keystonePort] = inventory["keystone0"].split(":")
	const keystoneConnection = new RemoteConnection(`keystone0`, { port: Number.parseInt(keystonePort), host: keystoneHost});
	let keystoneResWish = new Wish<SleepingComponentResource>(keystoneConnection, `keystoneProvide`);
	
	// Create component
	const neutronResource = new SleepingComponentResource(
		`${compName}Res${targetDeployment}`,
		{reconfState: keystoneResWish.offer, timeCreate: 2.0, timeDelete: 3.0, depsOffers: [keystoneResWish.offer]}
	)
	
	neutronResource.id.apply(neutronResourceId => {
		if (neutronResourceId === targetDeployment) {
			// Reconf ends
			goToSleep(50);
		}
	})
	
	return {
		neutronResourceId: neutronResource.id
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
