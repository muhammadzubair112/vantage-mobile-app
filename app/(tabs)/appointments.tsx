import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Modal,
  SafeAreaView as RNSafeAreaView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Briefcase, X, FileText } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { services } from '@/mocks/services';
import { Appointment } from '@/types';
import { useTheme } from '@/components/ThemeProvider';

export default function AppointmentsScreen() {
  const { colors } = useTheme();
  const { appointments, cancelAppointment } = useAppointmentStore();

  // Filter out cancelled appointments
  const activeAppointments = appointments.filter(app => app.status !== 'cancelled');

  const getServiceNames = (serviceIds: string) => {
    const ids = serviceIds.split(',');
    return ids.map(id => {
      const service = services.find(s => s.id === id);
      return service ? service.name : 'Unknown Service';
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeFromSlotId = (slotId: string) => {
    const timeString = slotId.split('-').pop() || '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelAppointment(appointment.id);
            Alert.alert('Appointment Cancelled', 'Your appointment has been cancelled successfully.');
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const isPending = item.status === 'pending';
    const isConfirmed = item.status === 'confirmed';
    const serviceNames = getServiceNames(item.service);

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              isPending ? styles.pendingIndicator : styles.confirmedIndicator
            ]} />
            <Text style={styles.statusText}>
              {isPending ? 'Pending' : 'Confirmed'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailText}>{getTimeFromSlotId(item.timeSlot)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Briefcase size={20} color={colors.primary} style={styles.serviceIcon} />
            <Text style={styles.detailLabel}>Services:</Text>
            <View style={styles.servicesList}>
              {serviceNames.map((serviceName, index) => (
                <Text key={index} style={styles.detailText}>
                  {index + 1}. {serviceName}
                </Text>
              ))}
            </View>
          </View>
        </View>
        
        {item.notes && (
          <>
            <View style={styles.notesHeader}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.notesLabel}>Notes:</Text>
            </View>
            <View style={styles.notesContainer}>
              <Text style={styles.detailText}>{item.notes}</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Bookings" />
      
      {activeAppointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={48} color={colors.lightText} />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptyText}>
            You don't have any active appointments. Schedule a consultation to get started.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  pendingIndicator: {
    backgroundColor: '#FFA500',
  },
  confirmedIndicator: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: `${colors.error}20`,
  },
  cancelText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
    width: 80,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  serviceIcon: {
    marginTop: 2,
  },
  servicesList: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
});