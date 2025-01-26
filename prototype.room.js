function findIndexOfMin(arr) {
	const minValue = Math.min(...arr);
	return arr.indexOf(minValue);
}

Room.prototype.getWestEastNumber = 
		function() {
				const match = this.name.match(/-?\d+/); // Match first integer, including negative numbers
				return match ? parseInt(match[0]) : null;
		}

Room.prototype.getNorthSouthNumber = 
		function() {
			let firstNumFound = false;
			let secondNum = "";
		
			for (let i = 0; i < this.name.length; i++) {
				const char = this.name.charAt(i);
		
				if (!isNaN(parseInt(char))) { // Check if character is a number
					if (firstNumFound) {
						secondNum += char;
					} else {
						firstNumFound = true;
						secondNum = ""; // Reset secondNum when the first number is found
					}
				} else if (firstNumFound && secondNum !== "") { // Check if we've found a number and it's not empty
					return parseInt(secondNum);
				}
			}
		
			return null; // Return null if no second number is found
		}

Room.prototype.getTargetAdjacentRoom = 
		function() {
				var westEastStr = this.name.charAt(0);
				let northCharIndex = this.name.indexOf("N");
				var northSouthStr = "S";
				if (northCharIndex != -1) {
					northSouthStr = "N";
				}
				var westEastNumber = this.getWestEastNumber();

				var indexOfNorthSouthStr = this.name.indexOf(northSouthStr);
				var northSouthNumber = parseInt(this.name.substring(indexOfNorthSouthStr+1));
				// console.log("Room: " + this.name + " " + northSouthStr + ": " + northSouthNumber);
		
				// Left, Right, Top, Bottom, TopLeft, TopRight, BottomLeft, BottomRight
				const adjacentRooms = [
					westEastStr + (westEastNumber + 1) + northSouthStr + northSouthNumber,
					westEastStr + (westEastNumber - 1) + northSouthStr + northSouthNumber,
					westEastStr + westEastNumber + northSouthStr + (northSouthNumber + 1),
					westEastStr + westEastNumber + northSouthStr + (northSouthNumber - 1),
					westEastStr + (westEastNumber + 1) + northSouthStr + (northSouthNumber + 1),
					westEastStr + (westEastNumber - 1) + northSouthStr + (northSouthNumber + 1),
					westEastStr + (westEastNumber + 1) + northSouthStr + (northSouthNumber - 1),
					westEastStr + (westEastNumber - 1) + northSouthStr + (northSouthNumber - 1),
				];
				// console.log("Adjacent Rooms: " + adjacentRooms);
		
				// Rank each room, highest numbers are more risky
				// Owned creeps are +1 rank, Enemies have a *2 multiplier to rank
				const roomRank = [0, 0, 0, 0, 0, 0, 0, 0];
				for (let roomIndex = 0; roomIndex < adjacentRooms.length; roomIndex++) {
						var room = adjacentRooms[roomIndex];
						var numberOfHostileCreeps = Game.rooms[room] != undefined ? Game.rooms[room].find(FIND_HOSTILE_CREEPS).length : 0;
						var numberOfMyCreeps = Game.rooms[room] != undefined ? Game.rooms[room].find(FIND_MY_CREEPS).length : 0;
						roomRank[roomIndex] = numberOfMyCreeps + (numberOfHostileCreeps * 2);
				}
				// console.log("Room Rank:      " + roomRank);
		
				// Find the least risky/crowded room that is adjacent to HOME
				var target = adjacentRooms[findIndexOfMin(roomRank)];
				// console.log("Target: " + target);
		
				return target;
		};