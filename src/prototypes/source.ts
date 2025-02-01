export {};

declare global {
	interface Source {
		/** Gets the maximum number of harvesters a source can have adjacent to it */
		getMaxNumberOfHarvesters(): number;
	}
}

Source.prototype.getMaxNumberOfHarvesters = function() {
	let maxNumberOfHarvesters = 0;
	const terrainRoom = new Room.Terrain(this.room.name);
	for (let a = 0; a <= 2; a++) {
		for (let b = 0; b <= 2; b++) {
			const adjacentRoomPos = new RoomPosition(this.pos.x - 1 + a, this.pos.y - 1 + b, this.room.name);
			const terrain = terrainRoom.get(adjacentRoomPos.x, adjacentRoomPos.y);
			if (terrain === 0) {
				maxNumberOfHarvesters++;
			}
		}
	}

	return maxNumberOfHarvesters;
}
