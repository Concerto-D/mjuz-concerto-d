import {
	emptyProgram,
	getStack, newLogger,
	nextAction,
	operations, registerTimeValue,
	runDeployment,
	sigint,
	sigquit, TimestampPeriod, TimestampType,
} from '@mjuz/core';
import { Offer, RemoteConnection } from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {SleepingComponentResource} from "../../sleepingComponent";
import {goToSleep, initializeReconf} from "../../metricAnalysis";

const compName = "mariadbmaster";

const [
	targetDeployment,
	nbScalingNodes,
	scalingNum,
	inventory,
	installTime,
	runningTime,
	updateTime,
	logger
] = initializeReconf(compName)

const timestampType = targetDeployment === "deploy" ? TimestampType.DEPLOY : TimestampType.UPDATE

let timestampRegistered = false;
const program = async () => {
	logger.info("Reconf starts");
	if (!timestampRegistered) {
		registerTimeValue(timestampType, TimestampPeriod.START);
		timestampRegistered = true;
	}
	
	// Create component
	const mariadbmasterResource = new SleepingComponentResource(
		`${compName}Res${targetDeployment}`,
		{reconfState: targetDeployment, timeCreate: 7.0, timeDelete: 3.0, depsOffers: []}
	)
	
	// Provide component to keystone
	const [keystoneHost, keystonePort] = inventory["keystone0"].split(":")
	const keystoneConnection = new RemoteConnection(`keystone0`, { port: Number.parseInt(keystonePort), host: keystoneHost});
	new Offer(keystoneConnection, `${compName}Provide`, mariadbmasterResource)
	
	mariadbmasterResource.id.apply(mariadbmasterResourceId => {
		if (mariadbmasterResourceId === targetDeployment) {
			goToSleep(50);
		}
	})
	
	return {
		mariadbmasterResourceId: mariadbmasterResource.id
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
