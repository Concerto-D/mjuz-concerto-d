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
import * as pulumi from "@pulumi/pulumi"

const [
	targetDeployment,
	nbScalingNodes,
	scalingNum,
	inventory,
	installTime,
	runningTime,
	updateTime,
	logger
] = initializeReconf("worker")

const compName = `worker${scalingNum}`;
const timestampType = targetDeployment === "deploy" ? TimestampType.DEPLOY : TimestampType.UPDATE
let timestampRegistered = false;
const program = async () => {
	logger.info("Reconf starts");
	// Reconf starts
	if (!timestampRegistered) {
		registerTimeValue(timestampType, TimestampPeriod.START);
		timestampRegistered = true;
	}
	
	/* RemoteConnection with mariadbmaster, nova and neutron */
	const [mariadbHost, mariadbPort] = inventory["mariadbmaster"].split(":")
	const [novaHost, novaPort] = inventory["nova0"].split(":")
	const [neutronHost, neutronPort] = inventory["neutron0"].split(":")
	const mariadbmasterConnection = new RemoteConnection(`mariadbmaster`, { port: Number.parseInt(mariadbPort), host: mariadbHost});
	const novaConnection = new RemoteConnection(`nova0`, { port: Number.parseInt(novaPort), host: novaHost});
	const neutronConnection = new RemoteConnection(`neutron0`, { port: Number.parseInt(neutronPort), host: neutronHost});
	
	/* mariadbworker */
	// Resolve mariadbmaster Wish
	let mariadbmasterResWish = new Wish<SleepingComponentResource>(mariadbmasterConnection, `mariadbmasterProvide`);
	
	// Create component
	const mariadbworkerResource = new SleepingComponentResource(
		`mariadbworkerRes`,
		{reconfState: mariadbmasterResWish.offer, timeCreate: 10.0, timeDelete: 3.0, depsOffers: [mariadbmasterResWish.offer]}
	)
	
	// Provide mariadbworker to nova and neutron
	new Offer(novaConnection, `mariadbworker${scalingNum}Provide`, mariadbworkerResource)
	new Offer(neutronConnection, `mariadbworker${scalingNum}Provide`, mariadbworkerResource)
	
	/* keystone */
	// Create component
	const keystoneResource = new SleepingComponentResource(
		`keystoneRes`,
		{reconfState: mariadbworkerResource.reconfState, timeCreate: 10.0, timeDelete: 3.0, depsOffers: []},
		{dependsOn: mariadbworkerResource}
	)
	
	// Provide keystone to nova and neutron
	new Offer(novaConnection, `keystone${scalingNum}Provide`, keystoneResource)
	new Offer(neutronConnection, `keystone${scalingNum}Provide`, keystoneResource)
	
	/* glance */
	const glanceResource = new SleepingComponentResource(
		`glanceRes`,
		{reconfState: keystoneResource.reconfState, timeCreate: 10.0, timeDelete: 3.0, depsOffers: []},
		{dependsOn: [mariadbworkerResource, keystoneResource]}
	)
	
	pulumi.all([mariadbworkerResource.id, keystoneResource.id, glanceResource.id])
		.apply(([workerId, keystoneId, glanceId]) => {
			if(workerId == targetDeployment && keystoneId === targetDeployment && glanceId === targetDeployment) {
				goToSleep(50)
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
