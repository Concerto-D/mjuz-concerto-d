import {globalVariables, newLogger, registerTimeValue, setExitCode, TimestampPeriod, TimestampType} from "@mjuz/core";
import * as fs from "fs";
import * as YAML from "yaml";

export const getScriptParameters = (assembly_name: string): [string, string, string, string, number, any] => {
	const config_file_path = process.argv[4];
	const timestamp_log_file = process.argv[5];
	const current_execution_dir = process.argv[6];
	const reconfiguration_name = process.argv[7];
	const nb_concerto_nodes = Number.parseInt(process.argv[8]);
	let depNum = null;
	if(assembly_name !== "server") {
		depNum = Number.parseInt(process.argv[9]);
	}

	return [
		config_file_path, 
		timestamp_log_file, 
		current_execution_dir,
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
		current_execution_dir,
		reconfiguration_name,
		nb_concerto_nodes,
		depNum
	] = getScriptParameters(assembly_type);
	globalVariables.execution_expe_dir = current_execution_dir;
	
	let assemblyName = "server";
	if (assembly_type === "dep") {
		assemblyName = `dep${depNum}`;
	}
	try {
		if (!fs.existsSync(current_execution_dir)) fs.mkdirSync(current_execution_dir);
	} catch {}
	try {
		if (!fs.existsSync(`${current_execution_dir}/logs`)) fs.mkdirSync(`${current_execution_dir}/logs`);
	} catch {}
	const logger = newLogger('pulumi',  `${current_execution_dir}/logs/logs_${assemblyName}`);
	logger.info("---------------------------------- Waking up hello everyone ----------------------------------------------------")
	// Initialization timestamp log dir
	initTimeLogDir("server", current_execution_dir, timestamp_log_file, logger);
	
	// Get location of nodes
	const inventory = YAML.parse(fs.readFileSync(`${current_execution_dir}/inventory.yaml`, "utf-8"))
	
	// Set duration timeout (always 30 seconds)
	// let t = 30000;
	// if (reconfiguration_name === "update") {
	// 	t = 300000;
	// }
	setTimeout(() => goToSleep(0), 30000);
	
	// Compute server deployment time
	let installTime;
	let runningTime;
	let updateTime;
	if(assemblyName === "server") {
		installTime = computeServerInstallTime(config_file_path);
		runningTime = computeServerRunningTime(config_file_path);
		updateTime = computeServerUpdateTime(config_file_path);
	}
	else {
		installTime = computeDepInstallTime(config_file_path, assemblyName);
		runningTime = computeDepRunningTime(config_file_path, assemblyName);
		updateTime = computeDepUpdateTime(config_file_path, assemblyName);
	}
	// const deployTime = 20;
	
	return [
		config_file_path,
		timestamp_log_file,
		current_execution_dir,
		reconfiguration_name,
		nb_concerto_nodes,
		depNum,
		inventory,
		installTime,
		runningTime,
		updateTime,
		logger
	]
}

export const initTimeLogDir = (assemblyName: string, current_execution_dir: string, logDirTimestamp: string | null, logger: any): void => {
	
	if(!fs.existsSync(current_execution_dir)) {
		try {
			fs.mkdirSync(current_execution_dir);
		}
		catch {
			logger.info(`------ RACE CONDITION HANDLED BY EXCEPTION: FOLDER ${current_execution_dir} WAS ALREADY CREATED`);
		}
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


export const computeServerInstallTime = (transitions_times_file: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"]["server"]
	
	return transitions_times_assembly["t_sa"]
		 + transitions_times_assembly["t_sc"].reduce((x: number, y: number) => x + y, 0)  // Sum of the list
};

export const computeServerUpdateTime = (transitions_times_file: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"]["server"]
	
	return transitions_times_assembly["t_ss"].reduce((x: number, y: number) => x + y, 0)
		 + transitions_times_assembly["t_sp"].reduce((x: number, y: number) => x + y, 0)
};

export const computeServerRunningTime = (transitions_times_file: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"]["server"]
	
	return transitions_times_assembly["t_sr"];
};

export const computeDepRunningTime = (transitions_times_file: string, assemblyName: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"][assemblyName]
	
	return transitions_times_assembly["t_dr"];
};

export const computeDepInstallTime = (transitions_times_file: string, depName: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"][depName]
	
	return transitions_times_assembly["t_di"];
};

export const computeDepUpdateTime = (transitions_times_file: string, depName: string): number => {
	const transitions_times = JSON.parse(fs.readFileSync(transitions_times_file, "utf-8"));
	const transitions_times_assembly = transitions_times["transitions_times"][depName]

	return transitions_times_assembly["t_du"];
};
