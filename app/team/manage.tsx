import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserPlus, User, X, Phone, Trash2, Pencil } from 'lucide-react-native';
import { useAuthStore, Team } from '@/hooks/useAuthStore';
import { useTheme } from '@/components/ThemeProvider';
import { useApi } from '@/hooks/useApi';

export default function ManageTeamScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, teams, addTeamMember, removeTeamMember, deleteTeam, updateTeamName } = useAuthStore();
  const api = useApi();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  
  // Find team where user is either owner or member
  const userTeam = teams.find(team => 
    team.ownerId === user?.id || (user && team.members.includes(user.id))
  );
  
  const isTeamOwner = userTeam?.ownerId === user?.id;
  
  const handleAddMember = async () => {
    if (!userTeam) {
      Alert.alert(
        'Error',
        'Team not found',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    if (!isTeamOwner) {
      Alert.alert(
        'Error',
        'Only team owners can add members',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert(
        'Error',
        'Please enter a phone number',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    try {
      const success = await addTeamMember(userTeam.id, phoneNumber.trim(), api);
      if (success) {
        setPhoneNumber('');
        Alert.alert(
          'Success',
          'Team member added successfully',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to add team member',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add team member',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };
  
  const handleRemoveMember = (memberId: string) => {
    if (!userTeam) {
      Alert.alert(
        'Error',
        'Team not found',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
      return;
    }
    
    if (!isTeamOwner) {
      Alert.alert(
        'Error',
        'Only team owners can remove members',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
      return;
    }
    
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the team?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeTeamMember(userTeam.id, memberId, api);
              if (success) {
                Alert.alert(
                  'Success',
                  'Team member removed successfully',
                  [{ text: 'OK', style: 'default' }],
                  { cancelable: true }
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to remove team member',
                  [{ text: 'OK', style: 'default' }],
                  { cancelable: true }
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to remove team member',
                [{ text: 'OK', style: 'default' }],
                { cancelable: true }
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteTeam = async () => {
    if (!userTeam) {
      return;
    }
    
    const canDeleteTeam = isTeamOwner || user?.role === 'team_admin' || user?.role === 'admin';
    
    if (!canDeleteTeam) {
      Alert.alert(
        'Error',
        'Only team owners and team admins can delete the team',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteTeam(userTeam.id, api);
              if (success) {
                Alert.alert(
                  'Success',
                  'Team deleted successfully',
                  [{ text: 'OK', style: 'default', onPress: () => router.replace('/(tabs)/profile') }]
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to delete team',
                  [{ text: 'OK', style: 'default' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete team',
                [{ text: 'OK', style: 'default' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleEditTeamName = () => {
    if (!userTeam || !isTeamOwner) return;
    
    if (isEditingName) {
      if (newTeamName.trim()) {
        updateTeamName(userTeam.id, newTeamName.trim(), api);
      }
      setIsEditingName(false);
    } else {
      setNewTeamName(userTeam.name);
      setIsEditingName(true);
    }
  };

  const handleUpdateTeamName = (text: string) => {
    setNewTeamName(text);
    if (userTeam && isTeamOwner && text.trim()) {
      updateTeamName(userTeam.id, text.trim(), api);
    }
  };

  const handleSaveAndExit = () => {
    router.replace('/(tabs)/profile');
  };
  
  const styles = createStyles(colors);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {!userTeam ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Team Found</Text>
            <Text style={styles.emptyText}>
              You are not part of any team yet. Create a team to get started.
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/team/create')}
            >
              <Text style={styles.createButtonText}>Create Team</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.teamHeader}>
              {isEditingName ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.editNameInput}
                    value={newTeamName}
                    onChangeText={handleUpdateTeamName}
                    autoFocus
                  />
                </View>
              ) : (
                <View style={styles.teamNameContainer}>
                  <Text style={styles.teamName}>{userTeam.name}</Text>
                  {isTeamOwner && (
                    <TouchableOpacity 
                      style={styles.editNameIcon}
                      onPress={handleEditTeamName}
                    >
                      <Pencil size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <Text style={styles.memberCount}>
                {userTeam.members.length} Member{userTeam.members.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {isTeamOwner && (
              <View style={styles.addMemberSection}>
                <Text style={styles.sectionTitle}>Add Team Member</Text>
                <View style={styles.addMemberRow}>
                  <View style={styles.phoneInputContainer}>
                    <Phone size={20} color={colors.lightText} style={styles.phoneIcon} />
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Enter phone number"
                      placeholderTextColor={colors.lightText}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddMember}
                  >
                    <UserPlus size={20} color={colors.background} />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>Team Members</Text>
              {userTeam.members.map((memberId) => {
                const isOwner = memberId === userTeam.ownerId;
                const memberName = isOwner && user?.id === memberId 
                  ? user.name || 'Team Owner'
                  : `Team Member (${memberId})`;
                const memberPhone = isOwner && user?.id === memberId
                  ? user.phone || ''
                  : `+${Math.floor(1000000000 + Math.random() * 9000000000)}`;
                
                return (
                  <View key={memberId} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <User size={20} color={colors.background} />
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{memberName}</Text>
                      <Text style={styles.memberPhone}>{memberPhone}</Text>
                    </View>
                    {isOwner ? (
                      <View style={styles.ownerBadge}>
                        <Text style={styles.ownerBadgeText}>Owner</Text>
                      </View>
                    ) : isTeamOwner ? (
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(memberId)}
                      >
                        <X size={16} color={colors.error} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {isTeamOwner && (
              <>
                <TouchableOpacity 
                  style={styles.saveExitButton}
                  onPress={handleSaveAndExit}
                >
                  <Text style={styles.saveExitText}>Save and Exit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteTeamButton}
                  onPress={handleDeleteTeam}
                >
                  <Trash2 size={20} color={colors.error} />
                  <Text style={styles.deleteTeamText}>Delete Team</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
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
    padding: 20,
  },
  teamHeader: {
    marginBottom: 24,
  },
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  editNameIcon: {
    marginLeft: 8,
    padding: 4,
  },
  editNameContainer: {
    marginBottom: 4,
  },
  editNameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    color: colors.lightText,
  },
  addMemberSection: {
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.text}10`,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  phoneIcon: {
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: {
    color: colors.background,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  membersSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 14,
    color: colors.lightText,
  },
  ownerBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  saveExitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveExitText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: `${colors.error}20`,
  },
  deleteTeamText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
    marginLeft: 8,
  },
});