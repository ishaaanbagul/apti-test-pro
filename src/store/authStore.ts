import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'test_setter' | 'candidate';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithToken: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  'admin@talentshire.com': {
    id: '1',
    email: 'admin@talentshire.com',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123',
  },
  'setter@talentshire.com': {
    id: '2',
    email: 'setter@talentshire.com',
    name: 'Test Setter',
    role: 'test_setter',
    password: 'setter123',
  },
  'candidate@example.com': {
    id: '3',
    email: 'candidate@example.com',
    name: 'John Candidate',
    role: 'candidate',
    password: 'candidate123',
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const user = mockUsers[email];
        if (user && user.password === password) {
          const { password: _, ...userData } = user;
          set({ user: userData, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
      },
      loginWithToken: async (token: string) => {
        // Simulate token-based login for candidates
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        if (token === 'demo-candidate-token') {
          set({
            user: {
              id: '3',
              email: 'candidate@example.com',
              name: 'John Candidate',
              role: 'candidate',
            },
            isAuthenticated: true,
          });
          return { success: true };
        }
        return { success: false, error: 'Invalid token' };
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'talentshire-auth',
    }
  )
);
