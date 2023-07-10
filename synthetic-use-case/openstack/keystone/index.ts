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
	const novaConnection = new RemoteConnection(`nova`, { port: 19956, host: "localhost"});
	const neutronConnection = new RemoteConnection(`neutron`, { port: 19958, host: "localhost"});
	const mariadbmasterConnection = new RemoteConnection(`mariadbmaster`, { port: 19960, host: "localhost"});
	// let mariadbmasterResWish = new Wish<SleepingComponentResource>(mariadbmasterConnection, `mariadbmasterProvide${reconfigurationName}`);
	let mariadbmasterResWish = new Wish<SleepingComponentResource>(mariadbmasterConnection, `mariadbmasterProvide`);
	
	const keystoneResource = new SleepingComponentResource(
		`keystoneRes${reconfigurationName}`,
		{reconfState: mariadbmasterResWish.offer, timeCreate: 7.0, timeDelete: 3.0, depsOffers: [mariadbmasterResWish.offer], idProvide: mariadbmasterResWish.offer}
	)
	// new Offer(novaConnection, `keystoneProvide${reconfigurationName}`, keystoneResource)
	new Offer(novaConnection, `keystoneProvide`, keystoneResource)
	// new Offer(neutronConnection, `keystoneProvide${reconfigurationName}`, keystoneResource)
	new Offer(neutronConnection, `keystoneProvide`, keystoneResource)
	
	mariadbmasterResWish.offer.apply(res => {
		console.log(`OFFFFFERRRRRR: ${res}`)
	})
	keystoneResource.idProvide?.apply(res => {
		console.log(`ID POROOOOOOOVIDE: ${res}`)
	})
	
	return {
		keystoneResourceId: keystoneResource.id,
		keystoneResourceIdProvide: keystoneResource.idProvide
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
