import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';
import { useApi } from '@/hooks/useApi';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Trash2, Save, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export default function AvailabilityScreen() {
  const { colors } = useTheme();
  const api = useApi();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{ show: boolean; index: number; field: 'startTime' | 'endTime' }>({
    show: false,
    index: -1,
    field: 'startTime'
  });
  const [availability, setAvailability] = useState<Array<{
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>>([]);

  const loadAvailability = async () => {
    try {
      const response = await api.apiCall('/availability', {
        method: 'GET',
        requiresAuth: true,
        params: {
          date: selectedDate.toISOString().split('T')[0],
          _t: Date.now() // Add timestamp to prevent caching
        }
      });
      if (response.success) {
        // Filter availability for the selected date
        const dateStr = selectedDate.toISOString().split('T')[0];
        const filteredAvailability = response.data.filter(
          (slot: any) => new Date(slot.date).toISOString().split('T')[0] === dateStr
        );
        setAvailability(filteredAvailability);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', 'Failed to load availability settings');
    }
  };

  // Load availability when date changes
  useEffect(() => {
    loadAvailability();
  }, [selectedDate]);

  // Reload availability when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const currentSlots = availability.filter(slot => slot.date === dateStr);
      if (currentSlots.length === 0) {
        loadAvailability();
      }
    }, [selectedDate])
  );

  const handleAddAvailability = () => {
    setAvailability([
      ...availability,
      {
        date: selectedDate.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      }
    ]);
  };

  const handleUpdateAvailability = async () => {
    try {
      const response = await api.apiCall('/availability', {
        method: 'POST',
        requiresAuth: true,
        body: availability
      });
      if (response.success) {
        // Update local state with the response data
        const dateStr = selectedDate.toISOString().split('T')[0];
        const filteredAvailability = response.data.filter(
          (slot: any) => new Date(slot.date).toISOString().split('T')[0] === dateStr
        );
        setAvailability(filteredAvailability);
        Alert.alert('Success', 'Availability settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update availability settings');
    }
  };

  const handleDeleteTimeSlot = (index: number) => {
    const newAvailability = [...availability];
    newAvailability.splice(index, 1);
    setAvailability(newAvailability);
  };

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newAvailability = [...availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value
    };
    setAvailability(newAvailability);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker({ show: false, index: -1, field: 'startTime' });
    if (selectedTime && showTimePicker.index !== -1) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      updateTimeSlot(showTimePicker.index, showTimePicker.field, timeString);
    }
  };

  const formatTimeToLocal = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      padding: 16
    },
    dateSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      padding: 12,
      borderRadius: 8,
      marginBottom: 24
    },
    dateSelectorText: {
      flex: 1,
      fontSize: 16,
      color: colors.text
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6
    },
    dateButtonText: {
      color: colors.background,
      marginLeft: 4,
      fontWeight: '500'
    },
    timeSlotContainer: {
      backgroundColor: colors.cardBackground,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    timeInputContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    timeSelect: {
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 6,
      marginHorizontal: 4
    },
    timeSelectText: {
      color: colors.text
    },
    deleteButton: {
      padding: 8
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      justifyContent: 'center'
    },
    saveButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Manage Availability" showBackButton />
      
      <ScrollView style={styles.content}>
        <View style={styles.dateSelector}>
          <Text style={styles.dateSelectorText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={16} color={colors.background} />
            <Text style={styles.dateButtonText}>Change Date</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity
          style={styles.dateButton}
          onPress={handleAddAvailability}
        >
          <Plus size={16} color={colors.background} />
          <Text style={styles.dateButtonText}>Add Time Slot</Text>
        </TouchableOpacity>

        {availability
          .filter(slot => slot.date === selectedDate.toISOString().split('T')[0])
          .map((slot, index) => (
            <View key={index} style={styles.timeSlotContainer}>
              <View style={styles.timeInputContainer}>
                <TouchableOpacity
                  style={styles.timeSelect}
                  onPress={() => setShowTimePicker({ show: true, index, field: 'startTime' })}
                >
                  <Text style={styles.timeSelectText}>{formatTimeToLocal(slot.startTime)}</Text>
                </TouchableOpacity>
                <Text style={styles.timeSelectText}>to</Text>
                <TouchableOpacity
                  style={styles.timeSelect}
                  onPress={() => setShowTimePicker({ show: true, index, field: 'endTime' })}
                >
                  <Text style={styles.timeSelectText}>{formatTimeToLocal(slot.endTime)}</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTimeSlot(index)}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}

        {showTimePicker.show && (
          <DateTimePicker
            value={(() => {
              const [hours, minutes] = availability[showTimePicker.index][showTimePicker.field].split(':').map(Number);
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              return date;
            })()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleUpdateAvailability}
      >
        <Save size={20} color={colors.background} />
        <Text style={styles.saveButtonText}>Save Availability</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
} 