import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Calendar, Award, Users, Briefcase } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { services } from '@/mocks/services';
import { useTheme } from '@/components/ThemeProvider';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleScheduleAppointment = () => {
    router.push('/schedule');
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.companyName}>Vantage Media</Text>
          <Text style={styles.tagline}>Elevate your business online</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Book a <Text style={styles.highlight}>FREE</Text> consultation with our experts
          </Text>
          <Text style={styles.heroSubtitle}>
            Get professional advice on websites and digital marketing for your business
          </Text>
          <Button 
            title="Schedule a Call" 
            onPress={handleScheduleAppointment} 
            style={styles.heroButton}
          />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80' }} 
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {services.map((service) => (
              <TouchableOpacity 
                key={service.id} 
                style={styles.serviceCard}
                onPress={() => {
                  router.push({
                    pathname: '/schedule',
                    params: { serviceId: service.id }
                  });
                }}
              >
                <View style={styles.serviceIconContainer}>
                  <Briefcase size={24} color={colors.primary} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <View style={styles.learnMore}>
                  <Text style={styles.learnMoreText}>Learn more</Text>
                  <ArrowRight size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Award size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Expert Team</Text>
              <Text style={styles.featureDescription}>
                Our team of professionals has years of experience in digital marketing and web development.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Users size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Client-Focused</Text>
              <Text style={styles.featureDescription}>
                We prioritize your business needs and goals to deliver tailored solutions.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Timely Delivery</Text>
              <Text style={styles.featureDescription}>
                We respect deadlines and ensure your projects are completed on time.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to grow your business?</Text>
          <Text style={styles.ctaSubtitle}>
            Schedule a free consultation call with our experts today
          </Text>
          <Button 
            title="Book Your Free Call" 
            onPress={handleScheduleAppointment} 
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  tagline: {
    fontSize: 14,
    color: colors.lightText,
    marginTop: 4,
  },
  heroSection: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    margin: 20,
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  highlight: {
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.lightText,
    marginBottom: 20,
    lineHeight: 22,
  },
  heroButton: {
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  servicesContainer: {
    paddingBottom: 10,
  },
  serviceCard: {
    width: 250,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 12,
    lineHeight: 20,
  },
  learnMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  featuresContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  featureCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.lightText,
    lineHeight: 20,
  },
  ctaSection: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
});