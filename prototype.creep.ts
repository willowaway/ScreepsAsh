import roleStarter from "./role.starter"
const roles: { [key: string]: any } = {
    starter: roleStarter
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
        if (closestDroppedEnergy != null) {
            if (this.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                this.moveTo(closestDroppedEnergy, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    };