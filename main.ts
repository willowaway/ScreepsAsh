require('prototype.creep');
require('prototype.spawn');

// import * as _ from 'lodash';
declare global {
    interface CreepMemory {
        role: string;
        working?: boolean;
    }

    interface Creep {
        runRole(): void;
        pickupEnergy(): void;
    }

    interface StructureSpawn {
        spawnCreepWithRole(): void;
        getRandomName(prefix: string): string;
        createCustomCreep(energy: number, prefix: string, roleName: string): string | number;
    }
}


export function loop() {
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log("Clearing non-existing creep memory:", name);
        }
    }

    // Role
    for (let name in Game.creeps) {
        Game.creeps[name].runRole();
    }

    // Spawn
    for (let spawnName in Game.spawns) {
        Game.spawns[spawnName].spawnCreepWithRole();
    }
}
