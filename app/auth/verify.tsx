import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function VerifyScreen() {
  const { colors } = useTheme();
  const { user, isLoading } = useAuthStore();
  
  const styles = createStyles(colors);
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Verify Email',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Mail size={64} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification email to:
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          <Text style={styles.description}>
            Please check your email and click the verification link to activate your account.
            You won't be able to access all features until your email is verified.
          </Text>
          
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => {
                // Will implement resend functionality
              }}
            >
              <Text style={styles.resendButtonText}>Resend Verification Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightText,
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  resendButton: {
    backgroundColor: `${colors.primary}20`,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 16,
  },
}); 