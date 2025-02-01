import { Role } from 'enums/role';
import { warning } from 'utils/log';

/**
 * An object to organize creeps by role.
 */
type CreepDictionary = { [role in Role]?: Creep[] };

/**
 * A class to facilitate accessing creeps by role, target, or home room.
 */
export class CreepService {
    /**
     * An object containing all creeps in the colony.
     */
    private creepDictionary: CreepDictionary;

    constructor() {
        this.creepDictionary = this.makeDictionary();
    }

    /**
     * Checks if a creep should continue executing tasks.
     * @param creep The creep to consider.
     */
    public creepShouldRun(creep: Creep) {
        if (!creep.memory.homeroom) {
            creep.memory.homeroom = creep.room.name;
        }

        // Wait to run when creep is spawning
        if (creep.spawning) {
            return false;
        }

        // Add current state to creep._stateEvents
        if (creep.memory.state) {
            creep.setState(creep.memory.state);
        }

        return true;
    }

    /**
     * Instructs all creeps with a matching role to perform tasks using a specific method.
     * @param role The role that will be used to find relavent creeps.
     * @param creepRunMethod The method that will be used to run tasks.
     */
    public runCreeps(role: Role, creepRunMethod: Function) {
        const creepsWithRole = this.getAllOfRole(role);
        if (!creepsWithRole) {
            return;
        }
        for (const creep of creepsWithRole) {
            if (this.creepShouldRun(creep)) {
                creepRunMethod(creep, this);
            }
        }
    }

    /**
     * Fetch creeps by role, target, and/or homeroom.
     * @param role (optional) The role of creeps to be fetched.
     * @param target (optional) The target of creeps to be fetched.
     * @param homeroom (optional) The home room of creeps to be fetched.
     */
    public getCreeps(role: Role | null = null, target: string | null = null, homeroom: string | null = null) {
        const creeps: Creep[] = [];

        if (role !== null) {
            if (!this.creepDictionary[role]) {
                return creeps;
            }
            for (const creep of this.creepDictionary[role]!) {
                if (
                    (target === null || creep.memory.target === target) &&
                    (homeroom === null || creep.memory.homeroom === homeroom)
                ) {
                    creeps.push(creep);
                }
            }
            return creeps;
        }

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            if (
				(target === null || creep.memory.target === target) &&
                (homeroom === null || creep.memory.homeroom === homeroom) &&
                (role === null || creep.memory.role === role)
			) {
                creeps.push(creep);
            }
        }
        return creeps;
    }

	/**
     * Fetch creeps by role, targetRoom, and homeRoom.
     * @param role The role of creeps to be fetched.
     * @param target The target of creeps to be fetched.
				const creepDicTargetRoom = creep.memory.target.split("-")[0];
     */
    public getCreepsWithTargetRoom(targetRoom: string, role: Role | null = null, target: string | null = null, homeroom: string | null = null) {
        const creeps: Creep[] = [];

        if (role !== null) {
            if (!this.creepDictionary[role]) {
                return creeps;
            }
            for (const creep of this.creepDictionary[role]!) {
				if (creep.memory.target) {
					const creepDicTargetRoom = creep.memory.target.split("-")[0];
					if (
						(targetRoom === creepDicTargetRoom) &&
						(target === null || creep.memory.target === target) &&
						(homeroom === null || creep.memory.homeroom === homeroom)
					) {
						creeps.push(creep);
					}
				}
            }
            return creeps;
        }

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
			if (creep.memory.target) {
				const creepTargetRoom = creep.memory.target.split("-")[0];
				if (
					(targetRoom === creepTargetRoom) &&
					(target === null || creep.memory.target === target) &&
					(homeroom === null || creep.memory.homeroom === homeroom) &&
					(role === null || creep.memory.role === role)
				) {
					creeps.push(creep);
				}
			}
        }
        return creeps;
    }


	/**
	 * Get number of creep orders with same role and target, where either can be null to skip matching.
	 * @param room The `Room` used to find orders.
	 * @param role (optional) The `Role` to search for matching orders.
	 * @param target (optional) The target room name to search for matching orders.
	 */
	public getCreepsInQueue(room: Room | null = null, role: Role | null = null, target: string | null = null) {

		let count = 0;

		if (room) {
			if (!room.memory.orders) {
				room.memory.orders = [];
			}

			for (const order of room.memory.orders) {
				if (
					(target === null || order.memory.target === target) &&
					(role === null || order.memory.role === role)
				) {
					count++;
				}
			}
		} else {

			for (const myRoomStr in Game.rooms) {
				const myRoom = Game.rooms[myRoomStr];

				if (!myRoom.memory.orders) {
					myRoom.memory.orders = [];
				}

				for (const order of myRoom.memory.orders) {
					if (
						(target === null || order.memory.target === target) &&
						(role === null || order.memory.role === role)
					) {
						count++;
					}
				}
			}
		}
		return count;
	}

	/**
	 * Get number of creep orders with targetRoom with same role and target, where either can be null to skip matching.
	 * @param room The `Room` used to find orders.
	 * @param role (optional) The `Role` to search for matching orders.
	 * @param target (optional) The target room name to search for matching orders.
	 */
	public getCreepsInQueueWithTargetRoom(room: Room | null = null, targetRoom: string, role: Role | null = null, target: string | null = null) {


		let count = 0;

		if (room) {
			if (!room.memory.orders) {
				room.memory.orders = [];
			}

			for (const order of room.memory.orders) {
				if (order.memory.target) {
					const creepTargetRoom = order.memory.target.split("-")[0];

					if (
						(targetRoom === creepTargetRoom) &&
						(target === null || order.memory.target === target) &&
						(role === null || order.memory.role === role)
					) {
						count++;
					}
				}
			}
		} else {

			for (const myRoomStr in Game.rooms) {
				const myRoom = Game.rooms[myRoomStr];

				if (!myRoom.memory.orders) {
					myRoom.memory.orders = [];
				}

				for (const order of myRoom.memory.orders) {

				if (order.memory.target) {
					const creepTargetRoom = order.memory.target.split("-")[0];
					if (
						(targetRoom === creepTargetRoom) &&
						(target === null || order.memory.target === target) &&
						(role === null || order.memory.role === role)
						) {
							count++;
						}
					}
				}
			}
		}
		return count;
	}

    /**
     * Fetch creeps by role.
     * @param role The role of creeps to be fetched.
     */
    public getAllOfRole(role: Role) {
        if (this.creepDictionary[role]) {
            return this.creepDictionary[role];
        }
        return [];
    }

    /**
     * Creates an object of all creeps organized by role using `Game.creeps`.
     */
    protected makeDictionary() {
        const creeps: CreepDictionary = {};

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];

            if (creep.memory.role === undefined) {
                warning(`Creep ${creep.name} has no role`, creep.room.name);
                continue;
            }

            if (!creeps[creep.memory.role]) {
                creeps[creep.memory.role] = [];
            }
            creeps[creep.memory.role]!.push(creep);
        }
        return creeps;
    }
}
