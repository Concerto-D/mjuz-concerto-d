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
const [targetDeployment, nbScalingNodes, scalingNum, inventory, installTime, runningTime, updateTime, logger] = metricAnalysis_1.initializeReconf("neutron");
const compName = `neutron${scalingNum}`;
const timestampType = targetDeployment === "deploy" ? core_1.TimestampType.DEPLOY : core_1.TimestampType.UPDATE;
let timestampRegistered = false;
const program = () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("Reconf starts");
    // Reconf starts
    if (!timestampRegistered) {
        core_1.registerTimeValue(timestampType, core_1.TimestampPeriod.START);
        timestampRegistered = true;
    }
    // Resolve keystone wish
    const [workerHost, workerPort] = inventory["worker0"].split(":");
    const workerConnection = new resources_1.RemoteConnection(`worker0`, { port: Number.parseInt(workerPort), host: workerHost });
    let keystoneResWish = new resources_1.Wish(workerConnection, `keystoneProvide`);
    // Create component
    const neutronResource = new sleepingComponent_1.SleepingComponentResource(`${compName}Res${targetDeployment}`, { reconfState: keystoneResWish.offer, timeCreate: 2.0, timeDelete: 3.0, depsOffers: [keystoneResWish.offer] });
    neutronResource.id.apply(neutronResourceId => {
        if (neutronResourceId === targetDeployment) {
            // Reconf ends
            metricAnalysis_1.goToSleep(50);
        }
    });
    return {
        neutronResourceId: neutronResource.id
    };
});
const initStack = core_1.getStack({
    program: core_1.emptyProgram,
    projectName: `${compName}Project`,
    stackName: `${compName}Stack`,
}, { workDir: '.' });
const deploymentPort = Number.parseInt(inventory[compName].split(":")[1]);
core_1.runDeployment(initStack, core_1.operations(hareactive_1.Behavior.of(program)), (offerUpdates) => core_1.nextAction(offerUpdates, core_1.sigquit(), core_1.sigint()), { deploymentName: compName, resourcesPort: deploymentPort - 1, deploymentPort: deploymentPort });
