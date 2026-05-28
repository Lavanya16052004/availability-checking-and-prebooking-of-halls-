{
  "name": "HallBooking",
  "type": "object",
  "properties": {
    "hall_name": {
      "type": "string",
      "enum": [
        "Visveswara Hall",
        "Vikram Sarabhai Hall",
        "Drawing Hall 1",
        "Drawing Hall 2",
        "Drawing Hall 3"
      ],
      "description": "Name of the hall being booked"
    },
    "booked_by": {
      "type": "string",
      "description": "Email of the user who made the booking"
    },
    "branch": {
      "type": "string",
      "enum": [
        "Computer Science",
        "Electronics",
        "Mechanical",
        "Civil",
        "Electrical",
        "Information Technology",
        "MCA",
        "MBA",
        "AIDS",
        "Other"
      ],
      "description": "Department/Branch making the booking"
    },
    "booking_date": {
      "type": "string",
      "format": "date",
      "description": "Date of booking"
    },
    "start_time": {
      "type": "string",
      "description": "Start time of booking"
    },
    "end_time": {
      "type": "string",
      "description": "End time of booking"
    },
    "purpose": {
      "type": "string",
      "description": "Purpose of hall booking"
    },
    "status": {
      "type": "string",
      "enum": [
        "Active",
        "Cancelled",
        "Completed"
      ],
      "default": "Active",
      "description": "Status of the booking"
    }
  },
  "required": [
    "hall_name",
    "booked_by",
    "branch",
    "booking_date",
    "start_time",
    "end_time",
    "purpose"
  ]
}