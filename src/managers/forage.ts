import { Order } from 'classes/order';
import { Priority } from 'enums/priority';
import { Role } from 'enums/role';
import _ from 'lodash';
import { Manager } from 'managers/manager';
import * as Forager from 'roles/forager';
import { CreepService } from 'services/creep';
import { RoomService } from 'services/room';
import { orderCreep } from 'utils/order';
import { getMaxTierForager, getForagerBody } from 'utils/profile';
import { CreepState } from "enums/creepState";

/**
 * The `BuildManager` class orchestrates the build-related activities and behaviors of the bot.
 *
 * This class should be utilized whenever you need to control and manage Builder creeps and their
 * associated tasks within the framework.
 */

export class ForageManager extends Manager {
	private roomService: RoomService;
	private creepService: CreepService;

	readonly MEMORY_LASTRUN = 'lastRun';

	constructor(roomService: RoomService, creepService: CreepService) {
		super('ForageManager');
		this.roomService = roomService;
		this.creepService = creepService;
	}

	public run(pri: Priority) {
		if (pri === Priority.Low) {
			this.creepService.runCreeps(Role.Forager, Forager.run);

			const lastRun = this.getValue(this.MEMORY_LASTRUN);
			if (!lastRun || lastRun + 20 < Game.time) {
				const rooms = this.roomService.getNormalRooms();
				for (const room of rooms) {
					this.organizeForaging(room);
				}
				this.setValue(this.MEMORY_LASTRUN, Game.time);
			}
		}
	}

	private isMaximumNumberHaulerHarvesterUpgrader(room: Room) {
		// Do not spawn a forager if there is not the maximum number of haulers in the room
		const sourcesInHomeRoom = room.find(FIND_SOURCES);
		const numberOfHaulers = this.creepService.getCreeps(Role.Hauler, null, room.name).length;
		let maxNumberOfHaulersInRoom = sourcesInHomeRoom.length - 1;
		if (numberOfHaulers < maxNumberOfHaulersInRoom) {
			return false;
		}

		// Do not spawn a forager if there is not the maximum number of harvesters in the room
		const numberOfHarvesters = this.creepService.getCreeps(Role.Harvester, null, room.name).length;
		let maxNumberOfHarvestersInRoom = 0;
		for (const source of sourcesInHomeRoom) {
			maxNumberOfHarvestersInRoom += source.getMaxNumberOfHarvesters();
		}
		if (numberOfHarvesters < maxNumberOfHarvestersInRoom) {
			return false;
		}

		// Do not spawn a forager if there is not the maximum number of upgraders in the room
		const controller = room.controller;
		if (controller) {
			const numberOfUpgraders = this.creepService.getCreeps(Role.Upgrader, controller.id).length;
			let maxNumberOfUpgradersInRoom = 1;
			if (numberOfUpgraders < maxNumberOfUpgradersInRoom) {
				return false;
			}
		}
		return true;
	}

	private getTargetAdjacentRoom(spawn: StructureSpawn, room: Room) {

		const adjacentRooms = room.getAdjacentRooms();

		// Get sources in adjacent room that are not at max capacity for foragers
		let sources: Source[] = [];
		for (const adjacentRoomStr of adjacentRooms){
			const adjacentRoom = Game.rooms[adjacentRoomStr];
			// Will only be defined if we have a creep in the room, so first we must send forager scouts
			if (adjacentRoom) {
				const sourcesInAdjacentRoom = adjacentRoom.find(FIND_SOURCES);
				for (const source of sourcesInAdjacentRoom) {
					const maxNumberOfHarvesters = source.getMaxNumberOfHarvesters();
					const sourceTarget = adjacentRoom.name + '-' + source.id;
					const numberOfForagersTargettingSource = this.creepService.getCreeps(Role.Forager, sourceTarget, room.name).length;
					const numberOfOrderedForagersTargettingSource = this.creepService.getCreepsInQueue(null, Role.Forager, sourceTarget);
					if (numberOfForagersTargettingSource + numberOfOrderedForagersTargettingSource < maxNumberOfHarvesters) {
						sources.push(source);
					}
				}
			}
		}

		// Will only be defined if we already have a creep in the target adjacent rooms
		if (sources.length) {
			let goals = _.map(sources, function(source) {
				// We can't actually walk on sources-- set `range` to 1
				// so we path next to it.
				return { pos: source.pos, range: 1 };
			});
			let ret = PathFinder.search(spawn.pos, goals);
			const targetRoomName = ret.path[ret.path.length - 1].roomName;

			return targetRoomName;
		}
		// There are no creeps in any target adjacent rooms OR
		// The sources in the visible target adjacent rooms are at max capacity
		// Time for the forager to scout one of the adjacent rooms that does not already have a forager that is targeting that room
		else {
			for (const adjacentRoomStr of adjacentRooms) {
				const foragersWithTargetRoom = this.creepService.getCreepsWithTargetRoom(adjacentRoomStr, Role.Forager);
				const numberOfForagersInQueueTargettingRoom = this.creepService.getCreepsInQueueWithTargetRoom(null, adjacentRoomStr, Role.Forager);

				if (foragersWithTargetRoom.length + numberOfForagersInQueueTargettingRoom === 0) {
					return adjacentRoomStr;
				}
			}
		}
	}

