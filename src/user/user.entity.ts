import { Media } from '../media/media.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Media, (media: Media) => media.name, { cascade: true })
  media: Media[];
}
