import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일을 입력해주세요.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: '비밀번호는 6자 이상이어야 해요.' })
  password!: string;
}

export class SignupDto extends LoginDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nickname?: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}
