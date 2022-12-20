import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDTO {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiProperty()
  @Expose()
  email: string;
}
