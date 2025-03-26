import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Send, Paperclip, Mic, Image as ImageIcon, Users } from 'lucide-react-native';
import { MessageBubble } from '@/components/MessageBubble';
import { useMessageStore } from '@/hooks/useMessageStore';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function ConversationScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();
  
  const { 
    getMessagesForConversation, 
    sendMessage, 
    markConversationAsRead,
    conversations
  } = useMessageStore();
  
  const conversationId = typeof id === 'string' ? id : '';
  const messages = getMessagesForConversation(conversationId);
  const conversation = conversations.find(c => c.id === conversationId);
  
  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId]);
  
  const handleSendMessage = () => {
    if (messageText.trim() === '') return;
    
    sendMessage(messageText.trim(), false); // false means it's from staff, not client
    setMessageText('');
    
    // Simulate typing response if not a team chat
    if (!conversation?.isTeamChat) {
      setIsTyping(true);
      setTimeout(() => {
        // Simulate automated response
        sendMessage("Thanks for your message! Our team will get back to you shortly.", true);
        setIsTyping(false);
      }, 2000);
    }
    
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const TeamChatButton = () => (
    <TouchableOpacity style={styles.teamChatButton}>
      <Users size={16} color={colors.primary} style={styles.teamChatIcon} />
      <Text style={styles.teamChatText}>Team Chat</Text>
    </TouchableOpacity>
  );
  
  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Conversation not found</Text>
      </SafeAreaView>
    );
  }
  
  const styles = createStyles(colors);
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: conversation.isTeamChat 
            ? conversation.clientName
            : conversation.clientCompany 
              ? `${conversation.clientName} • ${conversation.clientCompany}`
              : conversation.clientName,
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerRight: conversation.isTeamChat && user?.role === 'admin' ? () => <TeamChatButton /> : undefined,
          presentation: 'modal',
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>Vantage Media is typing</Text>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color={colors.lightText} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={colors.lightText}
            multiline
          />
          
          {messageText.trim() === '' ? (
            <TouchableOpacity style={styles.micButton}>
              <Mic size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Send size={20} color={colors.background} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.quickActionsBar}>
          <TouchableOpacity style={styles.quickAction}>
            <ImageIcon size={18} color={colors.primary} />
            <Text style={styles.quickActionText}>Image</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionText}>Schedule Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionText}>Request Update</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '60%',
  },
  typingText: {
    fontSize: 12,
    color: colors.lightText,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: colors.text,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsBar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  teamChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  teamChatIcon: {
    marginRight: 4,
  },
  teamChatText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});