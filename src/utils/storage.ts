import { User, VacationRequest } from '../types';
import { INITIAL_USERS, INITIAL_REQUESTS } from '../data/mockData';

const USERS_STORAGE_KEY = 'muniz_metalurgica_users_v1';
const REQUESTS_STORAGE_KEY = 'muniz_metalurgica_requests_v1';
const SESSION_STORAGE_KEY = 'muniz_metalurgica_session_v1';

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading users from localStorage', e);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

export function getStoredRequests(): VacationRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading requests from localStorage', e);
    return INITIAL_REQUESTS;
  }
}

export function saveRequests(requests: VacationRequest[]): void {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving requests to localStorage', e);
  }
}

export function getStoredSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(user: User | null): void {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function resetToDefaults(): { users: User[]; requests: VacationRequest[] } {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
  return { users: INITIAL_USERS, requests: INITIAL_REQUESTS };
}
