import { Order } from 'classes/order';
import { Priority } from 'enums/priority';
import { Role } from 'enums/role';
import { Manager } from 'managers/manager';
import * as Hauler from 'roles/hauler';
import { CreepService } from 'services/creep';
import { RoomService } from 'services/room';
import { getCreepsInQueue, orderCreep } from 'utils/order';
import { getHaulerBody, getMaxTierHauler } from 'utils/profile';

/**
 * The `HaulManager` class orchestrates the energy picking up/transferring activities and behaviors of the bot.
 *
 * This class should be utilized whenever you need to control and manage Hauler creeps and their
 * associated tasks within the framework.
 */

export class HaulManager extends Manager {
	private roomService: RoomService;
	private creepService: CreepService;

	readonly MEMORY_LASTRUN = 'lastRun';

	constructor(roomService: RoomService, creepService: CreepService) {
		super('HaulManager');
		this.roomService = roomService;
		this.creepService = creepService;
	}

	public run(pri: Priority) {
		if (pri === Priority.Low) {
			this.creepService.runCreeps(Role.Hauler, Hauler.run);

			const lastRun = this.getValue(this.MEMORY_LASTRUN);
			if (!lastRun || lastRun + 20 < Game.time) {
				const rooms = this.roomService.getNormalRooms();
				for (const room of rooms) {
					this.organizeEnergyHauling(room);
				}
				this.setValue(this.MEMORY_LASTRUN, Game.time);
			}
		}
	}

	private organizeEnergyHauling(room: Room) {
		const sources = room.find(FIND_SOURCES);
		for (const source of sources) {
			this.orderHauler(room, room.name);
		}
	}

	private orderHauler(room: Room, sourceRoom: string) {
		const spawn = room.getMySpawn();
		if (!spawn) {
			return;
		}

		const active = this.creepService.getCreeps(Role.Hauler, null, room.name).length;
		const ordered = getCreepsInQueue(room, Role.Hauler);

		if (active + ordered === 0) {
			const order = new Order();
			const maxTier = getMaxTierHauler(room.energyCapacityAvailable);
			order.body = getHaulerBody(maxTier);
			if (room.name === sourceRoom) {
				order.priority = Priority.Important;
			} else {
				order.priority = Priority.Standard;
			}
			order.memory = {
				role: Role.Hauler,
				tier: maxTier,
				homeroom: room.name
			};
			orderCreep(room, order);
		}
	}
}
