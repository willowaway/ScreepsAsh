var roleUpgrader = {

	/** @param {Creep} creep **/
	run: function(creep) {

		// Bringing energy to the controller, but has no energy, switch state to harvesting
		if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('🔄 Harvest');
		}

		// Harvesting energy, but is full, switch state to upgrading
		if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
		}

        // Upgrade the controller
		if(creep.memory.working) {
			creep.say('⚡ Upgrade');
			if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}
		// Harvest energy from source
		else {
			var sources = creep.room.find(FIND_SOURCES);
			if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		}
	}
};

module.exports = roleUpgrader;