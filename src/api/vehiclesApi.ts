import { http } from './http';
import type { CreateVehicleRequest, Vehicle } from '../types/vehicle';

export async function getVehicles(includeArchived = false, q = '') {
  const response = await http.get<Vehicle[]>('/vehicles', {
    params: { includeArchived, q },
  });
  return response.data;
}

export async function createVehicle(payload: CreateVehicleRequest) {
  const response = await http.post<Vehicle>('/vehicles', payload);
  return response.data;
}
