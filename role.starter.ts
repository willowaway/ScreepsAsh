let roleStarter: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void;
}

export default roleStarter = {
    run(creep) {
        // Bringing energy to the spawn, but has no energy left, switch state to harvesting
		if (creep.memory.working == false && creep.store[RESOURCE_ENERGY] === 0) {
			creep.memory.working = true;
			creep.say('🔄 Harvest');
		}
		// Harvesting energy, but is full, switch state to carry energy back to structures
		else if (creep.memory.working == true && creep.store.getFreeCapacity() === 0) {
			creep.memory.working = false;
		}

		// Harvest from nearest source or move to the source
		if(creep.memory.working) {
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source != null) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
		}
		// Bring energy to structure that has free capacity
		else {
			creep.say('🔋 Energy');
			const targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
							structure.structureType == STRUCTURE_EXTENSION ||
							structure.structureType == STRUCTURE_SPAWN) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
			});
			if(targets.length > 0) {
				if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
		}
    }
};