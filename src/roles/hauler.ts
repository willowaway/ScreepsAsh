/**
 * A creep role responsible for picking up energy from the ground and hauling it back to structures
 * @module
 */

import { Role } from 'enums/role';
import { logUnknownState } from 'utils/creep';

enum State {
	PickupEnergy = 1,
	TransferEnergy = 2
}

export function run(creep: Creep) {
	if (!creep.hasState()) {
		creep.setState(State.PickupEnergy);
	}

	switch (creep.memory.state) {
		case State.PickupEnergy:
			runPickupEnergy(creep);
			break;
		case State.TransferEnergy:
			runTransferEnergy(creep);
			break;
		default:
			logUnknownState(creep);
			creep.setStateAndRun(State.PickupEnergy, runPickupEnergy);
			break;
	}
}

function runTransferEnergy(creep: Creep) {

	if (creep.store[RESOURCE_ENERGY] === 0) {
		creep.say('📦Pickup');
		creep.setStateAndRun(State.PickupEnergy, runPickupEnergy);
		return;
	}

	const targetStructure = creep.room.find(FIND_STRUCTURES, {
		filter: structure =>
			(structure.structureType === STRUCTURE_EXTENSION ||
				structure.structureType === STRUCTURE_SPAWN ||
				structure.structureType === STRUCTURE_TOWER) &&
			structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
	})?.[0];

	if (targetStructure) {
		if (creep.transfer(targetStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
			creep.moveTo(targetStructure, { visualizePathStyle: { stroke: '#ffffff' } });
		}
	}
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

