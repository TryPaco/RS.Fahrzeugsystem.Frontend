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
