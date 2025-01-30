/**
 * A creep role that constructs structures.
 * @module
 */

import { logUnknownState } from 'utils/creep';

enum State {
	PickupEnergy = 1,
	BuildConstruction = 2,
	UpgradeController = 3,
}

export function run(creep: Creep) {
	if (!creep.hasState()) {
		creep.setState(State.PickupEnergy);
	}

	switch (creep.memory.state) {
		case State.PickupEnergy:
			runPickupEnergy(creep);
			break;
		case State.BuildConstruction:
			runBuildConstruction(creep);
			break;
		case State.UpgradeController:
			runUpgradeController(creep);
			break;
		default:
			logUnknownState(creep);
			creep.setStateAndRun(State.PickupEnergy, runPickupEnergy);
			break;
	}
}

function runBuildConstruction(creep: Creep) {
	if (!creep.store[RESOURCE_ENERGY]) {
		creep.say('📦Pickup');
		creep.setStateAndRun(State.PickupEnergy, runPickupEnergy);
		return;
	}

	const constructionSite = creep.room.find(FIND_CONSTRUCTION_SITES)?.[0];
	if (constructionSite) {
		if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
			creep.moveTo(constructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
		}
	} else {
		creep.say('⚡Upgrade');
		creep.setStateAndRun(State.UpgradeController, runUpgradeController);
	}
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

function runPickupEnergy(creep: Creep) {

	if (creep.isFull()) {
		creep.say('🔨Build');
		creep.setStateAndRun(State.BuildConstruction, runBuildConstruction);
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

