var roleUpgrader = require('role.upgrader');

var roleBuilder = {

	/** @param {Creep} creep **/
	run: function(creep) {

		// Trying to complete construction site, but has no energy left, switch state to harvesting
		if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('🔄 Harvest');
		}
		// Harvesting energy, but is full, switch state to building || upgrade
		if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
		}

		// Complete construction site
		if(creep.memory.working) {
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if(targets.length) {
				creep.say('🚧 Build');
				if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
			// No construction site is found, go upgrade the controller
			else {
				roleUpgrader.run(creep);
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

module.exports = roleBuilder;