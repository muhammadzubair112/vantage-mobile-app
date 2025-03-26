import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useAppointmentStore } from '@/hooks/useAppointmentStore';
import { useTheme } from '@/components/ThemeProvider';

export const ContactForm = () => {
  const { colors } = useTheme();
  const { contactInfo, updateContactInfo } = useAppointmentStore();

  const handleChange = (field: string, value: string) => {
    updateContactInfo(field, value);
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={contactInfo.name}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Enter your full name"
          placeholderTextColor={colors.lightText}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={contactInfo.email}
          onChangeText={(text) => handleChange('email', text)}
          placeholder="Enter your email address"
          placeholderTextColor={colors.lightText}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={contactInfo.phone}
          onChangeText={(text) => handleChange('phone', text)}
          placeholder="Enter your phone number"
          placeholderTextColor={colors.lightText}
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          value={contactInfo.companyName}
          onChangeText={(text) => handleChange('companyName', text)}
          placeholder="Enter your company name"
          placeholderTextColor={colors.lightText}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={contactInfo.notes}
          onChangeText={(text) => handleChange('notes', text)}
          placeholder="Any specific requirements or questions?"
          placeholderTextColor={colors.lightText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
});