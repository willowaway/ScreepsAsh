import { Role } from 'enums/role';

export {};

declare global {
	interface Room {
		/** Finds the first owned spawn in a room if available. */
		getMySpawn(): StructureSpawn | undefined;

		/**
		 * Fetch creeps by role and/or target
		 * @param role (optional) The role of creeps to be fetched.
		 * @param target (optional) The target of creeps to be fetched.
		 */
		getCreeps(role: Role | null, target: string | null): Creep[];

		/** @private */
		_mySpawn?: StructureSpawn;
	}
}

Room.prototype.getMySpawn = function () {
	if (!this._mySpawn) {
		this._mySpawn = this.find(FIND_MY_SPAWNS)?.[0];
	}
	return this._mySpawn;
};


Room.prototype.getCreeps = function(role: Role | null = null, target: string | null = null) {
	const creeps: Creep[] = [];
	let creepsInRoom = this.find(FIND_MY_CREEPS);

	for (const creep of creepsInRoom) {
		if ((role === null || creep.memory.role === role) &&
				(target === null || creep.memory.target === target)){
			creeps.push(creep);
		}
	}

	return creeps;
}
