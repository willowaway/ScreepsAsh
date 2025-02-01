import { Order } from 'classes/order';
import { Priority } from 'enums/priority';
import { Role } from 'enums/role';
import { Manager } from 'managers/manager';
import * as Repairer from 'roles/repairer';
import { CreepService } from 'services/creep';
import { RoomService } from 'services/room';
import { orderCreep } from 'utils/order';
import { getMaxTierSimple, getSimpleBody } from 'utils/profile';

/**
 * The `BuildManager` class orchestrates the build-related activities and behaviors of the bot.
 *
 * This class should be utilized whenever you need to control and manage Builder creeps and their
 * associated tasks within the framework.
 */

export class RepairManager extends Manager {
	private roomService: RoomService;
	private creepService: CreepService;

	readonly MEMORY_LASTRUN = 'lastRun';

	constructor(roomService: RoomService, creepService: CreepService) {
		super('RepairManager');
		this.roomService = roomService;
		this.creepService = creepService;
	}

	public run(pri: Priority) {
		if (pri === Priority.Low) {
			this.creepService.runCreeps(Role.Repairer, Repairer.run);

			const lastRun = this.getValue(this.MEMORY_LASTRUN);
			if (!lastRun || lastRun + 20 < Game.time) {
				const rooms = this.roomService.getNormalRooms();
				this.organizeStructureBuilding(rooms);
				this.setValue(this.MEMORY_LASTRUN, Game.time);
			}
		}
	}

	private organizeStructureBuilding(rooms: Room[]) {
		for (const room of rooms) {
			this.orderRepairer(room);
		}
	}

	private orderRepairer(room: Room) {
		const active = this.creepService.getCreeps(Role.Repairer, null, room.name).length;
		const ordered = this.creepService.getCreepsInQueue(room, Role.Repairer);

		if (active + ordered === 0) {
			const order = new Order();
			const maxTier = getMaxTierSimple(room.energyCapacityAvailable);
			order.body = getSimpleBody(maxTier);
			order.priority = Priority.Standard;
			order.memory = {
				role: Role.Repairer,
				tier: maxTier,
				homeroom: room.name
			};
			orderCreep(room, order);
		}
	}
}
