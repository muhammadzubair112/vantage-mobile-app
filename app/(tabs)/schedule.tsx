import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarCheck } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { CalendarView } from '@/components/CalendarView';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { ServiceSelector } from '@/components/ServiceSelector';
import { ContactForm } from '@/components/ContactForm';
import { AppointmentSummary } from '@/components/AppointmentSummary';
import { Button } from '@/components/Button';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { services } from '@/mocks/services';
import { useTheme } from '@/components/ThemeProvider';

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { serviceId } = params;
  const { colors } = useTheme();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    selectedDate,
    selectedTimeSlot,
    selectedServices,
    contactInfo,
    toggleService,
    addAppointment,
    resetSelection,
    resetContactInfo,
  } = useAppointmentStore();

  useEffect(() => {
    // If serviceId is provided in params, select that service
    if (serviceId && typeof serviceId === 'string') {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        toggleService(service);
      }
    }
  }, [serviceId]);

  const validateForm = () => {
    if (!selectedDate) {
      Alert.alert('Missing Information', 'Please select a date for your appointment.');
      return false;
    }
    
    if (!selectedTimeSlot) {
      Alert.alert('Missing Information', 'Please select a time slot for your appointment.');
      return false;
    }
    
    if (selectedServices.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one service for your appointment.');
      return false;
    }
    
    if (!contactInfo.name) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return false;
    }
    
    if (!contactInfo.email) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return false;
    }
    
    if (!contactInfo.phone) {
      Alert.alert('Missing Information', 'Please enter your phone number.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create appointment with all selected services
      const serviceIds = selectedServices.map(service => service.id).join(',');
      const newAppointment = {
        id: `${Date.now()}`,
        date: selectedDate!,
        timeSlot: selectedTimeSlot!,
        service: serviceIds,
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        companyName: contactInfo.companyName,
        notes: contactInfo.notes,
        status: 'pending',
      };
      
      addAppointment(newAppointment as any);
      
      setIsSubmitting(false);
      
      Alert.alert(
        'Appointment Scheduled',
        'Your appointment has been scheduled successfully. We will contact you to confirm the details.',
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              resetSelection();
              resetContactInfo();
              router.push('/appointments');
            },
          },
          {
            text: 'OK',
            onPress: () => {
              resetSelection();
              resetContactInfo();
              router.push('/');
            },
          },
        ]
      );
    }, 1500);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Schedule an Appointment" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.introSection}>
            <View style={styles.iconContainer}>
              <CalendarCheck size={24} color={colors.background} />
            </View>
            <Text style={styles.introTitle}>Book Your Free Consultation</Text>
            <Text style={styles.introText}>
              Select a date, time, and services to schedule your free consultation with our experts.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select a Date</Text>
            <CalendarView />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Select a Time</Text>
            <TimeSlotPicker />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Select Services</Text>
            <ServiceSelector />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Your Information</Text>
            <ContactForm />
          </View>
          
          <View style={styles.section}>
            <AppointmentSummary />
          </View>
          
          <Button 
            title="Schedule Appointment" 
            onPress={handleSubmit}
            disabled={!selectedDate || !selectedTimeSlot || selectedServices.length === 0 || !contactInfo.name || !contactInfo.email || !contactInfo.phone}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
  },
});