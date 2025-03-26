import { create } from 'zustand';
import { useApi } from './useApi';
import { Service } from '@/types';

type ApiInstance = ReturnType<typeof useApi>;

interface ServiceState {
  services: Service[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchServices: (api: ApiInstance) => Promise<void>;
  getService: (id: string) => Service | undefined;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  loading: false,
  error: null,
  
  fetchServices: async (api) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.apiCall('/services', {
        requiresAuth: false // Services can be public
      });
      
      if (response.success) {
        const services = response.data.map((service: any) => ({
          id: service._id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          icon: service.icon
        }));
        
        set({ services, loading: false });
      } else {
        set({ error: 'Failed to fetch services', loading: false });
      }
    } catch (error) {
      console.error('Fetch services error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred', 
        loading: false 
      });
    }
  },
  
  getService: (id) => {
    return get().services.find(service => service.id === id);
  }
}));