import { Expose } from 'class-transformer';

export class UserDTO {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;
}
