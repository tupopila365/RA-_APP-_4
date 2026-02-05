import { User } from './auth.entity';
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
    createUser(data: CreateUserDto): Promise<User>;
    /**
     * List all admin users with pagination
     */
    listUsers(query: ListUsersQuery): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get a single user by ID
     */
    getUserById(userId: string): Promise<User>;
    /**
     * Update user details
     */
    updateUser(userId: string, data: UpdateUserDto): Promise<User>;
    /**
     * Delete a user
     */
    deleteUser(userId: string, requestingUserId: string): Promise<void>;
    /**
     * Assign permissions to a user
     */
    assignPermissions(userId: string, permissions: string[]): Promise<User>;
}
export declare const usersService: UsersService;
export {};
//# sourceMappingURL=users.service.d.ts.map