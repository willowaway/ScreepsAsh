/**
 * A creep role that constructs structures.
 * @module
 */

import { logUnknownState } from 'utils/creep';
import { CreepState } from "enums/creepState";

export function run(creep: Creep) {
	if (!creep.hasState()) {
		creep.setState(CreepState.PickupEnergy);
	}

	switch (creep.memory.state) {
		case CreepState.PickupEnergy:
			runPickupEnergy(creep);
			break;
		case CreepState.PatchWall:
			runPatch(creep);
			break;
		case CreepState.BuildConstruction:
			runBuildConstruction(creep);
			break;
		case CreepState.UpgradeController:
			runUpgradeController(creep);
			break;
		default:
			logUnknownState(creep);
			creep.setStateAndRun(CreepState.PickupEnergy, runPickupEnergy);
			break;
	}
}

function runPatch(creep: Creep) {
	if (!creep.store[RESOURCE_ENERGY]) {
		creep.say('📦Pickup');
		creep.setStateAndRun(CreepState.PickupEnergy, runPickupEnergy);
		return;
	}

	var walls = creep.room.find(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_WALL
	});

	var target = undefined;
	// Loop with increasing percentages
	for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
		// Find a wall with less than percentage hits
		for (let wall of walls) {
			if (wall.hits / wall.hitsMax < percentage) {
				target = wall;
				break;
			}
		}

		// There is one, leave the loop
		if (target != undefined) {
			break;
		}
	}

	if (target != undefined) {
		if (creep.repair(target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
	} else {
		creep.say("🔨Build")
		creep.setStateAndRun(CreepState.BuildConstruction, runBuildConstruction);
	}
}

function runBuildConstruction(creep: Creep) {
	if (!creep.store[RESOURCE_ENERGY]) {
		creep.say('📦Pickup');
		creep.setStateAndRun(CreepState.PickupEnergy, runPickupEnergy);
		return;
	}

	const constructionSite = creep.room.find(FIND_CONSTRUCTION_SITES)?.[0];
	if (constructionSite) {
		if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
			creep.moveTo(constructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
		}
	} else {
		creep.say('⚡Upgrade');
		creep.setStateAndRun(CreepState.UpgradeController, runUpgradeController);
	}
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

function runPickupEnergy(creep: Creep) {

	if (creep.isFull()) {
		creep.say('🧱Patch');
		creep.setStateAndRun(CreepState.PatchWall, runPatch);
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

