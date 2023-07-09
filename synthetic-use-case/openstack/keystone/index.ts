import {
	emptyProgram,
	getStack, newLogger,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import { Offer, RemoteConnection } from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {SleepingComponentResource} from "../../sleepingComponent";

const logger = newLogger('pulumi');

const program = async () => {
	const novaConnection = new RemoteConnection(`nova`, { port: 19956, host: "localhost"});
	const neutronConnection = new RemoteConnection(`neutron`, { port: 19958, host: "localhost"});
	const keystoneResource = new SleepingComponentResource(
		`keystoneRes`,
		{reconfState: `deploy`, time: 5.0, depsOffers: []}
	)
	new Offer(novaConnection, `keystoneProvide`, keystoneResource)
	new Offer(neutronConnection, `keystoneProvide`, keystoneResource)
	// new Offer(neutronConnection, `keystoneProvide`, keystoneResource)
	
	return {
		keystoneResourceId: keystoneResource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `keystoneProject`,
		stackName: `keystoneStack`,
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: `keystone`, resourcesPort: 19953, deploymentPort: 19954 }
);
