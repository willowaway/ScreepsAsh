import { Order } from 'classes/order';
import { Priority } from 'enums/priority';
import { Role } from 'enums/role';
import { Manager } from 'managers/manager';
import * as Harvester from 'roles/harvester';
import { CreepService } from 'services/creep';
import { RoomService } from 'services/room';
import { orderCreep } from 'utils/order';
import { getMaxTierSimple, getSimpleBody } from 'utils/profile';

/**
 * The `HarvestManager` class orchestrates the energy harvesting activities and behaviors of the bot.
 *
 * This class should be utilized whenever you need to control and manage Harvester creeps and their
 * associated tasks within the framework.
 */

export class HarvestManager extends Manager {
	private roomService: RoomService;
	private creepService: CreepService;

	readonly MEMORY_LASTRUN = 'lastRun';

	constructor(roomService: RoomService, creepService: CreepService) {
		super('HarvestManager');
		this.roomService = roomService;
		this.creepService = creepService;
	}

	public run(pri: Priority) {
		if (pri === Priority.Low) {
			this.creepService.runCreeps(Role.Harvester, Harvester.run);

			const lastRun = this.getValue(this.MEMORY_LASTRUN);
			if (!lastRun || lastRun + 20 < Game.time) {
				const rooms = this.roomService.getNormalRooms();
				for (const room of rooms) {
					this.organizeEnergyHarvesting(room);
				}
				this.setValue(this.MEMORY_LASTRUN, Game.time);
			}
		}
	}

	private organizeEnergyHarvesting(room: Room) {
		const spawn = room.getMySpawn();
		if (!spawn) {
			return;
		}

		const sources = room.find(FIND_SOURCES);
		for (const source of sources) {
			const maxNumberOfHarvesters = source.getMaxNumberOfHarvesters();
			const sourceTarget = room.name + '-' + source.id;
			const numberOfHarvestersTargettingSource = this.creepService.getCreeps(Role.Harvester, sourceTarget, room.name).length;
			const numberOfOrderedHarvestersTargettingSource = this.creepService.getCreepsInQueue(room, Role.Harvester, sourceTarget);

			if (numberOfHarvestersTargettingSource + numberOfOrderedHarvestersTargettingSource < maxNumberOfHarvesters) {
				for (let index = 0; index < maxNumberOfHarvesters; index++) {
					this.orderHarvester(room, source.id, room.name);
				}
			}
		}
	}

	private orderHarvester(room: Room, sourceId: string, sourceRoom: string) {

		const order = new Order();
		const sourceTarget = sourceRoom + '-' + sourceId;
		const maxTier = getMaxTierSimple(room.energyCapacityAvailable);
		order.body = getSimpleBody(maxTier);
		if (room.name === sourceRoom) {
			order.priority = Priority.Important;
		} else {
			order.priority = Priority.Standard;
		}
		order.memory = {
			role: Role.Harvester,
			tier: maxTier,
			target: sourceTarget,
			homeroom: room.name
		};
		orderCreep(room, order);
	}
}
