import apiClient from './api';
import { IUser, Permission, Role } from '../types';

export interface UserFormData {
  email: string;
  password?: string;
  role: Role;
  permissions: Permission[];
}

export interface UserListResponse {
  success: boolean;
  data: {
    users: IUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: IUser;
}

/**
 * Fetch paginated users list
 */
export const getUsersList = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}): Promise<UserListResponse> => {
  const response = await apiClient.get<UserListResponse>('/users', { params });
  return response.data;
};

/**
 * Get single user by ID
 */
export const getUserById = async (id: string): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>(`/users/${id}`);
  return response.data;
};

/**
 * Create new admin user
 */
export const createUser = async (data: UserFormData): Promise<UserResponse> => {
  const response = await apiClient.post<UserResponse>('/users', data);
  return response.data;
};

/**
 * Update existing user
 */
export const updateUser = async (id: string, data: Partial<UserFormData>): Promise<UserResponse> => {
  const response = await apiClient.put<UserResponse>(`/users/${id}`, data);
  return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/users/${id}`);
  return response.data;
};
