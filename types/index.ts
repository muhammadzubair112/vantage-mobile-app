export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  icon: string;
};

export type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

export type Appointment = {
  id: string;
  date: string;
  timeSlot: string;
  service: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: number;
  read: boolean;
  isClient: boolean;
  isTeamChat?: boolean;
};

export type Conversation = {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  lastMessage: string;
  lastMessageTimestamp: number;
  unreadCount: number;
  isTeamChat?: boolean;
};