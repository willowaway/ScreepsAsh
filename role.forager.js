// Harvests source from rooms outside of starting room
var roleForager = {

	/** @param {Creep} creep **/
	run: function(creep) {
		// Bringing energy to the spawn, but has no energy left, switch state to harvesting
		if (creep.memory.working == false && creep.carry.energy == 0) {
			creep.memory.working = true;
		}
		// Harvesting energy, but is full, switch state to carry energy back to structures
		else if (creep.memory.working == true && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = false;
		}

		// Harvest from nearest source or move to the source
		if(creep.memory.working) {
			if (creep.room.name == creep.memory.target) {
				creep.say('🍃 Forage');
				var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceIndex];
				if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			}
			else {
				creep.say('🍃❕ Exit');
				var exit = creep.room.findExitTo(creep.memory.target);
				creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: {stroke: '#000000'}});
			}

		}
		// Bring energy to structure that has free capacity
		else {
			if (creep.room.name == creep.memory.home) {
				creep.say('🔋 Energy');
				var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
						filter: (s) => (s.structureType == STRUCTURE_SPAWN
									 || s.structureType == STRUCTURE_EXTENSION
									 || s.structureType == STRUCTURE_TOWER)
									 && s.energy < s.energyCapacity
					});
	
				if (structure != undefined) {
					if(creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
			}
			// Not in home room, find exit to home room
			else {
				creep.say('🏠❕ Exit');
				var exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}
	}
};

module.exports = roleForager;