import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { useTheme } from '@/components/ThemeProvider';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CalendarViewProps {
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
}

export const CalendarView = ({ selectedDate: propSelectedDate, onSelectDate }: CalendarViewProps) => {
  const { colors } = useTheme();
  const { selectedDate: storeSelectedDate, setSelectedDate } = useAppointmentStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([]);

  // Use prop selectedDate if provided, otherwise use from store
  const selectedDate = propSelectedDate !== undefined ? propSelectedDate : storeSelectedDate;

  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth]);

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0-6)
    const firstDayOfWeek = firstDay.getDay();
    
    const days: Array<Date | null> = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    setCalendarDays(days);
  };

  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) return;
    const dateString = date.toISOString().split('T')[0];
    
    if (onSelectDate) {
      onSelectDate(dateString);
    } else {
      setSelectedDate(dateString);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={colors.background} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={colors.background} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysHeader}>
        {DAYS.map((day, index) => (
          <Text key={index} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => (
          <View key={index} style={styles.dayCellWrapper}>
            {date ? (
              <TouchableOpacity
                style={[
                  styles.dayCell,
                  isSelectedDate(date) && styles.selectedDay,
                  isToday(date) && styles.today,
                  isPastDate(date) && styles.pastDay,
                ]}
                onPress={() => handleDateSelect(date)}
                disabled={isPastDate(date)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isSelectedDate(date) && styles.selectedDayText,
                    isPastDate(date) && styles.pastDayText,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyCell} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: colors.calendarHighlight,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: colors.lightText,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellWrapper: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  dayNumber: {
    fontSize: 14,
    color: colors.text,
  },
  selectedDay: {
    backgroundColor: colors.calendarSelected,
  },
  selectedDayText: {
    color: colors.background,
    fontWeight: '600',
  },
  today: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pastDay: {
    backgroundColor: colors.cardBackground,
  },
  pastDayText: {
    color: colors.lightText,
  },
  emptyCell: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardBackground,
  },
});