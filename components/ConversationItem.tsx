import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Conversation } from '@/types';
import { User, Check, CheckCheck } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversationId: string) => void;
}

export const ConversationItem = ({ conversation, onPress }: ConversationItemProps) => {
  const { colors } = useTheme();
  
  const formatTime = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within the last week, show day name
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (messageDate > oneWeekAgo) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const styles = createStyles(colors);
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(conversation.id)}
    >
      <View style={styles.avatarContainer}>
        <User size={24} color={colors.background} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{conversation.clientName}</Text>
          <Text style={styles.time}>{formatTime(conversation.lastMessageTimestamp)}</Text>
        </View>
        
        {conversation.clientCompany && (
          <Text style={styles.companyName}>{conversation.clientCompany}</Text>
        )}
        
        <View style={styles.messageRow}>
          <View style={styles.messageContainer}>
            {conversation.unreadCount === 0 && (
              <CheckCheck size={14} color={colors.primary} style={styles.readIcon} />
            )}
            <Text 
              style={[
                styles.message,
                conversation.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
          </View>
          
          {conversation.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  companyName: {
    fontSize: 13,
    color: colors.lightText,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.lightText,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  readIcon: {
    marginRight: 4,
  },
  message: {
    fontSize: 14,
    color: colors.lightText,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '500',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background,
  },
});