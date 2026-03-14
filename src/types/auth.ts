export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  expiresAtUtc: string;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
};

export type MeResponse = {
  userId: string;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
};