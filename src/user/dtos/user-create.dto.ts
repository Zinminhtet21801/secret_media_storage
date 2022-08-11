import { IsEmail, IsNotEmpty, Matches, Min, MinLength } from 'class-validator';

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
// min 5 characters, 1 upper case letter, 1 lower case letter, 1 numeric digit.

export class UserCreateDTO {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(5)
  email: string;

  @IsNotEmpty()
  @MinLength(5)
  @Matches(passwordRules)
  password: string;
}
