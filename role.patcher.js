var roleBuilder = require('role.builder');

// Repairs the walls
var rolePatcher = {
	/** @param {Creep} creep **/
	run: function(creep) {
		// Trying to repair, but has no energy, switch state to harvest energy
		if (creep.memory.working == true && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('📦 Pickup');
		}
		// Harvesting, but is full, switch state to patching the walls || building
		else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
		}

		// Patch the walls
		if (creep.memory.working == true) {
			var walls = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_WALL
            });
			var target = undefined;
			// Loop with increasing percentages
			for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
				// Find a wall with less than percentage hits
                for (let wall of walls) {
                    if (wall.hits / wall.hitsMax < percentage) {
                        target = wall;
                        break;
                    }
                }

				// There is one, leave the loop
				if (target != undefined) {
					break;
				}
			}
			// Repair or move to wall to repair
			if (target != undefined) {
				creep.say('🧱 Patch');
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
			}
			// We need somewhere to spend the energy we have, so lets go build something instead
			else {
				roleBuilder.run(creep);
			}
		}
		// Harvest energy from source
        else {
            creep.pickupEnergy();
        }
	}
};

module.exports = rolePatcher;