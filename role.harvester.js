var roleHarvester = {

	/** @param {Creep} creep **/
	run: function(creep) {

		// Harvest from nearest source or move to the source
		var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
		if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
			creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
		}
	}
};

module.exports = roleHarvester;