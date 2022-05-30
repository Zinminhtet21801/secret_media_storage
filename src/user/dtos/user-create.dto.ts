import { IsNotEmpty } from 'class-validator';

export class UserCreateDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
