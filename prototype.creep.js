var roles = {
    starter: require('role.starter'),
    harvester: require('role.harvester'),
    hauler: require('role.hauler'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    patcher: require('role.patcher'),
    forager: require('role.forager'),
    claimer: require('role.claimer')
};

Creep.prototype.runRole = 
    function() {
        roles[this.memory.role].run(this);
    };

Creep.prototype.pickupEnergy = 
    function() {
        const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: resource => resource.resourceType == RESOURCE_ENERGY &&
                                resource.amount >= 50
        });

        const closestDroppedEnergy = this.pos.findClosestByRange(droppedEnergy);

        if (this.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
            this.moveTo(closestDroppedEnergy, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    };