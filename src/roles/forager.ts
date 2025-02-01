/**
 * A creep role that constructs structures.
 * @module
 */

import { logUnknownState } from 'utils/creep';
import { CreepService } from 'services/creep';
import { Role } from 'enums/role';
import { CreepState } from "enums/creepState";

export function run(creep: Creep, creepService: CreepService) {
	if (!creep.hasState()) {
		creep.setState(CreepState.ScoutAdjacent);
	}

	switch (creep.memory.state) {
		case CreepState.ScoutAdjacent:
			runScoutAdjacent(creep, creepService);
		case CreepState.HarvestEnergy:
			runHarvestEnergy(creep);
			break;
		case CreepState.PickupEnergy:
			runPickupEnergy(creep);
			break;
		case CreepState.TransferEnergy:
			runTransferEnergy(creep);
			break;
		case CreepState.BuildConstruction:
			runBuildConstruction(creep);
			break;
		case CreepState.UpgradeController:
			runUpgradeController(creep);
			break;
		default:
			logUnknownState(creep);
			creep.setStateAndRun(CreepState.ScoutAdjacent, runScoutAdjacent);
			break;
	}
}

function runScoutAdjacent(creep: Creep, creepService: CreepService) {

	const targetSource = getTargetSource(creep);
	if (targetSource) {
		creep.say("⚡Harvest");
		creep.setStateAndRun(CreepState.HarvestEnergy, runHarvestEnergy);
	} else {
		const targetRoomStr = getTargetRoom(creep);
		if (targetRoomStr) {
			const targetRoom = Game.rooms[targetRoomStr];
			// Target room is visible, lets try to set the target source
			if (targetRoom) {

				const sourcesInTargetRoom = targetRoom.find(FIND_SOURCES);
				for (const sourceInTargetRoom of sourcesInTargetRoom) {
					const maxNumberOfHarvesters = sourceInTargetRoom.getMaxNumberOfHarvesters();
					const sourceTarget = targetRoomStr + '-' + sourceInTargetRoom.id;
					const numberOfForagersTargettingSource = creepService.getCreeps(Role.Forager, sourceTarget, null).length;
					const numberOfOrderedForagersTargettingSource = creepService.getCreepsInQueue(null, Role.Forager, sourceTarget);

					if (numberOfForagersTargettingSource + numberOfOrderedForagersTargettingSource <= maxNumberOfHarvesters) {
						creep.memory.target = sourceTarget;
						creep.say("⚡Harvest");
						creep.setStateAndRun(CreepState.HarvestEnergy, runHarvestEnergy);
					}
				}
			}
			// Target room is not visible, scout/move to that room
			else {
				creep.moveTo(new RoomPosition(25, 25, targetRoomStr), { visualizePathStyle: { stroke: "#ffaa00" } });
			}
		}
	}
}


function runHarvestEnergy(creep: Creep) {
	const source = getTargetSource(creep);

	if (source) {
		if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
			creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
		}
	} else if (creep.pos.x === 0 || creep.pos.y === 0 || creep.pos.x === 49 || creep.pos.y === 49) {
		creep.moveTo(new RoomPosition(25, 25, creep.room.name), { visualizePathStyle: { stroke: "#ffaa00" } });
	} else {
		creep.say('👁️Scout');
		creep.setStateAndRun(CreepState.ScoutAdjacent, runScoutAdjacent);
	}
}

/** Can only get the target source if creep is in the room */
function getTargetSource(creep: Creep) {
	if (!creep.memory.source && creep.memory.target) {
		creep.memory.source = creep.memory.target.split("-")[1] as Id<Source>;
	}
	if (!creep.memory.source) {
		return null;
	}
	return Game.getObjectById(creep.memory.source);
}

function getTargetRoom(creep: Creep) {
	if (creep.memory.target) {
		return creep.memory.target.split("-")[0];
	} else {
		console.log(`${creep.name} in ${creep.memory.homeroom} does not have a target.`);
		return null;
	}
}

function runTransferEnergy(creep: Creep) {

	if (creep.store[RESOURCE_ENERGY] === 0) {
		creep.say('📦Pickup');
		creep.setStateAndRun(CreepState.PickupEnergy, runPickupEnergy);
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
	} else {
		creep.say('🔨Build');
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

