import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Smartphone, UserPlus, Users } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { colors, isDarkMode } = useTheme();
  const { toggleTheme } = useThemeStore();
  const [notifications, setNotifications] = React.useState(true);
  const { user, isAuthenticated, logout, teams } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          },
        },
      ]
    );
  };

  const handleCreateTeam = () => {
    router.push('/team/create');
  };

  const handleManageTeam = () => {
    router.push('/team/manage');
  };

  const styles = createStyles(colors);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Profile" />
        
        <View style={styles.notLoggedInContainer}>
          <View style={styles.avatarContainer}>
            <User size={40} color={colors.background} />
          </View>
          <Text style={styles.notLoggedInTitle}>Not Logged In</Text>
          <Text style={styles.notLoggedInText}>
            Please log in or register to access your profile and team management features.
          </Text>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.loginButton]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.authButtonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.registerButton]}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userTeam = teams.find(team => team.ownerId === user?.id);
  const isTeamOwner = !!userTeam;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Profile" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color={colors.background} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          {user?.companyName && (
            <Text style={styles.companyName}>{user.companyName}</Text>
          )}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Management</Text>
            
            {isTeamOwner ? (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleManageTeam}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconContainer}>
                    <Users size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.menuText}>Manage Team</Text>
                </View>
                <ChevronRight size={20} color={colors.lightText} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleCreateTeam}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconContainer}>
                    <UserPlus size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.menuText}>Create Team</Text>
                </View>
                <ChevronRight size={20} color={colors.lightText} />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Moon size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0E0', true: `${colors.primary}80` }}
              thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Bell size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E0E0E0', true: `${colors.primary}80` }}
              thumbColor={notifications ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <HelpCircle size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <Smartphone size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>About App</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.lightText,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 16,
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    backgroundColor: `${colors.error}20`,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.lightText,
    marginBottom: 20,
  },
  notLoggedInContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  notLoggedInText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  authButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: colors.primary,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});