import React from 'react';
import { Clock, User, Pencil, Trash2, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function DailySchedule({ bookings, user, onEdit, onDelete }) {
    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-slate-50">
                <Clock className="w-10 h-10 text-slate-400 mb-3"/>
                <p className="text-slate-600 font-medium">No bookings for this day.</p>
                <p className="text-sm text-slate-500">The hall is free all day.</p>
            </div>
        );
    }
    
    const sortedBookings = [...bookings].sort((a, b) => a.start_time.localeCompare(b.start_time));

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {sortedBookings.map((booking, index) => (
                <motion.div 
                    key={booking.id}
                    className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600"/>
                            <span>{booking.start_time} - {booking.end_time}</span>
                        </div>
                        {booking.branch && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {booking.branch}
                            </Badge>
                        )}
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{booking.purpose}</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-3">
                        <div className="flex items-center gap-2">
                            <User className="w-3 h-3"/>
                            <span>Booked by: {booking.booked_by === user.email ? "You" : booking.booked_by}</span>
                        </div>
                        
                        {(user.email === booking.booked_by || user.role === 'admin') && (
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-8 h-8 hover:bg-blue-50" 
                                    onClick={() => onEdit(booking)}
                                >
                                    <Pencil className="w-4 h-4 text-blue-600"/>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="w-8 h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently cancel the booking for <span className="font-bold">{booking.purpose}</span> from {booking.start_time} to {booking.end_time}. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Back</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => onDelete(booking.id)} 
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Confirm Cancellation
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}