import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useApi } from './useApi';

type ApiInstance = ReturnType<typeof useApi>;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  role: 'admin' | 'team_member' | 'client';
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // User IDs
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  teams: Team[];
  error: string | null;
  isLoading: boolean;
  
  // Auth actions
  login: (email: string, password: string, api: ApiInstance) => Promise<boolean>;
  register: (name: string, email: string, password: string, api: ApiInstance, companyName?: string, phone?: string) => Promise<boolean>;
  logout: (api: ApiInstance) => void;
  updateUserProfile: (userData: Partial<User>, api: ApiInstance) => Promise<boolean>;
  
  // Team actions
  fetchTeams: (api: ApiInstance) => Promise<Team[]>;
  createTeam: (name: string, api: ApiInstance) => Promise<string>;
  updateTeamName: (teamId: string, newName: string, api: ApiInstance) => Promise<boolean>;
  addTeamMember: (teamId: string, phone: string, api: ApiInstance) => Promise<boolean>;
  removeTeamMember: (teamId: string, userId: string, api: ApiInstance) => Promise<boolean>;
  deleteTeam: (teamId: string, api: ApiInstance) => Promise<boolean>;
  
  // State management
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  resetState: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  teams: [],
  error: null,
  isLoading: false
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      resetState: () => set(initialState),
      
      login: async (email, password, api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall('/auth/login', {
            method: 'POST',
            body: { email, password },
            requiresAuth: false
          });
          
          if (response.success) {
            await api.saveToken(response.token);
            
            set({ 
              user: response.data,
              isAuthenticated: true,
              error: null
            });
            
            // Fetch teams after login
            const teams = await get().fetchTeams(api);
            set({ teams });
            
            return true;
          }
          
          set({ error: 'Invalid email or password' });
          return false;
        } catch (error: any) {
          set({ error: error.message || 'Failed to log in' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (name: string, email: string, password: string, api: ApiInstance, companyName?: string, phone?: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall('/auth/register', {
            method: 'POST',
            body: {
              name,
              email,
              password,
              companyName,
              phone
            },
            requiresAuth: false
          });

          if (response.success) {
            await api.saveToken(response.token);
            
            set({
              user: response.data,
              isAuthenticated: true,
              teams: [],
              error: null
            });
            
            return true;
          }
          
          set({ error: 'Registration failed' });
          return false;
        } catch (error: any) {
          set({ error: error.message || 'Failed to register' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async (api) => {
        try {
          set({ isLoading: true });
          await api.clearToken();
          get().resetState();
        } catch (error: any) {
          set({ error: error.message || 'Failed to log out' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateUserProfile: async (userData, api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall('/auth/updatedetails', {
            method: 'PUT',
            body: userData
          });
          
          if (response.success) {
            set(state => ({
              user: {
                ...state.user,
                ...response.data
              },
              error: null
            }));
            
            return true;
          }
          
          set({ error: 'Failed to update profile' });
          return false;
        } catch (error: any) {
          set({ error: error.message || 'Failed to update profile' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchTeams: async (api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall('/teams');
          
          if (response.success) {
            const teams = response.data.map((team: any) => ({
              id: team._id,
              name: team.name,
              ownerId: team.ownerId,
              members: team.members
            }));
            
            set({ teams, error: null });
            return teams;
          }
          
          set({ error: 'Failed to fetch teams' });
          return [];
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch teams' });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },
      
      createTeam: async (name, api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall('/teams', {
            method: 'POST',
            body: { name }
          });
          
          if (response.success) {
            const newTeam = {
              id: response.data._id,
              name: response.data.name,
              ownerId: response.data.ownerId,
              members: response.data.members
            };
            
            set(state => ({ 
              teams: [...state.teams, newTeam],
              user: state.user ? {
                ...state.user,
                teamId: newTeam.id
              } : null,
              error: null
            }));
            
            return newTeam.id;
          }
          
          set({ error: 'Failed to create team' });
          return '';
        } catch (error: any) {
          set({ error: error.message || 'Failed to create team' });
          return '';
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateTeamName: async (teamId, newName, api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall(`/teams/${teamId}`, {
            method: 'PUT',
            body: { name: newName }
          });
          
          if (response.success) {
            set(state => ({
              teams: state.teams.map(team => 
                team.id === teamId ? { ...team, name: newName } : team
              ),
              error: null
            }));
            
            return true;
          }
          
          set({ error: 'Failed to update team name' });
          return false;
        } catch (error: any) {
          set({ error: error.message || 'Failed to update team name' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      addTeamMember: async (teamId, phone, api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall(`/teams/${teamId}/members`, {
            method: 'POST',
            body: { phone }
          });
          
          if (response.success) {
            set(state => ({
              teams: state.teams.map(team => 
                team.id === teamId ? { ...team, members: response.data.members } : team
              ),
              error: null
            }));
            
            return true;
          }
          
          set({ error: 'Failed to add team member' });
          return false;
        } catch (error: any) {
          set({ error: error.message || 'Failed to add team member' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      removeTeamMember: async (teamId, userId, api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall(`/teams/${teamId}/members/${userId}`, {
            method: 'DELETE'
          });
          
          if (response.success) {
            set(state => ({
              teams: state.teams.map(team => 
                team.id === teamId ? { ...team, members: response.data.members } : team
              ),
              error: null
            }));
            
            return true;
          }
          
          set({ error: 'Failed to remove team member' });
          return false;
        } catch (error: any) {
          set({ error: error.message || 'Failed to remove team member' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteTeam: async (teamId, api) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.apiCall(`/teams/${teamId}`, {
            method: 'DELETE'
          });
          
          if (response.success) {
            set(state => ({
              teams: state.teams.filter(team => team.id !== teamId),
              user: state.user && state.user.teamId === teamId ? {
                ...state.user,
                teamId: undefined
              } : state.user,
              error: null
            }));
            
            return true;
          }
          
          set({ error: 'Failed to delete team' });
          return false;
        } catch (error: any) {
          set({ error: error.message || 'Failed to delete team' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        teams: state.teams
      })
    }
  )
);