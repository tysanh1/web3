import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

// Define types 
interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User | null;
  session: {
    access_token: string;
    expires_at?: number;
  } | null;
}

interface SignUpData {
  email: string;
  password: string;
  username?: string;
}

interface UpdateUserData {
  username?: string;
  avatar?: string;
  walletAddress?: string;
}

// LocalStorage keys
const USER_KEY = 'local_auth_user';
const SESSION_KEY = 'local_auth_session';
const USERS_KEY = 'users';

// Helper function to get users from localStorage
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

// Helper function to save users to localStorage
const saveUsers = (users: any[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const localAuthService = {
  signUp: async (data: SignUpData): Promise<void> => {
    try {
      const users = getUsers();
      
      // Check if email exists
      if (users.some((u: any) => u.email === data.email)) {
        throw new Error('Email already registered');
      }

      // Check if username exists
      if (data.username && users.some((u: any) => u.username === data.username)) {
        throw new Error('Username already taken');
      }
      
      // Create new user
      const now = new Date().toISOString();
      const newUser = {
        id: uuidv4(),
        email: data.email,
        username: data.username || data.email.split('@')[0],
        password: data.password, // In a real app, this would be hashed
        createdAt: now,
        updatedAt: now,
      };
      
      // Save user
      saveUsers([...users, newUser]);
      
      return Promise.resolve();
    } catch (error: any) {
      const { toast } = useToast();
      toast({
        title: 'Error creating account',
        description: error.message || 'Failed to create account',
        variant: 'destructive'
      });
      return Promise.reject(error);
    }
  },
  
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Find user
      const users = getUsers();
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid login credentials');
      }
      
      // Create session with expiration
      const { password: _, ...safeUser } = user;
      const session = {
        access_token: uuidv4(),
        expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
        user: safeUser
      };
      
      // Save session
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      return {
        user: safeUser,
        session
      };
    } catch (error: any) {
      const { toast } = useToast();
      toast({
        title: 'Login failed',
        description: error.message || 'Failed to sign in',
        variant: 'destructive'
      });
      return Promise.reject(error);
    }
  },
  
  signOut: async (): Promise<void> => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    return Promise.resolve();
  },
  
  resetPassword: async (email: string): Promise<void> => {
    try {
      const users = getUsers();
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        // Don't reveal if email exists or not
        return Promise.resolve();
      }
      
      // In a real app, this would send an email with reset link
      const { toast } = useToast();
      toast({
        title: 'Password reset link sent',
        description: `If an account exists for ${email}, you will receive a password reset link.`
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in reset password:', error);
      return Promise.resolve(); // Still resolve to not reveal if email exists
    }
  },
  
  updateUser: async (userId: string, data: UpdateUserData): Promise<User> => {
    try {
      const users = getUsers();
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user data
      const updatedUser = {
        ...users[userIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      users[userIndex] = updatedUser;
      saveUsers(users);
      
      // Update current user if it's the same
      const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
      
      const { password: _, ...safeUser } = updatedUser;
      return safeUser;
    } catch (error: any) {
      const { toast } = useToast();
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update user data',
        variant: 'destructive'
      });
      return Promise.reject(error);
    }
  },
  
  getSession: async (): Promise<any> => {
    const session = localStorage.getItem(SESSION_KEY);
    
    if (!session) {
      return { data: { session: null } };
    }
    
    const parsedSession = JSON.parse(session);
    
    // Check if session has expired
    if (parsedSession.expires_at && Date.now() > parsedSession.expires_at) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_KEY);
      return { data: { session: null } };
    }
    
    return {
      data: {
        session: parsedSession
      }
    };
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // This is a simplified version that doesn't handle real-time changes
    const checkSession = () => {
      const session = localStorage.getItem(SESSION_KEY);
      
      if (session) {
        const parsedSession = JSON.parse(session);
        if (parsedSession.expires_at && Date.now() > parsedSession.expires_at) {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(SESSION_KEY);
          callback('SIGNED_OUT', null);
        } else {
          callback('SIGNED_IN', parsedSession);
        }
      } else {
        callback('SIGNED_OUT', null);
      }
    };
    
    // Check immediately
    checkSession();
    
    // Check periodically
    const interval = setInterval(checkSession, 1000 * 60); // Check every minute
    
    return {
      subscription: {
        unsubscribe: () => clearInterval(interval)
      }
    };
  }
};
