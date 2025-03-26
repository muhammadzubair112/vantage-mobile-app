import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, Clock, Briefcase, User, Mail, Phone, Building, FileText, AlertCircle } from 'lucide-react-native';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { useTheme } from '@/components/ThemeProvider';

export const AppointmentSummary = () => {
  const { colors } = useTheme();
  const { selectedDate, selectedTimeSlot, selectedServices, contactInfo } = useAppointmentStore();
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Extract time from the time slot ID and format to local time
  const getTimeFromSlotId = (slotId: string) => {
    const timeString = slotId.split('-').pop() || '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const styles = createStyles(colors);
  
  // Show summary even when nothing is selected
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Summary</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Calendar size={20} color={colors.primary} />
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{selectedDate ? formatDate(selectedDate) : 'Not selected'}</Text>
        </View>
        
        <View style={styles.row}>
          <Clock size={20} color={colors.primary} />
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{selectedTimeSlot ? getTimeFromSlotId(selectedTimeSlot) : 'Not selected'}</Text>
        </View>
        
        <View style={styles.row}>
          <Briefcase size={20} color={colors.primary} />
          <Text style={styles.label}>Services:</Text>
          {selectedServices.length > 0 ? (
            <View style={styles.servicesList}>
              {selectedServices.map((service, index) => (
                <Text key={service.id} style={styles.value}>
                  {index + 1}. {service.name}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>Not selected</Text>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <User size={20} color={colors.primary} />
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{contactInfo.name || 'Not provided'}</Text>
        </View>
        
        <View style={styles.row}>
          <Mail size={20} color={colors.primary} />
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{contactInfo.email || 'Not provided'}</Text>
        </View>
        
        <View style={styles.row}>
          <Phone size={20} color={colors.primary} />
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{contactInfo.phone || 'Not provided'}</Text>
        </View>
        
        <View style={styles.row}>
          <Building size={20} color={colors.primary} />
          <Text style={styles.label}>Company:</Text>
          <Text style={styles.value}>{contactInfo.companyName || 'Not provided'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <FileText size={20} color={colors.primary} />
            <Text style={styles.notesLabel}>Notes:</Text>
          </View>
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{contactInfo.notes || 'Not provided'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
    width: 80, // Consistent width for all labels to ensure alignment
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  servicesList: {
    flex: 1,
  },
  notesSection: {
    marginTop: 8,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 8,
    marginLeft: 28, // Align with the content after the icon
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
});