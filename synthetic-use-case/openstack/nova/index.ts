import {
	emptyProgram,
	getStack, newLogger,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import {Offer, RemoteConnection, Wish} from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {SleepingComponentResource} from "../../sleepingComponent";

const logger = newLogger('pulumi');

const program = async () => {
	const reconfigurationName = "deploy"
	const keystoneConnection = new RemoteConnection(`keystone`, { port: 19954, host: "localhost"});
	// let keystoneResWish = new Wish<SleepingComponentResource>(workerConnection, `keystoneProvide${reconfigurationName}`);
	let keystoneResWish = new Wish<SleepingComponentResource>(keystoneConnection, `keystoneProvide`);
	const novaResource = new SleepingComponentResource(
		`novaRes${reconfigurationName}`,
		{reconfState: keystoneResWish.offer, timeCreate: 5.0, timeDelete: 3.0, depsOffers: [keystoneResWish.offer]}
	)
	return {
		novaResourceId: novaResource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `novaProject`,
		stackName: `novaStack`,
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: `nova`, resourcesPort: 19955, deploymentPort: 19956 }
);
