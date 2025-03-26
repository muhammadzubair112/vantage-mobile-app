import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { services } from '@/mocks/services';
import { Globe, TrendingUp, Search, Share2, Award } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

export const ServiceSelector = () => {
  const { colors } = useTheme();
  const { selectedServices, toggleService } = useAppointmentStore();

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'globe':
        return <Globe size={24} color={colors.primary} />;
      case 'trending-up':
        return <TrendingUp size={24} color={colors.primary} />;
      case 'search':
        return <Search size={24} color={colors.primary} />;
      case 'share-2':
        return <Share2 size={24} color={colors.primary} />;
      case 'award':
        return <Award size={24} color={colors.primary} />;
      default:
        return <Globe size={24} color={colors.primary} />;
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(service => service.id === serviceId);
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              isServiceSelected(service.id) && styles.selectedService,
            ]}
            onPress={() => toggleService(service)}
          >
            <View style={styles.iconContainer}>
              {getIconComponent(service.icon)}
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <Text style={styles.serviceDuration}>{service.duration} minutes</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedService: {
    borderColor: colors.primary,
    backgroundColor: colors.calendarHighlight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 8,
  },
  serviceDuration: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});