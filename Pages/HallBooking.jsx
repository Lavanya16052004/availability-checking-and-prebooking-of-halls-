import React, { useState, useEffect } from "react";
import { RoomStatus } from "@/entities/RoomStatus";
import { motion } from "framer-motion";
import { Loader2, Building, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HallSelector from "../components/booking/HallSelector";
import BookingScheduler from "../components/booking/BookingScheduler";

export default function HallBookingPage() {
    const [halls, setHalls] = useState({ "Main Block": [], "Dharithri Block": [] });
    const [selectedHall, setSelectedHall] = useState(null);
    const [selectedBuilding, setSelectedBuilding] = useState("Main Block");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadHalls();
    }, []);

    const loadHalls = async () => {
        setIsLoading(true);
        try {
            const commonHalls = await RoomStatus.filter({ room_type: "Common Hall" });
            
            const organizedHalls = {
                "Main Block": commonHalls.filter(hall => hall.building === "Main Block"),
                "Dharithri Block": commonHalls.filter(hall => hall.building === "Dharithri Block")
            };
            
            setHalls(organizedHalls);
            
            // Select first hall from Main Block by default
            if (organizedHalls["Main Block"].length > 0) {
                setSelectedHall(organizedHalls["Main Block"][0]);
            } else if (organizedHalls["Dharithri Block"].length > 0) {
                setSelectedHall(organizedHalls["Dharithri Block"][0]);
                setSelectedBuilding("Dharithri Block");
            }
        } catch (error) {
            console.error("Failed to load halls:", error);
        }
        setIsLoading(false);
    };

    const handleBuildingChange = (building) => {
        setSelectedBuilding(building);
        if (halls[building].length > 0) {
            setSelectedHall(halls[building][0]);
        } else {
            setSelectedHall(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-700">Loading Booking System...</span>
            </div>
        );
    }
    
    return (
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Hall Pre-Booking System</h1>
                  <p className="text-slate-600">Reserve common halls for events, meetings, and classes</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <Button
                    onClick={() => handleBuildingChange("Main Block")}
                    variant={selectedBuilding === "Main Block" ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                        selectedBuilding === "Main Block" 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border-blue-200 text-blue-700 hover:bg-blue-50"
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    Main Block ({halls["Main Block"].length} halls)
                </Button>
                <Button
                    onClick={() => handleBuildingChange("Dharithri Block")}
                    variant={selectedBuilding === "Dharithri Block" ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                        selectedBuilding === "Dharithri Block" 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : "border-purple-200 text-purple-700 hover:bg-purple-50"
                    }`}
                >
                    <Building className="w-4 h-4" />
                    Dharithri Block ({halls["Dharithri Block"].length} halls)
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="md:col-span-1 lg:col-span-1">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                {selectedBuilding === "Main Block" ? (
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <Building className="w-5 h-5 text-purple-600" />
                                )}
                                {selectedBuilding} Halls
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HallSelector
                                halls={halls[selectedBuilding]}
                                selectedHall={selectedHall}
                                onSelectHall={setSelectedHall}
                                building={selectedBuilding}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                    {selectedHall ? (
                        <BookingScheduler key={selectedHall.id} hall={selectedHall} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-xl p-8">
                            <Building className="w-16 h-16 text-slate-300 mb-4"/>
                            <h3 className="text-xl font-semibold text-slate-700">No Halls Available</h3>
                            <p className="text-slate-500">No halls are available in {selectedBuilding} at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}