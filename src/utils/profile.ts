/**
 * The profile utility provides methods to assemble creep body arrays.
 * @module
 */

const SIMPLE_MAX_TIER = 12;
const HARVESTER_MAX_TIER = 16;
const HAULER_MAX_TIER = 8;
const UPGRADER_MAX_TIER = 12;
const FORAGER_MAX_TIER = 10;
const SCOUT_MAX_TIER = 8;

/**
 * Assembles a body for a Simple creep which has 1:1 WORK to CARRY parts [WORK, MOVE, CARRY, MOVE].
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getSimpleBody(tier: number) {
	if (tier > SIMPLE_MAX_TIER) {
		tier = SIMPLE_MAX_TIER;
	}
	return addToBody([], tier, [WORK, MOVE, CARRY, MOVE]);
}

/**
 * Determines the maximum size for a Simplef creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierSimple(energy: number) {
	return getMaxTier(energy, getSimpleBody, SIMPLE_MAX_TIER);
}

/**
 * Assembles a body for a Harvester creep which has 1 MOVE parts and the rest are WORK [MOVE, WORK, WORK].
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getHarvesterBody(tier: number) {
	if (tier > HARVESTER_MAX_TIER) {
		tier = HARVESTER_MAX_TIER;
	}
	let body: BodyPartConstant[] = [MOVE];
	return addToBody(body, tier, [WORK, WORK]);
}

/**
 * Determines the maximum size for a Harvester creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierHarvester(energy: number) {
	return getMaxTier(energy, getHarvesterBody, HARVESTER_MAX_TIER);
}

/**
 * Assembles a body for a Upgrader creep which has 3:1 WORK to CARRY parts.
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getUpgraderBody(tier: number) {
	if (tier > UPGRADER_MAX_TIER) {
		tier = UPGRADER_MAX_TIER;
	}
	let body: BodyPartConstant[] = [];
	body = addToBody(body, Math.floor(tier / 2), [WORK, WORK, MOVE, MOVE]);
	body = addToBody(body, Math.ceil(tier / 2), [WORK, CARRY, MOVE, MOVE]);
	return body;
}

/**
 * Determines the maximum size for a Upgrader creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierUpgrader(energy: number) {
	return getMaxTier(energy, getUpgraderBody, UPGRADER_MAX_TIER);
}

/**
 * Assembles a body for a Hauler creep which has 1:1 MOVE to CARRY parts.
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getHaulerBody(tier: number) {
	if (tier > HAULER_MAX_TIER) {
		tier = HAULER_MAX_TIER;
	}
	return addToBody([], tier, [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE]);
}

/**
 * Determines the maximum size for a Hauler creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierHauler(energy: number) {
	return getMaxTier(energy, getHaulerBody, HAULER_MAX_TIER);
}

/**
 * Assembles a body for a Simple creep which has MOVE parts [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE].
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getScoutBody(tier: number) {
	if (tier > SCOUT_MAX_TIER) {
		tier = SCOUT_MAX_TIER;
	}
	return addToBody([], tier, [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]);
}

/**
 * Determines the maximum size for a Simplef creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierScout(energy: number) {
	return getMaxTier(energy, getScoutBody, SCOUT_MAX_TIER);
}

/**
 * Assembles a body for a Hauler creep which has 1:1 MOVE to CARRY parts.
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getForagerBody(tier: number) {
	if (tier > FORAGER_MAX_TIER) {
		tier = FORAGER_MAX_TIER;
	}
	return addToBody([], tier, [CARRY, MOVE, WORK, CARRY, MOVE]);
}

/**
 * Determines the maximum size for a Hauler creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierForager(energy: number) {
	return getMaxTier(energy, getForagerBody, FORAGER_MAX_TIER);
}

/**
 * Calculate the total energy cost to spawn a creep based on a body array.
 * @param body The creep body array to evaluate.
 */
export function getCostForBody(body: BodyPartConstant[]) {
	let cost = 0;
	for (const bodypart of body) {
		cost += BODYPART_COST[bodypart];
	}
	return cost;
}

/**
 * Determines the maximum size based on energy for a creep body method.
 *
 */
function getMaxTier(energy: number, bodyFunction: Function, maxTier: number) {
	let tier = 0;
	let maxReached = false;
	for (let i = 1; !maxReached; i++) {
		const cost = getCostForBody(bodyFunction(i));
		if (cost > energy || i > maxTier) {
			maxReached = true;
		} else {
			tier = i;
		}
	}
	return tier;
}

/**
 * Add parts to a creep body array.
 */
function addToBody(body: BodyPartConstant[], count: number, parts: BodyPartConstant[]) {
	for (let i = 0; i < count; i++) {
		body.push(...parts);
	}
	return body;
}
