import { IsString, IsNotEmpty, IsEmail, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsIn(['USER', 'ADMIN'])
  role: string;
}
