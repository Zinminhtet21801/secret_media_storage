import { Media } from 'src/media/media.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Media, (media: Media) => media.name, { cascade: true })
  media: Media[];
}
