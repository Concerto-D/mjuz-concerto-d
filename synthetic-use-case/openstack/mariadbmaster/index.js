"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mjuz/core");
const resources_1 = require("@mjuz/core/resources");
const hareactive_1 = require("@funkia/hareactive");
const sleepingComponent_1 = require("../../sleepingComponent");
const metricAnalysis_1 = require("../../metricAnalysis");
const compName = "mariadbmaster";
const [targetDeployment, nbScalingNodes, scalingNum, inventory, installTime, runningTime, updateTime, logger] = metricAnalysis_1.initializeReconf(compName);
const timestampType = targetDeployment === "deploy" ? core_1.TimestampType.DEPLOY : core_1.TimestampType.UPDATE;
let timestampRegistered = false;
const program = () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Reconf starts");
    if (!timestampRegistered) {
        core_1.registerTimeValue(timestampType, core_1.TimestampPeriod.START);
        timestampRegistered = true;
    }
    // Create component
    const mariadbmasterResource = new sleepingComponent_1.SleepingComponentResource(`${compName}Res${targetDeployment}`, { reconfState: targetDeployment, timeCreate: 7.0, timeDelete: 3.0, depsOffers: [] });
    // Provide component to keystone
    const [keystoneHost, keystonePort] = inventory["keystone0"].split(":");
    const keystoneConnection = new resources_1.RemoteConnection(`keystone0`, { port: Number.parseInt(keystonePort), host: keystoneHost });
    new resources_1.Offer(keystoneConnection, `${compName}Provide`, mariadbmasterResource);
    mariadbmasterResource.id.apply(mariadbmasterResourceId => {
        if (mariadbmasterResourceId === targetDeployment) {
            metricAnalysis_1.goToSleep(50);
        }
    });
    return {
        mariadbmasterResourceId: mariadbmasterResource.id
    };
});
const initStack = core_1.getStack({
    program: core_1.emptyProgram,
    projectName: `${compName}Project`,
    stackName: `${compName}Stack`,
}, { workDir: '.' });
const deploymentPort = Number.parseInt(inventory[compName].split(":")[1]);
core_1.runDeployment(initStack, core_1.operations(hareactive_1.Behavior.of(program)), (offerUpdates) => core_1.nextAction(offerUpdates, core_1.sigquit(), core_1.sigint()), { deploymentName: compName, resourcesPort: deploymentPort - 1, deploymentPort: deploymentPort });
