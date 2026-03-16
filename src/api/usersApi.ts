import { http } from "./http";
import type {
  CreateUserRequest,
  RoleItem,
  UpdateUserRequest,
  UserListItem,
} from "../types/user";

export async function getUsers() {
  const response = await http.get<UserListItem[]>("/users");
  return response.data;
}

export async function getUserRoles() {
  const response = await http.get<RoleItem[]>("/users/roles");
  return response.data;
}

export async function createUser(payload: CreateUserRequest) {
  await http.post("/users", payload);
}

export async function updateUser(id: string, payload: UpdateUserRequest) {
  await http.put(`/users/${id}`, payload);
}

export async function deleteUser(id: string) {
  await http.delete(`/users/${id}`);
}
