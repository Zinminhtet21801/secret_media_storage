import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, Min, MinLength } from 'class-validator';

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
// min 5 characters, 1 upper case letter, 1 lower case letter, 1 numeric digit.

export class UserCreateDTO {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    nullable: false,
    type: String,
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'abcde@gmail.com',
    nullable: false,
    type: String,
    minLength: 5,
  })
  @IsNotEmpty()
  @IsEmail()
  @MinLength(5)
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Abcde123',
    nullable: false,
    type: String,
    minLength: 5,
    additionalProperties: {
      title: 'Password Rules',
      description:
        'Password must be at least 5 characters long, contain at least one upper case letter, one lower case letter, and one numeric digit.',
    },
  })
  @IsNotEmpty()
  @MinLength(5)
  @Matches(passwordRules)
  password: string;
}
