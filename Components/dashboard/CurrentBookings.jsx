import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HallBooking } from "@/entities/HallBooking";
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CurrentBookings({ bookings, onRefresh }) {
  const cancelBooking = async (bookingId) => {
    try {
      await HallBooking.delete(bookingId);
      onRefresh();
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Your Hall Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No active bookings</p>
            <p className="text-sm text-slate-400">Book a hall to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{booking.hall_name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{booking.purpose}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(booking.booking_date), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {booking.start_time} - {booking.end_time}
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently cancel your booking for <span className="font-bold">{booking.hall_name}</span> on {format(new Date(booking.booking_date), "MMM d")}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Back</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => cancelBooking(booking.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirm Cancellation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}