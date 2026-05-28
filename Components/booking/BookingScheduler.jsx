
import React, { useState, useEffect, useCallback } from 'react';
import { HallBooking } from '@/entities/HallBooking';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Plus, Clock, Loader2, AlertCircle } from 'lucide-react';
import BookingForm from './BookingForm';
import DailySchedule from './DailySchedule';

export default function BookingScheduler({ hall }) {
    const [date, setDate] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [bookingToEdit, setBookingToEdit] = useState(null);

    const loadData = useCallback(async () => {
        if (!hall || !date) return;
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const formattedDate = format(date, "yyyy-MM-dd");
            const hallBookings = await HallBooking.filter({ 
                hall_name: hall.room_number,
                booking_date: formattedDate,
                status: "Active"
            });
            setBookings(hallBookings);
        } catch (err) {
            console.error("Failed to load data:", err);
            setError("Could not load schedule. Please try again.");
        }
        setIsLoading(false);
    }, [hall, date]);

    useEffect(() => {
        loadData();
    }, [hall, date, loadData]);

    const timeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const hasTimeConflict = (newStart, newEnd, existingBookings, excludeId = null) => {
        const newStartMinutes = timeToMinutes(newStart);
        const newEndMinutes = timeToMinutes(newEnd);
        
        return existingBookings.some(booking => {
            if (excludeId && booking.id === excludeId) return false;
            
            const existingStartMinutes = timeToMinutes(booking.start_time);
            const existingEndMinutes = timeToMinutes(booking.end_time);
            
            // Check for any overlap
            return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
        });
    };

    const getConflictingBooking = (newStart, newEnd, existingBookings, excludeId = null) => {
        const newStartMinutes = timeToMinutes(newStart);
        const newEndMinutes = timeToMinutes(newEnd);
        
        return existingBookings.find(booking => {
            if (excludeId && booking.id === excludeId) return false;
            
            const existingStartMinutes = timeToMinutes(booking.start_time);
            const existingEndMinutes = timeToMinutes(booking.end_time);
            
            return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
        });
    };

    const handleSubmitBooking = async (bookingData) => {
        const newStart = bookingData.start_time;
        const newEnd = bookingData.end_time;
        const excludeId = bookingToEdit?.id;
        
        if (hasTimeConflict(newStart, newEnd, bookings, excludeId)) {
            const conflictingBooking = getConflictingBooking(newStart, newEnd, bookings, excludeId);
            setError(`⚠️ Time Conflict Alert: This hall is already booked from ${conflictingBooking.start_time} to ${conflictingBooking.end_time} by ${conflictingBooking.booked_by === user.email ? 'you' : conflictingBooking.branch} for "${conflictingBooking.purpose}". Please choose a different time slot.`);
            return false;
        }

        try {
            if (bookingToEdit) {
                await HallBooking.update(bookingToEdit.id, {
                    ...bookingData,
                    hall_name: hall.room_number,
                    booked_by: user.email,
                });
            } else {
                await HallBooking.create({
                    ...bookingData,
                    hall_name: hall.room_number,
                    booked_by: user.email,
                });
            }
            setShowBookingForm(false);
            setBookingToEdit(null);
            setError(null);
            loadData();
            return true;
        } catch (error) {
            console.error("Failed to save booking:", error);
            setError("❌ An error occurred while saving the booking. Please try again.");
            return false;
        }
    };

    const handleEdit = (booking) => {
        setBookingToEdit(booking);
        setShowBookingForm(true);
        setError(null);
    };

    const handleDelete = async (bookingId) => {
        try {
            await HallBooking.delete(bookingId);
            setError(null);
            loadData();
        } catch (error) {
            console.error("Failed to delete booking:", error);
            setError("Could not delete the booking. Please try again.");
        }
    };

    const closeForm = () => {
        setShowBookingForm(false);
        setBookingToEdit(null);
        setError(null);
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">{hall.room_number}</CardTitle>
                <CardDescription>Schedule and booking information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border bg-white"
                        disabled={(d) => d < new Date().setHours(0,0,0,0)}
                    />
                    <Button 
                        onClick={() => setShowBookingForm(true)} 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Book this Hall
                    </Button>
                </div>
                <div className="xl:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5"/>
                        Schedule for {format(date, "MMMM d, yyyy")}
                    </h3>
                    {error && (
                         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2 mb-4">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/> 
                            <p className="text-sm font-medium leading-relaxed">{error}</p>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <DailySchedule 
                            bookings={bookings} 
                            user={user} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </CardContent>

            {showBookingForm && (
                <BookingForm
                    isOpen={showBookingForm}
                    onClose={closeForm}
                    onSubmit={handleSubmitBooking}
                    selectedDate={date}
                    hallName={hall.room_number}
                    bookingToEdit={bookingToEdit}
                />
            )}
        </Card>
    );
}
