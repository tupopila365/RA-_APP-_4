import { Role, Permission } from '../../constants/roles';
import type { Document as DocumentEntity } from '../documents/documents.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    role: Role;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
    documents: DocumentEntity[];
    hashPassword(): Promise<void>;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
//# sourceMappingURL=auth.entity.d.ts.map