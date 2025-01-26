var roleHauler = {

	/** @param {Creep} creep **/
	run: function(creep) {
		// Picking up energy, but energy is at carryCapacity, switch state to hauling back to structures
		if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
		}
		// Hauling energy, but is empty, switch state to pickup from dropped energy
		else if (creep.memory.working == true && creep.carry.energy == 0) {
			creep.memory.working = false;
		}

		// Haul back to structure
		if(creep.memory.working) {
			creep.say('🔋 Haul');
            
			var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
		}
		// Pickup energy from ground
		else {
			creep.say('📦 Pickup');
            
            creep.pickupEnergy();
		}
	}
};

module.exports = roleHauler;