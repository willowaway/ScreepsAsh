// Claims controllers
var roleClaimer = {

	/** @param {Creep} creep **/
	run: function(creep) {

		// Find the exit towards to target room
		if (creep.room.name != creep.memory.target) {
			const exitDir = creep.room.findExitTo(creep.memory.target);
			const exit = creep.pos.findClosestByRange(exitDir);
			creep.moveTo(exit);
		}
		// Claim controller
		else {
			if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		}
	}
};

module.exports = roleClaimer;