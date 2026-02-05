import { Role, Permission } from '../../constants/roles';
export interface IUser {
    email: string;
    password: string;
    role: Role;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
//# sourceMappingURL=auth.model.d.ts.map