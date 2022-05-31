import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class UserCreateDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Min(1)
  email: string;

  @IsNotEmpty()
  @Min(5)
  password: string;
}
