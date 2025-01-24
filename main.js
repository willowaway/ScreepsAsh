// system.resetAllData() - Wipe all world data and reset the database to the default state.
// system.pauseSimulation() - Stop main simulation loop execution.
// system.resumeSimulation() - Resume main simulation loop execution.
// bots.removeUser("MichaelBot") - Delete bot 
// Builder -> Upgrader -> Harvester
require('prototype.spawn')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var rolePatcher = require('role.patcher');
var roleForager = require('role.forager');

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
	
	// For every creep, call role script
	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		if(creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		else if(creep.memory.role == 'upgrader') {
			roleUpgrader.run(creep);
		}
		else if(creep.memory.role == 'builder') {
			roleBuilder.run(creep);
		}
		else if(creep.memory.role == 'repairer') {
			roleRepairer.run(creep);
		}
		else if(creep.memory.role == 'patcher') {
			rolePatcher.run(creep);
		}
		else if(creep.memory.role == 'forager') {
			roleForager.run(creep);
		}
	}

	// Tower find and attack closest hostile creep
	var towers = Game.rooms[HOME].find(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_TOWER
	});
	for (let tower of towers) {
		var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (target != undefined) {
			tower.attack(target);
		}
	}

    // count the number of creeps alive for each role
    // _.sum will count the number of properties in Game.creeps filtered by the
    //  arrow function, which checks for the creep being a harvester
    var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
    var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
    var numberOfBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder');
	var numberOfRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');
    var numberOfPatchers = _.sum(Game.creeps, (c) => c.memory.role == 'patcher');
    var numberOfForagers = _.sum(Game.creeps, (c) => c.memory.role == 'forager');
	var activeSources = Game.spawns.Spawn1.room.find(FIND_SOURCES_ACTIVE);
	var numberOfActiveSources = activeSources.length;
	var structures = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
		filter: (s) => s.structureType != STRUCTURE_WALL
	});
	var numberOfStructures = structures.length;
	var walls = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_WALL
	});
	var numberOfWalls = walls.length;
	var roomControllerLevel = Game.spawns.Spawn1.room.controller.level;

    // setup some minimum numbers for different roles
    var minimumNumberOfHarvesters = 3 + (Math.floor(numberOfActiveSources / 3) * 3);
    var minimumNumberOfUpgraders = Math.floor(roomControllerLevel * 3);
    var minimumNumberOfBuilders = Math.floor(roomControllerLevel * 3);
    var minimumNumberOfRepairers = 1 + Math.floor(numberOfStructures / 2);
    var minimumNumberOfPatchers = 1 + Math.floor(numberOfWalls / 5);
    var minimumNumberOfForagers = 1 + Math.floor(numberOfHarvesters / 3) + Math.floor(numberOfBuilders / 3);

	var energy = Game.spawns.Spawn1.room.energyCapacityAvailable;
	var name = undefined;

    if (numberOfHarvesters < minimumNumberOfHarvesters) {
		// try to spawn one
		var newName = 'Harvester' + (numberOfHarvesters + 1);
		name = Game.spawns.Spawn1.createCustomCreep(energy, newName, 'harvester');

		// if spawning failed and we have no harvesters left
		if (name == ERR_NOT_ENOUGH_ENERGY && numberOfHarvesters == 0) {
			// spawn one with what is available
			name = Game.spawns.Spawn1.createCustomCreep(
				Game.spawns.Spawn1.room.energyAvailable, newName, 'harvester');
		}
    }
    else if (numberOfUpgraders < minimumNumberOfUpgraders) {
		var newName = 'Upgrader' + (numberOfUpgraders + 1);
		name = Game.spawns.Spawn1.createCustomCreep(energy, newName, 'upgrader');
    }
    else if (numberOfRepairers < minimumNumberOfRepairers) {
		var newName = 'Repairer' + (numberOfRepairers + 1);
		name = Game.spawns.Spawn1.createCustomCreep(energy, newName, 'repairer');
    }
    else if (numberOfBuilders < minimumNumberOfBuilders) {
		var newName = 'Builder' + (numberOfBuilders + 1);
		name = Game.spawns.Spawn1.createCustomCreep(energy, newName, 'builder');
    }
    else if (numberOfPatchers < minimumNumberOfPatchers) {
		var newName = 'Patcher' + (numberOfPatchers + 1);
		name = Game.spawns.Spawn1.createCustomCreep(energy, newName, 'patcher');
    }
    else if (numberOfForagers < minimumNumberOfForagers) {
		var newName = 'Forager' + (numberOfForagers + 1);
		name = Game.spawns.Spawn1.createForager(energy, newName, HOME, 'W6N8', 0);
    }
    else {
		var newName = 'Builder' + (numberOfBuilders + 1);
		name = Game.spawns.Spawn1.createCustomCreep(energy, newName, 'builder');
    }

    // print name to console if spawning was a success
    // name > 0 would not work since string > 0 returns false
    if (!(name < 0)) {
        console.log("Spawned new creep: " + name);
    } 
    
    // Display spawning name over spawn
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🌀' + spawningCreep.name,
            Game.spawns['Spawn1'].pos.x, 
            Game.spawns['Spawn1'].pos.y - 2, 
            {align: 'center'});
    }

	var xOffset = 15;
	var yOffset = 6;
	Game.spawns['Spawn1'].room.visual.text(
		'Harvesters (' + numberOfHarvesters + '/' + minimumNumberOfHarvesters + ')',
		Game.spawns['Spawn1'].pos.x - xOffset, 
		Game.spawns['Spawn1'].pos.y - yOffset + 3, 
		{align: 'left'});
	Game.spawns['Spawn1'].room.visual.text(
		'Upgraders (' + numberOfUpgraders + '/' + minimumNumberOfUpgraders + ')',
		Game.spawns['Spawn1'].pos.x - xOffset, 
		Game.spawns['Spawn1'].pos.y - yOffset + 4, 
		{align: 'left'});
		
	Game.spawns['Spawn1'].room.visual.text(
		'Builders (' + numberOfBuilders + '/' + minimumNumberOfBuilders + ')',
		Game.spawns['Spawn1'].pos.x - xOffset, 
		Game.spawns['Spawn1'].pos.y - yOffset + 5, 
		{align: 'left'});
		
	Game.spawns['Spawn1'].room.visual.text(
		'Repairers (' + numberOfRepairers + '/' + minimumNumberOfRepairers + ')',
		Game.spawns['Spawn1'].pos.x - xOffset, 
		Game.spawns['Spawn1'].pos.y - yOffset + 6, 
		{align: 'left'});
		
	Game.spawns['Spawn1'].room.visual.text(
		'Patchers (' + numberOfPatchers + '/' + minimumNumberOfPatchers + ')',
		Game.spawns['Spawn1'].pos.x - xOffset, 
		Game.spawns['Spawn1'].pos.y - yOffset + 7, 
		{align: 'left'});
	
	Game.spawns['Spawn1'].room.visual.text(
		'Foragers (' + numberOfForagers + '/' + minimumNumberOfForagers + ')',
		Game.spawns['Spawn1'].pos.x - xOffset, 
		Game.spawns['Spawn1'].pos.y - yOffset + 8, 
		{align: 'left'});
}