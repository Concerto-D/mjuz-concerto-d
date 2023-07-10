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
	const reconfigurationName = "update"
	const keystoneConnection = new RemoteConnection(`mariadbmaster`, { port: 19954, host: "localhost"});
	const mariadbmasterResource = new SleepingComponentResource(
		`mariadbmasterRes${reconfigurationName}`,
		{reconfState: reconfigurationName, timeCreate: 7.0, timeDelete: 3.0, depsOffers: []}
	)
	// new Offer(keystoneConnection, `mariadbmasterProvide${reconfigurationName}`, mariadbmasterResource)
	new Offer(keystoneConnection, `mariadbmasterProvide`, mariadbmasterResource)
	
	return {
		mariadbmasterResourceId: mariadbmasterResource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `mariadbmasterProject`,
		stackName: `mariadbmasterStack`,
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: `mariadbmaster`, resourcesPort: 19959, deploymentPort: 19960 }
);
