import {globalVariables, registerTimeValue, setExitCode, TimestampPeriod, TimestampType} from "@mjuz/core";
import * as fs from "fs";
import * as YAML from "yaml";

export const getScriptParameters = (assembly_name: string): [string, string, string, string, number, any] => {
	const config_file_path = process.argv[4];
	const timestamp_log_file = process.argv[5];
	const g5k_execution_params_dir = process.argv[6];
	const reconfiguration_name = process.argv[7];
	const nb_concerto_nodes = Number.parseInt(process.argv[8]);
	let depNum = null;
	if(assembly_name !== "server") {
		depNum = Number.parseInt(process.argv[9]);
	}

	return [
		config_file_path, 
		timestamp_log_file, 
		g5k_execution_params_dir,
		reconfiguration_name,
		nb_concerto_nodes,
		depNum
	]
}

export const initializeReconf = (assembly_type: string) => {
	// Register UPTIME START
	registerTimeValue(TimestampType.UPTIME, TimestampPeriod.START);
	const [
		config_file_path,
		timestamp_log_file,
		g5k_execution_params_dir,
		reconfiguration_name,
		nb_concerto_nodes,
		depNum
	] = getScriptParameters(assembly_type);
	globalVariables.execution_expe_dir = g5k_execution_params_dir;
	
	// Initialization timestamp log dir
	initTimeLogDir("server", g5k_execution_params_dir, timestamp_log_file);
	
	// Get location of nodes
	const inventory = YAML.parse(fs.readFileSync("../../inventory.yaml", "utf-8"))
	
	// Set duration timeout (always 30 seconds)
	setTimeout(() => goToSleep(0), 30000);
	
	// Compute server deployment time
	let assemblyName = "server";
	if (assembly_type === "dep") {
		assemblyName = `dep${depNum}`;
	}
	let deployTime;
	if(assemblyName === "server") {
		deployTime = computeServerDeployTime(config_file_path);
	}
	else {
		deployTime = computeDepDeployTime(config_file_path, assemblyName);
	}
	// const serverDeployTime = 0.4;
	
	return [
		config_file_path,
		timestamp_log_file,
		g5k_execution_params_dir,
		reconfiguration_name,
		nb_concerto_nodes,
		depNum,
		inventory,
		deployTime
	]
}

export const initTimeLogDir = (assemblyName: string, g5k_execution_params_dir: string, logDirTimestamp: string | null): void => {
	if(!fs.existsSync(g5k_execution_params_dir)) {
		fs.mkdirSync(g5k_execution_params_dir);
	}
	globalVariables.assemblyName = assemblyName;
	if (logDirTimestamp !== null) {
		globalVariables.logDirTimestamp = logDirTimestamp;
	}
	else {
		const dateNow = new Date();
		let year = dateNow.getFullYear();
		let month = ("0" + (dateNow.getMonth() + 1)).slice(-2);
		let day = ("0" + dateNow.getDate()).slice(-2);
		let hour = ("0" + dateNow.getHours()).slice(-2);
		let minute = ("0" + dateNow.getMinutes()).slice(-2);
		let seconds = ("0" + dateNow.getSeconds()).slice(-2);
		globalVariables.logDirTimestamp = `${year}-${month}-${day}_${hour}-${minute}-${seconds}`;
	}
}


export const goToSleep = (newExitCode: number): void => {
	setExitCode(newExitCode);
	process.kill(process.pid, 3);
};


export const computeServerDeployTime = (transitions_times_file: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"]["server"]
	return transitions_times_assembly["t_sa"]
		 + transitions_times_assembly["t_sc"].reduce((x: number, y: number) => x + y, 0)  // Sum of the list
		 + transitions_times_assembly["t_sr"];
};


export const computeDepDeployTime = (transitions_times_file: string, depName: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"][depName]
	return transitions_times_assembly["t_di"] + transitions_times_assembly["t_dr"];
};
