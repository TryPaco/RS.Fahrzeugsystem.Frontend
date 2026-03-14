import { http } from './http';
import type { Customer, CreateCustomerRequest } from '../types/customer';

export async function getCustomers(includeArchived = false) {
  const response = await http.get<Customer[]>('/customers', {
    params: { includeArchived },
  });
  return response.data;
}

export async function createCustomer(payload: CreateCustomerRequest) {
  const response = await http.post<Customer>('/customers', payload);
  return response.data;
}
