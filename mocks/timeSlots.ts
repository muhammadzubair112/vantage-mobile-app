import { TimeSlot } from '@/types';

export const generateTimeSlots = (date: Date): TimeSlot[] => {
  // Business hours from 9 AM to 5 PM
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;
  
  // Generate 30-minute slots
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Make some slots unavailable randomly for demo purposes
      const isAvailable = Math.random() > 0.3;
      
      slots.push({
        id: `${date.toISOString().split('T')[0]}-${time}`,
        time,
        available: isAvailable,
      });
    }
  }
  
  return slots;
};