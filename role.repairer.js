var roleBuilder = require('role.builder');

// Repairs everything except the walls
var roleRepairer = {
    run: function(creep) {
        // Trying to repair, but has no energy, switch state to harvesting
        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
			creep.say('🔄 Harvest');
        }
        // Harvesting energy, but is full, switch state to repairing||building
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        // Repair closest structure that is NOT a wall OR run the builder role
        if (creep.memory.working) {
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
            });
        
            if (structure != undefined) {
                creep.say('🛠️ Repair');
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            else {
                roleBuilder.run(creep);
            }
        }
        // Harvest energy from source
        else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};

module.exports = roleRepairer;