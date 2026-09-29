import { User, VacationRequest } from '../types';
import { getStoredUsers, saveUsers, getStoredRequests, saveRequests } from './storage';

export async function fetchUsersFromApi(): Promise<User[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveUsers(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('API users fetch failed, using stored local cache:', err);
  }
  return getStoredUsers();
}

export async function createUserInApi(newUser: User): Promise<User> {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (err) {
    console.warn('API user creation failed, saved to cache:', err);
  }
  return newUser;
}

export async function fetchRequestsFromApi(): Promise<VacationRequest[]> {
  try {
    const res = await fetch('/api/requests');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveRequests(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('API requests fetch failed, using stored local cache:', err);
  }
  return getStoredRequests();
}

export async function createRequestInApi(newReq: VacationRequest): Promise<VacationRequest> {
  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (err) {
    console.warn('API request creation failed, saved to cache:', err);
  }
  return newReq;
}

export async function updateRequestInApi(id: string, updates: Partial<VacationRequest>): Promise<void> {
  try {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.warn('API request update failed:', err);
  }
}

export async function deleteRequestInApi(id: string): Promise<void> {
  try {
    await fetch(`/api/requests/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('API request delete failed:', err);
  }
}
