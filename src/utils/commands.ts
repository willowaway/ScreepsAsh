/**
 * The commands utility provides global commands for the Screeps game console.
 * @module
 */

import { Role } from "enums/role";
import { error, info, verbose } from "utils/log";
import { createTestOperation, isTestOperationActive } from "utils/operation";

declare global {
	/* eslint-disable no-var */

	/**
	 * A global command to create a Test operation from the Screeps game console.
	 * @param duration (optional) The amount of time the operation will be active.
	 */
	var addTestOperation: (duration?: number) => string | void;
	var suicideAll: () => string;
	var suicideForagers: () => string;
	var clearOrders: (room: string | null) => string;
	/* eslint-enable no-var */
}

/**
 * Return log messages to the console instead of calling `console.log()`.
 */
global.addTestOperation = (duration = 50) => {
	if (duration < 10) {
		return error(
			"Test operation duration must be at least 10 ticks.",
			null,
			false
		);
	}
	if (isTestOperationActive()) {
		return error("Test operation is already active.", null, false);
	}
	return createTestOperation(duration, false);
};

global.suicideAll = () => {
	let numberDeleted = 0;
	for (const name in Game.creeps) {
		const creep = Game.creeps[name];
		creep.suicide();
		numberDeleted++;
	}
	return `Removed ${numberDeleted} creeps`;
}

global.suicideForagers = () => {
	let numberDeleted = 0;
	for (const name in Game.creeps) {
		const creep = Game.creeps[name];
		if (creep.memory.role === Role.Forager) {
			creep.suicide();
			numberDeleted++;
		}
	}
	return `Removed ${numberDeleted} creeps`;
}

/**
 * Clear orders queue for the specified room.
 * @param room The `Room` used to clear orders.
 */
global.clearOrders = (room: string | null) => {
	let numberOfOrders: number | undefined = 0;
	if (room) {
		numberOfOrders = Game.rooms[room].memory.orders?.length;
		Game.rooms[room].memory.orders = [];
		verbose("Clearing order queue for room", room);
	} else {
		for (const myRoomStr in Game.rooms) {
			numberOfOrders = Game.rooms[myRoomStr].memory.orders?.length;
			Game.rooms[myRoomStr].memory.orders = [];
			verbose("Clearing order queue for room", myRoomStr);
		}
	}
	return `Removed ${numberOfOrders} orders`;
}


