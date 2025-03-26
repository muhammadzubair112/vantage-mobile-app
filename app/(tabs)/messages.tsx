import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle, Search, Plus, Users, LogIn } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { ConversationItem } from '@/components/ConversationItem';
import { useMessageStore } from '@/hooks/useMessageStore';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/Button';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { conversations, setActiveConversation, createTeamChat } = useMessageStore();
  const { user, teams, isAuthenticated } = useAuthStore();
  
  const handleConversationPress = (conversationId: string) => {
    setActiveConversation(conversationId);
    router.push(`/conversation/${conversationId}`);
  };
  
  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };
  
  const handleCreateTeamChat = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Find user's team
    const userTeam = teams.find(team => team.members.includes(user.id));
    if (!userTeam) {
      router.push('/team/create');
      return;
    }
    
    // Create team chat
    const chatId = createTeamChat(userTeam.id, userTeam.name);
    setActiveConversation(chatId);
    router.push(`/conversation/${chatId}`);
  };

  const TeamChatButton = () => (
    <TouchableOpacity 
      style={styles.teamChatHeaderButton}
      onPress={handleCreateTeamChat}
    >
      <Users size={20} color={colors.primary} />
    </TouchableOpacity>
  );
  
  const styles = createStyles(colors);
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Messages" />
        <View style={styles.notLoggedInContainer}>
          <View style={styles.iconContainer}>
            <MessageCircle size={48} color={colors.primary} />
          </View>
          <Text style={styles.notLoggedInTitle}>Sign in to access messages</Text>
          <Text style={styles.notLoggedInText}>
            Please log in or create an account to view and send messages.
          </Text>
          <Button
            title="Login"
            onPress={() => router.push('/auth/login')}
            style={styles.loginButton}
          />
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Messages" 
        rightComponent={user?.role === 'admin' ? <TeamChatButton /> : undefined}
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.lightText} />
          <Text style={styles.searchPlaceholder}>Search conversations...</Text>
        </View>
      </View>
      
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={item} 
              onPress={handleConversationPress} 
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MessageCircle size={48} color={colors.lightText} />
          <Text style={styles.emptyTitle}>No Messages Yet</Text>
          <Text style={styles.emptyText}>
            Your conversations will appear here.
          </Text>
        </View>
      )}
      
      {user?.role === 'admin' && (
        <TouchableOpacity 
          style={styles.teamChatButton}
          onPress={handleCreateTeamChat}
        >
          <Users size={20} color={colors.background} />
          <Text style={styles.teamChatText}>Team Chat</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: colors.lightText,
    fontSize: 14,
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
  },
  teamChatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  teamChatText: {
    color: colors.background,
    fontWeight: '600',
    marginLeft: 8,
  },
  notLoggedInContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  loginButton: {
    width: '100%',
    marginBottom: 16,
  },
  registerText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  teamChatHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});