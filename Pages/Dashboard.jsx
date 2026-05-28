import React, { useState, useEffect } from "react"; import { User, RoomStatus, HallBooking } from "@/entities/all"; import { Button } from "@/components/ui/button"; import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; import
{ Badge } from "@/components/ui/badge"; import { Link } from "react-router-dom"; import { createPageUrl } from "@/utils"; import { Building2, Calendar, MapPin, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react"; import { motion } from "framer-motion";
import StatsCard from "../components/dashboard/StatsCard"; import QuickActions from "../components/dashboard/QuickActions"; import CurrentBookings from "../components/dashboard/CurrentBookings"; export default function Dashboard() { const [user, setUser]
= useState(null); const [roomStats, setRoomStats] = useState({ totalRooms: 0, occupiedRooms: 0, vacantRooms: 0 }); const [userBookings, setUserBookings] = useState([]); const [currentRoom, setCurrentRoom] = useState(null); const [isLoading, setIsLoading]
= useState(true); useEffect(() => { loadDashboardData(); }, []); const loadDashboardData = async () => { try { const currentUser = await User.me(); setUser(currentUser); const rooms = await RoomStatus.list(); const occupiedRooms = rooms.filter(room =>
room.is_occupied); const vacantRooms = rooms.filter(room => !room.is_occupied && room.is_clickable); setRoomStats({ totalRooms: rooms.filter(room => room.is_clickable).length, occupiedRooms: occupiedRooms.length, vacantRooms: vacantRooms.length }); const
userRoom = rooms.find(room => room.occupied_by === currentUser.email); setCurrentRoom(userRoom); const bookings = await HallBooking.filter({ booked_by: currentUser.email }); setUserBookings(bookings.filter(booking => booking.status === 'Active')); } catch
(error) { console.error("Error loading dashboard data:", error); } setIsLoading(false); }; const releaseCurrentRoom = async () => { if (!currentRoom) return; try { await RoomStatus.update(currentRoom.id, { is_occupied: false, occupied_by: "" }); setCurrentRoom(null);
loadDashboardData(); } catch (error) { console.error("Error releasing room:", error); } }; if (isLoading) { return (
<div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-blue-600 text-lg">Loading dashboard...</div>
</div>
); } return (
<div className="p-2 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        Welcome back, {user?.full_name?.split(' ')[0]}
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Manage your room occupancy and hall bookings
                    </p>
                </div>
                {currentRoom && (
                <Card className="bg-amber-50 border-amber-200 w-full md:w-auto">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-amber-600" />
                            <div>
                                <p className="font-semibold text-amber-800">Currently Occupying</p>
                                <p className="text-sm text-amber-700">{currentRoom.room_id}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={releaseCurrentRoom} className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100">
                      Release
                    </Button>
                        </div>
                    </CardContent>
                </Card>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <StatsCard title="Total Available Rooms" value={roomStats.totalRooms} icon={Building2} color="blue" description="Lecture halls and labs" />
                <StatsCard title="Occupied Rooms" value={roomStats.occupiedRooms} icon={Users} color="red" description="Currently in use" />
                <StatsCard title="Vacant Rooms" value={roomStats.vacantRooms} icon={CheckCircle2} color="green" description="Available now" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <QuickActions currentRoom={currentRoom} />
                </div>
                <div>
                    <CurrentBookings bookings={userBookings} onRefresh={loadDashboardData} />
                </div>
            </div>
        </motion.div>
    </div>
</div>
); }