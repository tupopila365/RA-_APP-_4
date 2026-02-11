export interface RegisterDTO {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  verificationMethod?: 'email' | 'phone';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}























