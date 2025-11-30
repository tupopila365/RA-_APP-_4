import mongoose, { Document } from 'mongoose';
import { Role, Permission } from '../../constants/roles';
export interface IUser extends Document {
    email: string;
    password: string;
    role: Role;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=auth.model.d.ts.map