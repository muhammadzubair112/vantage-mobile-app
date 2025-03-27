import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useTheme } from '@/components/ThemeProvider';
import { useApi } from '@/hooks/useApi';

export default function CreateTeamScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { createTeam } = useAuthStore();
  const api = useApi();
  
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    if (isSuccess) {
      // Auto-navigate after 3 seconds
      const timer = setTimeout(() => {
        router.push('/team/manage');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);
  
  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const teamId = await createTeam(teamName.trim(), api);
      
      if (teamId) {
        setIsSuccess(true);
        Alert.alert(
          'Team Created',
          'Your team has been created successfully. You will be redirected to manage your team in a moment.',
        );
      } else {
        Alert.alert('Error', 'Failed to create team. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const styles = createStyles(colors);
  
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerTitle: "Create Team", headerBackTitle: "" }} />
        <View style={styles.successContainer}>
          <View style={styles.iconContainer}>
            <Users size={32} color={colors.background} />
          </View>
          <Text style={styles.successTitle}>Team Created!</Text>
          <Text style={styles.successText}>
            Your team has been created successfully. Redirecting to team management...
          </Text>
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerTitle: "Create Team", headerBackTitle: "" }} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Users size={32} color={colors.background} />
        </View>
        
        <Text style={styles.title}>Create Your Team</Text>
        <Text style={styles.subtitle}>
          Create a team to collaborate with your colleagues on client communications
        </Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Team Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter team name"
            placeholderTextColor={colors.lightText}
            value={teamName}
            onChangeText={setTeamName}
          />
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateTeam}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.createButtonText}>Create Team</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: `${colors.text}10`,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  createButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.lightText,
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loader: {
    marginTop: 16,
  },
});