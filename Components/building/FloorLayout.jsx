
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  FlaskConical, 
  Users, 
  UserCheck, 
  Building,
  Lock,
  Ban
} from "lucide-react";

const roomTypeIcons = {
  "Lecture Hall": GraduationCap,
  "Lab": FlaskConical,
  "Common Hall": Users,
  "Staff Room": UserCheck,
  "Office": Building,
  "Cabin": Building
};

export default function FloorLayout({ rooms, onRoomClick, currentUser, building, floor }) {
  const getRoomStatus = (room) => {
    if (room.occupied_by === 'Pre-booked') {
        return { color: "bg-red-500 hover:bg-red-600", text: "Pre-Booked", cursor: "cursor-pointer", icon: Ban };
    }
    if (!room.is_clickable) {
      return { color: "bg-slate-400 hover:bg-slate-500", text: "Staff Only", cursor: "cursor-not-allowed", icon: Lock };
    }
    if (room.is_occupied && room.occupied_by === currentUser.email) {
      return { color: "bg-amber-500 hover:bg-amber-600", text: "Your Room", cursor: "cursor-pointer" };
    }
    if (room.is_occupied) {
      return { color: "bg-red-500 hover:bg-red-600", text: "Occupied", cursor: "cursor-not-allowed" };
    }
    return { color: "bg-green-500 hover:bg-green-600", text: "Vacant", cursor: "cursor-pointer" };
  };

  const getRoomIcon = (roomType) => {
    const Icon = roomTypeIcons[roomType] || Building;
    return Icon;
  };

  const organizeRooms = (rooms) => {
    const sections = {};
    rooms.forEach(room => {
      const sectionKey = room.block && room.block.trim() !== '' ? `Block ${room.block}` : 'General Rooms';
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
      sections[sectionKey].push(room);
    });
    return sections;
  };

  const organizedRooms = organizeRooms(rooms);

  return (
    <div className="space-y-8">
      {Object.entries(organizedRooms).map(([section, sectionRooms]) => (
        <div key={section} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">
              {section}
            </h3>
            <Badge variant="outline" className="text-xs">
              {sectionRooms.length} rooms
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {sectionRooms.sort((a,b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true })).map((room, index) => {
              const status = getRoomStatus(room);
              const Icon = status.icon || getRoomIcon(room.room_type);
              
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Button
                    onClick={() => onRoomClick(room)}
                    disabled={(!room.is_clickable || room.is_occupied) && room.occupied_by !== currentUser.email && room.occupied_by !== 'Pre-booked'}
                    className={`
                      w-full aspect-square flex flex-col items-center justify-center gap-1 p-1
                      ${status.color} ${status.cursor} 
                      text-white font-semibold shadow-lg
                      transition-all duration-300 hover:scale-105 hover:shadow-xl
                      disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                    `}
                    variant="default"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs text-center leading-tight">
                      {room.room_number}
                    </span>
                    <span className="text-[10px] opacity-90 hidden sm:inline">
                      {status.text}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
            
            {sectionRooms.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-500">
                <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No rooms available in this section</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {Object.keys(organizedRooms).length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Rooms Available</h3>
          <p className="text-sm">This floor doesn't have any rooms yet. The admin can add them.</p>
        </div>
      )}
    </div>
  );
}
