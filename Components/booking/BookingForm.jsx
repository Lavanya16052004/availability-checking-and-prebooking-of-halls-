import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/entities/User';
import { format } from 'date-fns';
import { Loader2, AlertCircle, Clock } from 'lucide-react';

const hours = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 1; // 1 to 12
  return hour.toString().padStart(2, '0');
});

const minutes = Array.from({ length: 60 }, (_, i) => {
  const minute = i + 1; // 1 to 60
  return minute.toString().padStart(2, '0');
});

const branches = [
  "Computer Science", "Electronics", "Mechanical", 
  "Civil", "Electrical", "Information Technology", 
  "MCA", "MBA", "AIDS", "Other"
];

export default function BookingForm({ isOpen, onClose, onSubmit, selectedDate, hallName, bookingToEdit }) {
  const [formData, setFormData] = useState({
    start_hour: '',
    start_minute: '01',
    start_period: 'AM',
    end_hour: '',
    end_minute: '01',
    end_period: 'AM',
    purpose: '',
    branch: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.branch && !bookingToEdit) {
          setFormData(prev => ({ ...prev, branch: currentUser.branch }));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    
    if (isOpen) {
      loadUser();
    }
  }, [isOpen, bookingToEdit]);

  useEffect(() => {
    if (bookingToEdit) {
      const [startHour24, startMinute] = bookingToEdit.start_time.split(':');
      const [endHour24, endMinute] = bookingToEdit.end_time.split(':');
      
      // Convert 24-hour to 12-hour format
      const startHour12 = convert24To12Hour(parseInt(startHour24));
      const endHour12 = convert24To12Hour(parseInt(endHour24));
      
      setFormData({
        start_hour: startHour12.hour.toString().padStart(2, '0'),
        start_minute: startMinute,
        start_period: startHour12.period,
        end_hour: endHour12.hour.toString().padStart(2, '0'),
        end_minute: endMinute,
        end_period: endHour12.period,
        purpose: bookingToEdit.purpose,
        branch: bookingToEdit.branch || user?.branch || ''
      });
    } else {
      setFormData({ 
        start_hour: '', 
        start_minute: '01',
        start_period: 'AM',
        end_hour: '', 
        end_minute: '01',
        end_period: 'AM',
        purpose: '',
        branch: user?.branch || ''
      });
    }
  }, [bookingToEdit, isOpen, user]);

  const convert24To12Hour = (hour24) => {
    if (hour24 === 0) return { hour: 12, period: 'AM' };
    if (hour24 < 12) return { hour: hour24, period: 'AM' };
    if (hour24 === 12) return { hour: 12, period: 'PM' };
    return { hour: hour24 - 12, period: 'PM' };
  };

  const convert12To24Hour = (hour12, period) => {
    const hour = parseInt(hour12);
    if (period === 'AM') {
      if (hour === 12) return 0;
      return hour;
    } else {
      if (hour === 12) return 12;
      return hour + 12;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-set end time to 1 hour after start time when start time changes
    if (field === 'start_hour' && value && !formData.end_hour) {
      const startHour24 = convert12To24Hour(value, formData.start_period);
      const endHour24 = (startHour24 + 1) % 24;
      const endHour12 = convert24To12Hour(endHour24);
      
      setFormData(prev => ({ 
        ...prev, 
        end_hour: endHour12.hour.toString().padStart(2, '0'),
        end_period: endHour12.period
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.start_hour || !formData.end_hour || !formData.purpose || !formData.branch) {
      setError("All fields are required.");
      return;
    }

    // Convert to 24-hour format for storage
    const startHour24 = convert12To24Hour(formData.start_hour, formData.start_period);
    const endHour24 = convert12To24Hour(formData.end_hour, formData.end_period);
    
    const startTime = `${startHour24.toString().padStart(2, '0')}:${formData.start_minute}`;
    const endTime = `${endHour24.toString().padStart(2, '0')}:${formData.end_minute}`;
    
    // Convert times to minutes for comparison
    const startMinutes = startHour24 * 60 + parseInt(formData.start_minute);
    const endMinutes = endHour24 * 60 + parseInt(formData.end_minute);
    
    if (startMinutes >= endMinutes) {
      setError("End time must be after start time.");
      return;
    }

    if (endMinutes - startMinutes < 15) {
      setError("Booking must be at least 15 minutes long.");
      return;
    }
    
    setIsSubmitting(true);
    const success = await onSubmit({
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
        purpose: formData.purpose,
        branch: formData.branch
    });
    setIsSubmitting(false);

    if (!success) {
      // Error will be shown by parent component
    }
  };

  const isEditing = !!bookingToEdit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {isEditing ? 'Edit Booking' : 'Book'}: {hallName}
          </DialogTitle>
          <DialogDescription>
            On {format(selectedDate, "MMMM d, yyyy")}. Please fill out the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="branch">Department/Branch</Label>
            <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-slate-500">Hour</Label>
                  <Select value={formData.start_hour} onValueChange={(value) => handleInputChange('start_hour', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hr" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {hours.map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Minute</Label>
                  <Select value={formData.start_minute} onValueChange={(value) => handleInputChange('start_minute', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {minutes.map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Period</Label>
                  <Select value={formData.start_period} onValueChange={(value) => handleInputChange('start_period', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-slate-500">Hour</Label>
                  <Select value={formData.end_hour} onValueChange={(value) => handleInputChange('end_hour', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hr" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {hours.map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Minute</Label>
                  <Select value={formData.end_minute} onValueChange={(value) => handleInputChange('end_minute', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {minutes.map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Period</Label>
                  <Select value={formData.end_period} onValueChange={(value) => handleInputChange('end_period', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Booking</Label>
            <Textarea 
              id="purpose" 
              value={formData.purpose} 
              onChange={(e) => handleInputChange('purpose', e.target.value)} 
              placeholder="e.g., Department Meeting, Guest Lecture, Student Presentation..."
              rows={3}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {isEditing ? 'Update Booking' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}