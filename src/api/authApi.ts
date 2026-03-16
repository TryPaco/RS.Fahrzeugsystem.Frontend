import { http } from './http';
import type { LoginResponse, MeResponse } from '../types/auth';

export async function login(username: string, password: string) {
  const response = await http.post<LoginResponse>('/auth/login', { username, password });
  return response.data;
}

export async function getMe() {
  const response = await http.get<MeResponse>('/auth/me');
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await http.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
}

export async function forgotPassword(email: string) {
  const response = await http.post<{ message: string }>('/auth/forgot-password', {
    email,
  });
  return response.data;
}

export async function resetPassword(token: string, newPassword: string) {
  await http.post('/auth/reset-password', {
    token,
    newPassword,
  });
}
