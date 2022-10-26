import {
	emptyProgram,
	getStack,
	nextAction,
	operations,
	runDeployment,
	sigint,
	sigquit,
} from '@mjuz/core';
import { at, changes, combine, sinkBehavior } from '@funkia/hareactive';
import * as docker from '@pulumi/docker';
import { PulumiFn } from '@pulumi/pulumi/automation';
import { isDeepStrictEqual } from 'util';

type State = { counter: number };
const programState = sinkBehavior<State>({ counter: 0 });
// Counter changes every 20 seconds, even though it is updated every second
setInterval(
	() =>
		programState.push({
			counter: at(programState).counter + (Date.now() % 20000 < 1000 ? 1 : 0),
		}),
	1000
);
const program = (): PulumiFn => async () => {
	const localImage = new docker.RemoteImage('imageTestMjuz', { name: 'test_mjuz_container' });
	const container = new docker.Container('ubuntuContainer', { image: localImage.latest });

	// Export the Internet address for the service. 
	return {
		name: container.name,
	};
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: 'CentralizedWebPage',
		stackName: 'CentralizedWebPage',
	},
	undefined
);

const argops = programState.map(program);
const opes = operations(argops);
runDeployment(initStack, opes, (offerUpdates) => {
		const com = combine(offerUpdates, changes(programState, isDeepStrictEqual).mapTo(undefined));
		const sq = sigquit();
		const si = sigint();
		return nextAction(
			com,
			sq,
			si
		)
	}
).catch((err) => console.log(err));
