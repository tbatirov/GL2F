import { create } from 'zustand';
import { AuthState, User } from '../types/auth';

// Mock authentication - Replace with real API calls
const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (email === 'admin@example.com' && password === 'admin') {
    return {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    };
  }
  
  throw new Error('Invalid email or password');
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    try {
      const user = await mockLogin(email, password);
      set({ user, isAuthenticated: true });
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  }
}));