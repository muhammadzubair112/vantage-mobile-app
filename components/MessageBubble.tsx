import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '@/types';
import { CheckCheck } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { colors } = useTheme();
  const isClient = message.isClient;
  const isTeamChat = message.isTeamChat;
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const styles = createStyles(colors);
  
  return (
    <View style={[
      styles.container,
      isClient ? styles.clientContainer : styles.staffContainer
    ]}>
      {isTeamChat && message.senderName && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      
      <View style={[
        styles.bubble,
        isClient ? styles.clientBubble : styles.staffBubble
      ]}>
        <Text style={[
          styles.messageText,
          isClient ? styles.clientText : styles.staffText
        ]}>
          {message.text}
        </Text>
      </View>
      
      <View style={styles.messageFooter}>
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        {!isClient && message.read && (
          <CheckCheck size={12} color={colors.primary} style={styles.readIcon} />
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  clientContainer: {
    alignSelf: 'flex-start',
  },
  staffContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  clientBubble: {
    backgroundColor: colors.messageIncoming,
    borderBottomLeftRadius: 4,
  },
  staffBubble: {
    backgroundColor: colors.messageOutgoing,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  clientText: {
    color: colors.text,
  },
  staffText: {
    color: colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    color: colors.lightText,
    marginRight: 4,
  },
  readIcon: {
    marginLeft: 2,
  },
  senderName: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
});