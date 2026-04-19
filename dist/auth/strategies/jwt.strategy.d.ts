import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
interface JwtPayload {
    sub: string;
    username: string;
    role: UserRole;
    status: UserStatus;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): AuthenticatedUser;
}
export {};
