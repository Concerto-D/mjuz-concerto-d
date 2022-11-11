import { IO } from '@funkia/io';
import {
	accum,
	Behavior,
	Future,
	performStream,
	runNow,
	sinkFuture,
	Stream,
	toPromise,
	when,
} from '@funkia/hareactive';
import {
	Action,
	newLogger,
	reactionLoop,
	setLogLevel,
	startDeploymentService,
	startOffersRuntime,
	startResourcesService,
} from '.';
import * as yargs from 'yargs';
import { Level, Logger } from 'pino';

type RuntimeOptions = {
	deploymentName: string;
	deploymentHost: string;
	deploymentPort: number;
	heartbeatInterval: number;
	resourcesHost: string;
	resourcesPort: number;
	logLevel: Level;
};

enum TimestampType {
	UPTIME = 'uptime',
	DEPLOY = 'deploy',
	UPDATE = 'update',
}

enum TimestampPeriod {
	START = 'start',
	END = 'end',
}

export const globalVariables = {
	execution_expe_dir: '',
};

let finalS: any;

const getOptions = (defaults: Partial<RuntimeOptions>): RuntimeOptions =>
	yargs.options({
		deploymentName: {
			alias: 'n',
			default: defaults.deploymentName || 'deployment',
			description: 'Name of the deployment (used for identification with other deployments).',
		},
		deploymentHost: {
			alias: 'dh',
			default: defaults.deploymentHost || '0.0.0.0',
			description: 'Host of the µs deployment service.',
		},
		deploymentPort: {
			alias: 'dp',
			default: defaults.deploymentPort || 19952,
			description: 'Port of the µs deployment service.',
		},
		resourcesHost: {
			alias: 'rh',
			default: defaults.deploymentHost || '127.0.0.1',
			description: 'Host of the µs resources service.',
		},
		resourcesPort: {
			alias: 'rp',
			default: defaults.resourcesPort || 19951,
			description: 'Port of the µs resources service.',
		},
		heartbeatInterval: {
			alias: 'hi',
			default: defaults.heartbeatInterval || 5,
			description: 'Heartbeat interval on connections between deployments in seconds.',
		},
		logLevel: {
			alias: 'v',
			default: defaults.logLevel || 'info',
			description:
				'Log level: "fatal", "error", "warn", "info", "debug", or "trace". Only affects default logger.',
		},
	}).argv as RuntimeOptions;

let exitCode = 0;
type timestampDictType = {
	[timestampType: string]: {
		[timestampPeriod: string]: number;
	};
};

const allTimestampsDict: timestampDictType = {};

export const goToSleep = (newExitCode: number): void => {
	exitCode = newExitCode;
	process.kill(process.pid, 3);
};

export const registerTimeValue = (
	timestampType: TimestampType,
	timestampPeriod: TimestampPeriod
): void => {
	if (timestampPeriod === TimestampPeriod.START) {
		if (timestampType in allTimestampsDict) {
			throw new Error(
				`Register time value start error: ${timestampType} for ${TimestampPeriod.START} already registered`
			);
		}
		allTimestampsDict[timestampType] = {};
		allTimestampsDict[timestampType][TimestampPeriod.START] = new Date().getTime();
	} else {
		if (!(timestampType in allTimestampsDict)) {
			throw new Error(`Register time value end error: ${timestampType} never registered`);
		}
		if (TimestampPeriod.END in allTimestampsDict[timestampType]) {
			throw new Error(
				`Register time value start error: ${timestampType} for ${TimestampPeriod.END} already registered`
			);
		}
		allTimestampsDict[timestampType][TimestampPeriod.END] = new Date().getTime();
	}
};

export const registerTimestampsinFile: () => {
	
}

export const runDeployment = <S>(
	initOperation: IO<S>,
	operations: (action: Action) => (state: S) => IO<S>,
	nextAction: (offerUpdates: Stream<void>) => Behavior<Behavior<Future<Action>>>,
	options: Partial<RuntimeOptions> & { logger?: Logger; disableExit?: true } = {}
): Promise<S> => {
	console.log('running deployment');
	const opts = getOptions(options || {});
	setLogLevel(opts.logLevel);
	const logger = options.logger || newLogger('runtime');
	const setup = async () => {
		const [resourcesService, deploymentService] = await Promise.all([
			startResourcesService(
				opts.resourcesHost,
				opts.resourcesPort,
				logger.child({ c: 'resources service' })
			),
			startDeploymentService(
				opts.deploymentHost,
				opts.deploymentPort,
				logger.child({ c: 'deployment service' })
			),
		]);
		const initialized = sinkFuture<void>();
		const offersRuntime = await startOffersRuntime(
			deploymentService,
			resourcesService,
			initialized,
			opts.deploymentName,
			opts.heartbeatInterval,
			logger.child({ c: 'offers runtime' })
		);

		const [stackActions, completed] = reactionLoop(
			initOperation,
			operations,
			nextAction(offersRuntime.inboundOfferUpdates),
			logger.child({ c: 'reaction loop' })
		);
		runNow(
			performStream(stackActions)
				.flatMap((actions) => accum(() => true, false, actions))
				.flatMap(when)
		).subscribe(() => initialized.resolve());
		const finalStack = await toPromise(completed);
		console.log('wait everything');
		await Promise.all([
			resourcesService.stop(),
			deploymentService.stop(),
			offersRuntime.stop(),
		]);
		console.log('end of run deployment');
		// console.log('final stack:');
		// console.log(finalStack);
		finalS = finalStack;
		return finalStack;
	};

	return setup()
		.catch((err) => {
			logger.error(err, 'Deployment error');
			process.exit(1);
		})
		.finally(() => {
			logger.info('Deployment terminated');
			console.log('FINAL:');
			console.log(finalS);
			if (!options.disableExit) process.exit(exitCode);
		});
};
