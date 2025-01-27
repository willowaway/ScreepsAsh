import * as _ from "lodash";

var listOfRoles = ['starter'];

var names1 = ["Jackson", "Aiden", "Liam", "Lucas", "Noah", "Mason", "Jayden", "Ethan", "Jacob", "Jack", "Caden", "Logan", "Benjamin", "Michael", "Caleb", "Ryan", "Alexander", "Elijah", "James", "William", "Oliver", "Connor", "Matthew", "Daniel", "Luke", "Brayden", "Jayce", "Henry", "Carter", "Dylan", "Gabriel", "Joshua", "Nicholas", "Isaac", "Owen", "Nathan", "Grayson", "Eli", "Landon", "Andrew", "Max", "Samuel", "Gavin", "Wyatt", "Christian", "Hunter", "Cameron", "Evan", "Charlie", "David", "Sebastian", "Joseph", "Dominic", "Anthony", "Colton", "John", "Tyler", "Zachary", "Thomas", "Julian", "Levi", "Adam", "Isaiah", "Alex", "Aaron", "Parker", "Cooper", "Miles", "Chase", "Muhammad", "Christopher", "Blake", "Austin", "Jordan", "Leo", "Jonathan", "Adrian", "Colin", "Hudson", "Ian", "Xavier", "Camden", "Tristan", "Carson", "Jason", "Nolan", "Riley", "Lincoln", "Brody", "Bentley", "Nathaniel", "Josiah", "Declan", "Jake", "Asher", "Jeremiah", "Cole", "Mateo", "Micah", "Elliot"]
var names2 = ["Sophia", "Emma", "Olivia", "Isabella", "Mia", "Ava", "Lily", "Zoe", "Emily", "Chloe", "Layla", "Madison", "Madelyn", "Abigail", "Aubrey", "Charlotte", "Amelia", "Ella", "Kaylee", "Avery", "Aaliyah", "Hailey", "Hannah", "Addison", "Riley", "Harper", "Aria", "Arianna", "Mackenzie", "Lila", "Evelyn", "Adalyn", "Grace", "Brooklyn", "Ellie", "Anna", "Kaitlyn", "Isabelle", "Sophie", "Scarlett", "Natalie", "Leah", "Sarah", "Nora", "Mila", "Elizabeth", "Lillian", "Kylie", "Audrey", "Lucy", "Maya", "Annabelle", "Makayla", "Gabriella", "Elena", "Victoria", "Claire", "Savannah", "Peyton", "Maria", "Alaina", "Kennedy", "Stella", "Liliana", "Allison", "Samantha", "Keira", "Alyssa", "Reagan", "Molly", "Alexandra", "Violet", "Charlie", "Julia", "Sadie", "Ruby", "Eva", "Alice", "Eliana", "Taylor", "Callie", "Penelope", "Camilla", "Bailey", "Kaelyn", "Alexis", "Kayla", "Katherine", "Sydney", "Lauren", "Jasmine", "London", "Bella", "Adeline", "Caroline", "Vivian", "Juliana", "Gianna", "Skyler", "Jordyn"]
StructureSpawn.prototype.getRandomName = 
	function(prefix){
		var name, isNameTaken, tries = 0;
		do {
			var nameArray = Math.random() > .5 ? names1 : names2;
			name = nameArray[Math.floor(Math.random() * nameArray.length)];

			if (tries > 3){
				name += nameArray[Math.floor(Math.random() * nameArray.length)];
			}

			tries++;
			isNameTaken = Game.creeps[name] !== undefined;
		} while (isNameTaken);

		return prefix+" "+name;
	};

