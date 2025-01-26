// system.resetAllData() - Wipe all world data and reset the database to the default state.
// system.pauseSimulation() - Stop main simulation loop execution.
// system.resumeSimulation() - Resume main simulation loop execution.
// bots.removeUser("MichaelBot") - Delete bot 
// storage.db['rooms.objects'].update({type:"spawn"}, {$set: {storeCapacityResource:{ energy:300}}});
// Builder -> Upgrader -> Harvester
require('prototype.spawn');
require('prototype.creep');
require('prototype.tower');

var HOME = Game.spawns.Spawn1.room.name;
console.log("Home: " + HOME);

module.exports.loop = function () {
    
	// Check for memory entries of died creeps by iterating over Memory.creeps
	for(var name in Memory.creeps) {
		// and checking if the creep is still alive
		if(!Game.creeps[name]) {
			// if not, delete the memory entry
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}
	
	// Role
	for(let name in Game.creeps) {
		Game.creeps[name].runRole();
	}

	// Tower find and attack closest hostile creep
	var towers = Game.rooms[HOME].find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
	for (let tower of towers) {
		tower.defend();
	}

    // Spawn
    for (let spawnName in Game.spawns) {
        Game.spawns[spawnName].spawnCreepWithRole();
    }
}