{
  "name": "RoomStatus",
  "type": "object",
  "properties": {
    "room_id": {
      "type": "string",
      "description": "Unique room identifier (e.g., MainBlock-A-F1-101)"
    },
    "building": {
      "type": "string",
      "enum": [
        "Main Block",
        "Dharithri Block"
      ],
      "description": "Building name"
    },
    "block": {
      "type": "string",
      "description": "Block identifier (A, B, C, D, E, F for Main Block)"
    },
    "floor": {
      "type": "integer",
      "description": "Floor number"
    },
    "room_number": {
      "type": "string",
      "description": "Room number"
    },
    "room_type": {
      "type": "string",
      "enum": [
        "Lecture Hall",
        "Lab",
        "Common Hall",
        "Staff Room",
        "Office",
        "Cabin"
      ],
      "description": "Type of room"
    },
    "is_occupied": {
      "type": "boolean",
      "default": false,
      "description": "Whether room is currently occupied"
    },
    "occupied_by": {
      "type": "string",
      "description": "Email of the user occupying the room"
    },
    "is_clickable": {
      "type": "boolean",
      "description": "Whether room can be occupied by faculty"
    }
  },
  "required": [
    "room_id",
    "building",
    "room_type",
    "is_clickable"
  ]
}