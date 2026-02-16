import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from './translations';

// Types
export interface User {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  language: Language;
  mpin: string;
}

export interface Application {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  category: string;
  status: 'submitted' | 'in-review' | 'approved' | 'rejected';
  dateApplied: string;
  formData: Record<string, any>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'scheme' | 'status' | 'announcement';
  read: boolean;
  timestamp: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  eligibility: string;
  documents: string[];
  state?: string;
}

// Store interfaces
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  language: Language;
  setUser: (user: User | null) => void;
  setLanguage: (lang: Language) => void;
  login: (mobile: string, mpin: string) => boolean;
  loginWithOtp: (mobile: string) => boolean;
  register: (userData: Omit<User, 'id'>) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface ApplicationStore {
  applications: Application[];
  addApplication: (app: Omit<Application, 'id' | 'dateApplied' | 'status'>) => Application;
  updateStatus: (id: string, status: Application['status']) => void;
  getApplicationsByUser: (userId: string) => Application[];
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  getNotificationsByUser: (userId: string) => Notification[];
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul@example.com',
    language: 'en',
    mpin: '1234',
  },
];

// Auth Store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      language: 'en',
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLanguage: (language) => {
        set({ language });
        const user = get().user;
        if (user) {
          set({ user: { ...user, language } });
        }
      },
      
      login: (mobile, mpin) => {
        const users = JSON.parse(localStorage.getItem('scheme-sarthi-users') || '[]') as User[];
        const allUsers = [...mockUsers, ...users];
        const user = allUsers.find((u) => u.mobile === mobile && u.mpin === mpin);
        if (user) {
          set({ user, isAuthenticated: true, language: user.language });
          return true;
        }
        return false;
      },
      
      loginWithOtp: (mobile) => {
        const users = JSON.parse(localStorage.getItem('scheme-sarthi-users') || '[]') as User[];
        const allUsers = [...mockUsers, ...users];
        const user = allUsers.find((u) => u.mobile === mobile);
        if (user) {
          set({ user, isAuthenticated: true, language: user.language });
          return true;
        }
        return false;
      },
      
      register: (userData) => {
        const users = JSON.parse(localStorage.getItem('scheme-sarthi-users') || '[]') as User[];
        const exists = [...mockUsers, ...users].some((u) => u.mobile === userData.mobile);
        if (exists) return false;
        
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
        };
        users.push(newUser);
        localStorage.setItem('scheme-sarthi-users', JSON.stringify(users));
        set({ user: newUser, isAuthenticated: true, language: newUser.language });
        return true;
      },
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      updateProfile: (data) => {
        const user = get().user;
        if (user) {
          const updatedUser = { ...user, ...data };
          set({ user: updatedUser });
          
          // Update in localStorage
          const users = JSON.parse(localStorage.getItem('scheme-sarthi-users') || '[]') as User[];
          const index = users.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('scheme-sarthi-users', JSON.stringify(users));
          }
        }
      },
    }),
    {
      name: 'scheme-sarthi-auth',
    }
  )
);

// Application Store
export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set, get) => ({
      applications: [],
      
      addApplication: (appData) => {
        const newApp: Application = {
          ...appData,
          id: `APP${Date.now()}`,
          dateApplied: new Date().toISOString(),
          status: 'submitted',
        };
        set((state) => ({
          applications: [...state.applications, newApp],
        }));
        return newApp;
      },
      
      updateStatus: (id, status) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status } : app
          ),
        }));
      },
      
      getApplicationsByUser: (userId) => {
        return get().applications.filter((app) => app.userId === userId);
      },
    }),
    {
      name: 'scheme-sarthi-applications',
    }
  )
);

// Notification Store
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          userId: '1',
          title: 'New Scheme Available',
          message: 'PM Kisan Samman Nidhi is now accepting applications for the next quarter.',
          type: 'scheme',
          read: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          userId: '1',
          title: 'Important Announcement',
          message: 'Aadhaar linking deadline extended for EPF accounts.',
          type: 'announcement',
          read: false,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      
      addNotification: (notifData) => {
        const newNotif: Notification = {
          ...notifData,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      
      getNotificationsByUser: (userId) => {
        return get().notifications.filter((n) => n.userId === userId);
      },
    }),
    {
      name: 'scheme-sarthi-notifications',
    }
  )
);
