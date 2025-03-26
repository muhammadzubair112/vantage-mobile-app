import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { generateTimeSlots } from '@/mocks/timeSlots';
import { TimeSlot } from '@/types';
import { Clock } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface TimeSlotPickerProps {
  selectedDate?: string | null;
  selectedTimeSlot?: string | null;
  onSelectTimeSlot?: (timeSlot: string) => void;
}

export const TimeSlotPicker = ({ 
  selectedDate: propSelectedDate, 
  selectedTimeSlot: propSelectedTimeSlot,
  onSelectTimeSlot
}: TimeSlotPickerProps) => {
  const { colors } = useTheme();
  const { 
    selectedDate: storeSelectedDate, 
    selectedTimeSlot: storeSelectedTimeSlot, 
    setSelectedTimeSlot 
  } = useAppointmentStore();
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Use props if provided, otherwise use from store
  const selectedDate = propSelectedDate !== undefined ? propSelectedDate : storeSelectedDate;
  const selectedTimeSlot = propSelectedTimeSlot !== undefined ? propSelectedTimeSlot : storeSelectedTimeSlot;

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(new Date(selectedDate));
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  if (!selectedDate) {
    return (
      <View style={styles(colors).emptyContainer}>
        <Clock size={24} color={colors.lightText} />
        <Text style={styles(colors).emptyText}>Please select a date first</Text>
      </View>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <View style={styles(colors).emptyContainer}>
        <Text style={styles(colors).emptyText}>Loading available time slots...</Text>
      </View>
    );
  }

  const handleSelectTimeSlot = (slotId: string) => {
    if (onSelectTimeSlot) {
      onSelectTimeSlot(slotId);
    } else {
      setSelectedTimeSlot(slotId);
    }
  };

  // Format time to local time
  const formatTimeToLocal = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles(colors).container}>
      <Text style={styles(colors).title}>Available Time Slots</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles(colors).scrollContent}
      >
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles(colors).timeSlot,
              !slot.available && styles(colors).unavailableSlot,
              selectedTimeSlot === slot.id && styles(colors).selectedSlot,
            ]}
            onPress={() => slot.available && handleSelectTimeSlot(slot.id)}
            disabled={!slot.available}
          >
            <Text
              style={[
                styles(colors).timeText,
                !slot.available && styles(colors).unavailableText,
                selectedTimeSlot === slot.id && styles(colors).selectedText,
              ]}
            >
              {formatTimeToLocal(slot.time)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.calendarHighlight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
  },
  unavailableSlot: {
    backgroundColor: colors.cardBackground,
    opacity: 0.6,
  },
  unavailableText: {
    color: colors.lightText,
    textDecorationLine: 'line-through',
  },
  selectedSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedText: {
    color: colors.background,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.calendarHighlight,
    borderRadius: 8,
    marginVertical: 16,
  },
  emptyText: {
    marginTop: 8,
    color: colors.lightText,
    fontSize: 14,
  },
});