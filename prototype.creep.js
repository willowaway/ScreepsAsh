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