StructureSpawn.prototype.spawnCreepWithRole = 
	function() {
		
		let room = this.room;
        let creepsInRoom = room.find(FIND_MY_CREEPS);
		
		// Set the number of creeps in the room per role
        const numberOfCreeps: { [key: string]: number } = {};
        for (let role of listOfRoles) {
            // numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
            numberOfCreeps[role] = _(creepsInRoom).filter(c => c.memory.role == role).sum();
        }
		// Manually set forager and claimer since these creeps will leave the room, but still have a home room
		// numberOfCreeps['forager'] = _.sum(Game.creeps, (c) => c.memory.role == 'forager' && c.memory.home == room.name);
		// numberOfCreeps['claimer'] = _.sum(Game.creeps, (c) => c.memory.role == 'claimer' && c.memory.home == room.name);

		const activeSources = room.find(FIND_SOURCES_ACTIVE);
		const numberOfActiveSources = activeSources.length;
		const structures = room.find(FIND_MY_STRUCTURES);
		var numberOfStructures = structures.length;
		var walls = room.find(FIND_STRUCTURES, {
			filter: (s) => s.structureType == STRUCTURE_WALL
		});
		var numberOfWalls = walls.length;
		var roomControllerLevel = room.controller ? room.controller.level : 1;

		// setup some minimum numbers for different roles
		var minimumNumberOfStarters = creepsInRoom.length > 0 ? 0 : 2;
		var minimumNumberOfHarvesters = numberOfActiveSources * 3;
		var minimumNumberOfHaulers = numberOfActiveSources;
		var minimumNumberOfUpgraders = roomControllerLevel * 2;
		var minimumNumberOfBuilders = roomControllerLevel;
		var minimumNumberOfRepairers = 1 + Math.floor(numberOfStructures / 4);
		var minimumNumberOfPatchers = 1 + Math.floor(numberOfWalls / 5);
		var minimumNumberOfForagers = roomControllerLevel * 3;
		var minimumNumberOfClaimers = 1;

		let maxEnergy = room.energyCapacityAvailable;
		let creepSpawnCode: number | string = 0;

		if (numberOfCreeps['starter'] < minimumNumberOfStarters){
			// try to spawn one
			var prefix = 'Starter';
			creepSpawnCode = this.createCustomCreep(maxEnergy, prefix, 'starter');

			// if spawning failed and we have no starters left
			if (creepSpawnCode == ERR_NOT_ENOUGH_ENERGY && numberOfCreeps['starter'] == 0) {
				// spawn one with what is available
				creepSpawnCode = this.createCustomCreep(room.energyAvailable, prefix, 'starter');
			}
		}

		// if (creepSpawnCode == ERR_NOT_ENOUGH_ENERGY && numberOfCreeps['forager'] <= minimumNumberOfForagers) {
		// 	creepSpawnCode = this.createForager(maxEnergy, 0);
		// }

		// Print name to console if spawning was a success
		if (typeof creepSpawnCode === "number" && !(creepSpawnCode < 0)) {
			console.log("Spawned new creep: " + creepSpawnCode);
		} 
		// Failed to spawn, print error code
		else if(creepSpawnCode == -1) {
			console.log("Failed to spawn: ERR_NOT_OWNER");
		} else if (creepSpawnCode == -3) {
			console.log("Failed to spawn: ERR_NAME_EXISTS");
		} else if (creepSpawnCode == -4) {
			//console.log("Failed to spawn: ERR_BUSY");
		} else if (creepSpawnCode == -6) {
			//console.log("Failed to spawn: ERR_NOT_ENOUGH_ENERGY");
		} else if (creepSpawnCode == -10) {
			console.log("Failed to spawn: ERR_INVALID_ARGS");
		} else if (creepSpawnCode == -14) {
			console.log("Failed to spawn: ERR_RCL_NOT_ENOUGH");
		} else {
			console.log("Failed to spawn: " + creepSpawnCode);
		}
		
		// Display spawning name over spawn
		if(this.spawning) { 
			var spawningCreep = Game.creeps[this.spawning.name];
			room.visual.text(
				'🌀' + spawningCreep.name,
				this.pos.x, 
				this.pos.y - 2, 
				{align: 'center'});
		}

		// Display number of creeps vs target number
		var xOffset = 15;
		var yOffset = 6;
		room.visual.text(
			'Starters (' + numberOfCreeps['starter'] + '/' + minimumNumberOfStarters + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 2, 
			{align: 'left'});
		room.visual.text(
			'Harvesters (' + numberOfCreeps['harvester'] + '/' + minimumNumberOfHarvesters + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 3, 
			{align: 'left'});
		room.visual.text(
			'Hauler (' + numberOfCreeps['hauler'] + '/' + minimumNumberOfHaulers + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 4, 
			{align: 'left'});
		room.visual.text(
			'Upgraders (' + numberOfCreeps['upgrader'] + '/' + minimumNumberOfUpgraders + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 5, 
			{align: 'left'});
			
		room.visual.text(
			'Builders (' + numberOfCreeps['builder'] + '/' + minimumNumberOfBuilders + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 6, 
			{align: 'left'});
			
		room.visual.text(
			'Repairers (' + numberOfCreeps['repairer'] + '/' + minimumNumberOfRepairers + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 7, 
			{align: 'left'});
			
		room.visual.text(
			'Patchers (' + numberOfCreeps['patcher'] + '/' + minimumNumberOfPatchers + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 8, 
			{align: 'left'});
		
		room.visual.text(
			'Foragers (' + numberOfCreeps['forager'] + '/' + minimumNumberOfForagers + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 9, 
			{align: 'left'});
			
		room.visual.text(
			'Claimers (' + numberOfCreeps['claimer'] + '/' + minimumNumberOfClaimers + ')',
			this.pos.x - xOffset, 
			this.pos.y - yOffset + 10, 
			{align: 'left'});
	};

StructureSpawn.prototype.createCustomCreep =
	function(energy, prefix, roleName) {
		var name = this.getRandomName(prefix);

		// create a balanced body as big as possible with the given energy
		var numberOfParts = Math.floor(energy / 200);
		let body: BodyPartConstant[] = [];
		for (let i = 0; i < numberOfParts; i++) {
			body.push(WORK);
		}
		for (let i = 0; i < numberOfParts; i++) {
			body.push(CARRY);
		}
		for (let i = 0; i < numberOfParts; i++) {
			body.push(MOVE);
		}
		// console.log("Creating " + name + " with body[" + body + "]");

		// create creep with the created body and the given role
		return this.spawnCreep(body, name, { memory: {role: roleName, working: false }});
	};