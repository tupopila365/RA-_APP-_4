import mongoose, { Document } from 'mongoose';
export interface IAppUser extends Document {
    email: string;
    password: string;
    fullName?: string;
    phoneNumber?: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationTokenExpiry?: Date;
    emailVerifiedAt?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const AppUser: mongoose.Model<IAppUser, {}, {}, {}, mongoose.Document<unknown, {}, IAppUser, {}, {}> & IAppUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=app-users.model.d.ts.map