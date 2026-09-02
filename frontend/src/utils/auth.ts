import { UserProfile } from '../types';
import { API_BASE } from './api';

const USER_STORAGE_KEY = '2048_active_user';
const USERS_LIST_KEY = '2048_registered_users';

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

export async function loginUserApi(email: string, password: string):Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Invalid credentials' };
    }

    setStoredUser(data.user);
    return { success: true, user: data.user };
  } catch (err) {
    // Client-side fallback if server fails
    console.warn('Network auth failed, checking client store:', err);
    return loginUserLocal(email, password);
  }
}

export async function signupUserApi(username: string, email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to create account' };
    }

    setStoredUser(data.user);
    return { success: true, user: data.user };
  } catch (err) {
    // Client-side fallback
    console.warn('Network signup failed, fallback to client:', err);
    return signupUserLocal(username, email, password);
  }
}

// Local fallback implementations
function loginUserLocal(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    const users = raw ? JSON.parse(raw) : [];
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }
    const { password: _, ...userObj } = found;
    setStoredUser(userObj);
    return { success: true, user: userObj };
  } catch {
    return { success: false, error: 'Authentication error' };
  }
}

function signupUserLocal(username: string, email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    const users = raw ? JSON.parse(raw) : [];
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }
    const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    const newUser = {
      id: 'usr_' + Date.now(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date().toISOString(),
      highScore: 0,
      gamesPlayed: 0,
    };
    users.push(newUser);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    const { password: _, ...userObj } = newUser;
    setStoredUser(userObj);
    return { success: true, user: userObj };
  } catch {
    return { success: false, error: 'Registration error' };
  }
}

export function logoutUser(): void {
  setStoredUser(null);
}
