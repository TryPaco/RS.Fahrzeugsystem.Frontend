import { http } from './http';
import type { Label } from '../types/label';

export async function getLabels() {
  const response = await http.get<Label[]>('/labels');
  return response.data;
}
