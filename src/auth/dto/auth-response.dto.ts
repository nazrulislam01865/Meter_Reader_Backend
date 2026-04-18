export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;

  user!: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
    zoneName: string | null;
    passwordResetRequired: boolean;
  };
}