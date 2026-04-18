import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

export interface AuthenticatedUser {
  sub: string;
  username: string;
  role: UserRole;
  status: UserStatus;
}