/**
 * A creep role responsible for drop harvesting energy
 * @module
 */

import { logUnknownState } from "utils/creep";
import { CreepState } from "enums/creepState";

export function run(creep: Creep) {
	if (!creep.hasState()) {
		creep.setState(CreepState.HarvestEnergy);
	}

	switch (creep.memory.state) {
		case CreepState.HarvestEnergy:
			runHarvestEnergy(creep);
			break;
		default:
			logUnknownState(creep);
			creep.setStateAndRun(CreepState.HarvestEnergy, runHarvestEnergy);
			break;
	}
}

function runHarvestEnergy(creep: Creep) {
	const source = getTargetSource(creep);
	if (source) {
		if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
			creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
		}
	}
}

function getTargetSource(creep: Creep) {
	if (!creep.memory.source && creep.memory.target) {
		creep.memory.source = creep.memory.target.split("-")[1] as Id<Source>;
	}
	if (!creep.memory.source) {
		return null;
	}
	return Game.getObjectById(creep.memory.source);
}
