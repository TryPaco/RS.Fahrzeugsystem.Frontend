export type UserListItem = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  isActive: boolean;
  roles: string[];
};

export type RoleItem = {
  name: string;
  description: string;
  permissions: string[];
};

export type CreateUserRequest = {
  username: string;
  displayName: string;
  email: string;
  password: string;
  isActive: boolean;
  roles: string[];
};

export type UpdateUserRequest = {
  displayName: string;
  email: string;
  isActive: boolean;
  roles: string[];
};
