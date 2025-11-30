import { IUser } from './auth.model';
interface CreateUserDto {
    email: string;
    password: string;
    role: string;
    permissions: string[];
}
interface UpdateUserDto {
    email?: string;
    password?: string;
    role?: string;
    permissions?: string[];
}
interface ListUsersQuery {
    page?: number;
    limit?: number;
    role?: string;
}
export declare class UsersService {
    /**
     * Create a new admin user
     */
    createUser(data: CreateUserDto): Promise<IUser>;
    /**
     * List all admin users with pagination
     */
    listUsers(query: ListUsersQuery): Promise<{
        users: IUser[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get a single user by ID
     */
    getUserById(userId: string): Promise<IUser>;
    /**
     * Update user details
     */
    updateUser(userId: string, data: UpdateUserDto): Promise<IUser>;
    /**
     * Delete a user
     */
    deleteUser(userId: string, requestingUserId: string): Promise<void>;
    /**
     * Assign permissions to a user
     */
    assignPermissions(userId: string, permissions: string[]): Promise<IUser>;
}
export declare const usersService: UsersService;
export {};
//# sourceMappingURL=users.service.d.ts.map