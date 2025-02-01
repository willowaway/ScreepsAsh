/**
 * A creep role responsible for harvesting energy and transporting it to structures as long as there are no harvesters.
 * If there are harvesters, then act like a hauler
 * @module
 */

import { Role } from "enums/role";
import { CreepState } from "enums/creepState";
import { logUnknownState } from "utils/creep";

export function run(creep: Creep) {
	if (!creep.hasState()) {
		creep.setState(CreepState.HarvestEnergy);
	}

	switch (creep.memory.state) {
		case CreepState.HarvestEnergy:
			runHarvestEnergy(creep);
			break;
		case CreepState.TransferEnergy:
			runTransferEnergy(creep);
			break;
		case CreepState.PickupEnergy:
			runPickupEnergy(creep);
			break;
		case CreepState.UpgradeController:
			runUpgradeController(creep);
			break;
		default:
			logUnknownState(creep);
			creep.setStateAndRun(CreepState.HarvestEnergy, runHarvestEnergy);
			break;
	}
}

function runHarvestEnergy(creep: Creep) {
	if (creep.isFull()) {
		creep.say("🔋Transfer");
		creep.setStateAndRun(CreepState.TransferEnergy, runTransferEnergy);
		return;
	}

	const source = getTargetSource(creep);
	if (source) {
		// If creep is in the way of a harvester that is trying to get to the last spot available
		if (creep.room.getCreeps(Role.Harvester, creep.room.name + '-' + source.id).length < source.getMaxNumberOfHarvesters()) {
			if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
				creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
			}
		} else {
			creep.suicide();
		}
	}
}

function runTransferEnergy(creep: Creep) {
	// Only harvest energy if there are no harvesters, otherwise just act like a Hauler, as long as there is dropped energy to pickup
	if (creep.store[RESOURCE_ENERGY] === 0 && creep.room.getCreeps(Role.Harvester, null).length > 0 && getClosestDroppedEnergy(creep)) {
		creep.say("📦Pickup");
		creep.setStateAndRun(CreepState.PickupEnergy, runPickupEnergy);
		return;
	}
	else if (creep.store[RESOURCE_ENERGY] === 0) {
		creep.say("⚡Harvest");
		creep.setStateAndRun(CreepState.HarvestEnergy, runHarvestEnergy);
		return;
	}

	const targetStructure = creep.room.find(FIND_STRUCTURES, {
		filter: (structure) =>
			(structure.structureType === STRUCTURE_EXTENSION ||
				structure.structureType === STRUCTURE_SPAWN ||
				structure.structureType === STRUCTURE_TOWER) &&
			structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
	})?.[0];

	if (targetStructure) {
		if (creep.transfer(targetStructure, RESOURCE_ENERGY) ===ERR_NOT_IN_RANGE) {
			creep.moveTo(targetStructure, {
				visualizePathStyle: { stroke: "#ffffff" },
			});
		}
	} else {
		creep.say('⚡Upgrade');
		creep.setStateAndRun(CreepState.UpgradeController, runUpgradeController);
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

function runPickupEnergy(creep: Creep) {

	if (creep.isFull()) {
		creep.say('🔋Transfer');
		creep.setStateAndRun(CreepState.TransferEnergy, runTransferEnergy);
		return;
	}

	const closestDroppedEnergy = getClosestDroppedEnergy(creep);
	if (closestDroppedEnergy) {
		if (creep.pickup(closestDroppedEnergy) === ERR_NOT_IN_RANGE) {
			creep.moveTo(closestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
		}
	}
}

function getClosestDroppedEnergy(creep: Creep) {
	const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
		filter: resource => resource.resourceType == RESOURCE_ENERGY &&
							resource.amount >= 25
	});

	return creep.pos.findClosestByRange(droppedEnergy);
}


function runUpgradeController(creep: Creep) {
	if (!creep.store[RESOURCE_ENERGY]) {
		creep.say('📦Pickup');
		creep.setStateAndRun(CreepState.PickupEnergy, runPickupEnergy);
		return;
	}

	const { controller } = creep.room;
	if (controller) {
		if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
			creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffffff' } });
		}
	}
}
