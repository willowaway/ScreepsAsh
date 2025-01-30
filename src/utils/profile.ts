/**
 * The profile utility provides methods to assemble creep body arrays.
 * @module
 */

const STARTER_MAX_TIER = 12;
const HARVESTER_MAX_TIER = 16;
const HAULER_MAX_TIER = 8;
const HEAVY_WORKER_MAX_TIER = 12;

/**
 * Assembles a body for a Starter creep which has 1:1 WORK to CARRY parts [WORK, MOVE, CARRY, MOVE].
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getStarterBody(tier: number) {
	if (tier > STARTER_MAX_TIER) {
		tier = STARTER_MAX_TIER;
	}
	return addToBody([], tier, [WORK, MOVE, CARRY, MOVE]);
}

/**
 * Determines the maximum size for a Starter creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierStarter(energy: number) {
	return getMaxTier(energy, getStarterBody, STARTER_MAX_TIER);
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
 * Assembles a body for a Heavy Worker creep which has 3:1 WORK to CARRY parts.
 * @param tier The scaling size of the creep body.
 * @returns The creep body array.
 */
export function getHeavyWorkerBody(tier: number) {
	if (tier > HEAVY_WORKER_MAX_TIER) {
		tier = HEAVY_WORKER_MAX_TIER;
	}
	let body: BodyPartConstant[] = [];
	body = addToBody(body, Math.floor(tier / 2), [WORK, WORK, MOVE, MOVE]);
	body = addToBody(body, Math.ceil(tier / 2), [WORK, CARRY, MOVE, MOVE]);
	return body;
}

/**
 * Determines the maximum size for a Heavy Worker creep based on energy.
 * @param energy The maximum amount of energy to use for spawning the creep body.
 * @returns The maximum tier for the amount of energy.
 */
export function getMaxTierHeavyWorker(energy: number) {
	return getMaxTier(energy, getHeavyWorkerBody, HEAVY_WORKER_MAX_TIER);
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