	/**
	 * A forager should be created when the following conditions are met.
	 * There are the maximum number of haulers for the sources in the room.
	 * There are the maximum number of harvesters at all sources in the room.
	 * There are the maximum number of upgraders for the room
	 * The target available adjacent room is undefined and for the room
	 * 		(there is not a scout or forager with this room as a target) or
	 * 		(a scout or forager in the queue with this room as a target)
	 */
	private organizeForaging(room: Room) {
		const spawn = room.getMySpawn();
		if (!spawn) {
			return;
		}

		if (this.isMaximumNumberHaulerHarvesterUpgrader(room) === false){
			return;
		}

		const targetRoomStr = this.getTargetAdjacentRoom(spawn, room);
		if (!targetRoomStr) {
			return;
		}

		const targetRoom = Game.rooms[targetRoomStr];
		// Target room is visible so we can get information about the sources in the target room
		if (targetRoom) {

			const sourcesInTargetRoom = targetRoom.find(FIND_SOURCES);
			for (const sourceInTargetRoom of sourcesInTargetRoom) {
				const maxNumberOfHarvesters = sourceInTargetRoom.getMaxNumberOfHarvesters();
				const sourceTarget = targetRoomStr + '-' + sourceInTargetRoom.id;
				const numberOfForagersTargettingSource = this.creepService.getCreeps(Role.Forager, sourceTarget).length;
				const numberOfOrderedForagersTargettingSource = this.creepService.getCreepsInQueue(null, Role.Forager, sourceTarget);

				if (numberOfForagersTargettingSource + numberOfOrderedForagersTargettingSource < maxNumberOfHarvesters) {
					for (let index = numberOfForagersTargettingSource + numberOfOrderedForagersTargettingSource; index < maxNumberOfHarvesters; index++) {
						this.orderForager(room, CreepState.HarvestEnergy, sourceInTargetRoom.id, targetRoomStr);
					}
				}
			}
		}
		// Target room is not visible, send the forager to scout
		else {
			const numberOfForagersTargettingRoom = this.creepService.getCreepsWithTargetRoom(targetRoomStr, Role.Forager).length;
			const numberOfForagersInQueueTargettingRoom = this.creepService.getCreepsInQueueWithTargetRoom(null, targetRoomStr, Role.Forager);

			if (numberOfForagersTargettingRoom + numberOfForagersInQueueTargettingRoom === 0) {
				this.orderForager(room, CreepState.ScoutAdjacent, null, targetRoomStr);
			}
		}
	}

	private orderForager(room: Room, state: CreepState, sourceId: string | null, sourceRoom: string) {


		let sourceTarget = sourceRoom + '-';

		if (sourceId != null) {
			sourceTarget += sourceId;
		}

		const order = new Order();
		const maxTier = getMaxTierForager(room.energyCapacityAvailable);
		order.body = getForagerBody(maxTier);
		order.priority = Priority.Low;
		order.memory = {
			role: Role.Forager,
			tier: maxTier,
			state: state,
			target: sourceTarget,
			homeroom: room.name
		};
		orderCreep(room, order);
	}
}
