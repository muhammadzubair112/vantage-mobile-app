import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, XCircle } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useApi } from '@/hooks/useApi';

export default function VerifyEmailScreen() {
  const { colors } = useTheme();
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.apiCall(`/auth/verify-email/${token}`, {
          method: 'GET',
          requiresAuth: false
        });
        
        if (response.success) {
          setIsVerified(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.replace('/auth/login');
          }, 3000);
        } else {
          setError('Verification failed. Please try again.');
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyEmail();
  }, [token]);
  
  const styles = createStyles(colors);
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Verify Email',
          headerShown: false
        }}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Verifying your email...</Text>
            </>
          ) : error ? (
            <>
              <View style={styles.iconContainer}>
                <XCircle size={64} color={colors.error} />
              </View>
              <Text style={styles.title}>Verification Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Check size={64} color={colors.success} />
              </View>
              <Text style={styles.title}>Email Verified!</Text>
              <Text style={styles.successText}>
                Your email has been successfully verified. You will be redirected to login...
              </Text>
            </>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.lightText,
    marginTop: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 