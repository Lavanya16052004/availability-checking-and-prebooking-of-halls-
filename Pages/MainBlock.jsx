import React, { useState, useEffect } from "react";
import { User, RoomStatus, HallBooking } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import FloorLayout from "../components/building/FloorLayout";
import RoomStatsCard from "../components/building/RoomStatsCard";

export default function MainBlock() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState(1);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    // No need to set loading true on interval refresh
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const allRooms = await RoomStatus.filter({ building: "Main Block" });
      const userPhysicalRoom = allRooms.find(room => room.occupied_by === currentUser.email);
      setCurrentRoom(userPhysicalRoom);
      
      const today = format(new Date(), "yyyy-MM-dd");
      const currentTime = format(new Date(), "HH:mm");
      const activeBookings = await HallBooking.filter({ booking_date: today, status: "Active" });

      const roomsWithBookingStatus = allRooms.map(room => {
        if (room.room_type === "Common Hall") {
          const ongoingBooking = activeBookings.find(booking => 
            booking.hall_name === room.room_number &&
            booking.start_time <= currentTime &&
            booking.end_time > currentTime
          );
          if (ongoingBooking) {
            return {
              ...room,
              is_occupied: true,
              occupied_by: "Pre-booked",
            };
          }
        }
        return room;
      });

      setRooms(roomsWithBookingStatus);

    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleRoomClick = async (room) => {
    if (room.occupied_by === 'Pre-booked') {
        alert(`This hall is pre-booked and cannot be occupied.`);
        return;
    }
    if (!room.is_clickable) return;
    
    try {
      if (room.is_occupied && room.occupied_by === user.email) {
        // Release the room
        await RoomStatus.update(room.id, {
          is_occupied: false,
          occupied_by: ""
        });
      } else if (!room.is_occupied && !currentRoom) {
        // Occupy the room (only if user doesn't have another room)
        await RoomStatus.update(room.id, {
          is_occupied: true,
          occupied_by: user.email
        });
      } else if (!room.is_occupied && currentRoom) {
        alert("You can only occupy one room at a time. Please release your current room first.");
        return;
      } else if (room.is_occupied && room.occupied_by !== user.email) {
        alert("This room is already occupied by another faculty member.");
        return;
      }
      
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const getRoomsByFloor = (floor) => {
    return rooms.filter(room => room.floor === floor);
  };

  const getFloorStats = (floor) => {
    const floorRooms = getRoomsByFloor(floor);
    const clickableRooms = floorRooms.filter(room => room.is_clickable);
    const occupiedRooms = clickableRooms.filter(room => room.is_occupied);
    const vacantRooms = clickableRooms.filter(room => !room.is_occupied);

    return {
      total: clickableRooms.length,
      occupied: occupiedRooms.length,
      vacant: vacantRooms.length
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-blue-600 text-lg">Loading Main Block...</div>
      </div>
    );
  }

  const floors = [1, 2, 3, 4];
  const currentFloorStats = getFloorStats(selectedFloor);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Main Block</h1>
              <p className="text-slate-600">Interactive floor plans and room management</p>
            </div>
          </div>

          {currentRoom && currentRoom.building === "Main Block" && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Currently Occupying</p>
                    <p className="text-sm text-amber-700">{currentRoom.room_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <RoomStatsCard
            title="Total Rooms"
            value={currentFloorStats.total}
            icon={Building2}
            color="blue"
          />
          <RoomStatsCard
            title="Occupied"
            value={currentFloorStats.occupied}
            icon={Users}
            color="red"
          />
          <RoomStatsCard
            title="Vacant"
            value={currentFloorStats.vacant}
            icon={CheckCircle2}
            color="green"
          />
          <RoomStatsCard
            title="Floor"
            value={selectedFloor}
            icon={MapPin}
            color="purple"
          />
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-800">
                Floor {selectedFloor} Layout
              </CardTitle>
              <div className="flex gap-2">
                {floors.map(floor => (
                  <Button
                    key={floor}
                    variant={selectedFloor === floor ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFloor(floor)}
                    className={selectedFloor === floor ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Floor {floor}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FloorLayout
              rooms={getRoomsByFloor(selectedFloor)}
              onRoomClick={handleRoomClick}
              currentUser={user}
              building="Main Block"
              floor={selectedFloor}
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-0">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded border shadow-sm"></div>
                <span className="text-slate-700 font-medium">Vacant (Click to occupy)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded border shadow-sm"></div>
                <span className="text-slate-700 font-medium">Occupied / Pre-Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded border shadow-sm"></div>
                <span className="text-slate-700 font-medium">Your Room (Click to release)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-400 rounded border shadow-sm"></div>
                <span className="text-slate-700 font-medium">Staff Only (Non-clickable)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}