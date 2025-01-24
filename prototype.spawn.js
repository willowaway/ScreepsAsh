module.exports = function() {
	// create a new function for StructureSpawn
	StructureSpawn.prototype.createCustomCreep =
		function(energy, name, roleName) {
			// create a balanced body as big as possible with the given energy
			var numberOfParts = Math.floor(energy / 200);
			var body = [];
			for (let i = 0; i < numberOfParts; i++) {
				body.push(WORK);
			}
			for (let i = 0; i < numberOfParts; i++) {
				body.push(CARRY);
			}
			for (let i = 0; i < numberOfParts; i++) {
				body.push(MOVE);
			}

			// create creep with the created body and the given role
			return this.createCreep(body, name, { role: roleName, working: false });
		};

	StructureSpawn.prototype.createForager =
	
		/** 
		 * @param {number} energy
		 * @param {string} name
		 * @param {number} numberOfWorkParts
		 * @param {string} home
		 * @param {string} target
		 * @param {number} sourceIndex **/
		function (energy, name, home, target, sourceIndex) {
			// Create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
			var numberOfWorkParts = Math.floor(energy / 200);
			var body = [];
			for (let i = 0; i < numberOfWorkParts; i++) {
				body.push(WORK);
			}

			// 150 = 100 (cost of WORK) + 50 (cost of MOVE)
			energy -= 150 * numberOfWorkParts;
			var numberOfParts = Math.floor(energy / 100);
			
			for (let i = 0; i < numberOfParts; i++) {
				body.push(CARRY);
			}
			for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
				body.push(MOVE);
			}

			// create creep with the created body
			return this.createCreep(body, name, {
				role: 'forager',
				home: home,
				target: target,
				sourceIndex: sourceIndex,
				working: false
			});
		};
};