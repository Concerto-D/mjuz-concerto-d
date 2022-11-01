import {
	emptyProgram,
	getStack,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import { Wish, RemoteConnection } from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {ServerInstallResource} from "../serverInstall";
import {DepInstallResource} from "../depInstall";

const program = async () => {
	const contentManager0 = new RemoteConnection('dep0', { port: 19954 });
	const contentManager1 = new RemoteConnection('dep1', { port: 19956 });
	const dep0InstallWish = new Wish<DepInstallResource>(contentManager0, "dep0Install")
	const dep1InstallWish = new Wish<DepInstallResource>(contentManager1, "dep1Install")
	const serverInstallRessource = new ServerInstallResource(
		"serverInstall",
		{
			name: "serverInstall", 
			time: 5.3,
			depsOffers: [dep0InstallWish.offer, dep1InstallWish.offer]
		});
	
	return {
		serverInstallId: serverInstallRessource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: 'ServerDeployAndUpdate',
		stackName: 'server',
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: 'server', resourcesPort: 19951, deploymentPort: 19952 }
);
