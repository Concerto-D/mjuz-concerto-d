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
import {DepInstallResource} from "../depInstall";
import * as fs from "fs";
import * as YAML from "yaml";


const config_file_path = process.argv[4];
const timestamp_log_file = process.argv[5];
const g5k_execution_params_dir = process.argv[6];
const reconfiguration_name = process.argv[7];
const nb_concerto_nodes = process.argv[8];
let depNum = process.argv[9]

console.log("script parameters:")
console.log(
	config_file_path,
	timestamp_log_file,
	g5k_execution_params_dir,
	reconfiguration_name,
	nb_concerto_nodes,
	depNum
)
console.log("------------")

const inventory = YAML.parse(fs.readFileSync("../../inventory.yaml", "utf-8"))
console.log("inventory:")
console.log(inventory)
console.log("----------")

setTimeout(() => process.kill(process.pid, 3), 30000)

const program = async () => {
	depNum = "0";
	const serverHost = inventory["server"].split(":")[0]
	const contentManager = new RemoteConnection(`dep0`, { port: 19952, host: serverHost});
	const depInstallRessource = new DepInstallResource(
		`dep${depNum}Install`,
		{
			name: `dep${depNum}Install`,
			time: 0
		});
	const off1 = new Offer(contentManager, `dep${depNum}Install`, depInstallRessource)
	depNum = "1"
	const depInstallRessource2 = new DepInstallResource(
		`dep${depNum}Install`,
		{
			name: `dep${depNum}Install`,
			time: 0
		});
	const off2 = new Offer(contentManager, `dep${depNum}Install`, depInstallRessource)

	// .apply(
	// 	result => {
	// 		console.log("BENEF IDDD:")
	// 		console.log({result: result})
	// 		process.kill(process.pid, 3)
	// 	}
	// )
	
	return {
		depInstallId: depInstallRessource.id
	}
};

const initStack = getStack(
	{
		program: emptyProgram,
		projectName: `Dep${depNum}DeployAndUpdate`,
		stackName: `dep${depNum}`,
	},
	{ workDir: '.' }
);

runDeployment(
	initStack,
	operations(Behavior.of(program)),
	(offerUpdates) => nextAction(offerUpdates, sigquit(), sigint()),
	{ deploymentName: `dep${depNum}`, resourcesPort: 19953 + 2*Number.parseInt(depNum), deploymentPort: 19954 + 2*Number.parseInt(depNum)}
);
