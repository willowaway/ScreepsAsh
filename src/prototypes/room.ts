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

		getSurroundingRooms(): string[];

		/** List all adjacent rooms that have available exits */
		getAdjacentRooms(): string[];

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

Room.prototype.getSurroundingRooms = function() {
	let westEastStr = this.name.charAt(0);
	const northCharIndex = this.name.indexOf("N");
	let northSouthStr = "S";
	if (northCharIndex != -1) {
		northSouthStr = "N";
	}

	const westEastNumberMatch = this.name.match(/-?\d+/); // Match first integer
	const westEastNumber = westEastNumberMatch ? parseInt(westEastNumberMatch[0]) : 0;

	var indexOfNorthSouthStr = this.name.indexOf(northSouthStr);
	var northSouthNumber = parseInt(this.name.substring(indexOfNorthSouthStr+1));

	// Left, Right, Top, Bottom, TopLeft, TopRight, BottomLeft, BottomRight
	const adjacentRooms = [
		westEastStr + (westEastNumber + 1) + northSouthStr + northSouthNumber,
		westEastStr + (westEastNumber - 1) + northSouthStr + northSouthNumber,
		westEastStr + westEastNumber + northSouthStr + (northSouthNumber + 1),
		westEastStr + westEastNumber + northSouthStr + (northSouthNumber - 1),
		westEastStr + (westEastNumber + 1) + northSouthStr + (northSouthNumber + 1),
		westEastStr + (westEastNumber - 1) + northSouthStr + (northSouthNumber + 1),
		westEastStr + (westEastNumber + 1) + northSouthStr + (northSouthNumber - 1),
		westEastStr + (westEastNumber - 1) + northSouthStr + (northSouthNumber - 1),
	];
	return adjacentRooms;
}

Room.prototype.getAdjacentRooms = function() {
	const exits = Game.map.describeExits(this.name);
	let rooms: string[] = [];

	if (exits[TOP] != null) {
		rooms.push(exits[TOP]);
	}
	if (exits[RIGHT] != null) {
		rooms.push(exits[RIGHT]);
	}
	if (exits[BOTTOM] != null) {
		rooms.push(exits[BOTTOM]);
	}
	if (exits[LEFT] != null) {
		rooms.push(exits[LEFT]);
	}

	return rooms;
}
