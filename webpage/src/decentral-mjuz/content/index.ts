import {
	emptyProgram,
	getStack,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import { RemoteConnection, Wish } from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import * as docker from "@pulumi/docker";
import * as aws from "@pulumi/aws"

const program = async () => { 
	const bucketManager = new RemoteConnection('docker_image', { port: 19952 });
	const bucketWish = new Wish<String>(bucketManager, 'image');
	// console.log("Mise à jour du bucketWish: " + bucketWish.offer.name);
	// const localImage = new docker.RemoteImage('imageTestMjuz', { name: 'test_mjuz_container' });
	// const container = new docker.Container('ubuntuContainer', {image: bucketWish.offer});
	
	return {
		test2: "test2",
		test: bucketWish.offer,
	};
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: 'DecentralizedWebPageContent',
		stackName: 'DecentralizedWebPageContent',
	},
	{ workDir: '.' }
);

try {
	runDeployment(
		initStack,
		operations(Behavior.of(program)),
		(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
		{deploymentName: 'container', resourcesPort: 19953, deploymentPort: 19954}
	).catch(err => console.log(err));
}catch (Exception) {
	console.log("exception")
}
