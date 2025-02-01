import { Order } from 'classes/order';
import { Priority } from 'enums/priority';
import { Role } from 'enums/role';
import { Manager } from 'managers/manager';
import * as Starter from 'roles/starter';
import { CreepService } from 'services/creep';
import { RoomService } from 'services/room';
import { orderCreep } from 'utils/order';
import { getMaxTierSimple, getSimpleBody } from 'utils/profile';

/**
 * The `StartManager` class orchestrates the very beginning energy harvesting/hauling activities and behaviors of the first bot.
 *
 * This class should be utilized whenever you need to control and manage Starter creeps and their
 * associated tasks within the framework.
 */

export class StartManager extends Manager {
	private roomService: RoomService;
	private creepService: CreepService;

	readonly MEMORY_LASTRUN = 'lastRun';

	constructor(roomService: RoomService, creepService: CreepService) {
		super('StartManager');
		this.roomService = roomService;
		this.creepService = creepService;
	}

	public run(pri: Priority) {
		if (pri === Priority.Low) {
			this.creepService.runCreeps(Role.Starter, Starter.run);

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

		const starters = this.creepService.getCreeps(Role.Starter, null, room.name);

		const orderedStarters = this.creepService.getCreepsInQueue(room, Role.Starter);

		// Only have 1 starter per room
		if (starters.length + orderedStarters === 0) {

			const harvesters = this.creepService.getCreeps(Role.Harvester, null, room.name);
			const haulers = this.creepService.getCreeps(Role.Hauler, null, room.name);

			// Only spawn if there are no harvesters or haulers
			if (harvesters.length === 0 || haulers.length === 0) {
				const source = spawn.pos.findClosestByPath(FIND_SOURCES);
				if (source) {
					this.orderStarter(room, source.id, room.name);
				}
			}
		}
	}

	private orderStarter(room: Room, sourceId: string, sourceRoom: string) {

		const order = new Order();
		const sourceTarget = sourceRoom + '-' + sourceId;
		const maxTier = getMaxTierSimple(room.energyCapacityAvailable);
		order.body = getSimpleBody(maxTier);
		order.priority = Priority.Critical;
		order.memory = {
			role: Role.Starter,
			tier: maxTier,
			target: sourceTarget,
			homeroom: room.name
		};
		orderCreep(room, order);
	}
}
