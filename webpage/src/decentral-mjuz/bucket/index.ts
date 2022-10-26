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
import * as docker from "@pulumi/docker";

const program = async () => {
	const localImage = new docker.RemoteImage('imageTestMjuz', { name: 'test_mjuz_container' });

	const contentManager = new RemoteConnection('docker_image', { port: 19954 });
	new Offer(contentManager, 'image', localImage.name);
	
	return {
		name: localImage.name,
	};
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: 'DecentralizedWebPageBucket',
		stackName: 'DecentralizedWebPageBucket',
	},
	{ workDir: '.' }
);

try {
	runDeployment(
		initStack,
		operations(Behavior.of(program)),
		(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
		{deploymentName: 'image', resourcesPort: 19951, deploymentPort: 19952}
	).catch(err => console.log(err));
}catch (Exception) {
	console.log("exception")
}
