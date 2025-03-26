import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Message, Conversation } from '@/types';
import { useApi } from './useApi';

type ApiInstance = ReturnType<typeof useApi>;

interface MessageState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // Conversation ID -> Messages
  activeConversationId: string | null;
  
  // Actions
  fetchConversations: (api: ApiInstance) => Promise<void>;
  fetchMessages: (conversationId: string, api: ApiInstance) => Promise<void>;
  setActiveConversation: (conversationId: string | null, api: ApiInstance) => void;
  sendMessage: (text: string, isClient: boolean, api: ApiInstance) => Promise<boolean>;
  markConversationAsRead: (conversationId: string, api: ApiInstance) => Promise<void>;
  getMessagesForConversation: (conversationId: string) => Message[];
  createTeamChat: (teamId: string, teamName: string, api: ApiInstance) => Promise<string>;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      
      fetchConversations: async (api) => {
        try {
          const response = await api.apiCall('/messages/conversations');
          
          if (response.success) {
            set({ conversations: response.data });
          }
        } catch (error) {
          console.error('Fetch conversations error:', error);
        }
      },
      
      fetchMessages: async (conversationId, api) => {
        try {
          const response = await api.apiCall(`/messages/conversations/${conversationId}/messages`);
          
          if (response.success) {
            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: response.data
              }
            }));
          }
        } catch (error) {
          console.error('Fetch messages error:', error);
        }
      },
      
      setActiveConversation: (conversationId, api) => {
        set({ activeConversationId: conversationId });
        
        if (conversationId) {
          get().markConversationAsRead(conversationId, api);
          get().fetchMessages(conversationId, api);
        }
      },
      
      sendMessage: async (text, isClient, api) => {
        const { activeConversationId } = get();
        
        if (!activeConversationId) return false;
        
        try {
          const response = await api.apiCall(`/messages/conversations/${activeConversationId}/messages`, {
            method: 'POST',
            body: { text }
          });
          
          if (response.success) {
            // Refresh messages
            await get().fetchMessages(activeConversationId, api);
            // Refresh conversations to update last message
            await get().fetchConversations(api);
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Send message error:', error);
          return false;
        }
      },
      
      markConversationAsRead: async (conversationId, api) => {
        try {
          await api.apiCall(`/messages/conversations/${conversationId}/read`, {
            method: 'PUT'
          });
          
          // Update local unread count
          set(state => {
            const updatedConversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                return { ...conv, unreadCount: 0 };
              }
              return conv;
            });
            
            return { conversations: updatedConversations };
          });
        } catch (error) {
          console.error('Mark as read error:', error);
        }
      },
      
      getMessagesForConversation: (conversationId) => {
        return get().messages[conversationId] || [];
      },
      
      createTeamChat: async (teamId, teamName, api) => {
        try {
          const response = await api.apiCall('/messages/teamchat', {
            method: 'POST',
            body: { teamId, teamName }
          });
          
          if (response.success) {
            // Refresh conversations
            await get().fetchConversations(api);
            
            return response.data._id;
          }
          
          return '';
        } catch (error) {
          console.error('Create team chat error:', error);
          return '';
        }
      },
    }),
    {
      name: 'message-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages
      })
    }
  )
);