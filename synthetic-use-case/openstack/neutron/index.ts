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
	const keystoneConnection = new RemoteConnection(`keystone`, { port: 19954, host: "localhost"});
	let keystoneResWish = new Wish<SleepingComponentResource>(keystoneConnection, `keystoneProvide`);
	const neutronResource = new SleepingComponentResource(
		`neutronRes`,
		{reconfState: `deploy`, time: 2.0, depsOffers: [keystoneResWish.offer]}
	)
	return {
		neutronResourceId: neutronResource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `neutronProject`,
		stackName: `neutronStack`,
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: `neutron`, resourcesPort: 19957, deploymentPort: 19958 }
);
