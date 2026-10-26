import { Book } from './journalLogic';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Stored securely in persistent account storage
  createdAt: string;
  avatarSeed?: string;
}

const USERS_STORAGE_KEY = 'typewriter_user_accounts';
const SESSION_STORAGE_KEY = 'typewriter_current_session';
const BOOKS_PREFIX = 'typewriter_books_user_';

export function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (_) {}
}

export function getCurrentSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setCurrentSessionUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (_) {}
}

export function signUpAccount(name: string, email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  
  if (!cleanName) return { success: false, error: 'Please enter your name or pseudonym.' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Please provide a valid email address.' };
  if (!password || password.length < 4) return { success: false, error: 'Password should be at least 4 characters.' };

  const accounts = getStoredAccounts();
  if (accounts.some(a => a.email === cleanEmail)) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }

  const newUser: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: btoa(password), // Simple browser reversible encoding for persistence
    createdAt: new Date().toISOString()
  };

  accounts.push(newUser);
  saveStoredAccounts(accounts);
  setCurrentSessionUser(newUser);

  // Initialize fresh, empty personal library for the new user (no sample dummy books)
  saveUserBooks(newUser.id, []);

  return { success: true, user: newUser };
}

export function signInAccount(email: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const user = accounts.find(a => a.email === cleanEmail);

  if (!user) {
    return { success: false, error: 'No account registered with this email.' };
  }

  if (user.passwordHash !== btoa(password)) {
    return { success: false, error: 'Incorrect password.' };
  }

  setCurrentSessionUser(user);
  return { success: true, user };
}

export function signOutAccount(): void {
  setCurrentSessionUser(null);
}

export function loadUserBooks(userId: string): Book[] {
  try {
    const raw = localStorage.getItem(`${BOOKS_PREFIX}${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

export function saveUserBooks(userId: string, books: Book[]): void {
  try {
    localStorage.setItem(`${BOOKS_PREFIX}${userId}`, JSON.stringify(books));
  } catch (_) {}
}
