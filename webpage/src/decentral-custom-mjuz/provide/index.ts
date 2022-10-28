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
import {ProvideResource} from "../../../provide-dep";

const program = async () => {
	const props = {
		field1: "fiield1",
		field2: 12345,
		field3: true,
	}
	const provideResource = new ProvideResource("provideRes", props);
	const contentManager = new RemoteConnection('provide', { port: 19954 });
	new Offer(contentManager, 'provide', provideResource);

	// Export the Internet address for the service.
	return {
		field1: provideResource.field1,
	};
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: 'DecentralizedCustomProvide2',
		stackName: 'provide2',
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: 'provide', resourcesPort: 19951, deploymentPort: 19952 }
);
