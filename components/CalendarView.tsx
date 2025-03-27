import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { useTheme } from '@/components/ThemeProvider';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Use prop selectedDate if provided, otherwise use from store
  const selectedDate = propSelectedDate !== undefined ? propSelectedDate : storeSelectedDate;

  useEffect(() => {
    generateCalendarDays(currentDate);
  }, [currentDate]);

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add previous month's days
    const daysFromPrevMonth = firstDay.getDay();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
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

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) return;
    
    // Format as YYYY-MM-DD using local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    if (onSelectDate) {
      onSelectDate(formattedDate);
    } else {
      setSelectedDate(formattedDate);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigateMonth('prev')}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={colors.background} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity 
          onPress={() => navigateMonth('next')}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronRight size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {DAYS.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendar}>
        {calendarDays.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateCell,
              !isCurrentMonth(date) && styles.otherMonthDate,
              isToday(date) && styles.today,
              isSelectedDate(date) && styles.selectedDate,
              isPastDate(date) && styles.pastDate,
            ]}
            onPress={() => handleDateSelect(date)}
            disabled={isPastDate(date)}
            activeOpacity={0.7}
            hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
          >
            <View style={styles.dateCellContent}>
              <Text
                style={[
                  styles.dateText,
                  !isCurrentMonth(date) && styles.otherMonthText,
                  isSelectedDate(date) && styles.selectedDateText,
                  isPastDate(date) && styles.pastDateText,
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor(width / 7) - 8;

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
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
  weekDays: {
    flexDirection: 'row',
    backgroundColor: colors.calendarHighlight,
    paddingVertical: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.lightText,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  dateCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    padding: 2,
    margin: 4,
  },
  dateCellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  otherMonthDate: {
    opacity: 0.5,
  },
  otherMonthText: {
    color: colors.lightText,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedDate: {
    backgroundColor: 'transparent',
  },
  selectedDateText: {
    color: colors.background,
    fontWeight: '600',
  },
  pastDate: {
    backgroundColor: colors.cardBackground,
  },
  pastDateText: {
    color: colors.lightText,
  },
});