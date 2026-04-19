import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateManagedUserDto {
  @IsString()
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(50)
  username!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  zoneId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  zoneName?: string;
}