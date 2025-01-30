/**
 * A creep role responsible for harvesting energy and transporting it to structures as long as there are no harvesters.
 * If there are harvesters, then act like a hauler
 * @module
 */

import { Role } from "enums/role";
import { logUnknownState } from "utils/creep";

enum State {
	HarvestEnergy = 1,
	TransferEnergy = 2,
	PickupEnergy = 3,
	UpgradeController = 4
}

export function run(creep: Creep) {
	if (!creep.hasState()) {
		creep.setState(State.HarvestEnergy);
	}

	switch (creep.memory.state) {
		case State.HarvestEnergy:
			runHarvestEnergy(creep);
			break;
		case State.TransferEnergy:
			runTransferEnergy(creep);
			break;
		case State.PickupEnergy:
			runPickupEnergy(creep);
			break;
		case State.UpgradeController:
			runUpgradeController(creep);
			break;
		default:
			logUnknownState(creep);
			creep.setStateAndRun(State.HarvestEnergy, runHarvestEnergy);
			break;
	}
}

function runHarvestEnergy(creep: Creep) {
	if (creep.isFull()) {
		creep.say("🔋Transfer");
		creep.setStateAndRun(State.TransferEnergy, runTransferEnergy);
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
		creep.setStateAndRun(State.PickupEnergy, runPickupEnergy);
		return;
	}
	else if (creep.store[RESOURCE_ENERGY] === 0) {
		creep.say("⚡Harvest");
		creep.setStateAndRun(State.HarvestEnergy, runHarvestEnergy);
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
		creep.setStateAndRun(State.UpgradeController, runUpgradeController);
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
		creep.setStateAndRun(State.TransferEnergy, runTransferEnergy);
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
		creep.setStateAndRun(State.PickupEnergy, runPickupEnergy);
		return;
	}

	const { controller } = creep.room;
	if (controller) {
		if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
			creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffffff' } });
		}
	}
}
