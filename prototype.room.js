function findIndexOfMin(arr) {
	const minValue = Math.min(...arr);
	return arr.indexOf(minValue);
}

Room.prototype.getWestNumber = 
    function() {
        const match = this.name.match(/-?\d+/); // Match first integer, including negative numbers
        return match ? parseInt(match[0]) : null;
    }

Room.prototype.getNorthNumber = 
    function() {
        let numCount = 0;
        let secondNum = "";
      
        for (let i = 0; i < this.name.length; i++) {
          const char = this.name.charAt(i);
      
          if (!isNaN(char) && char !== " ") { // Check if it's a number
            if (numCount === 1) { // If it's the second number, start building it
              secondNum += char;
            } 
            else if (secondNum === "" && numCount === 0) { 
              numCount++; // Increment if it's the first number
            }
          } else if (numCount === 1 && secondNum !== "") {
            // Stop building the second number if a non-digit is encountered
            break;
          }
        }
      
        return secondNum ? parseInt(secondNum, 10) : null; // Convert to number or return null if not found
    }

Room.prototype.getTargetAdjacentRoom = 
    function() {
        var west = this.getWestNumber();
        var north = this.getNorthNumber();
    
        // Left, Right, Top, Bottom, TopLeft, TopRight, BottomLeft, BottomRight
        const adjacentRooms = [
            "W" + (west + 1) + "N" + north,
            "W" + (west - 1) + "N" + north,
            "W" + west + "N" + (north + 1),
            "W" + west + "N" + (north - 1),
            "W" + (west + 1) + "N" + (north + 1),
            "W" + (west - 1) + "N" + (north + 1),
            "W" + (west + 1) + "N" + (north - 1),
            "W" + (west - 1) + "N" + (north - 1),
        ];
        console.log("Adjacent Rooms: " + adjacentRooms);
    
        // Rank each room, highest numbers are more risky
        // Owned creeps are +1 rank, Enemies have a *2 multiplier to rank
        const roomRank = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let roomIndex = 0; roomIndex < adjacentRooms.length; roomIndex++) {
            var room = adjacentRooms[roomIndex];
            var numberOfHostileCreeps = Game.rooms[room] != undefined ? Game.rooms[room].find(FIND_HOSTILE_CREEPS).length : 0;
            var numberOfMyCreeps = Game.rooms[room] != undefined ? Game.rooms[room].find(FIND_MY_CREEPS).length : 0;
            roomRank[roomIndex] = numberOfMyCreeps + (numberOfHostileCreeps * 2);
        }
        console.log("Room Rank:      " + roomRank);
    
        // Find the least risky/crowded room that is adjacent to HOME
        var target = adjacentRooms[findIndexOfMin(roomRank)];
        console.log("Target: " + target);
    
        return target;
    };