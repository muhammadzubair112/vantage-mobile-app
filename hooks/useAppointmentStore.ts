import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Appointment, Service } from '@/types';
import { useApi } from './useApi';

type ApiInstance = ReturnType<typeof useApi>;

interface AppointmentState {
  appointments: Appointment[];
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  selectedServices: Service[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    notes: string;
  };
  
  // Actions
  fetchAppointments: (api: ApiInstance) => Promise<void>;
  fetchTimeSlots: (date: string, api: ApiInstance) => Promise<any[]>;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (timeSlot: string | null) => void;
  toggleService: (service: Service) => void;
  updateContactInfo: (field: string, value: string) => void;
  resetContactInfo: () => void;
  addAppointment: (appointment: Partial<Appointment>, api: ApiInstance) => Promise<boolean>;
  cancelAppointment: (id: string, api: ApiInstance) => Promise<boolean>;
  resetSelection: () => void;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      selectedDate: null,
      selectedTimeSlot: null,
      selectedServices: [],
      contactInfo: {
        name: '',
        email: '',
        phone: '',
        companyName: '',
        notes: '',
      },
      
      fetchAppointments: async (api) => {
        try {
          const response = await api.apiCall('/appointments/user');
          
          if (response.success) {
            set({ appointments: response.data });
          }
        } catch (error) {
          console.error('Fetch appointments error:', error);
        }
      },
      
      fetchTimeSlots: async (date, api) => {
        try {
          const response = await api.apiCall(`/appointments/timeslots?date=${date}`);
          
          if (response.success) {
            return response.data;
          }
          
          return [];
        } catch (error) {
          console.error('Fetch time slots error:', error);
          return [];
        }
      },
      
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
      
      toggleService: (service) => set((state) => {
        const isSelected = state.selectedServices.some(s => s.id === service.id);
        
        if (isSelected) {
          // Remove service if already selected
          return {
            selectedServices: state.selectedServices.filter(s => s.id !== service.id)
          };
        } else {
          // Add service if not selected
          return {
            selectedServices: [...state.selectedServices, service]
          };
        }
      }),
      
      updateContactInfo: (field, value) => 
        set((state) => ({
          contactInfo: {
            ...state.contactInfo,
            [field]: value,
          }
        })),
      
      resetContactInfo: () => 
        set({
          contactInfo: {
            name: '',
            email: '',
            phone: '',
            companyName: '',
            notes: '',
          }
        }),
      
      addAppointment: async (appointment, api) => {
        try {
          const { selectedServices } = get();
          
          // Format services as array of IDs
          const serviceIds = selectedServices.map(service => service.id);
          
          const response = await api.apiCall('/appointments', {
            method: 'POST',
            body: {
              ...appointment,
              services: serviceIds
            }
          });
          
          if (response.success) {
            await get().fetchAppointments(api);
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Add appointment error:', error);
          return false;
        }
      },
      
      cancelAppointment: async (id, api) => {
        try {
          const response = await api.apiCall(`/appointments/${id}`, {
            method: 'PUT',
            body: { status: 'cancelled' }
          });
          
          if (response.success) {
            set((state) => ({
              appointments: state.appointments.map(app => 
                app.id === id ? { ...app, status: 'cancelled' } : app
              )
            }));
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Cancel appointment error:', error);
          return false;
        }
      },
      
      resetSelection: () => 
        set({
          selectedDate: null,
          selectedTimeSlot: null,
          selectedServices: [],
        }),
    }),
    {
      name: 'appointment-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        appointments: state.appointments,
        contactInfo: state.contactInfo
      })
    }
  )
);