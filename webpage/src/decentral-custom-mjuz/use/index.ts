import {
	emptyProgram,
	getStack,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import {RemoteConnection, Wish} from '@mjuz/core/resources';
import { Behavior } from '@funkia/hareactive';
import {ProvideResource} from "../../../provide-dep";
import {UseResource} from "../../../use-dep";

const program = async () => {
	// Remote connection name and offerName has to have the same name
	const provideManager = new RemoteConnection('provide', { port: 19952 });
	const provideWish = new Wish<ProvideResource>(provideManager, 'provide');
	const useResource = new UseResource('useRes1', {
		nameDep: "firstDep",
		useDep: provideWish.offer,
		done: false
	});

	// Export the Internet address for the service.
	return {
		useResId: useResource.id
	};
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: 'DecentralizedCustomUse2',
		stackName: 'use2',
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: 'use', resourcesPort: 19953, deploymentPort: 19954 }
).catch(err => console.log(err));
